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
  console.log("=== VERIFYING SESSION PERSISTENCE & ONBOARDING LOOP FIX ===");
  const timestamp = Date.now();
  const testEmail = `persistent_user_${timestamp}@gmail.com`;
  const testPassword = "Password123!";
  const testName = "Persistence Test Aspirant";
  const testExam = "tnpsc-group-4";

  // Step 1: Register account with target exam
  console.log("\n[Step 1] Register user with targetExamId:", testExam);
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
  if (!regData.success) {
    throw new Error("Registration failed: " + JSON.stringify(regData));
  }
  console.log("Registration succeeded! User ID:", regData.user.id);
  console.log("Registered onboardingCompleted:", regData.profile.onboardingCompleted);

  // Extract session cookies
  const cookieHeader = regRes.headers.get("set-cookie") || "";
  console.log("Session cookie set:", Boolean(cookieHeader.includes("prepstreak_session")));

  // Step 2: Query session multiple times (simulate navigation & refreshes)
  console.log("\n[Step 2] Simulate 3 consecutive page loads / refreshes with session cookie...");
  for (let i = 1; i <= 3; i++) {
    const sessionRes = await fetch("http://localhost:3000/api/auth/session", {
      headers: { Cookie: cookieHeader },
    });
    const sessionData = await sessionRes.json();
    console.log(`Fetch #${i}: isAuthenticated =`, sessionData.isAuthenticated, ", user =", sessionData.user?.email);
    console.log(`Fetch #${i}: exam =`, sessionData.profile?.examId, ", onboardingCompleted =", sessionData.profile?.onboardingCompleted);

    if (!sessionData.isAuthenticated) {
      throw new Error(`Session lost on fetch #${i}! Cookie was rejected.`);
    }
    if (!sessionData.profile?.onboardingCompleted) {
      throw new Error(`Onboarding was incorrectly marked false on fetch #${i}!`);
    }

    // Verify cookie was NOT deleted
    const setCookie = sessionRes.headers.get("set-cookie") || "";
    if (setCookie.includes("Max-Age=0") || setCookie.includes("deleted")) {
      throw new Error(`Cookie was deleted on fetch #${i}!`);
    }
  }

  // Step 3: Test PUT /api/profile updating target exam & onboarding
  console.log("\n[Step 3] Update target exam to 'ssc-cgl' via PUT /api/profile...");
  const updateRes = await fetch("http://localhost:3000/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      selected_exam: "ssc-cgl",
      selected_subject: "quantitative-aptitude",
      onboarding_completed: true,
      daily_question_goal: 25,
      preferred_difficulty: "Medium",
    }),
  });

  const updateData = await updateRes.json();
  console.log("Profile update success:", updateData.success);
  console.log("Updated examId:", updateData.profile?.examId);
  console.log("Updated onboardingCompleted:", updateData.profile?.onboardingCompleted);

  if (!updateData.success || updateData.profile?.examId !== "ssc-cgl" || !updateData.profile?.onboardingCompleted) {
    throw new Error("Profile update failed: " + JSON.stringify(updateData));
  }

  // Step 4: Verify session reflects the update and stays logged in
  console.log("\n[Step 4] Query /api/auth/session to confirm updated state...");
  const verifyRes = await fetch("http://localhost:3000/api/auth/session", {
    headers: { Cookie: cookieHeader },
  });
  const verifyData = await verifyRes.json();
  console.log("Verified isAuthenticated:", verifyData.isAuthenticated);
  console.log("Verified examId:", verifyData.profile?.examId);
  console.log("Verified onboardingCompleted:", verifyData.profile?.onboardingCompleted);

  if (verifyData.profile?.examId !== "ssc-cgl" || !verifyData.profile?.onboardingCompleted) {
    throw new Error("Session does not reflect updated exam or onboarding status!");
  }

  // Step 5: Test login again with the same credentials
  console.log("\n[Step 5] Log in again with the registered account...");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const loginData = await loginRes.json();
  console.log("Login success:", loginData.success);
  console.log("Login user ID:", loginData.user?.id);
  console.log("Login examId:", loginData.profile?.examId);
  console.log("Login onboardingCompleted:", loginData.profile?.onboardingCompleted);

  if (!loginData.success || !loginData.profile?.onboardingCompleted) {
    throw new Error("Login failed or onboarding completed was false upon re-login!");
  }

  // Step 6: Verify Supabase database record
  if (adminClient) {
    console.log("\n[Step 6] Verify Supabase database profiles row...");
    const { data: sbProf, error: sbErr } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", regData.user.id)
      .single();
    if (sbErr) console.warn("Supabase query warning:", sbErr.message);
    else {
      console.log("Supabase profiles table row confirmed!");
      console.log("Supabase selected_exam:", sbProf.selected_exam);
      console.log("Supabase full_name:", sbProf.full_name);
    }
  }

  console.log("\n========================================================");
  console.log("🎉 ALL PERSISTENCE AND ONBOARDING TESTS PASSED 100%!");
  console.log("========================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
