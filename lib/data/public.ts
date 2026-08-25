import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

type Profile =
  Database['public']['Tables']['profiles']['Row'];

type ProjectRow =
  Database['public']['Tables']['projects']['Row'];

type ProjectCategory =
  Database['public']['Tables']['project_categories']['Row'];

type Technology =
  Database['public']['Tables']['technologies']['Row'];

type ProjectImage =
  Database['public']['Tables']['project_images']['Row'];

type Skill =
  Database['public']['Tables']['skills']['Row'];

type SkillCategory =
  Database['public']['Tables']['skill_categories']['Row'];

type Education =
  Database['public']['Tables']['education']['Row'];

type Certification =
  Database['public']['Tables']['certifications']['Row'];

type SocialLink =
  Database['public']['Tables']['social_links']['Row'];

type SectionSetting =
  Database['public']['Tables']['section_settings']['Row'];

type ProjectTechnologyJoin = {
  technology: Technology | null;
};

type ProjectQueryRow = ProjectRow & {
  category?: ProjectCategory | null;
  technologies?: ProjectTechnologyJoin[];
  images?: ProjectImage[];
};

export type Project = ProjectRow & {
  category?: ProjectCategory | null;
  technologies?: Technology[];
  images?: ProjectImage[];
};

/**
 * Public-facing data fetchers.
 * Queries rely on Supabase RLS for public access control.
 */

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to load profile:', error.message);
    return null;
  }

  return data;
}

export async function getSectionSettings(): Promise<SectionSetting[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('section_settings')
    .select('*')
    .order('display_order');

  if (error) {
    console.error('Failed to load section settings:', error.message);
    return [];
  }

  return data ?? [];
}

export function isSectionEnabled(
  sections: SectionSetting[],
  key: string
): boolean {
  const found = sections.find(
    (section: SectionSetting) => section.section_key === key
  );

  return found ? found.enabled : true;
}

export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      category:project_categories(*),
      technologies:project_technologies(
        technology:technologies(*)
      )
    `)
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('project_date', { ascending: false });

  if (error) {
    console.error('Failed to load projects:', error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    normalizeProject(row as unknown as ProjectQueryRow)
  );
}

export async function getFeaturedProject(): Promise<Project | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      category:project_categories(*),
      technologies:project_technologies(
        technology:technologies(*)
      )
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('project_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Failed to load featured project:', error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return normalizeProject(
    data as unknown as ProjectQueryRow
  );
}

export async function getProjectBySlug(
  slug: string
): Promise<Project | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      category:project_categories(*),
      technologies:project_technologies(
        technology:technologies(*)
      ),
      images:project_images(*)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.error('Failed to load project:', error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const rawProject =
    data as unknown as ProjectQueryRow;

  const project = normalizeProject(rawProject);

  project.images = [...(rawProject.images ?? [])].sort(
    (a: ProjectImage, b: ProjectImage) =>
      (a.display_order ?? 0) -
      (b.display_order ?? 0)
  );

  return project;
}

export async function getActiveCategories(): Promise<ProjectCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('project_categories')
    .select('*')
    .eq('active', true)
    .order('display_order');

  if (error) {
    console.error(
      'Failed to load project categories:',
      error.message
    );

    return [];
  }

  return data ?? [];
}

export async function getVisibleSkills(): Promise<
  (SkillCategory & { skills: Skill[] })[]
> {
  const supabase = await createClient();

  const [
    { data: categories, error: categoriesError },
    { data: skills, error: skillsError },
  ] = await Promise.all([
    supabase
      .from('skill_categories')
      .select('*')
      .eq('visible', true)
      .order('display_order'),

    supabase
      .from('skills')
      .select('*')
      .eq('visible', true)
      .order('display_order'),
  ]);

  if (categoriesError) {
    console.error(
      'Failed to load skill categories:',
      categoriesError.message
    );
  }

  if (skillsError) {
    console.error(
      'Failed to load skills:',
      skillsError.message
    );
  }

  const categoryRows: SkillCategory[] =
    categories ?? [];

  const skillRows: Skill[] =
    skills ?? [];

  const grouped: (SkillCategory & {
    skills: Skill[];
  })[] = categoryRows.map(
    (category: SkillCategory) => ({
      ...category,

      skills: skillRows.filter(
        (skill: Skill) =>
          skill.category_id === category.id
      ),
    })
  );

  const uncategorized = skillRows.filter(
    (skill: Skill) => !skill.category_id
  );

  if (uncategorized.length > 0) {
    grouped.push({
      id: 'uncategorized',
      name: 'Other',
      slug: 'other',
      display_order: 999,
      visible: true,
      skills: uncategorized,
    } as SkillCategory & { skills: Skill[] });
  }

  return grouped.filter(
    (group) => group.skills.length > 0
  );
}

export async function getVisibleEducation(): Promise<Education[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('education')
    .select('*')
    .eq('visible', true)
    .order('display_order');

  if (error) {
    console.error(
      'Failed to load education:',
      error.message
    );

    return [];
  }

  return data ?? [];
}

export async function getVisibleCertifications(): Promise<
  Certification[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .eq('visible', true)
    .order('display_order');

  if (error) {
    console.error(
      'Failed to load certifications:',
      error.message
    );

    return [];
  }

  return data ?? [];
}

export async function getEnabledSocialLinks(): Promise<SocialLink[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('enabled', true)
    .order('display_order');

  if (error) {
    console.error(
      'Failed to load social links:',
      error.message
    );

    return [];
  }

  return data ?? [];
}

function normalizeProject(
  row: ProjectQueryRow
): Project {
  return {
    ...row,

    technologies: (row.technologies ?? [])
      .map(
        (item: ProjectTechnologyJoin) =>
          item.technology
      )
      .filter(
        (technology): technology is Technology =>
          technology !== null
      ),
  };
}