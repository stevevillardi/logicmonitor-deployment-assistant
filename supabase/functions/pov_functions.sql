-- ================================================
-- User Management Functions
-- ================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(user_id uuid) CASCADE;

-- Recreate functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
declare
  user_role text;
begin
  -- Set role based on email domain
  IF new.email LIKE '%@logicmonitor.com' THEN
    user_role := 'lm_user';
  ELSE
    user_role := 'viewer';
  END IF;

  insert into public.profiles (id, email, role, is_disabled)
  values (
    new.id, 
    new.email,
    user_role,
    false
  );
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  select current_user;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role
    FROM profiles
    WHERE id = user_id;
    
    RETURN LOWER(user_role) = 'admin';
END;
$$;

-- ================================================
-- POV Access Control Functions
-- ================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.has_pov_access(check_pov_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_team_member(uuid) CASCADE;

-- Recreate functions
CREATE OR REPLACE FUNCTION public.has_pov_access(check_pov_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
begin
  -- Check if user is the POV owner or a team member
  return exists (
    select 1 
    from pov p
    where p.id = check_pov_id
    and (
      -- User is the POV creator
      p.created_by = auth.uid()
      or 
      -- User is a team member
      exists (
        select 1 
        from pov_team_members ptm
        join team_members tm on tm.id = ptm.team_member_id
        where ptm.pov_id = check_pov_id
        and tm.email = auth.jwt()->>'email'
      )
    )
  );
end;
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(pov_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pov_team_members ptm
    JOIN team_members tm ON tm.id = ptm.team_member_id
    WHERE ptm.pov_id = $1
    AND tm.email = auth.email()
  );
END;
$$;

-- ================================================
-- Document Management Functions
-- ================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.match_documents(query_embedding vector, match_threshold float, match_count int) CASCADE;
DROP FUNCTION IF EXISTS public.update_displayname() CASCADE;
DROP FUNCTION IF EXISTS public.update_page_embedding(page_id bigint, new_embedding vector) CASCADE;

-- Recreate functions
CREATE OR REPLACE FUNCTION public.match_documents(
    query_embedding vector(512),
    match_threshold double precision,
    match_count int
)
RETURNS TABLE (
    id bigint,
    url text,
    title text,
    content text,
    similarity float,
    type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        "lm-pages".id,
        "lm-pages".url,
        "lm-pages".title,
        "lm-pages".content,
        1 - (embedding <=> query_embedding) as similarity,
        "lm-pages".type
    FROM "lm-pages"
    WHERE (embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_displayname()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    SET search_path = public;
    NEW.displayname := TRIM(
        REPLACE(
            REPLACE(
                REPLACE(NEW.filename, '.json', ''),
                '_', ' '
            ),
            '-', ' '
        )
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_page_embedding(
    page_id bigint,
    new_embedding vector
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
begin
    update "lm-pages"
    set 
        embedding = new_embedding
    where id = page_id;
end;
$$;

-- ================================================
-- Timestamp Management Functions
-- ================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recreate functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
begin
    new.updated_at = timezone('utc'::text, now());
    new.updated_by = auth.uid();
    return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    SET search_path = public;
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;