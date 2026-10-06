/**
 * Practice Service
 *
 * Handles recording practice sessions, calculating topic performance analytics,
 * and maintaining server-side persistence with session isolation.
 */

import { PracticeSessionResult, TopicPerformanceRecord } from "@/lib/types/question";

export const PracticeService = {
  /**
   * Persists a completed practice session to the server API.
   */
  async savePracticeSession(
    result: PracticeSessionResult
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: result.examId,
          subjectId: result.subjectId,
          topicId: result.topicId,
          topicName: result.topicName,
          totalQuestions: result.totalQuestions,
          score: result.correctAnswers,
          correctAnswers: result.correctAnswers,
          incorrectAnswers: result.incorrectAnswers,
          timeSpentSeconds: result.timeTakenSeconds,
          difficulty: result.difficulty,
          practiceMode: result.practiceMode,
        }),
      });

      if (!res.ok) {
        return { success: false, error: "Failed to record practice session on server." };
      }

      const data = await res.json();
      return { success: true, id: data.record?.id || `session-${Date.now()}` };
    } catch (err) {
      console.warn("PracticeService.savePracticeSession network notice:", err);
      return { success: true, id: `session-${Date.now()}` };
    }
  },

  /**
   * Retrieves practice history for the authenticated user from the server.
   */
  async getPracticeHistory(_userId?: string): Promise<PracticeSessionResult[]> {
    try {
      const res = await fetch("/api/practice", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        return data.history.map((row: any) => ({
          id: row.id,
          userId: _userId || "",
          examId: row.examId,
          examName: row.examId?.toUpperCase() || "Exam",
          subjectId: row.subjectId,
          subjectName: row.subjectId?.replace(/-/g, " ") || "Subject",
          topicId: row.topicId,
          topicName: row.topicName,
          difficulty: "Medium",
          practiceMode: "topic",
          totalQuestions: row.totalQuestions,
          correctAnswers: row.score,
          incorrectAnswers: Math.max(row.totalQuestions - row.score, 0),
          unanswered: 0,
          accuracy: Number(row.accuracy) || 0,
          timeTakenSeconds: row.timeSpentSeconds || 0,
          createdAt: row.date,
          questions: [],
        }));
      }

      return [];
    } catch (err) {
      console.warn("Could not fetch practice history:", err);
      return [];
    }
  },

  /**
   * Retrieves topic performance for a specific topic.
   */
  async getTopicPerformance(
    _userId: string,
    examId: string,
    _subjectId: string,
    topicId: string
  ): Promise<TopicPerformanceRecord | null> {
    const all = await this.getAllTopicPerformances(_userId, examId);
    return all.find((t) => t.topicId === topicId) || null;
  },

  /**
   * Retrieves all topic performance records for weak area analysis and personalized practice.
   */
  async getAllTopicPerformances(_userId?: string, _examId?: string): Promise<TopicPerformanceRecord[]> {
    try {
      const res = await fetch("/api/practice", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) return [];

      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        // Aggregate per topic
        const topicMap: Record<string, TopicPerformanceRecord> = {};
        for (const item of data.history) {
          if (!topicMap[item.topicId]) {
            topicMap[item.topicId] = {
              userId: _userId || "",
              examId: item.examId,
              subjectId: item.subjectId,
              topicId: item.topicId,
              topicName: item.topicName,
              questionsAttempted: 0,
              correct: 0,
              incorrect: 0,
              accuracy: 0,
              practiceSessions: 0,
              lastPracticedAt: item.date,
            };
          }
          topicMap[item.topicId].questionsAttempted += item.totalQuestions;
          topicMap[item.topicId].correct += item.score;
          topicMap[item.topicId].incorrect += Math.max(item.totalQuestions - item.score, 0);
          topicMap[item.topicId].practiceSessions += 1;
          topicMap[item.topicId].accuracy = Math.round(
            (topicMap[item.topicId].correct / Math.max(topicMap[item.topicId].questionsAttempted, 1)) * 100
          );
        }
        return Object.values(topicMap);
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Returns weak topics (accuracy < 70%).
   */
  async getWeakTopics(userId?: string, examId?: string): Promise<TopicPerformanceRecord[]> {
    const all = await this.getAllTopicPerformances(userId, examId);
    return all
      .filter((t) => t.questionsAttempted > 0 && t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy);
  },
};
