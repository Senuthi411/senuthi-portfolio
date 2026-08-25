import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Enter a valid email address'),
  subject: z.string().max(160).optional().or(z.literal('')),
  message: z.string().min(10, 'Message should be at least 10 characters').max(4000),
  // Honeypot field — real users never fill this in; bots often do.
  company_website: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
