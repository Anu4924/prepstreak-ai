import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  targetExamId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredProfile {
  id: string; // same as userId
  fullName: string;
  email: string;
  avatarUrl: string;
  selectedExam: string;
  selectedSubject?: string;
  selectedTopics?: string[];
  currentStreak: number;
  longestStreak: number;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  totalTestsCompleted: number;
  overallAccuracy: number;
  dailyQuestionGoal: number;
  preferredDifficulty: "Easy" | "Medium" | "Hard" | "Adaptive";
  studyTimeMinutes: number;
  onboardingCompleted: boolean;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface UserPracticeRecord {
  id: string;
  examId: string;
  subjectId: string;
  topicId: string;
  topicName: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSeconds: number;
  date: string;
}

export interface PendingRegistration {
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  targetExamId?: string;
  otpHash: string;
  otpSalt: string;
  expiresAt: string;
  attempts: number;
  resendCooldownUntil: string;
  createdAt: string;
}

export interface PasswordResetRecord {
  email: string;
  resetCodeHash: string;
  salt: string;
  expiresAt: string;
  attempts: number;
  createdAt: string;
}

interface DatabaseSchema {
  users: Record<string, StoredUser>;
  usersByEmail: Record<string, string>; // lowercase email -> userId
  sessions: Record<string, StoredSession>;
  profiles: Record<string, StoredProfile>; // userId -> StoredProfile
  practiceHistory: Record<string, UserPracticeRecord[]>; // userId -> records
  pendingRegistrations?: Record<string, PendingRegistration>; // lowercase email -> pending
  passwordResets?: Record<string, PasswordResetRecord>; // lowercase email -> reset
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "prepstreak_db.json");

let memoryDb: DatabaseSchema | null = null;

function ensureDb(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      memoryDb = JSON.parse(raw);
      if (memoryDb) {
        if (!memoryDb.users) memoryDb.users = {};
        if (!memoryDb.usersByEmail) memoryDb.usersByEmail = {};
        if (!memoryDb.sessions) memoryDb.sessions = {};
        if (!memoryDb.profiles) memoryDb.profiles = {};
        if (!memoryDb.practiceHistory) memoryDb.practiceHistory = {};
        if (!memoryDb.pendingRegistrations) memoryDb.pendingRegistrations = {};
        if (!memoryDb.passwordResets) memoryDb.passwordResets = {};
        return memoryDb;
      }
    }
  } catch (err) {
    console.error("Failed to read database file:", err);
  }

  // Initialize fresh empty schema
  memoryDb = {
    users: {},
    usersByEmail: {},
    sessions: {},
    profiles: {},
    practiceHistory: {},
    pendingRegistrations: {},
    passwordResets: {},
  };

  saveDb(memoryDb);
  return memoryDb;
}

function saveDb(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const jsonString = JSON.stringify(db, null, 2);
    try {
      const tempFile = path.join(
        DB_DIR,
        `temp_db_${Date.now()}_${Math.random().toString(36).slice(2)}.json`
      );
      fs.writeFileSync(tempFile, jsonString, "utf-8");
      try {
        fs.renameSync(tempFile, DB_FILE);
      } catch {
        // Fallback for Windows/OneDrive sync locks
        fs.copyFileSync(tempFile, DB_FILE);
        try {
          fs.unlinkSync(tempFile);
        } catch {}
      }
    } catch {
      fs.writeFileSync(DB_FILE, jsonString, "utf-8");
    }
  } catch (err) {
    console.error("Failed to save database file:", err);
  }
}

/**
 * Bcrypt password hashing
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string
): boolean {
  try {
    // Bcrypt format check ($2a$ or $2b$)
    if (expectedHash.startsWith("$2")) {
      return bcrypt.compareSync(password, expectedHash);
    }
    // Fallback for PBKDF2
    const pbkdf2Hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");
    const hashBuffer = Buffer.from(pbkdf2Hash, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    if (hashBuffer.length !== expectedBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(hashBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Validates password rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password || password.length < 8) {
    return {
      valid: false,
      error: "Password must be at least 8 characters long.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter.",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one lowercase letter.",
    };
  }
  if (!/\d/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one number.",
    };
  }
  return { valid: true };
}

/**
 * Cryptographic OTP / Reset Code Hashing
 */
export function hashOtp(code: string, salt: string): string {
  return crypto.createHash("sha256").update(`${code}:${salt}`).digest("hex");
}

export function verifyOtp(
  enteredCode: string,
  salt: string,
  expectedHash: string
): boolean {
  try {
    const computed = hashOtp(enteredCode.trim(), salt);
    const bufA = Buffer.from(computed, "hex");
    const bufB = Buffer.from(expectedHash, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export const AuthStore = {
  findUserByEmail(email: string): StoredUser | null {
    const db = ensureDb();
    const normalizedEmail = email.trim().toLowerCase();
    const userId = db.usersByEmail[normalizedEmail];
    if (!userId) return null;
    return db.users[userId] || null;
  },

  findUserById(userId: string): StoredUser | null {
    const db = ensureDb();
    return db.users[userId] || null;
  },

  getUserById(userId: string): StoredUser | null {
    const db = ensureDb();
    return db.users[userId] || null;
  },

  authenticate(email: string, password: string): StoredUser | null {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    if (!verifyPassword(password, user.salt, user.passwordHash)) {
      return null;
    }
    return user;
  },

  /**
   * Creates a verified user account.
   * Brand new user starts strictly at ZERO.
   */
  createUser(
    fullName: string,
    email: string,
    passwordOrHash: string,
    targetExamId?: string,
    preHashed: boolean = false,
    customUserId?: string
  ): { user: StoredUser; profile: StoredProfile } {
    const db = ensureDb();
    const normalizedEmail = email.trim().toLowerCase();

    if (db.usersByEmail[normalizedEmail]) {
      throw new Error("An account with this email address already exists.");
    }

    const userId = customUserId || ("usr_" + crypto.randomBytes(12).toString("hex"));
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = preHashed
      ? passwordOrHash
      : hashPassword(passwordOrHash);
    const now = new Date().toISOString();

    const user: StoredUser = {
      id: userId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      salt,
      targetExamId: targetExamId || "",
      createdAt: now,
      updatedAt: now,
    };

    // Brand new user starts strictly at ZERO telemetry
    const hasInitialExam = Boolean(targetExamId && targetExamId.trim() !== "" && targetExamId !== "None");
    const profile: StoredProfile = {
      id: userId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      avatarUrl: "forest",
      selectedExam: targetExamId || "",
      currentStreak: 0,
      longestStreak: 0,
      totalQuestionsAttempted: 0,
      totalQuestionsCorrect: 0,
      totalTestsCompleted: 0,
      overallAccuracy: 0,
      studyTimeMinutes: 0,
      onboardingCompleted: hasInitialExam,
      progress: 0,
      dailyQuestionGoal: 20,
      preferredDifficulty: "Adaptive",
      createdAt: now,
      updatedAt: now,
    };

    db.users[userId] = user;
    db.usersByEmail[normalizedEmail] = userId;
    db.profiles[userId] = profile;
    db.practiceHistory[userId] = [];

    saveDb(db);
    return { user, profile };
  },

  updateUserPassword(userId: string, newPassword: string): boolean {
    const db = ensureDb();
    const user = db.users[userId];
    if (!user) return false;

    user.passwordHash = hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();

    saveDb(db);
    return true;
  },

  /**
   * Syncs / re-keys an existing user from a legacy local ID to their Supabase Auth UUID.
   * Preserves all profile statistics, streak, and practice history.
   */
  syncUserWithSupabaseId(email: string, supabaseId: string): StoredUser | null {
    const db = ensureDb();
    const normalizedEmail = email.trim().toLowerCase();
    const oldUserId = db.usersByEmail[normalizedEmail];

    if (!oldUserId) {
      return db.users[supabaseId] || null;
    }

    if (oldUserId === supabaseId) {
      return db.users[supabaseId] || null;
    }

    // Re-key from oldUserId to supabaseId
    const oldUser = db.users[oldUserId];
    if (oldUser) {
      const updatedUser: StoredUser = {
        ...oldUser,
        id: supabaseId,
        updatedAt: new Date().toISOString(),
      };
      db.users[supabaseId] = updatedUser;
      delete db.users[oldUserId];
    }
    db.usersByEmail[normalizedEmail] = supabaseId;

    if (db.profiles[oldUserId]) {
      const oldProf = db.profiles[oldUserId];
      const hasExam = Boolean(oldProf.selectedExam && oldProf.selectedExam !== "None");
      db.profiles[supabaseId] = {
        ...oldProf,
        id: supabaseId,
        onboardingCompleted: oldProf.onboardingCompleted || hasExam,
        updatedAt: new Date().toISOString(),
      };
      delete db.profiles[oldUserId];
    }

    if (db.practiceHistory[oldUserId]) {
      db.practiceHistory[supabaseId] = db.practiceHistory[oldUserId];
      delete db.practiceHistory[oldUserId];
    }

    // Migrate any active sessions
    for (const token of Object.keys(db.sessions)) {
      if (db.sessions[token]?.userId === oldUserId) {
        db.sessions[token].userId = supabaseId;
      }
    }

    saveDb(db);
    return db.users[supabaseId] || null;
  },

  getProfileByUserId(userId: string): StoredProfile | null {
    const db = ensureDb();
    return db.profiles[userId] || null;
  },

  updateUserProfile(
    userId: string,
    updates: Partial<StoredProfile>
  ): StoredProfile {
    const db = ensureDb();
    let profile = db.profiles[userId];

    if (!profile) {
      let user = db.users[userId];
      if (!user && updates.email) {
        const normEmail = updates.email.trim().toLowerCase();
        const existingId = db.usersByEmail[normEmail];
        if (existingId && existingId !== userId) {
          this.syncUserWithSupabaseId(normEmail, userId);
          user = db.users[userId];
        }
      }

      const now = new Date().toISOString();
      const fallbackEmail = updates.email || (user ? user.email : "");
      const fallbackName = updates.fullName?.trim() || (user ? user.fullName : "Student");
      const fallbackExam = updates.selectedExam || (user ? user.targetExamId : "");

      profile = {
        id: userId,
        fullName: fallbackName,
        email: fallbackEmail,
        avatarUrl: updates.avatarUrl || "forest",
        selectedExam: fallbackExam || "",
        currentStreak: updates.currentStreak || 0,
        longestStreak: updates.longestStreak || 0,
        totalQuestionsAttempted: updates.totalQuestionsAttempted || 0,
        totalQuestionsCorrect: updates.totalQuestionsCorrect || 0,
        totalTestsCompleted: updates.totalTestsCompleted || 0,
        overallAccuracy: updates.overallAccuracy || 0,
        studyTimeMinutes: updates.studyTimeMinutes || 0,
        onboardingCompleted: updates.onboardingCompleted ?? Boolean(fallbackExam),
        dailyQuestionGoal: updates.dailyQuestionGoal || 20,
        preferredDifficulty: updates.preferredDifficulty || "Adaptive",
        createdAt: user ? user.createdAt : now,
        updatedAt: now,
      };
      db.profiles[userId] = profile;

      if (!db.users[userId]) {
        db.users[userId] = {
          id: userId,
          fullName: fallbackName,
          email: fallbackEmail,
          passwordHash: "",
          salt: "",
          targetExamId: fallbackExam || "",
          createdAt: now,
          updatedAt: now,
        };
        if (fallbackEmail) {
          db.usersByEmail[fallbackEmail.toLowerCase()] = userId;
        }
      }
    }

    if (updates.fullName !== undefined) {
      profile.fullName = updates.fullName.trim();
      if (db.users[userId]) {
        db.users[userId].fullName = updates.fullName.trim();
      }
    }
    if (updates.selectedExam !== undefined) {
      profile.selectedExam = updates.selectedExam;
      if (db.users[userId]) {
        db.users[userId].targetExamId = updates.selectedExam;
      }
      if (updates.selectedExam && updates.selectedExam !== "None" && updates.onboardingCompleted === undefined) {
        profile.onboardingCompleted = true;
      }
    }
    if (updates.selectedSubject !== undefined)
      profile.selectedSubject = updates.selectedSubject;
    if (updates.selectedTopics !== undefined)
      profile.selectedTopics = updates.selectedTopics;
    if (updates.avatarUrl !== undefined) profile.avatarUrl = updates.avatarUrl;
    if (updates.dailyQuestionGoal !== undefined)
      profile.dailyQuestionGoal = updates.dailyQuestionGoal;
    if (updates.preferredDifficulty !== undefined)
      profile.preferredDifficulty = updates.preferredDifficulty;
    if (updates.currentStreak !== undefined)
      profile.currentStreak = updates.currentStreak;
    if (updates.longestStreak !== undefined)
      profile.longestStreak = updates.longestStreak;
    if (updates.totalQuestionsAttempted !== undefined)
      profile.totalQuestionsAttempted = updates.totalQuestionsAttempted;
    if (updates.totalQuestionsCorrect !== undefined)
      profile.totalQuestionsCorrect = updates.totalQuestionsCorrect;
    if (updates.totalTestsCompleted !== undefined)
      profile.totalTestsCompleted = updates.totalTestsCompleted;
    if (updates.overallAccuracy !== undefined)
      profile.overallAccuracy = updates.overallAccuracy;
    if (updates.studyTimeMinutes !== undefined)
      profile.studyTimeMinutes = updates.studyTimeMinutes;
    if (updates.onboardingCompleted !== undefined)
      profile.onboardingCompleted = updates.onboardingCompleted;
    if (updates.progress !== undefined)
      profile.progress = updates.progress;

    profile.updatedAt = new Date().toISOString();
    saveDb(db);
    return profile;
  },

  deleteUser(userId: string): boolean {
    const db = ensureDb();
    const user = db.users[userId];
    if (!user) return false;

    const email = user.email;
    delete db.users[userId];
    delete db.usersByEmail[email];
    delete db.profiles[userId];
    delete db.practiceHistory[userId];

    // Delete all user sessions
    for (const token of Object.keys(db.sessions)) {
      if (db.sessions[token].userId === userId) {
        delete db.sessions[token];
      }
    }

    saveDb(db);
    return true;
  },

  createSession(
    token: string,
    userId: string,
    expSeconds: number
  ): StoredSession {
    const db = ensureDb();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expSeconds * 1000).toISOString();

    const session: StoredSession = {
      token,
      userId,
      createdAt: now.toISOString(),
      expiresAt,
    };

    db.sessions[token] = session;
    saveDb(db);
    return session;
  },

  getSession(token: string): StoredSession | null {
    const db = ensureDb();
    const session = db.sessions[token];
    if (!session) return null;

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      delete db.sessions[token];
      saveDb(db);
      return null;
    }

    return session;
  },

  deleteSession(token: string): void {
    const db = ensureDb();
    if (db.sessions[token]) {
      delete db.sessions[token];
      saveDb(db);
    }
  },

  clearUserSessions(userId: string): void {
    const db = ensureDb();
    let changed = false;
    for (const [token, session] of Object.entries(db.sessions)) {
      if (session.userId === userId) {
        delete db.sessions[token];
        changed = true;
      }
    }
    if (changed) saveDb(db);
  },

  getUserPracticeHistory(userId: string): UserPracticeRecord[] {
    const db = ensureDb();
    return db.practiceHistory[userId] || [];
  },

  recordUserPractice(
    userId: string,
    record: Omit<UserPracticeRecord, "id" | "date">
  ): { profile: StoredProfile; record: UserPracticeRecord } {
    const db = ensureDb();
    if (!db.practiceHistory[userId]) {
      db.practiceHistory[userId] = [];
    }

    const newRecord: UserPracticeRecord = {
      ...record,
      id: "rec_" + crypto.randomBytes(8).toString("hex"),
      date: new Date().toISOString(),
    };

    db.practiceHistory[userId].unshift(newRecord);

    // Update user's aggregate stats
    const profile = db.profiles[userId] || this.updateUserProfile(userId, {})!;
    profile.totalQuestionsAttempted += record.totalQuestions;
    profile.totalQuestionsCorrect += record.score;
    profile.overallAccuracy = Math.round(
      (profile.totalQuestionsCorrect /
        Math.max(profile.totalQuestionsAttempted, 1)) *
        100
    );
    profile.studyTimeMinutes += Math.round(record.timeSpentSeconds / 60);

    // If this record is a mock test, increment completed tests count
    if (record.topicId === "mock-test" || record.examId === "mock-test") {
      profile.totalTestsCompleted = (profile.totalTestsCompleted || 0) + 1;
    }

    // If this is the user's first practice today, increment streak to 1
    if (profile.currentStreak === 0) {
      profile.currentStreak = 1;
      profile.longestStreak = Math.max(profile.longestStreak, 1);
    }

    profile.updatedAt = new Date().toISOString();
    saveDb(db);
    return { profile, record: newRecord };
  },

  // ---------------------------------------------------------------------------
  // Pending Registrations (Email OTP Flow)
  // TODO: Email verification / OTP can be re-enabled here when a verified domain
  // and email delivery provider are configured. Registration currently creates
  // accounts directly without OTP or verification emails.
  // ---------------------------------------------------------------------------
  savePendingRegistration(pending: PendingRegistration): void {
    const db = ensureDb();
    if (!db.pendingRegistrations) db.pendingRegistrations = {};
    const norm = pending.email.trim().toLowerCase();
    db.pendingRegistrations[norm] = pending;
    saveDb(db);
  },

  getPendingRegistration(email: string): PendingRegistration | null {
    const db = ensureDb();
    if (!db.pendingRegistrations) return null;
    const norm = email.trim().toLowerCase();
    return db.pendingRegistrations[norm] || null;
  },

  incrementPendingAttempts(email: string): number {
    const db = ensureDb();
    if (!db.pendingRegistrations) return 0;
    const norm = email.trim().toLowerCase();
    const record = db.pendingRegistrations[norm];
    if (!record) return 0;
    record.attempts = (record.attempts || 0) + 1;
    saveDb(db);
    return record.attempts;
  },

  deletePendingRegistration(email: string): void {
    const db = ensureDb();
    if (!db.pendingRegistrations) return;
    const norm = email.trim().toLowerCase();
    if (db.pendingRegistrations[norm]) {
      delete db.pendingRegistrations[norm];
      saveDb(db);
    }
  },

  // ---------------------------------------------------------------------------
  // Password Reset Records
  // ---------------------------------------------------------------------------
  savePasswordReset(record: PasswordResetRecord): void {
    const db = ensureDb();
    if (!db.passwordResets) db.passwordResets = {};
    const norm = record.email.trim().toLowerCase();
    db.passwordResets[norm] = record;
    saveDb(db);
  },

  getPasswordReset(email: string): PasswordResetRecord | null {
    const db = ensureDb();
    if (!db.passwordResets) return null;
    const norm = email.trim().toLowerCase();
    return db.passwordResets[norm] || null;
  },

  incrementPasswordResetAttempts(email: string): number {
    const db = ensureDb();
    if (!db.passwordResets) return 0;
    const norm = email.trim().toLowerCase();
    const record = db.passwordResets[norm];
    if (!record) return 0;
    record.attempts = (record.attempts || 0) + 1;
    saveDb(db);
    return record.attempts;
  },

  deletePasswordReset(email: string): void {
    const db = ensureDb();
    if (!db.passwordResets) return;
    const norm = email.trim().toLowerCase();
    if (db.passwordResets[norm]) {
      delete db.passwordResets[norm];
      saveDb(db);
    }
  },

  /**
   * Reset helper for test suites or clean developer states
   */
  clearAllUsers(): void {
    memoryDb = {
      users: {},
      usersByEmail: {},
      sessions: {},
      profiles: {},
      practiceHistory: {},
      pendingRegistrations: {},
      passwordResets: {},
    };
    saveDb(memoryDb);
  },
};
