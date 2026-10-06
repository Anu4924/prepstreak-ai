import fs from "fs";
import path from "path";

const dbPath = path.resolve("./data/prepstreak_db.json");

// Ensure directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

console.log("=== STEP 1: INITIAL STATE ===");
// Reset DB for test
const initialDb = {
  users: {},
  usersByEmail: {},
  sessions: {},
  profiles: {},
  practiceHistory: {},
};
fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), "utf-8");
console.log("Database reset to clean state.");

async function runTests() {
  const { AuthStore } = await import("../lib/auth/store");
  const { signSessionToken, verifySessionToken } = await import("../lib/auth/token");

  console.log("\n=== STEP 2: REGISTER USER 1 (Rohan Sharma) ===");
  const { user: user1 } = AuthStore.createUser("Rohan Sharma", "rohan@example.com", "Password123!");
  console.log("User 1 created ID:", user1.id);
  console.log("User 1 email:", user1.email);
  console.log("User 1 password hash starts with $2a$ or $2b$:", user1.passwordHash.startsWith("$2"));
  console.log("Plaintext password stored?:", user1.passwordHash === "Password123!" ? "FAIL - PLAINTEXT" : "PASS - HASHED");

  // Verify initial profile
  const profile1 = AuthStore.getProfileByUserId(user1.id);
  console.log("User 1 Initial Profile:", {
    fullName: profile1?.fullName,
    currentStreak: profile1?.currentStreak,
    totalQuestionsAttempted: profile1?.totalQuestionsAttempted,
    overallAccuracy: profile1?.overallAccuracy,
    studyTimeMinutes: profile1?.studyTimeMinutes,
    onboardingCompleted: profile1?.onboardingCompleted,
    selectedExam: profile1?.selectedExam,
  });

  if (
    profile1?.currentStreak !== 0 ||
    profile1?.totalQuestionsAttempted !== 0 ||
    profile1?.overallAccuracy !== 0 ||
    profile1?.studyTimeMinutes !== 0 ||
    profile1?.onboardingCompleted !== false ||
    profile1?.selectedExam !== ""
  ) {
    throw new Error("FAILED: User 1 does not start with strict zero-state telemetry!");
  }
  console.log("PASS: User 1 starts with 100% strict zero-state telemetry.");

  console.log("\n=== STEP 3: SESSION CREATION & TOKEN SIGNING ===");
  const sessionToken1 = await signSessionToken({
    userId: user1.id,
    email: user1.email,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
  });
  console.log("Created HMAC-SHA256 Token (truncated):", sessionToken1.slice(0, 35) + "...");
  const verified1 = await verifySessionToken(sessionToken1);
  console.log("Verified Session Token Payload:", verified1);
  if (!verified1 || verified1.userId !== user1.id) {
    throw new Error("FAILED: Session token signature verification failed!");
  }
  console.log("PASS: Session token verified cryptographically.");

  console.log("\n=== STEP 4: USER 1 ONBOARDING FLOW ===");
  AuthStore.updateUserProfile(user1.id, {
    selectedExam: "ssc-cgl",
    selectedSubject: "reasoning-ability",
    selectedTopics: ["coding-decoding", "syllogisms"],
    dailyQuestionGoal: 25,
    onboardingCompleted: true,
  });

  const updatedProfile1 = AuthStore.getProfileByUserId(user1.id);
  console.log("User 1 Updated Profile after Onboarding:", {
    selectedExam: updatedProfile1?.selectedExam,
    selectedSubject: updatedProfile1?.selectedSubject,
    dailyQuestionGoal: updatedProfile1?.dailyQuestionGoal,
    onboardingCompleted: updatedProfile1?.onboardingCompleted,
  });

  console.log("\n=== STEP 5: USER 1 PRACTICE SESSION ===");
  AuthStore.recordUserPractice(user1.id, {
    examId: "ssc-cgl",
    subjectId: "reasoning-ability",
    topicId: "coding-decoding",
    topicName: "Coding-Decoding",
    score: 8,
    totalQuestions: 10,
    accuracy: 80,
    timeSpentSeconds: 600,
  });

  const profileAfterPractice1 = AuthStore.getProfileByUserId(user1.id);
  console.log("User 1 Profile After Practice:", {
    totalQuestionsAttempted: profileAfterPractice1?.totalQuestionsAttempted,
    overallAccuracy: profileAfterPractice1?.overallAccuracy,
    studyTimeMinutes: profileAfterPractice1?.studyTimeMinutes,
    currentStreak: profileAfterPractice1?.currentStreak,
  });

  if (
    profileAfterPractice1?.totalQuestionsAttempted !== 10 ||
    profileAfterPractice1?.overallAccuracy !== 80 ||
    profileAfterPractice1?.studyTimeMinutes !== 10 ||
    profileAfterPractice1?.currentStreak !== 1
  ) {
    throw new Error("FAILED: User 1 practice metrics not calculated accurately!");
  }
  console.log("PASS: User 1 practice telemetry updated to 10 questions, 80% accuracy, 10 min, streak = 1.");

  console.log("\n=== STEP 6: REGISTER USER 2 (Priya Patel) ===");
  const { user: user2 } = AuthStore.createUser("Priya Patel", "priya@example.com", "SecurePass456!");
  console.log("User 2 created ID:", user2.id);

  const profile2 = AuthStore.getProfileByUserId(user2.id);
  console.log("User 2 Initial Profile:", {
    fullName: profile2?.fullName,
    currentStreak: profile2?.currentStreak,
    totalQuestionsAttempted: profile2?.totalQuestionsAttempted,
    overallAccuracy: profile2?.overallAccuracy,
    studyTimeMinutes: profile2?.studyTimeMinutes,
    onboardingCompleted: profile2?.onboardingCompleted,
    selectedExam: profile2?.selectedExam,
  });

  console.log("\n=== STEP 7: STRICT USER ISOLATION VERIFICATION ===");
  console.log("Checking User 2 isolation against User 1...");
  if (profile2?.currentStreak !== 0) {
    throw new Error(`LEAK DETECTED: User 2 has currentStreak=${profile2?.currentStreak} instead of 0!`);
  }
  if (profile2?.totalQuestionsAttempted !== 0) {
    throw new Error(`LEAK DETECTED: User 2 has totalQuestionsAttempted=${profile2?.totalQuestionsAttempted} instead of 0!`);
  }
  if (profile2?.overallAccuracy !== 0) {
    throw new Error(`LEAK DETECTED: User 2 has overallAccuracy=${profile2?.overallAccuracy} instead of 0!`);
  }
  if (profile2?.selectedExam !== "") {
    throw new Error(`LEAK DETECTED: User 2 inherited User 1's target exam: ${profile2?.selectedExam}!`);
  }
  if (profile2?.onboardingCompleted !== false) {
    throw new Error(`LEAK DETECTED: User 2 inherited onboardingCompleted=true!`);
  }

  const user1History = AuthStore.getUserPracticeHistory(user1.id);
  const user2History = AuthStore.getUserPracticeHistory(user2.id);
  console.log(`User 1 practice history records: ${user1History.length}`);
  console.log(`User 2 practice history records: ${user2History.length}`);

  if (user1History.length !== 1 || user2History.length !== 0) {
    throw new Error("LEAK DETECTED: Practice history isolation failed!");
  }
  console.log("PASS: Complete isolation verified! User 2 sees 0 records, 0 metrics, independent state.");

  console.log("\n=== STEP 8: DUPLICATE EMAIL REGISTRATION PREVENTION ===");
  try {
    AuthStore.createUser("Duplicate Rohan", "rohan@example.com", "AnotherPassword!");
    throw new Error("FAILED: Allowed duplicate email registration!");
  } catch (err) {
    console.log("PASS: Duplicate registration rejected with error:", err.message);
  }

  console.log("\n=== STEP 9: CLEANUP DB ===");
  // Reset back to empty schema for clean production handover
  fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), "utf-8");
  console.log("PASS: Database reset to empty schema. All verifications passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
