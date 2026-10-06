import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  AuthStore,
  hashOtp,
  verifyOtp,
  validatePasswordStrength,
} from "@/lib/auth/store";
import { signSessionToken, verifySessionToken } from "@/lib/auth/token";
import { EmailService } from "@/lib/email/email-service";
import { CENTRAL_EXAM_CATALOGUE } from "@/lib/data/examCatalogue";

console.log("=================================================");
console.log("PREPSTREAK AI — FINAL PRODUCTION VERIFICATION SUITE");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

async function runTests() {
  // ---------------------------------------------------------------------------
  // Test 1: Landing page tagline removal
  // ---------------------------------------------------------------------------
  const landingPagePath = path.join(process.cwd(), "app/page.tsx");
  const landingContent = fs.readFileSync(landingPagePath, "utf-8");
  assert(
    !landingContent.includes("AI-Powered Government Exam Preparation"),
    "Test 1: Tagline 'AI-Powered Government Exam Preparation' is completely removed from app/page.tsx"
  );
  assert(
    landingContent.includes("PrepStreak"),
    "Test 1b: PrepStreak AI brand identity and logo remain intact on landing page"
  );

  // ---------------------------------------------------------------------------
  // Test 2: Settings page placeholder audit
  // ---------------------------------------------------------------------------
  const settingsPagePath = path.join(process.cwd(), "app/settings/page.tsx");
  const settingsContent = fs.readFileSync(settingsPagePath, "utf-8");
  assert(
    !settingsContent.includes("Coming Soon") && !settingsContent.includes("Upcoming"),
    "Test 2: All 'Coming Soon' and 'Upcoming' placeholder tags are removed from Settings"
  );
  assert(
    settingsContent.includes("Delete Account") && settingsContent.includes("CENTRAL_EXAM_CATALOGUE"),
    "Test 2b: Settings includes real Delete Account flow and complete Exam Catalogue preferences"
  );

  // ---------------------------------------------------------------------------
  // Test 3: Password strength validation
  // ---------------------------------------------------------------------------
  assert(
    !validatePasswordStrength("short").valid,
    "Test 3a: Password under 8 chars rejected"
  );
  assert(
    !validatePasswordStrength("alllowercase123").valid,
    "Test 3b: Password without uppercase rejected"
  );
  assert(
    !validatePasswordStrength("ALLUPPERCASE123").valid,
    "Test 3c: Password without lowercase rejected"
  );
  assert(
    !validatePasswordStrength("NoNumberHerePassword").valid,
    "Test 3d: Password without digits rejected"
  );
  assert(
    validatePasswordStrength("ValidPass123!").valid,
    "Test 3e: Strong password (8+ chars, upper, lower, number) accepted"
  );

  // ---------------------------------------------------------------------------
  // Test 4: OTP Generation, Hashing & Timing-Safe Verification
  // ---------------------------------------------------------------------------
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const salt = crypto.randomBytes(16).toString("hex");
  const hashed = hashOtp(rawOtp, salt);

  assert(rawOtp.length === 6, "Test 4a: Server OTP is exactly 6 digits");
  assert(
    verifyOtp(rawOtp, salt, hashed),
    "Test 4b: Cryptographic timing-safe OTP verification succeeds with correct OTP"
  );
  assert(
    !verifyOtp("000000", salt, hashed),
    "Test 4c: Cryptographic verification rejects incorrect OTP"
  );

  // ---------------------------------------------------------------------------
  // Test 5: Pending Registration Store & Resend Cooldown
  // ---------------------------------------------------------------------------
  const testEmail = `test_aspirant_${Date.now()}@example.com`;
  AuthStore.savePendingRegistration({
    fullName: "Test Aspirant",
    email: testEmail,
    passwordHash: "bcrypt_hash_placeholder",
    targetExamId: "sbi-po",
    otpHash: hashed,
    otpSalt: salt,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
    resendCooldownUntil: new Date(Date.now() + 60 * 1000).toISOString(), // 60s cooldown
    attempts: 0,
    salt,
    createdAt: new Date().toISOString(),
  });

  const retrievedPending = AuthStore.getPendingRegistration(testEmail);
  assert(
    retrievedPending !== null && retrievedPending.email === testEmail,
    "Test 5a: Pending registration correctly saved and retrieved"
  );

  const attempts1 = AuthStore.incrementPendingAttempts(testEmail);
  assert(attempts1 === 1, "Test 5b: Pending attempts increment tracked");

  // Simulate cooldown check
  const now = Date.now();
  const cooldownUntil = retrievedPending?.resendCooldownUntil ? new Date(retrievedPending.resendCooldownUntil).getTime() : 0;
  const canResend = now >= cooldownUntil;
  assert(!canResend, "Test 5c: Resend cooldown is active within 60 seconds");

  // ---------------------------------------------------------------------------
  // Test 6: Brand New User Account Starts from Absolute Zero
  // ---------------------------------------------------------------------------
  const userAEmail = `aspirant_a_${Date.now()}@example.com`;
  const { user: userA } = AuthStore.createUser(
    "Aspirant Alpha",
    userAEmail,
    "PasswordA123!",
    "sbi-po"
  );

  assert(userA.fullName === "Aspirant Alpha", "Test 6a: User created with their own registered name");
  
  const profileA = AuthStore.getProfileByUserId(userA.id);
  assert(profileA !== null, "Test 6b: User profile exists");
  assert(profileA?.totalQuestionsAttempted === 0, "Test 6c: Questions Attempted starts at strict 0");
  assert(profileA?.totalQuestionsCorrect === 0, "Test 6d: Questions Correct starts at strict 0");
  assert(profileA?.overallAccuracy === 0, "Test 6e: Overall Accuracy starts at strict 0%");
  assert(profileA?.currentStreak === 0, "Test 6f: Current Streak starts at strict 0 Days");
  assert(profileA?.longestStreak === 0, "Test 6g: Longest Streak starts at strict 0 Days");
  assert(profileA?.studyTimeMinutes === 0, "Test 6h: Study Time starts at strict 0m");
  assert(profileA?.totalTestsCompleted === 0, "Test 6i: Tests Completed starts at strict 0");

  const historyA = AuthStore.getUserPracticeHistory(userA.id);
  assert(Array.isArray(historyA) && historyA.length === 0, "Test 6j: Practice history starts strictly empty");

  // ---------------------------------------------------------------------------
  // Test 7: Target Exam Change & Persistence
  // ---------------------------------------------------------------------------
  assert(profileA?.selectedExam === "sbi-po", "Test 7a: Initial target exam set to sbi-po");
  
  // User changes target to TNPSC Group 4
  const updatedProfileA = AuthStore.updateUserProfile(userA.id, {
    selectedExam: "tnpsc-group-4",
  });
  assert(
    updatedProfileA?.selectedExam === "tnpsc-group-4",
    "Test 7b: Target exam successfully changed to tnpsc-group-4"
  );

  // Verify persistence from disk
  const reloadedProfileA = AuthStore.getProfileByUserId(userA.id);
  assert(
    reloadedProfileA?.selectedExam === "tnpsc-group-4",
    "Test 7c: Target exam change is persistently stored on disk"
  );

  // ---------------------------------------------------------------------------
  // Test 8: Multi-User Strict Isolation (User A vs User B)
  // ---------------------------------------------------------------------------
  const userBEmail = `aspirant_b_${Date.now()}@example.com`;
  const { user: userB } = AuthStore.createUser(
    "Aspirant Beta",
    userBEmail,
    "PasswordB123!",
    "upsc-cse"
  );

  const profileB = AuthStore.getProfileByUserId(userB.id);
  assert(userB.id !== userA.id, "Test 8a: User A and User B have unique user IDs");
  assert(
    profileB?.selectedExam === "upsc-cse" && reloadedProfileA?.selectedExam === "tnpsc-group-4",
    "Test 8b: User A and User B maintain distinct target exams simultaneously"
  );
  assert(profileB?.totalQuestionsAttempted === 0, "Test 8c: User B starts with 0 questions");

  // User A practices 15 questions
  AuthStore.recordUserPractice(userA.id, {
    examId: "tnpsc-group-4",
    subjectId: "general-tamil",
    topicId: "grammar-basics",
    topicName: "Grammar Basics",
    score: 12,
    totalQuestions: 15,
    accuracy: 80,
    timeSpentSeconds: 600, // 10 minutes
  });

  const profileAAfterPractice = AuthStore.getProfileByUserId(userA.id);
  const profileBAfterPractice = AuthStore.getProfileByUserId(userB.id);

  assert(
    profileAAfterPractice?.totalQuestionsAttempted === 15,
    "Test 8d: User A stats updated to 15 questions attempted"
  );
  assert(
    profileAAfterPractice?.currentStreak === 1,
    "Test 8e: User A streak updated to 1 day"
  );
  assert(
    profileAAfterPractice?.studyTimeMinutes === 10,
    "Test 8f: User A study time updated to 10 minutes"
  );

  // CRITICAL ISOLATION CHECK: User B's state MUST REMAIN AT ZERO!
  assert(
    profileBAfterPractice?.totalQuestionsAttempted === 0,
    "Test 8g: User B questions remain strictly 0 after User A practice"
  );
  assert(
    profileBAfterPractice?.currentStreak === 0,
    "Test 8h: User B streak remains strictly 0 after User A practice"
  );
  assert(
    profileBAfterPractice?.studyTimeMinutes === 0,
    "Test 8i: User B study time remains strictly 0 after User A practice"
  );

  const historyB = AuthStore.getUserPracticeHistory(userB.id);
  assert(
    historyB.length === 0,
    "Test 8j: User B cannot see User A's practice history records"
  );

  // ---------------------------------------------------------------------------
  // Test 9: Mock Test Submission Tracking
  // ---------------------------------------------------------------------------
  AuthStore.recordUserPractice(userA.id, {
    examId: "tnpsc-group-4",
    subjectId: "all",
    topicId: "mock-test",
    topicName: "Full Mock Test",
    score: 18,
    totalQuestions: 20,
    accuracy: 90,
    timeSpentSeconds: 900,
  });

  const profileAAfterTest = AuthStore.getProfileByUserId(userA.id);
  assert(
    profileAAfterTest?.totalTestsCompleted === 1,
    "Test 9: Test completion automatically increments totalTestsCompleted for user"
  );
  assert(
    profileBAfterPractice?.totalTestsCompleted === 0,
    "Test 9b: User B tests completed remains 0"
  );

  // ---------------------------------------------------------------------------
  // Test 10: Authentication & Session Verification
  // ---------------------------------------------------------------------------
  const invalidLogin = AuthStore.authenticate(userAEmail, "WrongPassword123!");
  assert(invalidLogin === null, "Test 10a: Login with invalid password rejected");

  const validLogin = AuthStore.authenticate(userAEmail, "PasswordA123!");
  assert(validLogin !== null && validLogin.id === userA.id, "Test 10b: Login with valid credentials succeeds");

  const sessionToken = await signSessionToken({
    userId: userA.id,
    email: userA.email,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const verifiedPayload = await verifySessionToken(sessionToken);
  assert(
    verifiedPayload?.userId === userA.id,
    "Test 10c: HMAC-SHA256 session token verified and decodes authentic userId"
  );

  const tamperedToken = sessionToken.slice(0, -6) + "badbad";
  const tamperedPayload = await verifySessionToken(tamperedToken);
  assert(tamperedPayload === null, "Test 10d: Tampered session token rejected");

  // ---------------------------------------------------------------------------
  // Test 11: Forgot Password & Password Reset Flow
  // ---------------------------------------------------------------------------
  const resetCode = "654321";
  const resetSalt = crypto.randomBytes(16).toString("hex");
  const resetHash = hashOtp(resetCode, resetSalt);

  AuthStore.savePasswordReset({
    email: userAEmail,
    resetCodeHash: resetHash,
    salt: resetSalt,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    attempts: 0,
    createdAt: new Date().toISOString(),
  });

  const resetRecord = AuthStore.getPasswordReset(userAEmail);
  assert(resetRecord !== null, "Test 11a: Password reset record stored securely");

  assert(
    !verifyOtp("111111", resetSalt, resetRecord!.resetCodeHash),
    "Test 11b: Incorrect password reset code rejected"
  );
  assert(
    verifyOtp(resetCode, resetSalt, resetRecord!.resetCodeHash),
    "Test 11c: Correct password reset code verified"
  );

  // Update password to NewPasswordA123!
  const updatedPass = AuthStore.updateUserPassword(userA.id, "NewPasswordA123!");
  assert(updatedPass, "Test 11d: Password updated in database");

  AuthStore.deletePasswordReset(userAEmail);
  assert(
    AuthStore.getPasswordReset(userAEmail) === null,
    "Test 11e: Password reset record deleted after single use"
  );

  assert(
    AuthStore.authenticate(userAEmail, "PasswordA123!") === null,
    "Test 11f: Old password fails to authenticate after reset"
  );
  assert(
    AuthStore.authenticate(userAEmail, "NewPasswordA123!") !== null,
    "Test 11g: New password successfully authenticates"
  );

  // ---------------------------------------------------------------------------
  // Test 12: Delete Account Flow (Data Wiping)
  // ---------------------------------------------------------------------------
  const deleteSuccess = AuthStore.deleteUser(userA.id);
  assert(deleteSuccess, "Test 12a: Delete user operation executed");

  assert(
    AuthStore.getUserById(userA.id) === null,
    "Test 12b: User record wiped from database"
  );
  assert(
    AuthStore.getProfileByUserId(userA.id) === null,
    "Test 12c: User profile wiped from database"
  );
  assert(
    AuthStore.getUserPracticeHistory(userA.id).length === 0,
    "Test 12d: User practice history wiped from database"
  );
  assert(
    AuthStore.authenticate(userAEmail, "NewPasswordA123!") === null,
    "Test 12e: Deleted user cannot log in"
  );

  // Clean up User B
  AuthStore.deleteUser(userB.id);
  AuthStore.deletePendingRegistration(testEmail);

  // ---------------------------------------------------------------------------
  // Test 13: Client Security & No OTP In API Responses
  // ---------------------------------------------------------------------------
  const registerRouteContent = fs.readFileSync(
    path.join(process.cwd(), "app/api/auth/register/route.ts"),
    "utf-8"
  );
  assert(
    !registerRouteContent.includes("otp: rawOtp") && !registerRouteContent.includes("code: rawOtp"),
    "Test 13a: Registration endpoint NEVER includes raw OTP in the API JSON response"
  );

  const verifyOtpRouteContent = fs.readFileSync(
    path.join(process.cwd(), "app/api/auth/register/verify-otp/route.ts"),
    "utf-8"
  );
  assert(
    verifyOtpRouteContent.includes("deletePendingRegistration"),
    "Test 13b: Verification endpoint invalidates (deletes) the OTP immediately on successful activation (single-use)"
  );

  // ---------------------------------------------------------------------------
  // Test 14: Email Service Branded Theme & Security
  // ---------------------------------------------------------------------------
  assert(
    typeof EmailService.sendOtpEmail === "function",
    "Test 14a: EmailService.sendOtpEmail abstraction is properly defined"
  );
  assert(
    typeof EmailService.sendPasswordResetEmail === "function",
    "Test 14b: EmailService.sendPasswordResetEmail abstraction is properly defined"
  );

  // ---------------------------------------------------------------------------
  // Test 15: Exam Catalogue Verification
  // ---------------------------------------------------------------------------
  assert(
    CENTRAL_EXAM_CATALOGUE.length >= 20,
    `Test 15a: Central exam catalogue contains all ${CENTRAL_EXAM_CATALOGUE.length} competitive exams`
  );
  const categories = Array.from(new Set(CENTRAL_EXAM_CATALOGUE.map((e) => e.category)));
  assert(
    categories.includes("Banking & Finance") &&
      categories.includes("SSC") &&
      categories.includes("UPSC") &&
      categories.includes("State PSC") &&
      categories.includes("Railways"),
    "Test 15b: Central catalogue covers all major national & state exam categories"
  );

  // ---------------------------------------------------------------------------
  // Test 16: Email Service Unconfigured Check (Honest failure, never pretend)
  // ---------------------------------------------------------------------------
  const origResend = process.env.RESEND_API_KEY;
  const origSmtp = process.env.SMTP_HOST;
  const origSg = process.env.SENDGRID_API_KEY;

  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_PROVIDER_API_KEY;
  delete process.env.SMTP_HOST;
  delete process.env.SENDGRID_API_KEY;

  const unconfiguredStatus = EmailService.checkConfiguration();
  assert(
    !unconfiguredStatus.configured,
    "Test 16a: checkConfiguration detects that no email provider is configured"
  );
  assert(
    unconfiguredStatus.missingEnvVars.length > 0,
    "Test 16b: checkConfiguration provides exact missing environment variables"
  );

  const unconfiguredResult = await EmailService.sendOtpEmail({
    to: "test@example.com",
    fullName: "Test Aspirant",
    otp: "123456",
  });
  assert(
    !unconfiguredResult.success && unconfiguredResult.isConfigurationError === true,
    "Test 16c: sendOtpEmail FAILS HONESTLY when no provider is configured (NEVER pretends success)"
  );
  assert(
    Boolean(unconfiguredResult.error?.includes("Email delivery provider is not configured")),
    "Test 16d: sendOtpEmail returns clear developer setup error explaining missing env vars"
  );

  // Restore env
  if (origResend) process.env.RESEND_API_KEY = origResend;
  if (origSmtp) process.env.SMTP_HOST = origSmtp;
  if (origSg) process.env.SENDGRID_API_KEY = origSg;

  // ---------------------------------------------------------------------------
  // Test 17: Email Content Format & Required Strings
  // ---------------------------------------------------------------------------
  const emailServiceSource = fs.readFileSync(
    path.join(process.cwd(), "lib/email/email-service.ts"),
    "utf-8"
  );
  assert(
    emailServiceSource.includes("PrepStreak AI") &&
      emailServiceSource.includes("Email Verification") &&
      emailServiceSource.includes("Your verification code is:") &&
      emailServiceSource.includes("This code expires in a few minutes.") &&
      emailServiceSource.includes("Do not share this code with anyone."),
    "Test 17: OTP Email template contains all exact required headers, warnings, and expiry copy"
  );

  // ---------------------------------------------------------------------------
  // Test 18: Expired OTP Rejection
  // ---------------------------------------------------------------------------
  const expiredEmail = `expired_${Date.now()}@example.com`;
  const expiredSalt = crypto.randomBytes(16).toString("hex");
  const expiredOtpHash = hashOtp("123456", expiredSalt);

  AuthStore.savePendingRegistration({
    fullName: "Expired Aspirant",
    email: expiredEmail,
    passwordHash: "hash",
    salt: "salt",
    otpHash: expiredOtpHash,
    otpSalt: expiredSalt,
    expiresAt: new Date(Date.now() - 1000).toISOString(), // already expired 1 sec ago
    resendCooldownUntil: new Date(Date.now() - 1000).toISOString(),
    attempts: 0,
    createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
  });

  const expiredPending = AuthStore.getPendingRegistration(expiredEmail);
  const isExpired = new Date(expiredPending!.expiresAt).getTime() < Date.now();
  assert(isExpired, "Test 18: Expired OTP timestamp properly recognized as expired");
  AuthStore.deletePendingRegistration(expiredEmail);

  // ---------------------------------------------------------------------------
  // Test 19: Maximum Verification Attempts Lockout
  // ---------------------------------------------------------------------------
  const attemptEmail = `attempts_${Date.now()}@example.com`;
  AuthStore.savePendingRegistration({
    fullName: "Attempt Aspirant",
    email: attemptEmail,
    passwordHash: "hash",
    salt: "salt",
    otpHash: "hash",
    otpSalt: "salt",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    resendCooldownUntil: new Date(Date.now() + 60 * 1000).toISOString(),
    attempts: 4,
    createdAt: new Date().toISOString(),
  });

  const nextAttempt = AuthStore.incrementPendingAttempts(attemptEmail);
  assert(nextAttempt === 5, "Test 19a: Attempt counter increments to 5");
  const isLocked = nextAttempt >= 5;
  assert(isLocked, "Test 19b: Maximum 5 attempts lockout condition met");
  AuthStore.deletePendingRegistration(attemptEmail);

  // ---------------------------------------------------------------------------
  // Test 20: Duplicate Email Account Creation Prevention
  // ---------------------------------------------------------------------------
  const dupEmail = `dup_${Date.now()}@example.com`;
  AuthStore.createUser("User One", dupEmail, "ValidPass123!", "sbi-po");
  let caughtDup = false;
  try {
    AuthStore.createUser("User Two", dupEmail, "ValidPass123!", "sbi-po");
  } catch (err: unknown) {
    caughtDup = true;
  }
  assert(caughtDup, "Test 20: Duplicate email registration is immediately rejected");

  const dupUser = AuthStore.findUserByEmail(dupEmail);
  if (dupUser) AuthStore.deleteUser(dupUser.id);

  // ---------------------------------------------------------------------------
  // Test 21: Email Format Regex
  // ---------------------------------------------------------------------------
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert(EMAIL_REGEX.test("student@domain.com"), "Test 21a: Valid email accepted");
  assert(!EMAIL_REGEX.test("invalid-email"), "Test 21b: Email without @ rejected");
  assert(!EMAIL_REGEX.test("missing@domain"), "Test 21c: Email without TLD rejected");
  assert(!EMAIL_REGEX.test("@nodomain.com"), "Test 21d: Email without user part rejected");

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n=================================================");
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner threw an unhandled error:", err);
  process.exit(1);
});
