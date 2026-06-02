-- Add fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_lang TEXT NOT NULL DEFAULT 'es',
  ADD COLUMN IF NOT EXISTS daily_goal INTEGER NOT NULL DEFAULT 1;

-- Course progress per user
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  lessons_total INTEGER NOT NULL DEFAULT 12,
  lessons_done INTEGER NOT NULL DEFAULT 0,
  daily_goal INTEGER NOT NULL DEFAULT 1,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own progress"
  ON public.course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own progress"
  ON public.course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress"
  ON public.course_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own progress"
  ON public.course_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_course_progress_updated_at
  BEFORE UPDATE ON public.course_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_course_progress_user ON public.course_progress(user_id);