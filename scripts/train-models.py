"""
Trains two sklearn models on Gen 1-3 Pokémon data and pickles them.
Run once at setup: python scripts/train-models.py

Outputs:
  api/models/bst_regressor.pkl
  api/models/legendary_classifier.pkl
  data/model-stats.json
"""

import json
import os
import sys
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import cross_val_score, learning_curve
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'pokemon.json')
MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'api', 'models')
STATS_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'model-stats.json')

TYPES = [
    'normal','fire','water','electric','grass','ice','fighting','poison',
    'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'
]

def load_data():
    with open(DATA_PATH) as f:
        pokemon = json.load(f)
    return pokemon

# ─── Model A: BST Regressor ──────────────────────────────────────────────────
# Features: type_primary, type_secondary, generation, is_legendary, height_dm, weight_hg
# Target: base_stat_total

def build_bst_features(pokemon):
    X, y = [], []
    for p in pokemon:
        bst = p['hp'] + p['attack'] + p['defense'] + p['sp_attack'] + p['sp_defense'] + p['speed']
        X.append({
            'type_primary':   p['type_primary'],
            'type_secondary': p['type_secondary'] or 'none',
            'generation':     p['generation'],
            'is_legendary':   int(p['is_legendary']),
            'height_dm':      p['height_dm'] or 0,
            'weight_hg':      p['weight_hg'] or 0,
        })
        y.append(bst)
    return X, np.array(y)

def make_bst_pipeline():
    cat_features = ['type_primary', 'type_secondary']
    num_features = ['generation', 'is_legendary', 'height_dm', 'weight_hg']

    preprocessor = ColumnTransformer([
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_features),
        ('num', 'passthrough', num_features),
    ])

    return Pipeline([
        ('pre', preprocessor),
        ('clf', RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42, n_jobs=-1)),
    ])

def dicts_to_matrix(X_dicts, cat_cols, num_cols):
    """Convert list of dicts to separate cat/num arrays for ColumnTransformer."""
    import pandas as pd
    return pd.DataFrame(X_dicts)

# ─── Model B: Legendary Classifier ───────────────────────────────────────────
# Features: 6 base stats + bst + height + weight
# Target: is_legendary

def build_legendary_features(pokemon):
    X, y = [], []
    for p in pokemon:
        bst = p['hp'] + p['attack'] + p['defense'] + p['sp_attack'] + p['sp_defense'] + p['speed']
        X.append([
            p['hp'], p['attack'], p['defense'],
            p['sp_attack'], p['sp_defense'], p['speed'],
            bst, p['height_dm'] or 0, p['weight_hg'] or 0,
        ])
        y.append(int(p['is_legendary']))
    return np.array(X), np.array(y)

# ─── Learning curve helper ────────────────────────────────────────────────────

def get_learning_curve(estimator, X, y, scoring, n_splits=5):
    sizes, train_scores, val_scores = learning_curve(
        estimator, X, y,
        cv=n_splits,
        scoring=scoring,
        train_sizes=np.linspace(0.2, 1.0, 8),
        n_jobs=-1,
    )
    return {
        'train_sizes': sizes.tolist(),
        'train_scores': train_scores.mean(axis=1).tolist(),
        'val_scores': val_scores.mean(axis=1).tolist(),
    }

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    import pandas as pd

    os.makedirs(MODELS_DIR, exist_ok=True)
    pokemon = load_data()
    print(f"Loaded {len(pokemon)} Pokémon")

    stats = {}

    # ── Model A: BST Regressor ─────────────────────────────────────────────
    print("\nTraining BST regressor...")
    X_dicts, y_bst = build_bst_features(pokemon)
    X_bst_df = pd.DataFrame(X_dicts)

    bst_pipeline = make_bst_pipeline()
    bst_pipeline.fit(X_bst_df, y_bst)

    cv_scores = cross_val_score(bst_pipeline, X_bst_df, y_bst, cv=5, scoring='r2')
    print(f"  R² (5-fold CV): {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

    # Feature importances (after fitting)
    ohe = bst_pipeline.named_steps['pre'].transformers_[0][1]
    ohe_names = ohe.get_feature_names_out(['type_primary', 'type_secondary']).tolist()
    num_names = ['generation', 'is_legendary', 'height_dm', 'weight_hg']
    feature_names_bst = ohe_names + num_names
    importances_bst = bst_pipeline.named_steps['clf'].feature_importances_
    bst_importance = sorted(
        zip(feature_names_bst, importances_bst.tolist()),
        key=lambda x: x[1], reverse=True
    )[:10]

    # Residuals for scatter plot
    y_pred_bst = bst_pipeline.predict(X_bst_df)
    residuals = [
        {'actual': int(a), 'predicted': float(round(p, 1)), 'name': pokemon[i]['name']}
        for i, (a, p) in enumerate(zip(y_bst, y_pred_bst))
    ]

    lc_bst = get_learning_curve(bst_pipeline, X_bst_df, y_bst, 'r2')

    stats['bst_regressor'] = {
        'cv_r2_mean': round(float(cv_scores.mean()), 4),
        'cv_r2_std':  round(float(cv_scores.std()), 4),
        'feature_importances': [{'feature': f, 'importance': round(v, 4)} for f, v in bst_importance],
        'residuals': residuals,
        'learning_curve': lc_bst,
    }

    pkl_bst = os.path.join(MODELS_DIR, 'bst_regressor.pkl')
    joblib.dump(bst_pipeline, pkl_bst, compress=3)
    size_bst = os.path.getsize(pkl_bst)
    print(f"  Saved to {pkl_bst} ({size_bst/1024:.1f} KB)")

    # ── Model B: Legendary Classifier ─────────────────────────────────────
    print("\nTraining legendary classifier...")
    X_leg, y_leg = build_legendary_features(pokemon)
    feature_names_leg = ['hp','attack','defense','sp_attack','sp_defense','speed','bst','height_dm','weight_hg']

    leg_clf = RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42,
                                      class_weight='balanced', n_jobs=-1)
    leg_clf.fit(X_leg, y_leg)

    cv_f1 = cross_val_score(leg_clf, X_leg, y_leg, cv=5, scoring='f1')
    print(f"  F1 (5-fold CV): {cv_f1.mean():.3f} ± {cv_f1.std():.3f}")

    y_pred_leg = leg_clf.predict(X_leg)
    y_prob_leg = leg_clf.predict_proba(X_leg)[:, 1]
    cm = confusion_matrix(y_leg, y_pred_leg)
    tn, fp, fn, tp = cm.ravel()

    leg_importance = sorted(
        zip(feature_names_leg, leg_clf.feature_importances_.tolist()),
        key=lambda x: x[1], reverse=True
    )

    lc_leg = get_learning_curve(leg_clf, X_leg, y_leg, 'f1_macro')

    stats['legendary_classifier'] = {
        'cv_f1_mean':  round(float(cv_f1.mean()), 4),
        'cv_f1_std':   round(float(cv_f1.std()), 4),
        'precision':   round(float(precision_score(y_leg, y_pred_leg)), 4),
        'recall':      round(float(recall_score(y_leg, y_pred_leg)), 4),
        'f1':          round(float(f1_score(y_leg, y_pred_leg)), 4),
        'confusion_matrix': {'tn': int(tn), 'fp': int(fp), 'fn': int(fn), 'tp': int(tp)},
        'feature_importances': [{'feature': f, 'importance': round(v, 4)} for f, v in leg_importance],
        'learning_curve': lc_leg,
        'sample_predictions': [
            {'name': pokemon[i]['name'], 'prob': round(float(y_prob_leg[i]), 3),
             'actual': bool(y_leg[i]), 'predicted': bool(y_pred_leg[i])}
            for i in range(len(pokemon))
            if y_leg[i] == 1 or y_prob_leg[i] > 0.3
        ],
    }

    pkl_leg = os.path.join(MODELS_DIR, 'legendary_classifier.pkl')
    joblib.dump(leg_clf, pkl_leg, compress=3)
    size_leg = os.path.getsize(pkl_leg)
    print(f"  Saved to {pkl_leg} ({size_leg/1024:.1f} KB)")

    total_kb = (size_bst + size_leg) / 1024
    print(f"\nTotal model size: {total_kb:.1f} KB ({total_kb/1024:.2f} MB)")
    if total_kb > 5000:
        print("WARNING: Combined models exceed 5MB — consider higher compression or simpler models")

    with open(STATS_PATH, 'w') as f:
        json.dump(stats, f, indent=2)
    print(f"\nStats written to {STATS_PATH}")

    # Mewtwo sanity check (id 150)
    mewtwo = next(p for p in pokemon if p['id'] == 150)
    mewtwo_bst = mewtwo['hp'] + mewtwo['attack'] + mewtwo['defense'] + mewtwo['sp_attack'] + mewtwo['sp_defense'] + mewtwo['speed']
    mewtwo_df = pd.DataFrame([{
        'type_primary': mewtwo['type_primary'],
        'type_secondary': mewtwo['type_secondary'] or 'none',
        'generation': mewtwo['generation'],
        'is_legendary': 1,
        'height_dm': mewtwo['height_dm'] or 0,
        'weight_hg': mewtwo['weight_hg'] or 0,
    }])
    mewtwo_bst_pred = bst_pipeline.predict(mewtwo_df)[0]
    mewtwo_leg_prob = leg_clf.predict_proba(
        np.array([[mewtwo['hp'], mewtwo['attack'], mewtwo['defense'],
                   mewtwo['sp_attack'], mewtwo['sp_defense'], mewtwo['speed'],
                   mewtwo_bst, mewtwo['height_dm'] or 0, mewtwo['weight_hg'] or 0]])
    )[0][1]

    print(f"\nMewtwo sanity check:")
    print(f"  Actual BST: {mewtwo_bst}, Predicted: {mewtwo_bst_pred:.1f}")
    print(f"  Legendary prob: {mewtwo_leg_prob:.3f} (expect >0.8)")

if __name__ == '__main__':
    main()
