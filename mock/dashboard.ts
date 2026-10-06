import {
  DashboardStats,
  TodayGoal,
  ContinueLearningItem,
  DailyChallengeInfo,
  WeakTopicItem,
  ActivityTimelineItem,
} from "@/lib/types/analytics";

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  currentStreakDays: 12,
  questionsSolved: 428,
  accuracyPercentage: 78,
  studyTimeFormatted: "24h 35m",
  weeklyAccuracyGain: "+8% this week",
};

export const MOCK_TODAY_GOAL: TodayGoal = {
  targetQuestions: 20,
  completedQuestions: 18,
  progressPercentage: 90,
  remainingQuestions: 2,
};

export const MOCK_CONTINUE_LEARNING: ContinueLearningItem = {
  subjectName: "Reasoning",
  topicName: "Coding-Decoding",
  progressPercentage: 65,
  lastStudied: "Yesterday",
  topicId: "coding-decoding",
  subjectId: "reasoning",
  examId: "sbi-po",
};

export const MOCK_DAILY_CHALLENGE: DailyChallengeInfo = {
  id: "challenge-today",
  title: "Daily Challenge",
  description: "20 questions • Mixed subjects • Timed",
  questionCount: 20,
  timeLimitMinutes: 15,
  xpReward: 100,
  negativeMarking: true,
};

export const MOCK_WEAK_TOPICS: WeakTopicItem[] = [
  {
    id: "wt-1",
    topicName: "Syllogism",
    subjectName: "Reasoning",
    accuracyPercentage: 54,
    questionsAttempted: 42,
    recommendedFocus: "Practice 'Only a few' possibility conditions",
    topicId: "syllogism",
    subjectId: "reasoning",
  },
  {
    id: "wt-2",
    topicName: "Percentage",
    subjectName: "Quantitative Aptitude",
    accuracyPercentage: 61,
    questionsAttempted: 38,
    recommendedFocus: "Master fraction-to-percentage mental calculation",
    topicId: "percentage",
    subjectId: "quantitative-aptitude",
  },
  {
    id: "wt-3",
    topicName: "Banking Awareness",
    subjectName: "Banking & Financial Awareness",
    accuracyPercentage: 63,
    questionsAttempted: 50,
    recommendedFocus: "Review latest RBI Monetary Policy committee rates",
    topicId: "rbi-monetary-policy",
    subjectId: "banking-awareness",
  },
];

export const MOCK_RECENT_ACTIVITY: ActivityTimelineItem[] = [
  {
    id: "act-1",
    timeframe: "Today",
    actionTitle: "Completed Coding-Decoding Practice",
    resultBadge: "18/20 correct",
    timestamp: "2 hours ago",
  },
  {
    id: "act-2",
    timeframe: "Yesterday",
    actionTitle: "Completed Quantitative Aptitude Test",
    resultBadge: "72% score",
    timestamp: "Yesterday, 6:45 PM",
  },
  {
    id: "act-3",
    timeframe: "2 days ago",
    actionTitle: "Learned Syllogism",
    resultBadge: "Topic completed",
    timestamp: "Oct 29, 2026",
  },
];
