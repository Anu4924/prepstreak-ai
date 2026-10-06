export type ExamStatus = "available" | "coming_soon";

export type DifficultyLevel = "Easy" | "Medium" | "Hard";

export type DifficultyScale =
  | "Beginner"
  | "Easy"
  | "Moderate"
  | "Exam Level"
  | "Hard";

export type ExamCategory =
  | "Banking & Finance"
  | "SSC"
  | "Railways"
  | "UPSC"
  | "TNPSC"
  | "State PSC"
  | "Police & Uniformed Services"
  | "Defence"
  | "Teaching"
  | "Engineering & Technical"
  | "Medical & Health"
  | "Central Government Jobs"
  | "Postal"
  | "Court & Judiciary"
  | "Agriculture & Rural Development"
  | "Other Competitive Exams";

export interface Subtopic {
  id: string;
  name: string;
  topicId: string;
  subjectId: string;
  examId?: string;
  description: string;
  difficulty?: DifficultyScale | DifficultyLevel;
  questionTypes?: string[];
  questionPatterns?: string[];
  importance?: "High" | "Medium" | "Very High" | "Critical";
  estimatedMinutes?: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  examId: string;
  name: string;
  difficulty: DifficultyLevel | DifficultyScale;
  progress: number;
  lastPracticed: string;
  totalQuestions: number;
  completedQuestions: number;
  estimatedHours: number;
  importance: "High" | "Medium" | "Very High";
  description: string;
  subtopics?: Subtopic[];
  questionTypes?: string[];
  examLevelWeightage?: string;
}

export interface Subject {
  id: string;
  examId: string;
  name: string;
  shortDescription: string;
  topicCount: number;
  progress: number;
  weightage: string;
  iconName: string;
  topics?: Topic[];
}

export interface Exam {
  id: string;
  name: string;
  officialName: string;
  organization: string;
  category: ExamCategory | string;
  subCategory: string;
  description: string;
  difficulty: DifficultyLevel | DifficultyScale;
  eligibility: string;
  examPattern: string;
  subjects: string[]; // Subject IDs or names
  topics?: string[] | number;

  // Compatibility fields
  shortName: string;
  tagline: string;
  level: string;
  status: ExamStatus;
  subjectCount: number;
  totalQuestions: number;
  durationMinutes: number;
  highlights: string[];
}

export interface ExamTopicBlueprint {
  id: string;
  name: string;
  description?: string;
  subtopics: string[];
  questionTypes: string[];
  weightage: string;
  difficulty?: DifficultyScale;
}

export interface ExamSubjectBlueprint {
  id: string;
  name: string;
  shortDescription: string;
  topics: ExamTopicBlueprint[];
}

export interface ExamSectionBlueprint {
  id: string;
  name: string;
  subjectId: string;
  questionCount: number;
  durationMinutes: number;
  marksPerQuestion: number;
  negativeMarks: number;
  cutoffExpected?: number;
}

export interface ExamBlueprint {
  examId: string;
  examName: string;
  organization: string;
  category: ExamCategory | string;
  subCategory?: string;
  subjects: ExamSubjectBlueprint[];
  questionTypes: string[];
  difficultyLevels: DifficultyScale[];
  examPattern: string;
  sections: ExamSectionBlueprint[];
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  markingScheme: {
    positiveMarks: number;
    negativeMarks: number;
    penaltyDescription: string;
  };
  negativeMarking: boolean;
  syllabusVersion: string;
  sourceMetadata?: {
    officialNotificationUrl?: string;
    lastUpdated: string;
    notes?: string;
  };
}

export interface TestBlueprint {
  examId: string;
  examName: string;
  testTitle: string;
  type: "full_mock" | "sectional" | "mini_mock";
  sections: ExamSectionBlueprint[];
  totalDurationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  markingScheme: string;
  negativeMarking: boolean;
  difficultyDistribution?: {
    easyPercent: number;
    moderatePercent: number;
    hardPercent: number;
  };
}
