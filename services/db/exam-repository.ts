/**
 * Exam Repository Interface (Prepared for Database Integration)
 *
 * Designed to interface with PostgreSQL / Prisma / Supabase / MongoDB.
 * In Phase 2, mock data serves all views.
 */

import { Exam, Subject, Topic } from "@/lib/types/exam";
import { Question } from "@/lib/types/question";

export interface ExamRepository {
  getAllExams(): Promise<Exam[]>;
  getExamById(id: string): Promise<Exam | null>;
  getSubjectsByExamId(examId: string): Promise<Subject[]>;
  getTopicsBySubjectId(subjectId: string): Promise<Topic[]>;
  getTopicById(topicId: string): Promise<Topic | null>;
  getQuestionsByTopicId(topicId: string, limit?: number): Promise<Question[]>;
}
