import uuid
import hashlib
from datetime import datetime
from typing import Optional

import numpy as np
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session

from data.synthetic_generator import (
    generate_msme_profile,
    generate_msme_profile_from_gstin,
    validate_gstin,
    BUSINESS_TYPES,
    CITIES,
)
from ml.feature_engineering import extract_features, compute_pillar_scores, get_loan_eligibility, get_recommendations
from ml.explainer import get_shap_explanations
from database import (
    get_db, save_score, load_all_scores, load_score_by_id, load_score_trend, User,
    save_consent, load_consent,
    save_outcome, load_outcomes, get_outcome_stats,
    save_application, load_applications,
    get_cached_benchmark, save_benchmark_cache,
)
from routers.auth import get_current_user, require_banker

router = APIRouter(prefix="/api/score", tags=["Score"])

_model_bundle = None


def get_model():
    global _model_bundle
    if _model_bundle is None:
        from ml.model import load_model
        _model_bundle = load_model()
    return _model_bundle


def _make_consent_artifact(consent_id: str, gstin: str, business_name: str) -> dict:
    from datetime import timedelta
    now = datetime.utcnow()
    return {
        "consent_id": consent_id,
        "consent_handle": f"AA-CONSENT-{consent_id[:8].upper()}",
        "fiu": {"id": "IDBI-FIU-001", "name": "IDBI Bank Ltd", "type": "FIU"},
        "aa_operator": {"id": "SAHAMATI-AA-01", "name": "Sahamati Account Aggregator"},
        "fip_list": [
            {"id": "GSTN-FIP",  "name": "GST Network",           "data_type": "GST_RETURNS"},
            {"id": "NPCI-FIP",  "name": "NPCI (UPI / AA)",       "data_type": "BANK_STATEMENT"},
            {"id": "EPFO-FIP",  "name": "EPFO Unified Portal",   "data_type": "EPFO_CONTRIBUTION"},
            {"id": "CIBIL-FIP", "name": "TransUnion CIBIL",      "data_type": "CREDIT_REPORT"},
        ],
        "purpose": {
            "code": "101",
            "text": "MSME Credit Assessment",
            "category": {"type": "Financial Services"},
        },
        "consent_types": ["PROFILE", "SUMMARY", "TRANSACTIONS"],
        "fi_data_range": {
            "from": (now.replace(month=1, day=1) - timedelta(days=548)).isoformat() + "Z",
            "to": now.isoformat() + "Z",
        },
        "data_life": {"unit": "DAY", "value": 90},
        "frequency": {"unit": "MONTH", "value": 1},
        "consent_mode": "VIEW",
        "fetch_type": "PERIODIC",
        "entity": {"gstin": gstin, "name": business_name},
        "created_at": now.isoformat() + "Z",
        "expires_at": (now + timedelta(days=90)).isoformat() + "Z",
        "status": "ACTIVE",
        "digital_signature": hashlib.sha256(f"{consent_id}{gstin}".encode()).hexdigest()[:32],
    }


def build_result(profile: dict, business_name: str, gstin: str,
                 business_type: str, city: str, years_in_business: int) -> dict:
    features = extract_features(profile)
    ntc_flag = profile.get("ntc_flag", not bool(profile["credit_history"]["has_credit_history"]))
    ntb_flag = profile.get("ntb_flag", years_in_business <= 2)

    pillar_scores = compute_pillar_scores(features, ntc_mode=ntc_flag)
    loan_eligibility = get_loan_eligibility(
        pillar_scores["overall"],
        features["avg_monthly_revenue"],
        ntc_flag=ntc_flag,
        ntb_flag=ntb_flag,
    )

    model_bundle = get_model()
    from ml.model import predict_creditworthiness
    ml_prediction = predict_creditworthiness(features, model_bundle)
    explanations = get_shap_explanations(features, model_bundle)
    recommendations = get_recommendations(
        pillar_scores, {**features, "multiplier_used": loan_eligibility["multiplier_used"]}
    )

    return {
        "msme_id": profile["msme_id"],
        "business_name": business_name,
        "gstin": gstin,
        "business_type": business_type,
        "city": city,
        "years_in_business": years_in_business,
        "ntc_flag": ntc_flag,
        "ntb_flag": ntb_flag,
        "pillar_scores": pillar_scores,
        "loan_eligibility": loan_eligibility,
        "ml_prediction": ml_prediction,
        "explanations": explanations,
        "recommendations": recommendations,
        "monthly_revenues": profile["gst_data"]["monthly_revenues"],
        "monthly_inflows": profile["upi_aa_data"]["monthly_inflows"],
        "data_sources": profile.get("data_sources", {}),
        "raw_features": {k: round(v, 4) if isinstance(v, float) else v for k, v in features.items()},
        "generated_at": datetime.now().isoformat(),
    }


# ─── /generate ────────────────────────────────────────────────────────────────

@router.post("/generate")
def generate_health_score(
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not request.get("consent_given"):
        raise HTTPException(status_code=400, detail="Consent is required.")

    gstin = request.get("gstin", "").upper().strip()
    business_name = request.get("business_name", "")
    business_type = request.get("business_type", "Retail")
    city = request.get("city", "Mumbai")
    years_in_business = int(request.get("years_in_business", 3))

    # Validate GSTIN format
    validation = validate_gstin(gstin) if gstin else {"valid": False}

    if gstin and validation["valid"]:
        # Deterministic seeded profile from real GSTIN
        profile = generate_msme_profile_from_gstin(
            gstin=gstin,
            business_name=business_name,
            business_type=business_type,
            city=city,
            years_in_business=years_in_business,
        )
    else:
        # Fallback to random profile (demo / invalid GSTIN)
        profile = generate_msme_profile(business_type=business_type, city=city)
        profile["business_name"] = business_name
        profile["gstin"] = gstin
        profile["years_in_business"] = years_in_business
        profile["msme_id"] = str(uuid.uuid4())

    result = build_result(profile, business_name, gstin, business_type, city, years_in_business)

    # Generate & store AA consent artifact
    consent_id = str(uuid.uuid4())
    artifact = _make_consent_artifact(consent_id, gstin, business_name)
    save_consent(db, consent_id, result["msme_id"], gstin, artifact, user_id=current_user.id)
    result["consent_id"] = consent_id
    result["gstin_valid"] = validation.get("valid", False)

    save_score(db, result, user_id=current_user.id)
    return result


# ─── /demo ────────────────────────────────────────────────────────────────────

@router.get("/demo")
def get_demo_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = generate_msme_profile(quality="good")
    profile["msme_id"] = "demo-" + str(uuid.uuid4())[:8]
    result = build_result(
        profile, profile["business_name"], profile["gstin"],
        profile["business_type"], profile["city"], profile["years_in_business"],
    )
    save_score(db, result, user_id=current_user.id)
    return result


# ─── /benchmark ───────────────────────────────────────────────────────────────

@router.get("/benchmark")
def get_benchmark(
    business_type: str = Query(...),
    city: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cached = get_cached_benchmark(db, business_type, city)
    if cached:
        return cached

    # Compute fresh and cache
    data = _compute_benchmark(business_type, city)
    save_benchmark_cache(db, business_type, city, data)
    return data


def _compute_benchmark(business_type: str, city: str, n: int = 200) -> dict:
    profiles = [generate_msme_profile(business_type=business_type, city=city) for _ in range(n)]
    scores = []
    for p in profiles:
        try:
            features = extract_features(p)
            ntc = p.get("ntc_flag", False)
            scores.append(compute_pillar_scores(features, ntc_mode=ntc))
        except Exception:
            continue

    if not scores:
        raise HTTPException(status_code=404, detail="No benchmark data available.")

    pillars = ["cash_flow", "compliance", "growth", "stability", "credit_worthiness"]
    overalls = [s["overall"] for s in scores]

    return {
        "sample_size": len(scores),
        "business_type": business_type,
        "city": city,
        "overall": {
            "mean":   round(float(np.mean(overalls)), 1),
            "median": round(float(np.median(overalls)), 1),
            "p25":    round(float(np.percentile(overalls, 25)), 1),
            "p75":    round(float(np.percentile(overalls, 75)), 1),
        },
        "pillars": {
            p: {
                "mean":   round(float(np.mean([s[p] for s in scores if s[p] is not None])), 1),
                "median": round(float(np.median([s[p] for s in scores if s[p] is not None])), 1),
            }
            for p in pillars
        },
    }


# ─── /history ─────────────────────────────────────────────────────────────────

@router.get("/history")
def get_all_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return load_all_scores(db, user_id=current_user.id)


# ─── /trend ───────────────────────────────────────────────────────────────────

@router.get("/trend")
def get_score_trend(
    gstin: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Chronological score history for a GSTIN — powers the 'Score Journey' chart."""
    return load_score_trend(db, gstin.upper().strip(), user_id=current_user.id)


# ─── /consent/{consent_id} ────────────────────────────────────────────────────

@router.get("/consent/{consent_id}")
def get_consent_artifact(
    consent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    artifact = load_consent(db, consent_id)
    if not artifact:
        raise HTTPException(status_code=404, detail="Consent artifact not found.")
    return artifact


# ─── /{msme_id}/outcome ───────────────────────────────────────────────────────

@router.post("/{msme_id}/outcome")
def record_outcome(
    msme_id: str,
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_banker),
):
    valid_outcomes = {"repaid", "npa", "active", "rejected"}
    outcome = request.get("outcome", "").lower()
    if outcome not in valid_outcomes:
        raise HTTPException(status_code=400, detail=f"outcome must be one of {valid_outcomes}")

    # Fetch original score for context — must belong to this banker.
    score_record = load_score_by_id(db, msme_id, user_id=current_user.id)
    if not score_record:
        raise HTTPException(status_code=404, detail="Score not found for this account.")
    original_risk_band = score_record["loan_eligibility"]["risk_band"]
    original_score = score_record["pillar_scores"]["overall"]

    save_outcome(db, msme_id, {
        "outcome": outcome,
        "loan_product": request.get("loan_product"),
        "loan_amount": request.get("loan_amount"),
        "original_risk_band": original_risk_band,
        "original_score": original_score,
        "banker_notes": request.get("banker_notes", ""),
    }, user_id=current_user.id)

    return {"status": "recorded", "msme_id": msme_id, "outcome": outcome}


# ─── /outcomes (portfolio view) ───────────────────────────────────────────────

@router.get("/outcomes/all")
def get_all_outcomes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_banker),
):
    return {
        "outcomes": load_outcomes(db, user_id=current_user.id),
        "stats": get_outcome_stats(db, user_id=current_user.id),
    }


# ─── /{msme_id}/apply (submit a loan application) ─────────────────────────────

@router.post("/{msme_id}/apply")
def apply_for_loan(
    msme_id: str,
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    score_record = load_score_by_id(db, msme_id, user_id=current_user.id)
    if not score_record:
        raise HTTPException(status_code=404, detail="Score not found for this account.")
    record = save_application(db, {
        "msme_id": msme_id,
        "gstin": score_record.get("gstin"),
        "business_name": score_record.get("business_name"),
        "product": request.get("product"),
        "loan_amount": request.get("loan_amount"),
        "interest_rate": request.get("interest_rate"),
        "tenure_months": request.get("tenure_months"),
        "score": (score_record.get("pillar_scores") or {}).get("overall"),
    }, user_id=current_user.id)
    return {"status": "submitted", "reference": record.reference, "product": record.product}


# ─── /applications/all (banker: incoming applications) ────────────────────────

@router.get("/applications/all")
def get_all_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Single-bank model: a banker sees every incoming application; an MSME sees only theirs.
    uid = None if current_user.role == "banker" else current_user.id
    return {"applications": load_applications(db, user_id=uid)}


# ─── /{msme_id} ───────────────────────────────────────────────────────────────

@router.get("/{msme_id}")
def get_score_by_id(
    msme_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = load_score_by_id(db, msme_id, user_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Score not found.")
    return result
