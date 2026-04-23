'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const SoundContext = createContext<{ enabled: boolean; toggle: () => void; beep: () => void }>({
  enabled: false,
  toggle: () => {},
  beep: () => {},
});

export function useSoundEnabled() {
  return useContext(SoundContext);
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sound');
    if (stored === 'on') setEnabled(true);
  }, []);

  function toggle() {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('sound', next ? 'on' : 'off');
      return next;
    });
  }

  function beep() {
    if (!enabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // AudioContext not available (SSR guard)
    }
  }

  return (
    <SoundContext.Provider value={{ enabled, toggle, beep }}>
      {children}
    </SoundContext.Provider>
  );
}
