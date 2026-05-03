# RentFlow

RentFlow is a property management web app for landlords and small property teams. It helps organize properties, units, tenants, rent records, payment links, maintenance requests, receipts, reports, reminders, and calendar events in one focused workspace.

## Beta Development Notice

RentFlow is currently in beta development. Core workflows are actively being refined, and some features, UI details, pricing, and data flows may change as the product improves.

## What RentFlow Does

- Manage properties and units
- Assign tenants to units
- Track rent records, overdue balances, and payment status
- Generate and copy public payment links
- Accept tenant payment proof submissions
- Review, approve, and reject pending payments
- Generate payment receipts
- Track maintenance requests and repair costs
- View dashboard metrics, reports, and calendar events
- Manage account, profile, accessibility, notification, and security settings

## Landing Page

The landing page introduces RentFlow with:

- Hero section with dashboard preview
- Beta preview notice
- How It Works timeline
- Feature overview with image-ready slots
- RentFlow vs spreadsheets comparison
- Pricing section
- Blog section with image-ready slots
- Community section
- FAQ accordion
- Final CTA and footer

The landing page uses Framer Motion for fade-in, slide-up, staggered card reveals, soft hover effects, FAQ transitions, smooth button interactions, and dashboard preview entrance animation.

## Current Product Areas

- **Dashboard**: Portfolio metrics, recent activity, revenue overview, occupancy, and alerts.
- **Properties**: Property and unit management.
- **Tenants**: Tenant records, lease dates, rent status, and payment links.
- **Rent**: Monthly rent records, overdue tracking, reminders, and payment actions.
- **Payments**: Review submitted payment proofs and update payment status.
- **Receipts**: Generate official rent payment receipts.
- **Maintenance**: Log issues, priority, status, cost, and property/unit context.
- **Calendar**: Rent due dates, leases, inspections, and maintenance events.
- **Reports**: Revenue, occupancy, overdue rent, and portfolio insights.
- **Settings**: Profile, notifications, accessibility, security, MFA, and account controls.

## Payment Status

RentFlow currently uses MVP/demo payment logic. Public payment pages and payment proof flows are available, but no real card, bank, wallet, or payment gateway charge is processed by default.

## Future AI Direction

AI integration is planned for future versions. Possible AI-powered workflows include:

- Rent reminder message generation
- Tenant communication drafts
- Maintenance request summarization
- Payment proof assistance
- Portfolio insight summaries
- Lease and receipt document helpers

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, Database, and Storage
- Framer Motion
- Lucide React
- Recharts
- Radix UI primitives
- Zustand

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
.env.local
```

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Some account deletion and admin cleanup flows also require:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

Run the development server:

```bash
npm run dev
```

Open the local URL shown in your terminal.

## Scripts

```bash
npm run dev
npm run dev:turbo
npm run build
npm run start
npm run lint
```

## Supabase

Database migrations live in:

```bash
supabase/migrations
```

The app expects Supabase tables, policies, functions, and storage buckets for properties, units, tenants, rent records, payments, receipts, maintenance requests, profile avatars, and payment proofs.

## Status

RentFlow is private, actively developed, and not yet considered a final production release.
