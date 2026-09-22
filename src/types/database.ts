export type UserRole = 'user' | 'admin';
export type EventStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type PriceType = 'free' | 'paid';
export type VenueType = 'onsite' | 'online' | 'hybrid';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  category: string;
  date_start: string;
  date_end: string | null;
  time_display: string | null;
  venue_type?: VenueType;
  venue_name: string;
  venue_address: string;
  city_area: string;
  map_url: string | null;
  registration_url: string;
  organizer_id: string | null;
  organizer_name?: string | null;
  organization_name?: string | null;
  image_url: string | null;
  status: EventStatus;
  rejection_reason: string | null;
  featured: boolean;
  price_type: PriceType;
  price_amount: number;
  tags: string[];
  views_count: number;
  created_at: string;
  updated_at: string;
  organizer?: Profile | null;
}

export interface SiteSettings {
  id: number;
  hero_heading: string;
  hero_description: string;
  hero_cta_text: string;
  announcement_text: string | null;
  banner_active: boolean;
  updated_at: string;
  updated_by: string | null;
}

export const LAHORE_AREAS = [
  'Gulberg',
  'DHA',
  'Johar Town',
  'Ferozepur Road',
  'MM Alam Road',
  'Model Town',
  'Mall Road',
  'Cantt',
  'Bahria Town',
  'Faisal Town',
  'Garden Town',
] as const;

export const EVENT_CATEGORIES = [
  'AI & Machine Learning',
  'Web Development',
  'Cloud & DevOps',
  'Cybersecurity',
  'Startups & Venture',
  'Design & Product',
  'Hackathons',
  'Open Source',
  'Tech & AI',
  'Workshops',
] as const;
