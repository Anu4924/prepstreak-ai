import { Question } from "@/lib/types/question";

export const MOCK_PRACTICE_QUESTIONS: Question[] = [
  {
    id: "q-1",
    topicId: "coding-decoding",
    topicName: "Coding-Decoding",
    subjectName: "Reasoning Ability",
    difficulty: "Medium",
    questionText: "If 'CAT' is coded as 'DBU', how is 'DOG' coded in that same rule?",
    options: [
      { id: "A", text: "EPH" },
      { id: "B", text: "EOG" },
      { id: "C", text: "FPH" },
      { id: "D", text: "DPH" },
    ],
    correctAnswer: "A",
    explanation:
      "Each letter is shifted forward by +1 position in the English alphabetical series: C(+1)=D, A(+1)=B, T(+1)=U. Applying the exact rule to DOG: D(+1)=E, O(+1)=P, G(+1)=H. Hence, DOG is coded as EPH.",
    examTag: "SBI PO Prelims",
  },
  {
    id: "q-2",
    topicId: "coding-decoding",
    topicName: "Coding-Decoding",
    subjectName: "Reasoning Ability",
    difficulty: "Medium",
    questionText: "In a certain code language, 'STATION' is written as 'URCVKQP'. How will 'BANKING' be written in that code?",
    options: [
      { id: "A", text: "DCPMKPI" },
      { id: "B", text: "DCPMKQI" },
      { id: "C", text: "DCQMKPI" },
      { id: "D", text: "EBPMKPI" },
    ],
    correctAnswer: "A",
    explanation:
      "Every letter is advanced by +2 positions: S(+2)=U, T(+2)=R... For BANKING: B(+2)=D, A(+2)=C, N(+2)=P, K(+2)=M, I(+2)=K, N(+2)=P, G(+2)=I. Therefore, BANKING becomes DCPMKPI.",
    examTag: "SBI PO Prelims",
  },
  {
    id: "q-3",
    topicId: "coding-decoding",
    topicName: "Coding-Decoding",
    subjectName: "Reasoning Ability",
    difficulty: "Hard",
    questionText: "In a code, 'finance market stable' is written as 'ka la pa', 'market grow high' is written as 'la tu ro', and 'stable high yield' is written as 'pa ro zi'. What is the code for 'finance'?",
    options: [
      { id: "A", text: "la" },
      { id: "B", text: "ka" },
      { id: "C", text: "pa" },
      { id: "D", text: "ro" },
    ],
    correctAnswer: "B",
    explanation:
      "Comparing 1st and 2nd sentence: 'market' = 'la'. Comparing 1st and 3rd sentence: 'stable' = 'pa'. In the first sentence 'finance market stable' = 'ka la pa'. Eliminating 'market' (la) and 'stable' (pa), we get 'finance' = 'ka'.",
    examTag: "SBI PO Mains",
  },
  {
    id: "q-4",
    topicId: "coding-decoding",
    topicName: "Coding-Decoding",
    subjectName: "Reasoning Ability",
    difficulty: "Medium",
    questionText: "If MASTER is coded as 13-1-19-20-5-18, what will be the code sum for PROBATION?",
    options: [
      { id: "A", text: "112" },
      { id: "B", text: "116" },
      { id: "C", text: "124" },
      { id: "D", text: "108" },
    ],
    correctAnswer: "B",
    explanation:
      "Each letter corresponds to its positional rank: P(16) + R(18) + O(15) + B(2) + A(1) + T(20) + I(9) + O(15) + N(14) = 116.",
    examTag: "SBI PO Prelims",
  },
];

export const MOCK_TEST_QUESTIONS: Question[] = [
  ...MOCK_PRACTICE_QUESTIONS,
  {
    id: "tq-5",
    topicId: "syllogism",
    topicName: "Syllogism",
    subjectName: "Reasoning Ability",
    difficulty: "Hard",
    questionText: "Statements: Only a few laptops are tablets. All tablets are phones. No phone is desktop.\nConclusions:\nI. Some laptops are not phones.\nII. All laptops can never be desktops.",
    options: [
      { id: "A", text: "Only Conclusion I follows" },
      { id: "B", text: "Only Conclusion II follows" },
      { id: "C", text: "Both Conclusion I and II follow" },
      { id: "D", text: "Neither follows" },
    ],
    correctAnswer: "B",
    explanation:
      "Some laptops are tablets, which are phones. Since No phone is desktop, that portion of laptop which is tablet/phone can never be desktop. Hence II definitely follows.",
    examTag: "SBI PO Mains",
  },
  {
    id: "tq-6",
    topicId: "inequality",
    topicName: "Inequality",
    subjectName: "Reasoning Ability",
    difficulty: "Easy",
    questionText: "Statements: P >= Q = R > S <= T; Conclusions: I. P > S, II. R <= T",
    options: [
      { id: "A", text: "Only conclusion I is true" },
      { id: "B", text: "Only conclusion II is true" },
      { id: "C", text: "Either I or II is true" },
      { id: "D", text: "Both I and II are true" },
    ],
    correctAnswer: "A",
    explanation:
      "P >= Q = R > S gives P > S (definite). Between R and T, opposite signs (R > S <= T) prevent definite deduction.",
    examTag: "SBI PO Prelims",
  },
  {
    id: "tq-7",
    topicId: "coding-decoding",
    topicName: "Coding-Decoding",
    subjectName: "Reasoning Ability",
    difficulty: "Medium",
    questionText: "If CAT is coded as DBU, how is DOG coded?",
    options: [
      { id: "A", text: "EPH" },
      { id: "B", text: "EOG" },
      { id: "C", text: "FPH" },
      { id: "D", text: "DPH" },
    ],
    correctAnswer: "A",
    explanation:
      "Letter shifting forward by +1: D->E, O->P, G->H => EPH.",
    examTag: "SBI PO Prelims",
  },
];
