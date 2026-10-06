"use client";

import React, { useState } from "react";
import {
  CENTRAL_EXAM_CATALOGUE,
  EXAM_CATEGORIES,
} from "@/lib/data/examCatalogue";
import {
  GraduationCap,
  Search,
  Check,
  X,
  Sparkles,
} from "lucide-react";

interface ChangeTargetExamModalProps {
  isOpen: boolean;
  currentExamId?: string;
  onClose: () => void;
  onSelectExam: (examId: string) => Promise<void>;
}

export function ChangeTargetExamModal({
  isOpen,
  currentExamId,
  onClose,
  onSelectExam,
}: ChangeTargetExamModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredExams = CENTRAL_EXAM_CATALOGUE.filter((exam) => {
    const matchesCategory =
      selectedCategory === "All" || exam.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.officialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = async (examId: string) => {
    if (examId === currentExamId) {
      onClose();
      return;
    }

    setIsUpdating(examId);
    try {
      await onSelectExam(examId);
      onClose();
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-charcoal-200 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest-900 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-charcoal-900">
                Change Target Exam
              </h3>
              <p className="text-xs text-charcoal-500">
                Choose from all {CENTRAL_EXAM_CATALOGUE.length} supported government competitive exams.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-charcoal-400 hover:text-charcoal-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search by exam name or body (e.g., SBI PO, TNPSC, SSC, UPSC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-charcoal-50 border border-charcoal-200 rounded-xl text-xs sm:text-sm pl-9 pr-4 py-2.5 text-charcoal-900 focus:outline-hidden focus:ring-2 focus:ring-forest-800 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === "All"
                  ? "bg-forest-900 text-white"
                  : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
              }`}
            >
              All Categories ({CENTRAL_EXAM_CATALOGUE.length})
            </button>
            {EXAM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? "bg-forest-900 text-white"
                    : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exams List (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[50vh]">
          {filteredExams.length === 0 ? (
            <div className="text-center py-10 text-charcoal-400 text-xs">
              No matching exams found for &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredExams.map((exam) => {
              const isSelected = exam.id === currentExamId;
              const isPending = isUpdating === exam.id;

              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => handleSelect(exam.id)}
                  disabled={Boolean(isUpdating)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? "border-forest-800 bg-forest-50/70 ring-2 ring-forest-700/30"
                      : "border-charcoal-200 bg-white hover:bg-charcoal-50 hover:border-forest-300"
                  }`}
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-charcoal-900">
                        {exam.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-charcoal-100 text-charcoal-700">
                        {exam.category}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-forest-700 text-white flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Current Target
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-charcoal-500 mt-0.5">
                      {exam.officialName} • {exam.difficulty}
                    </div>
                  </div>

                  <div className="shrink-0 text-xs font-semibold text-forest-800">
                    {isPending ? (
                      <span className="animate-pulse">Updating...</span>
                    ) : isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-forest-800 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-charcoal-400 hover:text-forest-900">
                        Select →
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-500 shrink-0">
          <span className="flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-forest-700" />
            Switching your target updates your dashboard syllabus and practice drills.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 px-3 py-1 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
