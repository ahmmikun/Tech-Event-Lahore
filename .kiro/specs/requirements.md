# Event Finder Lahore — Requirements

## Overview

Event Finder Lahore is a production-quality web application for discovering, sharing,
and posting events across Lahore, Pakistan. Guests can browse and search verified
events without logging in and register through the organizer's external link. Authenticated
users can submit events for moderation, and admins review, publish, and curate the catalog.

This document describes the requirements **as implemented** in the current codebase.

## Goals

- Let anyone discover verified Lahore events quickly, filter by area/category/date/price,
  and register on the organizer's official external site.
- Let signed-in organizers submit events that enter an admin moderation queue.
- Give admins tools to approve, reject (with reason), feature, edit, and delete events,
  manage users, and edit site copy.
- Ship strong SEO (per-event metadata, structured data, sitemap, robots).

## Tech Stack (as built)

- Next.js 16 (App Router, Turbopack) + React 19
- TypeScript
- Tailwind CSS v4
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`): Postgres, Auth, Storage, RLS
- Lucide React icons, `sonner` toasts, `date-fns`, `canvas-confetti`
- Deployment target: Vercel

No separate Express/Node backend — all server logic runs in Next.js Server Components,
route handlers, and middleware against Supabase.

## Scope Note (important)

The original master prompt described a **light-theme, tech-events-only** platform.
The implemented product is a **dark-theme, general Lahore events** platform covering
multiple categories (Tech & AI, Music & Concerts, Food & Festivals, Art & Culture,
Business & Startups, Sports & Fitness, Workshops, Comedy & Theatre). These requirements
document the product as actually built. Re-aligning theme/scope to the original prompt
is tracked as a future task in `tasks.md`, not a current requirement.

## User Roles

- **Guest** — no login. Can browse, search/filter, view event detail, open external
  registration links, and share events.
- **User** — Supabase Auth (Google OAuth + email). Can submit events, view their
  submissions in `/my-events`, and edit/resubmit rejected events.
- **Admin** — profile `role = 'admin'`. Can moderate (approve/reject with reason),
  feature/unfeature, edit, delete, create events, manage users, and edit site settings.
  Admin authorization is enforced in middleware and must be backed by Supabase RLS.

## Functional Requirements

### FR1 — Public browsing (Guest)
- `/` homepage shows a dynamic announcement banner, hero (copy from `site_settings`),
  search, area quick-filters, category pills, featured events, and upcoming events.
- `/events` lists approved events with filters: search query, category, Lahore area,
  date horizon (today / tomorrow / next 7 / next 30 days), price (free/paid), and
  featured-only. Only `status = 'approved'` events are publicly visible.
- `/events/[slug]` shows full event detail: image, title, category, area, date/time,
  venue with Google Maps link, description, tags, price, organizer, related events,
  and registration/share actions.

### FR2 — Registration (Guest)
- Each event has an external `registration_url`. The detail page shows a primary
  "Register on Official Site" action opening the URL in a new tab (`rel="noopener noreferrer"`).
- Users never need a Event Finder Lahore account to register externally.
- Submitted `registration_url` values must be valid `http://` or `https://` URLs.

### FR3 — Sharing (Guest)
- Event actions include Copy Link, WhatsApp share, Twitter/X share, and Add to Google
  Calendar. (Web Share API / additional networks are a future enhancement.)

### FR4 — Event submission (User)
- `/submit-event` is protected; unauthenticated users are redirected to `/auth/login`.
- Form captures title (auto-slugged), category, Lahore area, venue name/address,
  registration URL, start date, time display, price type/amount, image, short/full
  description, and tags.
- New submissions are always created with `status = 'pending'`.

### FR5 — User dashboard
- `/my-events` (protected) shows the signed-in user's submissions with status and
  actions. Rejected events show the rejection reason and allow edit/resubmit.

### FR6 — Admin moderation
- `/admin` (protected, admin-only) provides an overview and moderation cards.
- `/admin/events` lists all events with view/edit/approve/reject/delete/feature actions.
- Rejecting an event requires a rejection reason.
- `/admin/users` manages user profiles/roles.
- `/admin/settings` edits site copy (`site_settings`): hero heading, hero description,
  hero CTA text, announcement text, and banner active flag.

### FR7 — Featured events (curation)
- Admins mark events `featured = true`. Featured approved events surface on the homepage
  and via the `/events?featured=true` filter. (This is the implemented equivalent of the
  "recommendations" concept from the original prompt.)

### FR8 — Authentication
- Google OAuth and email auth via Supabase. `/auth/login`, `/auth/signup`, and
  `/auth/callback` handle the flow. Sessions are refreshed in middleware.

## Non-Functional Requirements

### NFR1 — Security
- Route protection in `middleware.ts` for `/submit-event`, `/my-events`, `/admin`
  (with an admin role check for `/admin`).
- Supabase RLS must enforce: guests read only approved events; users manage only their
  own events; users cannot approve events, edit others' events, or elevate their role;
  admins manage everything the panel requires.
- The Supabase service-role key must never be exposed to the client. Only
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used client-side.

### NFR2 — SEO & performance
- Global metadata + per-event `generateMetadata` (Open Graph + Twitter cards).
- JSON-LD `Event` structured data on detail pages.
- `sitemap.ts` and `robots` for crawlability.
- `metadataBase` set so OG/Twitter image URLs resolve absolutely.
- Clean slugs, `next/image` optimization, and Supabase queries scoped to needed columns.

### NFR3 — Responsiveness & UX
- Mobile-first responsive layout across all pages; accessible semantic HTML.

## Out of Scope (MVP)
- AI-generated recommendations.
- In-app ticketing/payments (registration is always external).
- Light theme / tech-only re-scope (documented as a future task).

## Acceptance Criteria
- Guests can find and open an event's external registration link without logging in.
- Submitting an event requires login and creates a `pending` record.
- Admins can approve/reject (with reason), feature, edit, and delete events.
- Only approved events appear on public pages.
- The production build (`npm run build`) compiles with no type errors.
- `sitemap.xml` and `robots.txt` are served; event detail pages expose OG/Twitter/JSON-LD.
