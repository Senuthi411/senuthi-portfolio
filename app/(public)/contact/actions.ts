'use server';

import { createClient } from '@/lib/supabase/server';
import { contactSchema } from '@/lib/validation/contact';

export interface ContactActionState {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitContactMessage(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const raw = {
    name: formData.get('name')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
    subject: formData.get('subject')?.toString() ?? '',
    message: formData.get('message')?.toString() ?? '',
    company_website: formData.get('company_website')?.toString() ?? '', // honeypot
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path[0] as string] = issue.message;
    }
    return { success: false, error: 'Please check the fields below.', fieldErrors };
  }

  // Honeypot tripped — silently report success so bots don't learn anything.
  if (parsed.data.company_website) {
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('contact_messages').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });

  if (error) {
    return { success: false, error: 'Something went wrong sending your message. Please try again.' };
  }

  return { success: true };
}
