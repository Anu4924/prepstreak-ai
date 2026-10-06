import { DifficultyLevel, DifficultyScale } from "./exam";

export type QuestionType =
  | "mcq"
  | "true_false"
  | "numerical"
  | "fill_in_the_blank"
  | "reasoning"
  | "puzzle"
  | "data_interpretation"
  | "reading_comprehension"
  | "statement_assumption";

export type PracticeMode = "topic" | "subtopic" | "subject" | "exam" | "personalized";

export type PracticeDifficulty =
  | "Beginner"
  | "Easy"
  | "Medium"
  | "Moderate"
  | "Exam Level"
  | "Hard"
  | "Mixed";

export interface QuestionOption {
  id: "A" | "B" | "C" | "D" | string;
  text: string;
}

export interface Question {
  id: string;
  topicId?: string;
  topicName?: string;
  subtopicId?: string;
  subtopicName?: string;
  subjectId?: string;
  subjectName?: string;
  examId?: string;
  examName?: string;
  sectionId?: string;
  sectionName?: string;
  difficulty: DifficultyLevel | DifficultyScale | string;
  questionText: string;
  questionType?: QuestionType | string;
  questionPattern?: string; // e.g. "Linear Arrangement", "Successive Percentage"
  options: QuestionOption[];
  correctAnswer: "A" | "B" | "C" | "D" | string;
  explanation: string;
  shortcut?: string;
  commonMistake?: string;
  learningTip?: string;
  examTag?: string;
  marks?: number;
  negativeMarks?: number;
}

export type QuestionStatus =
  | "not_visited"
  | "not_answered"
  | "answered"
  | "marked_review"
  | "answered_marked";

export interface TestSession {
  id: string;
  testTitle: string;
  examId?: string;
  examName?: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  positiveMarks: number;
  negativeMarks: number;
  sectionWise?: boolean;
}

export interface QuestionAttemptLog {
  questionId: string;
  questionText: string;
  options: QuestionOption[];
  selectedAnswer?: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  shortcut?: string;
  commonMistake?: string;
  learningTip?: string;
  sectionId?: string;
  sectionName?: string;
  topicId?: string;
  topicName?: string;
  timeSpentSeconds?: number;
}

export interface SectionPerformance {
  sectionId: string;
  sectionName: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  marksObtained: number;
  totalMarks: number;
  accuracy: number;
  timeSpentSeconds: number;
}

export interface TopicPerformanceAnalysis {
  topicId: string;
  topicName: string;
  subjectId?: string;
  subjectName?: string;
  total: number;
  correct: number;
  accuracy: number;
  status: "strong" | "moderate" | "weak";
}

export interface TestAnalysisResult {
  testId: string;
  testTitle: string;
  examId: string;
  examName: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  rawMarks: number;
  totalMarks: number;
  accuracy: number;
  timeTakenSeconds: number;
  averageTimePerQuestion: number;
  sections: SectionPerformance[];
  topics: TopicPerformanceAnalysis[];
  weakTopics: string[];
  strongTopics: string[];
  aiSummary: string;
  recommendations: string[];
}

export interface PracticeSessionResult {
  id?: string;
  userId?: string;
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  subtopicId?: string;
  subtopicName?: string;
  difficulty: PracticeDifficulty | string;
  practiceMode: PracticeMode;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  accuracy: number;
  timeTakenSeconds: number;
  createdAt: string;
  questions: QuestionAttemptLog[];
}

export interface TopicPerformanceRecord {
  id?: string;
  userId: string;
  examId: string;
  subjectId: string;
  topicId: string;
  topicName?: string;
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  practiceSessions: number;
  lastPracticedAt: string;
}
