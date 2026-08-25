import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(dateString: string | null, opts?: { monthYearOnly?: boolean }): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00'); // avoid TZ shifting a date-only value
  if (opts?.monthYearOnly) {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  prototype: 'Prototype',
  in_progress: 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};
