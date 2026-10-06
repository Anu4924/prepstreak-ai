import { Subtopic, DifficultyScale } from "@/lib/types/exam";
import { getExamBlueprint } from "./examBlueprints";

/**
 * PREPSTREAK AI — SUBTOPIC REGISTRY
 *
 * Provides granular subtopic lookup and resolution for any Exam -> Subject -> Topic node.
 * Enables exam-tailored Learn, Practice, and Diagnostic Test modes.
 */

// Global fallback subtopics for well-known topic patterns if not specified in blueprint
const DEFAULT_SUBTOPICS_BY_TOPIC: Record<string, string[]> = {
  "seating-arrangement": [
    "Linear Arrangement (Single & Dual Row)",
    "Circular Arrangement (Inward & Outward Facing)",
    "Floor-Based Puzzle",
    "Box & Rack Arrangement",
    "Square & Triangular Seating",
    "Uncertain Number of Persons",
  ],
  puzzles: [
    "Day-Month-Year Scheduling Puzzle",
    "Designation & Hierarchy Based Puzzle",
    "Multi-Variable Tabular Classification",
    "Comparison & Ranking Puzzle",
  ],
  syllogism: [
    "Only a Few / Only Conditions",
    "Possibility & Definite False Conclusions",
    "Reverse Syllogism (Mains Level)",
    "Sequential 3-4 Statement Deductions",
  ],
  inequalities: [
    "Direct Statement Inequality",
    "Multi-Statement Linked Inequality",
    "Definitely True / Definitely False Checks",
    "Coded Inequality (Mains Level)",
  ],
  "coding-decoding": [
    "Fictitious Language / Substitution Coding",
    "Condition-Based Symbol & Letter Coding",
    "Matrix Pattern Coding",
    "Binary & Step-Shift Coding",
  ],
  "blood-relations": [
    "Family Tree Generation",
    "Coded Blood Relations",
    "Bloodline Linked Seating Puzzles",
  ],
  "direction-sense": [
    "Pythagoras Distance & Shortest Path",
    "Shadow & Sun Position Angle Analysis",
    "Coded Direction Sense (Mains Pattern)",
  ],
  "data-interpretation": [
    "Bar & Line Graph Combined DI",
    "Dual Pie Chart DI with Degrees & Percentages",
    "Missing Data Table DI",
    "Caselet & Paragraph DI",
    "Arithmetic Concept DI (Time & Work / Profit Loss)",
  ],
  percentage: [
    "Direct Percentage & Base Change",
    "Percentage Increase / Decrease & Constant Product Rule",
    "Successive Percentage & Net Effect Formula",
    "Expenditure, Price and Consumption Equivalence",
    "Population Growth & Machine Depreciation",
    "Election & Voting Percentage Problems",
  ],
  "profit-and-loss": [
    "Cost Price, Selling Price & Profit Percent",
    "Marked Price & Single Equivalent Discount",
    "Dishonest Shopkeeper Weight Fraud Calculations",
    "Successive Discounts & Free Schemes (Buy X Get Y Free)",
  ],
  "time-and-work": [
    "LCM Efficiency Method for Individuals",
    "Work Done on Alternate Days",
    "Workers Leaving or Joining Mid-Work",
    "Men, Women & Children Efficiency Equivalents",
    "Pipes and Cisterns with Leakage Calculation",
  ],
  algebra: [
    "Standard Algebraic Identities & Expansion",
    "Condition When a + b + c = 0, a^3 + b^3 + c^3 = 3abc",
    "x + 1/x = k Transformations (Squares, Cubes, Powers)",
    "Quadratic Roots & Symmetric Polynomials",
  ],
  geometry: [
    "Triangle Properties: Incentre, Circumcentre, Orthocentre, Centroid",
    "Similar & Congruent Triangles Theorems",
    "Circle Chords, Secants and Direct/Transverse Tangents",
    "Cyclic Quadrilateral Angle and Side Relations",
  ],
  trigonometry: [
    "Standard Trigonometric Ratios Table (0, 30, 45, 60, 90)",
    "Complementary Angle Conversions: sin(90-x) = cos(x)",
    "Fundamental Identities: sin^2 + cos^2 = 1, sec^2 - tan^2 = 1",
    "Heights and Distances: Elevation, Depression & Shadow Lengths",
  ],
  "reading-comprehension": [
    "Economic & Editorial Passages",
    "Author Tone & Main Idea Extraction",
    "Direct & Fact-Finding Questions",
    "Contextual Synonyms & Antonyms",
    "Inference & Conclusion Deductions",
  ],
  "error-detection": [
    "Subject-Verb Agreement Errors",
    "Preposition & Phrasal Verb Misuse",
    "Conditional Sentences & Inversion Rules",
    "Part-Wise Sentence Error Identification",
  ],
  "cloze-test": [
    "Grammar-Based Blank Fillers",
    "Vocabulary Nuance & Collocations",
    "Paragraph Coherence Fillers",
  ],
  "para-jumbles": [
    "Finding Mandatory Pairs & Link Words",
    "Identifying Independent Opening Sentences",
    "Chronological & Argument Sequence Ordering",
  ],
  "general-science": [
    "SI Units, Motion Laws, Gravitation & Work-Energy",
    "Chemical Formulas, Periodic Table & Acids/Bases",
    "Human Body Systems: Circulatory, Digestive, Nervous",
    "Plant Nutrition, Photosynthesis & Plant Hormones",
  ],
  "indian-polity": [
    "Preamble & Fundamental Rights (Articles 12-35)",
    "Directive Principles of State Policy & Fundamental Duties",
    "President, Prime Minister, Union Council of Ministers",
    "Supreme Court, High Courts & Judicial Writs",
    "Important Constitutional Amendments (42nd, 44th, 73rd, 86th, 101st)",
  ],
  "modern-history": [
    "1857 Revolt Causes, Leaders & Centers",
    "Important INC Sessions & Presidents (1885-1947)",
    "Non-Cooperation, Civil Disobedience & Quit India Movements",
    "Socio-Religious Reform Movements (Brahmo Samaj, Arya Samaj)",
  ],
  "tamil-grammar": [
    "பொருத்துதல்: பொருத்தமான பொருளைத் தேர்வு செய்தல்",
    "வேர்ச்சொல்லைக் கொடுத்து வினைமுற்று, வினையெச்சம் உருவாக்கல்",
    "சந்திப் பிழையற்ற தொடரைக் கண்டறிதல் (வல்லினம் மிகும் & மிகா இடங்கள்)",
    "அகர வரிசைப்படி சொற்களைச் சீர் செய்தல்",
    "எதுகை, மோனை, இயைபு தொடர் நயங்களை அறிதல்",
  ],
  thirukkural: [
    "திருக்குறள் தொடர்பான செய்திகள், மேற்கோள்கள், சிறப்புப் பெயர்கள்",
    "எட்டுத்தொகை & பத்துப்பாட்டு நூல்கள் மற்றும் புலவர் மேற்கோள்கள்",
    "ஐம்பெருங்காப்பியங்கள் & ஐஞ்சிறுங்காப்பியங்கள்",
    "பக்தி இலக்கியம் (தேவாரம், நாலாயிர திவ்வியப் பிரபந்தம்)",
  ],
  "rbi-monetary-policy": [
    "Policy Rates & Liquidity Adjustment Facility (LAF)",
    "Reserve Ratios: Cash Reserve Ratio (CRR) & Statutory Liquidity Ratio (SLR)",
    "Monetary Policy Committee Framework",
  ],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Retrieve subtopics for an exact Exam, Subject, and Topic combination
 */
export function getSubtopicsForTopic(
  examId: string,
  subjectId: string,
  topicId: string
): Subtopic[] {
  const bp = getExamBlueprint(examId);

  // 1. Check blueprint subjects
  const subjectBp = bp.subjects.find((s) => s.id === subjectId);
  const topicBp = subjectBp?.topics.find((t) => t.id === topicId);

  let rawSubtopicNames: string[] = [];

  if (topicBp && topicBp.subtopics && topicBp.subtopics.length > 0) {
    rawSubtopicNames = topicBp.subtopics;
  } else if (DEFAULT_SUBTOPICS_BY_TOPIC[topicId]) {
    rawSubtopicNames = DEFAULT_SUBTOPICS_BY_TOPIC[topicId];
  } else {
    // Generate intelligent default subtopics for any unknown topic
    const baseName = topicId
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    rawSubtopicNames = [
      `${baseName} Core Concepts & Definitions`,
      `${baseName} Standard Formulas & Rules`,
      `${baseName} Exam-Level Short-cuts & Problem Solving`,
      `${baseName} Previous Year Question Variations`,
    ];
  }

  const difficultyScale: DifficultyScale = topicBp?.difficulty || "Exam Level";

  return rawSubtopicNames.map((name, index) => {
    const id = slugify(name) || `subtopic-${index + 1}`;
    return {
      id,
      name,
      topicId,
      subjectId,
      examId,
      description: `Targeted concept clarity, formula applications, and examination drills for ${name} (${bp.examName}).`,
      difficulty: difficultyScale,
      questionTypes: topicBp?.questionTypes || bp.questionTypes,
      importance: index === 0 || index === 1 ? "Very High" : "High",
      estimatedMinutes: 20,
    };
  });
}

/**
 * Retrieve a specific subtopic by ID
 */
export function getSubtopicById(
  subtopicId: string,
  examId?: string,
  subjectId?: string,
  topicId?: string
): Subtopic | undefined {
  const targetExamId = examId || "sbi-po";
  const targetSubjectId = subjectId || "reasoning-ability";
  const targetTopicId = topicId || "seating-arrangement";

  const subtopics = getSubtopicsForTopic(targetExamId, targetSubjectId, targetTopicId);
  const match = subtopics.find((st) => st.id === subtopicId || slugify(st.name) === subtopicId);

  if (match) {
    return match;
  }

  // Fallback: check across the target topic directly
  return {
    id: subtopicId,
    name: subtopicId
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    topicId: targetTopicId,
    subjectId: targetSubjectId,
    examId: targetExamId,
    description: `Subtopic practice and diagnostic drills for ${subtopicId}.`,
    difficulty: "Exam Level",
    importance: "High",
    estimatedMinutes: 20,
  };
}

/**
 * Get all subtopics for an entire exam
 */
export function getAllSubtopicsForExam(examId: string): Subtopic[] {
  const bp = getExamBlueprint(examId);
  const allSubtopics: Subtopic[] = [];

  for (const subject of bp.subjects) {
    for (const topic of subject.topics) {
      allSubtopics.push(...getSubtopicsForTopic(examId, subject.id, topic.id));
    }
  }

  return allSubtopics;
}
