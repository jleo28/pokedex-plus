import styles from './page.module.css';
import skeletonStyles from './loading.module.css';

export default function PokedexLoading() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={skeletonStyles.titleSkeleton} />
        <div className={skeletonStyles.countSkeleton} />
      </div>
      <div className={skeletonStyles.filterSkeleton} />
      <div className={styles.grid}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={skeletonStyles.card} />
        ))}
      </div>
    </main>
  );
}
