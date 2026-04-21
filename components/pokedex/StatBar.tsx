'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './StatBar.module.css';

const SEGMENTS = 10;

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

export function StatBar({ label, value, maxValue = 255, color }: StatBarProps) {
  const filled = Math.round((value / maxValue) * SEGMENTS);
  const trackRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimate(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>
      <div
        ref={trackRef}
        className={styles.track}
        data-animate={animate ? 'true' : 'false'}
        style={{ '--bar-color': color } as React.CSSProperties}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <div
            key={i}
            className={`${styles.segment}${i < filled ? ` ${styles.filled}` : ''}`}
            style={animate && i < filled ? { animationDelay: `${(i / SEGMENTS) * 400}ms` } : undefined}
          />
        ))}
      </div>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
