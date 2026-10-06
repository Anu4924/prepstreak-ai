# PrepStreak AI

**PrepStreak AI** is a production-quality, AI-powered government competitive exam preparation platform engineered to help aspirants master syllabus topics through dynamic AI-generated questions, instant explanations, timed tests, performance diagnostics, and daily study streaks.

The platform launches with comprehensive coverage for **SBI PO (State Bank of India Probationary Officer)** and is architected to scale effortlessly to IBPS PO, SSC CGL, RRB NTPC, and state civil services (TNPSC).

---

## 🎨 Visual Identity & Design System

- **Primary Accent**: Dark Forest Green (`#0D2B1B` / `#1A492E`) — Inspiring calm, academic rigor, and trust.
- **Secondary Accent**: Warm Almond / Cream (`#F5EFE6` / `#FAF7F2`) — Providing soft contrast and clarity.
- **Surface**: Pure White & Light Neutrals (`#FFFFFF` / `#FAFAF9`) with subtle charcoal typography (`#0F172A`).
- **Cards & Elements**: `rounded-2xl`, subtle borders (`border-charcoal-200/80`), minimal elevation shadows.
- **Responsive Canvas**: Fluid layouts optimized across 1440px, 1280px, 1024px desktop, 768px tablet, and 375px–430px mobile.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.17+ or v20+ recommended (`node -v`)
- **Package Manager**: npm, yarn, or pnpm

### 1. Installation

Clone or open the workspace and install the required dependencies:

```bash
cd prepstreak-ai
npm install
```

### 2. Configure Environment Variables

Create a local `.env.local` file from the provided `.env.example`:

```bash
cp .env.example .env.local
```

### 3. Run the Development Server

Start the Next.js local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

---

## 📁 Project Architecture

```
prepstreak-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Login UI with password toggle & side stats
│   │   └── register/page.tsx            # Register UI with goal selector & strength meter
│   ├── dashboard/page.tsx               # Student Dashboard (Stats, streak, weak topics, challenges)
│   ├── exams/
│   │   ├── page.tsx                     # Exam selection (SBI PO active + upcoming roadmap)
│   │   └── [examId]/
│   │       ├── page.tsx                 # Subject selection (Reasoning, Quant, English, GA, Banking)
│   │       └── [subjectId]/
│   │           ├── page.tsx             # Topic selection with difficulty filter & actions
│   │           └── [topicId]/page.tsx   # Direct topic route redirecting to /learn
│   ├── learn/page.tsx                   # Interactive AI Learning experience with chat mentor
│   ├── practice/page.tsx                # Adaptive question practice with instant explanation
│   ├── tests/
│   │   ├── page.tsx                     # Timed Mock Test Engine with 20-question palette
│   │   └── result/page.tsx              # Comprehensive Test Result & Diagnostic Scorecard
│   ├── progress/page.tsx                # Analytics Dashboard with accuracy and daily charts
│   ├── streak/page.tsx                  # 7-day study streak calendar and milestone badges
│   ├── daily-challenge/page.tsx         # Dedicated timed sprint challenge
│   ├── profile/page.tsx                 # Aspirant profile and study goal preferences
│   ├── settings/page.tsx                # Account, study parameters, and theme settings
│   ├── layout.tsx                      # Root layout, fonts & metadata
│   ├── page.tsx                         # Landing Page (Hero, Features, How It Works, Exams, CTA)
│   └── globals.css                      # Tailwind base & design tokens
├── components/
│   ├── ui/                              # Core Design System Primitives
│   │   ├── Button.tsx                   # Primary (Dark Green), Secondary (Almond), Outline, Ghost
│   │   ├── Card.tsx                     # Minimal rounded cards with subtle borders
│   │   ├── Badge.tsx                    # Difficulty badges (Easy, Medium, Hard) & status pills
│   │   ├── ProgressBar.tsx              # Smooth linear meters & status fills
│   │   ├── PageHeader.tsx               # Breadcrumbs, title hierarchy & action slots
│   │   ├── Input.tsx                    # Accessible form inputs with password reveal
│   │   ├── StatCard.tsx                 # Metric card with icons & trend badges
│   │   ├── EmptyState.tsx               # Modular empty states
│   │   ├── LoadingState.tsx             # Clean skeleton loaders
│   │   └── Logo.tsx                     # Branded PrepStreak AI typography mark
│   ├── layout/                          # Reusable Application Layouts
│   │   ├── Navbar.tsx                   # Public top navigation with mobile drawer
│   │   ├── Footer.tsx                   # Academic platform footer
│   │   ├── Sidebar.tsx                  # Logged-in navigation (Dashboard, Learn, Practice, etc.)
│   │   ├── AppHeader.tsx                # Logged-in topbar with exam switcher & streak flame
│   │   └── AppShell.tsx                 # Responsive shell connecting sidebar & mobile drawer
│   ├── exams/                           # Domain Examination Components
│   │   ├── ExamCard.tsx                 # Exam card with syllabus preview & CTAs
│   │   ├── SubjectCard.tsx              # Subject card with weightage & coverage bar
│   │   └── TopicCard.tsx                # Topic card with [Learn], [Practice], [Test] triggers
│   └── dashboard/                       # Dashboard Widgets
│       ├── StreakCard.tsx               # Today's goal & question count
│       ├── ContinueLearningCard.tsx     # Active topic resume card
│       ├── DailyChallengeCard.tsx       # Daily timed challenge banner
│       ├── WeakTopicsCard.tsx           # AI-identified diagnostic weak areas
│       └── RecentActivityCard.tsx       # Chronological activity timeline
├── mock/                                # Centralized Mock Datasets (Easily swappable)
│   ├── exams.ts                         # SBI PO, IBPS, SSC CGL, RRB, TNPSC
│   ├── subjects.ts                      # Reasoning, Quant, English, GA, Banking Awareness
│   ├── topics.ts                        # Syllogism, Coding-Decoding, Inequality, DI, etc.
│   ├── questions.ts                     # Realistic exam questions, options & explanations
│   ├── dashboard.ts                     # Stats, today's goal, weak topics & activity
│   ├── progress.ts                      # Chart telemetry, accuracy trends, strong topics
│   ├── streak.ts                        # Weekly calendar & milestone badges
│   ├── learn.ts                         # Topic concepts, rules, formulas & AI Tutor FAQ
│   ├── profile.ts                       # Student profile & default study targets
│   └── index.ts                         # Central barrel export
├── services/                            # Prepared Future Backend Service Contracts
│   ├── auth/auth-service.ts             # Auth session & credential contracts
│   ├── db/exam-repository.ts            # Data access contract for exams/topics
│   └── ai/question-generator.ts         # Contract for Gemini AI question generation
├── .env.example                         # Environment variable definitions
├── tailwind.config.ts                   # Custom brand colors (forest, almond, charcoal)
└── tsconfig.json
```

---

## 🔒 Future Environment Variables

The following secrets are prepared in `.env.example` for subsequent backend and AI integration phases:

| Variable | Purpose | Target Provider |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Generates dynamic questions and powers the 24/7 AI Tutor | Google AI Studio |
| `GEMINI_MODEL` | Specifies the LLM model (e.g. `gemini-1.5-flash`) | Google AI Studio |
| `DATABASE_URL` | Connection string for user profiles, test logs & questions | PostgreSQL / Supabase |
| `NEXTAUTH_SECRET` | Cryptographic secret for signing session JWT tokens | NextAuth.js |
| `NEXTAUTH_URL` | Canonical origin for authentication callbacks | NextAuth.js |

---

## 🚦 Phase 2 Scope & Verification

- **Pure Frontend Architecture**: In strict adherence to Phase 2 guidelines, there are no live database queries, no external AI API calls, and no active auth backends.
- **Centralized Mock Layer**: All dynamic interfaces consume clean, typed mock datasets from `/mock`, allowing seamless transition to real endpoints in subsequent phases.
- **Zero Build Errors**: Clean static compilation and TypeScript compliance across all routes.
