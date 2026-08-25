'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { certificationSchema } from '@/lib/validation/misc';

export async function upsertCertification(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const id = formData.get('id')?.toString();
  const raw = {
    title: formData.get('title')?.toString() ?? '',
    organization: formData.get('organization')?.toString() ?? '',
    issue_date: formData.get('issue_date')?.toString() ?? '',
    credential_id: formData.get('credential_id')?.toString() ?? '',
    credential_url: formData.get('credential_url')?.toString() ?? '',
    certificate_image_url: formData.get('certificate_image_url')?.toString() ?? '',
    category: formData.get('category')?.toString() ?? '',
    visible: formData.get('visible') === 'on',
    display_order: Number(formData.get('display_order') ?? 0),
  };
  const parsed = certificationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid data',
    };
  }

  const supabase = await createClient();
  const payload = {
    ...parsed.data,
    issue_date: parsed.data.issue_date || null,
    credential_id: parsed.data.credential_id || null,
    credential_url: parsed.data.credential_url || null,
    certificate_image_url: parsed.data.certificate_image_url || null,
    category: parsed.data.category || null,
  };

  const { error } = id
    ? await supabase.from('certifications').update(payload).eq('id', id)
    : await supabase.from('certifications').insert(payload);

  if (error) return { success: false, error: 'Failed to save certification.' };
  revalidatePath('/admin/certifications');
  revalidatePath('/education');
  return { success: true };
}

export async function deleteCertification(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!id) {
    return { success: false, error: 'Certification ID is required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('certifications').delete().eq('id', id);

  if (error) {
    return { success: false, error: 'Failed to delete certification.' };
  }

  revalidatePath('/admin/certifications');
  revalidatePath('/education');
  return { success: true };
}
