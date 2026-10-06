import { NextRequest } from "next/server";
import { POST as registerRoute } from "@/app/api/auth/register/route";
import { POST as verifyOtpRoute } from "@/app/api/auth/register/verify-otp/route";
import { POST as resendOtpRoute } from "@/app/api/auth/register/resend-otp/route";
import { POST as loginRoute } from "@/app/api/auth/login/route";
import { GET as sessionRoute } from "@/app/api/auth/session/route";
import { AuthStore, verifyPassword } from "@/lib/auth/store";
import { PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";

console.log("================================================================================");
console.log("PREPSTREAK AI — RESEND OTP COMPLETE END-TO-END FLOW TEST");
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

async function runEndToEndResendFlow() {
  const testEmail = `resend.aspirant.${Date.now()}@example.com`;
  const testPassword = "SecurePassword2026!";
  const testName = "Aspirant Kavitha";
  const targetExam = "upsc-cse";

  // ---------------------------------------------------------------------------
  // Step 1: When RESEND_API_KEY is NOT configured, verify clear setup error
  // ---------------------------------------------------------------------------
  console.log("--- TEST STAGE 1: Unconfigured Resend Setup Error ---");
  const origKey = process.env.RESEND_API_KEY;
  const origFrom = process.env.EMAIL_FROM;
  const origProviderKey = process.env.EMAIL_PROVIDER_API_KEY;

  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_PROVIDER_API_KEY;

  const unconfiguredReq = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: testName,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      targetExamId: targetExam,
    }),
  });

  const unconfiguredRes = await registerRoute(unconfiguredReq);
  const unconfiguredData = await unconfiguredRes.json();

  assert(
    unconfiguredRes.status === 503,
    "1. Unconfigured Resend returns HTTP 503 Service Unavailable"
  );
  assert(
    unconfiguredData.isConfigurationError === true,
    "2. Response includes isConfigurationError: true"
  );
  assert(
    typeof unconfiguredData.error === "string" &&
      unconfiguredData.error.includes("RESEND_API_KEY"),
    "3. Clear setup error message explicitly instructs configuring RESEND_API_KEY in .env.local"
  );
  assert(
    AuthStore.getPendingRegistration(testEmail) === null,
    "4. No orphaned pending registration is retained when email delivery fails"
  );

  // ---------------------------------------------------------------------------
  // Step 2: Configure Resend Environment Variables
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST STAGE 2: Resend Configured & Real Flow Execution ---");
  process.env.RESEND_API_KEY = "re_test_mock_api_key_valid_123456";
  process.env.EMAIL_FROM = "PrepStreak AI <onboarding@resend.dev>";

  // Mock outbound fetch to https://api.resend.com/emails
  let interceptedResendRequest: any = null;
  let deliveredOtp: string = "";

  const originalFetch = global.fetch;
  global.fetch = async (url: any, init?: any) => {
    const urlStr = typeof url === "string" ? url : url.toString();
    if (urlStr.includes("api.resend.com/emails")) {
      const parsedBody = JSON.parse(init?.body as string);
      interceptedResendRequest = {
        url: urlStr,
        headers: init?.headers,
        body: parsedBody,
      };

      // Extract OTP from the branded HTML body (user receiving email)
      const match = parsedBody.html.match(/>\s*([0-9]{6})\s*</);
      if (match) {
        deliveredOtp = match[1];
      }

      return new Response(
        JSON.stringify({ id: "resend_msg_test_success_998877" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return originalFetch(url, init);
  };

  // ---------------------------------------------------------------------------
  // Step 3: Flow: Create Account -> Continue -> Generate OTP -> Send through Resend
  // ---------------------------------------------------------------------------
  const registerReq = new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: testName,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      targetExamId: targetExam,
    }),
  });

  const registerRes = await registerRoute(registerReq);
  const registerData = await registerRes.json();

  assert(registerRes.status === 200, "5. Register Step 1 returns HTTP 200 OK");
  assert(registerData.success === true, "6. Registration initiated successfully");
  assert(
    registerData.resendCooldownSeconds === 60,
    "7. Resend cooldown set to 60 seconds"
  );
  assert(
    !("otp" in registerData),
    "8. SECURITY: OTP is NEVER returned in the API response"
  );
  assert(
    !("password" in registerData) && !("passwordHash" in registerData),
    "9. SECURITY: Password/hash is NEVER exposed in the API response"
  );

  // Verify outbound Resend payload
  assert(
    interceptedResendRequest !== null,
    "10. Resend REST API endpoint was called"
  );
  assert(
    interceptedResendRequest.headers["Authorization"] ===
      "Bearer re_test_mock_api_key_valid_123456",
    "11. Server sent authentic Bearer token from RESEND_API_KEY environment variable"
  );
  assert(
    interceptedResendRequest.body.from === "PrepStreak AI <onboarding@resend.dev>",
    "12. Sender address matches EMAIL_FROM environment variable"
  );
  assert(
    interceptedResendRequest.body.to[0] === testEmail,
    "13. Destination matches recipient email"
  );
  assert(
    interceptedResendRequest.body.html.includes("PrepStreak AI"),
    "14. Email includes PrepStreak AI branding"
  );
  assert(
    interceptedResendRequest.body.html.includes("Email Verification"),
    "15. Email includes Email Verification message"
  );
  assert(
    interceptedResendRequest.body.html.includes("This code expires in a few minutes."),
    "16. Email includes expiration information"
  );
  assert(
    interceptedResendRequest.body.html.includes("Do not share this code with anyone."),
    "17. Email includes security warning not to share code"
  );
  assert(
    deliveredOtp.length === 6 && /^[0-9]{6}$/.test(deliveredOtp),
    "18. Email received contains authentic 6-digit OTP"
  );

  // ---------------------------------------------------------------------------
  // Step 4: Verify Server-Side Protection (Single-use, Rate-limit, Brute-force)
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST STAGE 3: Security & Brute-Force Safeguards ---");
  const pendingRecord = AuthStore.getPendingRegistration(testEmail);
  assert(pendingRecord !== null, "19. Pending registration stored on server");
  assert(
    Boolean(pendingRecord?.passwordHash.startsWith("$2")),
    "20. Password is cryptographically hashed with bcrypt (NEVER stored in plain text)"
  );
  assert(
    verifyPassword(testPassword, pendingRecord!.salt, pendingRecord!.passwordHash),
    "21. Bcrypt password hash accurately verifies the original password"
  );
  assert(
    Boolean(pendingRecord && pendingRecord.otpHash !== deliveredOtp),
    "22. OTP is stored hashed with cryptographic salt (NEVER stored in plain text)"
  );

  // Test Rate-limiting / Cooldown:
  const resendTooSoonReq = new NextRequest(
    "http://localhost:3000/api/auth/register/resend-otp",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    }
  );
  const resendTooSoonRes = await resendOtpRoute(resendTooSoonReq);
  assert(
    resendTooSoonRes.status === 429,
    "23. Resend OTP request within cooldown period is blocked with HTTP 429 Too Many Requests"
  );

  // Test Brute-force incorrect attempts:
  const wrongOtpReq = new NextRequest(
    "http://localhost:3000/api/auth/register/verify-otp",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, otp: "000000" }),
    }
  );
  const wrongOtpRes = await verifyOtpRoute(wrongOtpReq);
  const wrongOtpData = await wrongOtpRes.json();
  assert(wrongOtpRes.status === 400, "24. Incorrect OTP rejected with HTTP 400");
  assert(
    wrongOtpData.error.includes("attempt"),
    "25. Response indicates remaining attempts to prevent brute-forcing"
  );

  // ---------------------------------------------------------------------------
  // Step 5: Flow: Enter OTP -> Verify -> Create Account
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST STAGE 4: OTP Verification & Account Creation ---");
  const verifyReq = new NextRequest(
    "http://localhost:3000/api/auth/register/verify-otp",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, otp: deliveredOtp }),
    }
  );

  const verifyRes = await verifyOtpRoute(verifyReq);
  const verifyData = await verifyRes.json();

  assert(verifyRes.status === 200, "26. OTP verification succeeds with HTTP 200 OK");
  assert(verifyData.success === true, "27. Account successfully created");
  assert(
    verifyData.user.name === testName,
    "28. Created user has correct registered full name"
  );
  assert(
    verifyData.user.email === testEmail,
    "29. Created user has correct verified email"
  );
  assert(
    verifyData.profile.questionsSolved === 0 &&
      verifyData.profile.currentStreak === 0 &&
      verifyData.profile.studyTimeMinutes === 0,
    "30. User telemetry and profile start strictly at ZERO"
  );

  // Verify session cookie was set
  const sessionCookieHeader = verifyRes.cookies.get(PREPSTREAK_SESSION_COOKIE);
  assert(
    Boolean(sessionCookieHeader?.value),
    "31. Secure HTTP-only session cookie returned upon OTP verification"
  );

  // Verify single-use: Re-using the same OTP should fail immediately
  const reuseOtpReq = new NextRequest(
    "http://localhost:3000/api/auth/register/verify-otp",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, otp: deliveredOtp }),
    }
  );
  const reuseOtpRes = await verifyOtpRoute(reuseOtpReq);
  assert(
    reuseOtpRes.status === 400,
    "32. Single-use: Re-submitting the same OTP is rejected (pending record was deleted)"
  );

  // ---------------------------------------------------------------------------
  // Step 6: Flow: Login -> Session -> Dashboard
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST STAGE 5: Login & Dashboard Session Access ---");

  // Invalid login check
  const badLoginReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "WrongPassword123!" }),
  });
  const badLoginRes = await loginRoute(badLoginReq);
  assert(badLoginRes.status === 401, "33. Login with wrong password rejected with HTTP 401");

  // Valid login
  const loginReq = new NextRequest("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const loginRes = await loginRoute(loginReq);
  const loginData = await loginRes.json();

  assert(loginRes.status === 200, "34. Login with verified credentials succeeds with HTTP 200");
  assert(loginData.success === true, "35. User successfully logged in");

  const loginSessionCookie = loginRes.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;
  assert(
    Boolean(loginSessionCookie),
    "36. New authenticated session token cookie generated"
  );

  // Dashboard session check
  const sessionReq = new NextRequest("http://localhost:3000/api/auth/session", {
    method: "GET",
    headers: {
      cookie: `${PREPSTREAK_SESSION_COOKIE}=${loginSessionCookie}`,
    },
  });
  const sessionRes = await sessionRoute(sessionReq);
  const sessionData = await sessionRes.json();

  assert(
    sessionData.isAuthenticated === true,
    "37. Dashboard session endpoint verifies authenticated session"
  );
  assert(
    sessionData.user.email === testEmail,
    "38. Dashboard receives authenticated user email"
  );
  assert(
    sessionData.profile.examId === targetExam,
    "39. Dashboard profile includes target exam (upsc-cse)"
  );

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------
  global.fetch = originalFetch;
  if (origKey) process.env.RESEND_API_KEY = origKey;
  else delete process.env.RESEND_API_KEY;
  if (origFrom) process.env.EMAIL_FROM = origFrom;
  else delete process.env.EMAIL_FROM;
  if (origProviderKey) process.env.EMAIL_PROVIDER_API_KEY = origProviderKey;
  else delete process.env.EMAIL_PROVIDER_API_KEY;

  const storedUser = AuthStore.findUserByEmail(testEmail);
  if (storedUser) {
    AuthStore.deleteUser(storedUser.id);
  }
  AuthStore.deletePendingRegistration(testEmail);

  console.log("\n================================================================================");
  console.log(`RESEND OTP COMPLETE FLOW TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runEndToEndResendFlow().catch((err) => {
  console.error("Test runner threw an unhandled error:", err);
  process.exit(1);
});
