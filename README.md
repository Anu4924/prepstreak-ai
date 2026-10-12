# 🎯 PrepStreak AI

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

> **PrepStreak AI** is a full-stack, production-grade competitive exam preparation platform designed for government job aspirants in India, founded by **Anu**. Master syllabus-specific topics through Axmok AI's intelligent study tutoring, practice questions, step-by-step explanations, timed mock tests, streak analytics, and personalized diagnostics.

---

## 🏛️ Comprehensive Exam Blueprints & Architecture

PrepStreak AI features a **decoupled, exam-specific architecture**. Every exam uses its own syllabus, subject weightage, marking scheme, and topic hierarchy—never falling back to a generic syllabus:

### 1. 🏦 Banking (SBI PO & IBPS PO)
* **Reasoning Ability**: Seating Arrangement, Puzzles, Syllogism, Inequalities, Coding-Decoding, Blood Relations, Direction Sense.
* **Quantitative Aptitude**: Data Interpretation, Number Series, Simplification & Approximation, Quadratic Equations, Arithmetic (Percentage, Profit & Loss, SI & CI, Time & Work).
* **English Language**: Reading Comprehension, Cloze Test, Error Detection, Sentence Rearrangement.
* **General / Banking Awareness**: Banking Terminology, RBI Guidelines, Current Affairs, Financial Awareness.

### 2. 🏛️ Staff Selection Commission (SSC CGL)
* **General Intelligence & Reasoning**: Analogy, Classification, Series, Coding-Decoding, Non-Verbal Reasoning, Venn Diagrams.
* **Quantitative Aptitude**: Number System, Algebra, Geometry, Mensuration, Trigonometry, Percentage, Ratio & Proportion.
* **English Comprehension**: Grammar Rules, Vocabulary, Idioms & Phrases, Reading Comprehension, Synonyms & Antonyms.
* **General Awareness**: Indian History, Indian Polity, Geography, Economy, General Science, Static GK.

### 3. 🚆 Railways (RRB NTPC & RRB Group D)
* **Mathematics**: Number System, Decimals & Fractions, LCM & HCF, Ratio & Proportion, Percentage, Mensuration, Time & Distance.
* **General Intelligence & Reasoning**: Analogies, Coding-Decoding, Mathematical Operations, Syllogisms, Decision Making.
* **General Science**: Physics, Chemistry, Life Sciences (NCERT 10th standard syllabus).
* **General Awareness**: Current Affairs, Indian Geography, Indian Freedom Struggle, Railway GK.

### 4. 🌴 Tamil Nadu Public Service Commission (TNPSC Group 4)
* **General Studies**: Indian History & Culture, Indian Polity, Indian Economy, General Science, Current Events, Geography of India & Tamil Nadu.
* **Aptitude & Mental Ability**: Simplification, HCF & LCM, Percentage, Ratio & Proportion, Compound Interest, Logical Reasoning.
* **Language (English / Tamil)**: Grammar, Literature, Authors & Works.

### 5. 🇮🇳 UPSC Civil Services (IAS / IPS / IFS)
* **General Studies Paper I (Prelims)**: Indian Polity & Governance, History of India, Indian & World Geography, Economic & Social Development, Environment & Ecology, General Science.
* **CSAT Paper II**: Reading Comprehension, Interpersonal Skills, Logical Reasoning & Analytical Ability, Basic Numeracy.

---

## ✨ Core Modules & Platform Features

- 🔐 **Production Authentication & Session Management**:
  - Direct integration with **Supabase Auth** & PostgreSQL `public.profiles`.
  - Service-role admin provisioning with auto-confirmation.
  - Zero-state data isolation using `auth.uid()` and signed session tokens.
  - Cryptographically signed HMAC-SHA256 session tokens with automatic token rehydration across page reloads.
  - No infinite onboarding loops or unexpected login redirects.
- 🤖 **Axmok AI Practice Engine**:
  - Syllabus-aligned, adaptive question generation powered by Gemini.
  - Detailed explanations, shortcut methods, and common mistake analysis.
  - Adaptive difficulty calibration (Easy, Medium, Hard, Adaptive).
- ⏱️ **Timed Mock Test Engine**:
  - Full-length test simulations with real-time countdown timers.
  - Interactive question navigation palette (Answered, Marked for Review, Unvisited).
  - Accurate negative marking analysis (-0.25 for SBI PO/SSC, -0.33 for RRB/UPSC).
  - Comprehensive post-test diagnostic scorecards.
- 🔥 **Study Streak & Habit Building**:
  - 7-day study streak trackers, question goals, and daily progress indicators.
  - Dedicated Daily Sprint Challenge with instant feedback.
- 📊 **Performance Diagnostics**:
  - Accuracy tracking across exams and subjects.
  - Weak-topic identification with actionable recommendations.
  - Study time analytics and test completion statistics.

---

## 🎨 Visual Identity & Design System

- **Primary Accent**: Forest Green (`#0D2B1B` / `#1A492E`) — Calm, academic rigor, and focus.
- **Secondary Accent**: Warm Almond / Cream (`#F5EFE6` / `#FAF7F2`) — Soft contrast and visual comfort.
- **Surface**: Pure White & Light Neutrals (`#FFFFFF` / `#FAFAF9`) with sharp charcoal typography (`#0F172A`).
- **Responsive Layout**: Fluid design engineered for desktop (1440px+), tablet (768px), and mobile (375px–430px).

---

## 📁 Project Structure

```
prepstreak-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Login with email/password validation & error states
│   │   └── register/page.tsx            # Multi-exam registration with strength meter
│   ├── dashboard/page.tsx               # Student Dashboard (Stats, streak, exam roadmap)
│   ├── exams/
│   │   ├── [examId]/page.tsx            # Exam Subject Hub
│   │   └── [examId]/[subjectId]/        # Topic Hub with [Learn], [Practice], [Test]
│   ├── learn/page.tsx                   # Interactive AI Learning experience
│   ├── practice/page.tsx                # Adaptive question practice engine
│   ├── tests/
│   │   ├── page.tsx                     # Timed Mock Test Engine
│   │   └── result/page.tsx              # Diagnostic Scorecard & answer keys
│   ├── progress/page.tsx                # Analytics Dashboard
│   ├── streak/page.tsx                  # Study streak calendar & milestone badges
│   ├── daily-challenge/page.tsx         # Daily timed sprint challenge
│   ├── profile/page.tsx                 # Aspirant profile & target exam switcher
│   ├── settings/page.tsx                # Study parameters & security settings
│   ├── api/
│   │   ├── auth/                        # login, register, session, logout, reset-password
│   │   ├── profile/                     # Profile query & persistent updates (GET, PUT)
│   │   ├── practice/                    # Practice history & attempt recording (GET, POST)
│   │   └── ai/practice/generate/        # AI question generation endpoint
│   ├── layout.tsx                       # Root layout, fonts & metadata
│   ├── page.tsx                         # Landing Page (Hero, Features, Exam Catalog, CTA)
│   └── globals.css                      # Tailwind base & design tokens
├── components/
│   ├── ui/                              # Button, Card, Badge, ProgressBar, Input, StatCard
│   ├── layout/                          # Navbar, Sidebar, AppShell, Footer
│   ├── exams/                           # ExamCard, SubjectCard, TopicCard, ChangeTargetExamModal
│   └── dashboard/                       # StreakCard, FirstTimeOnboardingModal, WeakTopicsCard
├── lib/
│   ├── auth/                            # store.ts (data layer), token.ts (JWT cryptography)
│   ├── data/                            # examCatalogue.ts, subjectRegistry.ts, topicRegistry.ts
│   ├── supabase/                        # server.ts, client.ts, admin.ts, middleware.ts
│   └── types/                           # user.ts, question.ts, exam.ts
├── services/
│   ├── ai/axmok-question-service.ts     # Google Gemini GenAI question generation
│   ├── auth/auth-context.tsx            # Global AuthProvider state & session hooks
│   └── profile/profile-service.ts       # Profile API client
├── tests/                               # Comprehensive automated test suites
└── supabase/
    └── schema.sql                       # PostgreSQL schema & Row-Level Security policies
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: `v20.x` or later recommended (`node -v`)
* **Package Manager**: `npm` or `pnpm`

### 1. Installation

```bash
git clone https://github.com/Anu4924/prepstreak-ai.git
cd prepstreak-ai
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Session Secret (HMAC-SHA256 Token Signing)
SESSION_SECRET=your-random-long-secret-key

# Google Gemini AI (with automatic Multi-Key Failover)
GEMINI_API_KEY=your-primary-gemini-api-key
GEMINI_API_KEY_FALLBACK=your-fallback-gemini-api-key # Optional fallback key if primary is exhausted
GEMINI_MODEL=gemini-3.5-flash
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

PrepStreak AI includes comprehensive automated end-to-end integration test suites:

```bash
# Run full pre-launch audit (33/33 modules)
npx tsx tests/test-prelaunch-audit.ts

# Verify session persistence & onboarding loop fix
npx tsx tests/test-session-and-onboarding-persistence.ts

# Verify user isolation & authentication flow
npx tsx tests/test-e2e-auth-flow.ts
```

All 33 system modules, security route redirects, dynamic exam syllabi, and APIs pass with a **100% success rate**.

---

## 🚢 Production Deployment

PrepStreak AI is optimized for deployment on **[Vercel](https://vercel.com/)**:

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Configure the environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`
   - `GEMINI_API_KEY`
   - `GEMINI_API_KEY_FALLBACK` (optional backup key)
   - `GEMINI_MODEL` (optional, defaults to `gemini-3.5-flash`)
4. Click **Deploy**.

---

## 📄 License

This project is licensed under the MIT License.
