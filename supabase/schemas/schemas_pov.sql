-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create POVs table
CREATE TABLE pov (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_industry TEXT NOT NULL,
    customer_region TEXT NOT NULL,
    business_unit TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Key Business Services table
CREATE TABLE pov_key_business_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pov_id UUID REFERENCES pov(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_owner TEXT NOT NULL,
    desired_kpis TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create POV Decision Criteria table
CREATE TABLE pov_decision_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pov_id UUID REFERENCES pov(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    success_criteria TEXT NOT NULL,
    use_case TEXT NOT NULL,
    status TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Decision Criteria Activities table
CREATE TABLE pov_decision_criteria_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pov_decision_criteria_id UUID REFERENCES pov_decision_criteria(id) ON DELETE CASCADE,
    activity TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create POV Challenges table
CREATE TABLE pov_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pov_id UUID REFERENCES pov(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    challenge_description TEXT NOT NULL,
    business_impact TEXT NOT NULL,
    status TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Challenge Outcomes table
CREATE TABLE pov_challenge_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pov_challenge_id UUID REFERENCES pov_challenges(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Working Sessions table
CREATE TABLE pov_working_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pov_id UUID REFERENCES pov(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Session Activities table
CREATE TABLE pov_session_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES pov_working_sessions(id) ON DELETE CASCADE,
    decision_criteria_activity_id UUID REFERENCES pov_decision_criteria_activities(id),
    status TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Team Members table
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    organization TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create POV Team Members junction table
CREATE TABLE pov_team_members (
    pov_id UUID REFERENCES pov(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (pov_id, team_member_id)
);

-- Create Device Scopes table
CREATE TABLE pov_device_scopes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pov_id UUID REFERENCES pov(id) ON DELETE CASCADE,
    device_type TEXT NOT NULL,
    category TEXT NOT NULL,
    count INTEGER NOT NULL,
    specifications JSONB DEFAULT '{}',
    priority TEXT NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_key_business_services_pov_id ON pov_key_business_services(pov_id);
CREATE INDEX idx_pov_decision_criteria_pov_id ON pov_decision_criteria(pov_id);
CREATE INDEX idx_pov_decision_criteria_activities_dc_id ON pov_decision_criteria_activities(pov_decision_criteria_id);
CREATE INDEX idx_pov_challenges_pov_id ON pov_challenges(pov_id);
CREATE INDEX idx_pov_challenge_outcomes_challenge_id ON pov_challenge_outcomes(pov_challenge_id);
CREATE INDEX idx_pov_working_sessions_pov_id ON pov_working_sessions(pov_id);
CREATE INDEX idx_pov_session_activities_session_id ON pov_session_activities(session_id);
CREATE INDEX idx_pov_session_activities_activity_id ON pov_session_activities(decision_criteria_activity_id);
CREATE INDEX idx_pov_device_scopes_pov_id ON pov_device_scopes(pov_id);