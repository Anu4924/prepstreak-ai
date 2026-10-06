import { Subject } from "@/lib/types/exam";
import { CENTRAL_EXAM_CATALOGUE } from "@/lib/data/examCatalogue";
import { getSubjectsForExam, getSubjectById, MASTER_SUBJECTS } from "@/lib/data/subjectRegistry";

// Generate subjects across all exams in the catalogue
export const MOCK_SUBJECTS: Subject[] = CENTRAL_EXAM_CATALOGUE.flatMap((exam) =>
  getSubjectsForExam(exam.id)
);

export { getSubjectsForExam, getSubjectById, MASTER_SUBJECTS };
