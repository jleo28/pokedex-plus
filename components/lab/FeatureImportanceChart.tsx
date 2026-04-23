'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './FeatureImportanceChart.module.css';

interface Feature {
  feature: string;
  importance: number;
}

interface FeatureImportanceChartProps {
  features: Feature[];
}

const SEGMENTS = 10;

function formatLabel(raw: string): string {
  return raw
    .replace(/^type_(primary|secondary)_/, '$1: ')
    .replace(/_/g, ' ');
}

export function FeatureImportanceChart({ features }: FeatureImportanceChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setAnimate(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const top = features.slice(0, 8);
  const max = top[0]?.importance ?? 1;

  return (
    <div ref={ref} className={styles.wrapper}>
      {top.map(({ feature, importance }, rowIdx) => {
        const filled = Math.max(1, Math.round((importance / max) * SEGMENTS));
        return (
          <div key={feature} className={styles.row}>
            <span className={styles.label}>{formatLabel(feature)}</span>
            <div className={styles.track}>
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <div
                  key={i}
                  className={`${styles.seg}${i < filled ? ` ${styles.filled}` : ''}`}
                  style={
                    animate && i < filled
                      ? { animationDelay: `${rowIdx * 60 + i * 30}ms` }
                      : undefined
                  }
                  data-animate={animate ? 'true' : 'false'}
                />
              ))}
            </div>
            <span className={styles.value}>{(importance * 100).toFixed(1)}%</span>
          </div>
        );
      })}
    </div>
  );
}
