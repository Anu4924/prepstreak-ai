/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import { Subject } from "@/lib/types/exam";
import { getExamById } from "./examCatalogue";

export interface MasterSubject {
  id: string;
  name: string;
  shortDescription: string;
  iconName: string;
  defaultWeightage: string;
}

export const MASTER_SUBJECTS: Record<string, MasterSubject> = {
  "quantitative-aptitude": {
    id: "quantitative-aptitude",
    name: "Quantitative Aptitude & Mathematics",
    shortDescription: "Arithmetic, data interpretation, algebraic equations, geometry, and number systems.",
    iconName: "Calculator",
    defaultWeightage: "25-35% of Exam Marks",
  },
  "reasoning-ability": {
    id: "reasoning-ability",
    name: "Reasoning Ability & Intelligence",
    shortDescription: "Logical deductions, analytical puzzles, seating arrangement, coding, and critical reasoning.",
    iconName: "BrainCircuit",
    defaultWeightage: "25-35% of Exam Marks",
  },
  "english-language": {
    id: "english-language",
    name: "English Language & Comprehension",
    shortDescription: "Reading comprehension, grammar rules, vocabulary, error detection, and sentence structuring.",
    iconName: "BookOpen",
    defaultWeightage: "20-30% of Exam Marks",
  },
  "general-awareness": {
    id: "general-awareness",
    name: "General Awareness & Current Affairs",
    shortDescription: "National & international events, government schemes, awards, sports, and static GK.",
    iconName: "Globe",
    defaultWeightage: "20-40% of Exam Marks",
  },
  "banking-awareness": {
    id: "banking-awareness",
    name: "Banking & Financial Awareness",
    shortDescription: "RBI monetary policy, commercial banking, financial markets, inflation, and fiscal economics.",
    iconName: "Landmark",
    defaultWeightage: "Mains & Interview Focus",
  },
  "computer-aptitude": {
    id: "computer-aptitude",
    name: "Computer Aptitude & Digital Literacy",
    shortDescription: "Computer hardware/software, MS Office, networking fundamentals, cybersecurity, and DBMS.",
    iconName: "BrainCircuit",
    defaultWeightage: "10-20% of Exam Marks",
  },
  "general-science": {
    id: "general-science",
    name: "General Science (Physics, Chemistry, Biology)",
    shortDescription: "Everyday physics concepts, chemical reactions, human anatomy, ecology, and technology.",
    iconName: "Globe",
    defaultWeightage: "15-25% of Exam Marks",
  },
  "tamil-language": {
    id: "tamil-language",
    name: "General Tamil & Tamil Literature",
    shortDescription: "Tamil grammar (Ilakkanam), Sangam literature (Ilakkiyam), Tamil scholars, and cultural heritage.",
    iconName: "BookOpen",
    defaultWeightage: "50% of Exam Marks (100 Qs)",
  },
  "state-general-studies": {
    id: "state-general-studies",
    name: "State General Studies & Administration",
    shortDescription: "State history, geography, governance, development administration, and welfare policies.",
    iconName: "Landmark",
    defaultWeightage: "30-50% of Exam Marks",
  },
  "pedagogy-child-dev": {
    id: "pedagogy-child-dev",
    name: "Child Development & Pedagogy",
    shortDescription: "Learning theories, cognitive development, inclusive education, curriculum, and teaching methodology.",
    iconName: "BrainCircuit",
    defaultWeightage: "20-30% of Exam Marks",
  },
  "engineering-technical": {
    id: "engineering-technical",
    name: "Engineering & Technical Domain",
    shortDescription: "Discipline-specific engineering principles, structural design, machines, circuits, and applied mechanics.",
    iconName: "BrainCircuit",
    defaultWeightage: "50-70% of Exam Marks",
  },
  "engineering-math": {
    id: "engineering-math",
    name: "Engineering Mathematics",
    shortDescription: "Linear algebra, calculus, differential equations, complex variables, and probability.",
    iconName: "Calculator",
    defaultWeightage: "13-15% of Exam Marks",
  },
  "medical-sciences": {
    id: "medical-sciences",
    name: "Medical & Health Sciences",
    shortDescription: "General medicine, paediatrics, surgery, pharmacology, clinical pathology, and preventive medicine.",
    iconName: "Globe",
    defaultWeightage: "70-80% of Exam Marks",
  },
  "legal-aptitude": {
    id: "legal-aptitude",
    name: "Legal Aptitude & Constitutional Law",
    shortDescription: "IPC, CrPC, Civil Procedure Code, Indian Evidence Act, constitutional law, and landmark precedents.",
    iconName: "Landmark",
    defaultWeightage: "60-80% of Exam Marks",
  },
  "agriculture-rural": {
    id: "agriculture-rural",
    name: "Agriculture & Rural Development",
    shortDescription: "Agronomy, soil science, irrigation, farm machinery, rural economy, and agricultural finance.",
    iconName: "Globe",
    defaultWeightage: "30-50% of Exam Marks",
  },
  "postal-knowledge": {
    id: "postal-knowledge",
    name: "Postal Manual & Departmental Rules",
    shortDescription: "Post Office Guide rules, postal savings schemes, transit sorting, and departmental manual volumes.",
    iconName: "BookOpen",
    defaultWeightage: "40-50% of Exam Marks",
  },
  "commerce-finance": {
    id: "commerce-finance",
    name: "Commerce, Finance & Management",
    shortDescription: "Financial accounting, cost accounting, corporate finance, management theories, and companies act.",
    iconName: "Landmark",
    defaultWeightage: "50% of Exam Marks",
  },
  "indian-economy": {
    id: "indian-economy",
    name: "Indian Economy & Social Issues",
    shortDescription: "Economic reforms, monetary policy, balance of payments, sustainable development, and poverty alleviation.",
    iconName: "Landmark",
    defaultWeightage: "25-40% of Exam Marks",
  },
  "upsc-gs-1": {
    id: "upsc-gs-1",
    name: "GS I: History, Heritage & Geography",
    shortDescription: "Indian culture, ancient/medieval/modern history, world history, and physical/human geography.",
    iconName: "Globe",
    defaultWeightage: "250 Marks (Mains Paper II)",
  },
  "upsc-gs-2": {
    id: "upsc-gs-2",
    name: "GS II: Polity, Governance & IR",
    shortDescription: "Indian Constitution, political structure, governance systems, social justice, and international relations.",
    iconName: "Landmark",
    defaultWeightage: "250 Marks (Mains Paper III)",
  },
  "upsc-gs-3": {
    id: "upsc-gs-3",
    name: "GS III: Economy, Tech & Ecology",
    shortDescription: "Economic development, agriculture, science & technology, biodiversity, and disaster management.",
    iconName: "BrainCircuit",
    defaultWeightage: "250 Marks (Mains Paper IV)",
  },
  "upsc-gs-4": {
    id: "upsc-gs-4",
    name: "GS IV: Ethics, Integrity & Aptitude",
    shortDescription: "Moral philosophies, public service ethics, emotional intelligence, and real-world case studies.",
    iconName: "BrainCircuit",
    defaultWeightage: "250 Marks (Mains Paper V)",
  },
  "insurance-awareness": {
    id: "insurance-awareness",
    name: "Insurance & Financial Market Principles",
    shortDescription: "Life & general insurance principles, IRDAI regulations, underwriting, risk management, and claims.",
    iconName: "Landmark",
    defaultWeightage: "30-50 Marks",
  },
  "environmental-science": {
    id: "environmental-science",
    name: "Environmental Studies & Ecology (EVS)",
    shortDescription: "Ecosystems, biodiversity, environmental pollution, conservation, natural resources, and food webs.",
    iconName: "Globe",
    defaultWeightage: "30 Qs / 30 Marks",
  },
  "tamil-culture": {
    id: "tamil-culture",
    name: "Tamil Society, Heritage & Thirukkural",
    shortDescription: "History of Tamil society, archaeological findings (Keezhadi), Thirukkural ethics, and self-respect movement.",
    iconName: "BookOpen",
    defaultWeightage: "Unit 8 of TNPSC Syllabus (40+ Qs)",
  },
  "language-tamil-hindi": {
    id: "language-tamil-hindi",
    name: "Regional Language (Tamil / Hindi / State)",
    shortDescription: "Language comprehension, grammar rules, literary appreciation, vocabulary, and linguistic pedagogy.",
    iconName: "BookOpen",
    defaultWeightage: "30 Qs / 30 Marks",
  },
  "teaching-research-aptitude": {
    id: "teaching-research-aptitude",
    name: "Teaching & Research Aptitude",
    shortDescription: "Teaching concepts, learner characteristics, research methods, thesis ethics, and communication in education.",
    iconName: "BrainCircuit",
    defaultWeightage: "UGC NET Paper 1 Core (20 Qs)",
  },
  "higher-education-polity": {
    id: "higher-education-polity",
    name: "Higher Education System & Governance",
    shortDescription: "Institutions of higher learning in India, NEP 2020, regulatory bodies (UGC, AICTE), governance, and polity.",
    iconName: "Landmark",
    defaultWeightage: "10-15 Qs in Paper 1",
  },
  "scientific-general-aptitude": {
    id: "scientific-general-aptitude",
    name: "Scientific Methodology & Research Aptitude",
    shortDescription: "Scientific data analysis, experimental modeling, laboratory standards, bioethics, and scientific reasoning.",
    iconName: "BrainCircuit",
    defaultWeightage: "30-50% of Technical Marks",
  },
  "core-engineering": {
    id: "core-engineering",
    name: "Core Engineering & Technical Discipline",
    shortDescription: "Discipline-specific engineering mechanics, circuits, thermal sciences, data structures, and structural analysis.",
    iconName: "BrainCircuit",
    defaultWeightage: "70-72 Marks in GATE / Technical Exams",
  },
};

// Fallback subject list if an exam has unmapped IDs
const DEFAULT_FALLBACK_SUBJECT_IDS = [
  "quantitative-aptitude",
  "reasoning-ability",
  "english-language",
  "general-awareness",
];

export function getSubjectsForExam(examId: string): Subject[] {
  // Query blueprint first for strict exam syllabus conformity
  try {
    // Dynamic import avoidance: examBlueprints is imported directly
    const { getExamBlueprint } = require("./examBlueprints");
    const bp = getExamBlueprint(examId);

    if (bp && bp.subjects && bp.subjects.length > 0) {
      return bp.subjects.map((s: { id: string; name: string; shortDescription: string; topics?: unknown[] }, index: number) => {
        const master = MASTER_SUBJECTS[s.id];
        const simulatedProgress = [68, 54, 76, 42, 35, 58, 62][index % 7] || 50;
        return {
          id: s.id,
          examId: examId,
          name: s.name,
          shortDescription: s.shortDescription || master?.shortDescription || "Core syllabus section.",
          topicCount: Array.isArray(s.topics) ? s.topics.length : 8,
          progress: simulatedProgress,
          weightage: master?.defaultWeightage || "Core Exam Section",
          iconName: master?.iconName || "BookOpen",
        };
      });
    }
  } catch {
    // Blueprint lookup fallback
  }

  const exam = getExamById(examId);

  // Subject IDs defined on the exam, or fallback
  const rawSubjectIds = exam?.subjects && exam.subjects.length > 0
    ? exam.subjects
    : DEFAULT_FALLBACK_SUBJECT_IDS;

  return rawSubjectIds.map((subId, index) => {
    const master = MASTER_SUBJECTS[subId] || {
      id: subId,
      name: subId
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      shortDescription: `Syllabus concepts, dynamic question sets, and test patterns for ${exam?.name || "exam"}.`,
      iconName: "BookOpen",
      defaultWeightage: "Core Exam Section",
    };

    const simulatedProgress = [68, 54, 76, 42, 35, 58, 62][index % 7] || 50;

    return {
      id: master.id,
      examId: examId,
      name: master.name,
      shortDescription: master.shortDescription,
      topicCount: 10,
      progress: simulatedProgress,
      weightage: master.defaultWeightage,
      iconName: master.iconName,
    };
  });
}

export function getSubjectById(subjectId: string, examId?: string): Subject | undefined {
  if (examId) {
    const examSubjects = getSubjectsForExam(examId);
    const match = examSubjects.find((s) => s.id === subjectId);
    if (match) return match;
  }

  const master = MASTER_SUBJECTS[subjectId];
  if (!master) {
    return undefined;
  }
  return {
    id: master.id,
    examId: examId || "sbi-po",
    name: master.name,
    shortDescription: master.shortDescription,
    topicCount: 10,
    progress: 55,
    weightage: master.defaultWeightage,
    iconName: master.iconName,
  };
}
