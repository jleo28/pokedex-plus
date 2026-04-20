import { HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  flat?: boolean;
}

export function Card({ flat, className, children, ...props }: CardProps) {
  const classes = [styles.card, flat ? styles.flat : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
