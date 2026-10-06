"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { MOCK_EXAMS } from "@/mock/exams";
import { ExamCard } from "@/components/exams/ExamCard";
import {
  Sparkles,
  PenTool,
  Clock,
  BarChart3,
  Flame,
  Compass,
  ArrowRight,
  CheckCircle,
  BrainCircuit,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Sparkles,
      title: "AI Tutor",
      description:
        "Learn concepts step-by-step with an AI tutor that explains topics in a simple way.",
    },
    {
      icon: PenTool,
      title: "AI Practice",
      description:
        "Practice fresh questions generated according to your exam, topic and difficulty.",
    },
    {
      icon: Clock,
      title: "Smart Tests",
      description:
        "Take timed tests with exam-style marks, negative marking and instant evaluation.",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description:
        "Understand your strengths, weaknesses, accuracy and improvement over time.",
    },
    {
      icon: Flame,
      title: "Daily Streak",
      description:
        "Build a consistent study habit by completing your daily preparation goal.",
    },
    {
      icon: Compass,
      title: "Personalized Practice",
      description:
        "Get practice recommendations based on your performance and weak topics.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Choose Your Exam",
      desc: "Select SBI PO or target banking exams to access syllabus-mapped prep paths.",
    },
    {
      num: "02",
      title: "Learn Your Topics",
      desc: "Break down complex concepts, formulas, and shortcuts with step-by-step AI guidance.",
    },
    {
      num: "03",
      title: "Practice & Test",
      desc: "Solve adaptive practice questions and timed mock tests with realistic negative marks.",
    },
    {
      num: "04",
      title: "Track & Improve",
      desc: "Pinpoint weak topics, receive personalized practice drills, and keep your streak alive.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-charcoal-900">
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-charcoal-50/60 via-white to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Hero Text */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">


                {/* Main Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-charcoal-900 leading-[1.12]">
                  Prepare Smarter.
                  <br />
                  <span className="text-forest-900">Practice Daily.</span>
                  <br />
                  Crack Your Exam.
                </h1>

                {/* Supporting Text */}
                <p className="text-base sm:text-lg text-charcoal-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  Learn concepts with an AI tutor, practice AI-generated questions, take
                  realistic tests, and track your progress every day.
                </p>

                {/* Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    href="/register"
                    rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                    className="w-full sm:w-auto"
                  >
                    Start Preparing
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    href="/exams"
                    className="w-full sm:w-auto"
                  >
                    Explore Exams
                  </Button>
                </div>

                {/* Academic trust markers */}
                <div className="pt-6 border-t border-charcoal-100 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-charcoal-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-forest-700" />
                    <span>SBI PO Syllabus Mapped</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-forest-700" />
                    <span>Negative Marking Engine</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-forest-700" />
                    <span>Instant AI Explanations</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual (UI-Based Preview Card) */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md rounded-2xl bg-white border border-charcoal-200 shadow-hover p-6">
                  {/* Top card header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-forest-900 text-white flex items-center justify-center font-bold text-xs">
                        P
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-charcoal-900">Student Dashboard</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-charcoal-100 text-charcoal-600">Sample Preview</span>
                        </div>
                        <div className="text-[11px] text-charcoal-500">SBI PO Preparation</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                      <span>12 Days</span>
                    </div>
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="p-3 rounded-xl bg-charcoal-50/70 border border-charcoal-100 text-center">
                      <div className="text-[10px] text-charcoal-500 font-medium uppercase">Solved</div>
                      <div className="text-lg font-bold text-charcoal-900 mt-0.5">428</div>
                    </div>
                    <div className="p-3 rounded-xl bg-charcoal-50/70 border border-charcoal-100 text-center">
                      <div className="text-[10px] text-charcoal-500 font-medium uppercase">Accuracy</div>
                      <div className="text-lg font-bold text-forest-900 mt-0.5">78%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-charcoal-50/70 border border-charcoal-100 text-center">
                      <div className="text-[10px] text-charcoal-500 font-medium uppercase">Study Time</div>
                      <div className="text-lg font-bold text-charcoal-900 mt-0.5">24.5h</div>
                    </div>
                  </div>

                  {/* Today's Goal Progress */}
                  <div className="mb-5 p-3.5 rounded-xl bg-almond-50 border border-almond-200">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-charcoal-800">Today&apos;s Progress</span>
                      <span className="font-bold text-forest-900">18 / 20 Questions (90%)</span>
                    </div>
                    <ProgressBar value={90} height="xs" variant="forest" />
                    <div className="mt-1.5 flex justify-between text-[11px] text-charcoal-500">
                      <span>Target: 20 questions</span>
                      <span className="font-medium text-forest-800">2 to complete</span>
                    </div>
                  </div>

                  {/* Small progress chart element */}
                  <div className="p-3.5 rounded-xl border border-charcoal-100 bg-white">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-semibold text-charcoal-800">Weekly Accuracy Trend</span>
                      <span className="text-[11px] font-bold text-emerald-700">+8% this week</span>
                    </div>
                    {/* Visual Bar chart */}
                    <div className="flex items-end justify-between h-14 gap-1.5 pt-2">
                      {[
                        { day: "M", val: 55 },
                        { day: "T", val: 62 },
                        { day: "W", val: 68 },
                        { day: "T", val: 71 },
                        { day: "F", val: 74 },
                        { day: "S", val: 76 },
                        { day: "S", val: 78 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`w-full rounded-t-sm transition-all ${
                              idx === 6 ? "bg-forest-900" : "bg-forest-200"
                            }`}
                            style={{ height: `${item.val * 0.45}px` }}
                          />
                          <span className="text-[9px] text-charcoal-400 font-semibold">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating active card tag */}
                  <div className="mt-4 pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-forest-800" />
                      <span className="font-medium text-charcoal-700">Coding-Decoding (Reasoning)</span>
                    </div>
                    <span className="font-semibold text-forest-900">72% Mastered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES SECTION ================= */}
        <section id="features" className="py-20 bg-charcoal-50/40 border-y border-charcoal-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="forest" size="md" className="mb-3">
                Core Capabilities
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
                Everything You Need to Prepare Better
              </h2>
              <p className="text-sm sm:text-base text-charcoal-600 mt-3">
                A structured, disciplined learning system built specifically for the demands
                of competitive government recruitment exams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <Card
                    key={i}
                    variant="default"
                    padding="lg"
                    className="flex flex-col justify-between border border-charcoal-200/80 hover:border-forest-300 hover:shadow-subtle transition-all"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-800 mb-5">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-charcoal-900 mb-2">
                        {feat.title}
                      </h3>
                      <p className="text-sm text-charcoal-600 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS SECTION ================= */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge variant="almond" size="md" className="mb-3">
                Methodology
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
                How PrepStreak Works
              </h2>
              <p className="text-sm sm:text-base text-charcoal-600 mt-3">
                Four clear steps engineered to take you from foundational concepts to timed exam readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((st, i) => (
                <div key={i} className="relative group">
                  <div className="text-3xl font-extrabold text-forest-800/40 mb-3 font-mono">
                    {st.num}
                  </div>
                  <h3 className="text-lg font-bold text-charcoal-900 mb-2">
                    {st.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {st.desc}
                  </p>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-4 right-0 translate-x-1/2 w-6 h-0.5 bg-charcoal-200" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SUPPORTED EXAMS SECTION ================= */}
        <section id="exams" className="py-20 bg-charcoal-50/40 border-t border-charcoal-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <Badge variant="forest" size="md" className="mb-3">
                  Syllabus Coverage
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
                  Target Government Exams
                </h2>
                <p className="text-sm sm:text-base text-charcoal-600 mt-2">
                  Specialized syllabi tailored to official notification standards and cutoffs.
                </p>
              </div>
              <Button href="/exams" variant="outline" size="sm" className="mt-4 md:mt-0">
                View All Exams
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_EXAMS.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA SECTION ================= */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-forest-900 text-white p-8 sm:p-14 text-center shadow-card relative overflow-hidden">
              <div className="max-w-2xl mx-auto space-y-5">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-almond-200 bg-forest-800/80 px-3 py-1 rounded-full">
                  Begin Your Journey
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  Your Preparation Starts Today.
                </h2>
                <p className="text-sm sm:text-base text-almond-100 max-w-xl mx-auto font-normal leading-relaxed">
                  Learn consistently, practice intelligently, and understand your progress.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    variant="secondary"
                    size="lg"
                    href="/register"
                    className="w-full sm:w-auto"
                    rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
                  >
                    Start Preparing
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    href="/login"
                    className="w-full sm:w-auto bg-transparent text-white border-forest-700 hover:bg-forest-800 hover:text-white"
                  >
                    Student Login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
