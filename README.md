# Lahore Tech Events

> The community-powered home for discovering what is happening in Lahore's technology ecosystem.

Lahore Tech Events is a product for people who want to find meaningful events across the city — from developer meetups and AI workshops to hackathons, founder gatherings, startup demos, and technology conferences.

It brings event discovery and event publishing into one focused experience. Visitors can explore upcoming events by category and area, while organizers can submit their events for moderation and share a reliable registration link with the community.

## Why it exists

Lahore has an active and growing technology community, but its events are often spread across social posts, group chats, and disconnected registration pages. Lahore Tech Events gives that community a discoverable, structured, and locally relevant home.

The product is designed around three principles:

- **Useful discovery:** help people find the right event quickly.
- **Community trust:** review submitted events before they become publicly discoverable.
- **Low friction:** keep event publishing free and straightforward for local organizers.

## Product capabilities

- Browse upcoming Lahore technology events.
- Search and filter by category, locality, and event details.
- View dedicated event pages with venue, date, description, price, and registration information.
- Submit events as an authenticated organizer.
- Track personal submissions and their moderation status.
- Moderate submissions through an admin workspace.
- Manage selected site messaging and discovery content.
- Generate sitemap and robots metadata for public discoverability.

## Technology

- [Next.js](https://nextjs.org/) 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Supabase Auth, PostgreSQL, Row Level Security, and storage integration
- ESLint for code quality
- Vercel-ready deployment configuration

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Add your Supabase project URL, anon key, and local site URL to `.env.local`.

4. In the Supabase SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). This creates the profiles, events, and site settings tables, along with their row-level security policies.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

Never commit `.env.local` or server-side Supabase secrets. The browser-safe anon key belongs in the public environment variables; a `service_role` key must never be exposed to the client.

## Available commands

```bash
npm run dev      # Start the local development server
npm run lint     # Run ESLint
npm run build    # Create a production build
npm run start    # Serve the production build locally
```

## Project map

```text
src/app/              Public pages, auth, admin, sitemap, and robots
src/components/       Reusable product UI components
src/lib/               Supabase clients, mock data, and utilities
src/types/             Shared TypeScript and product types
supabase/schema.sql   Database schema, policies, triggers, and defaults
public/                Static assets
```

## Event quality and moderation

Events submitted by organizers enter a pending state. Moderators can approve or reject them before they appear in the public directory. Event information should be accurate, current, and useful to someone deciding whether to attend.

Organizers are responsible for the accuracy of their event title, description, venue, schedule, pricing, and registration link. Lahore Tech Events is a discovery platform and does not sell tickets, guarantee attendance, or act as the organizer of listed events.

## Contributing

Contributions are welcome — whether they improve the product experience, accessibility, reliability, documentation, or the quality of event discovery. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening an issue or pull request and follow [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) when participating in the community.

## Product policies and help

- [`PRIVACY.md`](PRIVACY.md) — how account, organizer, and event information is handled.
- [`TERMS.md`](TERMS.md) — platform rules and organizer responsibilities.
- [`SUPPORT.md`](SUPPORT.md) — troubleshooting, corrections, and feature requests.

## Responsible disclosure

If you discover a security issue, please do not open a public issue with exploit details. Follow the private reporting guidance in [`SECURITY.md`](SECURITY.md).

## License

This project is available under the [MIT License](LICENSE). See [`LICENSE`](LICENSE) for the complete text.

## Built for Lahore

Lahore Tech Events is an independent, community-driven project built to make the city's technology ecosystem easier to find, join, and grow.

Maintained by [Salman Ahmad](https://salmanahmad.tech) — full-stack developer and `@CodeNoSekai`.
