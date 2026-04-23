import type { ReactNode } from 'react';
import styles from './ModelCard.module.css';

interface ModelCardProps {
  title: string;
  description: string;
  metric: string;
  children: ReactNode;
}

export function ModelCard({ title, description, metric, children }: ModelCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.metric}>{metric}</span>
      </div>
      <p className={styles.description}>{description}</p>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
