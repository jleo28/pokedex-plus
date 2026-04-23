import { TeamBuilder } from '@/components/team/TeamBuilder';
import styles from './page.module.css';

export default function TeamPage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Team Builder</h1>
        <p className={styles.subtitle}>Build your party of 6</p>
      </div>
      <TeamBuilder />
    </main>
  );
}
