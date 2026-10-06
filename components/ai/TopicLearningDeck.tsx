"use client";

import React, { useState } from "react";
import { TopicLearningStructure } from "@/services/ai/axmok-ai-service";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Key,
  FileCheck2,
  Zap,
  AlertOctagon,
  PenTool,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface TopicLearningDeckProps {
  content: TopicLearningStructure;
  onAskAxmokPrompt?: (prompt: string) => void;
  practiceHref?: string;
  className?: string;
}

type TabKey = "learn" | "concepts" | "examples" | "shortcuts" | "mistakes" | "practice";

export function TopicLearningDeck({
  content,
  onAskAxmokPrompt,
  practiceHref,
  className = "",
}: TopicLearningDeckProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("learn");
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (qId: string) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "learn", label: "Learn", icon: BookOpen },
    { key: "concepts", label: "Key Concepts", icon: Key },
    { key: "examples", label: "Examples", icon: FileCheck2 },
    { key: "shortcuts", label: "Shortcuts / Tips", icon: Zap },
    { key: "mistakes", label: "Common Mistakes", icon: AlertOctagon },
    { key: "practice", label: "Practice", icon: PenTool },
  ];

  const { sections } = content;

  return (
    <Card
      variant="default"
      padding="none"
      className={`border border-charcoal-200/80 rounded-3xl overflow-hidden shadow-card bg-white flex flex-col ${className}`}
    >
      {/* 1. Header with Title & Tabs */}
      <div className="p-4 sm:p-6 border-b border-charcoal-100 bg-charcoal-50/50">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-forest-100 border border-forest-200 flex items-center justify-center text-forest-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-charcoal-900">
                {content.topicName}
              </h2>
              <p className="text-xs text-charcoal-500">
                {content.subjectName} • {content.examName}
              </p>
            </div>
          </div>

          <Badge variant="forest" size="sm">
            {content.badge}
          </Badge>
        </div>

        <p className="text-xs text-charcoal-600 mb-4 leading-relaxed">
          {content.overview}
        </p>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-forest-900 text-white shadow-xs"
                    : "bg-white text-charcoal-700 hover:bg-forest-50 hover:text-forest-900 border border-charcoal-200/80"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-almond-200" : "text-charcoal-400"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Tab Content Area */}
      <div className="p-5 sm:p-7 flex-1 overflow-y-auto">
        {/* --- TAB 1: LEARN --- */}
        {activeTab === "learn" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-charcoal-900 mb-2">
                {sections.learn.title}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
                {sections.learn.summary}
              </p>
            </div>

            {/* Core Breakdown Points */}
            <div className="p-4 rounded-2xl bg-charcoal-50/80 border border-charcoal-200/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-700" />
                Syllabus Architecture & Key Focus Areas
              </span>
              <ul className="space-y-2">
                {sections.learn.breakdown.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-charcoal-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-600 mt-1.5 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Framework / Strategy Box */}
            {sections.learn.framework && (
              <div className="p-4 rounded-2xl bg-forest-950 text-almond-100 font-mono text-xs border border-forest-800 space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-almond-300">
                  <span>Strategy Framework</span>
                  <span className="text-forest-400 font-normal">Method Protocol</span>
                </div>
                <pre className="whitespace-pre-wrap font-mono leading-relaxed text-almond-100">
                  {sections.learn.framework}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: KEY CONCEPTS --- */}
        {activeTab === "concepts" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h3 className="text-base sm:text-lg font-bold text-charcoal-900">
              {sections.keyConcepts.title}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {sections.keyConcepts.concepts.map((concept, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white border border-charcoal-200/90 shadow-2xs space-y-2 hover:border-forest-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-forest-50 text-forest-800 text-xs font-bold flex items-center justify-center border border-forest-100">
                      {i + 1}
                    </span>
                    <h4 className="text-sm font-bold text-charcoal-900">{concept.name}</h4>
                  </div>

                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    {concept.description}
                  </p>

                  {concept.ruleOrFormula && (
                    <div className="p-2.5 rounded-xl bg-forest-900 text-almond-100 font-mono text-xs border border-forest-800">
                      {concept.ruleOrFormula}
                    </div>
                  )}

                  {concept.example && (
                    <div className="text-[11px] text-charcoal-500 italic bg-almond-50/60 p-2 rounded-lg border border-almond-200/60">
                      💡 Example: {concept.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: EXAMPLES --- */}
        {activeTab === "examples" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-base sm:text-lg font-bold text-charcoal-900">
              {sections.examples.title}
            </h3>

            <div className="space-y-5">
              {sections.examples.items.map((ex, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white border border-charcoal-200 shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-charcoal-100 pb-2">
                    <span className="text-xs font-bold text-forest-900 uppercase tracking-wide">
                      Problem {i + 1}: {ex.title}
                    </span>
                    <Badge variant="outline" size="sm">
                      Worked Solution
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-50/80 border border-charcoal-200/80 font-medium text-xs sm:text-sm text-charcoal-900 whitespace-pre-line leading-relaxed">
                    {ex.problem}
                  </div>

                  {/* Step by step */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                      Step-by-Step Resolution:
                    </span>
                    <div className="space-y-1.5">
                      {ex.stepByStep.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start gap-2 text-xs text-charcoal-700 bg-white p-2 rounded-lg border border-charcoal-100"
                        >
                          <span className="w-4 h-4 rounded-full bg-forest-100 text-forest-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Answer */}
                  <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-forest-950">Final Answer:</span>
                    <span className="font-extrabold text-forest-900 text-sm">{ex.answer}</span>
                  </div>

                  {/* Exam Tip */}
                  {ex.examTip && (
                    <div className="text-[11px] text-charcoal-600 bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-xl flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{ex.examTip}</span>
                    </div>
                  )}

                  {/* Interactive clarification */}
                  {onAskAxmokPrompt && (
                    <button
                      type="button"
                      onClick={() =>
                        onAskAxmokPrompt(
                          `Can you explain Problem ${i + 1} (${ex.title}) in simpler terms with another similar example?`
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 hover:text-forest-950 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-forest-600" />
                      Ask Axmok AI to clarify this example
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 4: SHORTCUTS / TIPS --- */}
        {activeTab === "shortcuts" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h3 className="text-base sm:text-lg font-bold text-charcoal-900">
              {sections.shortcuts.title}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {sections.shortcuts.tips.map((tip, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-gradient-to-br from-almond-50/60 to-white border border-almond-200/80 shadow-2xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      {tip.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-800 text-almond-200">
                      {tip.timeSaved}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal-700 leading-relaxed">
                    {tip.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200/80 text-[11px] font-medium text-charcoal-800 flex items-start gap-1.5">
                    <span className="font-bold text-forest-800">Action:</span>
                    <span>{tip.method}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 5: COMMON MISTAKES --- */}
        {activeTab === "mistakes" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <h3 className="text-base sm:text-lg font-bold text-charcoal-900">
              {sections.commonMistakes.title}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {sections.commonMistakes.traps.map((trap, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white border border-rose-200/80 shadow-2xs space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">
                      !
                    </span>
                    <h4 className="text-sm font-bold text-charcoal-900">
                      Trap: {trap.mistake}
                    </h4>
                  </div>

                  <div className="text-xs text-charcoal-600 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    <span className="font-bold text-rose-900">Why Students Slip Up: </span>
                    {trap.whyStudentsFail}
                  </div>

                  <div className="text-xs text-charcoal-800 bg-forest-50/70 p-3 rounded-xl border border-forest-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-forest-900">How to Avoid in Exam: </span>
                      {trap.howToAvoid}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 6: PRACTICE --- */}
        {activeTab === "practice" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-charcoal-900">
                {sections.practice.title}
              </h3>
              <span className="text-xs text-charcoal-500">
                {sections.practice.questions.length} Quick Test Questions
              </span>
            </div>

            <div className="space-y-5">
              {sections.practice.questions.map((q, idx) => {
                const isRevealed = revealedSolutions[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-white border border-charcoal-200 shadow-2xs space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-forest-900 uppercase">
                        Question {idx + 1}
                      </span>
                      <Badge variant="outline" size="sm">
                        {q.difficulty}
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-charcoal-900 leading-relaxed">
                      {q.question}
                    </p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                            isRevealed && oIdx === q.answerIndex
                              ? "bg-forest-50 border-forest-600 text-forest-950 font-bold"
                              : "bg-charcoal-50/60 border-charcoal-200 text-charcoal-800"
                          }`}
                        >
                          <span className="w-5 h-5 rounded-md bg-white border border-charcoal-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>

                    {/* Toggle Solution & Ask Axmok AI */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-charcoal-100">
                      <button
                        type="button"
                        onClick={() => toggleSolution(q.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-700 hover:text-charcoal-900 transition-colors"
                      >
                        {isRevealed ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Hide Solution
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            Reveal Solution & Logic
                          </>
                        )}
                      </button>

                      {onAskAxmokPrompt && (
                        <button
                          type="button"
                          onClick={() =>
                            onAskAxmokPrompt(
                              `Can you explain Question ${idx + 1} on ${content.topicName}: "${q.question}"?`
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-forest-950 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
                          Ask Axmok AI about this question
                        </button>
                      )}
                    </div>

                    {/* Explanation drawer */}
                    {isRevealed && (
                      <div className="p-3.5 rounded-xl bg-forest-50/70 border border-forest-200 text-xs text-charcoal-800 space-y-1.5 animate-in fade-in duration-150">
                        <div className="font-bold text-forest-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-forest-700" />
                          Correct Answer: Option {String.fromCharCode(65 + q.answerIndex)}
                        </div>
                        <p className="leading-relaxed text-charcoal-700">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Action Bar */}
      <div className="p-4 bg-charcoal-50/70 border-t border-charcoal-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-xs text-charcoal-600">
          <HelpCircle className="w-4 h-4 text-forest-700" />
          <span>Need deeper clarity? Ask Axmok AI in the tutor panel right next to this deck.</span>
        </div>

        {practiceHref && (
          <Button
            href={practiceHref}
            variant="primary"
            size="sm"
            leftIcon={<PenTool className="w-3.5 h-3.5 mr-1" />}
          >
            Start Practice Arena
          </Button>
        )}
      </div>
    </Card>
  );
}
