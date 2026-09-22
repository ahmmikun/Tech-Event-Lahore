# Contributing to Lahore Tech Events

Thank you for helping make Lahore's technology community easier to discover. Contributions to the product, codebase, documentation, accessibility, moderation experience, and event data quality are all valuable.

Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Before you start

- Search existing issues and pull requests before opening a new one.
- For a significant product or architectural change, open an issue first so the direction can be discussed.
- Never include secrets, private user information, or real production data in a commit, issue, screenshot, or pull request.
- For security vulnerabilities, follow [`SECURITY.md`](SECURITY.md) instead of opening a public issue.

## Local development

Follow the setup instructions in [`README.md`](README.md). Before submitting a change, run:

```bash
npm run lint
npm run build
```

If your change affects database behavior, review the relevant Row Level Security policy in [`supabase/schema.sql`](supabase/schema.sql) and explain any migration or setup requirement in the pull request.

## What makes a strong contribution

- It solves a clear user, organizer, moderator, or maintenance problem.
- It fits the product's calm, local, accessible experience.
- It works well on mobile and desktop.
- It handles loading, empty, error, and permission states thoughtfully.
- It keeps event information accurate and avoids misleading claims.
- It includes focused code and documentation rather than unrelated cleanup.

## Branches and commits

Use a descriptive branch name, for example:

```text
feat/event-filters
fix/organizer-submission-state
docs/setup-guide
```

Write concise commit messages in the imperative mood, such as `Add area filter to event directory`.

## Pull requests

Please include:

- A short explanation of the problem and the solution.
- Screenshots or a short recording for visual changes.
- Testing steps and the commands you ran.
- Any environment-variable, database, or migration changes.
- Known limitations or follow-up work.

Keep pull requests focused. A maintainer may ask for changes around accessibility, security, copy, performance, or consistency with the existing product experience.

## Event content contributions

Submitted events should be genuine, relevant to Lahore's technology ecosystem, and linked to a useful registration or information page. Do not submit spam, misleading listings, duplicate events, prohibited content, or events without permission from the organizer.

## Review and merging

A maintainer reviews each pull request for product fit, correctness, security, and maintainability. Passing checks do not guarantee acceptance; the final decision also considers the needs of the community and the direction of the product.
