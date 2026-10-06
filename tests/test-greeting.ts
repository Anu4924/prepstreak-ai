import { getTimeBasedGreeting, getTimeGreetingInfo } from "../lib/utils/greeting";

const testHours = [6, 11, 12, 15, 17, 20, 22, 23, 2];
console.log("Testing time-based greetings across 24 hours:");
for (const h of testHours) {
  const d = new Date();
  d.setHours(h, 30, 0, 0);
  const info = getTimeGreetingInfo(d, true);
  console.log(`Hour ${h}:30 -> Greeting: "${info.greeting}" | Period: ${info.timeOfDay} | Emoji: ${info.emoji}`);
}

const now = new Date();
console.log("\nCurrent Local Time:", now.toLocaleTimeString());
console.log("Current Greeting:", getTimeBasedGreeting(now));
const currentInfo = getTimeGreetingInfo(now, true);
console.log("Current Greeting Info:", {
  greeting: currentInfo.greeting,
  period: currentInfo.timeOfDay,
  motivationalMessage: currentInfo.motivationalMessage,
});
