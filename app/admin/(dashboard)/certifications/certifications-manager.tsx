'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function upsertCertification(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const id = formData.get('id')?.toString();

    const title = formData.get('title')?.toString().trim() ?? '';
    const organization =
      formData.get('organization')?.toString().trim() ?? '';

    const issueDate =
      formData.get('issue_date')?.toString().trim() || null;

    const category =
      formData.get('category')?.toString().trim() || null;

    const credentialId =
      formData.get('credential_id')?.toString().trim() || null;

    const credentialUrl =
      formData.get('credential_url')?.toString().trim() || null;

    const certificateImageUrl =
      formData.get('certificate_image_url')?.toString().trim() || null;

    const visible = formData.get('visible') === 'on';

    if (!title) {
      return {
        success: false,
        error: 'Certification title is required.',
      };
    }

    if (!organization) {
      return {
        success: false,
        error: 'Issuing organization is required.',
      };
    }

    const certificationData = {
      title,
      organization,
      issue_date: issueDate,
      category,
      credential_id: credentialId,
      credential_url: credentialUrl,
      certificate_image_url: certificateImageUrl,
      visible,
    };

    if (id) {
      const { error } = await supabase
        .from('certifications')
        .update(certificationData)
        .eq('id', id);

      if (error) {
        console.error('Update certification error:', error);

        return {
          success: false,
          error: error.message,
        };
      }
    } else {
      const { error } = await supabase
        .from('certifications')
        .insert(certificationData);

      if (error) {
        console.error('Insert certification error:', error);

        return {
          success: false,
          error: error.message,
        };
      }
    }

    revalidatePath('/admin/certifications');
    revalidatePath('/certifications');
    revalidatePath('/');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Certification save error:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to save certification.',
    };
  }
}

export async function deleteCertification(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) {
      return {
        success: false,
        error: 'Certification ID is required.',
      };
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete certification error:', error);

      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/admin/certifications');
    revalidatePath('/certifications');
    revalidatePath('/');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected delete certification error:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to delete certification.',
    };
  }
}