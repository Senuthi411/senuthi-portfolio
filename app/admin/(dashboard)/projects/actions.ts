'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { projectSchema } from '@/lib/validation/project';
import { slugify } from '@/lib/utils';
import type { Database, TablesInsert, TablesUpdate } from '@/types/supabase';

type DbClient = SupabaseClient<Database>;
type ProjectImage = Database['public']['Tables']['project_images']['Row'];

export interface ProjectActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

type ParsedProjectForm = Record<string, FormDataEntryValue | boolean> & {
  is_team: boolean;
  is_featured: boolean;
  is_published: boolean;
};

function parseProjectForm(formData: FormData): ParsedProjectForm {
  const raw = Object.fromEntries(formData.entries());
  return {
    ...raw,
    is_team: formData.get('is_team') === 'on',
    is_featured: formData.get('is_featured') === 'on',
    is_published: formData.get('is_published') === 'on',
  };
}

async function ensureUniqueSlug(supabase: DbClient, slug: string, excludeId?: string): Promise<string> {
  let candidate = slug;
  let suffix = 2;
  // Small bounded loop — a portfolio has a handful of projects, not thousands.
  for (let i = 0; i < 50; i++) {
    let query = supabase.from('projects').select('id').eq('slug', candidate);
    if (excludeId) query = query.neq('id', excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${slug}-${suffix}`;
    suffix++;
  }
  return `${slug}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function createProject(_prevState: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  const raw = parseProjectForm(formData);
  if (!raw.slug && raw.title) raw.slug = slugify(raw.title as string);

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
    return { error: 'Please check the fields below.', fieldErrors };
  }

  const supabase = await createClient();
  const uniqueSlug = await ensureUniqueSlug(supabase, parsed.data.slug);

  const technologyNames = formData
    .get('technologies')
    ?.toString()
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean) ?? [];

  const { data: project, error } = await supabase
    .from('projects')
    .insert({ ...nullifyEmpty(parsed.data), slug: uniqueSlug })
    .select('id')
    .single();

  if (error || !project) {
    return { error: 'Failed to create project. Please try again.' };
  }

  if (technologyNames.length > 0) {
    await linkTechnologies(supabase, project.id, technologyNames);
  }

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  redirect(`/admin/projects/${project.id}/edit`);
}

export async function updateProject(
  id: string,
  _prevState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const raw = parseProjectForm(formData);
  if (!raw.slug && raw.title) raw.slug = slugify(raw.title as string);

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
    return { error: 'Please check the fields below.', fieldErrors };
  }

  const supabase = await createClient();
  const uniqueSlug = await ensureUniqueSlug(supabase, parsed.data.slug, id);

  const { error } = await supabase
    .from('projects')
    .update({ ...nullifyEmpty(parsed.data), slug: uniqueSlug })
    .eq('id', id);

  if (error) {
    return { error: 'Failed to save project. Please try again.' };
  }

  const technologyNames = formData
    .get('technologies')
    ?.toString()
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean) ?? [];

  await supabase.from('project_technologies').delete().eq('project_id', id);
  if (technologyNames.length > 0) {
    await linkTechnologies(supabase, id, technologyNames);
  }

  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  revalidatePath(`/projects/${uniqueSlug}`);
  return { success: true };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  await supabase.from('projects').delete().eq('id', id);
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
}

export async function togglePublish(id: string, nextValue: boolean) {
  const supabase = await createClient();
  await supabase.from('projects').update({ is_published: nextValue }).eq('id', id);
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
}

export async function insertProjectImage(
  image: TablesInsert<'project_images'>
): Promise<{ success: boolean; image?: ProjectImage; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('project_images')
    .insert(image)
    .select('*')
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? 'Failed to save image.' };
  }

  return { success: true, image: data as ProjectImage };
}

export async function updateProjectImageOrder(
  id: string,
  displayOrder: number
): Promise<{ success: boolean; error?: string }> {
  const payload: TablesUpdate<'project_images'> = { display_order: displayOrder };
  const supabase = await createClient();
  const { error } = await supabase
    .from('project_images')
    .update(payload)
    .eq('id', id);

  return error
    ? { success: false, error: error.message }
    : { success: true };
}

async function linkTechnologies(supabase: DbClient, projectId: string, names: string[]) {
  for (const name of names) {
    let { data: tech } = await supabase.from('technologies').select('id').ilike('name', name).maybeSingle();
    if (!tech) {
      const { data: created } = await supabase.from('technologies').insert({ name }).select('id').single();
      tech = created;
    }
    if (tech) {
      await supabase.from('project_technologies').insert({ project_id: projectId, technology_id: tech.id }).select();
    }
  }
}

function nullifyEmpty<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    out[key] = val === '' ? null : val;
  }
  return out as T;
}
