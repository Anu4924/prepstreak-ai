export interface AccuracyDataPoint {
  date: string;
  accuracy: number;
}

export interface DayQuestionsPoint {
  day: string;
  solved: number;
  target: number;
}

export interface SubjectPerformancePoint {
  subject: string;
  accuracy: number;
  totalQuestions: number;
}

export interface TopicProgressDetail {
  name: string;
  subject: string;
  accuracy: number;
  speedSecs: number;
  status: "strong" | "needs_improvement" | "balanced";
}

export const MOCK_PROGRESS_SUMMARY = {
  questionsSolved: 428,
  accuracy: 78,
  testsCompleted: 14,
  studyTime: "24h 35m",
};

export const MOCK_ACCURACY_OVER_TIME: AccuracyDataPoint[] = [
  { date: "Day 1-3", accuracy: 62 },
  { date: "Day 4-6", accuracy: 68 },
  { date: "Day 7-9", accuracy: 71 },
  { date: "Day 10-12", accuracy: 78 },
];

export const MOCK_QUESTIONS_PER_DAY: DayQuestionsPoint[] = [
  { day: "Mon", solved: 25, target: 20 },
  { day: "Tue", solved: 30, target: 20 },
  { day: "Wed", solved: 20, target: 20 },
  { day: "Thu", solved: 35, target: 20 },
  { day: "Fri", solved: 40, target: 20 },
  { day: "Sat", solved: 28, target: 20 },
  { day: "Sun", solved: 18, target: 20 },
];

export const MOCK_SUBJECT_PERFORMANCES: SubjectPerformancePoint[] = [
  { subject: "Reasoning Ability", accuracy: 82, totalQuestions: 154 },
  { subject: "Quantitative Aptitude", accuracy: 71, totalQuestions: 120 },
  { subject: "English Language", accuracy: 85, totalQuestions: 94 },
  { subject: "General Awareness", accuracy: 64, totalQuestions: 35 },
  { subject: "Banking Awareness", accuracy: 58, totalQuestions: 25 },
];

export const MOCK_STRONG_TOPICS: TopicProgressDetail[] = [
  {
    name: "Alphabet & Sequence",
    subject: "Reasoning",
    accuracy: 95,
    speedSecs: 24,
    status: "strong",
  },
  {
    name: "Simplification & Approximation",
    subject: "Quant",
    accuracy: 92,
    speedSecs: 28,
    status: "strong",
  },
  {
    name: "Inequality",
    subject: "Reasoning",
    accuracy: 90,
    speedSecs: 30,
    status: "strong",
  },
  {
    name: "Quadratic Equations",
    subject: "Quant",
    accuracy: 88,
    speedSecs: 35,
    status: "strong",
  },
];

export const MOCK_IMPROVEMENT_TOPICS: TopicProgressDetail[] = [
  {
    name: "Syllogism",
    subject: "Reasoning",
    accuracy: 54,
    speedSecs: 58,
    status: "needs_improvement",
  },
  {
    name: "Banking Awareness",
    subject: "Banking",
    accuracy: 58,
    speedSecs: 48,
    status: "needs_improvement",
  },
  {
    name: "Percentage",
    subject: "Quant",
    accuracy: 61,
    speedSecs: 52,
    status: "needs_improvement",
  },
  {
    name: "Data Interpretation (Caselets)",
    subject: "Quant",
    accuracy: 58,
    speedSecs: 75,
    status: "needs_improvement",
  },
];

export const MOCK_RECOMMENDED_PRACTICE = [
  {
    title: "Syllogism Possibility Drills",
    reason: "Low accuracy (54%) in latest timed mock test",
    action: "Practice 15 Questions",
    subject: "Reasoning",
  },
  {
    title: "Caselet DI Calculation Shortcuts",
    reason: "Speed is 30% slower than SBI PO cutoff average",
    action: "Review AI Shortcuts",
    subject: "Quant",
  },
  {
    title: "RBI Monetary Policy Recent Updates",
    reason: "Scheduled in Today's recommended revision queue",
    action: "Read AI Concept Summary",
    subject: "Banking Awareness",
  },
];
