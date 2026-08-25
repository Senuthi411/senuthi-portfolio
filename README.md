<<<<<<< HEAD
# Senuthi Yuhansa — Portfolio + CMS

A personal portfolio for **Senuthi Yuhansa**, Information Technology Undergraduate, with a private
admin dashboard so all public content — profile, projects, skills, education, certifications, links,
resume — can be edited without touching code.

Currently the portfolio contains one project: **Braille Printer**. Future projects are added entirely
through `/admin/projects/new`.

## Tech Stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL, Auth, Storage)
- Deploys to **Vercel**

## Features

- Public site: Home, About, Projects, dynamic Project case-study pages, Skills, Education,
  Certifications, Contact (with a working, spam-resisted contact form)
- Sections (Hero, About, Projects, Skills, Education, Certifications, Contact) can be toggled on/off
  from the admin — public pages honor this at request time
- Admin dashboard (single-owner, Supabase Auth, no public signup) covering:
  - Profile (identity, bio, hero copy, resume)
  - Projects (fast "basic fields" create flow, collapsible advanced sections, technology tags,
    gallery upload/reorder/delete, publish/unpublish, delete with confirmation)
  - Project Categories (dynamic — not hardcoded)
  - Skills & Skill Categories
  - Education
  - Certifications (section stays hidden publicly until at least one exists)
  - Social Links
  - Section visibility settings
- Row Level Security on every table: public (anon) can only read published/visible/enabled content;
  all writes require an authenticated admin session
- Storage buckets per asset type, with file-type/size validation and cleanup of replaced files
- Empty/optional fields never render empty headings on the public site
- Responsive from 390px mobile through large desktop, including the admin (drawer sidebar on mobile)
- SEO: dynamic metadata per project, sitemap, robots.txt
- No fake data: seed content only includes what was confirmed in the provided design files

## Project Structure

```
app/
  (public)/            Public site routes (layout with navbar/footer)
  admin/
    (auth)/login/      Login page — outside the protected shell
    (dashboard)/       Everything behind auth: dashboard, profile, projects, etc.
components/
  public/              Navbar, Footer, ProjectCard, etc.
  admin/                Sidebar, DataTable, ImageUploader, ConfirmDialog
lib/
  supabase/            Server / browser / middleware clients + storage helpers
  validation/          Zod schemas (client + server validated)
  data/public.ts       RLS-scoped read queries for the public site
types/database.ts      Hand-written types matching the schema
supabase/migrations/   SQL migrations (schema, seed, storage)
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and note your:
- Project URL
- `anon` public API key

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is included as a placeholder for future server-only maintenance scripts
(e.g. cleaning up orphaned storage files) — the app as built does not require it, and it must **never**
be exposed to the client bundle or committed.

### 4. Run the database migrations

In the Supabase dashboard, open **SQL Editor** and run, in order:

1. `supabase/migrations/0001_init.sql` — schema, RLS policies
2. `supabase/migrations/0002_seed.sql` — initial profile + Braille Printer project
3. `supabase/migrations/0003_storage.sql` — storage buckets + policies

(Or use the Supabase CLI: `supabase db push` if you have the CLI linked to your project.)

### 5. Create your admin user

In the Supabase dashboard: **Authentication → Users → Add User**. Create one user with your email and
a password — this is the only account that can sign in to `/admin`. There is no public signup route
anywhere in the app.

### 6. Storage buckets

Migration `0003_storage.sql` creates all required buckets (`profile-images`, `project-covers`,
`project-gallery`, `certificates`, `resume`, `diagrams`) with public-read policies. No manual bucket
creation needed if you ran that migration.

### 7. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin/login` to sign in.

### 8. Build for production

```bash
npm run build
npm run lint
```

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add the same environment variables from `.env.local` in the Vercel project settings
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` — set this to
   your production domain).
4. Deploy.
5. **Custom domain**: add it later under Vercel → Project → Settings → Domains, then update
   `NEXT_PUBLIC_SITE_URL` to match.

## How to Edit Content Going Forward

**Update your profile:**
`/admin/login` → Profile → edit fields → Save Changes → homepage/about page update immediately.

**Edit the Braille Printer project:**
`/admin/login` → Projects → Braille Printer → edit → Save Changes → the public case-study page updates
immediately (pages use `revalidate = 0`, so no rebuild is needed).

**Add a future project:**
`/admin/login` → Projects → Add Project → fill in Name, Short Description, Category, Status, Cover
Image (≈1 minute) → optionally expand the advanced sections for the full case study → check Published
→ Create Project. It appears on `/projects` immediately.

None of this requires editing source code or redeploying.

## Security Notes

- RLS is enabled on every table; public (anon) role can only `select` rows that are published /
  visible / enabled. All writes require an authenticated session.
- The Supabase service-role key is never used client-side.
- Admin routes are protected server-side in `middleware.ts` and again in the dashboard layout —
  client-side checks are not the only guard.
- The contact form has a honeypot field and server-side Zod validation; submissions are insert-only
  from the public role and readable only by the admin.
- No secrets are committed; `.env.local` is gitignored.

## Known Limitations / Honest Notes

- **This codebase has not been run through `npm install` / `tsc` / `eslint` / `npm run build`.** The
  sandbox this was built in has no network access to the npm registry, so those commands cannot be
  executed here — not "were skipped," genuinely cannot run. What *was* done instead, by hand: every
  internal `@/...` import was cross-checked against the actual file tree; every `params`/`searchParams`
  usage was checked against the Next.js 15 async-Promise API; `useActionState` imports were checked
  against the React 19 location; every storage bucket name was cross-checked between the SQL migration
  and the app's `STORAGE_BUCKETS` constant; every foreign key, unique constraint, and RLS policy in the
  migrations was read and traced against the app code that depends on it; and two real bugs (a success
  toast that could fire before/regardless of the actual server result, in both the project and profile
  admin forms) were found this way and fixed. That's a real review, but it is not a substitute for an
  actual compile. **Run `npm install && npx tsc --noEmit && npm run lint && npm run build` yourself
  before deploying — treat that as mandatory, not optional**, and report back anything that surfaces.
- The Braille Printer seed content is drawn from your provided design mockups (Case Study and Edit
  Project screens) — genuinely specific-sounding outcome metrics from the Edit Project mockup (e.g.
  "85% cost reduction", "3 international replications") were deliberately **not** seeded, since they
  read like placeholder copy rather than confirmed facts. Add them via `/admin/projects` if accurate.
- All admin RLS policies grant access `to authenticated` (any signed-in Supabase user), not to a
  specific user ID. Since there is no public signup route anywhere in the app, the only way to become
  "authenticated" is an account you create yourself in the Supabase dashboard — so in practice this is
  single-owner, as specified. Just don't create a second Supabase Auth user unless you want them to
  have full admin access too.
=======
# senuthi-portfolio
>>>>>>> 129e661df6896d92c594d1b46f70e0b647d0b3a8
