-- ============================================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- Project: The Best Study (Lovable Cloud → Supabase)
-- Generated: 2026-02-07
-- ============================================================
-- INSTRUCTIONS:
-- 1. Create a new Supabase project at https://supabase.com
-- 2. Go to SQL Editor in your Supabase Dashboard
-- 3. Run this entire script
-- 4. Then use the export-database edge function to get data JSON
-- 5. Import the data using the Supabase SQL Editor or API
-- ============================================================

-- ========================
-- STEP 1: ENUM TYPES
-- ========================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'teacher');

-- ========================
-- STEP 2: HELPER FUNCTIONS
-- ========================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id AND p.name = _permission
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id uuid)
RETURNS TABLE(permission_name text, permission_category text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT p.name, p.category
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
  ORDER BY p.category, p.name
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS text LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE cert_num TEXT;
BEGIN
  cert_num := 'CERT-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 6));
  RETURN cert_num;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_question_set_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.question_sets SET question_count = question_count + 1, updated_at = now() WHERE id = NEW.set_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.question_sets SET question_count = question_count - 1, updated_at = now() WHERE id = OLD.set_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_user_exam_stats()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_exams_taken = total_exams_taken + 1,
    total_correct_answers = total_correct_answers + NEW.correct_answers,
    total_questions_answered = total_questions_answered + NEW.total_questions,
    points = points + (NEW.correct_answers * 10),
    level = GREATEST(1, FLOOR((points + (NEW.correct_answers * 10)) / 100) + 1)::integer
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count integer DEFAULT 100)
RETURNS TABLE(user_id uuid, username text, full_name text, avatar_url text, points integer, level integer, total_exams_taken integer, total_correct_answers integer, rank bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.user_id, p.username, p.full_name, p.avatar_url, p.points, p.level,
    p.total_exams_taken, p.total_correct_answers,
    ROW_NUMBER() OVER (ORDER BY p.points DESC, p.total_correct_answers DESC) as rank
  FROM public.profiles p
  WHERE p.username IS NOT NULL
  ORDER BY p.points DESC, p.total_correct_answers DESC
  LIMIT limit_count
$$;

CREATE OR REPLACE FUNCTION public.is_user_expired(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND expires_at IS NOT NULL AND expires_at < NOW()
  )
$$;

CREATE OR REPLACE FUNCTION public.log_role_permission_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE permission_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT name INTO permission_name FROM public.permissions WHERE id = NEW.permission_id;
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_value, metadata)
    VALUES (auth.uid(), 'permission_granted', 'role_permission', NEW.id::text,
      jsonb_build_object('role', NEW.role, 'permission_id', NEW.permission_id, 'permission_name', permission_name),
      jsonb_build_object('role', NEW.role));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT name INTO permission_name FROM public.permissions WHERE id = OLD.permission_id;
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, metadata)
    VALUES (auth.uid(), 'permission_revoked', 'role_permission', OLD.id::text,
      jsonb_build_object('role', OLD.role, 'permission_id', OLD.permission_id, 'permission_name', permission_name),
      jsonb_build_object('role', OLD.role));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_user_role_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_value, metadata)
    VALUES (auth.uid(), 'role_assigned', 'user_role', NEW.user_id::text,
      jsonb_build_object('role', NEW.role, 'target_user_id', NEW.user_id),
      jsonb_build_object('target_user_id', NEW.user_id));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, metadata)
    VALUES (auth.uid(), 'role_removed', 'user_role', OLD.user_id::text,
      jsonb_build_object('role', OLD.role, 'target_user_id', OLD.user_id),
      jsonb_build_object('target_user_id', OLD.user_id));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_audit_log(_action text, _entity_type text, _entity_id text DEFAULT NULL, _old_value jsonb DEFAULT NULL, _new_value jsonb DEFAULT NULL, _metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, metadata)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, _old_value, _new_value, _metadata)
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$;

-- ========================
-- STEP 3: TABLES (ordered by dependencies)
-- ========================

-- Independent tables first
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏆',
  category text NOT NULL DEFAULT 'general',
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL DEFAULT 1,
  points_reward integer NOT NULL DEFAULT 10,
  badge_color text NOT NULL DEFAULT 'gold',
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  username text,
  avatar_url text,
  bio text,
  points integer DEFAULT 0,
  level integer DEFAULT 1,
  total_exams_taken integer DEFAULT 0,
  total_correct_answers integer DEFAULT 0,
  total_questions_answered integer DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE TABLE public.role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Book system
CREATE TABLE public.book_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon_url text,
  book_count integer DEFAULT 0,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.books (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  author_name text DEFAULT 'The Best Study',
  cover_url text,
  category_id uuid REFERENCES book_categories(id),
  page_count integer DEFAULT 0,
  read_count integer DEFAULT 0,
  rating numeric DEFAULT 5.0,
  difficulty text DEFAULT 'intermediate',
  is_featured boolean DEFAULT false,
  content text,
  creator_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.book_bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  position integer NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.book_chapters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL,
  chapter_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.book_highlights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  start_position integer NOT NULL,
  end_position integer NOT NULL,
  highlighted_text text NOT NULL,
  color text DEFAULT 'yellow',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.book_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  position integer NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_book_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  current_position integer DEFAULT 0,
  total_time_seconds integer DEFAULT 0,
  last_read_at timestamptz DEFAULT now(),
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Course system
CREATE TABLE public.course_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon_url text,
  course_count integer DEFAULT 0,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_url text,
  category text NOT NULL DEFAULT 'languages',
  subcategory text,
  topic text,
  category_id uuid REFERENCES course_categories(id),
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name text DEFAULT 'The Best Study',
  slug text,
  level text DEFAULT 'beginner',
  language text DEFAULT 'vi',
  price numeric DEFAULT 0,
  original_price numeric DEFAULT 0,
  duration_hours integer DEFAULT 0,
  lesson_count integer DEFAULT 0,
  term_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  student_count integer DEFAULT 0,
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_official boolean DEFAULT false,
  preview_video_url text,
  requirements text[],
  what_you_learn text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.course_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  section_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.course_lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id uuid REFERENCES course_sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text,
  duration_minutes integer DEFAULT 0,
  lesson_order integer DEFAULT 0,
  is_preview boolean DEFAULT false,
  content_type text DEFAULT 'video',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lesson_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer DEFAULT 0,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lesson_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE public.course_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  is_answered boolean DEFAULT false,
  upvotes integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.course_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES course_questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_instructor_answer boolean DEFAULT false,
  is_accepted boolean DEFAULT false,
  upvotes integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.course_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

CREATE TABLE public.course_certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  certificate_number varchar(50) NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL DEFAULT now(),
  completion_date timestamptz NOT NULL DEFAULT now(),
  final_score numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

CREATE TABLE public.course_wishlists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE public.user_course_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  progress_percentage integer DEFAULT 0,
  UNIQUE(user_id, course_id)
);

CREATE TABLE public.user_course_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE public.course_tests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid REFERENCES course_lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  duration_minutes integer DEFAULT 30,
  pass_percentage integer DEFAULT 70,
  max_attempts integer DEFAULT 3,
  is_required boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.course_test_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id uuid REFERENCES course_tests(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_image text,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text,
  option_d text,
  option_e text,
  option_f text,
  option_g text,
  option_h text,
  correct_answer text NOT NULL,
  explanation text,
  question_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.course_test_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id uuid REFERENCES course_tests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  score numeric,
  total_questions integer,
  correct_answers integer,
  passed boolean,
  answers jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Exam system
CREATE TABLE public.exam_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  exam_count integer DEFAULT 0,
  question_count integer DEFAULT 0,
  attempt_count integer DEFAULT 0,
  subcategory_count integer DEFAULT 0,
  rating numeric DEFAULT 0,
  icon_url text,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.exams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  difficulty text DEFAULT 'medium',
  category_id uuid REFERENCES exam_categories(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES auth.users(id),
  question_count integer DEFAULT 0,
  duration_minutes integer DEFAULT 60,
  attempt_count integer DEFAULT 0,
  pass_rate numeric DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES auth.users(id),
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text,
  option_d text,
  option_e text,
  option_f text,
  option_g text,
  option_h text,
  correct_answer text NOT NULL,
  explanation text,
  question_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.exam_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  answers jsonb,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Flashcard system
CREATE TABLE public.flashcard_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text DEFAULT 'general',
  creator_id uuid,
  card_count integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.flashcards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id uuid REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  front_text text NOT NULL,
  back_text text NOT NULL,
  card_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_flashcard_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  flashcard_id uuid REFERENCES flashcards(id) ON DELETE CASCADE,
  is_remembered boolean DEFAULT false,
  last_reviewed_at timestamptz DEFAULT now(),
  review_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, flashcard_id)
);

CREATE TABLE public.flashcard_decks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_flashcards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id uuid NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  front text NOT NULL,
  back text NOT NULL,
  hint text,
  source_type text,
  source_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.flashcard_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  flashcard_id uuid NOT NULL REFERENCES user_flashcards(id) ON DELETE CASCADE,
  due_at timestamptz NOT NULL DEFAULT now(),
  interval_days integer DEFAULT 0,
  ease numeric DEFAULT 2.5,
  repetitions integer DEFAULT 0,
  last_grade integer,
  reviewed_at timestamptz,
  UNIQUE(user_id, flashcard_id)
);

-- Podcast system
CREATE TABLE public.podcast_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon_url text,
  podcast_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.podcasts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  audio_url text,
  thumbnail_url text,
  transcript text,
  host_name text,
  category_id uuid REFERENCES podcast_categories(id),
  creator_id uuid REFERENCES auth.users(id),
  duration_seconds integer,
  episode_number integer,
  difficulty text,
  listen_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.podcast_bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  podcast_id uuid NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  time_seconds numeric NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_podcast_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  podcast_id uuid NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  current_time_seconds numeric NOT NULL DEFAULT 0,
  completed boolean DEFAULT false,
  last_played_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, podcast_id)
);

-- Practice system
CREATE TABLE public.question_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  level text,
  tags text[],
  creator_id uuid REFERENCES auth.users(id),
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  question_count integer DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.practice_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id uuid NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  choices jsonb DEFAULT '[]'::jsonb,
  answer jsonb NOT NULL,
  explanation text,
  difficulty integer,
  tags text[],
  type text,
  question_order integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.practice_exam_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  set_id uuid REFERENCES question_sets(id) ON DELETE SET NULL,
  duration_sec integer NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  score integer DEFAULT 0,
  total integer DEFAULT 0,
  correct integer DEFAULT 0,
  status text DEFAULT 'in_progress'
);

CREATE TABLE public.practice_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES practice_questions(id) ON DELETE CASCADE,
  exam_session_id uuid REFERENCES practice_exam_sessions(id) ON DELETE SET NULL,
  mode text NOT NULL,
  selected jsonb NOT NULL,
  is_correct boolean NOT NULL,
  time_spent_sec integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Study groups
CREATE TABLE public.study_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  creator_id uuid NOT NULL,
  is_public boolean DEFAULT true,
  max_members integer DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.study_group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE public.study_group_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.study_group_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  url text,
  resource_type text DEFAULT 'link',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Smart recommendations
CREATE TABLE public.user_smart_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  recommendations jsonb DEFAULT '[]'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ========================
-- STEP 4: INDEXES
-- ========================
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_books_creator_id ON public.books(creator_id);
CREATE INDEX idx_course_answers_question_id ON public.course_answers(question_id);
CREATE INDEX idx_course_questions_course_id ON public.course_questions(course_id);
CREATE INDEX idx_course_questions_lesson_id ON public.course_questions(lesson_id);
CREATE INDEX idx_course_wishlists_course_id ON public.course_wishlists(course_id);
CREATE INDEX idx_course_wishlists_user_id ON public.course_wishlists(user_id);
CREATE INDEX idx_exams_category_id ON public.exams(category_id);
CREATE INDEX idx_exams_creator_id ON public.exams(creator_id);
CREATE INDEX idx_exams_slug ON public.exams(slug);
CREATE INDEX idx_flashcard_reviews_due ON public.flashcard_reviews(user_id, due_at);
CREATE INDEX idx_podcast_bookmarks_user_podcast ON public.podcast_bookmarks(user_id, podcast_id);
CREATE INDEX idx_podcasts_creator_id ON public.podcasts(creator_id);
CREATE INDEX idx_practice_attempts_question_id ON public.practice_attempts(question_id);
CREATE INDEX idx_practice_attempts_user_id ON public.practice_attempts(user_id);
CREATE INDEX idx_practice_exam_sessions_user_id ON public.practice_exam_sessions(user_id);
CREATE INDEX idx_practice_questions_difficulty ON public.practice_questions(difficulty);
CREATE INDEX idx_practice_questions_set_id ON public.practice_questions(set_id);
CREATE INDEX idx_profiles_expires_at ON public.profiles(expires_at);
CREATE UNIQUE INDEX profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;
CREATE INDEX idx_question_sets_creator_id ON public.question_sets(creator_id);
CREATE INDEX idx_questions_exam_id ON public.questions(exam_id);
CREATE INDEX idx_user_flashcards_deck ON public.user_flashcards(deck_id);
CREATE INDEX idx_user_podcast_progress_podcast ON public.user_podcast_progress(podcast_id);
CREATE INDEX idx_user_podcast_progress_user ON public.user_podcast_progress(user_id);
CREATE INDEX idx_user_smart_recommendations_generated_at ON public.user_smart_recommendations(generated_at DESC);
CREATE INDEX idx_user_smart_recommendations_user_id ON public.user_smart_recommendations(user_id);

-- ========================
-- STEP 5: ENABLE RLS ON ALL TABLES
-- ========================
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_podcast_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_smart_recommendations ENABLE ROW LEVEL SECURITY;

-- ========================
-- STEP 6: RLS POLICIES
-- ========================

-- achievements
CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Admins can manage achievements" ON public.achievements FOR ALL USING (has_role(auth.uid(), 'admin'));

-- audit_logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can create audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- book_bookmarks
CREATE POLICY "Users can create their own bookmarks" ON public.book_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON public.book_bookmarks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own bookmarks" ON public.book_bookmarks FOR SELECT USING (auth.uid() = user_id);

-- book_categories
CREATE POLICY "Book categories are viewable by everyone" ON public.book_categories FOR SELECT USING (true);
CREATE POLICY "Teachers can create book categories" ON public.book_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can delete book categories" ON public.book_categories FOR DELETE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update book categories" ON public.book_categories FOR UPDATE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

-- book_chapters
CREATE POLICY "Chapters are viewable by everyone" ON public.book_chapters FOR SELECT USING (true);
CREATE POLICY "Teachers can manage chapters" ON public.book_chapters FOR ALL USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

-- book_highlights
CREATE POLICY "Users can create their own highlights" ON public.book_highlights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own highlights" ON public.book_highlights FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own highlights" ON public.book_highlights FOR SELECT USING (auth.uid() = user_id);

-- book_notes
CREATE POLICY "Users can create their own notes" ON public.book_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.book_notes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.book_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own notes" ON public.book_notes FOR SELECT USING (auth.uid() = user_id);

-- books
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);
CREATE POLICY "Teachers can create books" ON public.books FOR INSERT WITH CHECK ((has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')) AND (creator_id = auth.uid() OR creator_id IS NULL));
CREATE POLICY "Teachers can delete their own books" ON public.books FOR DELETE USING ((creator_id = auth.uid() AND has_role(auth.uid(), 'teacher')) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update their own books" ON public.books FOR UPDATE USING ((creator_id = auth.uid() AND has_role(auth.uid(), 'teacher')) OR has_role(auth.uid(), 'admin'));

-- course_answers
CREATE POLICY "Enrolled users can create answers" ON public.course_answers FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM course_questions q JOIN user_course_enrollments e ON e.course_id = q.course_id WHERE q.id = course_answers.question_id AND e.user_id = auth.uid()));
CREATE POLICY "Instructors can create answers" ON public.course_answers FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM course_questions q JOIN courses c ON c.id = q.course_id WHERE q.id = course_answers.question_id AND c.creator_id = auth.uid()));
CREATE POLICY "Instructors can update answers in their courses" ON public.course_answers FOR UPDATE USING (EXISTS (SELECT 1 FROM course_questions q JOIN courses c ON c.id = q.course_id WHERE q.id = course_answers.question_id AND c.creator_id = auth.uid()));
CREATE POLICY "Users can delete their own answers" ON public.course_answers FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own answers" ON public.course_answers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view answers for accessible questions" ON public.course_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM course_questions q JOIN user_course_enrollments e ON e.course_id = q.course_id WHERE q.id = course_answers.question_id AND e.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM course_questions q JOIN courses c ON c.id = q.course_id WHERE q.id = course_answers.question_id AND c.creator_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

-- course_categories
CREATE POLICY "Admins can manage course categories" ON public.course_categories FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Course categories are viewable by everyone" ON public.course_categories FOR SELECT USING (true);
CREATE POLICY "Teachers can create course categories" ON public.course_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

-- course_certificates
CREATE POLICY "Anyone can view certificates by certificate_number for verifica" ON public.course_certificates FOR SELECT USING (true);
CREATE POLICY "System can insert certificates" ON public.course_certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own certificates" ON public.course_certificates FOR SELECT USING (auth.uid() = user_id);

-- course_lessons
CREATE POLICY "Lessons are viewable by everyone" ON public.course_lessons FOR SELECT USING (true);
CREATE POLICY "Section owner can manage lessons" ON public.course_lessons FOR ALL USING (EXISTS (SELECT 1 FROM course_sections cs JOIN courses c ON c.id = cs.course_id WHERE cs.id = course_lessons.section_id AND (c.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))));

-- course_questions
CREATE POLICY "Enrolled users can create questions" ON public.course_questions FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM user_course_enrollments WHERE user_course_enrollments.course_id = course_questions.course_id AND user_course_enrollments.user_id = auth.uid()));
CREATE POLICY "Enrolled users can view questions" ON public.course_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_course_enrollments WHERE user_course_enrollments.course_id = course_questions.course_id AND user_course_enrollments.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM courses WHERE courses.id = course_questions.course_id AND courses.creator_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);
CREATE POLICY "Instructors can update questions in their courses" ON public.course_questions FOR UPDATE USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_questions.course_id AND courses.creator_id = auth.uid()));
CREATE POLICY "Users can delete their own questions" ON public.course_questions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own questions" ON public.course_questions FOR UPDATE USING (auth.uid() = user_id);

-- course_reviews
CREATE POLICY "Anyone can view reviews" ON public.course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON public.course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.course_reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.course_reviews FOR UPDATE USING (auth.uid() = user_id);

-- course_sections
CREATE POLICY "Course creator can manage sections" ON public.course_sections FOR ALL USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = course_sections.course_id AND (courses.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))));
CREATE POLICY "Course sections are viewable by everyone" ON public.course_sections FOR SELECT USING (true);

-- course_test_attempts
CREATE POLICY "Users can create their own test attempts" ON public.course_test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own test attempts" ON public.course_test_attempts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own test attempts" ON public.course_test_attempts FOR SELECT USING (auth.uid() = user_id);

-- course_test_questions
CREATE POLICY "Course creator can manage test questions" ON public.course_test_questions FOR ALL USING (EXISTS (SELECT 1 FROM course_tests ct JOIN course_lessons cl ON cl.id = ct.lesson_id JOIN course_sections cs ON cs.id = cl.section_id JOIN courses c ON c.id = cs.course_id WHERE ct.id = course_test_questions.test_id AND (c.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))));
CREATE POLICY "Course test questions are viewable by everyone" ON public.course_test_questions FOR SELECT USING (true);

-- course_tests
CREATE POLICY "Course creator can manage tests" ON public.course_tests FOR ALL USING (EXISTS (SELECT 1 FROM course_lessons cl JOIN course_sections cs ON cs.id = cl.section_id JOIN courses c ON c.id = cs.course_id WHERE cl.id = course_tests.lesson_id AND (c.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))));
CREATE POLICY "Course tests are viewable by everyone" ON public.course_tests FOR SELECT USING (true);

-- course_wishlists
CREATE POLICY "Users can add to their own wishlist" ON public.course_wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from their own wishlist" ON public.course_wishlists FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.course_wishlists FOR SELECT USING (auth.uid() = user_id);

-- courses
CREATE POLICY "Admins can manage all courses" ON public.courses FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can create courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Teachers can delete their own courses" ON public.courses FOR DELETE USING (creator_id = auth.uid() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));
CREATE POLICY "Teachers can update their own courses" ON public.courses FOR UPDATE USING (creator_id = auth.uid() AND (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')));

-- exam_attempts
CREATE POLICY "Anyone can create exam attempts" ON public.exam_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own attempts" ON public.exam_attempts FOR SELECT USING (true);

-- exam_categories
CREATE POLICY "Exam categories are viewable by everyone" ON public.exam_categories FOR SELECT USING (true);
CREATE POLICY "Teachers can create exam categories" ON public.exam_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can delete exam categories" ON public.exam_categories FOR DELETE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update exam categories" ON public.exam_categories FOR UPDATE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

-- exams
CREATE POLICY "Exams are viewable by everyone" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Teachers can create exams" ON public.exams FOR INSERT WITH CHECK ((has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')) AND (creator_id = auth.uid() OR creator_id IS NULL));
CREATE POLICY "Teachers can delete their own exams" ON public.exams FOR DELETE USING ((creator_id = auth.uid() AND has_role(auth.uid(), 'teacher')) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update their own exams" ON public.exams FOR UPDATE USING ((creator_id = auth.uid() AND has_role(auth.uid(), 'teacher')) OR has_role(auth.uid(), 'admin'));

-- flashcard_decks
CREATE POLICY "Users can create their own decks" ON public.flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own decks" ON public.flashcard_decks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own decks" ON public.flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own decks" ON public.flashcard_decks FOR SELECT USING (auth.uid() = user_id);

-- flashcard_reviews
CREATE POLICY "Users can create their own reviews" ON public.flashcard_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.flashcard_reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.flashcard_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own reviews" ON public.flashcard_reviews FOR SELECT USING (auth.uid() = user_id);

-- flashcard_sets
CREATE POLICY "Users can create flashcard sets" ON public.flashcard_sets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their own sets" ON public.flashcard_sets FOR DELETE USING (auth.uid() = creator_id);
CREATE POLICY "Users can update their own sets" ON public.flashcard_sets FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can view public or own sets" ON public.flashcard_sets FOR SELECT USING (is_public = true OR auth.uid() = creator_id);

-- flashcards
CREATE POLICY "Authenticated users can create flashcards" ON public.flashcards FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Flashcards are viewable by everyone" ON public.flashcards FOR SELECT USING (true);
CREATE POLICY "Teachers can delete flashcards" ON public.flashcards FOR DELETE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update flashcards" ON public.flashcards FOR UPDATE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

-- lesson_attachments
CREATE POLICY "Course creator can manage attachments" ON public.lesson_attachments FOR ALL USING (EXISTS (SELECT 1 FROM course_lessons cl JOIN course_sections cs ON cs.id = cl.section_id JOIN courses c ON c.id = cs.course_id WHERE cl.id = lesson_attachments.lesson_id AND (c.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))));
CREATE POLICY "Lesson attachments are viewable by everyone" ON public.lesson_attachments FOR SELECT USING (true);

-- lesson_notes
CREATE POLICY "Users can create their own notes" ON public.lesson_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.lesson_notes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.lesson_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own notes" ON public.lesson_notes FOR SELECT USING (auth.uid() = user_id);

-- permissions
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Permissions are viewable by everyone" ON public.permissions FOR SELECT USING (true);

-- podcast_bookmarks
CREATE POLICY "Users can create their own bookmarks" ON public.podcast_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON public.podcast_bookmarks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own bookmarks" ON public.podcast_bookmarks FOR SELECT USING (auth.uid() = user_id);

-- podcast_categories
CREATE POLICY "Podcast categories are viewable by everyone" ON public.podcast_categories FOR SELECT USING (true);
CREATE POLICY "Teachers can create podcast categories" ON public.podcast_categories FOR INSERT WITH CHECK (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can delete podcast categories" ON public.podcast_categories FOR DELETE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update podcast categories" ON public.podcast_categories FOR UPDATE USING (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));

-- podcasts
CREATE POLICY "Podcasts are viewable by everyone" ON public.podcasts FOR SELECT USING (true);
CREATE POLICY "Teachers can create podcasts" ON public.podcasts FOR INSERT WITH CHECK ((has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')) AND (creator_id = auth.uid() OR creator_id IS NULL));
CREATE POLICY "Teachers can delete their own podcasts" ON public.podcasts FOR DELETE USING ((creator_id = auth.uid() AND has_role(auth.uid(), 'teacher')) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update their own podcasts" ON public.podcasts FOR UPDATE USING ((creator_id = auth.uid() AND has_role(auth.uid(), 'teacher')) OR has_role(auth.uid(), 'admin'));

-- practice_attempts
CREATE POLICY "Users can create their own attempts" ON public.practice_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own attempts" ON public.practice_attempts FOR SELECT USING (auth.uid() = user_id);

-- practice_exam_sessions
CREATE POLICY "Users can create their own exam sessions" ON public.practice_exam_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own exam sessions" ON public.practice_exam_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own exam sessions" ON public.practice_exam_sessions FOR SELECT USING (auth.uid() = user_id);

-- practice_questions
CREATE POLICY "Practice questions are viewable by everyone" ON public.practice_questions FOR SELECT USING (EXISTS (SELECT 1 FROM question_sets WHERE question_sets.id = practice_questions.set_id AND question_sets.is_published = true));
CREATE POLICY "Teachers can delete their practice questions" ON public.practice_questions FOR DELETE USING (EXISTS (SELECT 1 FROM question_sets WHERE question_sets.id = practice_questions.set_id AND (question_sets.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))));
CREATE POLICY "Teachers can insert practice questions" ON public.practice_questions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM question_sets WHERE question_sets.id = practice_questions.set_id AND (question_sets.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))));
CREATE POLICY "Teachers can update their practice questions" ON public.practice_questions FOR UPDATE USING (EXISTS (SELECT 1 FROM question_sets WHERE question_sets.id = practice_questions.set_id AND (question_sets.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))));

-- profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- question_sets
CREATE POLICY "Question sets are viewable by everyone" ON public.question_sets FOR SELECT USING (is_published = true);
CREATE POLICY "Teachers can create question sets" ON public.question_sets FOR INSERT WITH CHECK ((has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin')) AND (creator_id = auth.uid() OR creator_id IS NULL));
CREATE POLICY "Teachers can delete their own question sets" ON public.question_sets FOR DELETE USING ((creator_id = auth.uid() AND has_role(auth.uid(), 'teacher')) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can update their own question sets" ON public.question_sets FOR UPDATE USING ((creator_id = auth.uid() AND has_role(auth.uid(), 'teacher')) OR has_role(auth.uid(), 'admin'));

-- questions
CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Teachers can create questions" ON public.questions FOR INSERT WITH CHECK (has_role(auth.uid(), 'teacher') OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers can delete their own questions" ON public.questions FOR DELETE USING (EXISTS (SELECT 1 FROM exams WHERE exams.id = questions.exam_id AND (exams.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))));
CREATE POLICY "Teachers can update their own questions" ON public.questions FOR UPDATE USING (EXISTS (SELECT 1 FROM exams WHERE exams.id = questions.exam_id AND (exams.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))));

-- role_permissions
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Role permissions are viewable by authenticated users" ON public.role_permissions FOR SELECT USING (auth.uid() IS NOT NULL);

-- study_group_members
CREATE POLICY "Members are viewable by group members" ON public.study_group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM study_group_members m WHERE m.group_id = m.group_id AND m.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM study_groups g WHERE g.id = study_group_members.group_id AND g.is_public = true)
);
CREATE POLICY "Members can leave groups" ON public.study_group_members FOR DELETE USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM study_group_members m WHERE m.group_id = m.group_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
);
CREATE POLICY "Users can join groups" ON public.study_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- study_group_messages
CREATE POLICY "Members can send messages" ON public.study_group_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = study_group_messages.group_id AND study_group_members.user_id = auth.uid()));
CREATE POLICY "Messages viewable by group members" ON public.study_group_messages FOR SELECT USING (EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = study_group_messages.group_id AND study_group_members.user_id = auth.uid()));
CREATE POLICY "Users can delete own messages" ON public.study_group_messages FOR DELETE USING (user_id = auth.uid());

-- study_group_resources
CREATE POLICY "Members can share resources" ON public.study_group_resources FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = study_group_resources.group_id AND study_group_members.user_id = auth.uid()));
CREATE POLICY "Resources viewable by group members" ON public.study_group_resources FOR SELECT USING (EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = study_group_resources.group_id AND study_group_members.user_id = auth.uid()));
CREATE POLICY "Users can delete own resources" ON public.study_group_resources FOR DELETE USING (user_id = auth.uid());

-- study_groups
CREATE POLICY "Authenticated users can create groups" ON public.study_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Group owners and admins can update" ON public.study_groups FOR UPDATE USING (EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = study_group_members.id AND study_group_members.user_id = auth.uid() AND study_group_members.role IN ('owner', 'admin')));
CREATE POLICY "Group owners can delete" ON public.study_groups FOR DELETE USING (creator_id = auth.uid());
CREATE POLICY "Public groups are viewable by everyone" ON public.study_groups FOR SELECT USING (is_public = true OR EXISTS (SELECT 1 FROM study_group_members WHERE study_group_members.group_id = study_group_members.id AND study_group_members.user_id = auth.uid()));

-- user_achievements
CREATE POLICY "System can insert user achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view all user achievements" ON public.user_achievements FOR SELECT USING (true);

-- user_book_progress
CREATE POLICY "Users can create their own reading progress" ON public.user_book_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reading progress" ON public.user_book_progress FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own reading progress" ON public.user_book_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own reading progress" ON public.user_book_progress FOR SELECT USING (auth.uid() = user_id);

-- user_course_enrollments
CREATE POLICY "Users can enroll themselves" ON public.user_course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own enrollment" ON public.user_course_enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own enrollments" ON public.user_course_enrollments FOR SELECT USING (auth.uid() = user_id);

-- user_course_progress
CREATE POLICY "Users can insert their own progress" ON public.user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_course_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own progress" ON public.user_course_progress FOR SELECT USING (auth.uid() = user_id);

-- user_flashcard_progress
CREATE POLICY "Users can insert their own progress" ON public.user_flashcard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_flashcard_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own progress" ON public.user_flashcard_progress FOR SELECT USING (auth.uid() = user_id);

-- user_flashcards
CREATE POLICY "Users can create cards in their decks" ON public.user_flashcards FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM flashcard_decks WHERE flashcard_decks.id = user_flashcards.deck_id AND flashcard_decks.user_id = auth.uid()));
CREATE POLICY "Users can delete cards in their decks" ON public.user_flashcards FOR DELETE USING (EXISTS (SELECT 1 FROM flashcard_decks WHERE flashcard_decks.id = user_flashcards.deck_id AND flashcard_decks.user_id = auth.uid()));
CREATE POLICY "Users can update cards in their decks" ON public.user_flashcards FOR UPDATE USING (EXISTS (SELECT 1 FROM flashcard_decks WHERE flashcard_decks.id = user_flashcards.deck_id AND flashcard_decks.user_id = auth.uid()));
CREATE POLICY "Users can view cards in their decks" ON public.user_flashcards FOR SELECT USING (EXISTS (SELECT 1 FROM flashcard_decks WHERE flashcard_decks.id = user_flashcards.deck_id AND flashcard_decks.user_id = auth.uid()));

-- user_podcast_progress
CREATE POLICY "Users can insert their own podcast progress" ON public.user_podcast_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own podcast progress" ON public.user_podcast_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own podcast progress" ON public.user_podcast_progress FOR SELECT USING (auth.uid() = user_id);

-- user_roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- user_smart_recommendations
CREATE POLICY "Users can insert their own recommendations" ON public.user_smart_recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recommendations" ON public.user_smart_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own recommendations" ON public.user_smart_recommendations FOR SELECT USING (auth.uid() = user_id);

-- ========================
-- STEP 7: TRIGGERS
-- ========================

-- Auto-create profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update question count when practice questions change
CREATE TRIGGER update_question_count
  AFTER INSERT OR DELETE ON public.practice_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_question_set_count();

-- Update user stats after exam attempt
CREATE TRIGGER update_exam_stats
  AFTER INSERT ON public.exam_attempts
  FOR EACH ROW EXECUTE FUNCTION public.update_user_exam_stats();

-- ========================
-- STEP 8: STORAGE BUCKETS
-- ========================
INSERT INTO storage.buckets (id, name, public) VALUES ('question-images', 'question-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('podcast-audio', 'podcast-audio', true);

-- Storage policies (public read for all buckets)
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id IN ('question-images', 'avatars', 'course-materials', 'podcast-audio'));
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND bucket_id IN ('question-images', 'avatars', 'course-materials', 'podcast-audio'));
CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE USING (auth.uid() IS NOT NULL AND bucket_id IN ('question-images', 'avatars', 'course-materials', 'podcast-audio'));
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE USING (auth.uid() IS NOT NULL AND bucket_id IN ('question-images', 'avatars', 'course-materials', 'podcast-audio'));

-- ========================
-- DONE! 
-- ========================
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Export data from Lovable Cloud using the export-database edge function
-- 3. Import the JSON data into your new Supabase project
-- 4. Update your .env file with the new Supabase URL and anon key
-- 5. Deploy edge functions to your new project
