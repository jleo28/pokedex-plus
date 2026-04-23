'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './LearningCurve.module.css';

interface LearningCurveData {
  train_sizes: number[];
  train_scores: number[];
  val_scores: number[];
}

interface LearningCurveProps {
  data: LearningCurveData;
  metric?: string;
}

export function LearningCurve({ data, metric = 'score' }: LearningCurveProps) {
  const points = data.train_sizes.map((size, i) => ({
    size,
    train: parseFloat((data.train_scores[i] ?? 0).toFixed(3)),
    val:   parseFloat((data.val_scores[i]   ?? 0).toFixed(3)),
  }));

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={points} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            dataKey="size"
            label={{ value: 'Training samples', position: 'insideBottom', offset: -10, fontSize: 9, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
            tick={{ fontSize: 9, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
          />
          <YAxis
            domain={['auto', 'auto']}
            label={{ value: metric, angle: -90, position: 'insideLeft', fontSize: 9, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
            tick={{ fontSize: 9, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
          />
          <Tooltip
            contentStyle={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--surface)', border: '1px solid var(--border)' }}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 10, paddingTop: '8px' }}
          />
          <Line type="monotone" dataKey="train" stroke="var(--accent-blue)" dot={false} strokeWidth={2} name="Train" />
          <Line type="monotone" dataKey="val"   stroke="var(--border)"      dot={false} strokeWidth={2} name="Validation" strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
