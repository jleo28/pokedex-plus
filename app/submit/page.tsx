import { SubmitForm } from '@/components/submit/SubmitForm';
import { RecentSubmissions } from '@/components/submit/RecentSubmissions';
import { getRecentSubmissions } from '@/lib/pokemon/submissions';
import styles from './page.module.css';

export const revalidate = 60;

export default async function SubmitPage() {
  const submissions = await getRecentSubmissions(20);

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
