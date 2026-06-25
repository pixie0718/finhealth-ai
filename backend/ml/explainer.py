import shap
import numpy as np
FEATURE_LABELS_STRENGTH = {
    "cash_flow_ratio": "Strong Cash Flow",
    "inflow_stability": "Stable Monthly Income",
    "bounce_rate": "Low Payment Bounces",
    "avg_balance_ratio": "Healthy Bank Balance",
    "net_cash_flow_mean": "Positive Net Cash Flow",
    "gst_compliance": "Excellent GST Compliance",
    "epfo_compliance": "Strong EPFO Compliance",
    "combined_compliance": "High Overall Compliance",
    "tax_to_revenue": "Timely Tax Payments",
    "revenue_growth": "Growing Revenue",
    "emp_growth": "Growing Workforce",
    "revenue_trend_norm": "Upward Revenue Trend",
    "avg_monthly_revenue": "High Monthly Revenue",
    "revenue_cv": "Consistent Revenue",
    "buyer_diversity": "Diverse Customer Base",
    "buyer_concentration_risk": "Low Customer Concentration",
    "salary_stability": "Regular Salary Disbursements",
    "years_in_business": "Established Business",
    "has_credit_history": "Active Credit User",
    "credit_score_norm": "Good Credit Score",
    "dpd_30": "Clean 30-Day Payment Record",
    "dpd_90": "Clean 90-Day Payment Record",
    "active_loans": "Manageable Loan Burden",
}

FEATURE_LABELS_RISK = {
    "cash_flow_ratio": "Weak Cash Flow",
    "inflow_stability": "Inconsistent Income",
    "bounce_rate": "High Payment Bounces",
    "avg_balance_ratio": "Low Bank Balance",
    "net_cash_flow_mean": "Negative Net Cash Flow",
    "gst_compliance": "Poor GST Compliance",
    "epfo_compliance": "Low EPFO Compliance",
    "combined_compliance": "Low Overall Compliance",
    "tax_to_revenue": "Tax Payment Issues",
    "revenue_growth": "Declining Revenue",
    "emp_growth": "Shrinking Workforce",
    "revenue_trend_norm": "Downward Revenue Trend",
    "avg_monthly_revenue": "Low Monthly Revenue",
    "revenue_cv": "Volatile Revenue",
    "buyer_diversity": "Narrow Customer Base",
    "buyer_concentration_risk": "High Customer Concentration",
    "salary_stability": "Irregular Salary Payments",
    "years_in_business": "New Business",
    "has_credit_history": "No Credit History — Build One",
    "credit_score_norm": "Improve Credit Score",
    "dpd_30": "30-Day Payment Delays",
    "dpd_90": "90-Day Payment Delays",
    "active_loans": "High Existing Loan Burden",
}

FEATURE_COLS = [
    "cash_flow_ratio", "inflow_stability", "bounce_rate", "avg_balance_ratio", "net_cash_flow_mean",
    "gst_compliance", "epfo_compliance", "combined_compliance", "tax_to_revenue",
    "revenue_growth", "emp_growth", "revenue_trend_norm", "avg_monthly_revenue",
    "revenue_cv", "buyer_diversity", "buyer_concentration_risk", "salary_stability", "years_in_business",
    "has_credit_history", "credit_score_norm", "dpd_30", "dpd_90", "active_loans",
]


def get_shap_explanations(features: dict, model_bundle: dict, top_n: int = 6) -> dict:
    model = model_bundle["model"]
    X = np.array([[features[c] for c in FEATURE_COLS]])

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    if isinstance(shap_values, list):
        sv = shap_values[1][0]
    else:
        sv = shap_values[0]

    feature_importance = sorted(
        zip(FEATURE_COLS, sv),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:top_n]

    strengths = []
    risks = []

    for feat, val in feature_importance:
        is_strength = val > 0
        label_map = FEATURE_LABELS_STRENGTH if is_strength else FEATURE_LABELS_RISK
        item = {
            "feature": feat,
            "label": label_map.get(feat, feat),
            "shap_value": round(float(val), 4),
            "feature_value": round(float(features[feat]), 4),
        }
        if is_strength:
            strengths.append(item)
        else:
            risks.append(item)

    return {
        "strengths": strengths[:3],
        "risks": risks[:3],
        "base_value": round(float(explainer.expected_value if not isinstance(explainer.expected_value, list) else explainer.expected_value[1]), 4),
    }
