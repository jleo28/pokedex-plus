'use client';

import { useState } from 'react';
import styles from './SubmitForm.module.css';

const TYPES = [
  'normal','fire','water','electric','grass','ice','fighting','poison',
  'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy',
];

const STAT_FIELDS = [
  { key: 'hp',         label: 'HP' },
  { key: 'attack',     label: 'Attack' },
  { key: 'defense',    label: 'Defense' },
  { key: 'sp_attack',  label: 'Sp. Atk' },
  { key: 'sp_defense', label: 'Sp. Def' },
  { key: 'speed',      label: 'Speed' },
] as const;

type StatKey = typeof STAT_FIELDS[number]['key'];

interface SubmitResult {
  name: string;
  predicted_bst: number;
  predicted_legendary_prob: number;
  predicted_legendary: boolean;
}

export function SubmitForm() {
  const [name, setName] = useState('');
  const [typePrimary, setTypePrimary] = useState('normal');
  const [typeSecondary, setTypeSecondary] = useState('');
  const [stats, setStats] = useState<Record<StatKey, number>>({
    hp: 75, attack: 75, defense: 75, sp_attack: 75, sp_defense: 75, speed: 75,
  });
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setLoading(true);
    setError(null);

    try {
      const predRes = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      });
      if (!predRes.ok) throw new Error('Prediction failed.');
      const pred = await predRes.json();

      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type_primary: typePrimary,
          type_secondary: typeSecondary || null,
          ...stats,
          predicted_bst: pred.predicted_bst,
          predicted_legendary_prob: pred.predicted_legendary_prob,
        }),
      });

      setResult({
        name: name.trim(),
        predicted_bst: Math.round(pred.predicted_bst),
        predicted_legendary_prob: pred.predicted_legendary_prob,
        predicted_legendary: pred.predicted_legendary,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className={styles.success}>
        <p className={styles.successText}>
          Your <strong>{result.name}</strong> has a predicted BST of{' '}
          <strong>{result.predicted_bst}</strong> and is{' '}
          <strong>{(result.predicted_legendary_prob * 100).toFixed(1)}%</strong> likely to be
          {result.predicted_legendary ? ' legendary' : ' not legendary'}.
        </p>
        <button className={styles.btn} onClick={() => { setResult(null); setName(''); }}>
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="poke-name">Name</label>
        <input
          id="poke-name"
          className={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Flameweasel"
          maxLength={40}
        />
      </div>

      <div className={styles.typeRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="type-primary">Primary type</label>
          <select id="type-primary" className={styles.select} value={typePrimary} onChange={(e) => setTypePrimary(e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="type-secondary">Secondary type</label>
          <select id="type-secondary" className={styles.select} value={typeSecondary} onChange={(e) => setTypeSecondary(e.target.value)}>
            <option value="">None</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.sliders}>
        {STAT_FIELDS.map(({ key, label }) => (
          <div key={key} className={styles.sliderRow}>
            <label className={styles.sliderLabel} htmlFor={`stat-${key}`}>{label}</label>
            <input
              id={`stat-${key}`}
              type="range" min={1} max={255}
              value={stats[key]}
              onChange={(e) => setStats((p) => ({ ...p, [key]: Number(e.target.value) }))}
              className={styles.slider}
            />
            <span className={styles.sliderValue}>{stats[key]}</span>
          </div>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" className={styles.btn} disabled={loading}>
        {loading ? 'Submitting…' : 'Submit'}
      </button>
    </form>
  );
}
