"use client";

import React, { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExamCard } from "@/components/exams/ExamCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CENTRAL_EXAM_CATALOGUE,
  EXAM_CATEGORIES,
  getSubCategories,
} from "@/lib/data/examCatalogue";
import { Search, Filter, X, Sparkles, SlidersHorizontal } from "lucide-react";

export default function ExamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  // Dynamic subcategories based on currently selected category
  const availableSubCategories = useMemo(() => {
    return getSubCategories(selectedCategory === "All" ? undefined : selectedCategory);
  }, [selectedCategory]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: CENTRAL_EXAM_CATALOGUE.length };
    EXAM_CATEGORIES.forEach((cat) => {
      counts[cat] = CENTRAL_EXAM_CATALOGUE.filter((e) => e.category === cat).length;
    });
    return counts;
  }, []);

  // Filtered exams list
  const filteredExams = useMemo(() => {
    return CENTRAL_EXAM_CATALOGUE.filter((exam) => {
      const matchesCategory =
        selectedCategory === "All" || exam.category === selectedCategory;
      const matchesSubCategory =
        selectedSubCategory === "All" || exam.subCategory === selectedSubCategory;
      const matchesDifficulty =
        selectedDifficulty === "All" || exam.difficulty === selectedDifficulty;

      if (!matchesCategory || !matchesSubCategory || !matchesDifficulty) {
        return false;
      }

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        exam.name.toLowerCase().includes(q) ||
        exam.shortName.toLowerCase().includes(q) ||
        exam.officialName.toLowerCase().includes(q) ||
        exam.organization.toLowerCase().includes(q) ||
        exam.category.toLowerCase().includes(q) ||
        exam.subCategory.toLowerCase().includes(q) ||
        exam.description.toLowerCase().includes(q) ||
        exam.highlights.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory, selectedSubCategory, selectedDifficulty]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== "All" ||
    selectedSubCategory !== "All" ||
    selectedDifficulty !== "All";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedSubCategory("All");
    setSelectedDifficulty("All");
  };

  return (
    <AppShell>
      <PageHeader
        title="Central Exam Catalogue"
        subtitle="Explore and target government, banking, administrative, technical, and defence competitive exams across India."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Exams" },
        ]}
        badge={
          <Badge variant="forest" size="md">
            {CENTRAL_EXAM_CATALOGUE.length} Exams Active
          </Badge>
        }
      />

      {/* Control Panel: Search & Filters */}
      <div className="space-y-4 mb-8">
        {/* Search Bar + Difficulty Selector */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by exam name, body (SBI, SSC, UPSC, RRB, TNPSC), or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-charcoal-50/60 border border-charcoal-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-forest-800 focus:bg-white text-charcoal-900 transition-all placeholder:text-charcoal-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-charcoal-400 hover:text-charcoal-700"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* SubCategory Filter Dropdown */}
          {availableSubCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="subcategory-select" className="text-xs font-semibold text-charcoal-600 whitespace-nowrap flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Subcategory:
              </label>
              <select
                id="subcategory-select"
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="py-2 px-3 text-xs bg-charcoal-50/80 border border-charcoal-200 rounded-xl text-charcoal-800 font-medium focus:ring-2 focus:ring-forest-800 focus:outline-hidden"
              >
                <option value="All">All Subcategories</option>
                {availableSubCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto">
            <span className="text-xs font-semibold text-charcoal-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Difficulty:
            </span>
            {["All", "Easy", "Medium", "Hard"].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedDifficulty(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDifficulty === lvl
                    ? "bg-forest-900 text-white font-semibold shadow-xs"
                    : "bg-charcoal-100/70 text-charcoal-700 hover:bg-charcoal-200/70"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* 16 Category Filter Pills */}
        <div className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-forest-700" />
              Exam Categories ({EXAM_CATEGORIES.length})
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-forest-800 hover:text-forest-950 flex items-center gap-1 hover:underline"
              >
                <X className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSelectedSubCategory("All");
              }}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === "All"
                  ? "bg-forest-900 text-white shadow-xs"
                  : "bg-almond-50 text-charcoal-700 hover:bg-almond-100 border border-charcoal-200/60"
              }`}
            >
              <span>All Exams</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === "All"
                    ? "bg-forest-800 text-almond-200"
                    : "bg-charcoal-200/80 text-charcoal-700"
                }`}
              >
                {categoryCounts["All"]}
              </span>
            </button>

            {EXAM_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSubCategory("All");
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-forest-900 text-white shadow-xs"
                      : "bg-almond-50/70 text-charcoal-700 hover:bg-almond-100 border border-charcoal-200/60"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? "bg-forest-800 text-almond-200"
                        : "bg-charcoal-200/80 text-charcoal-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-charcoal-500 px-1">
          <span>
            Showing <strong>{filteredExams.length}</strong> of{" "}
            <strong>{CENTRAL_EXAM_CATALOGUE.length}</strong> exams
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </span>
          {hasActiveFilters && (
            <span className="font-medium text-forest-800">
              Active filters applied
            </span>
          )}
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No exams match your search criteria"
          description="Try clearing your search query or switching categories to explore more exams."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      )}
    </AppShell>
  );
}
