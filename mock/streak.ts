export interface DayStreakStatus {
  dayName: string;
  dayShort: string;
  dateNumber: number;
  completed: boolean;
  isToday: boolean;
  questionsSolved: number;
}

export interface MilestoneItem {
  days: number;
  title: string;
  status: "unlocked" | "current" | "locked";
  reward: string;
  description: string;
}

export const MOCK_STREAK_DATA = {
  currentStreakDays: 12,
  longestStreakDays: 21,
  todayGoal: {
    target: 20,
    completed: 18,
    progressPercentage: 90,
  },
  weeklyCalendar: [
    { dayName: "Monday", dayShort: "Mon", dateNumber: 22, completed: true, isToday: false, questionsSolved: 25 },
    { dayName: "Tuesday", dayShort: "Tue", dateNumber: 23, completed: true, isToday: false, questionsSolved: 30 },
    { dayName: "Wednesday", dayShort: "Wed", dateNumber: 24, completed: true, isToday: false, questionsSolved: 20 },
    { dayName: "Thursday", dayShort: "Thu", dateNumber: 25, completed: true, isToday: false, questionsSolved: 35 },
    { dayName: "Friday", dayShort: "Fri", dateNumber: 26, completed: true, isToday: false, questionsSolved: 40 },
    { dayName: "Saturday", dayShort: "Sat", dateNumber: 27, completed: true, isToday: false, questionsSolved: 28 },
    { dayName: "Sunday", dayShort: "Sun", dateNumber: 28, completed: false, isToday: true, questionsSolved: 18 },
  ] as DayStreakStatus[],
  milestones: [
    {
      days: 7,
      title: "Consistent Starter",
      status: "unlocked",
      reward: "Bronze Badge + 100 XP",
      description: "Studied 7 days in a row without breaking habit.",
    },
    {
      days: 14,
      title: "Fortnight Focus",
      status: "current",
      reward: "Silver Badge + 250 XP",
      description: "Only 2 days remaining to unlock this milestone.",
    },
    {
      days: 30,
      title: "Discipline Master",
      status: "locked",
      reward: "Gold Badge + 500 XP",
      description: "Build an unbreakable 1-month competitive exam habit.",
    },
    {
      days: 60,
      title: "Prelims Ready",
      status: "locked",
      reward: "Platinum Badge + 1000 XP",
      description: "Two straight months of top-tier exam preparation.",
    },
    {
      days: 100,
      title: "Centurion Scholar",
      status: "locked",
      reward: "Diamond Badge + Hall of Fame",
      description: "Elite 1% aspirants who never miss a single day.",
    },
  ] as MilestoneItem[],
};
