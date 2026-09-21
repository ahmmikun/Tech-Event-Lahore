# Security Policy

## Supported versions

Security fixes are currently focused on the latest version on the default branch. This project is actively evolving, so older commits and deployments may not receive backports.

## Reporting a vulnerability

Please report suspected vulnerabilities privately. Do not open a public GitHub issue, pull request, or discussion with exploit details.

Contact the maintainer privately through [salmanahmad.tech](https://salmanahmad.tech) with the subject line `Security report: Lahore Tech Events`.

Please include:

- A clear description of the issue and its potential impact.
- The affected page, route, component, or dependency.
- Reproduction steps or a minimal proof of concept.
- Relevant logs, screenshots, or request details with secrets and personal data removed.
- Your preferred contact details and any suggested mitigation.

Please allow reasonable time for investigation and remediation before making the issue public. We will acknowledge valid reports, keep the reporter informed where possible, and credit reporters only with their permission.

## Scope and safe testing

Testing should be limited to your own accounts and data. Do not access, modify, delete, or exfiltrate other users' data; do not run denial-of-service tests; and do not test against production in a way that could affect availability or real users.

Potentially sensitive areas include authentication, organizer permissions, admin routes, Supabase Row Level Security policies, event submission, image uploads, external registration links, and environment-variable handling.

## Security practices for contributors

- Keep secrets out of source control, logs, screenshots, and pull requests.
- Do not expose Supabase service-role credentials in browser code.
- Validate user-controlled URLs and content at trust boundaries.
- Preserve least-privilege access and review RLS changes carefully.
- Keep dependencies current and run `npm run lint` and `npm run build` before submitting changes.
