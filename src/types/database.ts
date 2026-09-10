export type UserRole = 'user' | 'admin';
export type EventStatus = 'pending' | 'approved' | 'rejected';
export type PriceType = 'free' | 'paid';

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
  venue_name: string;
  venue_address: string;
  city_area: string;
  map_url: string | null;
  registration_url: string;
  organizer_id: string | null;
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
  'Model Town',
  'MM Alam Road',
  'Mall Road',
  'Walled City',
  'Cantt',
  'Bahria Town',
  'Ferozepur Road',
  'Walton',
  'Faisal Town',
  'Garden Town',
  'Shadman',
  'Allama Iqbal Town',
] as const;

export const EVENT_CATEGORIES = [
  'Tech & AI',
  'Music & Concerts',
  'Food & Festivals',
  'Art & Culture',
  'Business & Startups',
  'Sports & Fitness',
  'Workshops',
  'Comedy & Theatre',
] as const;
