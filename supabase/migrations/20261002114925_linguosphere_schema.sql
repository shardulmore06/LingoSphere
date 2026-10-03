/*
# LingoSphere — Core Schema

## Overview
Full data model for LingoSphere: profiles, languages, lessons, vocabulary,
grammar, quiz_questions, quiz_attempts, progress, achievements,
subscriptions, user_languages.

## Tables
1. profiles — extends auth.users (name, role, avatar).
2. languages — learnable languages; admins add unlimited more.
3. lessons, vocabulary, grammar — content per language.
4. quiz_questions — MC / true-false / fill-in-blank (options jsonb).
5. quiz_attempts — scored student quiz attempt.
6. progress — per-user-per-language rollup (unique).
7. achievements — badges earned.
8. subscriptions — future Free/Premium/Pro scaffold.
9. user_languages — many-to-many student<->language.

## Security
- RLS on every table.
- is_admin() SECURITY DEFINER helper.
- Content tables: authenticated read, admin write.
- User tables: owner-scoped CRUD, admin read.
- profiles: owner read/update, admin read/update/delete.
- Owner columns default to auth.uid().
*/

-- Step 1: create profiles table (no policies yet)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student',
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: create is_admin function (profiles now exists)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Step 3: profiles policies
DROP POLICY IF EXISTS "select_profiles" ON public.profiles;
CREATE POLICY "select_profiles" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "insert_profiles" ON public.profiles;
CREATE POLICY "insert_profiles" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_profiles" ON public.profiles;
CREATE POLICY "update_profiles" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "delete_profiles" ON public.profiles;
CREATE POLICY "delete_profiles" ON public.profiles FOR DELETE
  TO authenticated USING (public.is_admin());

-- Step 4: handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: languages
CREATE TABLE IF NOT EXISTS public.languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  image_url text,
  difficulty text NOT NULL DEFAULT 'beginner',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_languages" ON public.languages;
CREATE POLICY "select_languages" ON public.languages FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_languages" ON public.languages;
CREATE POLICY "insert_languages" ON public.languages FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "update_languages" ON public.languages;
CREATE POLICY "update_languages" ON public.languages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "delete_languages" ON public.languages;
CREATE POLICY "delete_languages" ON public.languages FOR DELETE
  TO authenticated USING (public.is_admin());

-- Step 6: lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  image_url text,
  video_url text,
  audio_url text,
  difficulty text NOT NULL DEFAULT 'beginner',
  estimated_minutes int NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_lessons" ON public.lessons;
CREATE POLICY "select_lessons" ON public.lessons FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_lessons" ON public.lessons;
CREATE POLICY "insert_lessons" ON public.lessons FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "update_lessons" ON public.lessons;
CREATE POLICY "update_lessons" ON public.lessons FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "delete_lessons" ON public.lessons;
CREATE POLICY "delete_lessons" ON public.lessons FOR DELETE
  TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_lessons_language_id ON public.lessons(language_id);

-- Step 7: vocabulary
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  word text NOT NULL,
  meaning text NOT NULL DEFAULT '',
  example_sentence text NOT NULL DEFAULT '',
  pronunciation text NOT NULL DEFAULT '',
  audio_url text,
  difficulty text NOT NULL DEFAULT 'beginner',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_vocabulary" ON public.vocabulary;
CREATE POLICY "select_vocabulary" ON public.vocabulary FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_vocabulary" ON public.vocabulary;
CREATE POLICY "insert_vocabulary" ON public.vocabulary FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "update_vocabulary" ON public.vocabulary;
CREATE POLICY "update_vocabulary" ON public.vocabulary FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "delete_vocabulary" ON public.vocabulary;
CREATE POLICY "delete_vocabulary" ON public.vocabulary FOR DELETE
  TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_vocabulary_language_id ON public.vocabulary(language_id);

-- Step 8: grammar
CREATE TABLE IF NOT EXISTS public.grammar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  title text NOT NULL,
  explanation text NOT NULL DEFAULT '',
  examples jsonb NOT NULL DEFAULT '[]'::jsonb,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  difficulty text NOT NULL DEFAULT 'beginner',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.grammar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_grammar" ON public.grammar;
CREATE POLICY "select_grammar" ON public.grammar FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_grammar" ON public.grammar;
CREATE POLICY "insert_grammar" ON public.grammar FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "update_grammar" ON public.grammar;
CREATE POLICY "update_grammar" ON public.grammar FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "delete_grammar" ON public.grammar;
CREATE POLICY "delete_grammar" ON public.grammar FOR DELETE
  TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_grammar_language_id ON public.grammar(language_id);

-- Step 9: quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  question text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'beginner',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_quiz_questions" ON public.quiz_questions;
CREATE POLICY "select_quiz_questions" ON public.quiz_questions FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_quiz_questions" ON public.quiz_questions;
CREATE POLICY "insert_quiz_questions" ON public.quiz_questions FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "update_quiz_questions" ON public.quiz_questions;
CREATE POLICY "update_quiz_questions" ON public.quiz_questions FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "delete_quiz_questions" ON public.quiz_questions;
CREATE POLICY "delete_quiz_questions" ON public.quiz_questions FOR DELETE
  TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_quiz_questions_language_id ON public.quiz_questions(language_id);

-- Step 10: quiz_attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id uuid NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0,
  total_questions int NOT NULL DEFAULT 0,
  percentage numeric NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "select_quiz_attempts" ON public.quiz_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "insert_quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "insert_quiz_attempts" ON public.quiz_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "update_quiz_attempts" ON public.quiz_attempts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "delete_quiz_attempts" ON public.quiz_attempts FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_language_id ON public.quiz_attempts(language_id);

-- Step 11: progress
CREATE TABLE IF NOT EXISTS public.progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id uuid NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  lessons_completed int NOT NULL DEFAULT 0,
  vocabulary_completed int NOT NULL DEFAULT 0,
  grammar_completed int NOT NULL DEFAULT 0,
  quiz_average numeric NOT NULL DEFAULT 0,
  progress_percentage numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, language_id)
);
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_progress" ON public.progress;
CREATE POLICY "select_progress" ON public.progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "insert_progress" ON public.progress;
CREATE POLICY "insert_progress" ON public.progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_progress" ON public.progress;
CREATE POLICY "update_progress" ON public.progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_progress" ON public.progress;
CREATE POLICY "delete_progress" ON public.progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);

-- Step 12: achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  earned_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_achievements" ON public.achievements;
CREATE POLICY "select_achievements" ON public.achievements FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "insert_achievements" ON public.achievements;
CREATE POLICY "insert_achievements" ON public.achievements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "update_achievements" ON public.achievements;
CREATE POLICY "update_achievements" ON public.achievements FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_achievements" ON public.achievements;
CREATE POLICY "delete_achievements" ON public.achievements FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);

-- Step 13: subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_subscriptions" ON public.subscriptions;
CREATE POLICY "select_subscriptions" ON public.subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "insert_subscriptions" ON public.subscriptions;
CREATE POLICY "insert_subscriptions" ON public.subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "update_subscriptions" ON public.subscriptions;
CREATE POLICY "update_subscriptions" ON public.subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "delete_subscriptions" ON public.subscriptions;
CREATE POLICY "delete_subscriptions" ON public.subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Step 14: user_languages
CREATE TABLE IF NOT EXISTS public.user_languages (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id uuid NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, language_id)
);
ALTER TABLE public.user_languages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_user_languages" ON public.user_languages;
CREATE POLICY "select_user_languages" ON public.user_languages FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "insert_user_languages" ON public.user_languages;
CREATE POLICY "insert_user_languages" ON public.user_languages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_user_languages" ON public.user_languages;
CREATE POLICY "update_user_languages" ON public.user_languages FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_user_languages" ON public.user_languages;
CREATE POLICY "delete_user_languages" ON public.user_languages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
