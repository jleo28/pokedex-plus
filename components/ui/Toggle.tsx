'use client';

import { InputHTMLAttributes } from 'react';
import styles from './Toggle.module.css';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Toggle({ label, id, className, ...props }: ToggleProps) {
  return (
    <label className={[styles.toggle, className ?? ''].filter(Boolean).join(' ')}>
      <input type="checkbox" id={id} className={styles.input} {...props} />
      <span className={styles.track}>
        <span className={styles.knob} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
