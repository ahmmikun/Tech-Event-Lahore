# Event Finder Lahore — Tasks

Status legend: [x] done · [~] partial · [ ] not started

## Phase 1 — Project setup & design system
- [x] Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 scaffold
- [x] Global layout, fonts (Outfit + Plus Jakarta Sans), Navbar, Footer, Toaster
- [x] Dark theme design system (slate + orange accent)
- [x] Supabase clients (server, browser, middleware)

## Phase 2 — Database & security
- [x] `profiles`, `events`, `site_settings` tables + TypeScript types
- [x] Fixed `LAHORE_AREAS` and `EVENT_CATEGORIES` constants
- [~] Row Level Security policies — required by design; verify in Supabase dashboard
      (guests read approved only; users own-rows only; role cannot self-elevate; admin full)
- [ ] Migration files committed to the repo (schema currently lives in Supabase)

## Phase 3 — Authentication & roles
- [x] Supabase Auth with Google OAuth + email (`/auth/login`, `/signup`, `/callback`)
- [x] Session refresh + route protection in middleware
- [x] Admin role check for `/admin/*`

## Phase 4 — Public discovery
- [x] Homepage: announcement banner, hero (dynamic copy), search, area/category pills,
      featured events, upcoming events
- [x] `/events` directory with search + category + area + date + price + featured filters
- [x] `/events/[slug]` detail: image, meta, venue + Google Maps, description, tags,
      price, organizer, related events
- [x] Only `status = 'approved'` events shown publicly

## Phase 5 — User dashboard & submission
- [x] `/submit-event` protected form (title auto-slug, category, area, venue, dates,
      price, image upload, tags) — creates `pending`
- [x] `registration_url` validation (http/https)
- [x] `/my-events` list with status + rejection reason + edit/resubmit

## Phase 6 — Admin
- [x] `/admin` overview + moderation cards
- [x] `/admin/events` table with view/edit/approve/reject/delete/feature
- [x] Reject requires a reason
- [x] `/admin/users` user/role management
- [x] Admin direct event management

## Phase 7 — Curation & site content
- [x] Featured events (implemented equivalent of "recommendations")
- [x] `/admin/settings` editing of `site_settings` (hero + announcement + banner)
- [~] Dedicated `/recommendations` page (currently served via `/events?featured=true`)
- [ ] Normalized `tags` / `event_tags` tables (tags currently a `text[]` column)

## Phase 8 — SEO & performance
- [x] Global metadata (title template, OG, Twitter) in root layout
- [x] Per-event `generateMetadata` (OG + Twitter)
- [x] JSON-LD `Event` structured data on detail page
- [x] `metadataBase` set from `NEXT_PUBLIC_SITE_URL`
- [x] `app/sitemap.ts` (static routes + approved event slugs)
- [x] `app/robots.ts` (allow crawl, disallow private routes, link sitemap)
- [x] `next/image` optimization on event imagery
- [~] Pagination on `/events` for large catalogs (single query with limits today)

## Phase 9 — Testing & security review
- [x] Production build passes (`npm run build`, no type errors)
- [ ] Automated tests (unit/e2e) — no framework configured yet
- [~] Manual security review of RLS + middleware
- [x] External links hardened with `rel="noopener noreferrer"`

## Deployment (hackathon requirement)
- [ ] Deploy to Vercel and set env vars
      (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain (currently `http://localhost:3000`)
- [ ] Configure Supabase Auth redirect URLs for the production domain

## Future / backlog (not required for current scope)
- [ ] Re-align to original prompt: light theme + tech-events-only scope
- [ ] Web Share API + Facebook/LinkedIn share buttons
- [ ] AI-powered recommendations
- [ ] Normalize tags into `tags` / `event_tags` tables with admin management
