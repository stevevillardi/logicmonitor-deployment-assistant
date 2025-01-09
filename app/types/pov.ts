// Core POV Interface
export interface POV {
    id: string;
    title: string;
    status: string;
    customer_name: string;
    customer_industry: string;
    customer_region: string;
    business_unit: string;
    start_date: string;
    end_date: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    key_business_services?: KeyBusinessService[];
    challenges?: POVChallenge[];
    team_members?: TeamMember[];
    device_scopes?: DeviceScope[];
    working_sessions?: WorkingSession[];
    decision_criteria?: POVDecisionCriteria[];
}

// Key Business Services
export interface KeyBusinessService {
    id: string;
    pov_id: string;
    name: string;
    description: string;
    tech_owner: string;
    desired_kpis: string[];
    created_at: string;
    created_by: string;
}

// Decision Criteria and Activities
export interface POVDecisionCriteria {
    id: string;
    pov_id: string;
    title: string;
    success_criteria: string;
    use_case: string;
    status: 'PENDING' | 'MET' | 'NOT_MET';
    created_by: string;
    created_at: string;
}

export interface DecisionCriteriaActivity {
    id: string;
    pov_decision_criteria_id: string;
    activity: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
    created_at: string;
}

// Challenges and Outcomes
export interface POVChallenge {
    id: string;
    pov_id: string;
    challenge_id?: string; // Reference to template challenge if using one
    title: string;
    challenge_description: string;
    business_impact: string;
    example?: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
    created_by: string;
    created_at: string;
    updated_at?: string;
    metadata?: Record<string, any>;
}

export interface ChallengeCategory {
    id: string;
    challenge_id: string;
    category: string;
}

export interface ChallengeOutcome {
    id: string;
    challenge_id: string;
    outcome: string;
    order_index: number;
}

// Working Sessions
export interface WorkingSession {
    id: string;
    pov_id: string;
    title: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    session_date: string;
    duration: number;
    notes?: string;
    created_by: string;
    created_at: string;
}

export interface SessionActivity {
    id: string;
    session_id: string;
    decision_criteria_activity_id: string; // Links to specific DC activity
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
    notes?: string;
    created_at: string;
}

// Team Members
export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    organization: 'INTERNAL' | 'CUSTOMER' | 'PARTNER';
    created_at: string;
}

export interface POVTeamMember {
    pov_id: string;
    team_member_id: string;
    created_at: string;
}

// Device Scope
export interface DeviceScope {
    id: string;
    pov_id: string;
    device_type: string;
    category: string;
    count: number;
    specifications: {
        os?: string;
        version?: string;
        architecture?: string;
        additional_details?: string;
    };
    priority: 'HIGH' | 'MEDIUM' | 'LOW' ;
    notes?: string;
    created_at: string;
    created_by: string;
}