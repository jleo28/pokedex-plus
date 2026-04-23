'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useSoundEnabled } from './SoundProvider';
import { CRTSettings } from './CRTOverlay';
import styles from './NavBar.module.css';

const NAV_LINKS = [
  { href: '/pokedex', label: 'Dex' },
  { href: '/team',    label: 'Team' },
  { href: '/compare', label: 'Compare' },
  { href: '/lab',     label: 'Lab' },
  { href: '/submit',  label: 'Submit' },
];

export function NavBar() {
  const pathname = usePathname();
  const { theme, toggle: toggleTheme } = useTheme();
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundEnabled();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>PK++</Link>
      <ul className={styles.links}>
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`${styles.link}${pathname.startsWith(href) ? ` ${styles.active}` : ''}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.controls}>
        <button
          className={styles.iconBtn}
          onClick={toggleSound}
          aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          title={soundEnabled ? 'Sound on' : 'Sound off'}
        >
          {soundEnabled ? '♪' : '♩'}
        </button>
        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'day' ? 'night' : 'day'} mode`}
          title={theme === 'day' ? 'Night mode' : 'Day mode'}
        >
          {theme === 'day' ? '☾' : '☀'}
        </button>
        <CRTSettings />
      </div>
    </nav>
  );
}
