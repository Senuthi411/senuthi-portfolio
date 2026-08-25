import { z } from 'zod';

export const projectStatusEnum = z.enum(['draft', 'prototype', 'in_progress', 'completed', 'archived']);

export const projectSchema = z.object({
  title: z.string().min(2, 'Title is required').max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
  short_description: z.string().max(300).optional().or(z.literal('')),
  full_description: z.string().optional().or(z.literal('')),
  category_id: z.string().uuid().optional().nullable(),
  status: projectStatusEnum,
  project_role: z.string().max(120).optional().or(z.literal('')),
  is_team: z.boolean().default(false),
  team_details: z.string().optional().or(z.literal('')),
  project_date: z.string().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),

  problem: z.string().optional().or(z.literal('')),
  goal: z.string().optional().or(z.literal('')),
  solution: z.string().optional().or(z.literal('')),
  how_it_works: z.string().optional().or(z.literal('')),
  hardware_components: z.string().optional().or(z.literal('')),
  software_technologies: z.string().optional().or(z.literal('')),
  architecture_description: z.string().optional().or(z.literal('')),
  architecture_image_url: z.string().url().optional().or(z.literal('')),
  circuit_diagram_url: z.string().url().optional().or(z.literal('')),
  wiring_image_url: z.string().url().optional().or(z.literal('')),
  development_process: z.string().optional().or(z.literal('')),
  challenges: z.string().optional().or(z.literal('')),
  lessons_learned: z.string().optional().or(z.literal('')),
  future_improvements: z.string().optional().or(z.literal('')),

  github_url: z.string().url().optional().or(z.literal('')),
  documentation_url: z.string().url().optional().or(z.literal('')),
  demo_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional().or(z.literal('')),

  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
