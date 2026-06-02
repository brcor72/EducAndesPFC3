-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Aprendiz',
  community TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Forum threads
CREATE TABLE public.forum_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Threads viewable by everyone"
  ON public.forum_threads FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads"
  ON public.forum_threads FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own threads"
  ON public.forum_threads FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own threads"
  ON public.forum_threads FOR DELETE USING (auth.uid() = author_id);

CREATE INDEX idx_forum_threads_course ON public.forum_threads(course_id, created_at DESC);

-- Forum replies
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Replies viewable by everyone"
  ON public.forum_replies FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own replies"
  ON public.forum_replies FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own replies"
  ON public.forum_replies FOR DELETE USING (auth.uid() = author_id);

CREATE INDEX idx_forum_replies_thread ON public.forum_replies(thread_id, created_at ASC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER forum_threads_updated_at BEFORE UPDATE ON public.forum_threads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, community)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Aprendiz'),
    NEW.raw_user_meta_data->>'community'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();