export interface DashboardStats {
  currentStreakDays: number;
  questionsSolved: number;
  accuracyPercentage: number;
  studyTimeFormatted: string;
  weeklyAccuracyGain: string;
}

export interface TodayGoal {
  targetQuestions: number;
  completedQuestions: number;
  progressPercentage: number;
  remainingQuestions: number;
}

export interface ContinueLearningItem {
  subjectName: string;
  topicName: string;
  progressPercentage: number;
  lastStudied: string;
  topicId: string;
  subjectId: string;
  examId: string;
}

export interface DailyChallengeInfo {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  timeLimitMinutes: number;
  xpReward: number;
  negativeMarking: boolean;
}

export interface WeakTopicItem {
  id: string;
  topicName: string;
  subjectName: string;
  accuracyPercentage: number;
  questionsAttempted: number;
  recommendedFocus: string;
  topicId: string;
  subjectId: string;
}

export interface ActivityTimelineItem {
  id: string;
  timeframe: string;
  actionTitle: string;
  resultBadge: string;
  timestamp: string;
}
