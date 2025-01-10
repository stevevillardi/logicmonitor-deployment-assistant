-- Drop existing policies
DROP POLICY IF EXISTS "Users can view POVs they created" ON pov;
DROP POLICY IF EXISTS "Users can create POVs" ON pov;
DROP POLICY IF EXISTS "Users can update their own POVs" ON pov;
DROP POLICY IF EXISTS "Users can delete their own POVs" ON pov;
DROP POLICY IF EXISTS "Team members can view POVs" ON pov;
DROP POLICY IF EXISTS "Users can view POVs they created or are team members of" ON pov;

DROP POLICY IF EXISTS "Users can view KBS for their POVs" ON pov_key_business_services;
DROP POLICY IF EXISTS "Users can manage KBS for their POVs" ON pov_key_business_services;

DROP POLICY IF EXISTS "Users can view decision criteria for their POVs" ON pov_decision_criteria;
DROP POLICY IF EXISTS "Users can manage decision criteria for their POVs" ON pov_decision_criteria;

DROP POLICY IF EXISTS "Users can view challenges for their POVs" ON pov_challenges;
DROP POLICY IF EXISTS "Users can manage challenges for their POVs" ON pov_challenges;

DROP POLICY IF EXISTS "Users can view working sessions for their POVs" ON pov_working_sessions;
DROP POLICY IF EXISTS "Users can manage working sessions for their POVs" ON pov_working_sessions;

DROP POLICY IF EXISTS "Users can view team members for their POVs" ON pov_team_members;
DROP POLICY IF EXISTS "Users can manage team members for their POVs" ON pov_team_members;

DROP POLICY IF EXISTS "Users can view device scopes for their POVs" ON pov_device_scopes;
DROP POLICY IF EXISTS "Users can manage device scopes for their POVs" ON pov_device_scopes;

-- Drop additional policies
DROP POLICY IF EXISTS "Users can view session activities" ON pov_session_activities;
DROP POLICY IF EXISTS "Users can manage session activities" ON pov_session_activities;

DROP POLICY IF EXISTS "Users can view challenge outcomes" ON pov_challenge_outcomes;
DROP POLICY IF EXISTS "Users can manage challenge outcomes" ON pov_challenge_outcomes;

DROP POLICY IF EXISTS "Users can view decision criteria activities" ON pov_decision_criteria_activities;
DROP POLICY IF EXISTS "Users can manage decision criteria activities" ON pov_decision_criteria_activities;

DROP POLICY IF EXISTS "Users can view team members" ON team_members;
DROP POLICY IF EXISTS "Users can manage team members" ON team_members;
DROP POLICY IF EXISTS "Users can view team member assignments" ON pov_team_members;
DROP POLICY IF EXISTS "Users can manage team member assignments" ON pov_team_members;

DROP POLICY IF EXISTS "Users can view device scopes for their POVs" ON pov_device_scopes;
DROP POLICY IF EXISTS "Users can manage device scopes for their POVs" ON pov_device_scopes;

-- Enable RLS on tables
ALTER TABLE pov ENABLE ROW LEVEL SECURITY;
ALTER TABLE pov_key_business_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pov_decision_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE pov_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE pov_working_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pov_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pov_device_scopes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on additional tables
ALTER TABLE pov_session_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pov_challenge_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pov_decision_criteria_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- POV table policies
CREATE POLICY "Users can view POVs they created or are team members of"
  ON pov
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = created_by
    OR EXISTS (
      SELECT 1 FROM pov_team_members ptm
      JOIN team_members tm ON tm.id = ptm.team_member_id
      WHERE ptm.pov_id = pov.id
      AND tm.email = auth.email()
    )
  );

CREATE POLICY "Users can create POVs"
  ON pov
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = created_by
    AND EXISTS (SELECT 1 FROM auth.users WHERE (SELECT auth.uid()) = id)
  );

CREATE POLICY "Users can update their own POVs"
  ON pov
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = created_by)
  WITH CHECK ((SELECT auth.uid()) = created_by);

CREATE POLICY "Users can delete their own POVs"
  ON pov
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = created_by);

-- Key Business Services policies
CREATE POLICY "Users can view KBS for their POVs"
  ON pov_key_business_services
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND (
        pov.created_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM pov_team_members ptm
          JOIN team_members tm ON tm.id = ptm.team_member_id
          WHERE ptm.pov_id = pov.id
          AND tm.email = auth.email()
        )
      )
    )
  );

CREATE POLICY "Users can manage KBS for their POVs"
  ON pov_key_business_services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND pov.created_by = (SELECT auth.uid())
    )
  );

-- Decision Criteria policies
CREATE POLICY "Users can view decision criteria for their POVs"
  ON pov_decision_criteria
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND (
        pov.created_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM pov_team_members ptm
          JOIN team_members tm ON tm.id = ptm.team_member_id
          WHERE ptm.pov_id = pov.id
          AND tm.email = auth.email()
        )
      )
    )
  );

CREATE POLICY "Users can manage decision criteria for their POVs"
  ON pov_decision_criteria
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND pov.created_by = (SELECT auth.uid())
    )
  );

-- Challenges policies
CREATE POLICY "Users can view challenges for their POVs"
  ON pov_challenges
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND (
        pov.created_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM pov_team_members ptm
          JOIN team_members tm ON tm.id = ptm.team_member_id
          WHERE ptm.pov_id = pov.id
          AND tm.email = auth.email()
        )
      )
    )
  );

CREATE POLICY "Users can manage challenges for their POVs"
  ON pov_challenges
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND pov.created_by = (SELECT auth.uid())
    )
  );

-- Working Sessions policies
CREATE POLICY "Users can view working sessions for their POVs"
  ON pov_working_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND (
        pov.created_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM pov_team_members ptm
          JOIN team_members tm ON tm.id = ptm.team_member_id
          WHERE ptm.pov_id = pov.id
          AND tm.email = auth.email()
        )
      )
    )
  );

CREATE POLICY "Users can manage working sessions for their POVs"
  ON pov_working_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND pov.created_by = (SELECT auth.uid())
    )
  );

-- Team Members policies
CREATE POLICY "Users can view team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);  -- All authenticated users can view team members

CREATE POLICY "Users can manage team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.created_by = (SELECT auth.uid())
      AND EXISTS (
        SELECT 1 FROM pov_team_members
        WHERE pov_team_members.pov_id = pov.id
        AND pov_team_members.team_member_id = team_members.id
      )
    )
  );

-- POV Team Members table policies
CREATE POLICY "Users can view team member assignments"
  ON pov_team_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND (pov.created_by = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can manage team member assignments"
  ON pov_team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND pov.created_by = (SELECT auth.uid())
    )
  );

-- Device Scope policies
CREATE POLICY "Users can view device scopes for their POVs"
  ON pov_device_scopes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND (
        pov.created_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM pov_team_members ptm
          JOIN team_members tm ON tm.id = ptm.team_member_id
          WHERE ptm.pov_id = pov.id
          AND tm.email = auth.email()
        )
      )
    )
  );

CREATE POLICY "Users can manage device scopes for their POVs"
  ON pov_device_scopes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov
      WHERE pov.id = pov_id
      AND pov.created_by = (SELECT auth.uid())
    )
  );

-- Session Activities policies
CREATE POLICY "Users can view session activities"
  ON pov_session_activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov_working_sessions ws
      JOIN pov ON pov.id = ws.pov_id
      WHERE ws.id = session_id
      AND (
        pov.created_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM pov_team_members ptm
          JOIN team_members tm ON tm.id = ptm.team_member_id
          WHERE ptm.pov_id = pov.id
          AND tm.email = auth.email()
        )
      )
    )
  );

CREATE POLICY "Users can manage session activities"
  ON pov_session_activities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov_working_sessions ws
      JOIN pov ON pov.id = ws.pov_id
      WHERE ws.id = session_id
      AND pov.created_by = (SELECT auth.uid())
    )
  );

-- Challenge Outcomes policies
CREATE POLICY "Users can view challenge outcomes"
  ON pov_challenge_outcomes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov_challenges pc
      JOIN pov ON pov.id = pc.pov_id
      WHERE pc.id = pov_challenge_id
      AND (
        pov.created_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM pov_team_members ptm
          JOIN team_members tm ON tm.id = ptm.team_member_id
          WHERE ptm.pov_id = pov.id
          AND tm.email = auth.email()
        )
      )
    )
  );

CREATE POLICY "Users can manage challenge outcomes"
  ON pov_challenge_outcomes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov_challenges pc
      JOIN pov ON pov.id = pc.pov_id
      WHERE pc.id = pov_challenge_id
      AND pov.created_by = (SELECT auth.uid())
    )
  );

-- Decision Criteria Activities policies
CREATE POLICY "Users can view decision criteria activities"
  ON pov_decision_criteria_activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov_decision_criteria pdc
      JOIN pov ON pov.id = pdc.pov_id
      WHERE pdc.id = pov_decision_criteria_id
      AND (
        pov.created_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM pov_team_members ptm
          JOIN team_members tm ON tm.id = ptm.team_member_id
          WHERE ptm.pov_id = pov.id
          AND tm.email = auth.email()
        )
      )
    )
  );

CREATE POLICY "Users can manage decision criteria activities"
  ON pov_decision_criteria_activities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pov_decision_criteria pdc
      JOIN pov ON pov.id = pdc.pov_id
      WHERE pdc.id = pov_decision_criteria_id
      AND pov.created_by = (SELECT auth.uid())
    )
  ); 