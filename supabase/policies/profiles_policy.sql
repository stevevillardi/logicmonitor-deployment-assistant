-- Allow admins to read all profiles (simplified for testing)
CREATE POLICY "Allow admins to read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'email') LIKE '%@logicmonitor.com'
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow admins to update profiles
CREATE POLICY "Allow admins to update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow all authenticated users to read their own profile
CREATE POLICY "Allow users to read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
); 