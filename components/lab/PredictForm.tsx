'use client';

import { useState } from 'react';
import styles from './PredictForm.module.css';

const STAT_FIELDS = [
  { key: 'hp',         label: 'HP' },
  { key: 'attack',     label: 'Attack' },
  { key: 'defense',    label: 'Defense' },
  { key: 'sp_attack',  label: 'Sp. Atk' },
  { key: 'sp_defense', label: 'Sp. Def' },
  { key: 'speed',      label: 'Speed' },
] as const;

type StatKey = typeof STAT_FIELDS[number]['key'];

const DEFAULTS: Record<StatKey, number> = {
  hp: 75, attack: 75, defense: 75, sp_attack: 75, sp_defense: 75, speed: 75,
};

interface PredictResult {
  predicted_bst: number;
  predicted_legendary: boolean;
  predicted_legendary_prob: number;
}

export function PredictForm() {
  const [stats, setStats] = useState<Record<StatKey, number>>(DEFAULTS);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: StatKey, val: number) {
    setStats((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  }

  const segments = 20;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.sliders}>
        {STAT_FIELDS.map(({ key, label }) => (
          <div key={key} className={styles.sliderRow}>
            <label className={styles.sliderLabel} htmlFor={key}>{label}</label>
            <input
              id={key}
              type="range"
              min={1}
              max={255}
              value={stats[key]}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{stats[key]}</span>
          </div>
        ))}
      </div>

      <div className={styles.total}>
        <span className={styles.totalLabel}>Sum</span>
        <span className={styles.totalValue}>
          {Object.values(stats).reduce((a, b) => a + b, 0)}
        </span>
      </div>

      <button type="submit" className={styles.btn} disabled={loading}>
        {loading ? 'Predicting…' : 'Predict'}
      </button>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.results}>
          <div className={styles.bstResult}>
            <span className={styles.resultLabel}>Predicted BST</span>
            <span className={styles.bstValue}>{Math.round(result.predicted_bst)}</span>
          </div>

          <div className={styles.legendaryResult}>
            <span className={styles.resultLabel}>Legendary probability</span>
            <div className={styles.gauge}>
              {Array.from({ length: segments }, (_, i) => (
                <div
                  key={i}
                  className={`${styles.gaugeCell}${
                    i < Math.round(result.predicted_legendary_prob * segments)
                      ? ` ${styles.gaugeFilled}`
                      : ''
                  }`}
                />
              ))}
            </div>
            <span className={styles.probValue}>
              {(result.predicted_legendary_prob * 100).toFixed(1)}%
              {result.predicted_legendary ? ' — Legendary' : ' — Not legendary'}
            </span>
          </div>
        </div>
      )}
    </form>
  );
}
