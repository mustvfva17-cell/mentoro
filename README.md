# Precepta — static deployment package

Precepta is a static HTML/CSS/JS site backed by Supabase. This package does not require Vercel serverless functions or a build step.

## 1) Configure Supabase

Open `supabase-config.js` and replace:

- `PASTE_YOUR_SUPABASE_PROJECT_URL_HERE`
- `PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE`

with the values from **Supabase → Settings → API Keys**.

Use the **Publishable key**, never a secret/service-role key.

## 2) Supabase database setup

Run `supabase-setup.sql` once in the Supabase SQL Editor. It enables RLS, creates the `admin_users` allowlist and `is_admin()` check, lets public visitors submit applications, and lets only designated admins read/update applications.

## 3) Deployment

This package is suitable for Cloudflare Pages Direct Upload. Create a Pages project and upload the ZIP or the extracted folder. Cloudflare Pages supports drag-and-drop Direct Upload for ZIP files/folders. The included `_redirects` file provides the clean routes `/students`, `/physicians`, `/how-it-works`, `/about`, and `/admin`.

## Important

This is a static frontend. The Supabase URL and publishable key are intentionally public in browser code; security comes from Supabase Row Level Security. Never put a Supabase secret/service-role key in `supabase-config.js`.
