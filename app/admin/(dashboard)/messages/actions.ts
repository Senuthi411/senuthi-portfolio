'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function markMessageRead(id: string, read: boolean) {
  const supabase = await createClient();
  await supabase.from('contact_messages').update({ read }).eq('id', id);
  revalidatePath('/admin/messages');
}

export async function deleteMessage(id: string) {
  const supabase = await createClient();
  await supabase.from('contact_messages').delete().eq('id', id);
  revalidatePath('/admin/messages');
}
