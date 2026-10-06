-- ==============================================================
-- PrepStreak AI — Supabase Database Schema & Row-Level Security
-- Phase 3: User Authentication & Persistent Profiles
-- ==============================================================

-- 1. Enable UUID Extension (standard in PostgreSQL / Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the Profiles Table
-- Linked directly to Supabase Auth auth.users via id (foreign key)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  selected_exam TEXT NOT NULL DEFAULT 'sbi-po',
  selected_subject TEXT NOT NULL DEFAULT 'reasoning-ability',
  selected_topics JSONB DEFAULT '[]'::jsonb,
  
  -- Learning Analytics & Gamification
  current_streak INTEGER NOT NULL DEFAULT 1,
  longest_streak INTEGER NOT NULL DEFAULT 1,
  total_questions_attempted INTEGER NOT NULL DEFAULT 0,
  total_questions_correct INTEGER NOT NULL DEFAULT 0,
  total_tests_completed INTEGER NOT NULL DEFAULT 0,
  overall_accuracy NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  
  -- Study Preferences
  daily_question_goal INTEGER NOT NULL DEFAULT 20,
  preferred_difficulty TEXT NOT NULL DEFAULT 'Adaptive',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_selected_exam ON public.profiles(selected_exam);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- 4. Enable Row Level Security (RLS)
-- Mandatory: Ensures complete isolation between users
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Profiles
-- Policy A: Users can view ONLY their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy B: Users can update ONLY their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy C: Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. Trigger for Updating updated_at on Modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Automatic Profile Creation on Supabase Auth Signup
-- Automatically provisions a profile row when a new user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    selected_exam,
    avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'selected_exam', 'sbi-po'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================
-- Scalable Architecture Preparation for Future Feature Tables
-- (These will store practice questions, tests, topic mastery, and AI chats)
-- ==============================================================

-- Future: Topic Mastery Progress Table
CREATE TABLE IF NOT EXISTS public.user_topic_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  mastery_percentage NUMERIC(5,2) DEFAULT 0.00,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, exam_id, subject_id, topic_id)
);

ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own topic progress" ON public.user_topic_progress;
CREATE POLICY "Users can view own topic progress"
  ON public.user_topic_progress FOR ALL
  USING (auth.uid() = user_id);

-- Future: AI Conversation Sessions
CREATE TABLE IF NOT EXISTS public.ai_conversation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  title TEXT DEFAULT 'Study Session',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.ai_conversation_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own AI conversations" ON public.ai_conversation_sessions;
CREATE POLICY "Users can view own AI conversations"
  ON public.ai_conversation_sessions FOR ALL
  USING (auth.uid() = user_id);

-- ==============================================================
-- AI-Powered Practice Question System Tables
-- ==============================================================

-- 1. Practice History Table (Logs completed practice sessions)
CREATE TABLE IF NOT EXISTS public.practice_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  practice_mode TEXT NOT NULL DEFAULT 'topic',
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  incorrect_answers INTEGER NOT NULL DEFAULT 0,
  unanswered INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  time_taken INTEGER NOT NULL DEFAULT 0, -- seconds
  question_log JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_practice_history_user_id ON public.practice_history(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_history_created_at ON public.practice_history(created_at);

ALTER TABLE public.practice_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own practice history" ON public.practice_history;
CREATE POLICY "Users can view own practice history"
  ON public.practice_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own practice history" ON public.practice_history;
CREATE POLICY "Users can insert own practice history"
  ON public.practice_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. User Topic Performance Table (Aggregated performance per topic for weak area detection)
CREATE TABLE IF NOT EXISTS public.user_topic_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  questions_attempted INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  incorrect INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  practice_sessions INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, exam_id, subject_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_perf_user_topic ON public.user_topic_performance(user_id, topic_id);

ALTER TABLE public.user_topic_performance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own topic performance" ON public.user_topic_performance;
CREATE POLICY "Users can view own topic performance"
  ON public.user_topic_performance FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert or update own topic performance" ON public.user_topic_performance;
CREATE POLICY "Users can insert or update own topic performance"
  ON public.user_topic_performance FOR ALL
  USING (auth.uid() = user_id);

