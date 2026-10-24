
-- ===== 20260818143357_85a70288-f2d1-4d3f-9eb3-a98322738ba3.sql =====
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  education TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.skill_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technology TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score NUMERIC,
  percentage NUMERIC,
  total_questions INTEGER,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_assessments TO authenticated;
GRANT ALL ON public.skill_assessments TO service_role;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assessments" ON public.skill_assessments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.assessment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.skill_assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  weak_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  detailed_report JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_results TO authenticated;
GRANT ALL ON public.assessment_results TO service_role;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assessment results" ON public.assessment_results FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.mock_interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score NUMERIC,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mock_interviews TO authenticated;
GRANT ALL ON public.mock_interviews TO service_role;
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own interviews" ON public.mock_interviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.interview_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES public.mock_interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  feedback TEXT,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  detailed_report JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interview_reports TO authenticated;
GRANT ALL ON public.interview_reports TO service_role;
ALTER TABLE public.interview_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own interview reports" ON public.interview_reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  review_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resumes" ON public.resumes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== 20260818143419_dbc4c5e1-1e08-4790-a2bf-08be6129dfee.sql =====
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ===== 20261024120000_user_progress_and_admin.sql =====
-- ============================================================================
-- Per-user progress tables (DSA hub, resume reviews) + admin role & analytics.
-- Every user table is protected by RLS: a user can only touch rows where
-- user_id = auth.uid(). Admins never get direct table access; they read
-- summaries through the SECURITY DEFINER admin_* functions at the bottom.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- DSA: one row per user per level
-- ---------------------------------------------------------------------------
CREATE TABLE public.dsa_level_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  level_id TEXT NOT NULL,
  quiz_completed BOOLEAN NOT NULL DEFAULT false,
  quiz_score NUMERIC NOT NULL DEFAULT 0,
  quiz_passed BOOLEAN NOT NULL DEFAULT false,
  coding_completed BOOLEAN NOT NULL DEFAULT false,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id, level_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_level_progress TO authenticated;
GRANT ALL ON public.dsa_level_progress TO service_role;
ALTER TABLE public.dsa_level_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dsa progress" ON public.dsa_level_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER dsa_level_progress_updated_at BEFORE UPDATE ON public.dsa_level_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- DSA: every quiz attempt (for accuracy trends)
-- ---------------------------------------------------------------------------
CREATE TABLE public.dsa_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  level_id TEXT NOT NULL,
  score NUMERIC NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX dsa_quiz_attempts_user_idx ON public.dsa_quiz_attempts (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_quiz_attempts TO authenticated;
GRANT ALL ON public.dsa_quiz_attempts TO service_role;
ALTER TABLE public.dsa_quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dsa quiz attempts" ON public.dsa_quiz_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- DSA: practice problems the user ticked as solved
-- ---------------------------------------------------------------------------
CREATE TABLE public.dsa_solved_problems (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  solved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, problem_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dsa_solved_problems TO authenticated;
GRANT ALL ON public.dsa_solved_problems TO service_role;
ALTER TABLE public.dsa_solved_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own solved problems" ON public.dsa_solved_problems FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Resume reviews (previously mixed into public.resumes)
-- ---------------------------------------------------------------------------
CREATE TABLE public.resume_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT,
  overall_score NUMERIC,
  review JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX resume_reviews_user_idx ON public.resume_reviews (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_reviews TO authenticated;
GRANT ALL ON public.resume_reviews TO service_role;
ALTER TABLE public.resume_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resume reviews" ON public.resume_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Move existing reviews out of public.resumes.
INSERT INTO public.resume_reviews (user_id, file_name, overall_score, review, created_at)
SELECT user_id,
       resume_data->>'fileName',
       NULLIF(review_result->>'overallScore', '')::numeric,
       review_result,
       created_at
FROM public.resumes
WHERE review_result IS NOT NULL;
DELETE FROM public.resumes WHERE review_result IS NOT NULL;

-- Move DSA progress that was stored as text in profiles.education.
DO $$
DECLARE
  p RECORD;
  lvl RECORD;
BEGIN
  FOR p IN SELECT user_id, education FROM public.profiles WHERE education LIKE 'dsa_progress:%' LOOP
    BEGIN
      FOR lvl IN
        SELECT value FROM jsonb_each((substring(p.education FROM 14))::jsonb -> 'completedLevels')
      LOOP
        INSERT INTO public.dsa_level_progress
          (user_id, topic_id, level_id, quiz_completed, quiz_score, quiz_passed,
           coding_completed, completed, completed_at, last_code)
        VALUES (
          p.user_id,
          lvl.value->>'topicId',
          lvl.value->>'levelId',
          COALESCE((lvl.value->>'quizCompleted')::boolean, false),
          COALESCE((lvl.value->>'quizScore')::numeric, 0),
          COALESCE((lvl.value->>'quizPassed')::boolean, false),
          COALESCE((lvl.value->>'codingCompleted')::boolean, false),
          COALESCE((lvl.value->>'completed')::boolean, false),
          (lvl.value->>'completedAt')::timestamptz,
          lvl.value->>'lastCodeSnippet'
        )
        ON CONFLICT (user_id, topic_id, level_id) DO NOTHING;
      END LOOP;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Skipping unparseable DSA progress for user %', p.user_id;
    END;
  END LOOP;
  UPDATE public.profiles SET education = NULL WHERE education LIKE 'dsa_progress:%';
END $$;

-- ---------------------------------------------------------------------------
-- Admin role
-- Grant yourself admin once, in the Supabase SQL editor:
--   INSERT INTO public.user_roles (user_id, role)
--   SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com';
-- There is deliberately no INSERT/UPDATE policy: nobody can grant a role
-- from the website.
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Last activity per user across every feature.
CREATE OR REPLACE FUNCTION public.admin_user_activity()
RETURNS TABLE (user_id UUID, at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT user_id, completed_at FROM public.skill_assessments
  UNION ALL SELECT user_id, completed_at FROM public.mock_interviews
  UNION ALL SELECT user_id, created_at FROM public.dsa_quiz_attempts
  UNION ALL SELECT user_id, solved_at FROM public.dsa_solved_problems
  UNION ALL SELECT user_id, created_at FROM public.resume_reviews
  UNION ALL SELECT user_id, updated_at FROM public.resumes;
$$;
REVOKE ALL ON FUNCTION public.admin_user_activity() FROM PUBLIC, anon, authenticated;

-- Platform-wide numbers for the admin overview.
CREATE OR REPLACE FUNCTION public.admin_overview() RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  WITH act AS (SELECT * FROM public.admin_user_activity()),
  days AS (
    SELECT generate_series((now() - interval '29 days')::date, now()::date, interval '1 day')::date AS day
  )
  SELECT jsonb_build_object(
    'total_users',      (SELECT count(*) FROM auth.users),
    'verified_users',   (SELECT count(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL),
    'new_today',        (SELECT count(*) FROM auth.users WHERE created_at >= date_trunc('day', now())),
    'new_7d',           (SELECT count(*) FROM auth.users WHERE created_at >= now() - interval '7 days'),
    'new_30d',          (SELECT count(*) FROM auth.users WHERE created_at >= now() - interval '30 days'),
    'active_today',     (SELECT count(DISTINCT user_id) FROM act WHERE at >= date_trunc('day', now())),
    'active_7d',        (SELECT count(DISTINCT user_id) FROM act WHERE at >= now() - interval '7 days'),
    'active_30d',       (SELECT count(DISTINCT user_id) FROM act WHERE at >= now() - interval '30 days'),
    'assessments',      (SELECT count(*) FROM public.skill_assessments),
    'interviews',       (SELECT count(*) FROM public.mock_interviews),
    'dsa_quiz_attempts',(SELECT count(*) FROM public.dsa_quiz_attempts),
    'dsa_levels_completed', (SELECT count(*) FROM public.dsa_level_progress WHERE completed),
    'problems_solved',  (SELECT count(*) FROM public.dsa_solved_problems),
    'resume_reviews',   (SELECT count(*) FROM public.resume_reviews),
    'resumes_built',    (SELECT count(*) FROM public.resumes),
    'avg_assessment_score', (SELECT round(avg(score), 1) FROM public.skill_assessments),
    'avg_interview_score',  (SELECT round(avg(score), 1) FROM public.mock_interviews),
    'avg_ats_score',        (SELECT round(avg(overall_score), 1) FROM public.resume_reviews),
    'daily', (
      SELECT jsonb_agg(jsonb_build_object(
        'day', d.day,
        'signups', (SELECT count(*) FROM auth.users u WHERE u.created_at::date = d.day),
        'active',  (SELECT count(DISTINCT a.user_id) FROM act a WHERE a.at::date = d.day)
      ) ORDER BY d.day)
      FROM days d
    ),
    'top_technologies', (
      SELECT COALESCE(jsonb_agg(t ORDER BY t.attempts DESC), '[]'::jsonb) FROM (
        SELECT technology, count(*) AS attempts, round(avg(score), 1) AS avg_score
        FROM public.skill_assessments GROUP BY technology ORDER BY count(*) DESC LIMIT 8
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_overview() TO authenticated;

-- One summary row per user. Scores and counts only: no resume contents or
-- interview answers.
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  email TEXT,
  education TEXT,
  is_admin BOOLEAN,
  joined_at TIMESTAMPTZ,
  email_verified BOOLEAN,
  last_sign_in_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  assessments BIGINT,
  avg_assessment_score NUMERIC,
  interviews BIGINT,
  avg_interview_score NUMERIC,
  dsa_levels_completed BIGINT,
  problems_solved BIGINT,
  resume_reviews BIGINT,
  best_ats_score NUMERIC,
  has_resume BOOLEAN
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    p.full_name,
    u.email::text,
    p.education,
    EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin'),
    u.created_at,
    u.email_confirmed_at IS NOT NULL,
    u.last_sign_in_at,
    (SELECT max(a.at) FROM public.admin_user_activity() a WHERE a.user_id = u.id),
    (SELECT count(*) FROM public.skill_assessments s WHERE s.user_id = u.id),
    (SELECT round(avg(s.score), 1) FROM public.skill_assessments s WHERE s.user_id = u.id),
    (SELECT count(*) FROM public.mock_interviews m WHERE m.user_id = u.id),
    (SELECT round(avg(m.score), 1) FROM public.mock_interviews m WHERE m.user_id = u.id),
    (SELECT count(*) FROM public.dsa_level_progress d WHERE d.user_id = u.id AND d.completed),
    (SELECT count(*) FROM public.dsa_solved_problems sp WHERE sp.user_id = u.id),
    (SELECT count(*) FROM public.resume_reviews rr WHERE rr.user_id = u.id),
    (SELECT max(rr.overall_score) FROM public.resume_reviews rr WHERE rr.user_id = u.id),
    EXISTS (SELECT 1 FROM public.resumes re WHERE re.user_id = u.id)
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- Score history for one user (admin drill-down).
CREATE OR REPLACE FUNCTION public.admin_user_detail(target UUID) RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN jsonb_build_object(
    'assessments', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'technology', technology, 'difficulty', difficulty, 'score', score, 'at', completed_at
      ) ORDER BY completed_at DESC), '[]'::jsonb)
      FROM public.skill_assessments WHERE user_id = target
    ),
    'interviews', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'type', interview_type, 'difficulty', difficulty, 'score', score, 'at', completed_at
      ) ORDER BY completed_at DESC), '[]'::jsonb)
      FROM public.mock_interviews WHERE user_id = target
    ),
    'dsa_levels', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'topic_id', topic_id, 'level_id', level_id, 'quiz_score', quiz_score,
        'completed', completed, 'completed_at', completed_at
      ) ORDER BY updated_at DESC), '[]'::jsonb)
      FROM public.dsa_level_progress WHERE user_id = target
    ),
    'resume_reviews', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'file_name', file_name, 'score', overall_score, 'at', created_at
      ) ORDER BY created_at DESC), '[]'::jsonb)
      FROM public.resume_reviews WHERE user_id = target
    )
  );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_user_detail(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_user_detail(UUID) TO authenticated;

