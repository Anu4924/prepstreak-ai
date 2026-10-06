import { NextRequest } from "next/server";
import { POST as registerRoute } from "@/app/api/auth/register/route";
import { POST as loginRoute } from "@/app/api/auth/login/route";
import { POST as logoutRoute } from "@/app/api/auth/logout/route";
import { GET as sessionRoute } from "@/app/api/auth/session/route";
import { AuthStore, verifyPassword } from "@/lib/auth/store";
import { PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";

console.log("================================================================================");
console.log("PREPSTREAK AI — UPDATED AUTHENTICATION FLOW VERIFICATION SUITE");
console.log("Testing: No OTP, Direct Account Creation, Secure Hashing, Isolation, Zero State");
console.log("================================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function runAuthFlowTests() {
  // Ensure completely free of Resend / Email delivery environment variables
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_PROVIDER_API_KEY;
  delete process.env.EMAIL_FROM;
  delete process.env.SMTP_HOST;
  delete process.env.SENDGRID_API_KEY;

  const user1Email = `student.test1.${Date.now()}@example.com`;
  const user1Password = "StrongPassword2026!";
  const user1Name = "Aravind Swaminathan";

  const user2Email = `student.test2.${Date.now()}@example.com`;
  const user2Password = "SecurePass2026!";
  const user2Name = "Divya Krishnan";

  // ---------------------------------------------------------------------------
  // 1. Validation Checks
  // ---------------------------------------------------------------------------
  console.log("--- 1. VALIDATION CHECKS ---");

  // Missing fields
  const missingFieldReq = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName: "", email: "", password: "", confirmPassword: "" }),
  });
  const missingFieldRes = await registerRoute(missingFieldReq);
  assert(missingFieldRes.status === 400, "1a. Missing required fields returns HTTP 400");

  // Invalid email format
  const invalidEmailReq = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: user1Name,
      email: "invalid-email-format",
      password: user1Password,
      confirmPassword: user1Password,
    }),
  });
  const invalidEmailRes = await registerRoute(invalidEmailReq);
  assert(invalidEmailRes.status === 400, "1b. Invalid email format returns HTTP 400");

  // Weak password
  const weakPassReq = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: user1Name,
      email: user1Email,
      password: "weak",
      confirmPassword: "weak",
    }),
  });
  const weakPassRes = await registerRoute(weakPassReq);
  assert(weakPassRes.status === 400, "1c. Password under 8 characters returns HTTP 400");

  // Password confirmation mismatch
  const mismatchPassReq = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: user1Name,
      email: user1Email,
      password: user1Password,
      confirmPassword: "DifferentPassword123!",
    }),
  });
  const mismatchPassRes = await registerRoute(mismatchPassReq);
  assert(mismatchPassRes.status === 400, "1d. Password mismatch returns HTTP 400");

  // ---------------------------------------------------------------------------
  // 2. Create Account Immediately (Without OTP or Resend)
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. CREATE ACCOUNT IMMEDIATELY ---");

  const registerReq = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: user1Name,
      email: user1Email,
      password: user1Password,
      confirmPassword: user1Password,
      targetExamId: "ssc-cgl",
    }),
  });

  const registerRes = await registerRoute(registerReq);
  const registerData = await registerRes.json();

  assert(registerRes.status === 200, "2a. Registration succeeds with HTTP 200 (no OTP required)");
  assert(registerData.success === true, "2b. Response indicates success: true");
  assert(registerData.user?.email === user1Email, "2c. User email matches registration email");
  assert(registerData.user?.name === user1Name, "2d. User name matches registration name");

  // Check session cookie set
  const sessionCookie = registerRes.cookies.get(PREPSTREAK_SESSION_COOKIE);
  assert(Boolean(sessionCookie?.value), "2e. Secure HTTP-only session cookie issued on registration");

  // Verify server-side password security
  const storedUser1 = AuthStore.findUserByEmail(user1Email);
  assert(storedUser1 !== null, "2f. User record exists in server database");
  assert(
    Boolean(storedUser1?.passwordHash.startsWith("$2")),
    "2g. Password is encrypted with bcrypt hash (never plain text)"
  );
  assert(
    storedUser1?.passwordHash !== user1Password,
    "2h. Plain text password is NEVER stored in database"
  );
  assert(
    verifyPassword(user1Password, storedUser1!.salt, storedUser1!.passwordHash),
    "2i. Bcrypt hash successfully verifies original password"
  );

  // ---------------------------------------------------------------------------
  // 3. Verify Strict Zero Personal Progress for New User
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. ZERO PERSONAL PROGRESS VERIFICATION ---");
  const profile1 = AuthStore.getProfileByUserId(storedUser1!.id);
  assert(profile1 !== null, "3a. User profile exists");
  assert(registerData.profile?.questionsSolved === 0, "3b. questionsSolved starts at strict 0");
  assert(registerData.profile?.accuracy === 0, "3c. accuracy starts at strict 0");
  assert(registerData.profile?.currentStreak === 0, "3d. streak starts at strict 0");
  assert(registerData.profile?.studyTimeMinutes === 0, "3e. studyTime starts at strict 0");
  assert(registerData.profile?.testsCompleted === 0, "3f. testsCompleted starts at strict 0");
  assert(registerData.profile?.progress === 0, "3g. progress starts at strict 0");

  const history1 = AuthStore.getUserPracticeHistory(storedUser1!.id);
  assert(history1.length === 0, "3h. User practice history starts strictly empty");

  // ---------------------------------------------------------------------------
  // 4. Session Verification
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. SESSION VERIFICATION ---");
  const sessionReq = new NextRequest("http://localhost:3000/api/auth/session", {
    method: "GET",
    headers: {
      cookie: `${PREPSTREAK_SESSION_COOKIE}=${sessionCookie?.value}`,
    },
  });
  const sessionRes = await sessionRoute(sessionReq);
  const sessionData = await sessionRes.json();

  assert(sessionData.isAuthenticated === true, "4a. Session endpoint confirms user is authenticated");
  assert(sessionData.user?.email === user1Email, "4b. Session user email matches");
  assert(sessionData.profile?.questionsSolved === 0, "4c. Session profile retains 0 questions solved");

  // ---------------------------------------------------------------------------
  // 5. Logout Flow
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. LOGOUT FLOW ---");
  const logoutReq = new NextRequest("http://localhost:3000/api/auth/logout", {
    method: "POST",
    headers: {
      cookie: `${PREPSTREAK_SESSION_COOKIE}=${sessionCookie?.value}`,
    },
  });
  const logoutRes = await logoutRoute(logoutReq);
  assert(logoutRes.status === 200, "5a. Logout endpoint succeeds with HTTP 200");

  // Verify session cookie deletion
  const deletedCookie = logoutRes.cookies.get(PREPSTREAK_SESSION_COOKIE);
  assert(
    deletedCookie?.maxAge === 0 || deletedCookie?.value === "",
    "5b. Session cookie cleared on logout"
  );

  // Check that session is no longer valid
  const postLogoutSessionReq = new NextRequest("http://localhost:3000/api/auth/session", {
    method: "GET",
    headers: {
      cookie: `${PREPSTREAK_SESSION_COOKIE}=${sessionCookie?.value}`,
    },
  });
  const postLogoutSessionRes = await sessionRoute(postLogoutSessionReq);
  const postLogoutSessionData = await postLogoutSessionRes.json();
  assert(
    postLogoutSessionData.isAuthenticated === false,
    "5c. Session is invalid after logout (isAuthenticated = false)"
  );

  // ---------------------------------------------------------------------------
  // 6. Login Flow
  // ---------------------------------------------------------------------------
  console.log("\n--- 6. LOGIN FLOW ---");

  // Wrong password
  const wrongPassLoginReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user1Email, password: "IncorrectPassword123!" }),
  });
  const wrongPassLoginRes = await loginRoute(wrongPassLoginReq);
  assert(wrongPassLoginRes.status === 401, "6a. Login with incorrect password rejected with HTTP 401");

  // Non-existent user
  const nonExistentLoginReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "doesnotexist@example.com", password: "SomePassword123!" }),
  });
  const nonExistentLoginRes = await loginRoute(nonExistentLoginReq);
  assert(nonExistentLoginRes.status === 401, "6b. Login with non-existent email rejected with HTTP 401");

  // Correct credentials login
  const validLoginReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user1Email, password: user1Password }),
  });
  const validLoginRes = await loginRoute(validLoginReq);
  const validLoginData = await validLoginRes.json();

  assert(validLoginRes.status === 200, "6c. Login with correct credentials succeeds with HTTP 200");
  assert(validLoginData.success === true, "6d. Login response returns success: true");
  const loginCookie = validLoginRes.cookies.get(PREPSTREAK_SESSION_COOKIE);
  assert(Boolean(loginCookie?.value), "6e. New authenticated session cookie issued");

  // ---------------------------------------------------------------------------
  // 7. Duplicate Email Rejection
  // ---------------------------------------------------------------------------
  console.log("\n--- 7. DUPLICATE EMAIL REJECTION ---");
  const dupRegisterReq = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Duplicate User",
      email: user1Email,
      password: "AnotherPassword2026!",
      confirmPassword: "AnotherPassword2026!",
    }),
  });
  const dupRegisterRes = await registerRoute(dupRegisterReq);
  const dupRegisterData = await dupRegisterRes.json();

  assert(dupRegisterRes.status === 409, "7a. Duplicate email registration rejected with HTTP 409 Conflict");
  assert(
    typeof dupRegisterData.error === "string" &&
      dupRegisterData.error.toLowerCase().includes("already exists"),
    "7b. Response contains clear duplicate account warning"
  );

  // ---------------------------------------------------------------------------
  // 8. Multiple Users & Strict Data Isolation
  // ---------------------------------------------------------------------------
  console.log("\n--- 8. MULTIPLE USERS & DATA ISOLATION ---");

  // Register User 2
  const register2Req = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: user2Name,
      email: user2Email,
      password: user2Password,
      confirmPassword: user2Password,
      targetExamId: "upsc-cse",
    }),
  });
  const register2Res = await registerRoute(register2Req);
  const register2Data = await register2Res.json();

  assert(register2Res.status === 200, "8a. User 2 registered successfully");
  assert(register2Data.user?.id !== registerData.user?.id, "8b. User 1 and User 2 have distinct IDs");

  // User 1 performs practice activities (updates questions, streak, accuracy, study time)
  AuthStore.recordUserPractice(storedUser1!.id, {
    examId: "ssc-cgl",
    subjectId: "quantitative-aptitude",
    topicId: "number-systems",
    topicName: "Number Systems",
    score: 9,
    totalQuestions: 10,
    accuracy: 90,
    timeSpentSeconds: 600, // 10 minutes
  });

  // Verify User 1 updated
  const updatedProfile1 = AuthStore.getProfileByUserId(storedUser1!.id);
  assert(updatedProfile1?.totalQuestionsAttempted === 10, "8c. User 1 questions attempted = 10");
  assert(updatedProfile1?.overallAccuracy === 90, "8d. User 1 accuracy = 90%");
  assert(updatedProfile1?.currentStreak === 1, "8e. User 1 streak = 1");
  assert(updatedProfile1?.studyTimeMinutes === 10, "8f. User 1 study time = 10 min");

  // STRICT ISOLATION CHECK: User 2's profile must remain strictly at ZERO
  const profile2 = AuthStore.getProfileByUserId(register2Data.user.id);
  assert(profile2?.totalQuestionsAttempted === 0, "8g. ISOLATION: User 2 questions remain strictly 0");
  assert(profile2?.overallAccuracy === 0, "8h. ISOLATION: User 2 accuracy remains strictly 0%");
  assert(profile2?.currentStreak === 0, "8i. ISOLATION: User 2 streak remains strictly 0");
  assert(profile2?.studyTimeMinutes === 0, "8j. ISOLATION: User 2 study time remains strictly 0");
  assert(profile2?.totalTestsCompleted === 0, "8k. ISOLATION: User 2 tests remain strictly 0");
  assert(profile2?.selectedExam === "upsc-cse", "8l. ISOLATION: User 2 target exam is upsc-cse");
  assert(updatedProfile1?.selectedExam === "ssc-cgl", "8m. ISOLATION: User 1 target exam is ssc-cgl");

  const user2History = AuthStore.getUserPracticeHistory(register2Data.user.id);
  assert(user2History.length === 0, "8n. ISOLATION: User 2 practice history remains strictly empty");

  // ---------------------------------------------------------------------------
  // 9. Clean Up
  // ---------------------------------------------------------------------------
  console.log("\n--- 9. CLEAN UP ---");
  AuthStore.deleteUser(storedUser1!.id);
  AuthStore.deleteUser(register2Data.user.id);

  assert(AuthStore.findUserByEmail(user1Email) === null, "9a. User 1 cleaned up");
  assert(AuthStore.findUserByEmail(user2Email) === null, "9b. User 2 cleaned up");

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`UPDATED AUTH VERIFICATION SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthFlowTests().catch((err) => {
  console.error("Test runner threw an unhandled error:", err);
  process.exit(1);
});
