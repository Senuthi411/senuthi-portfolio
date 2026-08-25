import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(2).max(120),
  title: z.string().min(2).max(160),
  hero_heading: z.string().max(200).optional().or(z.literal('')),
  hero_description: z.string().max(600).optional().or(z.literal('')),
  badge_text: z.string().max(120).optional().or(z.literal('')),
  biography: z.string().max(2000).optional().or(z.literal('')),
  profile_photo_url: z.string().url().optional().or(z.literal('')),
  location: z.string().max(120).optional().or(z.literal('')),
  current_status: z.string().max(120).optional().or(z.literal('')),
  current_focus: z.string().max(300).optional().or(z.literal('')),
  interests: z.string().max(300).optional().or(z.literal('')),
  degree: z.string().max(120).optional().or(z.literal('')),
  university: z.string().max(160).optional().or(z.literal('')),
  public_email: z.string().email().optional().or(z.literal('')),
  availability: z.string().max(120).optional().or(z.literal('')),
  resume_url: z.string().url().optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
