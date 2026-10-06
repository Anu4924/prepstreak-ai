/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import {
  ExamBlueprint,
  TestBlueprint,
  ExamSubjectBlueprint,
  ExamTopicBlueprint,
  ExamSectionBlueprint,
} from "@/lib/types/exam";
import { getExamById } from "./examCatalogue";

/**
 * PREPSTREAK AI — CENTRAL EXAM BLUEPRINTS REGISTRY
 *
 * Provides definitive, versionable blueprints for all major Indian competitive exams.
 * Maps exact examination hierarchy: Exam -> Subject -> Topic -> Subtopics -> Question Types & Test Blueprints.
 *
 * Syllabus Version: 2026.1 (Official Exam Notifications & Pattern Alignments)
 */

export const EXAM_BLUEPRINTS: Record<string, ExamBlueprint> = {
  // ===========================================================================
  // 1. BANKING & FINANCE
  // ===========================================================================
  "sbi-po": {
    examId: "sbi-po",
    examName: "SBI PO",
    organization: "State Bank of India",
    category: "Banking & Finance",
    subCategory: "Probationary Officer Cadre",
    syllabusVersion: "2026.1",
    examPattern: "Prelims (3 Sections: English 30, Quant 35, Reasoning 35 | 100 Qs / 60 Mins, Sectional Timers) + Mains + Interview",
    duration: 60,
    totalQuestions: 100,
    totalMarks: 100,
    markingScheme: {
      positiveMarks: 1,
      negativeMarks: 0.25,
      penaltyDescription: "1/4th mark deduction (0.25) per wrong answer. Sectional timing of 20 minutes per section applies.",
    },
    negativeMarking: true,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level", "Hard"],
    questionTypes: [
      "multiple_condition_puzzle",
      "circular_seating",
      "linear_arrangement",
      "floor_box_puzzle",
      "data_interpretation_caselet",
      "missing_di",
      "quadratic_inequality",
      "reading_comprehension_inference",
      "cloze_test_advanced",
      "error_detection",
      "syllogism_only_a_few",
    ],
    sections: [
      {
        id: "english-language",
        name: "English Language",
        subjectId: "english-language",
        questionCount: 30,
        durationMinutes: 20,
        marksPerQuestion: 1,
        negativeMarks: 0.25,
        cutoffExpected: 14,
      },
      {
        id: "quantitative-aptitude",
        name: "Quantitative Aptitude",
        subjectId: "quantitative-aptitude",
        questionCount: 35,
        durationMinutes: 20,
        marksPerQuestion: 1,
        negativeMarks: 0.25,
        cutoffExpected: 18,
      },
      {
        id: "reasoning-ability",
        name: "Reasoning Ability",
        subjectId: "reasoning-ability",
        questionCount: 35,
        durationMinutes: 20,
        marksPerQuestion: 1,
        negativeMarks: 0.25,
        cutoffExpected: 21,
      },
    ],
    subjects: [
      {
        id: "reasoning-ability",
        name: "Reasoning Ability",
        shortDescription: "High-level analytical puzzles, variable seating arrangements, logical deductions, and conditional series.",
        topics: [
          {
            id: "seating-arrangement",
            name: "Seating Arrangement",
            description: "Complex seating setups with dual variables, inward/outward facing, and unknown numbers of persons.",
            subtopics: [
              "Linear Arrangement (Single & Dual Row)",
              "Circular Arrangement (Inward & Outward Facing)",
              "Floor-Based Puzzle",
              "Box & Rack Arrangement",
              "Square & Triangular Seating",
              "Uncertain Number of Persons",
            ],
            questionTypes: ["linear_arrangement", "circular_seating", "floor_box_puzzle", "variable_puzzle"],
            weightage: "15-20 Questions in Prelims",
            difficulty: "Exam Level",
          },
          {
            id: "puzzles",
            name: "Puzzles",
            description: "Multi-parameter classification, bloodline scheduling, and calendar day-month-year puzzles.",
            subtopics: [
              "Day-Month-Year Scheduling Puzzle",
              "Designation & Hierarchy Based Puzzle",
              "Multi-Variable Tabular Classification",
              "Comparison & Ranking Puzzle",
            ],
            questionTypes: ["scheduling_puzzle", "classification_puzzle", "ranking_puzzle"],
            weightage: "10-15 Questions in Prelims",
            difficulty: "Hard",
          },
          {
            id: "syllogism",
            name: "Syllogism",
            description: "Modern banking syllogisms featuring 'Only a few', 'Can never be', and reverse deductions.",
            subtopics: [
              "Only a Few / Only Conditions",
              "Possibility & Definite False Conclusions",
              "Reverse Syllogism (Mains Level)",
              "Sequential 3-4 Statement Deductions",
            ],
            questionTypes: ["syllogism_only_a_few", "reverse_syllogism"],
            weightage: "3-5 Questions in Prelims",
            difficulty: "Moderate",
          },
          {
            id: "inequalities",
            name: "Inequalities",
            description: "Direct symbolic comparisons, semicolon connected statements, and coded inequalities.",
            subtopics: [
              "Direct Statement Inequality",
              "Multi-Statement Linked Inequality",
              "Definitely True / Definitely False Checks",
              "Coded Inequality (Mains Level)",
            ],
            questionTypes: ["direct_inequality", "coded_inequality"],
            weightage: "3-5 Questions in Prelims",
            difficulty: "Easy",
          },
          {
            id: "coding-decoding",
            name: "Coding-Decoding",
            description: "Chinese / substitution coding, binary pattern shifts, and modern rule-based coding.",
            subtopics: [
              "Fictitious Language / Substitution Coding",
              "Condition-Based Symbol & Letter Coding",
              "Matrix Pattern Coding",
              "Binary & Step-Shift Coding",
            ],
            questionTypes: ["substitution_coding", "conditional_coding"],
            weightage: "3-5 Questions in Prelims",
            difficulty: "Moderate",
          },
          {
            id: "blood-relations",
            name: "Blood Relations",
            description: "Multi-generation family tree deductions, coded relational symbols, and puzzle combinations.",
            subtopics: [
              "Family Tree Generation",
              "Coded Blood Relations",
              "Bloodline Linked Seating Puzzles",
            ],
            questionTypes: ["coded_blood_relations", "family_tree"],
            weightage: "2-4 Questions in Prelims",
            difficulty: "Moderate",
          },
          {
            id: "direction-sense",
            name: "Direction Sense Test",
            description: "Pythagorean path calculation, turns with variable speeds, shadow analysis, and coded direction paths.",
            subtopics: [
              "Pythagoras Distance & Shortest Path",
              "Shadow & Sun Position Angle Analysis",
              "Coded Direction Sense (Mains Pattern)",
            ],
            questionTypes: ["pythagoras_direction", "coded_direction"],
            weightage: "2-3 Questions in Prelims",
            difficulty: "Easy",
          },
        ],
      },
      {
        id: "quantitative-aptitude",
        name: "Quantitative Aptitude",
        shortDescription: "High-speed calculation, arithmetic word problems, quadratic equations, and complex data interpretation.",
        topics: [
          {
            id: "data-interpretation",
            name: "Data Interpretation (DI)",
            description: "Tabular, Bar, Pie, Radar charts and Paragraph Caselet DI with analytical multi-step calculations.",
            subtopics: [
              "Bar & Line Graph Combined DI",
              "Dual Pie Chart DI with Degrees & Percentages",
              "Missing Data Table DI",
              "Caselet & Paragraph DI",
              "Arithmetic Concept DI (Time & Work / Profit Loss in DI)",
            ],
            questionTypes: ["caselet_di", "pie_chart_di", "missing_table_di", "arithmetic_di"],
            weightage: "10-15 Questions in Prelims",
            difficulty: "Exam Level",
          },
          {
            id: "arithmetic-word-problems",
            name: "Arithmetic Word Problems",
            description: "Profit & Loss, Time & Work, Speed Distance, Simple/Compound Interest, and Ratio & Mixture.",
            subtopics: [
              "Profit, Loss & Successive Discount",
              "Simple & Compound Interest (Half-yearly & Compounding)",
              "Time, Work & Efficiency / Pipes & Cisterns",
              "Time, Speed, Distance & Relative Speed (Trains & Boats)",
              "Ratio, Proportion & Mixture / Alligation",
              "Ages & Partnership Calculations",
            ],
            questionTypes: ["word_problem", "two_statement_comparison"],
            weightage: "10-12 Questions in Prelims",
            difficulty: "Moderate",
          },
          {
            id: "quadratic-equations",
            name: "Quadratic & Polynomial Equations",
            description: "Comparison of Roots X and Y using sign method, large coefficient factorizations, and root signs.",
            subtopics: [
              "Sign Method Root Comparison",
              "Large Coefficient Quadratic Equations",
              "Square Root Factorization Equations",
              "Cubic & Linear Variable Equations",
            ],
            questionTypes: ["root_comparison", "sign_method_equations"],
            weightage: "5 Questions in Prelims",
            difficulty: "Easy",
          },
          {
            id: "number-series",
            name: "Number Series",
            description: "Missing and wrong number series with double difference, alternating multiplication, and cube patterns.",
            subtopics: [
              "Missing Number Series (Multiplication & Division Steps)",
              "Wrong Number Series (Pinpointing False Element)",
              "Double Difference & Prime Number Logic",
              "Fibonacci & Algebraic Square/Cube Shifts",
            ],
            questionTypes: ["wrong_number_series", "missing_number_series"],
            weightage: "5 Questions in Prelims",
            difficulty: "Moderate",
          },
          {
            id: "approximation-simplification",
            name: "Approximation & Speed Math",
            description: "Rapid approximation of surds, percentage fractions, decimal rounding, and BODMAS calculations.",
            subtopics: [
              "BODMAS with Decimal Approximations",
              "Fraction to Percentage Equivalents",
              "Square & Cube Roots Estimation",
            ],
            questionTypes: ["approximation", "speed_math"],
            weightage: "5 Questions in Prelims",
            difficulty: "Easy",
          },
        ],
      },
      {
        id: "english-language",
        name: "English Language",
        shortDescription: "Analytical reading comprehension, grammar rule applications, contextual vocabulary, and sentence ordering.",
        topics: [
          {
            id: "reading-comprehension",
            name: "Reading Comprehension",
            description: "Passages based on banking, economy, technology, and governance with tone, theme, and inference questions.",
            subtopics: [
              "Economic & Editorial Passages",
              "Author Tone & Main Idea Extraction",
              "Direct & Fact-Finding Questions",
              "Contextual Synonyms & Antonyms",
              "Inference & Conclusion Deductions",
            ],
            questionTypes: ["inference_question", "vocab_in_context", "central_theme"],
            weightage: "8-10 Questions in Prelims",
            difficulty: "Exam Level",
          },
          {
            id: "error-detection",
            name: "Error Detection & Sentence Correction",
            description: "Subject-verb agreement, tense consistency, modifiers, conditional clauses, and preposition idioms.",
            subtopics: [
              "Subject-Verb Agreement Errors",
              "Preposition & Phrasal Verb Misuse",
              "Conditional Sentences & Inversion Rules",
              "Part-Wise Sentence Error Identification",
            ],
            questionTypes: ["spotting_errors", "sentence_improvement"],
            weightage: "5 Questions in Prelims",
            difficulty: "Moderate",
          },
          {
            id: "cloze-test",
            name: "Cloze Test",
            description: "Story and editorial paragraphs with contextual fill-in options requiring grammar and nuance checks.",
            subtopics: [
              "Grammar-Based Blank Fillers",
              "Vocabulary Nuance & Collocations",
              "Paragraph Coherence Fillers",
            ],
            questionTypes: ["cloze_test", "contextual_fit"],
            weightage: "5-6 Questions in Prelims",
            difficulty: "Moderate",
          },
          {
            id: "para-jumbles",
            name: "Para Jumbles & Sentence Rearrangement",
            description: "Ordering 5-6 sentences logically to form a coherent paragraph, identifying opening and concluding lines.",
            subtopics: [
              "Finding Mandatory Pairs & Link Words",
              "Identifying Independent Opening Sentences",
              "Chronological & Argument Sequence Ordering",
            ],
            questionTypes: ["sentence_ordering", "odd_sentence_out"],
            weightage: "5 Questions in Prelims",
            difficulty: "Hard",
          },
          {
            id: "vocabulary-fillers",
            name: "Fillers & Match the Column",
            description: "Single and double fillers, word swap, column matching, and phrase replacement.",
            subtopics: [
              "Double Fillers with Complementary Meanings",
              "Word Swap in 4 Marked Positions",
              "Column 1 to Column 2 Sentence Matching",
            ],
            questionTypes: ["double_fillers", "word_swap", "column_matching"],
            weightage: "5 Questions in Prelims",
            difficulty: "Easy",
          },
        ],
      },
      {
        id: "banking-awareness",
        name: "Banking & Financial Awareness",
        shortDescription: "RBI regulations, monetary policy, retail banking products, financial inclusion, and economic terms.",
        topics: [
          {
            id: "rbi-monetary-policy",
            name: "RBI Structure & Monetary Policy",
            description: "Repo, Reverse Repo, SDF, MSF, CRR, SLR rates, Monetary Policy Committee (MPC) mandates, and inflation targeting.",
            subtopics: [
              "Policy Rates & Liquidity Adjustment Facility (LAF)",
              "Reserve Ratios: Cash Reserve Ratio (CRR) & Statutory Liquidity Ratio (SLR)",
              "Monetary Policy Committee Framework",
            ],
            questionTypes: ["factual_mcq", "statement_analysis"],
            weightage: "Mains & Interview Focus",
            difficulty: "Moderate",
          },
          {
            id: "banking-operations",
            name: "Commercial Banking & Financial Inclusion",
            description: "NPA classification, PCA framework, Basel III norms, Priority Sector Lending (PSL), and payment systems (NEFT/RTGS/UPI).",
            subtopics: [
              "Non-Performing Assets (NPA) & SARFAESI Act",
              "Basel III Capital Adequacy Standards",
              "UPI, NPCI, IMPS & Digital Payment Rails",
              "Priority Sector Lending Categories & Sub-targets",
            ],
            questionTypes: ["concept_mcq", "current_banking_mcq"],
            weightage: "Mains & Interview Focus",
            difficulty: "Exam Level",
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 2. STAFF SELECTION COMMISSION (SSC)
  // ===========================================================================
  "ssc-cgl": {
    examId: "ssc-cgl",
    examName: "SSC CGL",
    organization: "Staff Selection Commission",
    category: "SSC",
    subCategory: "Combined Graduate Level Examination",
    syllabusVersion: "2026.1",
    examPattern: "Tier-I (4 Sections: Reasoning 25, GA 25, Quant 25, English 25 | 100 Qs / 60 Mins, 200 Marks) + Tier-II (Mathematical Abilities, Reasoning, English, GA, Computer, Data Entry)",
    duration: 60,
    totalQuestions: 100,
    totalMarks: 200,
    markingScheme: {
      positiveMarks: 2,
      negativeMarks: 0.5,
      penaltyDescription: "2 marks per correct answer; 0.50 mark deduction per incorrect answer. Composite 60 minutes across all 4 sections.",
    },
    negativeMarking: true,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level", "Hard"],
    questionTypes: [
      "analogy_classification",
      "number_alphabet_series",
      "venn_diagram",
      "arithmetic_percentage",
      "algebraic_identity",
      "geometry_circle_triangle",
      "trigonometry_heights_distances",
      "mensuration_2d_3d",
      "indian_polity_constitution",
      "ancient_medieval_modern_history",
      "general_science_physics_chem_bio",
      "active_passive_voice",
      "direct_indirect_speech",
      "idioms_phrases",
    ],
    sections: [
      {
        id: "general-intelligence-reasoning",
        name: "General Intelligence & Reasoning",
        subjectId: "reasoning-ability",
        questionCount: 25,
        durationMinutes: 15,
        marksPerQuestion: 2,
        negativeMarks: 0.5,
        cutoffExpected: 42,
      },
      {
        id: "general-awareness",
        name: "General Awareness",
        subjectId: "general-awareness",
        questionCount: 25,
        durationMinutes: 10,
        marksPerQuestion: 2,
        negativeMarks: 0.5,
        cutoffExpected: 30,
      },
      {
        id: "quantitative-aptitude",
        name: "Quantitative Aptitude",
        subjectId: "quantitative-aptitude",
        questionCount: 25,
        durationMinutes: 20,
        marksPerQuestion: 2,
        negativeMarks: 0.5,
        cutoffExpected: 38,
      },
      {
        id: "english-comprehension",
        name: "English Comprehension",
        subjectId: "english-language",
        questionCount: 25,
        durationMinutes: 15,
        marksPerQuestion: 2,
        negativeMarks: 0.5,
        cutoffExpected: 40,
      },
    ],
    subjects: [
      {
        id: "quantitative-aptitude",
        name: "Quantitative Aptitude & Advanced Math",
        shortDescription: "Arithmetic, Algebra, Geometry, Trigonometry, Mensuration, and Data Interpretation.",
        topics: [
          {
            id: "percentage",
            name: "Percentage",
            description: "Direct percentage calculations, successive percentage, expenditure & consumption, and voting problems.",
            subtopics: [
              "Direct Percentage & Base Change",
              "Percentage Increase / Decrease & Constant Product Rule",
              "Successive Percentage & Net Effect Formula",
              "Expenditure, Price and Consumption Equivalence",
              "Population Growth & Machine Depreciation",
              "Election & Voting Percentage Problems",
            ],
            questionTypes: ["direct_percentage", "successive_percentage", "expenditure_problem", "election_problem"],
            weightage: "2-3 Questions in Tier I",
            difficulty: "Moderate",
          },
          {
            id: "profit-and-loss",
            name: "Profit & Loss and Discount",
            description: "Cost price, marked price, discount, dishonest dealer problems, and successive discounts.",
            subtopics: [
              "Cost Price, Selling Price & Profit Percent",
              "Marked Price & Single Equivalent Discount",
              "Dishonest Shopkeeper Weight Fraud Calculations",
              "Successive Discounts & Free Schemes (Buy X Get Y Free)",
            ],
            questionTypes: ["profit_loss_basic", "dishonest_dealer", "successive_discount"],
            weightage: "2-3 Questions in Tier I",
            difficulty: "Moderate",
          },
          {
            id: "time-and-work",
            name: "Time, Work & Pipes/Cisterns",
            description: "LCM efficiency method, alternate day work, work left before completion, and efficiency ratios.",
            subtopics: [
              "LCM Efficiency Method for Individuals",
              "Work Done on Alternate Days",
              "Workers Leaving or Joining Mid-Work",
              "Men, Women & Children Efficiency Equivalents",
              "Pipes and Cisterns with Leakage Calculation",
            ],
            questionTypes: ["lcm_work_method", "alternate_day_work", "pipes_cisterns"],
            weightage: "2 Questions in Tier I",
            difficulty: "Moderate",
          },
          {
            id: "algebra",
            name: "Algebra & Polynomial Identities",
            description: "Algebraic identities (a+b)^3, a^3+b^3+c^3 - 3abc = 0, symmetric equations, and minimum/maximum values.",
            subtopics: [
              "Standard Algebraic Identities & Expansion",
              "Condition When a + b + c = 0, a^3 + b^3 + c^3 = 3abc",
              "x + 1/x = k Transformations (Squares, Cubes, Powers of 5)",
              "Quadratic Roots & Symmetric Polynomials",
            ],
            questionTypes: ["algebraic_identity", "reciprocal_x_powers"],
            weightage: "3-4 Questions in Tier I",
            difficulty: "Exam Level",
          },
          {
            id: "geometry",
            name: "Geometry (Triangles, Circles & Polygons)",
            description: "Triangle centres, similarity & congruence, circle tangents, chords, cyclic quadrilaterals.",
            subtopics: [
              "Triangle Properties: Incentre, Circumcentre, Orthocentre, Centroid",
              "Similar & Congruent Triangles Theorems",
              "Circle Chords, Secants and Direct/Transverse Tangents",
              "Cyclic Quadrilateral Angle and Side Relations",
            ],
            questionTypes: ["triangle_geometry", "circle_tangent_theorem"],
            weightage: "3-4 Questions in Tier I",
            difficulty: "Exam Level",
          },
          {
            id: "trigonometry",
            name: "Trigonometry & Heights and Distances",
            description: "Standard ratios, complementary angle rules, trigonometric identities, and angle of elevation/depression.",
            subtopics: [
              "Standard Trigonometric Ratios Table (0, 30, 45, 60, 90)",
              "Complementary Angle Conversions: sin(90-x) = cos(x)",
              "Fundamental Identities: sin^2 + cos^2 = 1, sec^2 - tan^2 = 1",
              "Heights and Distances: Elevation, Depression & Shadow Lengths",
            ],
            questionTypes: ["trigonometric_identity", "heights_distances"],
            weightage: "2-3 Questions in Tier I",
            difficulty: "Moderate",
          },
        ],
      },
      {
        id: "reasoning-ability",
        name: "General Intelligence & Reasoning",
        shortDescription: "Analogies, classification, matrix, paper folding, cubes and dice, series, and blood relations.",
        topics: [
          {
            id: "analogy-classification",
            name: "Analogy & Odd One Out",
            description: "Semantic, numerical, and symbolic analogies and classification tests.",
            subtopics: [
              "Number Pair Analogy (Squares, Cubes, Prime Relations)",
              "Alphabet Cluster Shifts & Reverse Letter Pairs",
              "Word Knowledge & GK-Based Analogies",
              "Odd One Out / Group Classification",
            ],
            questionTypes: ["number_analogy", "word_analogy", "odd_one_out"],
            weightage: "4-5 Questions in Tier I",
            difficulty: "Easy",
          },
          {
            id: "cubes-and-dice",
            name: "Cubes & Dice",
            description: "Opposite faces of standard and non-standard dice, folded nets, and painted cube cuts.",
            subtopics: [
              "Opposite Face Determination (Single Common Number Rule)",
              "Unfolded Dice Sheet / Net Folding",
              "Painted Cube Cuts: Formula for 3-side, 2-side, 1-side, 0-side painted",
            ],
            questionTypes: ["dice_opposite_faces", "unfolded_net"],
            weightage: "2 Questions in Tier I",
            difficulty: "Easy",
          },
          {
            id: "venn-diagrams",
            name: "Venn Diagrams",
            description: "Geometrical representation of overlapping classes and numerical set deduction.",
            subtopics: [
              "Three Entity Real-World Venn Relations",
              "Geometric Figure Overlaps (Circle, Triangle, Rectangle Counts)",
            ],
            questionTypes: ["venn_diagram_classification", "geometric_set_count"],
            weightage: "2 Questions in Tier I",
            difficulty: "Easy",
          },
        ],
      },
      {
        id: "general-awareness",
        name: "General Awareness & Science",
        shortDescription: "Polity & Constitution, History, Geography, Economics, General Science, and Static GK.",
        topics: [
          {
            id: "indian-polity",
            name: "Indian Constitution & Polity",
            description: "Articles, Fundamental Rights, Directive Principles, President, Parliament, Judiciary, and Amendments.",
            subtopics: [
              "Preamble & Fundamental Rights (Articles 12-35)",
              "Directive Principles of State Policy & Fundamental Duties",
              "President, Prime Minister, Union Council of Ministers",
              "Supreme Court, High Courts & Judicial Writs",
              "Important Constitutional Amendments (42nd, 44th, 73rd, 86th, 101st)",
            ],
            questionTypes: ["constitutional_article_mcq", "polity_facts"],
            weightage: "4-6 Questions in Tier I",
            difficulty: "Moderate",
          },
          {
            id: "modern-history",
            name: "Modern Indian History & Freedom Struggle",
            description: "1857 Revolt, Indian National Congress sessions, Gandhian era movements, and Governor Generals.",
            subtopics: [
              "1857 Revolt Causes, Leaders & Centers",
              "Important INC Sessions & Presidents (1885-1947)",
              "Non-Cooperation, Civil Disobedience & Quit India Movements",
              "Socio-Religious Reform Movements (Brahmo Samaj, Arya Samaj)",
            ],
            questionTypes: ["history_timeline_mcq", "acts_and_leaders"],
            weightage: "3-4 Questions in Tier I",
            difficulty: "Moderate",
          },
        ],
      },
      {
        id: "english-language",
        name: "English Comprehension",
        shortDescription: "Active/passive voice, direct/indirect speech, idioms, one word substitution, spelling, and cloze test.",
        topics: [
          {
            id: "voice-and-narration",
            name: "Active/Passive Voice & Direct/Indirect Speech",
            description: "Grammatical transformations across tenses, interrogative sentences, and imperative commands.",
            subtopics: [
              "Active to Passive across Tenses",
              "Imperative Sentences Voice Shift ('Let it be done')",
              "Direct to Indirect Speech Tense & Pronoun Shifts",
              "Interrogative & Exclamatory Reported Speech",
            ],
            questionTypes: ["active_passive", "direct_indirect"],
            weightage: "4-5 Questions in Tier I",
            difficulty: "Moderate",
          },
          {
            id: "idioms-and-phrases",
            name: "Idioms, Phrases & One Word Substitutions",
            description: "Frequently repeated SSC idioms, Latin phrases, roots of English vocabulary, and phrasal verbs.",
            subtopics: [
              "High-Frequency SSC Idioms & Real-World Meaning",
              "One Word Substitutions (Government, Phobias, Professions)",
              "Phrasal Verbs with Common Root Verbs (Put, Take, Look, Give)",
            ],
            questionTypes: ["idiom_meaning", "one_word_substitution"],
            weightage: "4-5 Questions in Tier I",
            difficulty: "Easy",
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 3. RAILWAY RECRUITMENT BOARDS (RRB)
  // ===========================================================================
  "rrb-ntpc": {
    examId: "rrb-ntpc",
    examName: "RRB NTPC",
    organization: "Railway Recruitment Boards",
    category: "Railways",
    subCategory: "Non-Technical Popular Categories",
    syllabusVersion: "2026.1",
    examPattern: "CBT-1 (General Awareness 40, Mathematics 30, General Intelligence & Reasoning 30 | 100 Qs / 90 Mins, 100 Marks) + CBT-2",
    duration: 90,
    totalQuestions: 100,
    totalMarks: 100,
    markingScheme: {
      positiveMarks: 1,
      negativeMarks: 0.33,
      penaltyDescription: "1 mark per correct answer; 1/3rd (0.33) mark deduction per incorrect answer. Composite 90 minutes.",
    },
    negativeMarking: true,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level", "Hard"],
    questionTypes: [
      "general_science_physics_chem_bio",
      "railway_gk_operations",
      "speed_time_distance_trains",
      "arithmetic_ratio_work",
      "statement_conclusions_reasoning",
      "number_series_puzzles",
    ],
    sections: [
      {
        id: "general-awareness",
        name: "General Awareness",
        subjectId: "general-awareness",
        questionCount: 40,
        durationMinutes: 35,
        marksPerQuestion: 1,
        negativeMarks: 0.33,
        cutoffExpected: 30,
      },
      {
        id: "mathematics",
        name: "Mathematics",
        subjectId: "quantitative-aptitude",
        questionCount: 30,
        durationMinutes: 30,
        marksPerQuestion: 1,
        negativeMarks: 0.33,
        cutoffExpected: 24,
      },
      {
        id: "general-intelligence-reasoning",
        name: "General Intelligence & Reasoning",
        subjectId: "reasoning-ability",
        questionCount: 30,
        durationMinutes: 25,
        marksPerQuestion: 1,
        negativeMarks: 0.33,
        cutoffExpected: 25,
      },
    ],
    subjects: [
      {
        id: "general-awareness",
        name: "General Awareness & Science",
        shortDescription: "High-weightage General Science, Indian Railways facts, History, Geography, and Current Events.",
        topics: [
          {
            id: "general-science",
            name: "General Science (Physics, Chemistry, Biology)",
            description: "NCERT Class 9-10 science concepts, units, laws of motion, human physiology, chemical formulas.",
            subtopics: [
              "SI Units, Motion Laws, Gravitation & Work-Energy",
              "Chemical Formulas, Periodic Table & Acids/Bases",
              "Human Body Systems: Circulatory, Digestive, Nervous",
              "Plant Nutrition, Photosynthesis & Plant Hormones",
            ],
            questionTypes: ["science_concept", "formula_units"],
            weightage: "15-18 Questions in CBT-1",
            difficulty: "Moderate",
          },
          {
            id: "railway-general-knowledge",
            name: "Indian Railways & National Heritage",
            description: "Railway zones, headquarters, historical milestones, high-speed rail, and public sector transport.",
            subtopics: [
              "Indian Railway Zones, Headquarters & Divisions",
              "Vande Bharat, Bullet Train & Dedicated Freight Corridors",
              "National Symbols, UNESCO Heritage Sites of India",
            ],
            questionTypes: ["railway_gk", "national_facts"],
            weightage: "5-8 Questions in CBT-1",
            difficulty: "Easy",
          },
        ],
      },
      {
        id: "quantitative-aptitude",
        name: "Mathematics",
        shortDescription: "Speed math, Fractions, LCM/HCF, Train problems, Profit/Loss, and Mensuration.",
        topics: [
          {
            id: "trains-speed-distance",
            name: "Speed, Time & Train Problems",
            description: "Train crossing a pole/platform, two trains moving in opposite/same direction, and boat speeds.",
            subtopics: [
              "Unit Conversion km/h to m/s and Base Formula",
              "Train Crossing a Pole vs Train Crossing a Platform/Bridge",
              "Two Trains in Relative Motion (Opposite vs Same Direction)",
              "Boats and Streams (Upstream vs Downstream Speeds)",
            ],
            questionTypes: ["train_crossing_problem", "relative_speed"],
            weightage: "4-5 Questions in CBT-1",
            difficulty: "Moderate",
          },
          {
            id: "lcm-and-hcf",
            name: "LCM & HCF and Number Systems",
            description: "Product of numbers formula, bell ringing intervals, fraction LCM/HCF, and remainders.",
            subtopics: [
              "Product of Two Numbers = LCM * HCF",
              "Bells Toll Together / Simultaneous Events LCM",
              "Finding Largest/Smallest Number with Specific Remainders",
            ],
            questionTypes: ["lcm_intervals", "hcf_remainders"],
            weightage: "3 Questions in CBT-1",
            difficulty: "Easy",
          },
        ],
      },
      {
        id: "reasoning-ability",
        name: "General Intelligence & Reasoning",
        shortDescription: "Analogies, Jumbles, Venn diagrams, Mathematical operations, and Syllogism.",
        topics: [
          {
            id: "statement-and-conclusions",
            name: "Statement & Conclusions / Assumptions",
            description: "Critical reasoning questions evaluating logically sound deductions without external assumptions.",
            subtopics: [
              "Statement and Direct Logical Conclusions",
              "Course of Action Determination",
              "Statement and Underlying Assumptions",
            ],
            questionTypes: ["statement_conclusion", "course_of_action"],
            weightage: "4-5 Questions in CBT-1",
            difficulty: "Moderate",
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 4. UNION PUBLIC SERVICE COMMISSION (UPSC)
  // ===========================================================================
  "upsc-cse": {
    examId: "upsc-cse",
    examName: "UPSC Civil Services",
    organization: "Union Public Service Commission",
    category: "UPSC",
    subCategory: "Civil Services Examination (IAS / IPS / IFS)",
    syllabusVersion: "2026.1",
    examPattern: "Prelims (Paper I General Studies: 100 Qs / 120 Mins, 200 Marks | Paper II CSAT: 80 Qs / 120 Mins, Qualifying 33%) + Mains (9 Papers) + Interview",
    duration: 120,
    totalQuestions: 100,
    totalMarks: 200,
    markingScheme: {
      positiveMarks: 2,
      negativeMarks: 0.66,
      penaltyDescription: "2 marks per correct answer; 1/3rd penalty (0.66 marks) per wrong answer. Two statement analysis & pair matching style.",
    },
    negativeMarking: true,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level", "Hard"],
    questionTypes: [
      "two_statement_analysis",
      "pair_matching_how_many_pairs",
      "assertion_reasoning",
      "cause_and_effect",
      "conceptual_polity_preamble",
      "ecological_biodiversity_analysis",
    ],
    sections: [
      {
        id: "upsc-gs-1",
        name: "General Studies Paper I",
        subjectId: "upsc-gs-1",
        questionCount: 100,
        durationMinutes: 120,
        marksPerQuestion: 2,
        negativeMarks: 0.66,
        cutoffExpected: 92,
      },
    ],
    subjects: [
      {
        id: "upsc-gs-1",
        name: "GS Paper I: Core Civil Services Curriculum",
        shortDescription: "Indian Polity & Governance, Indian History, Geography, Environment & Biodiversity, Economy, and Science & Tech.",
        topics: [
          {
            id: "upsc-polity",
            name: "Indian Polity, Constitution & Governance",
            description: "Constitutional philosophy, federalism, judicial reviews, basic structure doctrine, statutory bodies.",
            subtopics: [
              "Preamble & Constitutional Philosophy",
              "Federal Structure, Inter-State Relations & Centre-State Powers",
              "Judicial Review, Basic Structure & PIL Jurisprudence",
              "Election Commission, CAG, UPSC & Constitutional Bodies",
              "Parliamentary Committees, Procedures & Delegated Legislation",
            ],
            questionTypes: ["two_statement_analysis", "pair_matching_how_many_pairs"],
            weightage: "15-20 Questions in Prelims",
            difficulty: "Hard",
          },
          {
            id: "upsc-environment",
            name: "Environment, Ecology & Climate Change",
            description: "Biodiversity conservation, national parks, Ramsar wetlands, global conventions (UNFCCC, CBD), and species IUCN status.",
            subtopics: [
              "Protected Areas: National Parks, Wildlife Sanctuaries, Tiger Reserves",
              "Ramsar Convention & Wetland Ecology",
              "IUCN Red List Status of Critically Endangered Species of India",
              "Climate Change Agreements: Paris Accord, COP Decisions & Carbon Markets",
            ],
            questionTypes: ["species_habitat_matching", "international_convention_mcq"],
            weightage: "18-22 Questions in Prelims",
            difficulty: "Hard",
          },
          {
            id: "upsc-modern-history",
            name: "Indian Heritage, Art & Modern History",
            description: "Temple architecture, classical dances, Bhakti-Sufi movements, British colonial impact, and tribal/peasant uprisings.",
            subtopics: [
              "Ancient Indian Art: Mauryan, Gupta & Temple Architecture",
              "Bhakti and Sufi Movement Saints & Philosophies",
              "Tribal, Peasant & Civil Uprisings before 1857",
              "Constitutional Experiments: Government of India Acts 1909, 1919, 1935",
            ],
            questionTypes: ["chronological_ordering", "art_form_origin_matching"],
            weightage: "12-15 Questions in Prelims",
            difficulty: "Hard",
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 5. TAMIL NADU PUBLIC SERVICE COMMISSION (TNPSC)
  // ===========================================================================
  "tnpsc-group-4": {
    examId: "tnpsc-group-4",
    examName: "TNPSC Group 4",
    organization: "Tamil Nadu Public Service Commission",
    category: "TNPSC",
    subCategory: "Group IV & VAO Services",
    syllabusVersion: "2026.1",
    examPattern: "Single Stage Written Examination (Part A General Tamil: 100 Qs | Part B General Studies: 75 Qs + Aptitude: 25 Qs | 200 Qs / 180 Mins, 300 Marks)",
    duration: 180,
    totalQuestions: 200,
    totalMarks: 300,
    markingScheme: {
      positiveMarks: 1.5,
      negativeMarks: 0,
      penaltyDescription: "1.5 marks per question. No negative marking in TNPSC Group 4 written examination.",
    },
    negativeMarking: false,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level", "Hard"],
    questionTypes: [
      "tamil_grammar_ilakkanam",
      "thirukkural_adhikaram",
      "sangam_literature_ilakkiyam",
      "tamil_scholars_contributions",
      "tamil_nadu_administration_welfare",
      "aptitude_mental_ability",
    ],
    sections: [
      {
        id: "general-tamil",
        name: "Part A: General Tamil (பொதுத்தமிழ்)",
        subjectId: "tamil-language",
        questionCount: 100,
        durationMinutes: 90,
        marksPerQuestion: 1.5,
        negativeMarks: 0,
        cutoffExpected: 135,
      },
      {
        id: "general-studies",
        name: "Part B: General Studies (பொது அறிவு)",
        subjectId: "state-general-studies",
        questionCount: 75,
        durationMinutes: 60,
        marksPerQuestion: 1.5,
        negativeMarks: 0,
        cutoffExpected: 80,
      },
      {
        id: "aptitude-mental-ability",
        name: "Part B: Aptitude & Mental Ability",
        subjectId: "quantitative-aptitude",
        questionCount: 25,
        durationMinutes: 30,
        marksPerQuestion: 1.5,
        negativeMarks: 0,
        cutoffExpected: 33,
      },
    ],
    subjects: [
      {
        id: "tamil-language",
        name: "பொதுத்தமிழ் (General Tamil & Literature)",
        shortDescription: "பகுதி-அ இலக்கணம், பகுதி-ஆ இலக்கியம் (திருக்குறள், எட்டுத்தொகை), பகுதி-இ தமிழ் அறிஞர்களும் தமிழ்த் தொண்டும்.",
        topics: [
          {
            id: "tamil-grammar",
            name: "பகுதி-அ: தமிழ் இலக்கணம் (Tamil Grammar)",
            description: "எழுத்து, சொல், பொருள், யாப்பு, அணி இலக்கணம், சந்திப் பிழைகள், வேர்ச்சொல் மற்றும் எதிர்ச்சொல்.",
            subtopics: [
              "பொருத்துதல்: பொருத்தமான பொருளைத் தேர்வு செய்தல்",
              "வேர்ச்சொல்லைக் கொடுத்து வினைமுற்று, வினையெச்சம் உருவாக்கல்",
              "சந்திப் பிழையற்ற தொடரைக் கண்டறிதல் (வல்லினம் மிகும் & மிகா இடங்கள்)",
              "அகர வரிசைப்படி சொற்களைச் சீர் செய்தல்",
              "எதுகை, மோனை, இயைபு தொடர் நயங்களை அறிதல்",
            ],
            questionTypes: ["tamil_grammar_ilakkanam", "sandhi_correction"],
            weightage: "35-40 Questions in Part A",
            difficulty: "Exam Level",
          },
          {
            id: "thirukkural",
            name: "பகுதி-ஆ: திருக்குறள் மற்றும் சங்க இலக்கியம்",
            description: "அறத்துப்பால், பொருட்பால் அதிகாரங்கள், நற்றினை, குறுந்தொகை, சிலப்பதிகாரம், மணிமேகலை மற்றும் பெரியபுராணம்.",
            subtopics: [
              "திருக்குறள் தொடர்பான செய்திகள், மேற்கோள்கள், சிறப்புப் பெயர்கள்",
              "எட்டுத்தொகை & பத்துப்பாட்டு நூல்கள் மற்றும் புலவர் மேற்கோள்கள்",
              "ஐம்பெருங்காப்பியங்கள் & ஐஞ்சிறுங்காப்பியங்கள்",
              "பக்தி இலக்கியம் (தேவாரம், நாலாயிர திவ்வியப் பிரபந்தம்)",
            ],
            questionTypes: ["thirukkural_adhikaram", "sangam_literature_ilakkiyam"],
            weightage: "30-35 Questions in Part A",
            difficulty: "Exam Level",
          },
          {
            id: "tamil-scholars",
            name: "பகுதி-இ: தமிழ் அறிஞர்களும் தமிழ்த் தொண்டும்",
            description: "பாரதியார், பாரதிதாசன், நாமக்கல் கவிஞர், கவிமணி, உ.வே.சா, திரு.வி.க, தந்தை பெரியார் மற்றும் அண்ணாவின் தொண்டுகள்.",
            subtopics: [
              "பாரதியார், பாரதிதாசன் கவிதை வரிகள் & சிறப்புப் பெயர்கள்",
              "உ.வே.சாமிநாதையர், சி.வை.தாமோதரம்பிள்ளை தமிழ் பதிப்புப் பணி",
              "ஜி.யு.போப், வீரமாமுனிவர் மேலைநாட்டு அறிஞர்களின் தமிழ்த் தொண்டு",
              "தந்தை பெரியார், பேரறிஞர் அண்ணா சுயமரியாதை & மொழி ஆளுமை",
            ],
            questionTypes: ["tamil_scholars_contributions", "poet_quotes"],
            weightage: "25-30 Questions in Part A",
            difficulty: "Moderate",
          },
        ],
      },
      {
        id: "state-general-studies",
        name: "General Studies & Tamil Nadu Administration",
        shortDescription: "History of Tamil Nadu, Dravidian Movement, Socio-political developments, and Government schemes.",
        topics: [
          {
            id: "tamil-nadu-history-culture",
            name: "Unit 8: History, Culture, Heritage & Socio-Political Movements in TN",
            description: "Archaeological excavations (Keeladi, Korkai), Sangam age society, Thirukkural philosophical significance, and Justice Party.",
            subtopics: [
              "Keeladi & Recent Archaeological Excavations in Tamil Nadu",
              "Justice Party Rule, Non-Brahmin Manifesto & Self-Respect Movement",
              "Women Freedom Fighters of Tamil Nadu (Velu Nachiyar, Kuyili, Moovalur Ramamirtham)",
            ],
            questionTypes: ["tamil_nadu_administration_welfare", "historical_movement_mcq"],
            weightage: "20-25 Questions in Part B",
            difficulty: "Exam Level",
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 6. ADDITIONAL KEY COMPETITIVE EXAM BLUEPRINTS
  // ===========================================================================
  "sbi-clerk": {
    examId: "sbi-clerk",
    examName: "SBI Clerk",
    organization: "State Bank of India",
    category: "Banking & Finance",
    subCategory: "Clerical Cadre",
    syllabusVersion: "2026.1",
    examPattern: "Prelims (English 30, Numerical Ability 35, Reasoning 35 | 100 Qs / 60 Mins, Sectional Timers) + Mains",
    duration: 60,
    totalQuestions: 100,
    totalMarks: 100,
    markingScheme: {
      positiveMarks: 1,
      negativeMarks: 0.25,
      penaltyDescription: "1 mark per correct answer; 0.25 marks penalty per wrong answer. 20 minutes sectional timer per section.",
    },
    negativeMarking: true,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level"],
    questionTypes: ["speed_math", "simplification", "linear_seating", "cloze_test", "error_detection"],
    sections: [
      { id: "english-language", name: "English Language", subjectId: "english-language", questionCount: 30, durationMinutes: 20, marksPerQuestion: 1, negativeMarks: 0.25, cutoffExpected: 18 },
      { id: "quantitative-aptitude", name: "Numerical Ability", subjectId: "quantitative-aptitude", questionCount: 35, durationMinutes: 20, marksPerQuestion: 1, negativeMarks: 0.25, cutoffExpected: 26 },
      { id: "reasoning-ability", name: "Reasoning Ability", subjectId: "reasoning-ability", questionCount: 35, durationMinutes: 20, marksPerQuestion: 1, negativeMarks: 0.25, cutoffExpected: 28 },
    ],
    subjects: [
      {
        id: "quantitative-aptitude",
        name: "Numerical Ability",
        shortDescription: "High-speed simplification, approximation, number series, arithmetic word problems, and data interpretation.",
        topics: [
          { id: "simplification-approximation", name: "Simplification & Approximation", subtopics: ["BODMAS Rules", "Percentage Fractions", "Square & Cube Roots", "Surds & Indices"], questionTypes: ["speed_math"], weightage: "10-15 Qs", difficulty: "Easy" },
          { id: "number-series", name: "Number Series", subtopics: ["Missing Number Series", "Wrong Number Series", "Difference Patterns"], questionTypes: ["number_series"], weightage: "5 Qs", difficulty: "Moderate" },
          { id: "data-interpretation", name: "Data Interpretation (DI)", subtopics: ["Table Chart DI", "Bar Graph DI", "Line Graph DI"], questionTypes: ["tabular_di"], weightage: "5-10 Qs", difficulty: "Moderate" },
        ],
      },
      {
        id: "reasoning-ability",
        name: "Reasoning Ability",
        shortDescription: "Puzzles, seating arrangement, coding, inequalities, and blood relations.",
        topics: [
          { id: "seating-arrangement", name: "Seating Arrangement", subtopics: ["Linear Single Row (All Facing North)", "Circular Seating (All Facing Inward)", "Square Arrangement"], questionTypes: ["linear_arrangement", "circular_seating"], weightage: "10-15 Qs", difficulty: "Moderate" },
          { id: "inequalities", name: "Inequalities", subtopics: ["Direct Semicolon Inequality", "Definitely True Conclusions"], questionTypes: ["direct_inequality"], weightage: "5 Qs", difficulty: "Easy" },
          { id: "syllogism", name: "Syllogism", subtopics: ["Only a few Cases", "Some and All Statements"], questionTypes: ["syllogism_only_a_few"], weightage: "5 Qs", difficulty: "Moderate" },
        ],
      },
      {
        id: "english-language",
        name: "English Language",
        shortDescription: "Reading comprehension, cloze test, error detection, and sentence rearrangement.",
        topics: [
          { id: "reading-comprehension", name: "Reading Comprehension", subtopics: ["Story & Narrative Passages", "Fact-finding Questions", "Contextual Vocabulary"], questionTypes: ["rc_direct_facts"], weightage: "8-10 Qs", difficulty: "Moderate" },
          { id: "cloze-test", name: "Cloze Test", subtopics: ["Grammar-based Fillers", "Vocabulary Fit"], questionTypes: ["cloze_test"], weightage: "5 Qs", difficulty: "Easy" },
          { id: "error-detection", name: "Error Detection", subtopics: ["Subject-Verb Agreement", "Prepositional Errors", "Tense Inconsistency"], questionTypes: ["error_detection"], weightage: "5 Qs", difficulty: "Easy" },
        ],
      },
    ],
  },

  "ibps-po": {
    examId: "ibps-po",
    examName: "IBPS PO",
    organization: "Institute of Banking Personnel Selection",
    category: "Banking & Finance",
    subCategory: "Public Sector Banking",
    syllabusVersion: "2026.1",
    examPattern: "Prelims (English 30, Quant 35, Reasoning 35 | 100 Qs / 60 Mins, 100 Marks) + Mains + Interview",
    duration: 60,
    totalQuestions: 100,
    totalMarks: 100,
    markingScheme: { positiveMarks: 1, negativeMarks: 0.25, penaltyDescription: "1 mark per correct answer; 0.25 negative marks. Sectional timing 20 min/section." },
    negativeMarking: true,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level", "Hard"],
    questionTypes: ["caselet_di", "floor_box_puzzle", "circular_seating", "quadratic_equations", "syllogism_only_a_few"],
    sections: [
      { id: "english-language", name: "English Language", subjectId: "english-language", questionCount: 30, durationMinutes: 20, marksPerQuestion: 1, negativeMarks: 0.25, cutoffExpected: 15 },
      { id: "quantitative-aptitude", name: "Quantitative Aptitude", subjectId: "quantitative-aptitude", questionCount: 35, durationMinutes: 20, marksPerQuestion: 1, negativeMarks: 0.25, cutoffExpected: 17 },
      { id: "reasoning-ability", name: "Reasoning Ability", subjectId: "reasoning-ability", questionCount: 35, durationMinutes: 20, marksPerQuestion: 1, negativeMarks: 0.25, cutoffExpected: 20 },
    ],
    subjects: [
      {
        id: "reasoning-ability",
        name: "Reasoning Ability",
        shortDescription: "Analytical puzzles, dual variable seating arrangements, conditional syllogisms, and coded inequalities.",
        topics: [
          { id: "puzzles", name: "Puzzles", subtopics: ["Floor and Flat Puzzle", "Day-Month-Year Scheduling", "Box Hierarchy Arrangement"], questionTypes: ["floor_box_puzzle", "scheduling_puzzle"], weightage: "15 Qs", difficulty: "Exam Level" },
          { id: "seating-arrangement", name: "Seating Arrangement", subtopics: ["Parallel Row Linear Seating", "Circular Seating Inward/Outward", "Unknown Number of Persons"], questionTypes: ["circular_seating", "linear_arrangement"], weightage: "10-15 Qs", difficulty: "Exam Level" },
        ],
      },
      {
        id: "quantitative-aptitude",
        name: "Quantitative Aptitude",
        shortDescription: "Caselet DI, Bar/Pie charts, quadratic equation root comparisons, and arithmetic word problems.",
        topics: [
          { id: "data-interpretation", name: "Data Interpretation (DI)", subtopics: ["Paragraph Caselet DI", "Missing Table Chart DI", "Dual Pie Chart DI"], questionTypes: ["caselet_di", "missing_table_di"], weightage: "15 Qs", difficulty: "Exam Level" },
          { id: "quadratic-equations", name: "Quadratic Equations", subtopics: ["Sign Method Root Comparison", "Square Root Factorization"], questionTypes: ["quadratic_inequality"], weightage: "5 Qs", difficulty: "Moderate" },
        ],
      },
      {
        id: "english-language",
        name: "English Language",
        shortDescription: "Editorial reading comprehension, sentence rearrangement, and advanced error spotting.",
        topics: [
          { id: "reading-comprehension", name: "Reading Comprehension", subtopics: ["Banking & Economic Passages", "Author Tone & Inferences", "Contextual Vocabulary"], questionTypes: ["inference_question"], weightage: "8-10 Qs", difficulty: "Exam Level" },
          { id: "error-detection", name: "Error Detection", subtopics: ["Subject-Verb Agreement", "Conditional Inversion Rules"], questionTypes: ["error_detection"], weightage: "5 Qs", difficulty: "Moderate" },
        ],
      },
    ],
  },

  "rbi-grade-b": {
    examId: "rbi-grade-b",
    examName: "RBI Grade B",
    organization: "Reserve Bank of India",
    category: "Banking & Finance",
    subCategory: "Regulatory Bodies",
    syllabusVersion: "2026.1",
    examPattern: "Phase I (General Awareness 80, Reasoning 60, English 30, Quant 30 | 200 Qs / 120 Mins, 200 Marks) + Phase II (ESI, FM, English) + Interview",
    duration: 120,
    totalQuestions: 200,
    totalMarks: 200,
    markingScheme: { positiveMarks: 1, negativeMarks: 0.25, penaltyDescription: "1 mark per correct answer; 0.25 negative marks. Sectional cutoffs apply." },
    negativeMarking: true,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level", "Hard"],
    questionTypes: ["rbi_circular_mcq", "economic_indicators", "high_level_puzzle", "caselet_di", "complex_reading_comprehension"],
    sections: [
      { id: "general-awareness", name: "General Awareness", subjectId: "general-awareness", questionCount: 80, durationMinutes: 25, marksPerQuestion: 1, negativeMarks: 0.25, cutoffExpected: 45 },
      { id: "reasoning-ability", name: "Reasoning Ability", subjectId: "reasoning-ability", questionCount: 60, durationMinutes: 45, marksPerQuestion: 1, negativeMarks: 0.25, cutoffExpected: 28 },
      { id: "english-language", name: "English Language", subjectId: "english-language", questionCount: 30, durationMinutes: 25, marksPerQuestion: 1, negativeMarks: 0.25, cutoffExpected: 16 },
      { id: "quantitative-aptitude", name: "Quantitative Aptitude", subjectId: "quantitative-aptitude", questionCount: 30, durationMinutes: 25, marksPerQuestion: 1, negativeMarks: 0.25, cutoffExpected: 12 },
    ],
    subjects: [
      {
        id: "general-awareness",
        name: "General & Financial Awareness",
        shortDescription: "RBI circulars, Union Budget, Economic Survey, banking regulations, and national/global current affairs.",
        topics: [
          { id: "rbi-monetary-policy", name: "RBI Policy & Financial Market Circulars", subtopics: ["MPC Decisions & Rates", "Financial Inclusion & Priority Sector", "Regulatory Sandbox & FinTech"], questionTypes: ["rbi_circular_mcq"], weightage: "35-40 Qs", difficulty: "Hard" },
          { id: "national-current-affairs", name: "Macroeconomics & Current Affairs", subtopics: ["GDP & Inflation Metrics (CPI/WPI)", "Government Schemes & Outlays", "Multilateral Forums (IMF/World Bank/G20)"], questionTypes: ["economic_indicators"], weightage: "30-35 Qs", difficulty: "Exam Level" },
        ],
      },
      {
        id: "reasoning-ability",
        name: "Reasoning Ability",
        shortDescription: "Mains-level critical reasoning, complex classification puzzles, and variable seating setups.",
        topics: [
          { id: "critical-reasoning", name: "Critical Reasoning", subtopics: ["Statement & Arguments", "Course of Action", "Cause and Effect", "Drawing Inferences"], questionTypes: ["critical_reasoning"], weightage: "15-20 Qs", difficulty: "Hard" },
          { id: "puzzles", name: "Advanced Analytical Puzzles", subtopics: ["Multi-Variable Matrix", "Scheduling with Ages and Birth Years"], questionTypes: ["high_level_puzzle"], weightage: "25 Qs", difficulty: "Hard" },
        ],
      },
    ],
  },

  "ssc-chsl": {
    examId: "ssc-chsl",
    examName: "SSC CHSL",
    organization: "Staff Selection Commission",
    category: "SSC",
    subCategory: "10+2 Higher Secondary",
    syllabusVersion: "2026.1",
    examPattern: "Tier I (Reasoning 25, GA 25, Quant 25, English 25 | 100 Qs / 60 Mins, 200 Marks) + Tier II",
    duration: 60,
    totalQuestions: 100,
    totalMarks: 200,
    markingScheme: { positiveMarks: 2, negativeMarks: 0.5, penaltyDescription: "2 marks per correct answer; 0.50 mark deduction per wrong answer. Composite 60 minutes." },
    negativeMarking: true,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level"],
    questionTypes: ["algebraic_identity", "circle_geometry", "percentage_increase", "cloze_test", "synonyms_antonyms"],
    sections: [
      { id: "reasoning-ability", name: "General Intelligence", subjectId: "reasoning-ability", questionCount: 25, durationMinutes: 15, marksPerQuestion: 2, negativeMarks: 0.5, cutoffExpected: 44 },
      { id: "general-awareness", name: "General Awareness", subjectId: "general-awareness", questionCount: 25, durationMinutes: 10, marksPerQuestion: 2, negativeMarks: 0.5, cutoffExpected: 30 },
      { id: "quantitative-aptitude", name: "Quantitative Aptitude", subjectId: "quantitative-aptitude", questionCount: 25, durationMinutes: 20, marksPerQuestion: 2, negativeMarks: 0.5, cutoffExpected: 38 },
      { id: "english-language", name: "English Language", subjectId: "english-language", questionCount: 25, durationMinutes: 15, marksPerQuestion: 2, negativeMarks: 0.5, cutoffExpected: 42 },
    ],
    subjects: [
      {
        id: "quantitative-aptitude",
        name: "Quantitative Aptitude",
        shortDescription: "Arithmetic, basic algebra, geometry, mensuration, and trigonometry.",
        topics: [
          { id: "percentage", name: "Percentage & Profit/Loss", subtopics: ["Successive Discounts", "Markup & Profit Percentage", "Expenditure & Price"], questionTypes: ["percentage_increase"], weightage: "4-5 Qs", difficulty: "Moderate" },
          { id: "algebra", name: "Algebra & Identities", subtopics: ["(a+b)^2 and (a+b)^3 Expansions", "x + 1/x Standard Reductions"], questionTypes: ["algebraic_identity"], weightage: "3-4 Qs", difficulty: "Moderate" },
        ],
      },
    ],
  },

  "rrb-group-d": {
    examId: "rrb-group-d",
    examName: "RRB Group D",
    organization: "Railway Recruitment Cells",
    category: "Railways",
    subCategory: "Track & Maintenance",
    syllabusVersion: "2026.1",
    examPattern: "CBT (General Science 25, Mathematics 25, General Intelligence 30, General Awareness 20 | 100 Qs / 90 Mins, 100 Marks)",
    duration: 90,
    totalQuestions: 100,
    totalMarks: 100,
    markingScheme: { positiveMarks: 1, negativeMarks: 0.33, penaltyDescription: "1 mark per correct answer; 1/3rd (0.33) deduction per incorrect answer. 90 minutes composite." },
    negativeMarking: true,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level"],
    questionTypes: ["physics_formulas", "chemical_reactions", "periodic_table", "basic_arithmetic", "venn_diagram"],
    sections: [
      { id: "general-science", name: "General Science", subjectId: "general-science", questionCount: 25, durationMinutes: 22, marksPerQuestion: 1, negativeMarks: 0.33, cutoffExpected: 18 },
      { id: "mathematics", name: "Mathematics", subjectId: "quantitative-aptitude", questionCount: 25, durationMinutes: 25, marksPerQuestion: 1, negativeMarks: 0.33, cutoffExpected: 19 },
      { id: "general-intelligence", name: "General Intelligence & Reasoning", subjectId: "reasoning-ability", questionCount: 30, durationMinutes: 25, marksPerQuestion: 1, negativeMarks: 0.33, cutoffExpected: 22 },
      { id: "general-awareness", name: "General Awareness & Current Affairs", subjectId: "general-awareness", questionCount: 20, durationMinutes: 18, marksPerQuestion: 1, negativeMarks: 0.33, cutoffExpected: 12 },
    ],
    subjects: [
      {
        id: "general-science",
        name: "General Science (Physics, Chemistry, Life Sciences)",
        shortDescription: "NCERT Class 10 science: Laws of Motion, Work/Power, Chemical Equations, Human Systems, Plant Biology.",
        topics: [
          { id: "physics-everyday-mechanics", name: "Physics: Motion, Work & Electricity", subtopics: ["Newton's Laws & Momentum", "Work, Energy & Power (W = F·s)", "Ohm's Law & Resistance in Series/Parallel", "Mirrors & Lens Formula"], questionTypes: ["physics_formulas"], weightage: "8-10 Qs", difficulty: "Moderate" },
          { id: "chemistry-substances", name: "Chemistry: Periodic Table & Chemical Reactions", subtopics: ["Mendeleev & Modern Periodic Table Groups", "Acids, Bases & pH Scale", "Metals, Non-metals & Reactivity Series"], questionTypes: ["chemical_reactions"], weightage: "8-9 Qs", difficulty: "Moderate" },
          { id: "biology-human-physiology", name: "Life Sciences & Human Biology", subtopics: ["Human Digestive & Circulatory Systems", "Plant Photosynthesis & Plant Hormones", "Vitamins, Minerals & Deficiency Diseases"], questionTypes: ["human_anatomy"], weightage: "7-8 Qs", difficulty: "Easy" },
        ],
      },
    ],
  },

  "ctet": {
    examId: "ctet",
    examName: "CTET",
    organization: "Central Board of Secondary Education",
    category: "Teaching",
    subCategory: "Teacher Eligibility Test",
    syllabusVersion: "2026.1",
    examPattern: "Paper I/II (Child Development & Pedagogy 30, Language I 30, Language II 30, Mathematics 30, EVS/Social 30 | 150 Qs / 150 Mins, 150 Marks)",
    duration: 150,
    totalQuestions: 150,
    totalMarks: 150,
    markingScheme: { positiveMarks: 1, negativeMarks: 0, penaltyDescription: "1 mark per correct answer. No negative marking in CTET." },
    negativeMarking: false,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level"],
    questionTypes: ["pedagogical_situation", "piaget_vygotsky_stage", "inclusive_classroom", "math_pedagogy", "language_acquisition"],
    sections: [
      { id: "pedagogy-child-dev", name: "Child Development & Pedagogy", subjectId: "pedagogy-child-dev", questionCount: 30, durationMinutes: 30, marksPerQuestion: 1, negativeMarks: 0, cutoffExpected: 22 },
      { id: "language-1", name: "Language I", subjectId: "english-language", questionCount: 30, durationMinutes: 30, marksPerQuestion: 1, negativeMarks: 0, cutoffExpected: 20 },
      { id: "language-2", name: "Language II", subjectId: "english-language", questionCount: 30, durationMinutes: 30, marksPerQuestion: 1, negativeMarks: 0, cutoffExpected: 20 },
      { id: "mathematics", name: "Mathematics & Pedagogy", subjectId: "quantitative-aptitude", questionCount: 30, durationMinutes: 30, marksPerQuestion: 1, negativeMarks: 0, cutoffExpected: 18 },
      { id: "general-science", name: "Environmental Studies / Science", subjectId: "general-science", questionCount: 30, durationMinutes: 30, marksPerQuestion: 1, negativeMarks: 0, cutoffExpected: 20 },
    ],
    subjects: [
      {
        id: "pedagogy-child-dev",
        name: "Child Development & Pedagogy",
        shortDescription: "Principles of child growth, learning theories of Piaget, Vygotsky, Kohlberg, and inclusive education.",
        topics: [
          { id: "constructivist-theories", name: "Piaget, Kohlberg & Vygotsky Constructs", subtopics: ["Piaget's 4 Cognitive Stages (Sensori-motor to Formal)", "Vygotsky's Scaffolding & ZPD", "Kohlberg's Moral Reasoning Levels"], questionTypes: ["piaget_vygotsky_stage"], weightage: "12-15 Qs", difficulty: "Exam Level" },
          { id: "inclusive-education", name: "Inclusive Education & Addressing Diverse Learners", subtopics: ["Learning Disabilities: Dyslexia, Dyscalculia, ADHD", "Gifted and Talented Learners", "RTE Act 2009 Provisions"], questionTypes: ["inclusive_classroom"], weightage: "8-10 Qs", difficulty: "Moderate" },
        ],
      },
    ],
  },

  "gate": {
    examId: "gate",
    examName: "GATE",
    organization: "IITs / IISc",
    category: "Engineering & Technical",
    subCategory: "Graduate Aptitude Test in Engineering",
    syllabusVersion: "2026.1",
    examPattern: "General Aptitude (10 Qs / 15 Marks) + Engineering Mathematics & Core Subject (55 Qs / 85 Marks) | 65 Qs / 180 Mins, 100 Marks",
    duration: 180,
    totalQuestions: 65,
    totalMarks: 100,
    markingScheme: { positiveMarks: 1.5, negativeMarks: 0.5, penaltyDescription: "1-mark MCQ: 1/3rd deduction; 2-mark MCQ: 2/3rd deduction. No negative marking for Numerical Answer Type (NAT)." },
    negativeMarking: true,
    difficultyLevels: ["Moderate", "Exam Level", "Hard"],
    questionTypes: ["numerical_answer_type", "multiple_select_question", "eigenvalues_matrix", "thermodynamics_cycle", "algorithms_complexity"],
    sections: [
      { id: "general-aptitude", name: "General Aptitude", subjectId: "quantitative-aptitude", questionCount: 10, durationMinutes: 25, marksPerQuestion: 1.5, negativeMarks: 0.5, cutoffExpected: 12 },
      { id: "engineering-math", name: "Engineering Mathematics", subjectId: "engineering-math", questionCount: 15, durationMinutes: 45, marksPerQuestion: 1.5, negativeMarks: 0.5, cutoffExpected: 10 },
      { id: "engineering-technical", name: "Core Technical Discipline", subjectId: "engineering-technical", questionCount: 40, durationMinutes: 110, marksPerQuestion: 1.6, negativeMarks: 0.53, cutoffExpected: 28 },
    ],
    subjects: [
      {
        id: "engineering-math",
        name: "Engineering Mathematics",
        shortDescription: "Linear Algebra, Calculus, Differential Equations, Vector Analysis, and Probability.",
        topics: [
          { id: "linear-algebra-matrices", name: "Linear Algebra & Eigenvalues", subtopics: ["Cayley-Hamilton Theorem", "Eigenvalues & Eigenvectors", "Matrix Rank & System of Linear Equations"], questionTypes: ["eigenvalues_matrix"], weightage: "4-5 Qs", difficulty: "Hard" },
          { id: "calculus-differential-eq", name: "Calculus & Ordinary Differential Equations", subtopics: ["Partial Derivatives & Taylor Series", "First & Second Order Linear ODEs", "Laplace Transform Applications"], questionTypes: ["numerical_answer_type"], weightage: "4-5 Qs", difficulty: "Hard" },
        ],
      },
      {
        id: "engineering-technical",
        name: "Core Engineering Domain",
        shortDescription: "Strength of materials, fluid mechanics, network theory, machines, algorithms, or structures depending on branch.",
        topics: [
          { id: "engineering-mechanics-materials", name: "Mechanics & Strength of Materials", subtopics: ["Mohr's Circle of Stresses", "Bending Moment & Shear Force Diagrams", "Deflection of Beams & Euler Buckling"], questionTypes: ["numerical_answer_type"], weightage: "12-15 Qs", difficulty: "Hard" },
        ],
      },
    ],
  },
};

/**
 * Intelligent Blueprint Resolver:
 * Returns the exact blueprint if defined, or constructs an authentic, fully populated
 * blueprint based on the exam's official catalogue metadata, subjects, and category.
 */
export function getExamBlueprint(examId: string): ExamBlueprint {
  if (EXAM_BLUEPRINTS[examId]) {
    return EXAM_BLUEPRINTS[examId];
  }

  const exam = getExamById(examId);
  const normalizedId = examId.toLowerCase();

  // Determine scoring and negative marking policy by exam category
  let positiveMarks = 1;
  let negativeMarks = 0.25;
  let penaltyDescription = "1 mark per correct answer; 0.25 mark deduction for incorrect answers.";
  let negativeMarking = true;

  const category = exam?.category || "";

  if (category === "SSC" || normalizedId.includes("ssc")) {
    positiveMarks = 2;
    negativeMarks = 0.5;
    penaltyDescription = "2 marks per correct answer; 0.50 mark deduction for incorrect answers.";
  } else if (category === "Railways" || normalizedId.includes("rrb") || normalizedId.includes("rpf")) {
    positiveMarks = 1;
    negativeMarks = 0.33;
    penaltyDescription = "1 mark per correct answer; 1/3rd (0.33) mark deduction for incorrect answers.";
  } else if (category === "UPSC" || category === "Defence" || normalizedId.includes("upsc") || normalizedId.includes("nda") || normalizedId.includes("cds")) {
    positiveMarks = 2;
    negativeMarks = 0.66;
    penaltyDescription = "2 marks per correct answer; 1/3rd (0.66) mark deduction for incorrect answers.";
  } else if (category === "Teaching" || category === "TNPSC" || category === "State PSC" || normalizedId.includes("tnpsc") || normalizedId.includes("tet")) {
    positiveMarks = 1.5;
    negativeMarks = 0;
    penaltyDescription = "1.5 marks per question. No negative marking in this objective examination.";
    negativeMarking = false;
  }

  const duration = exam?.durationMinutes || 60;
  const totalQuestions = exam?.totalQuestions || 100;
  const totalMarks = totalQuestions * positiveMarks;

  // Dynamically resolve subjects & topics from the central registries
  let subjects: ExamSubjectBlueprint[] = [];
  let sections: ExamSectionBlueprint[] = [];

  try {
    const { MASTER_SUBJECTS } = require("./subjectRegistry");
    const { MASTER_TOPICS_BY_SUBJECT } = require("./topicRegistry");

    const rawSubjectIds: string[] = exam?.subjects && exam.subjects.length > 0
      ? exam.subjects
      : ["quantitative-aptitude", "reasoning-ability", "english-language", "general-awareness"];

    const questionsPerSec = Math.max(5, Math.floor(totalQuestions / rawSubjectIds.length));
    const durationPerSec = Math.max(5, Math.floor(duration / rawSubjectIds.length));

    subjects = rawSubjectIds.map((subId) => {
      const masterSub = MASTER_SUBJECTS[subId];
      const masterTopics = MASTER_TOPICS_BY_SUBJECT[subId] || [];

      const topics: ExamTopicBlueprint[] = masterTopics.slice(0, 6).map((mt: { id: string; name: string; description?: string }) => ({
        id: mt.id,
        name: mt.name,
        description: mt.description || `Core concepts and examination problem sets for ${mt.name}.`,
        subtopics: [
          `${mt.name} Core Concepts & Rules`,
          `${mt.name} Standard Question Formats`,
          `${mt.name} Speed Shortcuts & Elimination Hacks`,
          `${mt.name} High-Yield Practice Drills`,
        ],
        questionTypes: ["multiple_choice", "concept_application"],
        weightage: "Core Exam Topic",
        difficulty: "Exam Level",
      }));

      return {
        id: subId,
        name: masterSub?.name || subId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        shortDescription: masterSub?.shortDescription || "Curriculum topic breakdown and test patterns.",
        topics,
      };
    });

    sections = rawSubjectIds.map((subId, idx) => {
      const isLast = idx === rawSubjectIds.length - 1;
      const count = isLast ? totalQuestions - questionsPerSec * (rawSubjectIds.length - 1) : questionsPerSec;
      const secDuration = isLast ? duration - durationPerSec * (rawSubjectIds.length - 1) : durationPerSec;
      const masterSub = MASTER_SUBJECTS[subId];

      return {
        id: subId,
        name: masterSub?.name || subId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        subjectId: subId,
        questionCount: count,
        durationMinutes: secDuration,
        marksPerQuestion: positiveMarks,
        negativeMarks: negativeMarks,
        cutoffExpected: Math.round(count * 0.5),
      };
    });
  } catch {
    // Graceful fallback to SBI PO structure if required
    return {
      ...EXAM_BLUEPRINTS["sbi-po"],
      examId,
      examName: exam?.name || examId.toUpperCase(),
    };
  }

  return {
    examId,
    examName: exam?.name || examId.toUpperCase(),
    organization: exam?.organization || "Examination Authority",
    category: exam?.category || "Competitive Exam",
    subCategory: exam?.subCategory || "General Cadre",
    syllabusVersion: "2026.1",
    examPattern: exam?.examPattern || `${totalQuestions} Questions in ${duration} Minutes`,
    duration,
    totalQuestions,
    totalMarks,
    markingScheme: {
      positiveMarks,
      negativeMarks,
      penaltyDescription,
    },
    negativeMarking,
    difficultyLevels: ["Beginner", "Easy", "Moderate", "Exam Level", "Hard"],
    questionTypes: [
      "multiple_choice",
      "statement_analysis",
      "concept_application",
      "data_interpretation",
      "numerical_problem",
    ],
    sections,
    subjects,
  };
}

/**
 * Constructs a structured TestBlueprint for timed mock exams
 */
export function getTestBlueprint(
  examId: string,
  testType: "full_mock" | "sectional" | "mini_mock" = "full_mock"
): TestBlueprint {
  const bp = getExamBlueprint(examId);

  if (testType === "mini_mock") {
    // 20-question mini mock for fast daily benchmarking
    const miniTotalQ = 20;
    const miniDuration = Math.max(15, Math.round(bp.duration / 4));
    const secCount = Math.max(1, bp.sections.length);
    const qPerSec = Math.max(1, Math.floor(miniTotalQ / secCount));

    return {
      examId: bp.examId,
      examName: bp.examName,
      testTitle: `${bp.examName} High-Yield Mini Mock`,
      type: "mini_mock",
      sections: bp.sections.map((sec, idx) => ({
        ...sec,
        questionCount: idx === secCount - 1 ? miniTotalQ - qPerSec * (secCount - 1) : qPerSec,
        durationMinutes: Math.max(4, Math.round(miniDuration / secCount)),
      })),
      totalDurationMinutes: miniDuration,
      totalQuestions: miniTotalQ,
      totalMarks: miniTotalQ * bp.markingScheme.positiveMarks,
      markingScheme: bp.markingScheme.penaltyDescription,
      negativeMarking: bp.negativeMarking,
      difficultyDistribution: {
        easyPercent: 30,
        moderatePercent: 50,
        hardPercent: 20,
      },
    };
  }

  return {
    examId: bp.examId,
    examName: bp.examName,
    testTitle: `${bp.examName} Full Comprehensive Mock Exam`,
    type: "full_mock",
    sections: bp.sections,
    totalDurationMinutes: bp.duration,
    totalQuestions: bp.totalQuestions,
    totalMarks: bp.totalMarks,
    markingScheme: bp.markingScheme.penaltyDescription,
    negativeMarking: bp.negativeMarking,
    difficultyDistribution: {
      easyPercent: 25,
      moderatePercent: 55,
      hardPercent: 20,
    },
  };
}

