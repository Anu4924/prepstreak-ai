import { UserProfile } from "@/lib/types/user";

export const MOCK_USER_PROFILE: UserProfile = {
  id: "user-001",
  name: "Student Aspirant",
  email: "student@prepstreak.ai",
  currentExam: "SBI PO",
  examId: "sbi-po",
  joinDate: "September 2026",
  questionsSolved: 428,
  totalAttempted: 428,
  totalCorrect: 334,
  testsCompleted: 14,
  currentStreak: 12,
  longestStreak: 15,
  accuracy: 78,
  preferences: {
    dailyQuestionGoal: 20,
    preferredDifficulty: "Adaptive",
    defaultExam: "sbi-po",
    notificationsEnabled: true,
    darkMode: false,
  },
};
