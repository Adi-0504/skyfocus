# Skyfocus Supabase Backend Deployment & Setup Guide

This document outlines the complete automated Supabase backend architecture, migration steps, and configuration for Skyfocus.

---

## 1. Automated Schema & Migrations

All database schemas, constraints, foreign keys, triggers, indexes, and Row Level Security (RLS) policies are version-controlled under:

`supabase/migrations/20260722000000_initial_schema.sql`

### Applied Database Tables:
1. `profiles`: User profile metadata linked to `auth.users(id)`.
2. `task_lists`: Custom user task groupings with custom colors/icons.
3. `tasks`: Primary task records (`title`, `description`, `priority`, `status`, `due_date`, `due_time`, `completed_at`).
4. `subtasks`: Task breakdown items with completion states.
5. `tags`: Reusable user tags.
6. `task_tags`: Many-to-many junction between tasks and tags.
7. `reminders`: Task reminder schedules and repeat types.
8. `notifications`: User notification history logs.
9. `push_subscriptions`: PWA Web Push notification credentials.
10. `focus_sessions`: Pomodoro concentration session records linked to tasks.

---

## 2. Row Level Security & Isolation

Every user-owned table has Row Level Security (RLS) enabled:

- **Policy**: `auth.uid() = user_id` for SELECT, INSERT, UPDATE, and DELETE.
- Users can ONLY query, insert, or modify their own data.

---

## 3. Automated Triggers

- **`update_updated_at_column()`**: Auto-updates `updated_at` on any record update.
- **`handle_new_user()`**: Automatically creates a default `profiles` row upon `auth.users` insertion (OAuth or Email registration).

---

## 4. Supabase Setup Commands

### Option A: Local Supabase Development
To run a local Supabase backend instance via Docker:

```cmd
npx supabase start
```
This will start local Postgres (port 54322), Auth, and Studio (port 54323), and output your local `API URL` and `anon key`.

To apply all migrations locally:
```cmd
npx supabase db reset
```

### Option B: Remote Supabase Cloud Instance
To link and push all migrations to your cloud Supabase project:

1. Log in to Supabase CLI:
   ```cmd
   npx supabase login
   ```
2. Link your project ID:
   ```cmd
   npx supabase link --project-ref <YOUR_PROJECT_REF>
   ```
3. Push migrations to cloud database:
   ```cmd
   npx supabase db push
   ```

---

## 5. Environment Variables Configuration

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
```

---

## 6. Authentication Setup Checklist

In your Supabase Dashboard under **Authentication > Providers**:

- [x] **Email & Password**: Enable Email provider. Disable email confirmation requirement for instant onboarding if desired.
- [x] **Google OAuth**:
  1. Enable Google Provider in Supabase Auth Settings.
  2. Enter **Client ID** & **Client Secret** from Google Cloud Console.
  3. Add `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback` to Google Authorized Redirect URIs.
- [x] **URL Configuration**:
  - Site URL: `http://localhost:5173` (or your production URL).
  - Additional Redirect URIs: `http://localhost:5173/**`
