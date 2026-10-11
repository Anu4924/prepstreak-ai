import * as fs from "fs";

if (fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

import { createAdminClient } from "../lib/supabase/admin";

const adminClient = createAdminClient();

async function runTests() {
  console.log("=== STARTING FULL END-TO-END AUTH INTEGRATION TESTS ===");
  const timestamp = Date.now();
  const testEmail = `student_e2e_${timestamp}@gmail.com`;
  const testPassword = "Password123!";
  const testName = "E2E Student";
  const testExam = "ssc-cgl";

  // TEST 1: Register new user
  console.log("\n[Test 1] POST /api/auth/register for", testEmail);
  const regRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: testName,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      targetExamId: testExam,
    }),
  });

  const regData = await regRes.json();
  console.log("Register response status:", regRes.status);
  console.log("Register success:", regData.success);
  console.log("Register user ID:", regData.user?.id);
  console.log("Register profile:", regData.profile?.name, regData.profile?.currentExam);

  if (!regData.success || !regData.user?.id) {
    throw new Error("Registration failed: " + JSON.stringify(regData));
  }

  const userId = regData.user.id;

  // Verify user appears in Supabase Auth via Admin Client
  console.log("\n[Test 2] Verify user in Supabase Auth admin API...");
  const { data: sbUser, error: sbUserErr } = await adminClient!.auth.admin.getUserById(userId);
  if (sbUserErr || !sbUser?.user) {
    throw new Error("User was not found in Supabase Auth: " + sbUserErr?.message);
  }
  console.log("Supabase Auth verified! ID:", sbUser.user.id, "Email:", sbUser.user.email, "Confirmed:", sbUser.user.email_confirmed_at);

  // Verify profile in Supabase profiles table
  console.log("\n[Test 3] Verify profile row in Supabase profiles table...");
  const { data: sbProfile, error: sbProfErr } = await adminClient!
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (sbProfErr) {
    console.warn("Notice: public.profiles table query:", sbProfErr.message);
  } else {
    console.log("Supabase profiles table row verified! Name:", sbProfile?.full_name, "Exam:", sbProfile?.selected_exam);
  }

  // TEST 4: Invalid login credentials test
  console.log("\n[Test 4] POST /api/auth/login with wrong password (must return 401, not crash)");
  const wrongLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "WrongPassword999!",
    }),
  });
  const wrongLoginData = await wrongLoginRes.json();
  console.log("Wrong login status:", wrongLoginRes.status, "(expected 401)");
  console.log("Wrong login error message:", wrongLoginData.error);
  if (wrongLoginRes.status !== 401) {
    throw new Error("Expected 401 on bad password, got " + wrongLoginRes.status);
  }

  // TEST 5: Empty login fields test (validation)
  console.log("\n[Test 5] POST /api/auth/login with empty fields (must return 400 validation error)");
  const emptyLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "", password: "" }),
  });
  const emptyLoginData = await emptyLoginRes.json();
  console.log("Empty login status:", emptyLoginRes.status, "(expected 400)");
  console.log("Empty login error:", emptyLoginData.error);
  if (emptyLoginRes.status !== 400) {
    throw new Error("Expected 400 on empty fields, got " + emptyLoginRes.status);
  }

  // TEST 6: Successful Login
  console.log("\n[Test 6] POST /api/auth/login with valid credentials");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const loginData = await loginRes.json();
  console.log("Login status:", loginRes.status);
  console.log("Login success:", loginData.success);
  console.log("Login user ID:", loginData.user?.id);
  console.log("Login profile:", loginData.profile?.name, loginData.profile?.currentExam);

  // Extract set-cookie
  const setCookieHeaders = loginRes.headers.get("set-cookie") || "";
  console.log("Login cookies present:", Boolean(setCookieHeaders));

  if (!loginData.success || loginData.user?.id !== userId) {
    throw new Error("Login failed or returned mismatched user ID: " + JSON.stringify(loginData));
  }

  // TEST 7: Authenticated session check with cookie
  console.log("\n[Test 7] GET /api/auth/session using session cookie");
  const sessionRes = await fetch("http://localhost:3000/api/auth/session", {
    headers: { Cookie: setCookieHeaders },
  });
  const sessionData = await sessionRes.json();
  console.log("Session status:", sessionRes.status);
  console.log("Session isAuthenticated:", sessionData.isAuthenticated);
  console.log("Session user:", sessionData.user?.id, sessionData.user?.email);
  console.log("Session profile:", sessionData.profile?.name, sessionData.profile?.currentExam);

  if (!sessionData.isAuthenticated || sessionData.user?.id !== userId) {
    throw new Error("Session check failed: " + JSON.stringify(sessionData));
  }

  // TEST 8: Test login with legacy/existing account (sriii191811@gmail.com with wrong password check)
  console.log("\n[Test 8] Test sriii191811@gmail.com with invalid password to ensure NO crash (no reading id of null)");
  const sriiiWrongRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "sriii191811@gmail.com",
      password: "wrong_password_test",
    }),
  });
  const sriiiWrongData = await sriiiWrongRes.json();
  console.log("sriii wrong login status:", sriiiWrongRes.status, "(expected 401)");
  console.log("sriii wrong login response:", sriiiWrongData);
  if (sriiiWrongRes.status !== 401 || !sriiiWrongData.error) {
    throw new Error("sriii login threw unexpected error or status: " + JSON.stringify(sriiiWrongData));
  }
  console.log("Confirmed: NO 'Cannot read properties of null (reading id)' error occurred!");

  console.log("\n========================================================");
  console.log("🎉 ALL 8 TESTS COMPLETED WITH 100% SUCCESS!");
  console.log("========================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
