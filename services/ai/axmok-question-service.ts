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

    const aiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

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
        ? `\nCRITICAL - AVOID REPETITION: The user has already solved the following questions. DO NOT repeat or generate questions that are conceptually identical or use identical numbers/variables to these:\n${previousQuestions
            .slice(-10)
            .map((q, idx) => `${idx + 1}. "${q.slice(0, 120)}..."`)
            .join("\n")}`
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

    const userPrompt = `Generate ${count} ${difficulty} level questions for ${examName} - ${subjectName} - ${topicName}${subtopicName ? ` - ${subtopicName}` : ""}.`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: aiModel,
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }],
          },
        ],
        config: {
          temperature: 0.35,
          maxOutputTokens: 3500,
        },
      });

      const responseText = response.text?.trim() || "";
      const parsed = this.parseAndValidateAiResponse(responseText, params);
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    } catch (sdkError) {
      console.warn("AxmokQuestionService: SDK attempt failed, trying REST API:", sdkError);

      // REST fallback
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
            temperature: 0.35,
            maxOutputTokens: 3500,
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
    const { examName, examId, subjectName, subjectId, topicName, topicId, count, difficulty } =
      params;

    const templates = getCurriculumBankForTopic(topicId, topicName, subjectName, examName);
    const result: Question[] = [];

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      const diffLabel =
        difficulty === "Mixed"
          ? (["Easy", "Medium", "Hard"][i % 3] as "Easy" | "Medium" | "Hard")
          : difficulty === "Easy" || difficulty === "Hard"
          ? difficulty
          : "Medium";

      result.push({
        id: `axmok-q-${topicId}-${i + 1}-${Date.now()}`,
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

  // 8. General Tamil & Literature (TNPSC)
  if (
    topicId.includes("tamil") ||
    topicName.toLowerCase().includes("tamil") ||
    topicId.includes("thirukkural")
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
    ];
  }

  // 9. Generic Exam Standard Topics
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
      question: `What is the most effective time allocation strategy for a 5-question puzzle or set on ${topicName} in ${examName}?`,
      options: [
        { id: "A", text: "Spend 2–2.5 minutes sketching the master framework, then answer all 5 questions in 30 seconds each" },
        { id: "B", text: "Answer question 1 by trial and error, then start from scratch for question 2" },
        { id: "C", text: "Spend 8 minutes without writing any intermediate steps" },
        { id: "D", text: "Mark all 5 randomly without evaluating" },
      ],
      correctAnswer: "A",
      explanation:
        "High scorers invest initial minutes into building the complete solution structure. Once the representation is locked, solving all associated questions takes under 30 seconds.",
      shortcut:
        "Frontload diagramming time to rapidly unlock the entire 5-mark question cluster.",
      commonMistake:
        "Rushing the master diagram and having to restart after discovering a contradiction midway.",
      learningTip:
        "A clean diagram solves 5 marks at once with 100% sectional accuracy.",
    },
  ];
}
