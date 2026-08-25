import { createClient } from '@/lib/supabase/server';
import type { Profile, Project, Skill, SkillCategory, Education, Certification, SocialLink, SectionSetting, ProjectCategory } from '@/types/database';

/**
 * Public-facing data fetchers. All queries rely on RLS to scope results
 * to published/visible/enabled rows — no service-role key involved.
 */

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').limit(1).maybeSingle();
  return data;
}

export async function getSectionSettings(): Promise<SectionSetting[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('section_settings').select('*').order('display_order');
  return data ?? [];
}

export function isSectionEnabled(sections: SectionSetting[], key: string): boolean {
  const found = sections.find((s) => s.section_key === key);
  return found ? found.enabled : true;
}

export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('*, category:project_categories(*), technologies:project_technologies(technology:technologies(*))')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('project_date', { ascending: false });

  return (data ?? []).map(normalizeProject);
}

export async function getFeaturedProject(): Promise<Project | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('*, category:project_categories(*), technologies:project_technologies(technology:technologies(*))')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('project_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? normalizeProject(data) : null;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('*, category:project_categories(*), technologies:project_technologies(technology:technologies(*)), images:project_images(*)')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!data) return null;
  const project = normalizeProject(data);
  project.images = (data.images ?? []).sort((a: any, b: any) => a.display_order - b.display_order);
  return project;
}

export async function getActiveCategories(): Promise<ProjectCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('project_categories')
    .select('*')
    .eq('active', true)
    .order('display_order');
  return data ?? [];
}

export async function getVisibleSkills(): Promise<(SkillCategory & { skills: Skill[] })[]> {
  const supabase = await createClient();
  const [{ data: categories }, { data: skills }] = await Promise.all([
    supabase.from('skill_categories').select('*').eq('visible', true).order('display_order'),
    supabase.from('skills').select('*').eq('visible', true).order('display_order'),
  ]);

  const cats = categories ?? [];
  const all = skills ?? [];

  const grouped = cats.map((cat) => ({ ...cat, skills: all.filter((s) => s.category_id === cat.id) }));
  const uncategorized = all.filter((s) => !s.category_id);
  if (uncategorized.length) {
    grouped.push({ id: 'uncategorized', name: 'Other', slug: 'other', display_order: 999, visible: true, skills: uncategorized });
  }
  return grouped.filter((g) => g.skills.length > 0);
}

export async function getVisibleEducation(): Promise<Education[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('education').select('*').eq('visible', true).order('display_order');
  return data ?? [];
}

export async function getVisibleCertifications(): Promise<Certification[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('certifications').select('*').eq('visible', true).order('display_order');
  return data ?? [];
}

export async function getEnabledSocialLinks(): Promise<SocialLink[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('social_links').select('*').eq('enabled', true).order('display_order');
  return data ?? [];
}

// `row` is typed `any` here because Supabase's generated row shape for a
// query with nested joins (category:project_categories(*), technologies:...)
// isn't expressible from the hand-written Database type without running
// `supabase gen types` against a live project. Once you've run migrations,
// regenerate types with the Supabase CLI and this can be tightened.
function normalizeProject(row: any): Project {
  return {
    ...row,
    technologies: (row.technologies ?? []).map((t: any) => t.technology).filter(Boolean),
  };
}
