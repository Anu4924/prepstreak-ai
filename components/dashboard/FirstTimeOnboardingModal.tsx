"use client";

import React, { useState, useEffect } from "react";
import { CENTRAL_EXAM_CATALOGUE, EXAM_CATEGORIES, getExamById } from "@/lib/data/examCatalogue";
import { getSubjectsForExam } from "@/lib/data/subjectRegistry";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";

interface FirstTimeOnboardingModalProps {
  isOpen: boolean;
  userName: string;
  onComplete: (
    examId: string,
    subjectId?: string,
    dailyGoal?: number,
    difficulty?: "Easy" | "Medium" | "Hard" | "Adaptive"
  ) => Promise<void>;
}

export function FirstTimeOnboardingModal({
  isOpen,
  userName,
  onComplete,
}: FirstTimeOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [dailyGoal, setDailyGoal] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Adaptive">("Adaptive");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available subjects for the selected exam
  const availableSubjects = selectedExamId ? getSubjectsForExam(selectedExamId) : [];

  // Update selected subject when exam changes
  useEffect(() => {
    if (selectedExamId) {
      const subs = getSubjectsForExam(selectedExamId);
      if (subs.length > 0) {
        setSelectedSubjectId(subs[0].id);
      }
    }
  }, [selectedExamId]);

  if (!isOpen) return null;

  const filteredExams =
    selectedCategory === "All"
      ? CENTRAL_EXAM_CATALOGUE
      : CENTRAL_EXAM_CATALOGUE.filter((e) => e.category === selectedCategory);

  const selectedExamObj = getExamById(selectedExamId);
  const selectedSubjectObj = availableSubjects.find((s) => s.id === selectedSubjectId);

  const handleNext = async () => {
    if (step === 1) {
      if (!selectedExamId) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setIsSubmitting(true);
      try {
        await onComplete(selectedExamId, selectedSubjectId, dailyGoal, difficulty);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-charcoal-200 space-y-6 relative overflow-hidden">
        {/* Top Progress Indicator */}
        <div className="flex items-center justify-between border-b border-charcoal-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-forest-900 text-almond-100 flex items-center justify-center font-bold text-sm">
              {step}
            </div>
            <div>
              <div className="text-xs font-bold text-forest-900 uppercase tracking-wider">
                Step {step} of 3
              </div>
              <div className="text-sm font-semibold text-charcoal-800">
                {step === 1 && "Choose Your Target Examination"}
                {step === 2 && "Customize Daily Practice Targets"}
                {step === 3 && "You're All Set!"}
              </div>
            </div>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? "bg-forest-900 w-10" : s < step ? "bg-forest-600" : "bg-charcoal-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Choose Target Exam */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900">
                Welcome, {userName.split(" ")[0]}! Let&apos;s pick your exam.
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Select your primary competitive examination. All questions, AI tutoring, and analytics will be calibrated for this goal.
              </p>
            </div>

            {/* Category Quick Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className={`text-xs px-3 py-1.5 rounded-xl border font-semibold shrink-0 transition-colors ${
                  selectedCategory === "All"
                    ? "bg-forest-900 text-white border-forest-900"
                    : "bg-charcoal-50 text-charcoal-600 border-charcoal-200 hover:bg-forest-50"
                }`}
              >
                All Exams ({CENTRAL_EXAM_CATALOGUE.length})
              </button>
              {EXAM_CATEGORIES.slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold shrink-0 transition-colors ${
                    selectedCategory === cat
                      ? "bg-forest-900 text-white border-forest-900"
                      : "bg-charcoal-50 text-charcoal-600 border-charcoal-200 hover:bg-forest-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Exam Selection Grid */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 rounded-2xl border border-charcoal-200/80 p-2 bg-charcoal-50/40">
              {filteredExams.map((exam) => {
                const isSelected = selectedExamId === exam.id;
                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-forest-50 border-forest-800 ring-2 ring-forest-800/30 shadow-xs"
                        : "bg-white border-charcoal-200/80 hover:bg-charcoal-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? "bg-forest-900 text-white"
                            : "bg-charcoal-100 text-charcoal-700"
                        }`}
                      >
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-charcoal-900">{exam.name}</div>
                        <div className="text-xs text-charcoal-500">
                          {exam.category} • {exam.difficulty}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-forest-900 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={!selectedExamId}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Continue to Study Goals
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Choose Preferred Subject & Goals */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900">
                Choose Subject & Study Quota
              </h2>
              <p className="text-xs text-charcoal-500 mt-1">
                Targeting: <strong className="text-forest-900">{selectedExamObj?.name}</strong>. Pick your starting focus area and daily targets.
              </p>
            </div>

            <div className="space-y-3">
              {availableSubjects.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                    Preferred Focus Subject
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {availableSubjects.map((sub) => {
                      const isSelected = selectedSubjectId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSelectedSubjectId(sub.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                            isSelected
                              ? "bg-forest-50 border-forest-900 ring-2 ring-forest-800/30 font-bold text-forest-900"
                              : "bg-white text-charcoal-700 border-charcoal-200 hover:bg-forest-50"
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div>{sub.name}</div>
                            <div className="text-[10px] text-charcoal-400 font-normal">{sub.topicCount} Topics</div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-forest-900 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                  Daily Questions Target
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[10, 20, 35, 50].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setDailyGoal(count)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        dailyGoal === count
                          ? "bg-forest-900 text-white border-forest-900 shadow-xs ring-2 ring-forest-800/30"
                          : "bg-white text-charcoal-700 border-charcoal-200 hover:bg-forest-50"
                      }`}
                    >
                      <div className="text-base font-extrabold">{count}</div>
                      <div className="text-[9px] opacity-80 uppercase tracking-wider">Qs / Day</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                  AI Question Difficulty
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "Adaptive", label: "Adaptive (Recommended)", desc: "Dynamically adjusts to your accuracy" },
                    { id: "Easy", label: "Foundation Level", desc: "Concept-building & introductory questions" },
                    { id: "Medium", label: "Prelims Standard", desc: "Realistic speed & accuracy benchmark" },
                    { id: "Hard", label: "Mains Standard", desc: "Advanced problem solving" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setDifficulty(lvl.id as "Easy" | "Medium" | "Hard" | "Adaptive")}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        difficulty === lvl.id
                          ? "bg-forest-50 border-forest-900 ring-2 ring-forest-800/30 shadow-xs"
                          : "bg-white border-charcoal-200 hover:bg-charcoal-50"
                      }`}
                    >
                      <div className="text-xs font-bold text-charcoal-900">{lvl.label}</div>
                      <div className="text-[10px] text-charcoal-500">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-charcoal-100">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Review Setup
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Complete / You're all set */}
        {step === 3 && (
          <div className="text-center space-y-5 py-2 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center mx-auto text-forest-800 shadow-xs">
              <Sparkles className="w-7 h-7 text-amber-500 fill-amber-400" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-charcoal-900">
                You&apos;re All Set, {userName.split(" ")[0]}!
              </h2>
              <p className="text-xs text-charcoal-600 max-w-md mx-auto leading-relaxed">
                Your preparation profile for <strong className="text-charcoal-900 font-bold">{selectedExamObj?.name}</strong> has been created. You will start with a fresh streak of 0 days and 0 questions solved.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-almond-50/80 border border-almond-200 max-w-md mx-auto text-left grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-charcoal-500 block text-[11px]">Target Examination:</span>
                <span className="font-bold text-forest-950">{selectedExamObj?.name}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[11px]">Focus Subject:</span>
                <span className="font-bold text-forest-950">{selectedSubjectObj?.name || "All Subjects"}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[11px]">Daily Syllabus Quota:</span>
                <span className="font-bold text-forest-950">{dailyGoal} Questions / Day</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[11px]">Initial Streak:</span>
                <span className="font-bold text-amber-700">0 Days (Begins Today)</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto px-8 justify-center mx-auto"
                onClick={handleNext}
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                {isSubmitting ? "Setting Up..." : "Start Learning"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
