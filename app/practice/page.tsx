"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/services/auth/auth-context";
import { PracticeService } from "@/services/practice/practice-service";
import { CENTRAL_EXAM_CATALOGUE, getExamById } from "@/lib/data/examCatalogue";
import { getSubjectsForExam } from "@/lib/data/subjectRegistry";
import { getTopicsForSubject } from "@/lib/data/topicRegistry";
import { getSubtopicsForTopic } from "@/lib/data/subtopicRegistry";
import { PracticeSessionResult, TopicPerformanceRecord, PracticeMode } from "@/lib/types/question";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Target,
  Trophy,
  Clock,
  RotateCcw,
  Zap,
  Sliders,
  AlertCircle,
  Flame,
} from "lucide-react";

function PracticeHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const queryTopicId = searchParams.get("topic");
  const queryExamId = searchParams.get("examId");
  const querySubjectId = searchParams.get("subjectId");

  // If query params are provided, redirect to the dynamic topic practice route
  useEffect(() => {
    if (queryExamId && querySubjectId && queryTopicId) {
      router.replace(`/exams/${queryExamId}/${querySubjectId}/${queryTopicId}/practice`);
    }
  }, [queryExamId, querySubjectId, queryTopicId, router]);

  // Exam Selection
  const [selectedExamId, setSelectedExamId] = useState<string>("sbi-po");
  const exam = getExamById(selectedExamId) || CENTRAL_EXAM_CATALOGUE[0];

  // Subject Selection
  const subjects = getSubjectsForExam(exam.id);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || "reasoning-ability"
  );
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Topic Selection
  const topics = getTopicsForSubject(currentSubject.id, exam.id);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topics[0]?.id || "coding-decoding"
  );
  const currentTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  // Subtopic Selection
  const subtopics = getSubtopicsForTopic(exam.id, currentSubject.id, currentTopic?.id || "");
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string>("all");

  // Practice Modes
  const [selectedMode, setSelectedMode] = useState<PracticeMode>("topic");

  // History & Weak Topics
  const [history, setHistory] = useState<PracticeSessionResult[]>([]);
  const [weakTopics, setWeakTopics] = useState<TopicPerformanceRecord[]>([]);

  useEffect(() => {
    async function loadData() {
      const h = await PracticeService.getPracticeHistory(user?.id);
      setHistory(h);

      const w = await PracticeService.getWeakTopics(user?.id, exam.id);
      setWeakTopics(w);
    }
    loadData();
  }, [user?.id, exam.id]);

  const handleLaunchPractice = () => {
    if (selectedMode === "personalized" && weakTopics.length > 0) {
      const targetWeak = weakTopics[0];
      router.push(
        `/exams/${targetWeak.examId}/${targetWeak.subjectId}/${targetWeak.topicId}/practice`
      );
      return;
    }

    const subtopicQuery = selectedSubtopicId !== "all" ? `?subtopic=${selectedSubtopicId}` : "";
    router.push(
      `/exams/${exam.id}/${currentSubject.id}/${currentTopic?.id || "coding-decoding"}/practice${subtopicQuery}`
    );
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Practice Hub"
        subtitle="Dynamic, exam-level practice sets crafted by Axmok AI across all syllabus topics."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Practice Hub" },
        ]}
        badge={
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900 text-almond-100 text-xs font-bold border border-forest-700 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Axmok AI Engine</span>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Practice Mode Grid */}
        <div>
          <div className="text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-3">
            Choose Practice Mode
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                id: "topic" as PracticeMode,
                title: "Topic Practice",
                desc: "Laser-focused practice questions dedicated to a single syllabus topic.",
                icon: <Target className="w-5 h-5 text-forest-800" />,
                badge: "Standard",
              },
              {
                id: "subject" as PracticeMode,
                title: "Subject Practice",
                desc: "Broad sectional practice combining topics across the entire subject.",
                icon: <BookOpen className="w-5 h-5 text-forest-800" />,
                badge: "Sectional",
              },
              {
                id: "exam" as PracticeMode,
                title: "Exam Practice",
                desc: "Full syllabus simulation matching real competitive exam patterns.",
                icon: <Trophy className="w-5 h-5 text-forest-800" />,
                badge: "Mock Pattern",
              },
              {
                id: "personalized" as PracticeMode,
                title: "Personalized Practice",
                desc: "Axmok AI targets your recorded weak areas with adaptive difficulty.",
                icon: <Flame className="w-5 h-5 text-amber-500" />,
                badge: "AI Powered",
              },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedMode(mode.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedMode === mode.id
                    ? "border-forest-900 bg-white ring-2 ring-forest-900 shadow-card"
                    : "border-charcoal-200/90 bg-white hover:border-charcoal-300 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center">
                    {mode.icon}
                  </div>
                  <Badge variant={selectedMode === mode.id ? "forest" : "neutral"} size="sm">
                    {mode.badge}
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-charcoal-900 mb-1">{mode.title}</h4>
                <p className="text-xs text-charcoal-500 leading-relaxed">{mode.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Practice Launcher Configuration Card */}
        <Card variant="default" padding="lg" className="border border-charcoal-200/90 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-charcoal-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-900 text-white flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal-900">Configure Target Practice</h3>
                <p className="text-xs text-charcoal-500">
                  Select your exam syllabus target to launch Axmok AI question generation.
                </p>
              </div>
            </div>
            <Badge variant="forest" size="md">
              Mode: <span className="capitalize ml-1 font-bold">{selectedMode}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Exam Select */}
            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-2">1. Target Exam</label>
              <select
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  const subjs = getSubjectsForExam(e.target.value);
                  if (subjs[0]) setSelectedSubjectId(subjs[0].id);
                  setSelectedSubtopicId("all");
                }}
                className="w-full p-3 rounded-xl border border-charcoal-200 bg-white text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              >
                {CENTRAL_EXAM_CATALOGUE.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Select */}
            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-2">2. Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  const tops = getTopicsForSubject(e.target.value, exam.id);
                  if (tops[0]) setSelectedTopicId(tops[0].id);
                  setSelectedSubtopicId("all");
                }}
                className="w-full p-3 rounded-xl border border-charcoal-200 bg-white text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Select */}
            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-2">3. Topic</label>
              <select
                value={selectedTopicId}
                onChange={(e) => {
                  setSelectedTopicId(e.target.value);
                  setSelectedSubtopicId("all");
                }}
                className="w-full p-3 rounded-xl border border-charcoal-200 bg-white text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subtopic Select */}
            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-2">4. Subtopic</label>
              <select
                value={selectedSubtopicId}
                onChange={(e) => setSelectedSubtopicId(e.target.value)}
                className="w-full p-3 rounded-xl border border-charcoal-200 bg-white text-xs font-semibold text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              >
                <option value="all">All Subtopics (Full Scope)</option>
                {subtopics.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-charcoal-100 flex items-center justify-between">
            <div className="text-xs text-charcoal-500">
              Target: <span className="font-bold text-charcoal-900">{exam.name}</span> •{" "}
              <span className="font-semibold text-charcoal-800">{currentTopic?.name}</span>
              {selectedSubtopicId !== "all" && (
                <span className="text-forest-900 font-bold">
                  {" "}• {subtopics.find((s) => s.id === selectedSubtopicId)?.name}
                </span>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleLaunchPractice}
              leftIcon={<Sparkles className="w-4 h-4 mr-1 text-amber-300" />}
              rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
            >
              Open Axmok Practice Session
            </Button>
          </div>
        </Card>

        {/* Weak Topics Spotlight (if user has previous attempts) */}
        {weakTopics.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                  Recommended Areas for Practice (Weak Topics)
                </h3>
              </div>
              <span className="text-xs text-charcoal-500">Based on past accuracy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {weakTopics.slice(0, 3).map((wt) => (
                <div
                  key={wt.topicId}
                  className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-charcoal-900 line-clamp-1">
                        {wt.topicName || wt.topicId}
                      </span>
                      <Badge variant="warning" size="sm">
                        {wt.accuracy}% Acc
                      </Badge>
                    </div>
                    <p className="text-[11px] text-charcoal-500 mb-3">
                      {wt.questionsAttempted} questions attempted • {wt.incorrect} mistakes
                    </p>
                  </div>

                  <Button
                    href={`/exams/${wt.examId}/${wt.subjectId}/${wt.topicId}/practice`}
                    variant="outline"
                    size="sm"
                    className="w-full justify-center text-xs"
                    leftIcon={<Zap className="w-3.5 h-3.5 mr-1 text-amber-600" />}
                  >
                    Practice This Topic
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Practice History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
              Recent Practice History
            </h3>
            <span className="text-xs text-charcoal-500">Persisted locally & securely</span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-charcoal-200 text-center text-xs text-charcoal-500">
              No practice attempts recorded yet. Launch your first practice set above to build your
              accuracy baseline!
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.slice(0, 6).map((session, idx) => (
                <div
                  key={session.id || idx}
                  className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        session.accuracy >= 70
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {session.accuracy}%
                    </div>
                    <div>
                      <div className="text-xs font-bold text-charcoal-900">{session.topicName}</div>
                      <div className="text-[11px] text-charcoal-500">
                        {session.examName} • {session.totalQuestions} questions •{" "}
                        {session.correctAnswers} correct • {session.difficulty}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-[11px] text-charcoal-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.createdAt
                        ? new Date(session.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Recent"}
                    </span>

                    <Button
                      href={`/exams/${session.examId}/${session.subjectId}/${session.topicId}/practice`}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      leftIcon={<RotateCcw className="w-3 h-3 mr-1" />}
                    >
                      Retake
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function PracticeHubPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-xs text-charcoal-500 font-mono">Loading Practice Hub...</div>
        </div>
      }
    >
      <PracticeHubContent />
    </Suspense>
  );
}
