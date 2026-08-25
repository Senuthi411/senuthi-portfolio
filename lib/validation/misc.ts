import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(300).optional().or(z.literal('')),
  icon: z.string().max(60).optional().or(z.literal('')),
  display_order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const skillSchema = z.object({
  name: z.string().min(1).max(80),
  category_id: z.string().uuid().optional().nullable(),
  icon: z.string().max(60).optional().or(z.literal('')),
  display_order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const skillCategorySchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  display_order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const educationSchema = z.object({
  degree: z.string().min(1).max(160),
  institution: z.string().min(1).max(160),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  currently_studying: z.boolean().default(false),
  description: z.string().max(1000).optional().or(z.literal('')),
  display_order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const certificationSchema = z.object({
  title: z.string().min(1).max(160),
  organization: z.string().min(1).max(160),
  issue_date: z.string().optional().or(z.literal('')),
  credential_id: z.string().max(120).optional().or(z.literal('')),
  credential_url: z.string().url().optional().or(z.literal('')),
  certificate_image_url: z.string().url().optional().or(z.literal('')),
  category: z.string().max(80).optional().or(z.literal('')),
  visible: z.boolean().default(true),
  display_order: z.number().int().default(0),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1).max(60),
  url: z.string().url(),
  display_order: z.number().int().default(0),
  enabled: z.boolean().default(true),
});
