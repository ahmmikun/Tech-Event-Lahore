-- ==============================================================================
-- MIGRATION: EVENT CRUD, ARCHIVING & USER DELETE POLICIES
-- Run this in the Supabase SQL Editor to update check constraints & RLS policies
-- ==============================================================================

-- 1. Update status check constraint to include 'archived'
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE public.events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('pending', 'approved', 'rejected', 'archived'));

-- 2. Allow organizers to delete their own unapproved (pending or rejected) events
DROP POLICY IF EXISTS "Organizers can delete own unapproved events" ON public.events;
CREATE POLICY "Organizers can delete own unapproved events" 
  ON public.events FOR DELETE 
  USING (
    auth.uid() = organizer_id 
    AND status IN ('pending', 'rejected')
  );

-- 3. Allow organizers to update their own unapproved events
DROP POLICY IF EXISTS "Organizers can update own unapproved events" ON public.events;
CREATE POLICY "Organizers can update own unapproved events" 
  ON public.events FOR UPDATE 
  USING (
    auth.uid() = organizer_id 
    AND status IN ('pending', 'rejected')
  )
  WITH CHECK (
    auth.uid() = organizer_id 
    AND status IN ('pending', 'rejected')
  );

-- 4. Ensure Admins have full CRUD permissions on ALL events (create, read, update, delete, archive)
DROP POLICY IF EXISTS "Admins have full access to events" ON public.events;
CREATE POLICY "Admins have full access to events" 
  ON public.events FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR LOWER(auth.jwt()->>'email') = 'sheikhsalmanahmedofficial@gmail.com'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR LOWER(auth.jwt()->>'email') = 'sheikhsalmanahmedofficial@gmail.com'
  );
