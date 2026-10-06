import { DbProfile, UserProfile } from "@/lib/types/user";

export const ProfileService = {
  /**
   * Retrieves user profile from the server for the current session.
   */
  async getProfile(_userId?: string): Promise<UserProfile | null> {
    try {
      const res = await fetch("/api/profile", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      if (data.success && data.profile) {
        return data.profile as UserProfile;
      }

      return null;
    } catch (err) {
      console.warn("ProfileService.getProfile error:", err);
      return null;
    }
  },

  /**
   * Updates profile fields for the authenticated user.
   */
  async updateProfile(
    _userId: string,
    updates: Partial<DbProfile>
  ): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to update profile." };
      }

      return { success: true, profile: data.profile };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      return { success: false, error: msg };
    }
  },

  /**
   * Updates user study preferences (exam, daily goal, difficulty).
   */
  async updatePreferences(
    userId: string,
    preferences: {
      defaultExam?: string;
      dailyQuestionGoal?: number;
      preferredDifficulty?: "Easy" | "Medium" | "Hard" | "Adaptive";
    }
  ): Promise<{ success: boolean; error?: string }> {
    const payload: Partial<DbProfile> = {};

    if (preferences.defaultExam) payload.selected_exam = preferences.defaultExam;
    if (preferences.dailyQuestionGoal) payload.daily_question_goal = preferences.dailyQuestionGoal;
    if (preferences.preferredDifficulty) payload.preferred_difficulty = preferences.preferredDifficulty;

    const res = await this.updateProfile(userId, payload);
    return { success: res.success, error: res.error };
  },
};
