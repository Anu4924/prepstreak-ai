/**
 * AI Question Generator Contract (Prepared for Gemini API / AI Services)
 *
 * In Phase 2, this is a clean architectural boundary with no active API keys.
 */

import { DifficultyLevel } from "@/lib/types/exam";
import { Question } from "@/lib/types/question";

export interface GenerateQuestionParams {
  examName: string;
  subjectName: string;
  topicName: string;
  difficulty: DifficultyLevel;
  count: number;
}

export interface AiTutorExplanationParams {
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  topicName: string;
}

export interface QuestionGeneratorService {
  generateQuestions(params: GenerateQuestionParams): Promise<Question[]>;
  generateExplanation(params: AiTutorExplanationParams): Promise<string>;
  generateTopicSummary(topicName: string, subjectName: string): Promise<string>;
}
