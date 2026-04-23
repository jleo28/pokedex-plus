'use client';

import { useEffect, useState } from 'react';
import styles from './CRTOverlay.module.css';

export function CRTOverlay() {
  const [crt, setCrt] = useState(false);
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    setCrt(localStorage.getItem('crt') === 'on');
    setFlicker(localStorage.getItem('crt-flicker') === 'on');
  }, []);

  if (!crt) return null;

  return (
    <div
      className={`${styles.overlay}${flicker ? ` ${styles.flicker}` : ''}`}
      aria-hidden
    />
  );
}

export function CRTSettings() {
  const [crt, setCrt] = useState(false);
  const [flicker, setFlicker] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCrt(localStorage.getItem('crt') === 'on');
    setFlicker(localStorage.getItem('crt-flicker') === 'on');
  }, []);

  function toggleCRT() {
    const next = !crt;
    setCrt(next);
    localStorage.setItem('crt', next ? 'on' : 'off');
  }

  function toggleFlicker() {
    const next = !flicker;
    setFlicker(next);
    localStorage.setItem('crt-flicker', next ? 'on' : 'off');
  }

  return (
    <div className={styles.settings}>
      <button
        className={styles.gearBtn}
        onClick={() => setOpen((p) => !p)}
        aria-label="Settings"
        title="Settings"
      >
        ⚙
      </button>
      {open && (
        <div className={styles.dropdown}>
          <label className={styles.toggle}>
            <input type="checkbox" checked={crt} onChange={toggleCRT} />
            <span>CRT scanlines</span>
          </label>
          <label className={`${styles.toggle}${!crt ? ` ${styles.disabled}` : ''}`}>
            <input type="checkbox" checked={flicker} onChange={toggleFlicker} disabled={!crt} />
            <span>Flicker</span>
          </label>
        </div>
      )}
    </div>
  );
}
