'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function toggleSection(id: string, enabled: boolean) {
  const supabase = await createClient();
  await supabase.from('section_settings').update({ enabled }).eq('id', id);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings/sections');
}

export async function reorderSection(id: string, display_order: number) {
  const supabase = await createClient();
  await supabase.from('section_settings').update({ display_order }).eq('id', id);
  revalidatePath('/', 'layout');
}
