import { HTMLAttributes } from 'react';
import styles from './Badge.module.css';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
}

export function Badge({ color, style, className, children, ...props }: BadgeProps) {
  const classes = [styles.badge, className ?? ''].filter(Boolean).join(' ');
  const inlineStyle = color
    ? { ...style, backgroundColor: color, borderColor: color, color: '#fff' }
    : style;

  return (
    <span className={classes} style={inlineStyle} {...props}>
      {children}
    </span>
  );
}
