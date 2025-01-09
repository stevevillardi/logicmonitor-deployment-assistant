CREATE OR REPLACE FUNCTION is_team_member(pov_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pov_team_members ptm
    JOIN team_members tm ON tm.id = ptm.team_member_id
    WHERE ptm.pov_id = $1
    AND tm.email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 