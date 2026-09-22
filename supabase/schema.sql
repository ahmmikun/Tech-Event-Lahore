-- ==============================================================================
-- LAHORE TECH EVENTS DISCOVERY PLATFORM: DATABASE SCHEMA & SEED DATA
-- ==============================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  category TEXT NOT NULL,
  date_start TIMESTAMPTZ NOT NULL,
  date_end TIMESTAMPTZ,
  time_display TEXT,
  venue_type TEXT NOT NULL DEFAULT 'onsite' CHECK (venue_type IN ('onsite', 'online', 'hybrid')),
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  city_area TEXT NOT NULL,
  map_url TEXT,
  registration_url TEXT NOT NULL,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organizer_name TEXT,
  organization_name TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  rejection_reason TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  price_type TEXT NOT NULL DEFAULT 'free' CHECK (price_type IN ('free', 'paid')),
  price_amount NUMERIC NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved events
CREATE POLICY "Public can view approved events" 
  ON public.events FOR SELECT 
  USING (status = 'approved');

-- Organizers can view their own submitted events regardless of status
CREATE POLICY "Organizers can view own events" 
  ON public.events FOR SELECT 
  USING (auth.uid() = organizer_id);

-- Authenticated users can insert events with pending status
CREATE POLICY "Users can insert pending events" 
  ON public.events FOR INSERT 
  WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their pending/rejected events
CREATE POLICY "Organizers can update own unapproved events" 
  ON public.events FOR UPDATE 
  USING (auth.uid() = organizer_id AND status IN ('pending', 'rejected'))
  WITH CHECK (auth.uid() = organizer_id AND status IN ('pending', 'rejected'));

-- Organizers can delete their own unapproved events
CREATE POLICY "Organizers can delete own unapproved events" 
  ON public.events FOR DELETE 
  USING (auth.uid() = organizer_id AND status IN ('pending', 'rejected'));

-- Admins can do everything on events
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

-- 3. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  hero_heading TEXT NOT NULL DEFAULT 'Discover what''s happening in Lahore''s tech scene.',
  hero_description TEXT NOT NULL DEFAULT 'The definitive discovery engine for Lahore''s developer community, hackathons, AI builders, founders, and tech meetups across the city.',
  hero_cta_text TEXT NOT NULL DEFAULT 'Explore Events',
  announcement_text TEXT DEFAULT '⚡ Live in Lahore: Discover verified upcoming tech conferences, hackathons & developer meetups!',
  banner_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings" 
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can update site settings" 
  ON public.site_settings FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Insert default site settings record
INSERT INTO public.site_settings (id, hero_heading, hero_description, hero_cta_text, announcement_text, banner_active)
VALUES (
  1,
  'Discover what''s happening in Lahore''s tech scene.',
  'The definitive discovery engine for Lahore''s developer community, hackathons, AI builders, founders, and tech meetups across the city.',
  'Explore Events',
  '⚡ Live in Lahore: Discover verified upcoming tech conferences, hackathons & developer meetups!',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Trigger to auto-create profile row on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    new.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN LOWER(new.email) = 'sheikhsalmanahmedofficial@gmail.com' THEN 'admin'
      ELSE COALESCE(new.raw_user_meta_data->>'role', 'user')
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url,
      role = CASE 
        WHEN LOWER(EXCLUDED.email) = 'sheikhsalmanahmedofficial@gmail.com' THEN 'admin'
        ELSE profiles.role 
      END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. STORAGE BUCKET: EVENT IMAGES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "Public Event Images Access" ON storage.objects;
CREATE POLICY "Public Event Images Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to event-images" ON storage.objects;
CREATE POLICY "Allow uploads to event-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Authenticated users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to event-images" ON storage.objects;
CREATE POLICY "Allow updates to event-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'event-images')
WITH CHECK (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Authenticated users can delete event images" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes to event-images" ON storage.objects;
CREATE POLICY "Allow deletes to event-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'event-images');
