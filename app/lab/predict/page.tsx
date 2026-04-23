import { PredictForm } from '@/components/lab/PredictForm';
import styles from './page.module.css';

export default function PredictPage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Predict a Pokémon</h1>
        <p className={styles.subtitle}>
          Dial in six base stats and the models will guess its BST and legendary status.
        </p>
      </div>
      <PredictForm />
    </main>
  );
}
