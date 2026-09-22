-- ==============================================================================
-- MIGRATION: ADD ORGANIZER INFO & VENUE SETTINGS
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/uvggwzauotvdhdbwuqil/sql
-- ==============================================================================

ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS organizer_name TEXT,
  ADD COLUMN IF NOT EXISTS organization_name TEXT,
  ADD COLUMN IF NOT EXISTS venue_type TEXT DEFAULT 'onsite' CHECK (venue_type IN ('onsite', 'online', 'hybrid'));

-- Update existing AWS Student Community Day event with organizer details
UPDATE public.events
SET 
  organizer_name = 'Salman Ahmad',
  organization_name = 'AWS Student Building Groups & Community Lahore',
  venue_type = 'onsite'
WHERE slug = 'aws-student-community-day-lahore-2026';
