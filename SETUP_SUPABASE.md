# Supabase Configuration Guide

This guide walks you through the one-time setup required to connect LYVIO to your Supabase project and enable authentication.

## Prerequisites

- A Supabase project created (visit [supabase.com](https://supabase.com) if you don't have one)
- Your project's API credentials (available in Dashboard → Settings → API)

## Step 1: Apply the Database Schema

The database schema defines all tables needed for LYVIO (users, blood panels, health data, etc.).

### Instructions

1. Go to **Supabase Dashboard** → **SQL Editor** → **New query**
2. Open the file `supabase/migrations/0001_initial.sql` in your editor
3. Copy its entire contents
4. Paste into the Supabase SQL Editor
5. Click the **"Run"** button (or press Ctrl+Enter)

### Verification

After the schema is applied, verify in **Supabase Dashboard** → **Table Editor**. You should see these 10 tables:

- `profiles` — User profile data (name, age, height, mode, etc.)
- `blood_panels` — Blood test records
- `blood_markers` — Individual blood marker results
- `body_measurements` — Weight, body fat, muscle mass, etc.
- `vo2max_readings` — Aerobic capacity readings
- `sleep_readings` — Sleep and HRV data
- `microbiome_tests` — Microbiome diversity and composition
- `health_connections` — Connected device integrations (Oura, Whoop, etc.)
- `chat_conversations` — AI chat conversations
- `chat_messages` — Chat message history

All tables should have **Row Level Security (RLS)** enabled (you'll see a lock icon in the Table Editor).

## Step 2: Configure Environment Variables

LYVIO needs three API credentials to connect to your Supabase project. These are safe to commit for public keys but **never** commit the service role key.

### Get Your Credentials

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Copy these values:
   - **Project URL** — This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** (public) — This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** (secret) — This is your `SUPABASE_SERVICE_ROLE_KEY`

### Add to .env.local

Create or edit `.env.local` in the project root (this file is git-ignored and contains secrets):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Replace the values with your actual credentials from Step 2 above.

## Step 3: Configure Authentication

These settings tell Supabase where LYVIO is hosted and where to redirect users after authentication.

### Site URL

1. Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
2. Under **Email Settings**, set **Site URL** to:
   - **Local Development:** `http://localhost:3000`
   - **Production:** (your production domain, e.g., `https://lyvio.app`)

### Redirect URLs

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add this redirect URL to the list:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://your-domain.com/auth/callback` (for production)

## Step 4: Generate TypeScript Types (Optional but Recommended)

Supabase can auto-generate TypeScript types from your database schema for type safety.

1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Look for the **"Generate types"** button or link
3. Copy the generated TypeScript code
4. Replace the contents of `src/lib/supabase/types.ts` with the generated code

This ensures TypeScript knows about all your database tables and columns.

## Step 5: Verify Setup

Now restart your development server and test the authentication flow:

```bash
pnpm dev
```

Then:

1. Navigate to `http://localhost:3000`
2. Go to **Sign Up** and create a test account
3. Complete onboarding and enter the dashboard
4. In the sidebar (bottom), you should see your email and a "Déconnexion" (sign out) link

If you see these elements, authentication is working! 🎉

## Common Issues

### "No tables appear in Table Editor"

- The SQL schema didn't run successfully. Check the SQL Editor for error messages and try running the migration again.

### "SUPABASE_URL is missing"

- Make sure `.env.local` exists in the project root and contains `NEXT_PUBLIC_SUPABASE_URL`.
- Restart your dev server (`pnpm dev`) after editing `.env.local`.

### "Email not sent / auth page blank"

- Verify the Site URL in Authentication settings matches your dev environment (usually `http://localhost:3000`)
- Check that `.env.local` has the correct API URL and anon key

### "RLS policy prevented access"

- All tables have RLS enabled for security. If you're debugging, you can temporarily disable RLS on a single table in the Table Editor for testing.

## What's Next

Once Supabase is configured:

- Users can sign up with email and password
- Real mode stores user health data in Supabase (full features enabled in Phase 6+)
- Demo mode shows sample data from preconfigured personas
- All data is protected by row-level security — users only see their own data

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [LYVIO Issues](https://github.com/your-org/lyvio/issues)
