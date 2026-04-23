import { createServerClient } from '@/lib/supabase/server';

export interface UserSubmission {
  id: string;
  name: string;
  type_primary: string;
  type_secondary: string | null;
  hp: number;
  attack: number;
  defense: number;
  sp_attack: number;
  sp_defense: number;
  speed: number;
  predicted_bst: number | null;
  predicted_legendary_prob: number | null;
  created_at: string;
}

export async function getRecentSubmissions(limit = 20): Promise<UserSubmission[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('user_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as UserSubmission[];
}

export async function createSubmission(
  submission: Omit<UserSubmission, 'id' | 'created_at'>,
): Promise<UserSubmission | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('user_submissions')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(submission as any)
    .select()
    .single();
  return data as UserSubmission | null;
}
