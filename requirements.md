Sure — here’s a **shorter, cleaner master prompt** that still contains everything Kiro needs to build the project properly.

# EVENT FINDER LAHORE — MASTER BUILD PROMPT

Build a production-quality web app called **Event Finder Lahore**.

It is a dedicated platform for discovering **technology, startup, developer, AI, cybersecurity, cloud, hackathon, workshop, conference, networking, and other tech-related events in Lahore, Pakistan**.

This is NOT a general events platform.

---

## TECH STACK

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React
* Supabase

  * PostgreSQL
  * Supabase Auth
  * Google OAuth
  * Storage
  * Row Level Security (RLS)
* Vercel for deployment

Do not use Express.js or a separate backend.

---

# UI / DESIGN

Use a **LIGHT THEME ONLY**. Do not implement dark mode.

Design should be:

* Bold
* Minimal
* Modern
* Premium
* Tech/startup focused
* Highly responsive

Use:

* White/off-white backgrounds
* Strong dark typography
* One primary accent color
* Large headings
* Generous whitespace
* Clean cards
* Subtle borders/shadows
* High-quality event images
* Clear CTAs
* Subtle animations

Avoid excessive gradients, glassmorphism, neon colors, animations, shadows, and generic SaaS/dashboard designs.

The product should feel like a **modern tech community platform**, not a CRUD college project.

---

# USER ACCESS

### Guest

No login required to:

* Browse events
* Search/filter events
* View event details
* View recommendations
* Click registration links
* Share events

### Authenticated User

Google login required to:

* Post an event
* Access dashboard
* View submitted events
* Edit rejected events
* Resubmit events

### Admin

Can:

* Approve/reject events
* Give rejection reasons
* Edit/delete events
* Create events directly
* Manage recommendations
* Manage categories
* Manage tags
* Manage website content
* Manage users

Admin authorization must be enforced server-side and with Supabase RLS.

---

# PUBLIC PAGES

Create:

```text
/
 /events
 /events/[slug]
 /recommendations
 /categories/[slug]
 /post-event
 /about
```

### Homepage

Include:

* Hero
* Upcoming Events
* Recommended Events
* Categories
* CTA for posting an event
* Footer

Hero example:

**Discover What's Happening in Lahore's Tech Scene.**

Supporting text should explain that users can discover tech/startup events across Lahore.

Important homepage text should be configurable from the admin panel.

---

# EVENTS

Each event must contain:

* Event image
* Title
* Short description
* Full description
* Category
* Date
* Start/end time
* Location
* Event type
* Organizer
* Registration URL
* Tags
* Status

Event types:

```text
In-Person
Online
Hybrid
```

Only:

```text
status = approved
```

events are publicly visible.

---

# EVENT PAGE

Example:

```text
/events/lahore-ai-builders-meetup
```

Display:

* Large event image
* Title
* Category
* Date/time
* Location
* Organizer
* Full description
* Event tags

Useful tags include:

```text
Food Available
Swag Available
Certificate
Free Entry
Paid Entry
Networking
Workshop
Hands-on
Hackathon
Beginner Friendly
Student Friendly
Developer Focused
Limited Seats
Online
In-Person
Hybrid
Job Opportunities
Startup Focused
```

Tags must be database-driven.

---

# REGISTRATION

Every event has an external:

```text
registration_url
```

Show:

**Register for Event**

Clicking it opens the external registration website.

Examples:

* Google Forms
* Luma
* Eventbrite
* Meetup
* Organization website

Users must NOT need to log in to Event Finder Lahore to register.

Validate registration URLs and only allow HTTP/HTTPS URLs.

---

# SHARING

Every event must have:

**Share Event**

Use Web Share API when available.

Fallback:

**Copy Link**

Optionally support WhatsApp, LinkedIn, Facebook and X.

---

# EVENT SUBMISSION

User clicks:

**Post an Event**

If logged out:

```text
Sign in with Google to submit your event.
```

After login, open the user dashboard/event submission form.

Form fields:

* Title
* Short description
* Full description
* Category
* Image
* Date
* Start/end time
* Event type
* Venue
* Address
* Organizer
* Organization
* Contact email
* Registration URL
* Tags

Use **React Hook Form + Zod** for validation.

---

# EVENT WORKFLOW

User submission:

```text
User submits
     ↓
Pending
     ↓
Admin Review
   ↙       ↘
Approve   Reject
             ↓
       Rejection Reason
             ↓
        User edits
             ↓
          Resubmit
             ↓
          Pending
```

Only approved events appear publicly.

---

# USER DASHBOARD

Route:

```text
/dashboard
```

Show:

```text
Total Events
Pending
Approved
Rejected
```

Show user's submitted events with:

* Event
* Date
* Status
* Actions

For rejected events, clearly display the rejection reason and provide:

**Edit & Resubmit**

---

# ADMIN DASHBOARD

Route:

```text
/admin
```

Sidebar:

```text
Overview
Events
Pending
Approved
Rejected
Create Event
Recommendations
Categories
Tags
Website Content
Users
```

Admin overview should show:

* Total events
* Pending events
* Approved events
* Rejected events
* Users
* Recommended events

### Admin Event Actions

Admin can:

* View
* Edit
* Approve
* Reject
* Delete
* Recommend/unrecommend

When rejecting an event, require a rejection reason.

---

# ADMIN CREATE EVENT

Admin can create events directly from:

```text
/admin/events/create
```

Admin-created events can be published directly as approved.

---

# RECOMMENDATIONS

Create:

```text
/recommendations
```

Admins manually control recommendations.

Use:

```text
is_recommended = true
```

Only approved events can be recommended.

Recommended events appear on the homepage and recommendations page.

Do NOT build AI recommendations for the MVP.

---

# WEBSITE CONTENT

Admin can edit important website text without changing code.

Manage:

* Hero eyebrow
* Hero heading
* Hero description
* CTA text
* Events heading
* Recommendations heading
* Categories heading
* Footer description

Store this content in Supabase.

---

# DATABASE

Use these main tables:

```text
profiles
events
categories
tags
event_tags
site_content
```

### profiles

```text
id
full_name
email
avatar_url
role
created_at
updated_at
```

Roles:

```text
user
admin
```

### events

```text
id
title
slug
short_description
description
category_id
organizer_id
organizer_name
organizer_organization
organizer_email
event_date
start_time
end_time
event_type
venue_name
address
city
registration_url
image_url
status
rejection_reason
is_recommended
created_at
updated_at
approved_at
```

### categories

```text
id
name
slug
description
created_at
```

### tags

```text
id
name
slug
icon
created_at
```

### event_tags

```text
event_id
tag_id
```

### site_content

```text
id
key
value
updated_at
```

---

# SECURITY

Implement proper Supabase RLS.

Guests can read approved events.

Users can manage only their own events.

Users cannot:

* Approve events
* Modify other users' events
* Change their role
* Become admin

Admins can manage everything required by the admin panel.

Never expose the Supabase service-role key to the client.

Protect dashboard/admin routes server-side.

---

# SEO + PERFORMANCE

Implement:

* Dynamic event metadata
* Open Graph metadata
* Clean event slugs
* Sitemap
* robots.txt
* Semantic HTML
* Optimized images
* Efficient Supabase queries
* Pagination where needed

---

# PROJECT STRUCTURE

Use a clean Next.js App Router structure:

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── events/
│   ├── recommendations/
│   ├── categories/
│   ├── post-event/
│   └── about/
├── dashboard/
├── admin/
├── auth/
├── layout.tsx
└── globals.css

components/
├── ui/
├── events/
├── home/
├── dashboard/
└── admin/

lib/
├── supabase/
├── validations/
└── utils/

types/
```

Use reusable components. Avoid giant components.

---

# DEVELOPMENT PHASES

Build incrementally:

### Phase 1

Project setup + design system + Supabase.

### Phase 2

Database + migrations + RLS.

### Phase 3

Google authentication + roles.

### Phase 4

Homepage + events + search/filter + event details.

### Phase 5

User dashboard + event submission.

### Phase 6

Admin dashboard + approval/rejection + direct event creation.

### Phase 7

Recommendations + categories + tags + website content management.

### Phase 8

SEO + performance + responsive polish.

### Phase 9

Full testing and security review.

---

# IMPORTANT KIRO RULES

Do not build everything blindly in one step.

For each phase:

1. Inspect the current project.
2. Plan changes.
3. Implement.
4. Run TypeScript checks.
5. Run ESLint.
6. Fix errors.
7. Test the feature.
8. Check security.
9. Continue.

Do not unnecessarily rewrite working code.

Do not add features outside the MVP.

---

# FINAL PRODUCT GOAL

The core experience must be extremely simple:

### Visitor

```text
Discover Event
→ View Details
→ Check Tags
→ Register Externally
→ Share
```

### Organizer

```text
Google Login
→ Dashboard
→ Submit Event
→ Pending
→ Admin Approval
→ Published
```

### Admin

```text
Dashboard
→ Review Events
→ Approve / Reject
→ Create Events
→ Manage Recommendations
→ Manage Tags/Categories
→ Customize Website
```

Build **Event Finder Lahore** as a polished, lightweight, production-ready platform for Lahore's technology ecosystem.

**Do not implement dark mode. Keep the UI light, bold, minimal, and premium.**
