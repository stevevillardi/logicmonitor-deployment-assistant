-- ================================================
-- Deployments Table (public.deployments)
-- ================================================
DROP POLICY IF EXISTS "Users can view their own deployments" ON public.deployments;
DROP POLICY IF EXISTS "Users can insert their own deployments" ON public.deployments;
DROP POLICY IF EXISTS "Users can update their own deployments" ON public.deployments;
DROP POLICY IF EXISTS "Users can delete their own deployments" ON public.deployments;

CREATE POLICY "Users can view their own deployments" ON public.deployments
    FOR SELECT TO {authenticated}
    USING ((SELECT auth.uid() AS uid) = user_id)
    WITH CHECK (NULL);

CREATE POLICY "Users can insert their own deployments" ON public.deployments
    FOR INSERT TO {authenticated}
    USING (NULL)
    WITH CHECK ((SELECT auth.uid() AS uid) = user_id);

CREATE POLICY "Users can update their own deployments" ON public.deployments
    FOR UPDATE TO {authenticated}
    USING ((SELECT auth.uid() AS uid) = user_id)
    WITH CHECK (NULL);

CREATE POLICY "Users can delete their own deployments" ON public.deployments
    FOR DELETE TO {authenticated}
    USING ((SELECT auth.uid() AS uid) = user_id)
    WITH CHECK (NULL);

-- ================================================
-- POV Challenges Table (public.pov_challenges)
-- ================================================
DROP POLICY IF EXISTS "Users can manage challenges for their POVs" ON public.pov_challenges;
DROP POLICY IF EXISTS "Users can create challenges for their POVs" ON public.pov_challenges;
DROP POLICY IF EXISTS "Users can update challenges for their POVs" ON public.pov_challenges;

-- View policy - allows both owners and team members to view challenges
CREATE POLICY "Users can view challenges for their POVs" ON public.pov_challenges
    FOR SELECT TO authenticated
    USING (has_pov_access(pov_id));

-- Insert policy - allows both owners and team members to add challenges
CREATE POLICY "Users can create challenges for their POVs" ON public.pov_challenges
    FOR INSERT TO authenticated
    WITH CHECK (has_pov_access(pov_id));

-- Update policy - allows both owners and team members to update challenges
CREATE POLICY "Users can update challenges for their POVs" ON public.pov_challenges
    FOR UPDATE TO authenticated
    USING (has_pov_access(pov_id));

-- Delete policy - allows both owners and team members to delete challenges
CREATE POLICY "Users can delete challenges for their POVs" ON public.pov_challenges
    FOR DELETE TO authenticated
    USING (has_pov_access(pov_id));

-- ================================================
-- POV Working Sessions Table (public.pov_working_sessions)
-- ================================================
DROP POLICY IF EXISTS "Users can manage working sessions for their POVs" ON public.pov_working_sessions;
DROP POLICY IF EXISTS "Users can create working sessions for their POVs" ON public.pov_working_sessions;

-- View policy - allows both owners and team members to view sessions
CREATE POLICY "Users can view working sessions" ON public.pov_working_sessions
    FOR SELECT TO authenticated
    USING (has_pov_access(pov_id));

-- Insert policy - allows both owners and team members to create sessions
CREATE POLICY "Users can create working sessions" ON public.pov_working_sessions
    FOR INSERT TO authenticated
    WITH CHECK (has_pov_access(pov_id));

-- Update policy - allows both owners and team members to update sessions
CREATE POLICY "Users can update working sessions" ON public.pov_working_sessions
    FOR UPDATE TO authenticated
    USING (has_pov_access(pov_id));

-- Delete policy - allows both owners and team members to delete sessions
CREATE POLICY "Users can delete working sessions" ON public.pov_working_sessions
    FOR DELETE TO authenticated
    USING (has_pov_access(pov_id));

-- ================================================
-- Team Members Table (public.team_members)
-- ================================================
ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read team members
CREATE POLICY "Enable read access for all users" ON public.team_members
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users to create new team members
CREATE POLICY "Enable insert for authenticated users" ON public.team_members
    FOR INSERT TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update team members they created
CREATE POLICY "Enable update for creators" ON public.team_members
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Allow users to delete team members they created
CREATE POLICY "Enable delete for creators" ON public.team_members
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

-- ================================================
-- POV Documents Table (public.pov_documents)
-- ================================================
DROP POLICY IF EXISTS "Users can view documents if they have POV access" ON public.pov_documents;
DROP POLICY IF EXISTS "Users can insert documents if they have POV access" ON public.pov_documents;
DROP POLICY IF EXISTS "Users can update documents if they have POV access" ON public.pov_documents;
DROP POLICY IF EXISTS "Users can delete documents if they have POV access" ON public.pov_documents;

-- View policy - allows both owners and team members to view documents
CREATE POLICY "Users can view documents if they have POV access" ON public.pov_documents
    FOR SELECT TO authenticated
    USING (has_pov_access(pov_id));

-- Insert policy - allows both owners and team members to add documents
CREATE POLICY "Users can insert documents if they have POV access" ON public.pov_documents
    FOR INSERT TO authenticated
    WITH CHECK (has_pov_access(pov_id));

-- Update policy - allows both owners and team members to update documents
CREATE POLICY "Users can update documents if they have POV access" ON public.pov_documents
    FOR UPDATE TO authenticated
    USING (has_pov_access(pov_id));

-- Delete policy - allows both owners and team members to delete documents
CREATE POLICY "Users can delete documents if they have POV access" ON public.pov_documents
    FOR DELETE TO authenticated
    USING (has_pov_access(pov_id));

-- ================================================
-- Device Scopes Table (public.pov_device_scopes)
-- ================================================
DROP POLICY IF EXISTS "Users can manage device scopes for their POVs" ON public.pov_device_scopes;

-- View policy - allows both owners and team members to view device scopes
CREATE POLICY "Users can view device scopes" ON public.pov_device_scopes
    FOR SELECT TO authenticated
    USING (has_pov_access(pov_id));

-- Insert policy - allows both owners and team members to add device scopes
CREATE POLICY "Users can create device scopes" ON public.pov_device_scopes
    FOR INSERT TO authenticated
    WITH CHECK (has_pov_access(pov_id));

-- Update policy - allows both owners and team members to update device scopes
CREATE POLICY "Users can update device scopes" ON public.pov_device_scopes
    FOR UPDATE TO authenticated
    USING (has_pov_access(pov_id));

-- Delete policy - allows both owners and team members to delete device scopes
CREATE POLICY "Users can delete device scopes" ON public.pov_device_scopes
    FOR DELETE TO authenticated
    USING (has_pov_access(pov_id));

-- ================================================
-- Session Activities Table (public.pov_session_activities)
-- ================================================
DROP POLICY IF EXISTS "Users can manage session activities" ON public.pov_session_activities;

-- View policy - allows both owners and team members to view activities
CREATE POLICY "Users can view session activities" ON public.pov_session_activities
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1
        FROM pov_working_sessions ws
        WHERE ws.id = session_id
        AND has_pov_access(ws.pov_id)
    ));

-- Insert policy - allows both owners and team members to add activities
CREATE POLICY "Users can create session activities" ON public.pov_session_activities
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1
        FROM pov_working_sessions ws
        WHERE ws.id = session_id
        AND has_pov_access(ws.pov_id)
    ));

-- Update policy - allows both owners and team members to update activities
CREATE POLICY "Users can update session activities" ON public.pov_session_activities
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1
        FROM pov_working_sessions ws
        WHERE ws.id = session_id
        AND has_pov_access(ws.pov_id)
    ));

-- Delete policy - allows both owners and team members to delete activities
CREATE POLICY "Users can delete session activities" ON public.pov_session_activities
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1
        FROM pov_working_sessions ws
        WHERE ws.id = session_id
        AND has_pov_access(ws.pov_id)
    ));

-- ================================================
-- POV Challenge Outcomes Table (public.pov_challenge_outcomes)
-- ================================================
DROP POLICY IF EXISTS "Users can manage challenge outcomes" ON public.pov_challenge_outcomes;

-- View policy - allows both owners and team members to view outcomes
CREATE POLICY "Users can view challenge outcomes" ON public.pov_challenge_outcomes
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1
        FROM pov_challenges pc
        WHERE pc.id = pov_challenge_id
        AND has_pov_access(pc.pov_id)
    ));

-- Insert policy - allows both owners and team members to add outcomes
CREATE POLICY "Users can create challenge outcomes" ON public.pov_challenge_outcomes
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1
        FROM pov_challenges pc
        WHERE pc.id = pov_challenge_id
        AND has_pov_access(pc.pov_id)
    ));

-- Update policy - allows both owners and team members to update outcomes
CREATE POLICY "Users can update challenge outcomes" ON public.pov_challenge_outcomes
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1
        FROM pov_challenges pc
        WHERE pc.id = pov_challenge_id
        AND has_pov_access(pc.pov_id)
    ));

-- Delete policy - allows both owners and team members to delete outcomes
CREATE POLICY "Users can delete challenge outcomes" ON public.pov_challenge_outcomes
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1
        FROM pov_challenges pc
        WHERE pc.id = pov_challenge_id
        AND has_pov_access(pc.pov_id)
    ));


-- ================================================
-- Storage Objects Table (storage.objects)
-- ================================================
DROP POLICY IF EXISTS "Users can view documents if they have POV access" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert documents if they have POV access" ON storage.objects;
DROP POLICY IF EXISTS "Users can update documents if they have POV access" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete documents if they have POV access" ON storage.objects;

-- View policy - allows both owners and team members to view documents
CREATE POLICY "Users can view documents if they have POV access" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'pov-documents'::text 
    AND has_pov_access((storage.foldername(name))[1]::uuid));

-- Insert policy - allows both owners and team members to add documents
CREATE POLICY "Users can insert documents if they have POV access" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'pov-documents'::text 
    AND has_pov_access((storage.foldername(name))[1]::uuid));

-- Update policy - allows both owners and team members to update documents
CREATE POLICY "Users can update documents if they have POV access" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'pov-documents'::text 
    AND has_pov_access((storage.foldername(name))[1]::uuid));

-- Delete policy - allows both owners and team members to delete documents
CREATE POLICY "Users can delete documents if they have POV access" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'pov-documents'::text 
    AND has_pov_access((storage.foldername(name))[1]::uuid));

-- ================================================
-- Key Business Services Table (public.pov_key_business_services)
-- ================================================
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.pov_key_business_services;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.pov_key_business_services;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.pov_key_business_services;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.pov_key_business_services;

-- View policy - allows both owners and team members to view services
CREATE POLICY "Users can view key business services" ON public.pov_key_business_services
    FOR SELECT TO authenticated
    USING (has_pov_access(pov_id));

-- Insert policy - allows both owners and team members to add services
CREATE POLICY "Users can create key business services" ON public.pov_key_business_services
    FOR INSERT TO authenticated
    WITH CHECK (has_pov_access(pov_id));

-- Update policy - allows both owners and team members to update services
CREATE POLICY "Users can update key business services" ON public.pov_key_business_services
    FOR UPDATE TO authenticated
    USING (has_pov_access(pov_id));

-- Delete policy - allows both owners and team members to delete services
CREATE POLICY "Users can delete key business services" ON public.pov_key_business_services
    FOR DELETE TO authenticated
    USING (has_pov_access(pov_id));

-- ================================================
-- Comments Table (public.pov_comments)
-- ================================================
DROP POLICY IF EXISTS "Users can view comments if they have POV access" ON public.pov_comments;
DROP POLICY IF EXISTS "Users can insert comments if they have POV access" ON public.pov_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.pov_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.pov_comments;

-- View policy - allows both owners and team members to view comments
CREATE POLICY "Users can view comments if they have POV access" ON public.pov_comments
    FOR SELECT TO authenticated
    USING (has_pov_access(pov_id));


-- Insert policy - allows both owners and team members to add comments
CREATE POLICY "Users can insert comments if they have POV access" ON public.pov_comments
    FOR INSERT TO authenticated
    WITH CHECK (has_pov_access(pov_id));

-- Update policy - allows users to update only their own comments, but must still have POV access
CREATE POLICY "Users can update their own comments" ON public.pov_comments
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = created_by 
        AND has_pov_access(pov_id)
    );

-- Delete policy - allows users to delete only their own comments, but must still have POV access
CREATE POLICY "Users can delete their own comments" ON public.pov_comments
    FOR DELETE TO authenticated
    USING (
        auth.uid() = created_by 
        AND has_pov_access(pov_id)
    );



-- ================================================
-- POV Challenge Categories Table (public.pov_challenge_categories)
-- ================================================
DROP POLICY IF EXISTS "Read pov_challenge_categories if user created" ON public.pov_challenge_categories;
DROP POLICY IF EXISTS "Insert pov_challenge_categories if user created" ON public.pov_challenge_categories;
DROP POLICY IF EXISTS "Delete pov_challenge_categories if user created" ON public.pov_challenge_categories;

-- View policy - allows both owners and team members to view categories
CREATE POLICY "Users can view challenge categories" ON public.pov_challenge_categories
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM pov_challenges pc
        WHERE pc.id = pov_challenge_id
        AND has_pov_access(pc.pov_id)
    ));

-- Insert policy - allows both owners and team members to add categories
CREATE POLICY "Users can create challenge categories" ON public.pov_challenge_categories
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM pov_challenges pc
        WHERE pc.id = pov_challenge_id
        AND has_pov_access(pc.pov_id)
    ));

-- Delete policy - allows both owners and team members to delete categories
CREATE POLICY "Users can delete challenge categories" ON public.pov_challenge_categories
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM pov_challenges pc
        WHERE pc.id = pov_challenge_id
        AND has_pov_access(pc.pov_id)
    ));

-- ================================================
-- Dashboard Configs Table (public.dashboard-configs)
-- ================================================
DROP POLICY IF EXISTS "Allow users read access all dashboards" ON public.dashboard-configs;
DROP POLICY IF EXISTS "Allow users to delete own dashboards" ON public.dashboard-configs;
DROP POLICY IF EXISTS "Allow authenticated users to insert dashboards" ON public.dashboard-configs;
DROP POLICY IF EXISTS "Allow users to update own dashboards" ON public.dashboard-configs;
DROP POLICY IF EXISTS "Allow UPSERT for cron job" ON public.dashboard-configs;

CREATE POLICY "Allow users read access all dashboards" ON public.dashboard-configs
    FOR SELECT TO {authenticated}
    USING (true)
    WITH CHECK (NULL);

CREATE POLICY "Allow authenticated users to insert dashboards" ON public.dashboard-configs
    FOR INSERT TO {authenticated}
    USING (NULL)
    WITH CHECK (((SELECT auth.uid() AS uid) IS NOT NULL) AND (submitted_by = ((SELECT auth.jwt() AS jwt) ->> 'email'::text)));

CREATE POLICY "Allow users to update own dashboards" ON public.dashboard-configs
    FOR UPDATE TO {authenticated}
    USING (submitted_by = ((SELECT auth.jwt() AS jwt) ->> 'email'::text));

CREATE POLICY "Allow users to delete own dashboards" ON public.dashboard-configs
    FOR DELETE TO {authenticated}
    USING (submitted_by = ((SELECT auth.jwt() AS jwt) ->> 'email'::text))
    WITH CHECK (NULL);

CREATE POLICY "Allow UPSERT for cron job" ON public.dashboard-configs
    FOR ALL TO {anon,service_role}
    USING (true)
    WITH CHECK (NULL);

-- ================================================
-- POV Team Members Table (public.pov_team_members)
-- ================================================
DROP POLICY IF EXISTS "Users can view team members of POVs they have access to" ON public.pov_team_members;
DROP POLICY IF EXISTS "Users can insert team members for POVs they own" ON public.pov_team_members;
DROP POLICY IF EXISTS "Users can update team members for POVs they own" ON public.pov_team_members;
DROP POLICY IF EXISTS "Users can delete team members from POVs they own" ON public.pov_team_members;

-- View policy - allows both owners and team members to view team members
CREATE POLICY "Users can view team members of POVs they have access to" ON public.pov_team_members
    FOR SELECT TO authenticated
    USING (has_pov_access(pov_id));

-- Insert policy - POV owners can add team members OR users can add themselves during POV creation
CREATE POLICY "Users can insert team members for POVs they own or during creation" ON public.pov_team_members
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM pov
            WHERE pov.id = pov_id
            AND pov.created_by = auth.uid()
        )
        OR 
        (
            -- Allow users to add themselves during POV creation
            EXISTS (
                SELECT 1 FROM pov
                WHERE pov.id = pov_id
                AND pov.created_by = auth.uid()
                AND created_by = auth.uid()
            )
        )
    );

-- Update policy - only POV owners can update team members
CREATE POLICY "Users can update team members for POVs they own" ON public.pov_team_members
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM pov
        WHERE pov.id = pov_id
        AND pov.created_by = auth.uid()
    ));

-- Delete policy - only POV owners can remove team members
CREATE POLICY "Users can delete team members from POVs they own" ON public.pov_team_members
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM pov
        WHERE pov.id = pov_id
        AND pov.created_by = auth.uid()
    ));

-- ================================================
-- LM Pages Table (public.lm-pages)
-- ================================================
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.lm-pages;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.lm-pages;
DROP POLICY IF EXISTS "Allow service role full access" ON public.lm-pages;

CREATE POLICY "Allow anonymous read access" ON public.lm-pages
    FOR SELECT TO {anon}
    USING (true)
    WITH CHECK (NULL);

CREATE POLICY "Allow authenticated read access" ON public.lm-pages
    FOR SELECT TO {authenticated}
    USING (true)
    WITH CHECK (NULL);

CREATE POLICY "Allow service role full access" ON public.lm-pages
    FOR ALL TO {service_role}
    USING (true);

-- ================================================
-- POV Activities Table (public.pov_activities)
-- ================================================
DROP POLICY IF EXISTS "Users can view activities for POVs they have access to" ON public.pov_activities;
DROP POLICY IF EXISTS "Users can insert activities for POVs they have access to" ON public.pov_activities;
DROP POLICY IF EXISTS "Users can delete activities from POVs they have access to" ON public.pov_activities;

-- View policy - allows both owners and team members to view activities
CREATE POLICY "Users can view activities for POVs they have access to" ON public.pov_activities
    FOR SELECT TO authenticated
    USING (has_pov_access(pov_id));

-- Insert policy - allows both owners and team members to add activities
CREATE POLICY "Users can insert activities for POVs they have access to" ON public.pov_activities
    FOR INSERT TO authenticated
    WITH CHECK (has_pov_access(pov_id));

-- Delete policy - allows both owners and team members to delete activities
CREATE POLICY "Users can delete activities from POVs they have access to" ON public.pov_activities
    FOR DELETE TO authenticated
    USING (has_pov_access(pov_id));

-- ================================================
-- Challenges Table (public.challenges)
-- ================================================
DROP POLICY IF EXISTS "Users can update their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON public.challenges;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.challenges;
DROP POLICY IF EXISTS "Users can delete their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can view their own challenges" ON public.challenges;

CREATE POLICY "Enable read access for all users" ON public.challenges
    FOR SELECT TO {authenticated}
    USING (true)
    WITH CHECK (NULL);

CREATE POLICY "Users can create challenges" ON public.challenges
    FOR INSERT TO {authenticated}
    USING (NULL)
    WITH CHECK ((SELECT auth.role() AS role) = 'authenticated'::text);

CREATE POLICY "Users can update their own challenges" ON public.challenges
    FOR UPDATE TO {authenticated}
    USING ((SELECT auth.uid() AS uid) = created_by)
    WITH CHECK (NULL);

CREATE POLICY "Users can delete their own challenges" ON public.challenges
    FOR DELETE TO {authenticated}
    USING ((SELECT auth.uid() AS uid) = created_by)
    WITH CHECK (NULL);

CREATE POLICY "Users can view their own challenges" ON public.challenges
    FOR SELECT TO {authenticated}
    USING ((SELECT auth.uid() AS uid) = created_by)
    WITH CHECK (NULL);


-- ================================================
-- Challenge Categories Table (public.challenge_categories)
-- ================================================
DROP POLICY IF EXISTS "Users can manage their own challenge categories" ON public.challenge_categories;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.challenge_categories;

CREATE POLICY "Enable read access for all users" ON public.challenge_categories
    FOR SELECT TO {authenticated}
    USING (true)
    WITH CHECK (NULL);

CREATE POLICY "Users can manage their own challenge categories" ON public.challenge_categories
    FOR ALL TO {authenticated}
    USING ((SELECT auth.uid() AS uid) = created_by)
    WITH CHECK (NULL);

-- ================================================
-- Challenge Outcomes Table (public.challenge_outcomes)
-- ================================================
DROP POLICY IF EXISTS "Users can manage their own outcomes" ON public.challenge_outcomes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.challenge_outcomes;

CREATE POLICY "Enable read access for all users" ON public.challenge_outcomes
    FOR SELECT TO {authenticated}
    USING (true)
    WITH CHECK (NULL);

CREATE POLICY "Users can manage their own outcomes" ON public.challenge_outcomes
    FOR ALL TO {authenticated}
    USING ((SELECT auth.uid() AS uid) = created_by)
    WITH CHECK (NULL);

-- ================================================
-- POV Table (public.pov)
-- ================================================
DROP POLICY IF EXISTS "Users can update their own POVs" ON public.pov;
DROP POLICY IF EXISTS "Users can delete their own POVs" ON public.pov;
DROP POLICY IF EXISTS "Users can create POVs" ON public.pov;
DROP POLICY IF EXISTS "Users can view POVs they created or are team members of" ON public.pov;

-- View policy - allows both owners and team members to view
CREATE POLICY "Users can view POVs they created or are team members of" ON public.pov
    FOR SELECT TO authenticated
    USING (has_pov_access(id));

-- Create policy - any authenticated user can create a POV
CREATE POLICY "Users can create POVs" ON public.pov
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Update policy - only POV owner can update
CREATE POLICY "Users can update their own POVs" ON public.pov
    FOR UPDATE TO authenticated
    USING (auth.uid() = created_by);

-- Delete policy - only POV owner can delete
CREATE POLICY "Users can delete their own POVs" ON public.pov
    FOR DELETE TO authenticated
    USING (auth.uid() = created_by);

-- ================================================
-- Profiles Table (public.profiles)
-- ================================================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read of all profiles for admin role" ON public.profiles;

CREATE POLICY "Enable read access for all users" ON public.profiles
    FOR SELECT TO {authenticated}
    USING ((SELECT auth.uid() AS uid) = id)
    WITH CHECK (NULL);

CREATE POLICY "Enable read of all profiles for admin role" ON public.profiles
    FOR SELECT TO {authenticated}
    USING (is_admin((SELECT auth.uid() AS uid)))
    WITH CHECK (NULL);

CREATE POLICY "Allow admins to insert profiles" ON public.profiles
    FOR INSERT TO {authenticated}
    USING (NULL)
    WITH CHECK (is_admin((SELECT auth.uid() AS uid)));

CREATE POLICY "Allow admins to update profiles" ON public.profiles
    FOR UPDATE TO {authenticated}
    USING (is_admin((SELECT auth.uid() AS uid)))
    WITH CHECK (NULL);

CREATE POLICY "Allow admins to delete profiles" ON public.profiles
    FOR DELETE TO {authenticated}
    USING (is_admin((SELECT auth.uid() AS uid)))
    WITH CHECK (NULL);

-- ================================================
-- POV Decision Criteria Table (public.pov_decision_criteria)
-- ================================================
DROP POLICY IF EXISTS "Users can manage decision criteria for their POVs" ON public.pov_decision_criteria;
DROP POLICY IF EXISTS "Users can create decision criteria for their POVs" ON public.pov_decision_criteria;
DROP POLICY IF EXISTS "Users can update decision criteria for their POVs" ON public.pov_decision_criteria;

-- View policy - allows both owners and team members to view criteria
CREATE POLICY "Users can view decision criteria" ON public.pov_decision_criteria
    FOR SELECT TO authenticated
    USING (has_pov_access(pov_id));

-- Insert policy - allows both owners and team members to add criteria
CREATE POLICY "Users can create decision criteria" ON public.pov_decision_criteria
    FOR INSERT TO authenticated
    WITH CHECK (has_pov_access(pov_id));

-- Update policy - allows both owners and team members to update criteria
CREATE POLICY "Users can update decision criteria" ON public.pov_decision_criteria
    FOR UPDATE TO authenticated
    USING (has_pov_access(pov_id));

-- Delete policy - allows both owners and team members to delete criteria
CREATE POLICY "Users can delete decision criteria" ON public.pov_decision_criteria
    FOR DELETE TO authenticated
    USING (has_pov_access(pov_id));

-- ================================================
-- POV Decision Criteria Activities Table (public.pov_decision_criteria_activities)
-- ================================================
DROP POLICY IF EXISTS "Users can manage decision criteria activities" ON public.pov_decision_criteria_activities;

-- View policy - allows both owners and team members to view activities
CREATE POLICY "Users can view decision criteria activities" ON public.pov_decision_criteria_activities
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1
        FROM pov_decision_criteria pdc
        WHERE pdc.id = pov_decision_criteria_id
        AND has_pov_access(pdc.pov_id)
    ));

-- Insert policy - allows both owners and team members to add activities
CREATE POLICY "Users can create decision criteria activities" ON public.pov_decision_criteria_activities
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1
        FROM pov_decision_criteria pdc
        WHERE pdc.id = pov_decision_criteria_id
        AND has_pov_access(pdc.pov_id)
    ));

-- Update policy - allows both owners and team members to update activities
CREATE POLICY "Users can update decision criteria activities" ON public.pov_decision_criteria_activities
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1
        FROM pov_decision_criteria pdc
        WHERE pdc.id = pov_decision_criteria_id
        AND has_pov_access(pdc.pov_id)
    ));

-- Delete policy - allows both owners and team members to delete activities
CREATE POLICY "Users can delete decision criteria activities" ON public.pov_decision_criteria_activities
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1
        FROM pov_decision_criteria pdc
        WHERE pdc.id = pov_decision_criteria_id
        AND has_pov_access(pdc.pov_id)
    ));

-- ================================================
-- POV Decision Criteria Categories Table (public.pov_decision_criteria_categories)
-- ================================================
DROP POLICY IF EXISTS "Read pov_decision_criteria_categories if user created" ON public.pov_decision_criteria_categories;
DROP POLICY IF EXISTS "Insert pov_decision_criteria_categories if user created" ON public.pov_decision_criteria_categories;
DROP POLICY IF EXISTS "Delete pov_decision_criteria_categories if user created" ON public.pov_decision_criteria_categories;

-- View policy - allows both owners and team members to view categories
CREATE POLICY "Users can view decision criteria categories" ON public.pov_decision_criteria_categories
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM pov_decision_criteria pdc
        WHERE pdc.id = pov_decision_criteria_id
        AND has_pov_access(pdc.pov_id)
    ));

-- Insert policy - allows both owners and team members to add categories
CREATE POLICY "Users can create decision criteria categories" ON public.pov_decision_criteria_categories
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM pov_decision_criteria pdc
        WHERE pdc.id = pov_decision_criteria_id
        AND has_pov_access(pdc.pov_id)
    ));

-- Delete policy - allows both owners and team members to delete categories
CREATE POLICY "Users can delete decision criteria categories" ON public.pov_decision_criteria_categories
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM pov_decision_criteria pdc
        WHERE pdc.id = pov_decision_criteria_id
        AND has_pov_access(pdc.pov_id)
    ));

-- ================================================
-- Decision Criteria Table (public.decision_criteria)
-- ================================================
ALTER TABLE "public"."decision_criteria" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.decision_criteria
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can create decision criteria" ON public.decision_criteria
    FOR INSERT TO authenticated
    USING (NULL)
    WITH CHECK ((SELECT auth.role() AS role) = 'authenticated'::text);

CREATE POLICY "Users can update their own decision criteria" ON public.decision_criteria
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid() AS uid) = created_by);

CREATE POLICY "Users can delete their own decision criteria" ON public.decision_criteria
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid() AS uid) = created_by);

-- ================================================
-- Decision Criteria Categories Table (public.decision_criteria_categories)
-- ================================================
ALTER TABLE "public"."decision_criteria_categories" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.decision_criteria_categories
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can manage their own categories" ON public.decision_criteria_categories
    FOR ALL TO authenticated
    USING ((SELECT auth.uid() AS uid) = created_by);

-- ================================================
-- Decision Criteria Activities Table (public.decision_criteria_activities)
-- ================================================
ALTER TABLE "public"."decision_criteria_activities" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.decision_criteria_activities
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Users can manage their own activities" ON public.decision_criteria_activities
    FOR ALL TO authenticated
    USING ((SELECT auth.uid() AS uid) = created_by);
