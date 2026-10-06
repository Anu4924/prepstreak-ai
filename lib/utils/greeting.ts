/**
 * Time-based greetings and motivational messages tailored for competitive exam aspirants.
 */

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface TimeGreetingInfo {
  greeting: string;
  timeOfDay: TimeOfDay;
  motivationalMessage: string;
  emoji: string;
}

/**
 * Returns the appropriate time-based greeting according to local device time:
 * - 05:00 - 11:59 -> Good morning
 * - 12:00 - 16:59 -> Good afternoon
 * - 17:00 - 21:59 -> Good evening
 * - 22:00 - 04:59 -> Good evening (Late-night study)
 */
export function getTimeBasedGreeting(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }
  // 17:00 - 04:59 is evening / late night session
  return "Good evening";
}

/**
 * Returns detailed time-of-day information, including contextual motivation.
 */
export function getTimeGreetingInfo(
  date: Date = new Date(),
  isBrandNewUser: boolean = false
): TimeGreetingInfo {
  const hour = date.getHours();

  let timeOfDay: TimeOfDay;
  let greeting: string;
  let motivationalMessage: string;
  let emoji: string;

  if (hour >= 5 && hour < 12) {
    timeOfDay = "morning";
    greeting = "Good morning";
    emoji = "🌅";
    motivationalMessage = isBrandNewUser
      ? "Welcome to PrepStreak AI! Start your first practice session to build your study habit."
      : "A fresh morning to build your streak and master high-yield topics.";
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = "afternoon";
    greeting = "Good afternoon";
    emoji = "☀️";
    motivationalMessage = isBrandNewUser
      ? "Welcome to PrepStreak AI! Start your first practice session to build your study habit."
      : "Keep your study momentum strong. A quick practice set makes all the difference.";
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = "evening";
    greeting = "Good evening";
    emoji = "🌆";
    motivationalMessage = isBrandNewUser
      ? "Welcome to PrepStreak AI! Start your first practice session to build your study habit."
      : "Great time for a focused practice session and concept revision.";
  } else {
    // 22:00 to 04:59 (Late night)
    timeOfDay = "night";
    greeting = "Good evening";
    emoji = "🌙";
    motivationalMessage = isBrandNewUser
      ? "Welcome to PrepStreak AI! Start your first practice session to build your study habit."
      : "Late-night dedication pays off. Stay consistent and keep moving forward.";
  }

  return {
    greeting,
    timeOfDay,
    motivationalMessage,
    emoji,
  };
}
