-- ==============================================================
-- PrepStreak AI — User Data Isolation & Multi-User Architecture Migration
-- Safe, Idempotent Migration: Preserves existing data while enforcing strict RLS
-- ==============================================================

-- 1. UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure Profiles Table with Correct Isolation & Defaults
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  selected_exam TEXT DEFAULT '',
  selected_subject TEXT DEFAULT '',
  selected_topics JSONB DEFAULT '[]'::jsonb,
  
  -- Learning Analytics & Gamification (Default to 0 for genuine new user states)
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_questions_attempted INTEGER NOT NULL DEFAULT 0,
  total_questions_correct INTEGER NOT NULL DEFAULT 0,
  total_tests_completed INTEGER NOT NULL DEFAULT 0,
  overall_accuracy NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  study_time_minutes INTEGER NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Study Preferences
  daily_question_goal INTEGER NOT NULL DEFAULT 20,
  preferred_difficulty TEXT NOT NULL DEFAULT 'Adaptive',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist if table was already created with older schema
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'study_time_minutes') THEN
    ALTER TABLE public.profiles ADD COLUMN study_time_minutes INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_selected_exam ON public.profiles(selected_exam);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Strict User Isolation Policies on Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Automatic Profile Creation on Supabase Auth Signup
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
    COALESCE(NEW.raw_user_meta_data->>'selected_exam', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN public.profiles.full_name = '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Practice History Table
CREATE TABLE IF NOT EXISTS public.practice_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  topic_name TEXT DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  practice_mode TEXT NOT NULL DEFAULT 'topic',
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  incorrect_answers INTEGER NOT NULL DEFAULT 0,
  unanswered INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  time_taken INTEGER NOT NULL DEFAULT 0, -- in seconds
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

-- 5. Test Results Table
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  test_title TEXT NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'mini_mock',
  score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
  total_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
  total_questions INTEGER NOT NULL DEFAULT 0,
  attempted INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  incorrect INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  time_taken INTEGER NOT NULL DEFAULT 0,
  analysis_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON public.test_results(user_id);

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own test results" ON public.test_results;
CREATE POLICY "Users can view own test results"
  ON public.test_results FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own test results" ON public.test_results;
CREATE POLICY "Users can insert own test results"
  ON public.test_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. User Topic Performance (Aggregated topic mastery)
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

-- 7. User Daily Streaks Table
CREATE TABLE IF NOT EXISTS public.user_daily_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_solved INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_streaks ON public.user_daily_streaks(user_id, activity_date);

ALTER TABLE public.user_daily_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own daily streaks" ON public.user_daily_streaks;
CREATE POLICY "Users can view own daily streaks"
  ON public.user_daily_streaks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert or update own daily streaks" ON public.user_daily_streaks;
CREATE POLICY "Users can insert or update own daily streaks"
  ON public.user_daily_streaks FOR ALL
  USING (auth.uid() = user_id);
