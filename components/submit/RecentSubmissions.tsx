import type { UserSubmission } from '@/lib/pokemon/submissions';
import styles from './RecentSubmissions.module.css';

interface RecentSubmissionsProps {
  submissions: UserSubmission[];
}

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  if (submissions.length === 0) {
    return (
      <p className={styles.empty}>No submissions yet. Be the first!</p>
    );
  }

  return (
    <div className={styles.grid}>
      {submissions.map((s) => (
        <div key={s.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.name}>{s.name}</span>
            <span className={styles.types}>
              {s.type_primary}{s.type_secondary ? ` / ${s.type_secondary}` : ''}
            </span>
          </div>
          <div className={styles.stats}>
            {[
              ['HP',  s.hp],
              ['Atk', s.attack],
              ['Def', s.defense],
              ['SpA', s.sp_attack],
              ['SpD', s.sp_defense],
              ['Spe', s.speed],
            ].map(([label, val]) => (
              <span key={label as string} className={styles.stat}>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statVal}>{val}</span>
              </span>
            ))}
          </div>
          {s.predicted_bst !== null && (
            <div className={styles.prediction}>
              BST ~{Math.round(s.predicted_bst)}
              {s.predicted_legendary_prob !== null && (
                <> · {(s.predicted_legendary_prob * 100).toFixed(0)}% legendary</>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
