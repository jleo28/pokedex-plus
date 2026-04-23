'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import styles from './ResidualPlot.module.css';

interface Residual {
  actual: number;
  predicted: number;
  name: string;
}

interface ResidualPlotProps {
  residuals: Residual[];
}

export function ResidualPlot({ residuals }: ResidualPlotProps) {
  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            dataKey="actual"
            name="Actual BST"
            type="number"
            domain={[200, 800]}
            label={{ value: 'Actual BST', position: 'insideBottom', offset: -10, fontSize: 9, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
            tick={{ fontSize: 9, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
          />
          <YAxis
            dataKey="predicted"
            name="Predicted BST"
            type="number"
            domain={[200, 800]}
            label={{ value: 'Predicted BST', angle: -90, position: 'insideLeft', fontSize: 9, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
            tick={{ fontSize: 9, fill: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              const d = payload?.[0]?.payload as Residual | undefined;
              if (!d) return null;
              return (
                <div className={styles.tip}>
                  <strong>{d.name}</strong>
                  <span>actual {d.actual} / pred {Math.round(d.predicted)}</span>
                </div>
              );
            }}
          />
          <ReferenceLine
            segment={[{ x: 200, y: 200 }, { x: 800, y: 800 }]}
            stroke="var(--border)"
            strokeDasharray="4 4"
            label={{ value: 'perfect', fontSize: 8, fill: 'var(--ink-muted)' }}
          />
          <Scatter
            data={residuals}
            fill="var(--accent-blue)"
            fillOpacity={0.6}
            r={3}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <p className={styles.caption}>Each dot is one Pokémon. Points above the dashed line are over-predicted; below are under-predicted.</p>
    </div>
  );
}
