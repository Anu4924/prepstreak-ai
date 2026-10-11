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

interface AuditResult {
  route: string;
  type: "PAGE" | "API" | "SECURITY";
  status: number;
  ok: boolean;
  notes?: string;
  durationMs: number;
}

const results: AuditResult[] = [];

async function auditFetch(url: string, options?: RequestInit, expectedStatus: number = 200): Promise<{ res: Response; data?: any }> {
  const start = Date.now();
  const res = await fetch(url, options);
  const durationMs = Date.now() - start;
  const ok = res.status === expectedStatus;

  let data;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      // ignore
    }
  }

  results.push({
    route: new URL(url).pathname,
    type: url.includes("/api/") ? "API" : "PAGE",
    status: res.status,
    ok,
    durationMs,
    notes: ok ? "Passed" : `Expected ${expectedStatus}, got ${res.status}`,
  });

  return { res, data };
}

async function runAudit() {
  console.log("================================================================================");
  console.log("🚀 STARTING PRE-LAUNCH FULL-SYSTEM AUDIT FOR PREPSTREAK AI");
  console.log("================================================================================\n");

  const baseUrl = "http://localhost:3000";

  // 1. PUBLIC PAGES AUDIT (Without Auth)
  console.log("--- 1. AUDITING PUBLIC PAGES ---");
  await auditFetch(`${baseUrl}/`, undefined, 200);
  await auditFetch(`${baseUrl}/login`, undefined, 200);
  await auditFetch(`${baseUrl}/register`, undefined, 200);

  // 2. SECURITY CHECK: Protected routes MUST redirect when logged out
  console.log("\n--- 2. AUDITING ROUTE PROTECTION & SECURITY (UNAUTHENTICATED) ---");
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/progress",
    "/learn",
    "/practice",
    "/tests",
    "/daily-challenge",
    "/streak",
    "/settings",
  ];

  for (const route of protectedRoutes) {
    const start = Date.now();
    const res = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
    const durationMs = Date.now() - start;
    const isRedirect = res.status === 307 || res.status === 302 || res.status === 308;
    const location = res.headers.get("location") || "";
    const ok = isRedirect && location.includes("/login");

    results.push({
      route,
      type: "SECURITY",
      status: res.status,
      ok,
      durationMs,
      notes: ok ? `Redirects to ${location}` : `Expected redirect to /login, got ${res.status}`,
    });
  }

  // 3. AUTHENTICATION: Log in with test account to get valid session
  console.log("\n--- 3. AUTHENTICATING AUDIT SESSION ---");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "sriii191811@gmail.com",
      password: "Password123!", // or fallback if wrong
    }),
  });

  let sessionCookie = loginRes.headers.get("set-cookie") || "";
  let loginUser = "sriii191811@gmail.com";

  if (!loginRes.ok) {
    // If password differed, create a fresh verified test account for the audit
    console.log("Provisioning audit session user...");
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Launch Auditor",
        email: `launch_auditor_${Date.now()}@prepstreak.ai`,
        password: "AuditPassword123!",
        confirmPassword: "AuditPassword123!",
        targetExamId: "ssc-cgl",
      }),
    });
    sessionCookie = regRes.headers.get("set-cookie") || "";
    loginUser = "launch_auditor";
  }

  const authHeaders = { Cookie: sessionCookie };

  // 4. AUDITING PROTECTED USER PAGES (WITH AUTHENTICATION)
  console.log("\n--- 4. AUDITING AUTHENTICATED PAGES ---");
  await auditFetch(`${baseUrl}/dashboard`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/learn`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/practice`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/tests`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/progress`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/daily-challenge`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/streak`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/profile`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/settings`, { headers: authHeaders }, 200);

  // 5. AUDITING DYNAMIC EXAM & SYLLABUS PAGES
  console.log("\n--- 5. AUDITING DYNAMIC EXAM & SYLLABUS MODULES ---");
  await auditFetch(`${baseUrl}/exams/ssc-cgl`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/exams/sbi-po`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/exams/rrb-ntpc`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/exams/tnpsc-group-4`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/exams/ssc-cgl/quantitative-aptitude`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/exams/ssc-cgl/quantitative-aptitude/percentage/learn`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/exams/ssc-cgl/quantitative-aptitude/percentage/practice`, { headers: authHeaders }, 200);

  // 6. AUDITING BACKEND API ENDPOINTS
  console.log("\n--- 6. AUDITING BACKEND API ENDPOINTS ---");
  await auditFetch(`${baseUrl}/api/auth/session`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/api/profile`, { headers: authHeaders }, 200);
  await auditFetch(`${baseUrl}/api/practice`, { headers: authHeaders }, 200);

  // Test recording practice attempt
  const postPracticeStart = Date.now();
  const practicePostRes = await fetch(`${baseUrl}/api/practice`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: "ssc-cgl",
      subjectId: "quantitative-aptitude",
      topicId: "percentage",
      topicName: "Percentage",
      totalQuestions: 5,
      score: 4,
      accuracy: 80,
      timeSpentSeconds: 120,
    }),
  });
  results.push({
    route: "/api/practice (POST attempt)",
    type: "API",
    status: practicePostRes.status,
    ok: practicePostRes.ok,
    durationMs: Date.now() - postPracticeStart,
    notes: practicePostRes.ok ? "Recorded practice attempt successfully" : "Failed to record practice",
  });

  // Test AI question generation endpoint
  console.log("\n--- 7. AUDITING QUESTION GENERATION ENGINE ---");
  const genStart = Date.now();
  const genRes = await fetch(`${baseUrl}/api/ai/practice/generate`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      examId: "ssc-cgl",
      examName: "SSC CGL",
      subjectId: "quantitative-aptitude",
      subjectName: "Quantitative Aptitude",
      topicId: "percentage",
      topicName: "Percentage",
      difficulty: "Medium",
      count: 5,
    }),
  });
  const genData = await genRes.json().catch(() => null);
  results.push({
    route: "/api/ai/practice/generate (POST)",
    type: "API",
    status: genRes.status,
    ok: genRes.ok && Boolean(genData?.questions?.length > 0),
    durationMs: Date.now() - genStart,
    notes: genRes.ok
      ? `Generated ${genData?.questions?.length || 0} questions for SSC CGL Percentage`
      : `Question generation returned ${genRes.status}`,
  });

  // 7. PRINT SUMMARY REPORT TABLE
  console.log("\n================================================================================");
  console.log("📊 PRE-LAUNCH AUDIT SUMMARY REPORT");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const symbol = r.ok ? "✅ PASS" : "❌ FAIL";
    console.log(`${symbol} | [${r.type.padEnd(8)}] | ${r.route.padEnd(45)} | ${String(r.status).padEnd(3)} | ${r.durationMs}ms | ${r.notes || ""}`);
    if (r.ok) passed++;
    else failed++;
  }

  console.log("--------------------------------------------------------------------------------");
  console.log(`TOTAL AUDITED: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
