CREATE TYPE public.app_role AS ENUM ('counselor', 'scout');
CREATE TYPE public.response_status AS ENUM ('draft', 'submitted', 'returned', 'approved');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'counselor'));

-- Scout profiles: ONLY first name + last initial + opaque account id
CREATE TABLE public.scouts (
  id uuid PRIMARY KEY,
  account_id text NOT NULL UNIQUE,
  first_name text NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 30),
  last_initial text NOT NULL CHECK (last_initial ~ '^[A-Z]$'),
  is_demo boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  code_reset_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.scouts TO authenticated;
GRANT ALL ON public.scouts TO service_role;
ALTER TABLE public.scouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scout reads self, counselor reads all" ON public.scouts FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'counselor'));

-- Workbook answers
CREATE TABLE public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id uuid NOT NULL REFERENCES public.scouts(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  answer text NOT NULL DEFAULT '' CHECK (char_length(answer) <= 8000),
  status public.response_status NOT NULL DEFAULT 'draft',
  counselor_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scout_id, question_id)
);
GRANT SELECT, INSERT, UPDATE ON public.responses TO authenticated;
GRANT ALL ON public.responses TO service_role;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scout own responses read" ON public.responses FOR SELECT TO authenticated
  USING (scout_id = auth.uid() OR public.has_role(auth.uid(), 'counselor'));
CREATE POLICY "scout insert own" ON public.responses FOR INSERT TO authenticated
  WITH CHECK (scout_id = auth.uid() AND public.has_role(auth.uid(), 'scout'));
CREATE POLICY "scout update own / counselor update" ON public.responses FOR UPDATE TO authenticated
  USING (scout_id = auth.uid() OR public.has_role(auth.uid(), 'counselor'))
  WITH CHECK (scout_id = auth.uid() OR public.has_role(auth.uid(), 'counselor'));

-- Guard: scouts cannot approve/return or edit counselor fields; counselors cannot rewrite answers
CREATE OR REPLACE FUNCTION public.guard_response() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF public.has_role(auth.uid(), 'counselor') THEN
    IF TG_OP = 'UPDATE' THEN
      NEW.answer := OLD.answer;
      NEW.scout_id := OLD.scout_id;
      NEW.question_id := OLD.question_id;
      NEW.reviewed_by := auth.uid();
      NEW.reviewed_at := now();
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.status NOT IN ('draft','submitted') THEN
    RAISE EXCEPTION 'Scouts may only save drafts or submit';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'approved' THEN
      RAISE EXCEPTION 'Approved answers are locked';
    END IF;
    NEW.counselor_note := OLD.counselor_note;
    NEW.reviewed_by := OLD.reviewed_by;
    NEW.reviewed_at := OLD.reviewed_at;
    NEW.scout_id := OLD.scout_id;
    NEW.question_id := OLD.question_id;
  ELSE
    NEW.counselor_note := NULL; NEW.reviewed_by := NULL; NEW.reviewed_at := NULL;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER responses_guard BEFORE INSERT OR UPDATE ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.guard_response();

-- Code Lab drafts
CREATE TABLE public.code_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id uuid NOT NULL REFERENCES public.scouts(id) ON DELETE CASCADE,
  lab text NOT NULL CHECK (lab IN ('scratch','python','lua')),
  code text NOT NULL DEFAULT '' CHECK (char_length(code) <= 20000),
  explanation text NOT NULL DEFAULT '' CHECK (char_length(explanation) <= 8000),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scout_id, lab)
);
GRANT SELECT, INSERT, UPDATE ON public.code_drafts TO authenticated;
GRANT ALL ON public.code_drafts TO service_role;
ALTER TABLE public.code_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drafts read" ON public.code_drafts FOR SELECT TO authenticated
  USING (scout_id = auth.uid() OR public.has_role(auth.uid(), 'counselor'));
CREATE POLICY "drafts insert own" ON public.code_drafts FOR INSERT TO authenticated
  WITH CHECK (scout_id = auth.uid() AND public.has_role(auth.uid(), 'scout'));
CREATE POLICY "drafts update own" ON public.code_drafts FOR UPDATE TO authenticated
  USING (scout_id = auth.uid()) WITH CHECK (scout_id = auth.uid());

-- Lesson position (resume)
CREATE TABLE public.lesson_progress (
  scout_id uuid NOT NULL REFERENCES public.scouts(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  step integer NOT NULL DEFAULT 0 CHECK (step >= 0 AND step < 200),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (scout_id, module_id)
);
GRANT SELECT, INSERT, UPDATE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress read" ON public.lesson_progress FOR SELECT TO authenticated
  USING (scout_id = auth.uid() OR public.has_role(auth.uid(), 'counselor'));
CREATE POLICY "progress insert own" ON public.lesson_progress FOR INSERT TO authenticated
  WITH CHECK (scout_id = auth.uid() AND public.has_role(auth.uid(), 'scout'));
CREATE POLICY "progress update own" ON public.lesson_progress FOR UPDATE TO authenticated
  USING (scout_id = auth.uid()) WITH CHECK (scout_id = auth.uid());

-- Counselor manual sign-offs (discussions / demonstrations)
CREATE TABLE public.signoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id uuid NOT NULL REFERENCES public.scouts(id) ON DELETE CASCADE,
  requirement text NOT NULL,
  note text,
  signed_by uuid NOT NULL DEFAULT auth.uid(),
  signed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scout_id, requirement)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.signoffs TO authenticated;
GRANT ALL ON public.signoffs TO service_role;
ALTER TABLE public.signoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signoffs read" ON public.signoffs FOR SELECT TO authenticated
  USING (scout_id = auth.uid() OR public.has_role(auth.uid(), 'counselor'));
CREATE POLICY "signoffs counselor write" ON public.signoffs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'counselor'))
  WITH CHECK (public.has_role(auth.uid(), 'counselor') AND signed_by = auth.uid());

-- Tuesday sessions
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date NOT NULL DEFAULT current_date,
  focus text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  attendees uuid[] NOT NULL DEFAULT '{}',
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions counselor" ON public.sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'counselor'))
  WITH CHECK (public.has_role(auth.uid(), 'counselor'));

-- Login attempt log for rate limiting (no codes stored)
CREATE TABLE public.login_attempts (
  id bigserial PRIMARY KEY,
  account_key text NOT NULL,
  success boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.login_attempts TO service_role;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX login_attempts_key_time ON public.login_attempts (account_key, created_at);
