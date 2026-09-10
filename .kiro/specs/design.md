# Event Finder Lahore — Design

## Architecture

Event Finder Lahore is a full-stack Next.js 16 App Router application. There is no
separate backend: rendering, data fetching, and authorization run inside Next.js
(Server Components, middleware, client components) directly against Supabase.

```
Browser
  │
  ▼
Next.js App Router (Vercel)
  ├─ Server Components ── fetch via @supabase/ssr (cookie-based session)
  ├─ Client Components ── fetch via @supabase/supabase-js (anon key)
  └─ middleware.ts ────── session refresh + route protection
  │
  ▼
Supabase
  ├─ Postgres (events, profiles, site_settings)
  ├─ Auth (Google OAuth + email)
  ├─ Storage (event images)
  └─ Row Level Security (authorization)
```

### Rendering strategy
- Public pages (`/`, `/events`, `/events/[slug]`) use `export const dynamic = "force-dynamic"`
  / `revalidate = 0` for fresh data on every request.
- `generateMetadata` on `/events/[slug]` produces per-event SEO metadata.

## Supabase Clients

- `src/lib/supabase/server.ts` — `createClient()` for Server Components using
  `next/headers` cookies (read/refresh session).
- `src/lib/supabase/client.ts` — browser client for client components.
- `src/lib/supabase/middleware.ts` — `updateSession()` refreshes auth and enforces
  route protection.

## Middleware & Authorization

`src/middleware.ts` delegates to `updateSession()`:
1. Refreshes the Supabase session on every matched request.
2. Redirects unauthenticated users away from `/submit-event`, `/my-events`, `/admin`
   to `/auth/login?next=<path>`.
3. For `/admin/*`, loads the user's `profiles.role`; non-admins are redirected to `/`.

Middleware is defense-in-depth on top of (required) Supabase RLS policies, which are the
authoritative access control at the data layer.

## Data Model (as implemented)

### `profiles`
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK, matches `auth.users.id` |
| email | text | |
| full_name | text | nullable |
| avatar_url | text | nullable |
| role | text | `'user'` \| `'admin'` |
| created_at / updated_at | timestamptz | |

### `events`
| column | type | notes |
| --- | --- | --- |
| id | uuid | PK |
| title | text | |
| slug | text | unique, used in `/events/[slug]` |
| description | text | full description |
| short_description | text | nullable |
| category | text | one of the fixed category list |
| date_start | timestamptz | |
| date_end | timestamptz | nullable |
| time_display | text | human-readable time, nullable |
| venue_name | text | |
| venue_address | text | |
| city_area | text | Lahore area (Gulberg, DHA, ...) |
| map_url | text | nullable |
| registration_url | text | external http/https URL |
| organizer_id | uuid | FK → profiles.id, nullable |
| image_url | text | nullable (fallback image used) |
| status | text | `'pending'` \| `'approved'` \| `'rejected'` |
| rejection_reason | text | nullable |
| featured | boolean | curation flag |
| price_type | text | `'free'` \| `'paid'` |
| price_amount | numeric | PKR |
| tags | text[] | free-form tags stored on the row |
| views_count | int | |
| created_at / updated_at | timestamptz | |

### `site_settings` (single row, `id = 1`)
| column | type | notes |
| --- | --- | --- |
| id | int | always 1 |
| hero_heading | text | |
| hero_description | text | |
| hero_cta_text | text | |
| announcement_text | text | nullable |
| banner_active | boolean | toggles homepage banner |
| updated_at | timestamptz | |
| updated_by | uuid | nullable |

Type definitions live in `src/types/database.ts`, along with the fixed
`LAHORE_AREAS` and `EVENT_CATEGORIES` constants.

> Note: Tags are stored as a `text[]` column on `events` rather than the normalized
> `tags` / `event_tags` tables from the original prompt. Site copy uses a single
> `site_settings` row rather than a key/value `site_content` table.

## Route Map

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Guest | Homepage: banner, hero, search, categories, featured, upcoming |
| `/events` | Guest | Filterable directory of approved events |
| `/events/[slug]` | Guest | Event detail + registration/share + related events |
| `/submit-event` | User | Submit a new event (created as `pending`) |
| `/my-events` | User | User's submissions + edit/resubmit rejected |
| `/admin` | Admin | Moderation overview |
| `/admin/events` | Admin | Full events table + actions |
| `/admin/users` | Admin | Manage users/roles |
| `/admin/settings` | Admin | Edit site copy (`site_settings`) |
| `/auth/login`, `/auth/signup`, `/auth/callback` | Public | Auth flow |

## Component Inventory

- `components/navbar.tsx`, `components/footer.tsx` — global chrome
- `components/event-card.tsx` — event card used across listings
- `components/event-search.tsx` — search input (URL param driven)
- `components/area-pills.tsx`, `components/category-pills.tsx` — filter pills
- `components/event-actions.tsx` — register / calendar / copy / WhatsApp / Twitter
- `components/image-upload.tsx` — Supabase Storage image upload
- `components/admin/moderation-card.tsx` — approve/reject with reason
- `app/admin/events/events-table.tsx`, `app/admin/users/users-client.tsx`,
  `app/admin/settings/settings-form.tsx` — admin panels

## Utilities (`src/lib/utils.ts`)
- `cn()` — Tailwind class merge
- `slugify()` — slug generation from titles
- `formatEventDate()`, `formatEventShortDate()`, `formatPrice()`
- `buildGoogleCalendarUrl()`, `buildWhatsAppShareUrl()`,
  `buildTwitterShareUrl()`, `buildLinkedInShareUrl()`

## SEO Design
- Root `metadata` in `app/layout.tsx`: title template, description, keywords, OG, Twitter.
- `metadataBase` derived from `NEXT_PUBLIC_SITE_URL` so OG/Twitter images resolve absolutely.
- Per-event `generateMetadata` on `/events/[slug]` (OG + Twitter + event image).
- JSON-LD `Event` structured data injected on the detail page.
- `app/sitemap.ts` enumerates static routes plus every approved event slug.
- `app/robots.ts` allows crawling and points to the sitemap; `/admin`, `/my-events`,
  `/submit-event`, and `/auth` are disallowed.

## Security Design
- Client only ever receives `NEXT_PUBLIC_SUPABASE_URL` + anon key.
- RLS is the source of truth for row access; middleware adds route-level protection.
- External links use `target="_blank"` with `rel="noopener noreferrer"`.
- `registration_url` is validated to be an `http`/`https` URL before insert.
