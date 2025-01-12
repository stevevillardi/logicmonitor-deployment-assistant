BEGIN;

CREATE TABLE IF NOT EXISTS public.challenge_categories
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    challenge_id uuid,
    category text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT challenge_categories_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.challenge_categories
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.challenge_outcomes
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    challenge_id uuid,
    outcome text COLLATE pg_catalog."default" NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT challenge_outcomes_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.challenge_outcomes
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.challenges
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text COLLATE pg_catalog."default" NOT NULL,
    challenge_description text COLLATE pg_catalog."default" NOT NULL,
    business_impact text COLLATE pg_catalog."default" NOT NULL,
    example text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    status content_status_type DEFAULT 'DRAFT'::content_status_type,
    is_template boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT challenges_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.challenges
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."dashboard-configs"
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    category text COLLATE pg_catalog."default" NOT NULL,
    filename text COLLATE pg_catalog."default" NOT NULL,
    path text COLLATE pg_catalog."default" NOT NULL,
    content jsonb,
    last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()),
    submitted_by text COLLATE pg_catalog."default",
    url text COLLATE pg_catalog."default",
    displayname text COLLATE pg_catalog."default",
    CONSTRAINT "dashboard-configs_pkey" PRIMARY KEY (id),
    CONSTRAINT "dashboard-configs_path_key" UNIQUE (path)
);

ALTER TABLE IF EXISTS public."dashboard-configs"
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.decision_criteria
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text COLLATE pg_catalog."default" NOT NULL,
    success_criteria text COLLATE pg_catalog."default" NOT NULL,
    use_case text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    status content_status_type DEFAULT 'DRAFT'::content_status_type,
    is_template boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT decision_criteria_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.decision_criteria
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.decision_criteria_activities
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    decision_criteria_id uuid,
    activity text COLLATE pg_catalog."default" NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT decision_criteria_activities_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.decision_criteria_activities
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.decision_criteria_categories
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    decision_criteria_id uuid,
    category text COLLATE pg_catalog."default" NOT NULL,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT decision_criteria_categories_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.decision_criteria_categories
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.deployments
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    config jsonb NOT NULL,
    sites jsonb NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT deployments_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.deployments
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public."lm-pages"
(
    url text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default",
    content text COLLATE pg_catalog."default",
    crawled_at timestamp with time zone NOT NULL DEFAULT now(),
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    embedding vector,
    type text COLLATE pg_catalog."default" DEFAULT 'URL Docs'::text,
    CONSTRAINT "lm-pages_pkey" PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public."lm-pages"
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text COLLATE pg_catalog."default" NOT NULL,
    status text COLLATE pg_catalog."default" NOT NULL,
    customer_name text COLLATE pg_catalog."default" NOT NULL,
    customer_industry text COLLATE pg_catalog."default" NOT NULL,
    customer_region text COLLATE pg_catalog."default" NOT NULL,
    business_unit text COLLATE pg_catalog."default",
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pov_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_activities
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_id uuid,
    type text COLLATE pg_catalog."default",
    title text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    reference_id uuid,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by_email text COLLATE pg_catalog."default",
    CONSTRAINT pov_activities_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_activities
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_challenge_categories
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_challenge_id uuid,
    category text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pov_challenge_categories_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_challenge_categories
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_challenge_outcomes
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_challenge_id uuid,
    outcome text COLLATE pg_catalog."default" NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pov_challenge_outcomes_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_challenge_outcomes
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_challenges
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_id uuid,
    title text COLLATE pg_catalog."default" NOT NULL,
    challenge_description text COLLATE pg_catalog."default" NOT NULL,
    business_impact text COLLATE pg_catalog."default" NOT NULL,
    status text COLLATE pg_catalog."default" NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    challenge_id uuid,
    example text COLLATE pg_catalog."default",
    metadata jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone,
    CONSTRAINT pov_challenges_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_challenges
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_comments
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_id uuid,
    content text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    created_by_email text COLLATE pg_catalog."default",
    parent_id uuid,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pov_comments_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_comments
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_decision_criteria
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_id uuid,
    title text COLLATE pg_catalog."default" NOT NULL,
    success_criteria text COLLATE pg_catalog."default" NOT NULL,
    use_case text COLLATE pg_catalog."default" NOT NULL,
    status text COLLATE pg_catalog."default" NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pov_decision_criteria_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_decision_criteria
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_decision_criteria_activities
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_decision_criteria_id uuid,
    activity text COLLATE pg_catalog."default" NOT NULL,
    status text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    order_index integer,
    CONSTRAINT pov_decision_criteria_activities_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_decision_criteria_activities
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_decision_criteria_categories
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_decision_criteria_id uuid NOT NULL,
    category text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT pov_decision_criteria_categories_pkey PRIMARY KEY (id),
    CONSTRAINT pov_decision_criteria_categor_pov_decision_criteria_id_cate_key UNIQUE (pov_decision_criteria_id, category)
);

ALTER TABLE IF EXISTS public.pov_decision_criteria_categories
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_device_scopes
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_id uuid,
    device_type text COLLATE pg_catalog."default" NOT NULL,
    category text COLLATE pg_catalog."default" NOT NULL,
    count integer NOT NULL,
    specifications jsonb DEFAULT '{}'::jsonb,
    priority text COLLATE pg_catalog."default" NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    status text COLLATE pg_catalog."default" NOT NULL DEFAULT 'NOT_ONBOARDED'::text,
    CONSTRAINT pov_device_scopes_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_device_scopes
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_documents
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_id uuid,
    name text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    file_type text COLLATE pg_catalog."default" NOT NULL,
    file_size integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    created_by_email text COLLATE pg_catalog."default",
    updated_at timestamp with time zone DEFAULT now(),
    storage_path text COLLATE pg_catalog."default" NOT NULL,
    bucket_id text COLLATE pg_catalog."default" NOT NULL DEFAULT 'pov-documents'::text,
    CONSTRAINT pov_documents_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_documents
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_key_business_services
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_id uuid,
    name text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    tech_owner text COLLATE pg_catalog."default" NOT NULL,
    desired_kpis text[] COLLATE pg_catalog."default" DEFAULT '{}'::text[],
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pov_key_business_services_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_key_business_services
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_session_activities
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    session_id uuid,
    decision_criteria_activity_id uuid,
    status text COLLATE pg_catalog."default" NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    display_order integer NOT NULL DEFAULT 0,
    activity text COLLATE pg_catalog."default",
    CONSTRAINT pov_session_activities_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_session_activities
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_team_members
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_id uuid,
    team_member_id uuid,
    name text COLLATE pg_catalog."default",
    email text COLLATE pg_catalog."default",
    role text COLLATE pg_catalog."default",
    organization text COLLATE pg_catalog."default",
    status text COLLATE pg_catalog."default" DEFAULT 'ACTIVE'::text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by uuid,
    updated_by uuid,
    CONSTRAINT pov_team_members_pkey PRIMARY KEY (id),
    CONSTRAINT pov_team_members_pov_id_team_member_id_key UNIQUE (pov_id, team_member_id)
);

ALTER TABLE IF EXISTS public.pov_team_members
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pov_working_sessions
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    pov_id uuid,
    title text COLLATE pg_catalog."default" NOT NULL,
    status text COLLATE pg_catalog."default" NOT NULL,
    session_date timestamp with time zone NOT NULL,
    duration integer NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT pov_working_sessions_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.pov_working_sessions
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.profiles
(
    id uuid NOT NULL,
    email text COLLATE pg_catalog."default",
    role text COLLATE pg_catalog."default",
    is_disabled boolean DEFAULT false,
    CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.profiles
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.profiles
    FORCE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.team_members
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default" NOT NULL,
    role text COLLATE pg_catalog."default" NOT NULL,
    organization text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT team_members_pkey PRIMARY KEY (id),
    CONSTRAINT team_members_email_key UNIQUE (email)
);

ALTER TABLE IF EXISTS public.team_members
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.challenge_categories
    ADD CONSTRAINT challenge_categories_challenge_id_fkey FOREIGN KEY (challenge_id)
    REFERENCES public.challenges (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_challenge_categories_challenge_id
    ON public.challenge_categories(challenge_id);


ALTER TABLE IF EXISTS public.challenge_outcomes
    ADD CONSTRAINT challenge_outcomes_challenge_id_fkey FOREIGN KEY (challenge_id)
    REFERENCES public.challenges (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_challenge_outcomes_fk
    ON public.challenge_outcomes(challenge_id);


ALTER TABLE IF EXISTS public.decision_criteria_activities
    ADD CONSTRAINT decision_criteria_activities_decision_criteria_id_fkey FOREIGN KEY (decision_criteria_id)
    REFERENCES public.decision_criteria (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_decision_criteria_activities_fk
    ON public.decision_criteria_activities(decision_criteria_id);


ALTER TABLE IF EXISTS public.decision_criteria_categories
    ADD CONSTRAINT decision_criteria_categories_decision_criteria_id_fkey FOREIGN KEY (decision_criteria_id)
    REFERENCES public.decision_criteria (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_decision_criteria_categories_decision_criteria_id
    ON public.decision_criteria_categories(decision_criteria_id);


ALTER TABLE IF EXISTS public.pov_activities
    ADD CONSTRAINT pov_activities_pov_id_fkey FOREIGN KEY (pov_id)
    REFERENCES public.pov (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS pov_activities_pov_id_idx
    ON public.pov_activities(pov_id);


ALTER TABLE IF EXISTS public.pov_challenge_categories
    ADD CONSTRAINT pov_challenge_categories_pov_challenge_id_fkey FOREIGN KEY (pov_challenge_id)
    REFERENCES public.pov_challenges (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.pov_challenge_outcomes
    ADD CONSTRAINT pov_challenge_outcomes_pov_challenge_id_fkey FOREIGN KEY (pov_challenge_id)
    REFERENCES public.pov_challenges (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_pov_challenge_outcomes_challenge_id
    ON public.pov_challenge_outcomes(pov_challenge_id);


ALTER TABLE IF EXISTS public.pov_challenges
    ADD CONSTRAINT pov_challenges_challenge_id_fkey FOREIGN KEY (challenge_id)
    REFERENCES public.challenges (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.pov_challenges
    ADD CONSTRAINT pov_challenges_pov_id_fkey FOREIGN KEY (pov_id)
    REFERENCES public.pov (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_pov_challenges_pov_id
    ON public.pov_challenges(pov_id);


ALTER TABLE IF EXISTS public.pov_comments
    ADD CONSTRAINT pov_comments_parent_id_fkey FOREIGN KEY (parent_id)
    REFERENCES public.pov_comments (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.pov_comments
    ADD CONSTRAINT pov_comments_pov_id_fkey FOREIGN KEY (pov_id)
    REFERENCES public.pov (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.pov_decision_criteria
    ADD CONSTRAINT pov_decision_criteria_pov_id_fkey FOREIGN KEY (pov_id)
    REFERENCES public.pov (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_pov_decision_criteria_pov_id
    ON public.pov_decision_criteria(pov_id);


ALTER TABLE IF EXISTS public.pov_decision_criteria_activities
    ADD CONSTRAINT pov_decision_criteria_activities_pov_decision_criteria_id_fkey FOREIGN KEY (pov_decision_criteria_id)
    REFERENCES public.pov_decision_criteria (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_pov_decision_criteria_activities_dc_id
    ON public.pov_decision_criteria_activities(pov_decision_criteria_id);


ALTER TABLE IF EXISTS public.pov_decision_criteria_categories
    ADD CONSTRAINT pov_decision_criteria_categories_pov_decision_criteria_id_fkey FOREIGN KEY (pov_decision_criteria_id)
    REFERENCES public.pov_decision_criteria (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_pov_decision_criteria_categories
    ON public.pov_decision_criteria_categories(pov_decision_criteria_id);


ALTER TABLE IF EXISTS public.pov_device_scopes
    ADD CONSTRAINT pov_device_scopes_pov_id_fkey FOREIGN KEY (pov_id)
    REFERENCES public.pov (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_pov_device_scopes_pov_id
    ON public.pov_device_scopes(pov_id);


ALTER TABLE IF EXISTS public.pov_documents
    ADD CONSTRAINT pov_documents_pov_id_fkey FOREIGN KEY (pov_id)
    REFERENCES public.pov (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.pov_key_business_services
    ADD CONSTRAINT pov_key_business_services_pov_id_fkey FOREIGN KEY (pov_id)
    REFERENCES public.pov (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_key_business_services_pov_id
    ON public.pov_key_business_services(pov_id);


ALTER TABLE IF EXISTS public.pov_session_activities
    ADD CONSTRAINT pov_session_activities_decision_criteria_activity_id_fkey FOREIGN KEY (decision_criteria_activity_id)
    REFERENCES public.pov_decision_criteria_activities (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS idx_pov_session_activities_activity_id
    ON public.pov_session_activities(decision_criteria_activity_id);


ALTER TABLE IF EXISTS public.pov_session_activities
    ADD CONSTRAINT pov_session_activities_session_id_fkey FOREIGN KEY (session_id)
    REFERENCES public.pov_working_sessions (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_pov_session_activities_session_id
    ON public.pov_session_activities(session_id);


ALTER TABLE IF EXISTS public.pov_team_members
    ADD CONSTRAINT pov_team_members_pov_id_fkey FOREIGN KEY (pov_id)
    REFERENCES public.pov (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.pov_team_members
    ADD CONSTRAINT pov_team_members_team_member_id_fkey FOREIGN KEY (team_member_id)
    REFERENCES public.team_members (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.pov_working_sessions
    ADD CONSTRAINT pov_working_sessions_pov_id_fkey FOREIGN KEY (pov_id)
    REFERENCES public.pov (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_pov_working_sessions_pov_id
    ON public.pov_working_sessions(pov_id);

END;