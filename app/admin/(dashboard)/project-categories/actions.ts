'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { categorySchema } from '@/lib/validation/misc';

export async function upsertCategory(formData: FormData) {
  const id = formData.get('id')?.toString();
  const raw = {
    name: formData.get('name')?.toString() ?? '',
    slug: formData.get('slug')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    icon: formData.get('icon')?.toString() ?? '',
    display_order: Number(formData.get('display_order') ?? 0),
    active: formData.get('active') === 'on',
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid data' };

  const supabase = await createClient();
  const payload = { ...parsed.data, description: parsed.data.description || null, icon: parsed.data.icon || null };

  const { error } = id
    ? await supabase.from('project_categories').update(payload).eq('id', id)
    : await supabase.from('project_categories').insert(payload);

  if (error) return { error: error.message.includes('duplicate') ? 'That slug is already in use.' : 'Failed to save category.' };

  revalidatePath('/admin/project-categories');
  revalidatePath('/projects');
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  // Safe delete: detach any projects referencing this category rather than blocking or cascading data loss.
  await supabase.from('projects').update({ category_id: null }).eq('category_id', id);
  await supabase.from('project_categories').delete().eq('id', id);
  revalidatePath('/admin/project-categories');
  revalidatePath('/projects');
}
