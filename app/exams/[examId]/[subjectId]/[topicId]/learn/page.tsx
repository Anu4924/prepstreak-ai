"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { AxmokChatTutor } from "@/components/ai/AxmokChatTutor";
import { TopicLearningDeck } from "@/components/ai/TopicLearningDeck";
import { TopicNavigationControls } from "@/components/ai/TopicNavigationControls";
import { AxmokAIService } from "@/services/ai/axmok-ai-service";
import { getExamById, CENTRAL_EXAM_CATALOGUE } from "@/lib/data/examCatalogue";
import { getSubjectsForExam, getSubjectById } from "@/lib/data/subjectRegistry";
import { getTopicsForSubject, getTopicById } from "@/lib/data/topicRegistry";
import { getSubtopicsForTopic } from "@/lib/data/subtopicRegistry";
import { BookOpen, Sparkles, Target, Layers, ArrowRight } from "lucide-react";

export default function AxmokAiTopicLearnPage() {
  const params = useParams();
  const rawExamId = (params?.examId as string) || "sbi-po";
  const rawSubjectId = (params?.subjectId as string) || "reasoning-ability";
  const rawTopicId = (params?.topicId as string) || "coding-decoding";

  const [activePromptForChat, setActivePromptForChat] = useState<string | null>(null);

  // 1. Resolve Exam
  const exam =
    getExamById(rawExamId) ||
    CENTRAL_EXAM_CATALOGUE.find((e) => e.id === rawExamId) ||
    CENTRAL_EXAM_CATALOGUE[0];

  // 2. Resolve Subject
  const subjects = getSubjectsForExam(exam.id);
  const subject =
    subjects.find((s) => s.id === rawSubjectId) ||
    getSubjectById(rawSubjectId, exam.id) ||
    subjects[0];

  // 3. Resolve Topics for this Subject & Current Topic
  const allSubjectTopics = getTopicsForSubject(subject.id, exam.id);
  const currentTopic =
    allSubjectTopics.find((t) => t.id === rawTopicId) ||
    getTopicById(rawTopicId, subject.id, exam.id) ||
    allSubjectTopics[0];

  // If topic or subject cannot be resolved
  if (!currentTopic || !subject || !exam) {
    return (
      <AppShell>
        <PageHeader
          title="Topic Not Found"
          subtitle="The requested syllabus topic could not be located."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Exams", href: "/exams" },
            { label: "Not Found" },
          ]}
        />
        <EmptyState
          title="Topic Not Available"
          description="Please select an active topic from your target examination syllabus."
          actionText="Browse Exams"
          actionHref="/exams"
        />
      </AppShell>
    );
  }

  // 4. Calculate previous and next topics for navigation
  const currentIndex = allSubjectTopics.findIndex((t) => t.id === currentTopic.id);
  const previousTopic =
    currentIndex > 0
      ? { id: allSubjectTopics[currentIndex - 1].id, name: allSubjectTopics[currentIndex - 1].name }
      : null;
  const nextTopic =
    currentIndex >= 0 && currentIndex < allSubjectTopics.length - 1
      ? { id: allSubjectTopics[currentIndex + 1].id, name: allSubjectTopics[currentIndex + 1].name }
      : null;

  // 5. Fetch subtopics and structured 6-section topic learning notes
  const subtopics = getSubtopicsForTopic(exam.id, subject.id, currentTopic.id);
  const topicLearningContent = AxmokAIService.getTopicLearningStructure(
    exam.name,
    subject.name,
    currentTopic.name,
    currentTopic.id
  );

  return (
    <AppShell>
      {/* Page Header with Breadcrumbs & Axmok AI Badge */}
      <PageHeader
        title={currentTopic.name}
        subtitle={`${subject.name} • ${exam.officialName || exam.name}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Exams", href: "/exams" },
          { label: exam.name, href: `/exams/${exam.id}` },
          { label: subject.name, href: `/exams/${exam.id}/${subject.id}` },
          { label: currentTopic.name },
        ]}
        badge={
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900 text-almond-100 text-xs font-bold border border-forest-700 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Axmok AI Tutor Active</span>
          </div>
        }
      />

      {/* Topic Mastery Banner */}
      <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-white border border-charcoal-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-800 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-charcoal-900">
                Topic Mastery & Syllabus Progress
              </h3>
              <Badge variant="outline" size="sm">
                {currentTopic.importance} Importance
              </Badge>
            </div>
            <p className="text-xs text-charcoal-500 mt-0.5">
              {currentTopic.completedQuestions} of {currentTopic.totalQuestions} questions completed
              • Last practiced: {currentTopic.lastPracticed}
            </p>
          </div>
        </div>

        <div className="sm:w-64">
          <div className="flex justify-between items-center text-xs font-semibold text-charcoal-700 mb-1.5">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-forest-700" />
              Mastery Score
            </span>
            <span className="text-forest-900 font-bold">{currentTopic.progress}%</span>
          </div>
          <ProgressBar
            value={currentTopic.progress}
            height="sm"
            variant={
              currentTopic.progress < 60
                ? "amber"
                : currentTopic.progress < 80
                ? "forest"
                : "emerald"
            }
          />
        </div>
      </div>

      {/* Subtopics Syllabus Breakdown Card */}
      {subtopics && subtopics.length > 0 && (
        <div className="mb-6 p-5 rounded-3xl bg-white border border-charcoal-200/90 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-charcoal-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-900 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal-900">
                  Official Syllabus Subtopics & Question Patterns
                </h3>
                <p className="text-xs text-charcoal-500">
                  {subtopics.length} tested subtopics identified for {exam.name}
                </p>
              </div>
            </div>
            <Badge variant="forest" size="sm">
              Exam Hierarchy Active
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subtopics.map((st, idx) => (
              <div
                key={st.id}
                className="p-3.5 rounded-2xl bg-charcoal-50/60 border border-charcoal-200/80 hover:border-forest-400 hover:bg-forest-50/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-charcoal-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-forest-900 text-almond-100 text-[10px] font-mono flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {st.name}
                    </span>
                    <Badge variant={st.importance === "Critical" ? "warning" : "neutral"} size="sm">
                      {st.importance || "Core"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-charcoal-600 line-clamp-2 mb-2 leading-relaxed">
                    {st.description || st.questionPatterns?.join(" • ") || "Standard official pattern"}
                  </p>
                  {st.questionPatterns && st.questionPatterns.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {st.questionPatterns.slice(0, 2).map((pat) => (
                        <span
                          key={pat}
                          className="px-2 py-0.5 rounded-md bg-white border border-charcoal-200 text-[10px] text-charcoal-600 font-medium"
                        >
                          {pat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <a
                  href={`/exams/${exam.id}/${subject.id}/${currentTopic.id}/practice?subtopic=${st.id}`}
                  className="mt-2 inline-flex items-center justify-between w-full px-3 py-1.5 rounded-xl bg-white hover:bg-forest-900 hover:text-white border border-charcoal-200 text-xs font-semibold text-charcoal-800 transition-colors shadow-2xs group"
                >
                  <span>Practice Subtopic</span>
                  <ArrowRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Learning Grid: Left (Structured Curriculum Deck) | Right (Axmok AI Interactive Tutor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column (7 cols on desktop): 6-section Topic Notes */}
        <div className="lg:col-span-7">
          <TopicLearningDeck
            content={topicLearningContent}
            onAskAxmokPrompt={(prompt) => setActivePromptForChat(prompt)}
            practiceHref={`/exams/${exam.id}/${subject.id}/${currentTopic.id}/practice`}
          />
        </div>

        {/* Right Column (5 cols on desktop): Axmok AI Conversational Tutor */}
        <div className="lg:col-span-5">
          <AxmokChatTutor
            examId={exam.id}
            examName={exam.name}
            subjectId={subject.id}
            subjectName={subject.name}
            topicId={currentTopic.id}
            topicName={currentTopic.name}
            activePromptFromDeck={activePromptForChat}
            onClearActivePrompt={() => setActivePromptForChat(null)}
          />
        </div>
      </div>

      {/* Bottom Topic Navigation Controls */}
      <TopicNavigationControls
        examId={exam.id}
        subjectId={subject.id}
        currentTopicId={currentTopic.id}
        previousTopic={previousTopic}
        nextTopic={nextTopic}
      />
    </AppShell>
  );
}
