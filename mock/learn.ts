export interface LearnSection {
  id: string;
  title: string;
  badge?: string;
  content: string;
  bullets?: string[];
  codeOrFormula?: string;
}

export interface AiTutorFaq {
  prompt: string;
  response: string;
}

export const MOCK_LEARN_DATA = {
  subjectName: "Reasoning Ability",
  topicName: "Coding-Decoding",
  progress: 72,
  description:
    "Master the patterns of letter-shifting, number-substitution, and conditional sentence codes frequently asked in SBI PO Prelims & Mains.",
  sections: [
    {
      id: "concept",
      title: "1. Concept Overview",
      content:
        "Coding-Decoding tests your ability to decipher the hidden encryption algorithm or logic between an original word (plain text) and its transformed code. In banking exams, problems generally belong to three broad categories: Letter Coding, Number/Symbol Coding, and Fictitious Language (Substitution) Coding.",
      bullets: [
        "Letter Coding: Moving forwards or backwards in the alphabetical series (+1, +2, -3, etc.).",
        "Opposite Letter Pairs: A-Z, B-Y, C-X, D-W, E-V... where the sum of alphabetical ranks is always 27.",
        "Substitution Coding: Identifying common words across sentences to isolate code words.",
      ],
    },
    {
      id: "rules",
      title: "2. Fundamental Rules",
      content:
        "Before attempting questions in the exam, memorize alphabetical forward and backward positional values. Use standard acronym anchors to remember them in under 2 seconds.",
      bullets: [
        "EJOTY Rule: E = 5, J = 10, O = 15, T = 20, Y = 25.",
        "CFILORUX Rule: C = 3, F = 6, I = 9, L = 12, O = 15, R = 18, U = 21, X = 24.",
        "Reverse Rank Formula: Reverse Rank = 27 - Forward Rank (e.g. for M (13): 27 - 13 = 14 = N).",
      ],
      codeOrFormula: "Reverse Rank = 27 - Forward Rank\nTotal Letters = 26",
    },
    {
      id: "examples",
      title: "3. Worked Examples",
      content:
        "Example 1 (Direct Shift): If 'SYSTEM' is coded as 'SYSMET', notice that the first three letters SYS are kept and TEM is reversed to MET.\n\nExample 2 (Positional Addition): If 'FLOWER' is coded as 'UOLDVI', observe: F(6)+U(21)=27, L(12)+O(15)=27, O(15)+L(12)=27, W(23)+D(4)=27, E(5)+V(22)=27, R(18)+I(9)=27. This is an Opposite Letter Pair code.",
      bullets: [
        "Step 1: Check if the letters in the code are identical to the word (rearrangement pattern).",
        "Step 2: Check constant forward/backward numeric shifts.",
        "Step 3: Check opposite letter pair sums (Total = 27).",
      ],
    },
    {
      id: "shortcuts",
      title: "4. SBI PO Exam Shortcuts",
      content:
        "In SBI PO Prelims, you have only 20 minutes for 35 reasoning questions. Avoid writing the entire 26-letter alphabet on rough paper.",
      bullets: [
        "Elimination Strategy: Match only the first and last letters of the options first. Often 3 out of 4 options are eliminated immediately.",
        "Chinese/Substitution Coding: Don't decode all words! Look at the specific word asked in the question and check which sentence it appears in.",
        "Odd-Even Position Check: If length is even, check if the word is split into two halves and reversed.",
      ],
    },
    {
      id: "mistakes",
      title: "5. Common Mistakes to Avoid",
      content:
        "Trap 1: Assuming a constant +2 shift without checking all letters. Examiners often use variable arithmetic: +1, +2, +3, +4...\nTrap 2: Confusing clockwise cycle (Z to A) in negative shifts.\nTrap 3: In SBI PO Mains new-pattern coding, symbols represent the number of vowels, not random characters.",
      bullets: [
        "Always test your discovered logic on the second reference word if two example words are provided in the question.",
        "Carefully note whether the question asks 'What is the code for X?' or 'Which word is coded as X?'.",
      ],
    },
  ] as LearnSection[],
  mockFaqs: [
    {
      prompt: "Explain this topic simply",
      response:
        "Think of Coding-Decoding like a secret language game! One rule transforms every letter—either shifting it forward (like A becoming B), flipping it to its opposite counterpart (A becomes Z), or rearranging the letter positions. Once you spot whether it's shifting, flipping, or scrambling, you can crack any word in seconds.",
    },
    {
      prompt: "Give me another example",
      response:
        "Here is a classic SBI PO pattern: If 'ROSE' is coded as 'ILHV', how is 'MIND' coded? \n\nLet's check the letters: R is opposite to I (18+9=27), O is opposite to L (15+12=27), S is opposite to H (19+8=27), E is opposite to V (5+22=27). \n\nNow for MIND: M opposite is N, I opposite is R, N opposite is M, D opposite is W. So 'MIND' = 'NRMW'!",
    },
    {
      prompt: "Explain where I made a mistake",
      response:
        "In your last attempt on Coding-Decoding, you calculated the shift as constant +1, but the problem used an alternating shift (+1, -1, +1, -1). Whenever the third letter does not match your expected forward shift, immediately test an alternating or vowel-consonant rule!",
    },
  ] as AiTutorFaq[],
};
