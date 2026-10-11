"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AxmokChatTutor } from "@/components/ai/AxmokChatTutor";
import { TopicLearningDeck } from "@/components/ai/TopicLearningDeck";
import { TopicNavigationControls } from "@/components/ai/TopicNavigationControls";
import { AxmokAIService } from "@/services/ai/axmok-ai-service";
import { getExamById, CENTRAL_EXAM_CATALOGUE } from "@/lib/data/examCatalogue";
import { getSubjectsForExam, getSubjectById } from "@/lib/data/subjectRegistry";
import { useAuth } from "@/services/auth/auth-context";
import { getTopicsForSubject, getTopicById } from "@/lib/data/topicRegistry";
import { BookOpen, Sparkles, Target } from "lucide-react";

function LearnPageContent() {
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const queryExamId = searchParams.get("examId");
  const querySubjectId = searchParams.get("subjectId");
  const queryTopicId = searchParams.get("topic") || searchParams.get("topicId");

  const effectiveExamId =
    queryExamId ||
    profile?.examId ||
    (profile?.currentExam && profile.currentExam !== "None" ? profile.currentExam : "") ||
    "sbi-po";

  const [activePromptForChat, setActivePromptForChat] = useState<string | null>(null);

  // 1. Resolve Exam
  const exam =
    getExamById(effectiveExamId) ||
    CENTRAL_EXAM_CATALOGUE.find((e) => e.id === effectiveExamId) ||
    CENTRAL_EXAM_CATALOGUE[0];

  // 2. Resolve Subject (default to first subject of THIS exam)
  const subjects = getSubjectsForExam(exam.id);
  const subject =
    (querySubjectId && (subjects.find((s) => s.id === querySubjectId) || getSubjectById(querySubjectId, exam.id))) ||
    subjects[0];

  // 3. Resolve Topics & Current Topic (default to first topic of THIS subject)
  const allSubjectTopics = getTopicsForSubject(subject.id, exam.id);
  const currentTopic =
    (queryTopicId && (allSubjectTopics.find((t) => t.id === queryTopicId) || getTopicById(queryTopicId, subject.id, exam.id))) ||
    allSubjectTopics[0];

  // 4. Calculate previous and next topics
  const currentIndex = allSubjectTopics.findIndex((t) => t.id === currentTopic.id);
  const previousTopic =
    currentIndex > 0
      ? { id: allSubjectTopics[currentIndex - 1].id, name: allSubjectTopics[currentIndex - 1].name }
      : null;
  const nextTopic =
    currentIndex >= 0 && currentIndex < allSubjectTopics.length - 1
      ? { id: allSubjectTopics[currentIndex + 1].id, name: allSubjectTopics[currentIndex + 1].name }
      : null;

  // 5. Fetch structured 6-section topic learning notes
  const topicLearningContent = AxmokAIService.getTopicLearningStructure(
    exam.name,
    subject.name,
    currentTopic.name,
    currentTopic.id
  );

  return (
    <AppShell>
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

      {/* Progress & Mastery Banner */}
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

      {/* Main Learning Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-7">
          <TopicLearningDeck
            content={topicLearningContent}
            onAskAxmokPrompt={(prompt) => setActivePromptForChat(prompt)}
            practiceHref={`/exams/${exam.id}/${subject.id}/${currentTopic.id}/practice`}
          />
        </div>

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

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-xs text-charcoal-500 font-mono">
          Loading Axmok AI learning environment...
        </div>
      }
    >
      <LearnPageContent />
    </Suspense>
  );
}
