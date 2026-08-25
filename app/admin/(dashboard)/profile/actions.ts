'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { profileSchema } from '@/lib/validation/profile';

export interface ProfileActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function updateProfile(_prevState: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = profileSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return { error: 'Please check the fields below.', fieldErrors };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase.from('profiles').select('id').limit(1).maybeSingle();

  const payload = {
    ...parsed.data,
    hero_description: parsed.data.hero_description || null,
    biography: parsed.data.biography || null,
    profile_photo_url: parsed.data.profile_photo_url || null,
    location: parsed.data.location || null,
    current_status: parsed.data.current_status || null,
    current_focus: parsed.data.current_focus || null,
    interests: parsed.data.interests || null,
    degree: parsed.data.degree || null,
    university: parsed.data.university || null,
    public_email: parsed.data.public_email || null,
    availability: parsed.data.availability || null,
    resume_url: parsed.data.resume_url || null,
  };

  const { error } = existing
    ? await supabase.from('profiles').update(payload).eq('id', existing.id)
    : await supabase.from('profiles').insert(payload);

  if (error) {
    return { error: 'Failed to save profile. Please try again.' };
  }

  // Public pages read profile data on every request (revalidate = 0),
  // but revalidate explicitly too in case that changes later.
  revalidatePath('/', 'layout');
  return { success: true };
}
