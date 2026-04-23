import Link from 'next/link';
import modelStats from '@/data/model-stats.json';
import { ModelCard } from '@/components/lab/ModelCard';
import { FeatureImportanceChart } from '@/components/lab/FeatureImportanceChart';
import { ConfusionMatrix } from '@/components/lab/ConfusionMatrix';
import { ResidualPlot } from '@/components/lab/ResidualPlot';
import { LearningCurve } from '@/components/lab/LearningCurve';
import styles from './page.module.css';

export const revalidate = false;

export default function LabPage() {
  const bst = modelStats.bst_regressor;
  const clf = modelStats.legendary_classifier;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>ML Lab</h1>
        <p className={styles.intro}>
          I trained two scikit-learn models on the Gen 1–3 Pokédex, 386 Pokémon,
          six base stats each. One model predicts Base Stat Total from physical and
          categorical traits. The other classifies legendary status from the six stats alone.
          Neither is impressive by production ML standards, but both do something non-trivial
          with a small, weird dataset, and building them taught me more about feature
          engineering than most tutorials do.
        </p>
      </div>

      <div className={styles.models}>
        <ModelCard
          title="BST Regressor"
          description="Predicts a Pokémon's Base Stat Total from height, weight, generation, and type (no stats used). R² ≈ 0.59 on cross-validation."
          metric={`R² ${bst.cv_r2_mean.toFixed(2)} ± ${bst.cv_r2_std.toFixed(2)}`}
        >
          <section>
            <h3 className={styles.sectionHead}>Feature importances</h3>
            <FeatureImportanceChart features={bst.feature_importances} />
          </section>
          <section>
            <h3 className={styles.sectionHead}>Predicted vs actual BST</h3>
            <ResidualPlot residuals={bst.residuals} />
          </section>
          <section>
            <h3 className={styles.sectionHead}>Learning curve</h3>
            <LearningCurve data={bst.learning_curve} metric="R²" />
          </section>
        </ModelCard>

        <ModelCard
          title="Legendary Classifier"
          description="Classifies legendary status from the six base stats alone, with no categorical features. F1 ≈ 0.83 on cross-validation, given only 15 legendaries in the training set."
          metric={`F1 ${clf.cv_f1_mean.toFixed(2)} ± ${clf.cv_f1_std.toFixed(2)}`}
        >
          <section>
            <h3 className={styles.sectionHead}>Feature importances</h3>
            <FeatureImportanceChart features={clf.feature_importances} />
          </section>
          <section>
            <h3 className={styles.sectionHead}>Confusion matrix</h3>
            <ConfusionMatrix
              tp={clf.confusion_matrix.tp}
              fp={clf.confusion_matrix.fp}
              fn={clf.confusion_matrix.fn}
              tn={clf.confusion_matrix.tn}
              precision={clf.precision}
              recall={clf.recall}
              f1={clf.f1}
            />
          </section>
          <section>
            <h3 className={styles.sectionHead}>Learning curve</h3>
            <LearningCurve data={clf.learning_curve} metric="F1" />
          </section>
        </ModelCard>
      </div>

      <Link href="/lab/predict" className={styles.predictLink}>
        → Try the predictor
      </Link>

      <p className={styles.intro} style={{ marginTop: 'var(--space-6)' }}>
        Training code is in <code>scripts/train-models.py</code> in the repo.
        The models are pickled and served via a Vercel Python runtime function at{' '}
        <code>api/predict.py</code>. Cold start is slow (~20s on first request);
        warm requests are under 100ms.{' '}
        <a href="https://github.com/jleo28/pokedex-plus" style={{ color: 'var(--ink)' }}>
          github.com/jleo28/pokedex-plus
        </a>
      </p>
    </main>
  );
}
