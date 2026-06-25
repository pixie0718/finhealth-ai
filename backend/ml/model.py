import numpy as np
import joblib
import os
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import LabelEncoder

from data.synthetic_generator import generate_dataset
from ml.feature_engineering import extract_features, compute_pillar_scores

MODEL_PATH = os.path.join(os.path.dirname(__file__), "trained_model.joblib")

FEATURE_COLS = [
    "cash_flow_ratio", "inflow_stability", "bounce_rate", "avg_balance_ratio", "net_cash_flow_mean",
    "gst_compliance", "epfo_compliance", "combined_compliance", "tax_to_revenue",
    "revenue_growth", "emp_growth", "revenue_trend_norm", "avg_monthly_revenue",
    "revenue_cv", "buyer_diversity", "buyer_concentration_risk", "salary_stability", "years_in_business",
    "has_credit_history", "credit_score_norm", "dpd_30", "dpd_90", "active_loans",
]


def build_training_data(profiles: list):
    rows = []
    labels = []

    all_scores = []
    all_rows = []
    for p in profiles:
        try:
            features = extract_features(p)
            scores = compute_pillar_scores(features)
            all_rows.append((features, scores["overall"]))
            all_scores.append(scores["overall"])
        except Exception:
            continue

    median_score = np.median(all_scores)
    for features, overall in all_rows:
        label = 1 if overall >= median_score else 0
        rows.append([features[c] for c in FEATURE_COLS])
        labels.append(label)

    return np.array(rows), np.array(labels)


def train_model():
    print("Generating training data...")
    profiles = generate_dataset(1000)
    X, y = build_training_data(profiles)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        random_state=42,
        use_label_encoder=False,
    )

    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    print("\nModel Performance:")
    print(classification_report(y_test, y_pred, target_names=["Low Quality", "High Quality"]))
    print(f"AUC-ROC: {roc_auc_score(y_test, y_prob):.4f}")

    joblib.dump({"model": model, "feature_cols": FEATURE_COLS}, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")
    return model


def load_model():
    if not os.path.exists(MODEL_PATH):
        print("No trained model found. Training now...")
        train_model()
    return joblib.load(MODEL_PATH)


def predict_creditworthiness(features: dict, model_bundle: dict) -> dict:
    model = model_bundle["model"]
    feature_cols = model_bundle["feature_cols"]

    X = np.array([[features[c] for c in feature_cols]])
    prob = model.predict_proba(X)[0][1]
    pred = int(prob >= 0.5)

    return {
        "creditworthy_probability": round(float(prob), 4),
        "prediction": "CREDITWORTHY" if pred == 1 else "RISKY",
        "confidence": round(float(max(prob, 1 - prob)), 4),
    }


if __name__ == "__main__":
    train_model()
