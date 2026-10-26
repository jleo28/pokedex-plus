import { SubmitForm } from '@/components/submit/SubmitForm';
import { RecentSubmissions } from '@/components/submit/RecentSubmissions';
import { getGallerySubmissions } from '@/lib/pokemon/submissions';
import styles from './page.module.css';

export default function SubmitPage() {
  const submissions = getGallerySubmissions();

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Submit a Pokémon</h1>
        <p className={styles.subtitle}>
          Invent a Pokémon. The models will judge it.
        </p>
      </div>
      <SubmitForm />
      <section className={styles.gallery}>
        <h2 className={styles.galleryTitle}>Recent submissions</h2>
        <RecentSubmissions submissions={submissions} />
      </section>
    </main>
  );
}
