/**
 * User Profile & Authentication Domain Types
 */

export interface DbProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  selected_exam: string;
  selected_subject?: string;
  selected_topics?: string[];
  current_streak: number;
  longest_streak: number;
  total_questions_attempted: number;
  total_questions_correct: number;
  total_tests_completed: number;
  overall_accuracy: number;
  daily_question_goal: number;
  preferred_difficulty: "Easy" | "Medium" | "Hard" | "Adaptive";
  study_time_minutes?: number;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currentExam: string;
  examId: string;
  joinDate: string;
  questionsSolved: number;
  testsCompleted: number;
  currentStreak: number;
  longestStreak?: number;
  accuracy: number;
  totalAttempted?: number;
  totalCorrect?: number;
  studyTimeMinutes?: number;
  onboardingCompleted?: boolean;
  selectedSubject?: string;
  selectedTopics?: string[];
  progress?: number;
  preferences: {
    dailyQuestionGoal: number;
    preferredDifficulty: "Easy" | "Medium" | "Hard" | "Adaptive";
    defaultExam: string;
    notificationsEnabled: boolean;
    darkMode: boolean;
  };
  createdAt?: string;
}

/**
 * Helper to convert Supabase DbProfile row to frontend UserProfile
 */
export function mapDbProfileToUserProfile(db: DbProfile): UserProfile {
  return {
    id: db.id,
    name: db.full_name || "Aspirant",
    email: db.email,
    avatarUrl: db.avatar_url,
    currentExam: db.selected_exam || "None",
    examId: db.selected_exam || "",
    joinDate: db.created_at
      ? new Date(db.created_at).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "Recently",
    questionsSolved: db.total_questions_attempted || 0,
    testsCompleted: db.total_tests_completed || 0,
    currentStreak: typeof db.current_streak === "number" ? db.current_streak : 0,
    longestStreak: typeof db.longest_streak === "number" ? db.longest_streak : 0,
    accuracy: Number(db.overall_accuracy) || 0,
    totalAttempted: db.total_questions_attempted || 0,
    totalCorrect: db.total_questions_correct || 0,
    selectedSubject: db.selected_subject || "",
    selectedTopics: db.selected_topics || [],
    progress: 0,
    preferences: {
      dailyQuestionGoal: db.daily_question_goal || 20,
      preferredDifficulty: db.preferred_difficulty || "Adaptive",
      defaultExam: db.selected_exam || "",
      notificationsEnabled: true,
      darkMode: false,
    },
    createdAt: db.created_at,
  };
}

export function mapStoredProfileToUserProfile(p: {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  selectedExam: string;
  selectedSubject?: string;
  selectedTopics?: string[];
  currentStreak: number;
  longestStreak: number;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  totalTestsCompleted: number;
  overallAccuracy: number;
  dailyQuestionGoal: number;
  preferredDifficulty: "Easy" | "Medium" | "Hard" | "Adaptive";
  studyTimeMinutes?: number;
  onboardingCompleted?: boolean;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}): UserProfile {
  return {
    id: p.id,
    name: p.fullName || "Student",
    email: p.email,
    avatarUrl: p.avatarUrl || "forest",
    currentExam: p.selectedExam || "None",
    examId: p.selectedExam || "",
    joinDate: p.createdAt
      ? new Date(p.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "Today",
    questionsSolved: p.totalQuestionsAttempted ?? 0,
    testsCompleted: p.totalTestsCompleted ?? 0,
    currentStreak: typeof p.currentStreak === "number" ? p.currentStreak : 0,
    longestStreak: typeof p.longestStreak === "number" ? p.longestStreak : 0,
    accuracy: Number(p.overallAccuracy) || 0,
    totalAttempted: p.totalQuestionsAttempted ?? 0,
    totalCorrect: p.totalQuestionsCorrect ?? 0,
    studyTimeMinutes: p.studyTimeMinutes ?? 0,
    onboardingCompleted: p.onboardingCompleted ?? false,
    selectedSubject: p.selectedSubject || "",
    selectedTopics: p.selectedTopics || [],
    progress: p.progress ?? 0,
    preferences: {
      dailyQuestionGoal: p.dailyQuestionGoal || 20,
      preferredDifficulty: p.preferredDifficulty || "Adaptive",
      defaultExam: p.selectedExam || "",
      notificationsEnabled: true,
      darkMode: false,
    },
    createdAt: p.createdAt,
  };
}

