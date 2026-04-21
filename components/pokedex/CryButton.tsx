'use client';

import { useRef, useState } from 'react';
import styles from './CryButton.module.css';

interface CryButtonProps {
  cryUrl: string;
  name: string;
}

export function CryButton({ cryUrl, name }: CryButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  function play() {
    if (playing) return;
    const audio = new Audio(cryUrl);
    audioRef.current = audio;
    setPlaying(true);
    audio.play().catch(() => {});
    audio.onended = () => setPlaying(false);
  }

  return (
    <button
      className={`${styles.btn}${playing ? ` ${styles.playing}` : ''}`}
      onClick={play}
      aria-label={`Play ${name}'s cry`}
      title="Play cry"
    >
      {playing ? '♪' : '▶'} Cry
    </button>
  );
}
