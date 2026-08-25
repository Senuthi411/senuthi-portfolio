'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

type PublicSchema = Database['public'];

/**
 * Browser-side Supabase client for use in Client Components.
 * Uses the public anon key only — RLS governs what it can do.
 */
export function createClient() {
  return createBrowserClient<Database, 'public', PublicSchema>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
