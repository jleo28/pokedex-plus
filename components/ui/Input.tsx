import { InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, ...props }, ref) => {
    const inputClass = [styles.input, className ?? ''].filter(Boolean).join(' ');

    if (label) {
      return (
        <div className={styles.wrapper}>
          <label className={styles.label} htmlFor={id}>
            {label}
          </label>
          <input ref={ref} id={id} className={inputClass} {...props} />
        </div>
      );
    }

    return <input ref={ref} id={id} className={inputClass} {...props} />;
  }
);

Input.displayName = 'Input';
