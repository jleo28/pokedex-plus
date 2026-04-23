import styles from './ConfusionMatrix.module.css';

interface ConfusionMatrixProps {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  precision: number;
  recall: number;
  f1: number;
}

export function ConfusionMatrix({ tp, fp, fn, tn, precision, recall, f1 }: ConfusionMatrixProps) {
  const total = tp + fp + fn + tn;
  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        <div className={styles.axisLabel} />
        <div className={styles.colLabel}>Predicted: Not Legendary</div>
        <div className={styles.colLabel}>Predicted: Legendary</div>

        <div className={styles.rowLabel}>Actual: Not Legendary</div>
        <div className={`${styles.cell} ${styles.correct}`}>
          <span className={styles.count}>{tn}</span>
          <span className={styles.sub}>TN · {pct(tn)}</span>
        </div>
        <div className={`${styles.cell} ${styles.error}`}>
          <span className={styles.count}>{fp}</span>
          <span className={styles.sub}>FP · {pct(fp)}</span>
        </div>

        <div className={styles.rowLabel}>Actual: Legendary</div>
        <div className={`${styles.cell} ${styles.error}`}>
          <span className={styles.count}>{fn}</span>
          <span className={styles.sub}>FN · {pct(fn)}</span>
        </div>
        <div className={`${styles.cell} ${styles.correct}`}>
          <span className={styles.count}>{tp}</span>
          <span className={styles.sub}>TP · {pct(tp)}</span>
        </div>
      </div>

      <div className={styles.metrics}>
        <span className={styles.metric}>Precision <strong>{(precision * 100).toFixed(1)}%</strong></span>
        <span className={styles.metric}>Recall <strong>{(recall * 100).toFixed(1)}%</strong></span>
        <span className={styles.metric}>F1 <strong>{(f1 * 100).toFixed(1)}%</strong></span>
      </div>

      <p className={styles.note}>
        Only 15 of 386 Pokémon are legendary — a 4% class rate.
        With that imbalance, recall matters more than accuracy:
        a model that predicted "never legendary" would score 96% accuracy but 0% recall.
      </p>
    </div>
  );
}
