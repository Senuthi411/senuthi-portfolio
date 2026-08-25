'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { skillSchema, skillCategorySchema } from '@/lib/validation/misc';

export async function upsertSkill(formData: FormData) {
  const id = formData.get('id')?.toString();
  const categoryId = formData.get('category_id')?.toString();
  const raw = {
    name: formData.get('name')?.toString() ?? '',
    category_id: categoryId || null,
    icon: formData.get('icon')?.toString() ?? '',
    display_order: Number(formData.get('display_order') ?? 0),
    visible: formData.get('visible') === 'on',
  };
  const parsed = skillSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid data' };

  const supabase = await createClient();
  const payload = { ...parsed.data, icon: parsed.data.icon || null };
  const { error } = id
    ? await supabase.from('skills').update(payload).eq('id', id)
    : await supabase.from('skills').insert(payload);

  if (error) return { error: 'Failed to save skill.' };
  revalidatePath('/admin/skills');
  revalidatePath('/skills');
  return { success: true };
}

export async function deleteSkill(id: string) {
  const supabase = await createClient();
  await supabase.from('skills').delete().eq('id', id);
  revalidatePath('/admin/skills');
  revalidatePath('/skills');
}

export async function upsertSkillCategory(formData: FormData) {
  const id = formData.get('id')?.toString();
  const raw = {
    name: formData.get('name')?.toString() ?? '',
    slug: formData.get('slug')?.toString() ?? '',
    display_order: Number(formData.get('display_order') ?? 0),
    visible: formData.get('visible') === 'on',
  };
  const parsed = skillCategorySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid data' };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from('skill_categories').update(parsed.data).eq('id', id)
    : await supabase.from('skill_categories').insert(parsed.data);

  if (error) return { error: error.message.includes('duplicate') ? 'That slug is already in use.' : 'Failed to save category.' };
  revalidatePath('/admin/skills');
  revalidatePath('/skills');
  return { success: true };
}

export async function deleteSkillCategory(id: string) {
  const supabase = await createClient();
  await supabase.from('skills').update({ category_id: null }).eq('category_id', id);
  await supabase.from('skill_categories').delete().eq('id', id);
  revalidatePath('/admin/skills');
  revalidatePath('/skills');
}
