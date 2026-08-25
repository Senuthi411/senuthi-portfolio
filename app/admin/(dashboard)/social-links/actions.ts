'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { socialLinkSchema } from '@/lib/validation/misc';

export async function upsertSocialLink(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const id = formData.get('id')?.toString();
  const raw = {
    platform: formData.get('platform')?.toString() ?? '',
    url: formData.get('url')?.toString() ?? '',
    display_order: Number(formData.get('display_order') ?? 0),
    enabled: formData.get('enabled') === 'on',
  };
  const parsed = socialLinkSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid data',
    };
  }

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from('social_links').update(parsed.data).eq('id', id)
    : await supabase.from('social_links').insert(parsed.data);

  if (error) return { success: false, error: 'Failed to save social link.' };
  revalidatePath('/admin/social-links');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteSocialLink(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!id) return { success: false, error: 'Social link ID is required.' };

  const supabase = await createClient();
  const { error } = await supabase.from('social_links').delete().eq('id', id);
  if (error) return { success: false, error: 'Failed to delete social link.' };

  revalidatePath('/admin/social-links');
  revalidatePath('/', 'layout');
  return { success: true };
}
