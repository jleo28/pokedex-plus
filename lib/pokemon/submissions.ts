// Submissions used to live in Supabase. They're now a fixed gallery of the
// submissions people made before the move (data/static/submissions.json) plus
// whatever the current visitor invents, saved in their own browser.
import gallery from '@/data/static/submissions.json';

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

const STORAGE_KEY = 'pkpp:submissions';

export function getGallerySubmissions(): UserSubmission[] {
  return (gallery as UserSubmission[]).slice(0, 20);
}

export function loadLocalSubmissions(): UserSubmission[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as UserSubmission[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalSubmission(
  s: Omit<UserSubmission, 'id' | 'created_at'>,
): UserSubmission {
  const entry: UserSubmission = {
    ...s,
    id: `local-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  try {
    const next = [entry, ...loadLocalSubmissions()].slice(0, 20);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('pkpp:submissions'));
  } catch {
    // Storage unavailable (private mode etc.): the result still shows on screen.
  }
  return entry;
}
