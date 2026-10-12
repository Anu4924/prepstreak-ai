/**
 * Axmok AI Service Layer
 * 
 * Axmok AI is the intelligent study companion of PrepStreak AI, founded by Anu.
 * This service encapsulates all learning content generation, quick action responses,
 * and conversational tutoring interactions.
 * 
 * Modular architecture: Currently backed by comprehensive, realistic mock intelligence,
 * designed to be cleanly swapped with a real LLM/Gemini API provider in the future
 * without touching UI components.
 */

export interface AxmokChatMessage {
  id: string;
  sender: "user" | "axmok";
  text: string;
  timestamp: number;
  callout?: {
    title: string;
    content: string;
    type: "tip" | "rule" | "warning" | "example";
  };
  suggestedFollowUps?: string[];
}

export interface LearnConceptItem {
  name: string;
  description: string;
  ruleOrFormula?: string;
  example?: string;
}

export interface LearnExampleItem {
  title: string;
  problem: string;
  stepByStep: string[];
  answer: string;
  examTip?: string;
}

export interface LearnShortcutItem {
  title: string;
  description: string;
  timeSaved: string;
  method: string;
}

export interface LearnMistakeItem {
  mistake: string;
  whyStudentsFail: string;
  howToAvoid: string;
}

export interface LearnPracticeQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface TopicLearningStructure {
  topicId: string;
  topicName: string;
  subjectName: string;
  examName: string;
  overview: string;
  badge: string;
  estimatedMinutes: number;
  sections: {
    learn: {
      title: string;
      summary: string;
      breakdown: string[];
      framework: string;
    };
    keyConcepts: {
      title: string;
      concepts: LearnConceptItem[];
    };
    examples: {
      title: string;
      items: LearnExampleItem[];
    };
    shortcuts: {
      title: string;
      tips: LearnShortcutItem[];
    };
    commonMistakes: {
      title: string;
      traps: LearnMistakeItem[];
    };
    practice: {
      title: string;
      questions: LearnPracticeQuestion[];
    };
  };
}

export interface AxmokTutorResponse {
  text: string;
  suggestedFollowUps?: string[];
  callout?: {
    title: string;
    content: string;
    type: "tip" | "rule" | "warning" | "example";
  };
}

export interface GenerateResponseParams {
  examId?: string;
  examName: string;
  subjectId?: string;
  subjectName: string;
  topicId?: string;
  topicName: string;
  prompt: string;
  conversationHistory?: AxmokChatMessage[];
}

export interface QuickActionItem {
  label: string;
  prompt: string;
  iconName?: string;
}

// ---------------------------------------------------------------------------
// SPECIALIZED CURATED DATA FOR POPULAR HIGH-WEIGHTAGE TOPICS
// ---------------------------------------------------------------------------

const CURATED_LEARNING_DATA: Record<string, Partial<TopicLearningStructure>> = {
  "coding-decoding": {
    overview:
      "Coding-Decoding is a cornerstone of logical reasoning, evaluating your ability to decipher algorithmic transformation rules between plain text and encrypted cipher patterns.",
    badge: "High Weightage • 4-5 Marks",
    estimatedMinutes: 25,
    sections: {
      learn: {
        title: "Understanding Coding & Decoding Systems",
        summary:
          "In modern competitive exams (such as Banking PO/Clerk, SSC CGL, Railways, and State PSCs), questions fall into three core patterns: Positional Letter Shifting, Opposite Letter Pair Symmetry, and Fictitious Sentence Substitution (Chinese Coding).",
        breakdown: [
          "Letter-by-Letter Positional Progression: Constant offset (+2, +3) or increasing arithmetic progression (+1, +2, +3, +4).",
          "Cross-Shift & Bisection: Reversing or cross-pairing first half and second half of words (e.g. 6-letter word split into two 3-letter segments).",
          "Opposite Letter Pairs: Sum of positions equals 27 (A ↔ Z, B ↔ Y, C ↔ X, D ↔ W, E ↔ V, etc.).",
          "Symbol / Number Substitution: Mapping vowels, consonants, or word length to special glyphs (#, @, %, &).",
        ],
        framework:
          "Algorithm to Crack Any Code:\n1. Check Word Length & Symmetry (even/odd bisection)\n2. Test Opposite Pair Sums (Position1 + Position2 == 27)\n3. Calculate Positional Differences (EJOTY ranks)\n4. Verify pattern on 2nd sample word before selecting option",
      },
      keyConcepts: {
        title: "Core Mechanics & Positional Ranks",
        concepts: [
          {
            name: "The EJOTY Anchor System",
            description:
              "Memorizing letter numbers in steps of 5 eliminates manual alphabet finger-counting.",
            ruleOrFormula: "E = 5, J = 10, O = 15, T = 20, Y = 25",
            example: "Letter 'R': J(10) + 8 or T(20) - 2 = 18.",
          },
          {
            name: "Opposite Letter Sum-27 Law",
            description:
              "Any letter's opposite counterpart in the reverse alphabet satisfies: Forward Rank + Reverse Rank = 27.",
            ruleOrFormula: "Reverse Letter Rank = 27 - Forward Rank",
            example: "Opposite of 'H' (8) is 27 - 8 = 19 ('S'). Anchor: High School.",
          },
          {
            name: "Sentence Substitution (Elimination Law)",
            description:
              "To isolate the code for a specific target word, compare only the sentences containing that word. Find the common code token and discard unrelated sentences.",
          },
        ],
      },
      examples: {
        title: "Worked Exam Problems with Step-by-Step Logic",
        items: [
          {
            title: "Opposite Pair + Shift Combination",
            problem:
              "If 'ROSE' is coded as 'ILHV' in a certain code, how is 'MIND' coded in that same pattern?",
            stepByStep: [
              "Step 1: Check letter ranks: R(18) → I(9), O(15) → L(12), S(19) → H(8), E(5) → V(22).",
              "Step 2: Notice the relationship: 18+9=27, 15+12=27, 19+8=27, 5+22=27. Each letter is replaced with its exact Opposite Letter Pair.",
              "Step 3: Apply Opposite Letter Rule to 'MIND': M(13) → N(14), I(9) → R(18), N(14) → M(13), D(4) → W(23).",
              "Step 4: Combined code is 'NRMW'.",
            ],
            answer: "NRMW",
            examTip: "Always test the opposite-27 rule first whenever you see letters like R→I, A→Z, or B→Y.",
          },
          {
            title: "Bisected Cross-Reversal",
            problem: "If 'MONKEY' is coded as 'XDJMNL', what is the code for 'TIGER'?",
            stepByStep: [
              "Step 1: Write original: M O N K E Y (ranks: 13, 15, 14, 11, 5, 25).",
              "Step 2: Inspect code from back to front: Y-1=X, E-1=D, K-1=J, N-1=M, O-1=N, M-1=L.",
              "Step 3: Pattern is (Letter - 1) written in reverse order!",
              "Step 4: For T I G E R: R-1=Q, E-1=D, G-1=F, I-1=H, T-1=S. Result: QDFHS.",
            ],
            answer: "QDFHS",
            examTip: "When first letter to first letter yields an erratic shift, immediately compare first letter to last letter.",
          },
        ],
      },
      shortcuts: {
        title: "Exam Shortcuts & Time-Saving Tactics",
        tips: [
          {
            title: "Option Elimination by Extreme Ends",
            description:
              "Solve only the 1st and last letter code. In 75% of Prelims MCQs, checking just two letters eliminates 3 out of 4 options within 6 seconds.",
            timeSaved: "Save 35-45 seconds per question",
            method: "Decode index 0 and index N-1, match with choices, mark immediately.",
          },
          {
            title: "Chinese Coding Word Isolation",
            description:
              "Never write a full grid table of all codes. Go straight to the word asked in the question stem and compare only sentences containing it.",
            timeSaved: "Cut 2 minutes off puzzle sets",
            method: "Targeted sentence intersection instead of total matrix decoding.",
          },
          {
            title: "Opposite Mnemonic Pairs",
            description:
              "A-Z (Amazon), B-Y (Boy), C-X (Crux), D-W (Dew), E-V (Evening), F-U (Fun), G-T (GT Road), H-S (High School), I-R (Indian Railways), J-Q (Jungle Queen), K-P (Kurta Pajama), L-O (Love), M-N (Man).",
            timeSaved: "Instant recall under 1 sec",
            method: "Mnemonic association eliminates calculating 27 - rank.",
          },
        ],
      },
      commonMistakes: {
        title: "Examiner Traps & Common Pitfalls",
        traps: [
          {
            mistake: "Assuming Uniform Shift After Checking Only 1 Letter",
            whyStudentsFail:
              "Students see A → C (+2) on letter 1 and assume the whole word is +2, falling for arithmetic progression traps like +2, +3, +4, +5.",
            howToAvoid:
              "Always verify at least the first, middle, and last letter before selecting an option.",
          },
          {
            mistake: "Misinterpreting Clockwise Cycle (Z to A)",
            whyStudentsFail:
              "When subtracting from A, forgetting that A - 2 wraps around to Y (25).",
            howToAvoid:
              "Treat the alphabet as a modulo-26 ring: (Letter Rank - Shift + 26) % 26.",
          },
          {
            mistake: "Mixing 'Code for X' vs 'X is Code for'",
            whyStudentsFail:
              "Applying the encoding rule in reverse when the question asks 'Which word is coded as...'.",
            howToAvoid:
              "Highlight the operational direction: Plain → Cipher (Encode) vs Cipher → Plain (Decode).",
          },
        ],
      },
      practice: {
        title: "Self-Check Micro Practice",
        questions: [
          {
            id: "p-1",
            question: "In a certain code language, 'COMPUTER' is written as 'RFUVQNPC'. How will 'MEDICINE' be written in that code?",
            options: ["EOJDEJFM", "EOJDJEFM", "MFEDJJOE", "MFEJDJOE"],
            answerIndex: 1,
            explanation:
              "Reverse the word: R E T U P M O C, then add +1 to middle letters except the first and last letters which are swapped. C and R swap positions; remaining letters are incremented by +1 and inverted. MEDICINE becomes EOJDJEFM.",
            difficulty: "Medium",
          },
          {
            id: "p-2",
            question: "If 'DELHI' is coded as 73541 and 'CALCUTTA' as 82589662, how can 'CALICUT' be coded?",
            options: ["5279431", "5978213", "8251896", "8543691"],
            answerIndex: 2,
            explanation:
              "Direct letter-to-digit substitution: C=8, A=2, L=5, I=1, C=8, U=9, T=6. Assembling CALICUT yields 8251896.",
            difficulty: "Easy",
          },
        ],
      },
    },
  },
  "syllogism": {
    overview:
      "Syllogism tests deductive logic through Venn diagrams and set inclusion laws. Master 'Only a few', possibility conclusions, and definite negative statements.",
    badge: "Crucial • 5 Marks Set",
    estimatedMinutes: 30,
    sections: {
      learn: {
        title: "Mastering Deductive Syllogisms",
        summary:
          "In modern exams, standard Syllogism has evolved to emphasize 'Only a few', 'A few', 'At least some', and 'Possibility' statements. You must determine if conclusions follow definitely, possibly, or not at all.",
        breakdown: [
          "Definite Conclusion vs Possibility: A definite conclusion must hold in 100% of all valid Venn representations.",
          "'Only a few A are B' Law: Translates into TWO simultaneous statements: (1) Some A are B AND (2) Some A are definitely NOT B.",
          "'Some A are not B' Possibility: All B can be A, but All A can NEVER be B.",
          "Complementary Either-Or Pair: (1) Both conclusions must be independently doubtful, (2) Same subject-predicate, (3) Pair must be 'Some + No' or 'All + Some Not'.",
        ],
        framework:
          "3-Step Venn Protocol:\n1. Draw the MINIMUM OVERLAPPING Venn diagram for statements.\n2. For definite conclusions: If it fails in even one diagram, it is FALSE.\n3. For possibility conclusions: If you can draw ANY valid diagram without violating statements, it is TRUE.",
      },
      keyConcepts: {
        title: "The Golden Venn Theorems",
        concepts: [
          {
            name: "'Only a Few' Decomposition",
            description:
              "The most tested concept in modern Prelims and Mains exams.",
            ruleOrFormula: "Only a few A are B = (Some A are B) + (Some A are NOT B)",
            example: "All A can never be B (Definite False), but All B can be A (Possible True).",
          },
          {
            name: "Possibility Inversion Rule",
            description:
              "If a relation is already definitely known, a possibility statement regarding it is ALWAYS false.",
            ruleOrFormula: "Definite True + Possibility = FALSE",
            example: "If Some A are B is already true, 'Some A being B is a possibility' is FALSE.",
          },
          {
            name: "Either-Or Conditions",
            description:
              "Three mandatory conditions must be fulfilled simultaneously for an Either-Or answer.",
            ruleOrFormula: "(Doubtful + Doubtful) & (Same Entities) & (Some+No / All+Some Not)",
          },
        ],
      },
      examples: {
        title: "Worked Syllogism Case Studies",
        items: [
          {
            title: "'Only A Few' Trap Analysis",
            problem:
              "Statements:\n1. Only a few Pens are Books.\n2. All Books are Erasers.\n\nConclusions:\nI. Some Pens are Erasers.\nII. All Pens being Books is a possibility.",
            stepByStep: [
              "Step 1: 'Only a few Pens are Books' means: (a) Some Pens are Books, (b) Some Pens can NEVER be Books.",
              "Step 2: Check Conclusion I: Since Some Pens are Books and All Books are Erasers, the Pens that are Books MUST be Erasers. Conclusion I definitely follows!",
              "Step 3: Check Conclusion II: 'All Pens being Books is a possibility' directly contradicts 'Only a few Pens are Books' (which mandates that some Pens are NOT Books). Conclusion II is impossible!",
              "Step 4: Final verdict: Only Conclusion I follows.",
            ],
            answer: "Only Conclusion I follows",
            examTip: "Remember: 'All A being B is a possibility' is ALWAYS FALSE whenever 'Only a few A are B' is given.",
          },
        ],
      },
      shortcuts: {
        title: "Speed-Solving Hacks",
        tips: [
          {
            title: "Definite Negative Quick-Scan",
            description:
              "If all given statements are affirmative (All / Some), no definite negative conclusion (No / Some Not) can EVER follow.",
            timeSaved: "Instant 2-second strike out",
            method: "Discard negative conclusions immediately without drawing diagrams.",
          },
          {
            title: "Cross-Circle Shield for 'No'",
            description:
              "Mark 'No A is B' with a solid bar connecting both circles with an X. It acts as an impenetrable shield.",
            timeSaved: "Eliminates boundary confusion",
            method: "Entities enclosed inside one circle cannot touch anything across the X-bar.",
          },
        ],
      },
      commonMistakes: {
        title: "Syllogism Traps",
        traps: [
          {
            mistake: "Treating 'Some A are B' as implying 'Some A are NOT B'",
            whyStudentsFail:
              "In colloquial English 'some' implies 'not all'. In formal logic, 'Some A are B' leaves the rest of A completely unrestricted (All A could be B).",
            howToAvoid:
              "Only 'Only a few' guarantees that some are not. Standard 'Some' allows 'All' to be a possibility.",
          },
        ],
      },
      practice: {
        title: "Instant Verification Questions",
        questions: [
          {
            id: "syl-1",
            question: "Statements: All Lions are Cats. No Cat is Tiger. Conclusions: I. No Lion is Tiger. II. Some Tigers are Lions.",
            options: ["Only I follows", "Only II follows", "Either I or II", "Neither I nor II"],
            answerIndex: 0,
            explanation:
              "Since All Lions are inside Cats, and Cats have no intersection with Tigers, Lions can never intersect Tigers. Therefore, No Lion is Tiger is definitely true, and Some Tigers are Lions is impossible.",
            difficulty: "Easy",
          },
        ],
      },
    },
  },
};

// ---------------------------------------------------------------------------
// DEFAULT DYNAMIC CONTENT GENERATOR (FOR ALL EXAMS, SUBJECTS & TOPICS)
// ---------------------------------------------------------------------------

function generateDynamicLearningStructure(
  examName: string,
  subjectName: string,
  topicName: string,
  topicId: string
): TopicLearningStructure {
  return {
    topicId,
    topicName,
    subjectName,
    examName,
    overview: `Master essential principles, problem-solving methods, and exam patterns for ${topicName} in ${subjectName} for ${examName}.`,
    badge: "Core Topic • Syllabus Aligned",
    estimatedMinutes: 20,
    sections: {
      learn: {
        title: `1. Foundations of ${topicName}`,
        summary: `${topicName} is a high-yield component in the ${subjectName} section for ${examName}. Questions in this module assess conceptual clarity, fast pattern detection, and accuracy under strict time limits.`,
        breakdown: [
          `Fundamental Definition: Core principles governing ${topicName} and how they are tested in ${examName}.`,
          `Classification of Variants: Identifying question archetypes and standard formats used by examiners.`,
          `Systematic Approach: Applying reliable step-by-step algorithms rather than trial-and-error guessing.`,
          `Time Allocation: Typical ideal solving window is 40–60 seconds per question in Prelims and 90–120 seconds in Mains.`,
        ],
        framework: `Step-by-Step Strategy for ${topicName}:\n1. Identify the core given variables and target output\n2. Filter out distractor statements or redundant data\n3. Apply primary rules and formulas\n4. Use elimination on options before full manual computation`,
      },
      keyConcepts: {
        title: `2. Key Formulas, Rules & Principles`,
        concepts: [
          {
            name: `Primary Rule of ${topicName}`,
            description: `The foundational theorem tested across competitive examinations for this topic.`,
            ruleOrFormula: `Rule: Standardize inputs → Apply core logic → Cross-verify boundary conditions.`,
            example: `Apply to typical ${examName} problem formats with numerical or logical bounds.`,
          },
          {
            name: `Pattern Recognition & Property Constraints`,
            description: `Observe recurring invariants that allow quick deduction without exhaustive manual calculation.`,
            ruleOrFormula: `Invariants: Conserved ratios, parity checks, and symmetrical constraints.`,
          },
          {
            name: `Extreme Cases & Boundary Values`,
            description: `Testing minimal (0, 1, null) and maximal values to verify deduced logic before locking your answer.`,
          },
        ],
      },
      examples: {
        title: `3. Step-by-Step Worked Problems`,
        items: [
          {
            title: `Standard ${examName} Pattern Problem`,
            problem: `A representative high-frequency question testing fundamental principles of ${topicName}.`,
            stepByStep: [
              `Step 1: Parse the problem statement and identify the precise target quantity.`,
              `Step 2: Note given relationships and eliminate unneeded extraneous details.`,
              `Step 3: Execute direct transformation using established rules of ${topicName}.`,
              `Step 4: Check option compatibility to pinpoint the unique correct choice.`,
            ],
            answer: `Option B (Verified by standard ${subjectName} rules)`,
            examTip: `In ${examName}, always check the units and direction of comparison before confirming.`,
          },
        ],
      },
      shortcuts: {
        title: `4. Shortcuts, Tricks & Time Savers`,
        tips: [
          {
            title: `Strategic Option Elimination`,
            description: `Eliminate options with incompatible parity, extreme outliers, or conflicting sign conventions.`,
            timeSaved: "Save 30-40 seconds",
            method: `Review the extreme choices first and cancel logically inconsistent options.`,
          },
          {
            title: `Approximation & Benchmark Anchoring`,
            description: `Replace complicated values with convenient rounded anchors to estimate the answer range.`,
            timeSaved: "Save 20-30 seconds",
            method: `Round intermediate steps to nearest 5 or 10 when options are well spaced.`,
          },
          {
            title: `Reverse Verification from Choices`,
            description: `When direct deduction is computationally heavy, substitute option values into problem constraints.`,
            timeSaved: "Fast fallback technique",
            method: `Start substitution from choice (B) or (C) to test the middle range.`,
          },
        ],
      },
      commonMistakes: {
        title: `5. Common Traps & How to Avoid Them`,
        traps: [
          {
            mistake: `Misreading the Question Stem`,
            whyStudentsFail: `Overlooking keywords such as 'NOT', 'EXCEPT', 'DEFINITELY FALSE', or flipped ratios.`,
            howToAvoid: `Underline or mentally note the exact phrase after 'find' or 'which of the following'.`,
          },
          {
            mistake: `Rushing Calculation Under Exam Pressure`,
            whyStudentsFail: `Making sign errors (+/-) or arithmetic slips during the final substitution step.`,
            howToAvoid: `Perform quick sanity checks against order of magnitude before selecting the final bubble.`,
          },
          {
            mistake: `Over-Investing Time on Ambiguous Questions`,
            whyStudentsFail: `Spending 3+ minutes on a single tricky question and starving easy upcoming questions.`,
            howToAvoid: `Follow the 60-second rule: if no clear path is visible in 60 seconds, mark for review and move on.`,
          },
        ],
      },
      practice: {
        title: `6. Quick Self-Assessment Questions`,
        questions: [
          {
            id: `${topicId}-q1`,
            question: `Which of the following represents the most efficient first step when solving ${topicName} problems in ${examName}?`,
            options: [
              `Perform exhaustive manual calculations without reading options`,
              `Isolate key constraints, check option patterns, and eliminate obvious outliers`,
              `Skip the question without evaluating given parameters`,
              `Guess based purely on intuition`,
            ],
            answerIndex: 1,
            explanation: `Standard exam strategy requires isolating core constraints and checking options early to save valuable exam minutes.`,
            difficulty: "Easy",
          },
          {
            id: `${topicId}-q2`,
            question: `When encountering an ambiguous constraint in ${topicName}, what is the recommended protocol?`,
            options: [
              `Assume extreme unstated conditions`,
              `Stick strictly to stated facts and test if both possibilities yield consistent options`,
              `Ignore all negative conditions`,
              `Abandon the entire section`,
            ],
            answerIndex: 1,
            explanation: `Competitive exam rubrics mandate deriving conclusions strictly from stated facts without unwarranted external assumptions.`,
            difficulty: "Medium",
          },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// AXMOK AI TUTOR RESPONSE ENGINE
// ---------------------------------------------------------------------------

export const AxmokAIService = {
  /**
   * Generates the initial conversational greeting from Axmok AI for a topic.
   */
  getInitialGreeting(examName: string, subjectName: string, topicName: string): AxmokChatMessage {
    return {
      id: `axmok-intro-${Date.now()}`,
      sender: "axmok",
      timestamp: Date.now(),
      text: `Hi! I'm **Axmok AI** 👋\nYour personal exam preparation companion for **${examName}**.\n\nI'll help you understand **${topicName}** (${subjectName}) step by step, with simple explanations, exam-proven shortcuts, and practice.\n\nWhat would you like to explore first? Use the quick actions above or ask me any question!`,
      callout: {
        title: "Study Tip from Axmok AI",
        content: `Mastering **${topicName}** gives you a major advantage in ${examName}. Start with basics or ask for a worked example!`,
        type: "tip",
      },
      suggestedFollowUps: [
        "Explain this topic",
        "Teach me from basics",
        "Give me an example",
        "Explain with a simple trick",
      ],
    };
  },

  /**
   * Returns the list of standard quick actions for the prompt bar.
   */
  getQuickActions(): QuickActionItem[] {
    return [
      { label: "Explain this topic", prompt: "Explain this topic simply and clearly" },
      { label: "Teach me from basics", prompt: "Teach me from basics step by step" },
      { label: "Give me an example", prompt: "Give me a realistic exam example with step-by-step solution" },
      { label: "Explain with a simple trick", prompt: "Explain with a simple trick or shortcut for the exam" },
      { label: "Ask me a practice question", prompt: "Ask me a practice question to test my understanding" },
      { label: "Summarize this topic", prompt: "Summarize this topic with key takeaways" },
      { label: "What should I learn next?", prompt: "What should I learn next after this topic?" },
    ];
  },

  /**
   * Fetches the complete 6-section topic learning structure.
   */
  getTopicLearningStructure(
    examName: string,
    subjectName: string,
    topicName: string,
    topicId: string
  ): TopicLearningStructure {
    const curated = CURATED_LEARNING_DATA[topicId];
    if (curated) {
      const base = generateDynamicLearningStructure(examName, subjectName, topicName, topicId);
      return {
        ...base,
        ...curated,
        sections: {
          ...base.sections,
          ...curated.sections,
        },
      };
    }

    return generateDynamicLearningStructure(examName, subjectName, topicName, topicId);
  },

  /**
   * Generates a realistic, context-aware response as Axmok AI by communicating with
   * the secure backend Next.js API route (/api/ai/chat).
   */
  async generateResponse(params: GenerateResponseParams): Promise<AxmokTutorResponse> {
    const { examName, subjectName, topicName, prompt, conversationHistory } = params;

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          examName,
          subjectName,
          topicName,
          conversationHistory: (conversationHistory || []).map((msg) => ({
            sender: msg.sender,
            text: msg.text,
          })),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error || "You are sending questions too quickly. Please pause for a moment."
          );
        }
        throw new Error("Axmok AI is temporarily unavailable. Please try again.");
      }

      const data = await response.json();
      return {
        text: data.text || "I am ready to help you with your preparation! What would you like to explore next?",
        suggestedFollowUps: data.suggestedFollowUps,
        callout: data.callout,
      };
    } catch (err) {
      console.error("AxmokAIService.generateResponse error:", err);
      throw err;
    }
  },
};
