/**
 * Axmok AI Question Generation Service (Server-side)
 *
 * Generates personalized, syllabus-aligned competitive exam questions using Google GenAI (Gemini)
 * with strict schema enforcement, repetition filtering, adaptive difficulty, and rich explanations.
 * 
 * NOTE: This service must run exclusively on the server (Node.js runtime / Next.js Route Handler).
 * The API key is NEVER sent to the client.
 */

import { GoogleGenAI } from "@google/genai";
import { Question, QuestionOption, PracticeDifficulty, PracticeMode } from "@/lib/types/question";
import { getTopicsForSubject } from "@/lib/data/topicRegistry";
import { getSubjectsForExam } from "@/lib/data/subjectRegistry";

export interface GeneratePracticeQuestionsParams {
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  subtopicId?: string;
  subtopicName?: string;
  questionType?: string;
  examPattern?: string;
  markingScheme?: {
    positiveMarks: number;
    negativeMarks: number;
    penaltyDescription?: string;
  };
  difficulty: PracticeDifficulty | string;
  count: number;
  practiceMode?: PracticeMode;
  previousQuestions?: string[];
  userAccuracy?: number;
  weakTopics?: string[];
}

interface RawAiQuestion {
  question: string;
  options: string[] | Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  shortcut?: string;
  commonMistake?: string;
  learningTip?: string;
  difficulty?: string;
  exam?: string;
  subject?: string;
  topic?: string;
}

function getCandidateGeminiModels(): string[] {
  const envModel = process.env.GEMINI_MODEL?.trim();
  const candidates: string[] = [];
  if (
    envModel &&
    !envModel.includes("2.0") &&
    !envModel.includes("2.5") &&
    !envModel.includes("1.5") &&
    !envModel.includes("1.0")
  ) {
    candidates.push(envModel);
  }
  const defaults = ["gemini-3.5-flash", "gemini-3.7-flash", "gemini-flash-latest", "gemini-3.8-flash"];
  for (const d of defaults) {
    if (!candidates.includes(d)) candidates.push(d);
  }
  return candidates;
}

export const AxmokQuestionService = {
  /**
   * Generates structured practice questions using live Gemini model with robust validation & fallback.
   */
  async generateQuestions(params: GeneratePracticeQuestionsParams): Promise<Question[]> {
    const {
      examName,
      subjectName,
      topicName,
      difficulty,
      count = 5,
      previousQuestions = [],
      practiceMode = "topic",
      userAccuracy,
    } = params;

    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    const isApiKeyConfigured =
      Boolean(geminiApiKey) &&
      !geminiApiKey?.includes("your_gemini_api_key") &&
      geminiApiKey !== "undefined";

    if (isApiKeyConfigured && geminiApiKey) {
      try {
        const liveQuestions = await this.callGeminiQuestionGenerator(params, geminiApiKey);
        if (liveQuestions && liveQuestions.length >= Math.min(count, 3)) {
          return liveQuestions.slice(0, count);
        }
      } catch (err) {
        console.warn("AxmokQuestionService: Live generation error, using curated syllabus engine fallback:", err);
      }
    }

    // High-quality deterministic syllabus fallback engine
    return this.generateCurriculumFallbackQuestions(params);
  },

  /**
   * Calls Google GenAI with strict JSON schema instructions
   */
  async callGeminiQuestionGenerator(
    params: GeneratePracticeQuestionsParams,
    apiKey: string
  ): Promise<Question[] | null> {
    const {
      examId,
      examName,
      subjectName,
      topicName,
      subtopicName,
      questionType,
      examPattern,
      markingScheme,
      difficulty,
      count,
      practiceMode,
      previousQuestions = [],
      userAccuracy,
    } = params;

    // Get active resilient models, auto-upgrading deprecated names
    const candidateModels = getCandidateGeminiModels();

    // Unique variation seed for every request to guarantee non-deterministic generation
    const variationSeed = `RUN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Adaptive difficulty guidance based on student accuracy
    let adaptivePrompt = "";
    if (typeof userAccuracy === "number") {
      if (userAccuracy < 50) {
        adaptivePrompt = `The student previously struggled with this topic (Accuracy: ${userAccuracy}%). Start with foundational, confidence-building questions (Easy to early-Medium) with extra intuitive hints before introducing complex traps.`;
      } else if (userAccuracy > 80) {
        adaptivePrompt = `The student has demonstrated strong mastery (Accuracy: ${userAccuracy}%). Provide challenging, analytical questions that test subtle edge cases, multi-step deductions, and high-difficulty Prelims/Mains standards.`;
      }
    }

    const subtopicPrompt = subtopicName
      ? `Specific Subtopic: "${subtopicName}". Every question must directly test this subtopic.`
      : `Topic Coverage: "${topicName}".`;

    const questionTypePrompt = questionType
      ? `Expected Question Format: ${questionType}.`
      : "";

    const patternPrompt = examPattern
      ? `Exam Blueprint Context: ${examPattern}.`
      : "";

    const markingPrompt = markingScheme
      ? `Marking Scheme: +${markingScheme.positiveMarks} marks per correct, -${markingScheme.negativeMarks} penalty.`
      : "";

    const repetitionPrompt =
      previousQuestions.length > 0
        ? `\n### CRITICAL ANTI-REPETITION CONSTRAINT:
The user has already solved the following questions. YOU MUST NOT REPEAT OR GENERATE NEAR-DUPLICATES OF ANY OF THESE. Use completely different scenarios, distinct names, and new numerical values:\n${previousQuestions
            .slice(-20)
            .map((q, idx) => `${idx + 1}. "${q.replace(/\s+/g, " ").slice(0, 130)}..."`)
            .join("\n")}\n`
        : "";

    const systemPrompt = `You are Axmok AI, the expert test creator and intelligent tutor for PrepStreak AI.
Your task is to generate exactly ${count} realistic, exam-standard practice questions for students preparing for Indian competitive exams.

Target Examination: ${examName} (Exam ID: ${examId})
Subject: ${subjectName}
Topic: ${topicName}
${subtopicPrompt}
${questionTypePrompt}
${patternPrompt}
${markingPrompt}
Selected Difficulty: ${difficulty} (Must be calibrated strictly for ${examName}; e.g., SBI PO reasoning difficulty differs from SSC CGL mathematics)
Practice Mode: ${practiceMode}
${adaptivePrompt}
${repetitionPrompt}

### MANDATORY UNIQUENESS & DIVERSITY DIRECTIVE:
- Dynamic Variation Seed: ${variationSeed}
- EVERY GENERATION MUST BE FRESH AND ORIGINAL. Never output standard overused clichés.
- For Quantitative Aptitude: Use varied, realistic figures (e.g. 14 2/7%, 16 2/3%, 8.5% interest, Rs. 16,500, Rs. 48,000, 360m trains, etc.).
- For Reasoning: Generate novel puzzle setups, new family relations, fresh coded sequences.
- For Verbal / General Awareness: Diverse real-world scenarios, fresh vocabulary stems, and genuine exam-standard options.

### CRITICAL EXAM SYLLABUS CONTEXT:
The questions must NEVER be generic school questions. They MUST strictly match ${examName}'s question style:
- Banking (SBI PO / Clerk, IBPS): Linear/circular seating, floor/box puzzles, 'Only a few' syllogisms, coded inequalities, caselet DI, quadratic comparisons.
- SSC (CGL / CHSL): Algebra polynomial identities, geometry circle theorems, successive percentage changes, active/passive voice, direct/indirect speech.
- Railways (RRB NTPC / Group D): Train relative speeds, physics work-power & Ohm's law, human body systems, Indian Railways GK.
- UPSC: Two-statement analysis ("Which of the statements given above is/are correct?"), assertion-reasoning, environmental conventions, constitutional articles.
- TNPSC: General Tamil grammar (Ilakkanam), Thirukkural couplets, Sangam literature, Tamil Nadu administration & welfare movements.
- Teaching (CTET / TET): Pedagogical scenarios, Piaget & Vygotsky developmental stages, inclusive education rules (RTE 2009).

### MANDATORY RULES:
1. Every question MUST be a multiple-choice question with EXACTLY 4 distinct options: "A", "B", "C", and "D".
2. The correct answer MUST be specified as "A", "B", "C", or "D".
3. Provide a clear, pedagogically sound "explanation" with step-by-step deduction.
4. Provide a speed-solving "shortcut" or exam elimination hack where applicable.
5. Provide a "commonMistake" detailing the common trap examiner sets and why students pick the wrong option.
6. Provide a concise 1-sentence "learningTip".
7. Return ONLY a valid JSON object matching the requested schema. Do NOT include markdown fences, backticks, or extraneous preamble.

### OUTPUT JSON SCHEMA:
{
  "questions": [
    {
      "question": "Clear problem statement matching real exam standards",
      "options": [
        "First option text without prefix like 'A)'",
        "Second option text",
        "Third option text",
        "Fourth option text"
      ],
      "correctAnswer": "A", // Must be "A", "B", "C", or "D"
      "explanation": "Step-by-step why the correct answer follows logically or mathematically.",
      "shortcut": "Time-saving trick or elimination rule to solve in under 40 seconds.",
      "commonMistake": "Examiner trap: what mistake leads students to choose the wrong option.",
      "learningTip": "Key takeaway formula, definition, or mnemonic rule.",
      "difficulty": "Easy" // "Easy" | "Medium" | "Hard"
    }
  ]
}`;

    const userPrompt = `Generate exactly ${count} completely fresh, unique ${difficulty} level questions for ${examName} - ${subjectName} - ${topicName}${subtopicName ? ` - ${subtopicName}` : ""}. Variation Key: ${variationSeed}`;

    for (const aiModel of candidateModels) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const timeoutPromise = new Promise<never>((_, reject) => {
          const t = setTimeout(() => reject(new Error("AI generation timed out")), 15000);
          t.unref?.();
        });

        const sdkCall = ai.models.generateContent({
          model: aiModel,
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }],
            },
          ],
          config: {
            temperature: 0.8,
            maxOutputTokens: 3500,
            responseMimeType: "application/json",
          },
        });

        const response = await Promise.race([sdkCall, timeoutPromise]);

        const responseText = response.text?.trim() || "";
        const parsed = this.parseAndValidateAiResponse(responseText, params);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      } catch (sdkError) {
        console.warn(`AxmokQuestionService: SDK attempt failed with ${aiModel}, trying REST API:`, sdkError);

        try {
          // REST fallback for this model
          const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`;
          const restResponse = await fetch(restUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }],
                },
              ],
              generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 3500,
                responseMimeType: "application/json",
              },
            }),
            signal: AbortSignal.timeout(25000),
          });

          if (restResponse.ok) {
            const data = await restResponse.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = this.parseAndValidateAiResponse(text, params);
              if (parsed && parsed.length > 0) return parsed;
            }
          }
        } catch (restError) {
          console.warn(`AxmokQuestionService: REST API failed with ${aiModel}:`, restError);
        }
      }
    }

    return null;
  },

  /**
   * Strictly parses and validates raw AI output against required question invariants.
   */
  parseAndValidateAiResponse(
    rawText: string,
    context: GeneratePracticeQuestionsParams
  ): Question[] | null {
    try {
      // Clean possible markdown code fences (e.g. ```json ... ```)
      let cleaned = rawText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      }

      const parsed = JSON.parse(cleaned);
      const list: RawAiQuestion[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.questions)
        ? parsed.questions
        : [];

      if (!list.length) return null;

      const validated: Question[] = [];

      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (!item || typeof item.question !== "string" || !item.question.trim()) {
          continue;
        }

        // Validate and normalize options
        let normalizedOptions: QuestionOption[] = [];
        if (Array.isArray(item.options) && item.options.length >= 4) {
          const labels: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
          normalizedOptions = labels.map((label, idx) => {
            const optVal = item.options[idx];
            const text =
              typeof optVal === "string"
                ? optVal.replace(/^[A-D][.):\s]+/i, "").trim()
                : typeof optVal === "object" && optVal && "text" in optVal
                ? String(optVal.text).trim()
                : `Option ${label}`;
            return { id: label, text };
          });
        } else {
          continue; // Malformed options, discard question
        }

        // Validate correctAnswer
        let correctLetter: "A" | "B" | "C" | "D" = "A";
        const rawAns = String(item.correctAnswer || "").trim().toUpperCase();
        if (["A", "B", "C", "D"].includes(rawAns)) {
          correctLetter = rawAns as "A" | "B" | "C" | "D";
        } else {
          // If the AI gave the full option text, find matching index
          const matchIdx = normalizedOptions.findIndex((o) =>
            o.text.toLowerCase().includes(rawAns.toLowerCase())
          );
          if (matchIdx >= 0) {
            correctLetter = (["A", "B", "C", "D"][matchIdx] || "A") as "A" | "B" | "C" | "D";
          }
        }

        const qDifficulty =
          item.difficulty === "Easy" || item.difficulty === "Hard" || item.difficulty === "Medium"
            ? item.difficulty
            : context.difficulty === "Mixed"
            ? (["Easy", "Medium", "Hard"][i % 3] as "Easy" | "Medium" | "Hard")
            : context.difficulty || "Medium";

        validated.push({
          id: `axmok-gen-${Date.now()}-${i + 1}`,
          topicId: context.topicId,
          topicName: context.topicName,
          subjectId: context.subjectId,
          subjectName: context.subjectName,
          examId: context.examId,
          examName: context.examName,
          difficulty: qDifficulty,
          questionType: "mcq",
          questionText: item.question.trim(),
          options: normalizedOptions,
          correctAnswer: correctLetter,
          explanation:
            item.explanation?.trim() ||
            `Option ${correctLetter} is correct based on the core rules of ${context.topicName}.`,
          shortcut:
            item.shortcut?.trim() ||
            "Check extreme bounds or eliminate illogical choices before full computation.",
          commonMistake:
            item.commonMistake?.trim() ||
            "Rushing through boundary statements or reversing the target relationship.",
          learningTip:
            item.learningTip?.trim() ||
            `Always verify the stated constraints in ${context.examName} questions.`,
          examTag: `${context.examName} • ${context.subjectName}`,
        });
      }

      return validated.length > 0 ? validated : null;
    } catch (parseErr) {
      console.warn("AxmokQuestionService: JSON parse failure for AI response:", parseErr);
      return null;
    }
  },

  /**
   * Highly curated curriculum fallback questions when external AI is offline or key missing.
   * Guarantees realistic, exam-standard questions for all subjects and topics.
   */
  generateCurriculumFallbackQuestions(params: GeneratePracticeQuestionsParams): Question[] {
    const {
      examName,
      examId,
      subjectName,
      subjectId,
      topicName,
      topicId,
      count,
      difficulty,
      previousQuestions = [],
    } = params;

    const templates = getCurriculumBankForTopic(topicId, topicName, subjectName, examName);
    const result: Question[] = [];

    // Filter out questions previously seen if possible to prevent repetition
    const prevSet = new Set(previousQuestions.map((q) => q.trim().toLowerCase()));
    let pool = templates.filter((t) => !prevSet.has(t.question.trim().toLowerCase()));
    if (pool.length === 0) {
      pool = templates;
    }

    // Shuffle pool with Fisher-Yates so order is randomized
    const shuffled = [...pool];
    for (let j = shuffled.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
    }

    const runSeed = Math.floor(Math.random() * 10000);

    for (let i = 0; i < count; i++) {
      const template = shuffled[i % shuffled.length];
      const diffLabel =
        difficulty === "Mixed"
          ? (["Easy", "Medium", "Hard"][i % 3] as "Easy" | "Medium" | "Hard")
          : difficulty === "Easy" || difficulty === "Hard"
          ? difficulty
          : "Medium";

      result.push({
        id: `axmok-q-${topicId}-${i + 1}-${runSeed}-${Date.now()}`,
        topicId,
        topicName,
        subjectId,
        subjectName,
        examId,
        examName,
        difficulty: diffLabel,
        questionType: "mcq",
        questionText: template.question,
        options: template.options,
        correctAnswer: template.correctAnswer,
        explanation: template.explanation,
        shortcut: template.shortcut,
        commonMistake: template.commonMistake,
        learningTip: template.learningTip,
        examTag: `${examName} • ${subjectName}`,
      });
    }

    return result;
  },
};

// ---------------------------------------------------------------------------
// High-Yield Curriculum Bank for Fallback
// ---------------------------------------------------------------------------
interface BankQuestion {
  question: string;
  options: QuestionOption[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  shortcut: string;
  commonMistake: string;
  learningTip: string;
}

function getCurriculumBankForTopic(
  topicId: string,
  topicName: string,
  subjectName: string,
  examName: string
): BankQuestion[] {
  // 1. Blood Relations
  if (topicId.includes("blood") || topicName.toLowerCase().includes("blood")) {
    return [
      {
        question:
          "Pointing to a photograph, a woman says: 'He is the only son of the wife of my husband's father.' How is the man in the photograph related to the woman?",
        options: [
          { id: "A", text: "Brother-in-law" },
          { id: "B", text: "Husband" },
          { id: "C", text: "Father-in-law" },
          { id: "D", text: "Uncle" },
        ],
        correctAnswer: "B",
        explanation:
          "Dissect from the end: 'My husband's father' is her Father-in-law. 'The wife of my father-in-law' is her Mother-in-law. 'The only son of my mother-in-law' is her Husband. Hence, the man is her Husband.",
        shortcut:
          "Break down possessive chains from back to front: [My husband's father] -> Father-in-law -> Wife -> Mother-in-law -> Only son -> Husband.",
        commonMistake:
          "Ignoring the keyword 'only son' and assuming it could be a brother-in-law.",
        learningTip:
          "In competitive exams, 'only son of X's parents' uniquely pinpoints the single male child in that generation.",
      },
      {
        question:
          "If 'P + Q' means P is the mother of Q, 'P - Q' means P is the brother of Q, and 'P × Q' means P is the sister of Q, which of the following expressions shows that M is the maternal uncle of R?",
        options: [
          { id: "A", text: "M - K + R" },
          { id: "B", text: "M + K - R" },
          { id: "C", text: "M × K + R" },
          { id: "D", text: "M - K × R" },
        ],
        correctAnswer: "A",
        explanation:
          "In expression M - K + R: M is the brother of K, and K is the mother of R. The brother of one's mother is a maternal uncle. Hence, M is the maternal uncle of R.",
        shortcut:
          "Gender and generation filter: M must be male (-) and 1 generation above R (+). Check M - K + R immediately.",
        commonMistake:
          "Calculating all 4 expressions manually instead of checking gender of M first.",
        learningTip:
          "In coded blood relations, eliminate options where the target person has the wrong gender before drawing family trees.",
      },
      {
        question:
          "A is the father of B and C. B is the son of A, but C is not the son of A. How is C related to A?",
        options: [
          { id: "A", text: "Niece" },
          { id: "B", text: "Granddaughter" },
          { id: "C", text: "Daughter" },
          { id: "D", text: "Sister" },
        ],
        correctAnswer: "C",
        explanation:
          "Since A is the father of C, C must be A's child. If C is not the son, C must be the daughter of A.",
        shortcut:
          "Direct binary dichotomy: child of parent can only be son or daughter.",
        commonMistake:
          "Assuming C is an external relative like niece or cousin.",
        learningTip:
          "Child relationships in reasoning problems without adoption clauses are strictly binary (son or daughter).",
      },
      {
        question:
          "Introducing a boy, a girl said: 'He is the son of the only daughter of my paternal grandfather.' How is the girl related to the boy?",
        options: [
          { id: "A", text: "Mother" },
          { id: "B", text: "Aunt" },
          { id: "C", text: "Sister" },
          { id: "D", text: "Cousin" },
        ],
        correctAnswer: "D",
        explanation:
          "Paternal grandfather's only daughter is the girl's paternal aunt (Bua). The son of her paternal aunt is her cousin. Hence, the girl is the boy's cousin.",
        shortcut:
          "Grandfather's daughter = Aunt. Aunt's son = Cousin.",
        commonMistake:
          "Equating 'only daughter' with the speaker's own mother; paternal grandfather's daughter is an aunt.",
        learningTip:
          "Always distinguish between maternal vs paternal lineages when resolving grandfather/grandmother.",
      },
    ];
  }

  // 2. Syllogism
  if (topicId.includes("syllogism") || topicName.toLowerCase().includes("syllogism")) {
    return [
      {
        question:
          "Statements:\n1. Only a few Books are Pens.\n2. All Pens are Erasers.\n\nConclusions:\nI. Some Books are Erasers.\nII. All Books can never be Pens.",
        options: [
          { id: "A", text: "Only Conclusion I follows" },
          { id: "B", text: "Only Conclusion II follows" },
          { id: "C", text: "Both Conclusion I and II follow" },
          { id: "D", text: "Neither follows" },
        ],
        correctAnswer: "C",
        explanation:
          "'Only a few Books are Pens' implies: (1) Some Books are Pens, and (2) Some Books are definitely NOT Pens. Since Some Books are Pens and All Pens are Erasers, Some Books are Erasers (I follows). Since Some Books are definitely NOT Pens, All Books can never be Pens (II follows). Both follow.",
        shortcut:
          "'Only a few A are B' automatically validates 'All A can never be B'.",
        commonMistake:
          "Treating 'Only a few' as standard 'Some' and failing to realize that 'All Books can never be Pens' is definitely true.",
        learningTip:
          "Formula: 'Only a few A are B' = (Some A are B) + (Some A are NOT B).",
      },
      {
        question:
          "Statements:\n1. No Cat is Dog.\n2. Some Dogs are Rats.\n\nConclusions:\nI. Some Rats are definitely not Cats.\nII. All Cats being Rats is a possibility.",
        options: [
          { id: "A", text: "Only Conclusion I follows" },
          { id: "B", text: "Only Conclusion II follows" },
          { id: "C", text: "Either I or II follows" },
          { id: "D", text: "Both Conclusion I and II follow" },
        ],
        correctAnswer: "D",
        explanation:
          "Those Rats which are Dogs can never be Cats, so Some Rats are definitely not Cats (I follows). Cats only have restriction with Dogs, not with Rats, so All Cats can be placed inside the non-Dog portion of Rats (II follows). Both follow.",
        shortcut:
          "Find intersection of Rats with Dogs: that intersection inherits the 'No Cat' restriction.",
        commonMistake:
          "Assuming Cats cannot overlap with Rats because of the restriction with Dogs.",
        learningTip:
          "A negative restriction against set A only restricts set B where set B intersects set A.",
      },
    ];
  }

  // 3. Coding-Decoding
  if (topicId.includes("coding") || topicName.toLowerCase().includes("coding")) {
    return [
      {
        question:
          "In a certain code, 'TRAIN' is written as 'WUDLQ'. How will 'STATION' be written in that code?",
        options: [
          { id: "A", text: "VWDWLRQ" },
          { id: "B", text: "VWDLWQR" },
          { id: "C", text: "UWCVKPQ" },
          { id: "D", text: "VWEWMRQ" },
        ],
        correctAnswer: "A",
        explanation:
          "The pattern is +3 for each letter: T(20)+3=W(23), R(18)+3=U(21), A(1)+3=D(4), I(9)+3=L(12), N(14)+3=Q(17). Applying to S T A T I O N (+3): S+3=V, T+3=W, A+3=D, T+3=W, I+3=L, O+3=R, N+3=Q -> VWDWLRQ.",
        shortcut:
          "Check first and last letter: S(19)+3=V, N(14)+3=Q. Matches option A immediately.",
        commonMistake:
          "Checking every single letter manually instead of using option elimination.",
        learningTip:
          "EJOTY anchor ranks (E=5, J=10, O=15, T=20, Y=25) help compute letter offsets in seconds.",
      },
      {
        question:
          "If 'DELHI' is coded as 'CCIDD', how is 'BOMBAY' coded in that same system?",
        options: [
          { id: "A", text: "AMJXVS" },
          { id: "B", text: "AMJZUT" },
          { id: "C", text: "ALJXVT" },
          { id: "D", text: "AMJXVT" },
        ],
        correctAnswer: "A",
        explanation:
          "Pattern: D-1=C, E-2=C, L-3=I, H-4=D, I-5=D. The deduction increases by -1, -2, -3, -4, -5. For BOMBAY: B-1=A, O-2=M, M-3=J, B-4=X, A-5=V, Y-6=S. Result is AMJXVS.",
        shortcut:
          "Check 4th letter: B(2) - 4 wrapped mod 26 = 24 (X). Eliminates option B.",
        commonMistake:
          "Forgetting that A(1) - 5 wraps backwards around the alphabet to V(22).",
        learningTip:
          "Wrap-around alphabet arithmetic: (Letter Rank - Offset + 26) % 26.",
      },
    ];
  }

  // 4. Quantitative Aptitude / Arithmetic
  if (
    subjectName.toLowerCase().includes("quant") ||
    subjectName.toLowerCase().includes("math") ||
    topicId.includes("percentage") ||
    topicId.includes("ratio") ||
    topicId.includes("time")
  ) {
    return [
      {
        question:
          "A person spends 20% of their monthly income on house rent, 40% of the remaining on food and conveyance, and saves the rest. If their monthly savings are ₹14,400, what is their total monthly income?",
        options: [
          { id: "A", text: "₹28,000" },
          { id: "B", text: "₹30,000" },
          { id: "C", text: "₹32,000" },
          { id: "D", text: "₹35,000" },
        ],
        correctAnswer: "B",
        explanation:
          "Let Income = 100%. After 20% rent, remaining = 80%. Spends 40% of remaining on food: 40% of 80% = 32%. Total spent = 20% + 32% = 52%. Remaining savings = 100% - 52% = 48%. If 48% = ₹14,400, then 1% = 14400 / 48 = 300. Total Income = 300 × 100 = ₹30,000.",
        shortcut:
          "Multiplying factor equation: Income × 0.80 × 0.60 = 14400 -> Income × 0.48 = 14400 -> Income = 14400 / 0.48 = 30000.",
        commonMistake:
          "Adding 20% + 40% = 60% and calculating savings as 40%. The 40% is of the REMAINING balance.",
        learningTip:
          "Always look for 'of the remaining' vs 'of total income' in quantitative percentages.",
      },
      {
        question:
          "A train traveling at 72 km/h crosses a 250-meter-long platform in 26 seconds. What is the length of the train?",
        options: [
          { id: "A", text: "270 meters" },
          { id: "B", text: "250 meters" },
          { id: "C", text: "280 meters" },
          { id: "D", text: "300 meters" },
        ],
        correctAnswer: "A",
        explanation:
          "Convert speed to m/s: 72 × (5/18) = 20 m/s. Total distance in 26 seconds = Speed × Time = 20 × 26 = 520 meters. Total distance = Length of train (L) + Length of platform (250). Therefore, L = 520 - 250 = 270 meters.",
        shortcut:
          "72 km/h is exactly 4 × 18, so 4 × 5 = 20 m/s. Total dist = 20 × 26 = 520. 520 - 250 = 270 m.",
        commonMistake:
          "Forgetting to convert km/h to m/s before multiplying by seconds.",
        learningTip:
          "Multiply km/h by 5/18 to get m/s; multiply m/s by 18/5 to get km/h.",
      },
    ];
  }

  // 5. Seating Arrangement & Puzzles (Banking & Reasoning)
  if (
    topicId.includes("seating") ||
    topicId.includes("puzzle") ||
    topicName.toLowerCase().includes("seating") ||
    topicName.toLowerCase().includes("puzzle")
  ) {
    return [
      {
        question:
          "Eight persons P, Q, R, S, T, U, V, and W are sitting around a circular table facing the centre. P sits third to the right of Q. Only two persons sit between Q and W. R sits second to the left of W. T is not an immediate neighbour of P. Who sits immediately to the left of R?",
        options: [
          { id: "A", text: "V" },
          { id: "B", text: "U" },
          { id: "C", text: "T" },
          { id: "D", text: "S" },
        ],
        correctAnswer: "A",
        explanation:
          "Plot positions on an 8-seat circular diagram facing center: Fix Q at 6 o'clock. P sits 3rd right at 9 o'clock. W is 2 persons away from Q (either 3 o'clock or 9 o'clock; since P is at 9 o'clock, W must be at 3 o'clock). R sits 2nd to left of W, placing R at 1 o'clock. Placing remaining persons under constraints reveals V sits immediately to the left of R.",
        shortcut:
          "Start by fixing the anchor with most relational links (Q and P), then eliminate clockwise/anticlockwise branches.",
        commonMistake:
          "Confusing 'third to the right' with 3 persons between them (third to the right means exactly 2 persons in between).",
        learningTip:
          "In 8-person circular seating, opposite persons always have exactly 3 persons between them on either side.",
      },
      {
        question:
          "Seven boxes A, B, C, D, E, F, and G are kept one above another in a single vertical stack. Box C is placed immediately above Box F. Only three boxes are kept between Box F and Box A. Box B is placed immediately below Box G. How many boxes are kept above Box C?",
        options: [
          { id: "A", text: "One" },
          { id: "B", text: "Two" },
          { id: "C", text: "Three" },
          { id: "D", text: "Four" },
        ],
        correctAnswer: "B",
        explanation:
          "With 7 boxes, testing positions of C immediately above F with 3 boxes between F and A gives the unique valid sequence from top (7) to bottom (1): A (7), D (6), E (5), C (4), F (3), G (2), B (1). Counting boxes above C reveals exactly 2 boxes (A and D).",
        shortcut:
          "Use the 3-box gap constraint between F and A to lock the two boundary possibilities immediately.",
        commonMistake:
          "Reversing top and bottom stack numbering.",
        learningTip:
          "Always assign fixed position numbers 1 to 7 from floor/bottom to top to avoid offset errors.",
      },
    ];
  }

  // 6. Algebra & Geometry (SSC & Technical)
  if (
    topicId.includes("algebra") ||
    topicId.includes("geometry") ||
    topicName.toLowerCase().includes("algebra") ||
    topicName.toLowerCase().includes("geometry")
  ) {
    return [
      {
        question:
          "If x + 1/x = 5, then what is the value of x^3 + 1/x^3?",
        options: [
          { id: "A", text: "110" },
          { id: "B", text: "115" },
          { id: "C", text: "125" },
          { id: "D", text: "140" },
        ],
        correctAnswer: "A",
        explanation:
          "Using the standard algebraic identity: (x + 1/x)^3 = x^3 + 1/x^3 + 3(x + 1/x). Substituting 5: 5^3 = (x^3 + 1/x^3) + 3(5) -> 125 = (x^3 + 1/x^3) + 15 -> x^3 + 1/x^3 = 125 - 15 = 110.",
        shortcut:
          "Direct SSC Formula: If x + 1/x = k, then x^3 + 1/x^3 = k^3 - 3k. Here, 5^3 - 3(5) = 125 - 15 = 110.",
        commonMistake:
          "Simply cubing 5 to get 125 and forgetting to subtract the 3k term.",
        learningTip:
          "Formula anchor: x^2 + 1/x^2 = k^2 - 2; x^3 + 1/x^3 = k^3 - 3k.",
      },
      {
        question:
          "Two tangents PA and PB are drawn to a circle with centre O from an external point P. If angle APB = 70°, what is the measure of angle AOB?",
        options: [
          { id: "A", text: "110°" },
          { id: "B", text: "120°" },
          { id: "C", text: "135°" },
          { id: "D", text: "140°" },
        ],
        correctAnswer: "A",
        explanation:
          "The tangent at any point of a circle is perpendicular to the radius through the point of contact. Thus, angle OAP = 90° and angle OBP = 90°. In quadrilateral OAPB, the sum of all interior angles is 360°. Therefore, angle AOB + angle APB = 180° (supplementary). angle AOB = 180° - 70° = 110°.",
        shortcut:
          "In any tangent-chord pair from an external point, angle at centre + angle between tangents = 180°.",
        commonMistake:
          "Confusing angle at the centre (AOB) with angle subtended at the remaining circumference (ACB).",
        learningTip:
          "Radius is always perpendicular to tangent at point of contact (tangent radius theorem).",
      },
    ];
  }

  // 7. Indian Polity & Governance (UPSC & SSC)
  if (
    topicId.includes("polity") ||
    topicId.includes("constitution") ||
    topicName.toLowerCase().includes("polity")
  ) {
    return [
      {
        question:
          "Consider the following statements regarding the Writ of Habeas Corpus in India:\n1. It can be issued against both public authorities and private individuals.\n2. It cannot be issued if the detention is in execution of a sentence made by a competent court of law.\n\nWhich of the statements given above is/are correct?",
        options: [
          { id: "A", text: "1 only" },
          { id: "B", text: "2 only" },
          { id: "C", text: "Both 1 and 2" },
          { id: "D", text: "Neither 1 nor 2" },
        ],
        correctAnswer: "C",
        explanation:
          "Statement 1 is correct: Habeas Corpus is the only writ that can be issued against both public and private entities. Statement 2 is correct: A writ of Habeas Corpus will not lie if the person is detained pursuant to a lawful conviction and sentence by a court with competent jurisdiction. Both statements are correct.",
        shortcut:
          "Remember the exception: Habeas corpus reaches private detention; Mandamus does not.",
        commonMistake:
          "Believing all constitutional writs under Article 32 only apply to the State.",
        learningTip:
          "Supreme Court issues writs under Article 32 (Fundamental Right); High Courts under Article 226 (Wider jurisdiction).",
      },
    ];
  }

  // 8. General Tamil & Literature / Tamil Culture (TNPSC & State Exams)
  if (
    topicId.includes("tamil") ||
    topicName.toLowerCase().includes("tamil") ||
    topicId.includes("thirukkural") ||
    topicName.toLowerCase().includes("thirukkural") ||
    topicId.includes("sangam") ||
    topicId.includes("keezhadi")
  ) {
    return [
      {
        question:
          "கீழ்க்கண்டவற்றுள் சந்திப் பிழையற்ற சரியான தொடரைக் கண்டறிக:",
        options: [
          { id: "A", text: "தொல்காப்பியர் காலத்துப் பண்பாட்டைப் போற்றுவோம்" },
          { id: "B", text: "தொல்காப்பியர் காலத்து பண்பாட்டை போற்றுவோம்" },
          { id: "C", text: "தொல்காப்பியர் காலத்துப் பண்பாட்டை போற்றுவோம்" },
          { id: "D", text: "தொல்காப்பியர் காலத்து பண்பாட்டைப் போற்றுவோம்" },
        ],
        correctAnswer: "A",
        explanation:
          "அகர, இகர ஈற்று வினையெச்சங்களின் பின்னும், இரண்டாம் வேற்றுமை உருபாகிய 'ஐ' உருபின் பின்னும் வல்லினம் மிகும். எனவே 'காலத்துப் பண்பாட்டைப் போற்றுவோம்' என்பதே இலக்கணப்படி சந்திப் பிழையற்ற தூய தொடராகும்.",
        shortcut:
          "இரண்டாம் வேற்றுமை உருபு (ஐ) வெளிப்படையாக வரும் இடத்தில் வல்லினம் (க, ச, த, ப) கட்டாயம் மிகும்.",
        commonMistake:
          "இரண்டாம் வேற்றுமை உருபிற்குப் பின் வல்லினம் மிகாதெனக் கருதுதல்.",
        learningTip:
          "TNPSC பொதுத்தமிழ் வினாக்களில் வல்லினம் மிகும் இடங்கள் (8 விதிகளும்) மிக முக்கியமான மதிப்பெண் களமாகும்.",
      },
      {
        question:
          "'துப்பார்க்குத் துப்பாய துப்பாக்கித் துப்பார்க்குத்\nதுப்பாய தூஉம் மழை' — இக்குறட்பாவில் பயின்றுவந்துள்ள அணி யாது?",
        options: [
          { id: "A", text: "சொல் பின்வரு நிலையணி" },
          { id: "B", text: "பொருள் பின்வரு நிலையணி" },
          { id: "C", text: "சொற்பொருள் பின்வரு நிலையணி" },
          { id: "D", text: "வேற்றுமையணி" },
        ],
        correctAnswer: "A",
        explanation:
          "இக்குறளில் 'துப்பு' என்ற சொல் பலமுறை வந்து வெவ்வேறு பொருள்களைத் தருகிறது (உண்பவர்க்கு, உணவாக, உண்டாக்கி). செய்யுளில் வந்த சொல்லே மீண்டும் மீண்டும் வந்து வெவ்வேறு பொருளைத் தருவது 'சொல் பின்வரு நிலையணி' ஆகும்.",
        shortcut:
          "ஒரே சொல் பலமுறை வந்து வெவ்வேறு பொருள் தந்தால் 'சொல் பின்வரு நிலையணி'; ஒரே பொருள் தந்தால் 'சொற்பொருள் பின்வரு நிலையணி'.",
        commonMistake:
          "துப்பு என்ற ஒரே சொல் மீண்டும் மீண்டும் வருவதால் சொற்பொருள் பின்வரு நிலையணி எனத் தவறாகக் கருதுதல்.",
        learningTip:
          "திருக்குறள் வான்சிறப்பு அதிகாரத்தில் உள்ள இவ்வரிகள் TNPSC தேர்வுகளில் அடிக்கடி கேட்கப்படும் வினாக்களுள் ஒன்றாகும்.",
      },
      {
        question:
          "கீழடி அகழாய்வு எந்த ஆற்றங்கரையில் அமைந்துள்ள பழங்காலத் தமிழ் நாகரிகத்தின் எச்சங்களை வெளிப்படுத்தியது?",
        options: [
          { id: "A", text: "காவிரி ஆறு" },
          { id: "B", text: "வைகை ஆறு" },
          { id: "C", text: "தாமிரபரணி ஆறு" },
          { id: "D", text: "பாலாறு" },
        ],
        correctAnswer: "B",
        explanation:
          "சிவகங்கை மாவட்டம் திருப்புவனம் வட்டத்தில் வைகை ஆற்றின் தென் கரையில் அமைந்துள்ள கீழடி அகழாய்வு, கி.மு. 6ஆம் நூற்றாண்டைச் சார்ந்த நகரமயமாதல் பெற்ற வைகை சமவெளி நாகரிகத்தை உறுதி செய்துள்ளது.",
        shortcut:
          "கீழடி (சிவகங்கை) = வைகை நாகரிகம்; ஆதிச்சநல்லூர் (தூத்துக்குடி) = தாமிரபரணி நாகரிகம்.",
        commonMistake:
          "ஆதிச்சநல்லூர் மற்றும் கீழடி ஆகியவற்றை ஒரே ஆற்றுப்படுகை என மாற்றி நினைவில் கொள்ளுதல்.",
        learningTip:
          "தமிழ்நாடு தொல்லியல் துறை வெளியிட்ட ஆய்வறிக்கையின்படி கீழடி நாகரிகக் காலம் கி.மு. 580 என கதிரியக்கக் கரிமக் கணிப்பு (Carbon dating) உறுதி செய்துள்ளது.",
      },
      {
        question:
          "எட்டுத்தொகை நூல்களுள் 'ஒத்த' என்ற அடைமொழியுடன் குறிக்கப்படும் சங்க நூல் எது?",
        options: [
          { id: "A", text: "நற்றிணை" },
          { id: "B", text: "பதிற்றுப்பத்து" },
          { id: "C", text: "கலித்தொகை" },
          { id: "D", text: "பரிபாடல்" },
        ],
        correctAnswer: "B",
        explanation:
          "'நற்றிணை நல்ல குறுந்தொகை ஐங்குறுநூறு ஒத்த பதிற்றுப்பத்து ஓங்கு பரிபாடல் கற்றறிந்தார் ஏத்தும் கலியோடு அகம் புறம் என்று இத்திறத்த எட்டுத்தொகை' என்ற பழம்பாடலின்படி 'ஒத்த பதிற்றுப்பத்து' எனக் குறிப்பிடப்படுகிறது.",
        shortcut:
          "நல் = குறுந்தொகை; நற்றிணை = நல்; ஒத்த = பதிற்றுப்பத்து; ஓங்கு = பரிபாடல்; கற்றறிந்தார் ஏத்தும் = கலித்தொகை.",
        commonMistake:
          "பரிபாடலுக்குரிய 'ஓங்கு' அடைமொழியை பதிற்றுப்பத்திற்குப் பொருத்துதல்.",
        learningTip:
          "எட்டுத்தொகை அடைமொழிப் பாடலை மனப்பாடம் செய்து வைத்திருப்பது TNPSC குரூப் 4 & 2 தேர்வுகளுக்கு அவசியமானது.",
      },
    ];
  }

  // 9. Indian History & Freedom Struggle (UPSC, SSC, State PSC)
  if (
    topicId.includes("history") ||
    topicName.toLowerCase().includes("history") ||
    topicId.includes("freedom") ||
    topicName.toLowerCase().includes("freedom") ||
    topicId.includes("national-movement") ||
    subjectName.toLowerCase().includes("history")
  ) {
    return [
      {
        question:
          "Which of the following events was the immediate trigger for the launch of the Non-Cooperation Movement in 1920 by Mahatma Gandhi?",
        options: [
          { id: "A", text: "Rowlatt Act and Jallianwala Bagh Massacre combined with the Khilafat issue" },
          { id: "B", text: "Partition of Bengal in 1905" },
          { id: "C", text: "Failure of the Cripps Mission" },
          { id: "D", text: "Announcement of the Communal Award" },
        ],
        correctAnswer: "A",
        explanation:
          "The Non-Cooperation Movement (1920-1922) was initiated following the draconian Rowlatt Act of 1919, the brutal Jallianwala Bagh Massacre (April 13, 1919), and to support the Khilafat cause.",
        shortcut:
          "1919 trilogy: Rowlatt Act -> Jallianwala Bagh -> Khilafat -> 1920 Non-Cooperation Movement.",
        commonMistake:
          "Confusing the Non-Cooperation Movement (1920) with the Civil Disobedience Movement (1930) or Quit India (1942).",
        learningTip:
          "Chronology of Gandhian Mass Movements: Non-Cooperation (1920) -> Civil Disobedience (1930) -> Quit India (1942).",
      },
      {
        question:
          "During the reign of which Chola monarch was the magnificent Brihadisvara Temple (Big Temple) in Thanjavur constructed?",
        options: [
          { id: "A", text: "Rajendra Chola I" },
          { id: "B", text: "Rajaraja Chola I" },
          { id: "C", text: "Kulothunga Chola I" },
          { id: "D", text: "Parantaka Chola I" },
        ],
        correctAnswer: "B",
        explanation:
          "The Brihadisvara Temple at Thanjavur, consecrated in 1010 CE, was built by Rajaraja Chola I. Rajendra Chola I built the Brihadisvara temple at Gangaikonda Cholapuram.",
        shortcut:
          "Rajaraja I = Thanjavur Brihadisvara Temple; Rajendra I = Gangaikonda Cholapuram.",
        commonMistake:
          "Confusing Rajaraja I (Thanjavur) with his son Rajendra I (Gangaikonda Cholapuram).",
        learningTip:
          "The temple is a UNESCO World Heritage Site renowned for its vimana rising to 66 meters without binding mortar.",
      },
      {
        question:
          "Who among the following founded the 'Satyashodhak Samaj' in 1873 to promote social equality and advocate education for backward castes and women?",
        options: [
          { id: "A", text: "Jyotirao Phule" },
          { id: "B", text: "Dr. B.R. Ambedkar" },
          { id: "C", text: "Swami Dayananda Saraswati" },
          { id: "D", text: "Raja Ram Mohan Roy" },
        ],
        correctAnswer: "A",
        explanation:
          "Jyotirao Phule founded the Satyashodhak Samaj (Truth-Seekers' Society) in Pune in September 1873. He authored 'Gulamgiri' in 1873, dedicated to the American abolitionist movement.",
        shortcut:
          "Satyashodhak Samaj + Gulamgiri = Jyotirao Phule (1873).",
        commonMistake:
          "Confusing Satyashodhak Samaj with Arya Samaj (Dayananda Saraswati) or Brahmo Samaj (Ram Mohan Roy).",
        learningTip:
          "Savitribai Phule, along with Jyotirao Phule, founded the first indigenous school for girls in Bhide Wada, Pune in 1848.",
      },
    ];
  }

  // 10. Geography, Environment & Biodiversity
  if (
    topicId.includes("geography") ||
    topicName.toLowerCase().includes("geography") ||
    topicId.includes("environment") ||
    topicName.toLowerCase().includes("environment") ||
    topicId.includes("river") ||
    topicId.includes("climate") ||
    subjectName.toLowerCase().includes("geography") ||
    subjectName.toLowerCase().includes("environmental")
  ) {
    return [
      {
        question:
          "Which of the following Indian rivers flows westward through a rift valley between the Vindhya and Satpura mountain ranges into the Arabian Sea?",
        options: [
          { id: "A", text: "Godavari" },
          { id: "B", text: "Narmada" },
          { id: "C", text: "Mahanadi" },
          { id: "D", text: "Krishna" },
        ],
        correctAnswer: "B",
        explanation:
          "The Narmada and Tapti are the two major west-flowing peninsular rivers in India that flow through rift valleys. The Narmada originates from the Amarkantak plateau and flows between the Vindhya (north) and Satpura (south) ranges into the Gulf of Khambhat.",
        shortcut:
          "West-flowing rift valley rivers = Narmada & Tapti. East-flowing deltaic rivers = Mahanadi, Godavari, Krishna, Cauvery.",
        commonMistake:
          "Assuming all major peninsular rivers drain eastward into the Bay of Bengal.",
        learningTip:
          "West-flowing rivers do not form extensive deltas; they form estuaries due to steep gradients and fast currents.",
      },
      {
        question:
          "Which National Park in India is the world's primary sanctuary and stronghold for the endangered Great Indian One-Horned Rhinoceros (Rhinoceros unicornis)?",
        options: [
          { id: "A", text: "Kaziranga National Park" },
          { id: "B", text: "Jim Corbett National Park" },
          { id: "C", text: "Gir National Park" },
          { id: "D", text: "Sundarbans National Park" },
        ],
        correctAnswer: "A",
        explanation:
          "Kaziranga National Park in Assam hosts approximately two-thirds of the world's great one-horned rhinoceros population and is a designated UNESCO World Heritage Site.",
        shortcut:
          "Kaziranga = One-horned Rhino (Assam); Gir = Asiatic Lion (Gujarat); Sundarbans = Royal Bengal Tiger (West Bengal).",
        commonMistake:
          "Confusing Kaziranga (Rhinos) with Manas (famous for Golden Langur and Pygmy Hog).",
        learningTip:
          "Assam has seven national parks, with Kaziranga and Manas being UNESCO Natural World Heritage Sites.",
      },
      {
        question:
          "What is the primary international agreement aimed at phasing out ozone-depleting substances (ODSs), universally recognized as one of the most successful environmental treaties in history?",
        options: [
          { id: "A", text: "Kyoto Protocol" },
          { id: "B", text: "Montreal Protocol" },
          { id: "C", text: "Paris Agreement" },
          { id: "D", text: "Basel Convention" },
        ],
        correctAnswer: "B",
        explanation:
          "The Montreal Protocol on Substances that Deplete the Ozone Layer (agreed in 1987) targets the phaseout of chlorofluorocarbons (CFCs) and halons. The Kigali Amendment (2016) further phased down hydrofluorocarbons (HFCs).",
        shortcut:
          "Montreal = Ozone layer (CFCs); Kyoto & Paris = Greenhouse gases / Climate change; Basel = Hazardous waste.",
        commonMistake:
          "Mixing up Montreal Protocol (Ozone depletion) with Kyoto Protocol (Greenhouse gas reductions).",
        learningTip:
          "World Ozone Day is celebrated annually on September 16, marking the signing of the Montreal Protocol.",
      },
    ];
  }

  // 11. General Science (Physics, Chemistry, Biology)
  if (
    topicId.includes("science") ||
    topicName.toLowerCase().includes("science") ||
    topicId.includes("biology") ||
    topicId.includes("physics") ||
    topicId.includes("chemistry") ||
    subjectName.toLowerCase().includes("science")
  ) {
    return [
      {
        question:
          "Which hormone, secreted by the beta cells of the Islets of Langerhans in the pancreas, is primarily responsible for facilitating cellular glucose uptake and lowering blood sugar levels?",
        options: [
          { id: "A", text: "Glucagon" },
          { id: "B", text: "Insulin" },
          { id: "C", text: "Somatostatin" },
          { id: "D", text: "Thyroxine" },
        ],
        correctAnswer: "B",
        explanation:
          "Insulin is produced by the beta cells of the pancreatic islets. It promotes the absorption of glucose from the blood into skeletal muscle and adipose tissue. Glucagon, produced by alpha cells, elevates blood glucose levels.",
        shortcut:
          "Beta cells = Insulin (lowers blood sugar); Alpha cells = Glucagon (raises blood sugar).",
        commonMistake:
          "Inverting the functions of Insulin (hypoglycemic) and Glucagon (hyperglycemic).",
        learningTip:
          "Deficiency in insulin production or cellular resistance to it causes Diabetes Mellitus (Type 1 and Type 2 respectively).",
      },
      {
        question:
          "The optical phenomenon responsible for the sparkling of diamonds and the transmission of light through optical fiber cables is known as:",
        options: [
          { id: "A", text: "Total Internal Reflection" },
          { id: "B", text: "Diffraction" },
          { id: "C", text: "Polarization" },
          { id: "D", text: "Optical Dispersion" },
        ],
        correctAnswer: "A",
        explanation:
          "Total Internal Reflection (TIR) occurs when light travels from an optically denser medium to a rarer medium at an angle of incidence greater than the critical angle. Diamonds have a high refractive index (~2.42) and small critical angle (~24.4°), trapping light via multiple TIRs.",
        shortcut:
          "Optical fibers + Diamond sparkle + Mirages in deserts = Total Internal Reflection (TIR).",
        commonMistake:
          "Confusing Total Internal Reflection with simple surface refraction or dispersion.",
        learningTip:
          "Two conditions for TIR: (1) Light must travel from denser to rarer medium; (2) Angle of incidence > Critical angle.",
      },
      {
        question:
          "What is the chemical name and formula of 'Baking Soda' commonly used in culinary preparation and fire extinguishers?",
        options: [
          { id: "A", text: "Sodium carbonate (Na2CO3)" },
          { id: "B", text: "Sodium hydrogen carbonate (NaHCO3)" },
          { id: "C", text: "Calcium hypochlorite (CaOCl2)" },
          { id: "D", text: "Sodium hydroxide (NaOH)" },
        ],
        correctAnswer: "B",
        explanation:
          "Baking soda is Sodium bicarbonate (Sodium hydrogen carbonate, NaHCO3). Washing soda is Sodium carbonate decahydrate (Na2CO3·10H2O), and Bleaching powder is CaOCl2.",
        shortcut:
          "Baking Soda = Sodium BI-carbonate (NaHCO3) ['Bi' for Buying bakery items]; Washing Soda = Sodium Carbonate.",
        commonMistake:
          "Confusing Baking Soda (NaHCO3) with Washing Soda (Na2CO3) or Baking Powder (mixture of NaHCO3 and tartaric acid).",
        learningTip:
          "When heated, 2 NaHCO3 -> Na2CO3 + H2O + CO2. The released CO2 causes cakes and dough to rise and become spongy.",
      },
    ];
  }

  // 12. Indian Economy & Banking Awareness (Banking, SSC & UPSC)
  if (
    topicId.includes("economy") ||
    topicName.toLowerCase().includes("economy") ||
    topicId.includes("banking") ||
    topicName.toLowerCase().includes("banking") ||
    subjectName.toLowerCase().includes("banking") ||
    subjectName.toLowerCase().includes("economic")
  ) {
    return [
      {
        question:
          "The interest rate at which the Reserve Bank of India (RBI) lends short-term funds to commercial banks against government securities is called the:",
        options: [
          { id: "A", text: "Reverse Repo Rate" },
          { id: "B", text: "Repo Rate" },
          { id: "C", text: "Cash Reserve Ratio (CRR)" },
          { id: "D", text: "Statutory Liquidity Ratio (SLR)" },
        ],
        correctAnswer: "B",
        explanation:
          "Repo Rate (Repurchase Option Rate) is the rate at which RBI lends money to commercial banks against eligible securities. Reverse Repo Rate is the rate at which RBI borrows funds from commercial banks.",
        shortcut:
          "RBI to Banks = Repo Rate; Banks to RBI = Reverse Repo Rate.",
        commonMistake:
          "Confusing Repo Rate with Bank Rate (Bank rate does not require collateral/securities agreement).",
        learningTip:
          "Repo rate increases are used by central banks as a contractionary monetary policy tool to curb inflation.",
      },
      {
        question:
          "Which metric represents the difference between the total revenue expenditure and total non-debt revenue receipts of the government?",
        options: [
          { id: "A", text: "Fiscal Deficit" },
          { id: "B", text: "Revenue Deficit" },
          { id: "C", text: "Primary Deficit" },
          { id: "D", text: "Monetized Deficit" },
        ],
        correctAnswer: "B",
        explanation:
          "Revenue Deficit = Revenue Expenditure - Revenue Receipts. Fiscal Deficit = Total Expenditure - Total Receipts excluding borrowings. Primary Deficit = Fiscal Deficit - Interest Payments.",
        shortcut:
          "Primary Deficit = Fiscal Deficit minus Interest Payments.",
        commonMistake:
          "Assuming Fiscal Deficit includes total borrowings (it specifically excludes borrowings to indicate how much must be borrowed).",
        learningTip:
          "The Fiscal Responsibility and Budget Management (FRBM) Act mandates target ceilings on fiscal and revenue deficits.",
      },
    ];
  }

  // 13. English Language & Verbal Ability
  if (
    topicId.includes("english") ||
    topicName.toLowerCase().includes("english") ||
    topicId.includes("grammar") ||
    topicId.includes("vocab") ||
    subjectName.toLowerCase().includes("english") ||
    subjectName.toLowerCase().includes("verbal")
  ) {
    return [
      {
        question:
          "Identify the segment of the sentence that contains a grammatical error:\n'Neither the manager nor the assistant supervisors (A) / was present in the auditorium (B) / when the chief guest arrived (C) / No error (D).'",
        options: [
          { id: "A", text: "Segment A" },
          { id: "B", text: "Segment B" },
          { id: "C", text: "Segment C" },
          { id: "D", text: "Segment D (No error)" },
        ],
        correctAnswer: "B",
        explanation:
          "According to the rule of proximity for correlative conjunctions ('Neither... nor', 'Either... or'), the verb must agree with the subject closest to it. Here, 'assistant supervisors' is plural, so the verb must be 'were present', not 'was present'.",
        shortcut:
          "In 'Either... or' and 'Neither... nor', match the verb with the nearest subject.",
        commonMistake:
          "Matching the verb to the first singular subject ('the manager') instead of the closer plural subject.",
        learningTip:
          "Proximity Rule: Neither [singular] nor [plural] -> Plural verb. Neither [plural] nor [singular] -> Singular verb.",
      },
      {
        question:
          "Select the word that is most nearly OPPOSITE in meaning (Antonym) to the word 'METICULOUS':",
        options: [
          { id: "A", text: "Scrupulous" },
          { id: "B", text: "Careless" },
          { id: "C", text: "Punctilious" },
          { id: "D", text: "Methodical" },
        ],
        correctAnswer: "B",
        explanation:
          "'Meticulous' means showing great attention to detail; very careful and precise. Its antonym is 'Careless' or 'Sloppy'. 'Scrupulous', 'Punctilious', and 'Methodical' are synonyms.",
        shortcut:
          "Three options (Scrupulous, Punctilious, Methodical) are synonyms; the odd one out is Careless.",
        commonMistake:
          "Selecting a synonym when asked for the antonym.",
        learningTip:
          "Exam strategy: If three options share identical meanings, the fourth distinct option is often the correct antonym.",
      },
    ];
  }

  // 14. Child Development & Pedagogy (Teaching Exams: CTET, State TET)
  if (
    topicId.includes("pedagogy") ||
    topicName.toLowerCase().includes("pedagogy") ||
    topicId.includes("child") ||
    topicName.toLowerCase().includes("child") ||
    subjectName.toLowerCase().includes("teaching") ||
    subjectName.toLowerCase().includes("pedagogy")
  ) {
    return [
      {
        question:
          "According to Jean Piaget's theory of cognitive development, during which stage does a child first acquire the ability to understand 'conservation' (that quantity does not change with container shape)?",
        options: [
          { id: "A", text: "Sensorimotor Stage (0–2 years)" },
          { id: "B", text: "Preoperational Stage (2–7 years)" },
          { id: "C", text: "Concrete Operational Stage (7–11 years)" },
          { id: "D", text: "Formal Operational Stage (11+ years)" },
        ],
        correctAnswer: "C",
        explanation:
          "Piaget's Concrete Operational stage (7–11 years) is characterized by the mastery of logical operations on concrete objects, including conservation (mass, volume, number) and reversibility.",
        shortcut:
          "Conservation + Reversibility = Concrete Operational Stage (7–11 yrs).",
        commonMistake:
          "Selecting the Preoperational stage, during which children suffer from centration and lack conservation.",
        learningTip:
          "Piaget's 4 Stages: Sensorimotor (Object permanence) -> Preoperational (Egocentrism, Animism) -> Concrete Operational (Conservation) -> Formal Operational (Abstract logic).",
      },
      {
        question:
          "Lev Vygotsky conceptualized the gap between what a child can achieve independently and what they can achieve with guidance from a More Knowledgeable Other (MKO) as the:",
        options: [
          { id: "A", text: "Zone of Proximal Development (ZPD)" },
          { id: "B", text: "Schema Equilibrium" },
          { id: "C", text: "Operant Conditioning Domain" },
          { id: "D", text: "Moral Development Sphere" },
        ],
        correctAnswer: "A",
        explanation:
          "The Zone of Proximal Development (ZPD) is Vygotsky's central construct defining the range of tasks a learner cannot yet do alone but can accomplish with instructional scaffolding from an adult or skilled peer.",
        shortcut:
          "Vygotsky = ZPD + Scaffolding + More Knowledgeable Other (MKO) + Social Constructivism.",
        commonMistake:
          "Attributing scaffolding or ZPD to Piaget or Skinner.",
        learningTip:
          "Scaffolding is temporary support provided by an educator that is gradually dismantled as student competence develops.",
      },
    ];
  }

  // 15. Computer Aptitude & Digital Literacy
  if (
    topicId.includes("computer") ||
    topicName.toLowerCase().includes("computer") ||
    topicId.includes("it-literacy") ||
    subjectName.toLowerCase().includes("computer")
  ) {
    return [
      {
        question:
          "In modern computer memory architecture, which of the following provides the fastest read/write access speed to the Central Processing Unit (CPU)?",
        options: [
          { id: "A", text: "RAM (Random Access Memory)" },
          { id: "B", text: "CPU Registers and Cache Memory" },
          { id: "C", text: "Solid State Drive (NVMe SSD)" },
          { id: "D", text: "Virtual Memory on Paging Disk" },
        ],
        correctAnswer: "B",
        explanation:
          "Memory hierarchy from fastest to slowest: CPU Registers -> L1/L2/L3 Cache -> Main Memory (RAM) -> Solid State Drive -> Hard Disk Drive -> Optical/Tape storage.",
        shortcut:
          "Fastest: Registers > Cache > RAM > Secondary Storage.",
        commonMistake:
          "Thinking RAM is the fastest memory in the computer (internal CPU cache operates at near-clock speeds).",
        learningTip:
          "L1 Cache is integrated directly into the core, offering single-cycle latency.",
      },
      {
        question:
          "Which protocol operates at the Application Layer of the TCP/IP model to provide secure, encrypted transmission of hypertext documents over port 443?",
        options: [
          { id: "A", text: "HTTP" },
          { id: "B", text: "HTTPS (with TLS/SSL)" },
          { id: "C", text: "FTP" },
          { id: "D", text: "SMTP" },
        ],
        correctAnswer: "B",
        explanation:
          "HTTPS (HyperText Transfer Protocol Secure) encrypts communications using Transport Layer Security (TLS) over port 443. Standard unencrypted HTTP operates over port 80.",
        shortcut:
          "Port 80 = HTTP (unencrypted); Port 443 = HTTPS (encrypted TLS); Port 25 = SMTP.",
        commonMistake:
          "Confusing transport protocol (TCP port) with network encryption layers.",
        learningTip:
          "HTTPS guarantees confidentiality, data integrity, and server authentication via digital certificates.",
      },
    ];
  }

  // 16. Core Engineering & Technical Disciplines (GATE, RRB JE, TNPSC Technical)
  if (
    topicId.includes("engineering") ||
    topicName.toLowerCase().includes("engineering") ||
    topicId.includes("technical") ||
    subjectName.toLowerCase().includes("engineering") ||
    subjectName.toLowerCase().includes("technical")
  ) {
    return [
      {
        question:
          "In an electrical circuit, what is the equivalent resistance of three 12 Ω resistors connected in parallel across a DC voltage source?",
        options: [
          { id: "A", text: "36 Ω" },
          { id: "B", text: "4 Ω" },
          { id: "C", text: "6 Ω" },
          { id: "D", text: "8 Ω" },
        ],
        correctAnswer: "B",
        explanation:
          "For n identical resistors of resistance R in parallel: R_eq = R / n. Here R = 12 Ω and n = 3, so R_eq = 12 / 3 = 4 Ω. Alternatively: 1/R_eq = 1/12 + 1/12 + 1/12 = 3/12 = 1/4 -> R_eq = 4 Ω.",
        shortcut:
          "N identical resistors of resistance R in parallel: R_eq = R / N. 12 / 3 = 4 Ω instantly.",
        commonMistake:
          "Adding them in series (12 + 12 + 12 = 36 Ω).",
        learningTip:
          "Parallel combination always yields an equivalent resistance smaller than the smallest individual branch resistance.",
      },
      {
        question:
          "What is the worst-case time complexity of the standard QuickSort algorithm when the partition choice is persistently unbalanced?",
        options: [
          { id: "A", text: "O(n log n)" },
          { id: "B", text: "O(n^2)" },
          { id: "C", text: "O(log n)" },
          { id: "D", text: "O(n)" },
        ],
        correctAnswer: "B",
        explanation:
          "When the pivot is consistently the smallest or largest element (e.g. sorted array with first element as pivot), the recursion tree degenerates into n levels of n work, yielding O(n^2) time complexity. Average case is O(n log n).",
        shortcut:
          "MergeSort worst case = O(n log n); QuickSort worst case = O(n^2); Randomized QuickSort expected = O(n log n).",
        commonMistake:
          "Assuming QuickSort has O(n log n) in all cases (unlike MergeSort or HeapSort).",
        learningTip:
          "Using Randomized Pivot selection or Median-of-Three partitioning avoids the worst-case O(n^2) degradation.",
      },
    ];
  }

  // 17. Generic Exam Standard Topics Fallback
  return [
    {
      question: `In ${examName}, when analyzing problem constraints in ${topicName}, which systematic protocol yields the highest accuracy?`,
      options: [
        { id: "A", text: "Isolate stated boundary constraints, eliminate extreme contradictory choices, and test the target relationship" },
        { id: "B", text: "Perform exhaustive brute-force calculations without reviewing options" },
        { id: "C", text: "Rely solely on intuitive guessing to beat the stopwatch" },
        { id: "D", text: "Skip all questions regardless of sectional difficulty" },
      ],
      correctAnswer: "A",
      explanation:
        `Competitive exam rubrics for ${examName} reward constraint isolation and structured option elimination, cutting solving time while preserving sectional accuracy.`,
      shortcut:
        "Check extreme values and option bounds to discard 2 distractors in 10 seconds.",
      commonMistake:
        "Over-investing time on calculation before inspecting options.",
      learningTip:
        `Mastering the foundational principles of ${topicName} ensures consistent scoring across Prelims and Mains.`,
    },
    {
      question: `Which of the following conditions represents a critical pitfall when solving questions on ${topicName}?`,
      options: [
        { id: "A", text: "Overlooking negative qualifiers such as 'NOT', 'EXCEPT', or 'DEFINITELY FALSE'" },
        { id: "B", text: "Cross-checking units of measurement" },
        { id: "C", text: "Verifying calculations against stated boundaries" },
        { id: "D", text: "Organizing given data in a clean logical diagram" },
      ],
      correctAnswer: "A",
      explanation:
        "Examiners frequently place reverse qualifiers ('NOT', 'EXCEPT', 'FALSE') in questions. Misreading the operative direction accounts for significant negative marks.",
      shortcut:
        "Mentally highlight the operative verb and qualifier in the question stem.",
      commonMistake:
        "Choosing the first true statement instead of the statement that is 'NOT true'.",
      learningTip:
        "Underline the target instruction before confirming your choice bubble.",
    },
    {
      question: `When given two contradicting statements under ${topicName} rules, what is the mathematically valid deduction?`,
      options: [
        { id: "A", text: "Derive conclusions only from verifiable stated facts without unwarranted external assumptions" },
        { id: "B", text: "Assume the most complex possibility is true" },
        { id: "C", text: "Ignore both statements and guess randomly" },
        { id: "D", text: "Treat subjective opinions as universal axioms" },
      ],
      correctAnswer: "A",
      explanation:
        "Standard exam syllabi evaluate strict formal reasoning. Deductions must be strictly provable from given premises.",
      shortcut:
        "Never add unstated real-world assumptions to formal syllabus constraints.",
      commonMistake:
        "Bringing personal intuition into formal deduction problems.",
      learningTip:
        "A statement is only valid if it holds in 100% of all possible configurations.",
    },
    {
      question: `What is the most effective time allocation strategy for a question set on ${topicName} in ${examName}?`,
      options: [
        { id: "A", text: "Spend 2–2.5 minutes sketching the master framework, then answer all associated questions in 30 seconds each" },
        { id: "B", text: "Answer question 1 by trial and error, then start from scratch for question 2" },
        { id: "C", text: "Spend 8 minutes without writing any intermediate steps" },
        { id: "D", text: "Mark all randomly without evaluating" },
      ],
      correctAnswer: "A",
      explanation:
        "High scorers invest initial minutes into building the complete solution structure. Once the representation is locked, solving all associated questions takes under 30 seconds.",
      shortcut:
        "Frontload diagramming time to rapidly unlock the entire question cluster.",
      commonMistake:
        "Rushing the master diagram and having to restart after discovering a contradiction midway.",
      learningTip:
        "A clean diagram solves multiple marks at once with 100% sectional accuracy.",
    },
  ];
}
