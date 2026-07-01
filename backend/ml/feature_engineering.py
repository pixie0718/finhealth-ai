import numpy as np


def extract_features(profile: dict) -> dict:
    gst = profile["gst_data"]
    upi = profile["upi_aa_data"]
    epfo = profile["epfo_data"]
    credit = profile["credit_history"]

    revenues = np.array(gst["monthly_revenues"])
    inflows = np.array(upi["monthly_inflows"])
    outflows = np.array(upi["monthly_outflows"])
    bounces = np.array(upi["bounce_counts"])
    txns = np.array(upi["transaction_counts"])
    employees = np.array(epfo["employee_counts"])
    salaries = np.array(epfo["avg_salaries"])
    buyers = np.array(gst["unique_buyers_per_month"])

    net_cash_flow = inflows - outflows
    cash_flow_ratio = np.mean(net_cash_flow) / (np.mean(inflows) + 1)
    inflow_stability = 1 - (np.std(inflows) / (np.mean(inflows) + 1))
    bounce_rate = np.sum(bounces) / (np.sum(txns) + 1)
    avg_balance_ratio = upi["avg_monthly_balance"] / (np.mean(inflows) + 1)

    gst_compliance = gst["filing_compliance_rate"]
    epfo_compliance = epfo["compliance_rate"]
    tax_to_revenue = gst["tax_paid"] / (np.sum(revenues) + 1)
    combined_compliance = gst_compliance * 0.6 + epfo_compliance * 0.4

    if len(revenues) >= 6:
        early = np.mean(revenues[:6])
        late = np.mean(revenues[-6:])
        revenue_growth = (late - early) / (early + 1)
    else:
        revenue_growth = 0.0

    emp_growth = (employees[-1] - employees[0]) / (employees[0] + 1) if len(employees) >= 3 else 0.0
    revenue_trend = float(np.polyfit(range(len(revenues)), revenues, 1)[0])
    revenue_trend_norm = revenue_trend / (np.mean(revenues) + 1)

    revenue_cv = np.std(revenues) / (np.mean(revenues) + 1)
    buyer_diversity = np.mean(buyers)
    buyer_concentration_risk = np.std(buyers) / (np.mean(buyers) + 1)
    salary_stability = 1 - (np.std(salaries) / (np.mean(salaries) + 1))
    years_in_biz = profile.get("years_in_business", 1)

    has_credit = 1 if credit["has_credit_history"] else 0
    credit_score_norm = (credit.get("credit_score") or 600) / 900
    dpd_30 = credit.get("dpd_30", 0)
    dpd_90 = credit.get("dpd_90", 0)
    active_loans = credit.get("active_loans", 0)

    return {
        "cash_flow_ratio":          float(np.clip(cash_flow_ratio, -1, 1)),
        "inflow_stability":         float(np.clip(inflow_stability, 0, 1)),
        "bounce_rate":              float(np.clip(bounce_rate, 0, 1)),
        "avg_balance_ratio":        float(np.clip(avg_balance_ratio, 0, 2)),
        "net_cash_flow_mean":       float(np.mean(net_cash_flow)),
        "gst_compliance":           float(gst_compliance),
        "epfo_compliance":          float(epfo_compliance),
        "combined_compliance":      float(combined_compliance),
        "tax_to_revenue":           float(np.clip(tax_to_revenue, 0, 0.3)),
        "revenue_growth":           float(np.clip(revenue_growth, -1, 3)),
        "emp_growth":               float(np.clip(emp_growth, -1, 3)),
        "revenue_trend_norm":       float(np.clip(revenue_trend_norm, -0.5, 0.5)),
        "avg_monthly_revenue":      float(np.mean(revenues)),
        "revenue_cv":               float(np.clip(revenue_cv, 0, 2)),
        "buyer_diversity":          float(buyer_diversity),
        "buyer_concentration_risk": float(np.clip(buyer_concentration_risk, 0, 2)),
        "salary_stability":         float(np.clip(salary_stability, 0, 1)),
        "years_in_business":        float(years_in_biz),
        "has_credit_history":       float(has_credit),
        "credit_score_norm":        float(credit_score_norm),
        "dpd_30":                   float(dpd_30),
        "dpd_90":                   float(dpd_90),
        "active_loans":             float(active_loans),
    }


def compute_pillar_scores(features: dict, ntc_mode: bool = False) -> dict:
    """
    Compute 5-pillar scores.
    ntc_mode: when True (New-to-Credit), suppress credit pillar and redistribute its
              15% weight across the four alternate-data pillars — enabling fair scoring
              of credit-invisible MSMEs.
    """
    # NOTE: each pillar's weights already sum to 100, and the input features are 0–1,
    # so the weighted sum is already on a 0–100 scale. (An earlier version multiplied
    # by an extra ×100, overflowing every pillar to a clipped 100 — making all
    # businesses look "excellent". Do not re-introduce that ×100.)
    cf_raw = (
        features["cash_flow_ratio"] * 35 +
        features["inflow_stability"] * 25 +
        (1 - features["bounce_rate"]) * 25 +
        min(features["avg_balance_ratio"], 1) * 15
    )
    cash_flow_score = float(np.clip(cf_raw, 0, 100))

    comp_raw = (
        features["gst_compliance"] * 50 +
        features["epfo_compliance"] * 35 +
        min(features["tax_to_revenue"] / 0.18, 1) * 15
    )
    compliance_score = float(np.clip(comp_raw, 0, 100))

    # Centre flat growth at ~0.5 (neutral), reward moderate positive growth and
    # penalise decline. The old (x+1)/4 mapping capped realistic growth near 0.25,
    # pinning every business's Growth pillar to ~35.
    rev_growth_norm = np.clip(0.5 + features["revenue_growth"] * 0.8, 0, 1)
    emp_growth_norm = np.clip(0.5 + features["emp_growth"] * 0.8, 0, 1)
    trend_norm = np.clip(features["revenue_trend_norm"] + 0.5, 0, 1)
    growth_raw = rev_growth_norm * 45 + emp_growth_norm * 30 + trend_norm * 25
    growth_score = float(np.clip(growth_raw, 0, 100))

    rev_stability = max(0, 1 - features["revenue_cv"])
    buyer_div_norm = min(features["buyer_diversity"] / 20, 1)
    years_norm = min(features["years_in_business"] / 10, 1)
    stability_raw = rev_stability * 35 + buyer_div_norm * 25 + features["salary_stability"] * 20 + years_norm * 20
    stability_score = float(np.clip(stability_raw, 0, 100))

    if not ntc_mode:
        if features["has_credit_history"]:
            dpd_penalty = features["dpd_30"] * 5 + features["dpd_90"] * 15
            credit_raw = features["credit_score_norm"] * 80 - dpd_penalty + 20
        else:
            credit_raw = 40.0
        credit_score = float(np.clip(credit_raw, 0, 100))

        overall = (
            cash_flow_score  * 0.25 +
            compliance_score * 0.20 +
            growth_score     * 0.20 +
            stability_score  * 0.20 +
            credit_score     * 0.15
        )
    else:
        # NTC mode — redistribute credit's 15% weight to alternate-data pillars
        # New weights: Cash Flow 30%, Compliance 24%, Growth 23%, Stability 23%
        credit_score = None
        overall = (
            cash_flow_score  * 0.30 +
            compliance_score * 0.24 +
            growth_score     * 0.23 +
            stability_score  * 0.23
        )

    return {
        "cash_flow":         round(cash_flow_score, 1),
        "compliance":        round(compliance_score, 1),
        "growth":            round(growth_score, 1),
        "stability":         round(stability_score, 1),
        "credit_worthiness": round(credit_score, 1) if credit_score is not None else None,
        "overall":           round(overall, 1),
        "ntc_mode":          ntc_mode,
    }


def get_loan_eligibility(overall_score: float, avg_monthly_revenue: float,
                          ntc_flag: bool = False, ntb_flag: bool = False) -> dict:
    """
    Loan eligibility with NTC/NTB-specific product routing.
    NTC/NTB MSMEs get MUDRA, CGTMSE-backed and co-lending products
    even at lower scores.
    """
    if overall_score >= 75:
        risk_band = "LOW"; multiplier = 4.5; recommendation = "APPROVE"
    elif overall_score >= 60:
        risk_band = "MEDIUM-LOW"; multiplier = 3.0; recommendation = "RECOMMEND FOR REVIEW"
    elif overall_score >= 45:
        risk_band = "MEDIUM"; multiplier = 1.5; recommendation = "MANUAL UNDERWRITING REQUIRED"
    else:
        risk_band = "HIGH"; multiplier = 0.0; recommendation = "DECLINE"

    annual_revenue = avg_monthly_revenue * 12
    base_amount = avg_monthly_revenue * multiplier

    def product(eligible, amount, rate, tenure_months):
        return {"eligible": eligible, "amount": round(amount) if eligible else 0,
                "interest_rate": rate, "tenure_months": tenure_months}

    is_low    = overall_score >= 75
    is_mid_low = overall_score >= 60
    is_mid    = overall_score >= 45

    products = {
        "msme_loan": product(is_mid, base_amount,
                             10.5 if is_low else 12.5 if is_mid_low else 14.5, 60),
        "working_capital": product(is_mid, avg_monthly_revenue * (3.0 if is_low else 2.0 if is_mid_low else 1.0),
                                   11.0 if is_low else 13.0 if is_mid_low else 15.5, 12),
        "business_loan": product(is_mid_low, annual_revenue * (0.5 if is_low else 0.3),
                                 10.75 if is_low else 13.25, 84),
        "personal_loan": product(is_mid, min(avg_monthly_revenue * 6, 500000),
                                 12.0 if is_low else 14.0 if is_mid_low else 16.0, 36),
        "auto_loan": product(is_mid_low, min(avg_monthly_revenue * 8, 1500000),
                             8.75 if is_low else 10.5, 60),
        "home_loan": product(is_low, min(annual_revenue * 4, 10000000), 8.5, 240),
    }

    # ── NTC / NTB exclusive products ─────────────────────────────────────────
    ntc_products = {}
    if ntc_flag or ntb_flag:
        # MUDRA Shishu (up to ₹50k) — always eligible for NTC
        ntc_products["mudra_shishu"] = product(True, min(avg_monthly_revenue * 0.5, 50000), 10.0, 36)
        # MUDRA Kishore (up to ₹5L) — eligible if overall ≥ 40
        ntc_products["mudra_kishore"] = product(overall_score >= 40, min(avg_monthly_revenue * 2, 500000), 11.5, 48)
        # MUDRA Tarun (up to ₹10L) — eligible if overall ≥ 55
        ntc_products["mudra_tarun"] = product(overall_score >= 55, min(avg_monthly_revenue * 4, 1000000), 12.0, 60)
        # CGTMSE-backed loan (collateral-free, up to ₹2Cr) — if overall ≥ 45
        ntc_products["cgtmse_backed"] = product(overall_score >= 45, min(avg_monthly_revenue * multiplier, 20000000), 13.0, 84)
        # Stand-Up India (for first-gen entrepreneurs) — if overall ≥ 50
        ntc_products["standup_india"] = product(overall_score >= 50 and ntb_flag, min(annual_revenue, 10000000), 7.30, 84)

        # For NTC, eligible_loan_amount is MUDRA Kishore or CGTMSE, whichever applies
        if ntc_products["cgtmse_backed"]["eligible"]:
            base_amount = ntc_products["cgtmse_backed"]["amount"]
            recommendation = "APPROVE (NTC — CGTMSE backed)" if recommendation == "DECLINE" else recommendation

    # Merge: NTC products shown first when relevant
    all_products = {**ntc_products, **products} if ntc_flag or ntb_flag else products

    return {
        "risk_band": risk_band,
        "recommendation": recommendation,
        "eligible_loan_amount": round(base_amount),
        "multiplier_used": multiplier,
        "ntc_flag": ntc_flag,
        "ntb_flag": ntb_flag,
        "products": all_products,
    }


def get_recommendations(pillar_scores: dict, features: dict) -> list:
    tips = []
    overall = pillar_scores["overall"]
    avg_rev = features["avg_monthly_revenue"]
    ntc = not bool(features.get("has_credit_history"))
    ntb = features.get("years_in_business", 5) <= 2

    # Band unlock tip
    if overall < 45:
        gap, next_band, unlock_mult = 45 - overall, "MEDIUM", 1.5
    elif overall < 60:
        gap, next_band, unlock_mult = 60 - overall, "MEDIUM-LOW", 3.0
    elif overall < 75:
        gap, next_band, unlock_mult = 75 - overall, "LOW", 4.5
    else:
        gap = next_band = unlock_mult = None

    if gap and next_band:
        tips.append({"icon": "🎯", "title": f"Improve by {gap:.0f} pts → unlock {next_band} band",
                     "detail": f"Reaching {next_band} risk band unlocks up to ₹{(avg_rev * unlock_mult / 100000):.1f}L eligibility.",
                     "priority": "high"})

    # NTC / NTB specific
    if ntc:
        tips.append({"icon": "💳", "title": "Build credit history — use MUDRA",
                     "detail": "No credit record found. Take a MUDRA Shishu loan (₹50K) and repay on time. "
                               "6 months of repayments add your business to CIBIL, potentially adding 15–20 pts to your Credit pillar.",
                     "priority": "high"})
    if ntb:
        tips.append({"icon": "🏦", "title": "Open a dedicated current account",
                     "detail": "New-to-Bank status detected. A dedicated current account with ≥12 months of activity "
                               "significantly improves your AA data profile and loan eligibility.",
                     "priority": "high"})

    # GST compliance
    if features["gst_compliance"] < 0.9:
        shortfall = round((0.9 - features["gst_compliance"]) * 100)
        tips.append({"icon": "📋", "title": "File GST returns on time",
                     "detail": f"GST compliance at {features['gst_compliance']*100:.0f}%. "
                               f"Reaching 90%+ boosts Compliance score by ~{shortfall} pts.",
                     "priority": "high"})

    # EPFO compliance
    if features["epfo_compliance"] < 0.9:
        tips.append({"icon": "👥", "title": "Regularize EPFO filings",
                     "detail": f"EPFO compliance at {features['epfo_compliance']*100:.0f}%. "
                               "Consistent payroll filing improves your Compliance pillar.",
                     "priority": "medium"})

    # Credit score (existing credit)
    if not ntc and features["credit_score_norm"] < 0.75:
        tips.append({"icon": "📈", "title": "Improve your CIBIL score",
                     "detail": f"Current credit score ~{int(features['credit_score_norm'] * 900)}. "
                               "Pay all EMIs on time and reduce credit utilization to reach 750+.",
                     "priority": "medium"})

    if features.get("dpd_30", 0) > 0 or features.get("dpd_90", 0) > 0:
        tips.append({"icon": "⏰", "title": "Clear overdue payments",
                     "detail": "Outstanding payment delays hurt your Credit score by 10–20 pts. Clear these first.",
                     "priority": "high"})

    if features["bounce_rate"] > 0.05:
        tips.append({"icon": "🏦", "title": "Reduce payment bounces",
                     "detail": f"Bounce rate at {features['bounce_rate']*100:.1f}%. Maintain minimum balance before due dates.",
                     "priority": "medium"})

    if features["inflow_stability"] < 0.7:
        tips.append({"icon": "💧", "title": "Stabilize monthly income",
                     "detail": "Highly variable inflows reduce Stability score. Retainer agreements and client diversification help.",
                     "priority": "medium"})

    if features["revenue_growth"] < 0.05:
        tips.append({"icon": "🚀", "title": "Grow your revenue",
                     "detail": "Revenue growth is low. A 10%+ YoY increase significantly boosts your Growth pillar.",
                     "priority": "low"})

    return tips[:6]
