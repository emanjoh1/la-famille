# La Famille

A property rental platform for Cameroon built with Next.js 16 (App Router).

## Tech Stack

- **Framework**: Next.js 16.1.6 with Turbopack
- **Auth**: Clerk (`@clerk/nextjs`)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **File Uploads**: UploadThing
- **Email**: Resend
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Project Structure

```
src/
  app/
    (marketing)/     # Public landing pages
    (platform)/      # Authenticated app pages (listings, bookings, host, admin, etc.)
    api/             # API routes (webhooks, uploadthing, admin, bookings, etc.)
    layout.tsx       # Root layout with ClerkProvider
  actions/           # Server actions (bookings, listings, messages, etc.)
  components/        # Reusable UI components
  lib/
    supabase/        # Supabase client/server/admin helpers
    stripe.ts        # Stripe client
    uploadthing.ts   # UploadThing config
    env.ts           # Environment variable validation
    i18n/            # Internationalization (en/fr)
  types/             # TypeScript types (database schema)
```

## Environment Variables Required

All secrets are stored in Replit Secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `UPLOADTHING_SECRET`
- `UPLOADTHING_APP_ID`
- `RESEND_API_KEY`

## Development

- Dev server runs on `0.0.0.0:5000` via `npm run dev`
- `allowedDevOrigins` is set to allow Replit proxy domains
- Content Security Policy includes `worker-src 'self' blob:` for Clerk/Stripe workers

## Deployment

Configured for **autoscale** deployment:
- Build: `npm run build`
- Run: `npm run start`
