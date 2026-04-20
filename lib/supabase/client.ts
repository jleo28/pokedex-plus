'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Browser client — anon key only. Reads pokemon/evolutions (public RLS).
// Rarely used; prefer server-side fetching via RSCs.
export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
