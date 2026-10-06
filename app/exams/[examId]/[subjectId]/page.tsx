"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { TopicCard } from "@/components/exams/TopicCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getExamById, CENTRAL_EXAM_CATALOGUE } from "@/lib/data/examCatalogue";
import { getSubjectsForExam, getSubjectById } from "@/lib/data/subjectRegistry";
import { getTopicsForSubject } from "@/lib/data/topicRegistry";
import { Filter, Search } from "lucide-react";

export default function TopicSelectionPage() {
  const params = useParams();
  const rawExamId = params?.examId as string;
  const rawSubjectId = params?.subjectId as string;

  const examId = rawExamId || "sbi-po";
  const subjectId = rawSubjectId || "reasoning-ability";

  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const exam = getExamById(examId) || CENTRAL_EXAM_CATALOGUE.find((e) => e.id === examId) || CENTRAL_EXAM_CATALOGUE[0];
  const subjects = getSubjectsForExam(exam.id);
  const subject =
    subjects.find((s) => s.id === subjectId) ||
    getSubjectById(subjectId, exam.id) ||
    subjects[0];

  const allTopics = getTopicsForSubject(subject.id, exam.id);

  // Filter topics
  const filteredTopics = allTopics.filter((topic) => {
    const matchesDifficulty =
      difficultyFilter === "All" || topic.difficulty === difficultyFilter;
    const matchesSearch =
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  return (
    <AppShell>
      <PageHeader
        title={`${subject.name} Syllabus`}
        subtitle={`${exam.name} • Select a topic to study with AI guidance, practice adaptive questions, or launch a timed mock test.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Exams", href: "/exams" },
          { label: exam.name, href: `/exams/${exam.id}` },
          { label: subject.name },
        ]}
        badge={
          <Badge variant="forest" size="md">
            {allTopics.length} Topics
          </Badge>
        }
      />

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search topic or concept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-charcoal-50/60 border border-charcoal-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-forest-800 focus:bg-white text-charcoal-900"
          />
        </div>

        {/* Difficulty Pill Filter */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto">
          <span className="text-xs font-semibold text-charcoal-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Difficulty:
          </span>
          {["All", "Easy", "Medium", "Hard"].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setDifficultyFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                difficultyFilter === lvl
                  ? "bg-forest-900 text-white font-semibold shadow-xs"
                  : "bg-charcoal-100/70 text-charcoal-700 hover:bg-charcoal-200/70"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      {filteredTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No topics match your filter"
          description="Try clearing your search query or switching to 'All' difficulty levels."
          actionText="Reset Filters"
          onAction={() => {
            setSearchQuery("");
            setDifficultyFilter("All");
          }}
        />
      )}
    </AppShell>
  );
}
