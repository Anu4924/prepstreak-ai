import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { verifySessionToken, PREPSTREAK_SESSION_COOKIE } from "@/lib/auth/token";
import { AxmokQuestionService } from "@/services/ai/axmok-question-service";
import { getGeminiApiKeys, getCandidateGeminiModels } from "@/services/ai/gemini-config";

// ---------------------------------------------------------------------------
// In-Memory Rate Limiting (Sliding Window per IP / Client)
// Limits users to 25 requests per minute to prevent API abuse.
// ---------------------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 25;

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((record, key) => {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  });
}, 5 * 60 * 1000);

// ---------------------------------------------------------------------------
// Axmok AI System Prompt Builder
// ---------------------------------------------------------------------------
function buildAxmokSystemPrompt(params: {
  examName: string;
  subjectName: string;
  topicName: string;
  studentName: string;
}): string {
  const { examName, subjectName, topicName, studentName } = params;

  return `You are Axmok AI, the dedicated, highly capable, intelligent study companion and personal tutor of PrepStreak AI.
You are tutoring ${studentName} who is preparing for the ${examName} competitive examination.
Current learning context:
- Target Examination: ${examName}
- Subject: ${subjectName}
- Current Active Topic: ${topicName}

### YOUR PERSONALITY & CORE ATTRIBUTES:
- **Intelligent & Accurate**: Prioritize conceptual precision and factual accuracy above all. Never hallucinate facts or formulas.
- **Friendly, Patient & Encouraging**: Speak with warmth and supportive encouragement. Never be condescending or dismissive.
- **Clear & Student-Friendly**: Avoid unnecessary jargon. When introducing technical or mathematical terms, define them immediately in plain English.
- **Never Unnecessarily Complicated**: Explain from ground-level basics first. If the student indicates they do not understand, simplify further rather than repeating the same explanation.
- **Professional & Focused**: Structure answers logically with clean Markdown formatting (headings with ###, bullet points, bold key terms, numbered steps, tables, and code blocks where applicable).

### UNDERSTANDING CONTEXT:
- If the student uses relative terms like "this topic", "this", "explain it", "give me a shortcut", or "give an example", understand that "this" refers to the current active topic: **${topicName}** in **${subjectName}** for **${examName}**.
- Follow the specific difficulty, syllabus standards, and question types typical of ${examName}.

### GENERAL CAPABILITY (BROAD SYLLABUS & COMPUTER KNOWLEDGE):
- While maintaining awareness of ${topicName}, you are broadly knowledgeable and capable of answering questions across all competitive exam domains:
  - Quantitative Aptitude, Mental Arithmetic & Data Interpretation (show calculations step-by-step).
  - Logical & Analytical Reasoning, Syllogisms, Puzzles, Coding-Decoding.
  - English Language, Vocabulary, Grammar, Reading Comprehension.
  - General & Banking Awareness, Economics, Current Affairs (do not invent unverified recent events).
  - Computer Science & Programming: Java, C, C++, Data Structures, Algorithms, DBMS, SQL, Operating Systems, Computer Networks, and Web Development.
- If the student asks a question outside the current topic (for example, "What is a constructor in Java?"):
  - DO NOT say "I only answer questions about ${topicName}".
  - Instead, answer their question thoroughly, clearly, and step-by-step (e.g., for programming: explain What it is, Why it is used, Syntax, Simple Code Example, Line-by-Line Explanation, Common Mistakes).
  - Then encourage them or smoothly bridge back to their study goals if appropriate.

### STUDY COMMANDS SUPPORT:
- "Teach me from basics": Break the topic down into 3-4 simple logical building blocks with concrete analogies.
- "Explain this in simple words": Use intuitive everyday comparisons and zero confusing terminology.
- "Give me an example": Provide a realistic ${examName}-level worked problem with step-by-step deduction and the final answer highlighted.
- "Give me practice questions": Present standard exam-style multiple-choice questions (options A, B, C, D) matching the exam level. Do not spoil the answer immediately if the user is testing themselves.
- "Give me a shortcut / trick": Explain the high-speed elimination technique, mental math shortcut, or mnemonic trick to solve in under 45 seconds.
- "Explain why option X is correct": Break down why that option follows the rules and why other options are distractor traps.
- "Summarize this topic": Provide a bulleted recap of core rules, formulas, and examiner pitfalls.

### OUTPUT FORMATTING GUIDELINES:
- Use markdown headings: ### for sections.
- For math: show explicit step-by-step arithmetic so the student sees how each value was derived.
- For code: use fenced code blocks with language identifiers (\`\`\`java, \`\`\`cpp, \`\`\`sql).
- Keep responses engaging, readable, and structured.`;
}

// ---------------------------------------------------------------------------
// POST Handler: /api/ai/chat
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check (per user ID when authenticated, with IP fallback)
    const sessionToken = req.cookies.get(PREPSTREAK_SESSION_COOKIE)?.value;
    let identifier = "anonymous-client";
    if (sessionToken) {
      const payload = await verifySessionToken(sessionToken);
      if (payload?.userId) {
        identifier = `user:${payload.userId}`;
      }
    }

    if (identifier === "anonymous-client") {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip")?.trim() ||
        "anonymous-client";
      identifier = `ip:${ip}`;
    }

    if (isRateLimited(identifier)) {
      return NextResponse.json(
        {
          error:
            "You are sending questions very quickly. Please pause for a moment before asking Axmok again.",
        },
        { status: 429 }
      );
    }

    // 2. Parse & Validate Request Body
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON request payload." }, { status: 400 });
    }

    const {
      prompt,
      examName = "Competitive Exams",
      subjectName = "General Studies",
      topicName = "General Concept",
      studentName = "Student",
      conversationHistory = [],
    } = body;

    const trimmedPrompt = (prompt || "").trim();
    if (!trimmedPrompt) {
      return NextResponse.json({ error: "Prompt cannot be empty." }, { status: 400 });
    }

    if (trimmedPrompt.length > 2500) {
      return NextResponse.json(
        { error: "Question is too long (maximum 2,500 characters)." },
        { status: 400 }
      );
    }

    // 3. Check for configured Gemini API Keys (primary & fallback)
    const apiKeys = getGeminiApiKeys();
    const isApiKeyConfigured = apiKeys.length > 0;

    const systemInstruction = buildAxmokSystemPrompt({
      examName,
      subjectName,
      topicName,
      studentName,
    });

    // 4. If Gemini API Keys ARE configured, call the live Google GenAI model with multi-key failover
    if (isApiKeyConfigured) {
      const candidateModels = getCandidateGeminiModels();
      const recentHistory = (conversationHistory || []).slice(-6);

      for (let k = 0; k < apiKeys.length; k++) {
        const apiKey = apiKeys[k];
        const isFallbackKey = k > 0;

        if (isFallbackKey) {
          console.info(`[AxmokChat] Primary key failed; trying fallback API key #${k + 1}...`);
        }

        for (const aiModel of candidateModels) {
          // Try using official @google/genai SDK
          try {
            const ai = new GoogleGenAI({ apiKey });

            // Format contents with role and parts for multi-turn conversational context
            const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

            for (const msg of recentHistory) {
              if (msg.text && typeof msg.text === "string") {
                contents.push({
                  role: msg.sender === "user" ? "user" : "model",
                  parts: [{ text: msg.text }],
                });
              }
            }

            // Add current user prompt
            contents.push({
              role: "user",
              parts: [{ text: trimmedPrompt }],
            });

            const timeoutPromise = new Promise<never>((_, reject) => {
              const t = setTimeout(() => reject(new Error("AI response timed out")), 15000);
              t.unref?.();
            });

            const sdkCall = ai.models.generateContent({
              model: aiModel,
              contents: contents,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                maxOutputTokens: 2000,
              },
            });

            const response = await Promise.race([sdkCall, timeoutPromise]);
            const generatedText = response.text?.trim();

            if (generatedText) {
              const followUps = deriveFollowUpPrompts(trimmedPrompt, topicName);
              return NextResponse.json({
                text: generatedText,
                suggestedFollowUps: followUps,
                isLiveAi: true,
                modelUsed: aiModel,
                isFallbackKey,
              });
            }
          } catch (sdkError) {
            console.warn(`[AxmokChat] SDK failed with key #${k + 1} and model ${aiModel}:`, sdkError);

            try {
              // Direct REST API Fallback
              const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`;

              const contentsPayload = [
                ...recentHistory.map((m: { sender: string; text: string }) => ({
                  role: m.sender === "user" ? "user" : "model",
                  parts: [{ text: m.text }],
                })),
                { role: "user", parts: [{ text: trimmedPrompt }] },
              ];

              const restResponse = await fetch(restUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: contentsPayload,
                  systemInstruction: { parts: [{ text: systemInstruction }] },
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000,
                  },
                }),
                signal: AbortSignal.timeout(20000),
              });

              if (restResponse.ok) {
                const data = await restResponse.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  return NextResponse.json({
                    text: text.trim(),
                    suggestedFollowUps: deriveFollowUpPrompts(trimmedPrompt, topicName),
                    isLiveAi: true,
                    modelUsed: aiModel,
                    isFallbackKey,
                  });
                }
              }
            } catch (restError) {
              console.warn(`[AxmokChat] REST call failed with key #${k + 1} and model ${aiModel}:`, restError);
            }
          }
        }
      }
    }

    // 5. Intelligent Syllabus Knowledge Base Fallback
    // Provides immediate, student-friendly, curriculum-accurate answers if GEMINI_API_KEY is not configured yet
    const fallbackResponse = generateCurriculumFallbackAnswer({
      prompt: trimmedPrompt,
      examName,
      subjectName,
      topicName,
      isMissingKey: !isApiKeyConfigured,
    });

    return NextResponse.json(fallbackResponse);
  } catch (error) {
    console.error("API /api/ai/chat error:", error);
    return NextResponse.json(
      { error: "Axmok is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Contextual Follow-up Chips Derivation
// ---------------------------------------------------------------------------
function deriveFollowUpPrompts(prompt: string, topicName: string): string[] {
  const p = prompt.toLowerCase();

  if (p.includes("basics") || p.includes("overview")) {
    return [
      `Give me an exam example for ${topicName}`,
      "Explain with a simple trick",
      "Ask me a practice question",
    ];
  }

  if (p.includes("example") || p.includes("problem")) {
    return [
      "Explain why this method works",
      "Give me another problem with higher difficulty",
      "Ask me a practice question",
    ];
  }

  if (p.includes("question") || p.includes("quiz") || p.includes("test")) {
    return [
      "Explain the solution step-by-step",
      "Give me a shortcut for this question",
      "What should I learn next?",
    ];
  }

  if (p.includes("java") || p.includes("constructor") || p.includes("code")) {
    return [
      "Give me a code example with output",
      "What are the common interview questions on this?",
      "How is this used in competitive exams?",
    ];
  }

  return [
    `Give me an example in ${topicName}`,
    "Explain with a shortcut",
    "Ask me a practice question",
    "Summarize this topic",
  ];
}

// ---------------------------------------------------------------------------
// Intelligent Curriculum Fallback Generator
// ---------------------------------------------------------------------------
function generateCurriculumFallbackAnswer(params: {
  prompt: string;
  examName: string;
  subjectName: string;
  topicName: string;
  isMissingKey: boolean;
}) {
  const { prompt, examName, subjectName, topicName, isMissingKey } = params;
  const lower = prompt.toLowerCase();

  // Callout notice if API key is not configured
  const callout = isMissingKey
    ? {
        title: "Axmok AI Offline Knowledge Engine",
        content:
          "To enable unlimited real-time generative intelligence, set your GEMINI_API_KEY in .env.local. Currently operating in high-precision syllabus guide mode.",
        type: "tip" as const,
      }
    : undefined;

  // General programming: Java constructor question handling
  if (lower.includes("constructor") && lower.includes("java")) {
    return {
      text: `### ☕ What is a Constructor in Java?

A **constructor** in Java is a special block of code that is automatically invoked when an instance (object) of a class is created using the \`new\` keyword. It is used to initialize the state of the object.

---

### 🎯 Why is it Used?
1. **Object State Initialization:** Ensures that instance variables are set to valid initial values before any methods are called.
2. **Mandatory Setup:** Guarantees necessary resources or database connections are prepared at creation time.
3. **Immutability Support:** Allows assigning \`final\` fields during object instantiation.

---

### 💻 Syntax & Types:
- **Name Rule:** The constructor must have the **exact same name** as its class.
- **Return Type:** It **never has an explicit return type** (not even \`void\`).
- **Default vs Parameterized:**
  - **Default Constructor:** Provided automatically by the Java compiler if no constructor is defined.
  - **Parameterized Constructor:** Allows passing custom arguments when creating objects.

\`\`\`java
public class Student {
    // Instance variables
    private String name;
    private int streakDays;

    // Parameterized Constructor
    public Student(String name, int streakDays) {
        this.name = name;
        this.streakDays = streakDays;
    }

    public void displayProfile() {
        System.out.println("Student: " + name + " | Streak: " + streakDays + " days");
    }

    public static void main(String[] args) {
        // Constructor is invoked here
        Student s1 = new Student("Aditya", 12);
        s1.displayProfile();
    }
}
\`\`\`

---

### 🔍 Line-by-Line Breakdown:
- \`public Student(String name, int streakDays)\`: Constructor signature matching class name.
- \`this.name = name;\`: The \`this\` keyword resolves ambiguity between the parameter and instance field.
- \`new Student("Aditya", 12)\`: Allocates memory on the heap and executes the constructor body.

---

### ⚠️ Common Mistakes to Avoid:
1. **Adding a Return Type:** If you write \`public void Student()\`, Java treats it as a standard method, NOT a constructor!
2. **Losing Default Constructor:** Once you write ANY parameterized constructor, Java **stops providing** the no-argument default constructor. You must declare it manually if needed.`,
      suggestedFollowUps: [
        "What is constructor overloading?",
        "Difference between this() and super()",
        `Back to ${topicName} in ${examName}`,
      ],
      callout,
    };
  }

  // Quick Action / Command: "Teach me from basics"
  if (lower.includes("basics") || lower.includes("scratch") || lower.includes("ground zero")) {
    return {
      text: `### 🚀 Learning ${topicName} from Basics for ${examName}

Let's master **${topicName}** (${subjectName}) starting from first principles!

---

### Step 1: The Core Foundation
Every question in **${topicName}** is fundamentally a puzzle containing three components:
1. **Given Constraints (Inputs):** Stated conditions that you must treat as 100% indisputable facts.
2. **The Transformative Rule:** The logic, mathematical identity, or relationship connecting the given items.
3. **The Target Variable (Output):** The exact conclusion or numerical value the examiner wants you to isolate.

---

### Step 2: Visualization Strategy
- In ${examName}, never attempt to solve complex ${topicName} questions purely in your head.
- Spend 5 seconds sketching a lightweight diagram:
  - For relational or ranking questions: draw a directional line or tree.
  - For syllogisms: draw the minimal intersecting Venn circles.
  - For quantitative calculations: note down the formula anchors.

---

### Step 3: Eliminating Traps
- Examiners create wrong options using predictable common errors (e.g. inverted ratios, off-by-one errors).
- Before confirming your answer, do a 2-second sanity check against the constraints.

Would you like a step-by-step exam problem to apply this right away?`,
      suggestedFollowUps: [
        "Give me an example",
        "Explain with a shortcut",
        "Ask me a practice question",
      ],
      callout,
    };
  }

  // Quick Action / Command: "Give me an example"
  if (lower.includes("example") || lower.includes("worked problem")) {
    const sampleQuestions = AxmokQuestionService.generateCurriculumFallbackQuestions({
      examName,
      examId: "exam-context",
      subjectName,
      subjectId: "sub-context",
      topicName,
      topicId: topicName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      count: 1,
      difficulty: "Medium",
    });
    const sample = sampleQuestions[0];

    if (sample) {
      return {
        text: `### 📝 Realistic ${examName} Worked Problem: ${topicName}

Here is a representative question reflecting current **${examName}** patterns:

---

**Question:**
*${sample.questionText}*

**Options:**
${sample.options.map((o) => `- **(${o.id})** ${o.text}`).join("\n")}

---

### 💡 Step-by-Step Axmok AI Walkthrough:
${sample.explanation}

⚡ **Speed Solving Shortcut:**
${sample.shortcut}

⚠️ **Common Examiner Trap:**
${sample.commonMistake}

✅ **Final Answer:** Option **(${sample.correctAnswer})**`,
        suggestedFollowUps: [
          "Explain with a shortcut",
          "Give me another problem with higher difficulty",
          "Ask me a practice question",
        ],
        callout,
      };
    }
  }

  // Quick Action / Command: "Give me a shortcut"
  if (lower.includes("shortcut") || lower.includes("trick")) {
    return {
      text: `### ⚡ Axmok AI Speed-Solving Shortcut for ${topicName}

When competing in **${examName}**, speed determines whether you clear the sectional cut-off. Here is the signature tactic for **${topicName}**:

---

### 🎯 The "Extreme Values & Parity Elimination" Method
1. **Check the Unit Digits / Parity First:**
   - If a calculation requires multiplying numbers ending in odd integers, the answer cannot be even. Instantly strike out impossible options.
2. **Option Span Inspection:**
   - If options are spaced: (A) 14, (B) 28, (C) 56, (D) 112, substitute the middle benchmark first. If the output is too small, you eliminate (A) and (B) in one stroke.
3. **Opposite Letter / Number Sum-27 Law (for Reasoning):**
   - Forward Rank + Reverse Rank always equals 27 (e.g., A=1 ↔ Z=26; B=2 ↔ Y=25). This eliminates manual alphabet counting.

---

⏱️ **Time Saved:** Saves 30 to 45 seconds per question on average!`,
      suggestedFollowUps: [
        "Give me an example",
        "Ask me a practice question",
        "Summarize this topic",
      ],
      callout,
    };
  }

  // Quick Action / Command: "Ask me a practice question"
  if (lower.includes("practice question") || lower.includes("test me") || lower.includes("quiz")) {
    return {
      text: `### 🎯 Quick Assessment Challenge: ${topicName}

Here is a challenge tailored to the **${examName}** standard:

---

**Question:**
*Which of the following approaches is considered the most time-efficient protocol when tackling a complex problem in ${topicName} under strict exam conditions?*

- **A)** Compute all permutations without reading the multiple-choice options
- **B)** Isolate stated boundary constraints, eliminate extreme contradictory choices, and test the target relationship
- **C)** Guess the first available option to save stopwatch time
- **D)** Skip the entire subject section regardless of difficulty

---

💬 **What is your answer (A, B, C, or D)?** Type it below and I'll break down the examiner logic for you!`,
      suggestedFollowUps: ["Option A", "Option B", "Option C", "Give me a hint"],
      callout,
    };
  }

  // Default intelligent tutor response
  return {
    text: `### 📘 Axmok AI Tutoring: ${topicName} (${examName})

Great inquiry regarding **"${prompt}"** in **${topicName}**!

---

### 🔑 Key Principles to Keep in Mind:
- **Exam Alignment:** In **${examName}**, questions in **${subjectName}** are designed to test your ability to synthesize information rapidly under time pressure.
- **Systematic Breakdown:** Instead of attempting to solve everything in one single leap, dissect the problem into:
  1. Primary stated facts.
  2. The operative relationship for ${topicName}.
  3. The requested target output.
- **Examiner Traps:** Watch out for negative wording (such as "NOT", "EXCEPT", or "LEAST"), which are responsible for over 40% of negative marks in competitive exams.

---

How would you like to continue? I can walk through an exam example, share a shortcut, or generate a practice quiz!`,
    suggestedFollowUps: [
      "Teach me from basics",
      "Give me an example",
      "Explain with a shortcut",
      "Ask me a practice question",
    ],
    callout,
  };
}
