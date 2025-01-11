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
    team_members?: POVTeamMemberWithDetails[];
    device_scopes?: DeviceScope[];
    working_sessions?: WorkingSession[];
    decision_criteria?: POVDecisionCriteria[];
    activities?: POVActivity[];
    documents?: POVDocument[];
    comments?: POVComment[];
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
    use_case?: string;
    status: string;
    created_by: string;
    created_at: string;
    categories?: POVDecisionCriteriaCategory[];
    activities?: POVDecisionCriteriaActivity[];
}

export interface POVDecisionCriteriaCategory {
    id: string;
    pov_decision_criteria_id: string;
    category: string;
    created_at: string;
}

export interface POVDecisionCriteriaActivity {
    id: string;
    pov_decision_criteria_id: string;
    activity: string;
    order_index: number;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
    created_at: string;
}

export interface DecisionCriteriaWithRelations extends Omit<Partial<POVDecisionCriteria>, 'categories' | 'activities'> {
    categories?: string[];
    activities?: Array<{
        id?: string;
        activity: string;
        order_index: number;
    }>;
}

export interface POVChallenge {
    id: string;
    pov_id: string;
    challenge_id: string;
    title: string;
    challenge_description: string;
    business_impact: string;
    example: string;
    categories?: POVChallengeCategory[];
    outcomes?: POVChallengeOutcome[];
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'UNABLE_TO_COMPLETE' | 'WAIVED';
    created_at: string;
}

export interface POVChallengeCategory {
    id: string;
    pov_challenge_id: string;
    category: string;
    created_at: string;
}

export interface POVChallengeOutcome {
    id: string;
    pov_challenge_id: string;
    outcome: string;
    order_index: number;
    created_at: string;
}

// Challenges and Outcomes
export interface Challenge {
    id: string;
    title: string;
    challenge_description: string;
    business_impact: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'UNABLE_TO_COMPLETE' | 'WAIVED';
    example: string;
    categories?: ChallengeCategory[];
    outcomes?: ChallengeOutcome[];
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
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
    session_activities?: SessionActivity[];
}

export interface SessionActivity {
    id?: string;
    decision_criteria_activity_id?: string;
    activity?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
    display_order: number;
    notes: string;
}

// Base team member interface (from team_members table)
export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    organization: 'LM' | 'CUSTOMER' | 'PARTNER';
    created_at: string;
}

// Junction table fields (from pov_team_members table)
export interface POVTeamMember {
    id: string;
    pov_id: string;
    team_member_id: string;
    name?: string;  // Optional override
    email?: string;  // Optional override
    role?: string;  // Optional override
    organization?: 'LM' | 'CUSTOMER' | 'PARTNER';  // Optional override
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
}

// Combined interface for team member with POV-specific data
export interface POVTeamMemberWithDetails extends POVTeamMember {
    team_member: TeamMember;  // Fall back to these values if no override
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
    status: 'NOT_ONBOARDED' | 'IN_PROGRESS' | 'ONBOARDED' | 'SKIPPED' | 'WAIVED';
    created_at: string;
    created_by: string;
}

export type ActivityType = 'CRITERIA' | 'SESSION' | 'CHALLENGE' | 'TEAM' | 'STATUS' | 'DOCUMENT' | 'COMMENT';

export interface POVActivity {
    id: string;
    pov_id: string;
    type: ActivityType;
    title: string;
    description: string;
    created_at: string;
    reference_id?: string;  // ID of the related item (criteria, session, etc)
    created_by: string;
    created_by_email: string;
}

export interface POVDocument {
    id: string;
    pov_id: string;
    name: string;
    description?: string;
    storage_path: string;  // Path in storage bucket
    file_type: string;
    file_size: number;
    bucket_id: string;
    created_at: string;
    created_by: string;
    created_by_email: string;
    updated_at: string;
}

export interface POVComment {
    id: string;
    pov_id: string;
    content: string;
    created_at: string;
    created_by: string;
    created_by_email: string;
    parent_id?: string;
    updated_at: string;
    replies?: POVComment[];
}