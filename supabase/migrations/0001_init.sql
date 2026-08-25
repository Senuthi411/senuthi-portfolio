-- ============================================================================
-- Portfolio + CMS schema
-- Single-owner portfolio. Public (anon) role: read-only on published content.
-- Authenticated admin (the one Supabase Auth user this app is provisioned
-- for): full read/write. See policies at the bottom of each table block.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles  (single row: the portfolio owner)
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null default 'Senuthi Yuhansa',
  title text not null default 'Information Technology Undergraduate',
  hero_heading text not null default 'Learning, Building & Exploring Technology',
  hero_description text not null default
    'I''m an Information Technology undergraduate interested in learning how technology works, exploring new ideas, developing technical skills, and building practical projects.',
  badge_text text default 'Undergraduate | Learning & Building',
  biography text,
  profile_photo_url text,
  location text,
  current_status text,
  current_focus text,
  interests text,
  degree text,
  university text,
  public_email text,
  availability text,
  resume_url text,
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are publicly readable"
  on profiles for select
  to anon, authenticated
  using (true);

create policy "profiles are editable by authenticated admin"
  on profiles for all
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- project_categories
-- ----------------------------------------------------------------------------
create table if not exists project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table project_categories enable row level security;

create policy "active categories are publicly readable"
  on project_categories for select
  to anon
  using (active = true);

create policy "admin reads all categories"
  on project_categories for select
  to authenticated
  using (true);

create policy "admin manages categories"
  on project_categories for insert
  to authenticated with check (true);
create policy "admin updates categories"
  on project_categories for update
  to authenticated using (true) with check (true);
create policy "admin deletes categories"
  on project_categories for delete
  to authenticated using (true);

-- ----------------------------------------------------------------------------
-- technologies  (normalized tag list, e.g. "Arduino", "C++")
-- ----------------------------------------------------------------------------
create table if not exists technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table technologies enable row level security;

create policy "technologies are publicly readable"
  on technologies for select to anon, authenticated using (true);
create policy "admin manages technologies"
  on technologies for insert to authenticated with check (true);
create policy "admin updates technologies"
  on technologies for update to authenticated using (true) with check (true);
create policy "admin deletes technologies"
  on technologies for delete to authenticated using (true);

-- ----------------------------------------------------------------------------
-- projects
-- ----------------------------------------------------------------------------
create type project_status as enum ('draft', 'prototype', 'in_progress', 'completed', 'archived');

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  category_id uuid references project_categories(id) on delete set null,
  status project_status not null default 'draft',
  project_role text,
  is_team boolean not null default false,
  team_details text,
  project_date date,
  cover_image_url text,

  problem text,
  goal text,
  solution text,
  how_it_works text,
  hardware_components text,
  software_technologies text,
  architecture_description text,
  architecture_image_url text,
  circuit_diagram_url text,
  wiring_image_url text,
  development_process text,
  challenges text,
  lessons_learned text,
  future_improvements text,

  github_url text,
  documentation_url text,
  demo_url text,
  video_url text,

  is_featured boolean not null default false,
  is_published boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_published on projects (is_published, is_featured);
create index if not exists idx_projects_category on projects (category_id);

alter table projects enable row level security;

create policy "published projects are publicly readable"
  on projects for select to anon using (is_published = true);
create policy "admin reads all projects"
  on projects for select to authenticated using (true);
create policy "admin inserts projects"
  on projects for insert to authenticated with check (true);
create policy "admin updates projects"
  on projects for update to authenticated using (true) with check (true);
create policy "admin deletes projects"
  on projects for delete to authenticated using (true);

-- ----------------------------------------------------------------------------
-- project_technologies  (join table)
-- ----------------------------------------------------------------------------
create table if not exists project_technologies (
  project_id uuid not null references projects(id) on delete cascade,
  technology_id uuid not null references technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);

alter table project_technologies enable row level security;

create policy "project_technologies readable for published projects"
  on project_technologies for select to anon
  using (exists (select 1 from projects p where p.id = project_id and p.is_published = true));
create policy "admin reads all project_technologies"
  on project_technologies for select to authenticated using (true);
create policy "admin manages project_technologies"
  on project_technologies for insert to authenticated with check (true);
create policy "admin deletes project_technologies"
  on project_technologies for delete to authenticated using (true);

-- ----------------------------------------------------------------------------
-- project_images  (gallery)
-- ----------------------------------------------------------------------------
create table if not exists project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table project_images enable row level security;

create policy "gallery images readable for published projects"
  on project_images for select to anon
  using (exists (select 1 from projects p where p.id = project_id and p.is_published = true));
create policy "admin reads all project_images"
  on project_images for select to authenticated using (true);
create policy "admin manages project_images"
  on project_images for insert to authenticated with check (true);
create policy "admin updates project_images"
  on project_images for update to authenticated using (true) with check (true);
create policy "admin deletes project_images"
  on project_images for delete to authenticated using (true);

-- ----------------------------------------------------------------------------
-- skill_categories / skills
-- ----------------------------------------------------------------------------
create table if not exists skill_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order integer not null default 0,
  visible boolean not null default true
);

alter table skill_categories enable row level security;
create policy "visible skill_categories are publicly readable"
  on skill_categories for select to anon using (visible = true);
create policy "admin reads all skill_categories"
  on skill_categories for select to authenticated using (true);
create policy "admin manages skill_categories"
  on skill_categories for insert to authenticated with check (true);
create policy "admin updates skill_categories"
  on skill_categories for update to authenticated using (true) with check (true);
create policy "admin deletes skill_categories"
  on skill_categories for delete to authenticated using (true);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references skill_categories(id) on delete set null,
  icon text,
  display_order integer not null default 0,
  visible boolean not null default true
);

alter table skills enable row level security;
create policy "visible skills are publicly readable"
  on skills for select to anon using (visible = true);
create policy "admin reads all skills"
  on skills for select to authenticated using (true);
create policy "admin manages skills"
  on skills for insert to authenticated with check (true);
create policy "admin updates skills"
  on skills for update to authenticated using (true) with check (true);
create policy "admin deletes skills"
  on skills for delete to authenticated using (true);

-- ----------------------------------------------------------------------------
-- education
-- ----------------------------------------------------------------------------
create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  degree text not null,
  institution text not null,
  start_date date,
  end_date date,
  currently_studying boolean not null default false,
  description text,
  display_order integer not null default 0,
  visible boolean not null default true
);

alter table education enable row level security;
create policy "visible education is publicly readable"
  on education for select to anon using (visible = true);
create policy "admin reads all education"
  on education for select to authenticated using (true);
create policy "admin manages education"
  on education for insert to authenticated with check (true);
create policy "admin updates education"
  on education for update to authenticated using (true) with check (true);
create policy "admin deletes education"
  on education for delete to authenticated using (true);

-- ----------------------------------------------------------------------------
-- certifications
-- ----------------------------------------------------------------------------
create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  issue_date date,
  credential_id text,
  credential_url text,
  certificate_image_url text,
  category text,
  visible boolean not null default true,
  display_order integer not null default 0
);

alter table certifications enable row level security;
create policy "visible certifications are publicly readable"
  on certifications for select to anon using (visible = true);
create policy "admin reads all certifications"
  on certifications for select to authenticated using (true);
create policy "admin manages certifications"
  on certifications for insert to authenticated with check (true);
create policy "admin updates certifications"
  on certifications for update to authenticated using (true) with check (true);
create policy "admin deletes certifications"
  on certifications for delete to authenticated using (true);

-- ----------------------------------------------------------------------------
-- social_links
-- ----------------------------------------------------------------------------
create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  display_order integer not null default 0,
  enabled boolean not null default true
);

alter table social_links enable row level security;
create policy "enabled social_links are publicly readable"
  on social_links for select to anon using (enabled = true);
create policy "admin reads all social_links"
  on social_links for select to authenticated using (true);
create policy "admin manages social_links"
  on social_links for insert to authenticated with check (true);
create policy "admin updates social_links"
  on social_links for update to authenticated using (true) with check (true);
create policy "admin deletes social_links"
  on social_links for delete to authenticated using (true);

-- ----------------------------------------------------------------------------
-- section_settings  (toggle public sections on/off, ordering)
-- ----------------------------------------------------------------------------
create table if not exists section_settings (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique, -- 'hero' | 'about' | 'projects' | 'skills' | 'education' | 'certifications' | 'contact' ...
  label text not null,
  enabled boolean not null default true,
  display_order integer not null default 0
);

alter table section_settings enable row level security;
create policy "section_settings are publicly readable"
  on section_settings for select to anon, authenticated using (true);
create policy "admin manages section_settings"
  on section_settings for insert to authenticated with check (true);
create policy "admin updates section_settings"
  on section_settings for update to authenticated using (true) with check (true);
create policy "admin deletes section_settings"
  on section_settings for delete to authenticated using (true);

-- ----------------------------------------------------------------------------
-- contact_messages
-- ----------------------------------------------------------------------------
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

-- Public can INSERT (submit the form) but never read messages back.
create policy "anyone can submit a contact message"
  on contact_messages for insert to anon with check (true);
create policy "admin reads contact_messages"
  on contact_messages for select to authenticated using (true);
create policy "admin updates contact_messages"
  on contact_messages for update to authenticated using (true) with check (true);
create policy "admin deletes contact_messages"
  on contact_messages for delete to authenticated using (true);

-- ----------------------------------------------------------------------------
-- site_settings  (key/value store for misc singleton settings)
-- ----------------------------------------------------------------------------
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb
);

alter table site_settings enable row level security;
create policy "site_settings are publicly readable"
  on site_settings for select to anon, authenticated using (true);
create policy "admin manages site_settings"
  on site_settings for insert to authenticated with check (true);
create policy "admin updates site_settings"
  on site_settings for update to authenticated using (true) with check (true);

-- ----------------------------------------------------------------------------
-- updated_at trigger helper
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger trg_projects_updated_at
  before update on projects
  for each row execute function set_updated_at();
