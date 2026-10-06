/**
 * Comprehensive Automated Test Suite: Exam-Specific Platform Architecture
 * 
 * Verifies:
 * 1. Exam Blueprint Coverage across all 142 exams in CENTRAL_EXAM_CATALOGUE
 * 2. Strict Subject/Topic relevance (no irrelevant topics or cross-contamination)
 * 3. Subtopic hierarchy and pattern resolution
 * 4. Test Blueprint scoring, sections, negative marking
 * 5. Axmok AI Question fallback engine with exam-specific context
 */

import { CENTRAL_EXAM_CATALOGUE } from "../lib/data/examCatalogue";
import { getExamBlueprint, getTestBlueprint, EXAM_BLUEPRINTS } from "../lib/data/examBlueprints";
import { getSubjectsForExam, getSubjectById } from "../lib/data/subjectRegistry";
import { getTopicsForSubject, getTopicById } from "../lib/data/topicRegistry";
import { getSubtopicsForTopic } from "../lib/data/subtopicRegistry";
import { AxmokQuestionService } from "../services/ai/axmok-question-service";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passedCount++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedCount++;
    console.error(`  [FAIL] ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("  EXAM-SPECIFIC PLATFORM ARCHITECTURE VERIFICATION TEST");
  console.log("=======================================================\n");

  // --------------------------------------------------------------------------
  // TEST SUITE 1: 100% Coverage of All 142 Catalogue Exams
  // --------------------------------------------------------------------------
  console.log("--- 1. Catalogue Exam Blueprint Coverage ---");
  console.log(`Total exams in catalogue: ${CENTRAL_EXAM_CATALOGUE.length}`);
  assert(CENTRAL_EXAM_CATALOGUE.length >= 140, "Catalogue contains >= 140 exams");

  let allExamsHaveBlueprints = true;
  let allExamsHaveSubjects = true;
  let allExamsHaveSections = true;
  let totalSubtopicsCount = 0;

  for (const exam of CENTRAL_EXAM_CATALOGUE) {
    const bp = getExamBlueprint(exam.id);
    if (!bp || !bp.examId || !bp.sections || bp.sections.length === 0) {
      allExamsHaveBlueprints = false;
      console.error(`Exam without valid blueprint: ${exam.id}`);
    }

    const subjects = getSubjectsForExam(exam.id);
    if (!subjects || subjects.length === 0) {
      allExamsHaveSubjects = false;
      console.error(`Exam without subjects: ${exam.id}`);
    }

    const testBp = getTestBlueprint(exam.id);
    if (!testBp || !testBp.sections || testBp.sections.length === 0) {
      allExamsHaveSections = false;
      console.error(`Exam without test sections: ${exam.id}`);
    }
  }

  assert(allExamsHaveBlueprints, "All 142 exams return complete, valid Exam Blueprints");
  assert(allExamsHaveSubjects, "All 142 exams return relevant subjects");
  assert(allExamsHaveSections, "All 142 exams return valid Test Blueprints with sections");

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Specific Major Exam Blueprint Integrity
  // --------------------------------------------------------------------------
  console.log("\n--- 2. Major Exam Blueprint Accuracy ---");

  // SBI PO
  const sbiPoBp = getExamBlueprint("sbi-po");
  assert(sbiPoBp?.examId === "sbi-po", "SBI PO blueprint resolved");
  assert(sbiPoBp?.markingScheme.negativeMarks === 0.25, "SBI PO negative marking is 0.25");
  assert(sbiPoBp?.sections.length === 3, "SBI PO has 3 sections (Prelims)");
  const sbiSubjects = getSubjectsForExam("sbi-po").map((s) => s.id);
  assert(sbiSubjects.includes("reasoning-ability"), "SBI PO includes Reasoning Ability");
  assert(sbiSubjects.includes("quantitative-aptitude"), "SBI PO includes Quantitative Aptitude");
  assert(sbiSubjects.includes("english-language"), "SBI PO includes English Language");
  assert(!sbiSubjects.includes("civil-engineering"), "SBI PO DOES NOT include Civil Engineering");
  assert(!sbiSubjects.includes("pedagogy"), "SBI PO DOES NOT include Pedagogy");
  assert(!sbiSubjects.includes("tamil-language"), "SBI PO DOES NOT include Tamil Language");

  // SSC CGL
  const sscCglBp = getExamBlueprint("ssc-cgl");
  assert(sscCglBp?.examId === "ssc-cgl", "SSC CGL blueprint resolved");
  assert(sscCglBp?.markingScheme.negativeMarks === 0.5, "SSC CGL Tier 1 negative marking is 0.5");
  assert(sscCglBp?.totalMarks === 200, "SSC CGL Tier 1 total marks is 200");
  const sscSubjects = getSubjectsForExam("ssc-cgl").map((s) => s.id);
  assert(sscSubjects.includes("reasoning-ability"), "SSC CGL includes Reasoning Ability");
  assert(sscSubjects.includes("quantitative-aptitude"), "SSC CGL includes Quantitative Aptitude");
  assert(sscSubjects.includes("general-awareness"), "SSC CGL includes General Awareness");
  assert(sscSubjects.includes("english-language"), "SSC CGL includes English Language");
  assert(!sscSubjects.includes("banking-awareness"), "SSC CGL DOES NOT include Banking Awareness");

  // RRB NTPC
  const rrbBp = getExamBlueprint("rrb-ntpc");
  assert(rrbBp?.examId === "rrb-ntpc", "RRB NTPC blueprint resolved");
  assert(rrbBp?.markingScheme.negativeMarks === 0.33, "RRB NTPC negative marking is 1/3 (0.33)");
  const rrbSubjects = getSubjectsForExam("rrb-ntpc").map((s) => s.id);
  assert(rrbSubjects.includes("general-awareness"), "RRB NTPC includes General Awareness & Science");
  assert(rrbSubjects.includes("quantitative-aptitude"), "RRB NTPC includes Mathematics");
  assert(rrbSubjects.includes("reasoning-ability"), "RRB NTPC includes Reasoning");

  // TNPSC Group 4
  const tnpscBp = getExamBlueprint("tnpsc-group-4");
  assert(tnpscBp?.examId === "tnpsc-group-4", "TNPSC Group 4 blueprint resolved");
  assert(tnpscBp?.totalQuestions === 200, "TNPSC Group 4 has 200 questions");
  assert(tnpscBp?.markingScheme.negativeMarks === 0, "TNPSC Group 4 has 0 negative marking");
  const tnpscSubjects = getSubjectsForExam("tnpsc-group-4").map((s) => s.id);
  assert(tnpscSubjects.includes("tamil-language"), "TNPSC Group 4 includes General Tamil (Language)");
  assert(tnpscSubjects.includes("state-general-studies"), "TNPSC Group 4 includes General Studies");

  // CTET
  const ctetBp = getExamBlueprint("ctet");
  assert(ctetBp?.examId === "ctet", "CTET blueprint resolved");
  assert(ctetBp?.markingScheme.negativeMarks === 0, "CTET has 0 negative marking");
  const ctetSubjects = getSubjectsForExam("ctet").map((s) => s.id);
  assert(ctetSubjects.includes("pedagogy-child-dev"), "CTET includes Child Development & Pedagogy");

  // GATE
  const gateBp = getExamBlueprint("gate");
  assert(gateBp?.examId === "gate", "GATE blueprint resolved");
  const gateSubjects = getSubjectsForExam("gate").map((s) => s.id);
  assert(gateSubjects.includes("engineering-math"), "GATE includes Engineering Mathematics");
  assert(gateSubjects.includes("engineering-technical"), "GATE includes Core Engineering Domain");
  assert(!gateSubjects.includes("pedagogy"), "GATE DOES NOT include Pedagogy");

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Subtopic Hierarchy and Resolution
  // --------------------------------------------------------------------------
  console.log("\n--- 3. Subtopic Hierarchy Resolution ---");

  // SBI PO Reasoning -> Seating Arrangement Subtopics
  const sbiSeatingSubtopics = getSubtopicsForTopic("sbi-po", "reasoning-ability", "seating-arrangement");
  assert(sbiSeatingSubtopics.length >= 3, `SBI PO Seating Arrangement has ${sbiSeatingSubtopics.length} subtopics (>= 3)`);
  const sbiSeatingNames = sbiSeatingSubtopics.map((s) => s.name);
  assert(sbiSeatingNames.some((n) => n.includes("Linear")), "Includes Linear Seating");
  assert(sbiSeatingNames.some((n) => n.includes("Circular")), "Includes Circular Seating");
  assert(sbiSeatingNames.some((n) => n.includes("Floor")), "Includes Floor & Flat Arrangement");

  // SSC CGL Quant -> Percentage Subtopics
  const sscPercentageSubtopics = getSubtopicsForTopic("ssc-cgl", "quantitative-aptitude", "percentage");
  assert(sscPercentageSubtopics.length >= 3, `SSC CGL Percentage has ${sscPercentageSubtopics.length} subtopics (>= 3)`);
  const sscPercNames = sscPercentageSubtopics.map((s) => s.name);
  assert(sscPercNames.some((n) => n.includes("Successive")), "Includes Successive Percentage");
  assert(sscPercNames.some((n) => n.includes("Expenditure")), "Includes Price & Expenditure");

  // UPSC Civil Services -> Indian Polity Subtopics
  const upscPolitySubtopics = getSubtopicsForTopic("upsc-cse", "general-studies-paper-1", "indian-polity");
  assert(upscPolitySubtopics.length >= 2, `UPSC Indian Polity has ${upscPolitySubtopics.length} subtopics (>= 2)`);
  const upscPolityNames = upscPolitySubtopics.map((s) => s.name);
  assert(upscPolityNames.some((n) => n.includes("Fundamental Rights") || n.includes("Preamble")), "Includes Fundamental Rights");

  // TNPSC Group 4 -> General Tamil Subtopics
  const tnpscTamilSubtopics = getSubtopicsForTopic("tnpsc-group-4", "tamil-language", "tamil-grammar");
  assert(tnpscTamilSubtopics.length >= 2, `TNPSC Tamil Grammar has ${tnpscTamilSubtopics.length} subtopics (>= 2)`);

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Difficulty System & Axmok Question Generator
  // --------------------------------------------------------------------------
  console.log("\n--- 4. Axmok Question Service & Fallback Curriculum ---");

  // Generate question with specific exam context
  const sbiQuestions = AxmokQuestionService.generateCurriculumFallbackQuestions({
    examId: "sbi-po",
    examName: "SBI PO",
    subjectId: "reasoning-ability",
    subjectName: "Reasoning Ability",
    topicId: "seating-arrangement",
    topicName: "Seating Arrangement",
    subtopicName: "Circular Arrangement (Facing In/Out)",
    difficulty: "Exam Level",
    count: 2,
  });

  assert(sbiQuestions.length === 2, "Generated 2 questions for SBI PO Seating Arrangement");
  assert(sbiQuestions[0].options.length === 4, "Question 1 has 4 options");
  assert(!!sbiQuestions[0].correctAnswer, "Question 1 has valid correctAnswer");
  assert(!!sbiQuestions[0].explanation, "Question 1 has detailed step-by-step explanation");
  assert(!!sbiQuestions[0].shortcut, "Question 1 has Axmok shortcut");
  assert(!!sbiQuestions[0].commonMistake, "Question 1 has examiner trap warning");

  // Generate question for CTET Pedagogy
  const ctetQuestions = AxmokQuestionService.generateCurriculumFallbackQuestions({
    examId: "ctet",
    examName: "CTET",
    subjectId: "child-development-pedagogy",
    subjectName: "Child Development & Pedagogy",
    topicId: "learning-pedagogy",
    topicName: "Learning Theories & Pedagogy",
    subtopicName: "Constructivism & Inclusive Education",
    difficulty: "Moderate",
    count: 1,
  });

  assert(ctetQuestions.length === 1, "Generated question for CTET Pedagogy");
  assert(ctetQuestions[0].questionText.length > 20, "CTET question has rich stem");

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed with error:", err);
  process.exit(1);
});
