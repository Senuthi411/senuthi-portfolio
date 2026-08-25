'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { educationSchema } from '@/lib/validation/misc';

export async function upsertEducation(formData: FormData) {
  const id = formData.get('id')?.toString();
  const raw = {
    degree: formData.get('degree')?.toString() ?? '',
    institution: formData.get('institution')?.toString() ?? '',
    start_date: formData.get('start_date')?.toString() ?? '',
    end_date: formData.get('end_date')?.toString() ?? '',
    currently_studying: formData.get('currently_studying') === 'on',
    description: formData.get('description')?.toString() ?? '',
    display_order: Number(formData.get('display_order') ?? 0),
    visible: formData.get('visible') === 'on',
  };
  const parsed = educationSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid data' };

  const supabase = await createClient();
  const payload = {
    ...parsed.data,
    start_date: parsed.data.start_date || null,
    end_date: parsed.data.currently_studying ? null : (parsed.data.end_date || null),
    description: parsed.data.description || null,
  };

  const { error } = id
    ? await supabase.from('education').update(payload).eq('id', id)
    : await supabase.from('education').insert(payload);

  if (error) return { error: 'Failed to save education entry.' };
  revalidatePath('/admin/education');
  revalidatePath('/education');
  revalidatePath('/');
  return { success: true };
}

export async function deleteEducation(id: string) {
  const supabase = await createClient();
  await supabase.from('education').delete().eq('id', id);
  revalidatePath('/admin/education');
  revalidatePath('/education');
}
