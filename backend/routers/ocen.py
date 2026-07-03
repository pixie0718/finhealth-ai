"""
OCEN (Open Credit Enablement Network) integration.

Demonstrates how FinHealth AI would hand a completed credit assessment to a bank's
OCEN node. This is a mock that builds an OCEN-standard credit request from a stored
score and returns a simulated node decision — the real flow would POST the same
payload to the bank's /ecl/creditRequest endpoint.
"""
import hashlib
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db, load_score_by_id, User
from routers.auth import get_current_user, require_banker

router = APIRouter(prefix="/api/ocen", tags=["OCEN"])


def _build_ocen_request(score: dict) -> dict:
    """Assemble an OCEN-standard credit request from a stored score record."""
    ps = score.get("pillar_scores", {}) or {}
    le = score.get("loan_eligibility", {}) or {}
    now = datetime.utcnow()
    msme_id = score.get("msme_id", "")
    request_id = "OCEN-" + hashlib.sha256(f"{msme_id}{now.timestamp()}".encode()).hexdigest()[:16].upper()

    return {
        "requestId": request_id,
        "version": "OCEN-2.0",
        "borrowerConsentId": score.get("consent_id") or f"AA-CONSENT-{msme_id[:8].upper()}",
        "creditRequest": {
            "gstin": score.get("gstin"),
            "businessName": score.get("business_name"),
            "businessType": score.get("business_type"),
            "city": score.get("city"),
            "requestedAmount": le.get("eligible_loan_amount", 0),
        },
        "creditAssessment": {
            "overallScore": ps.get("overall"),
            "riskBand": le.get("risk_band"),
            "recommendation": le.get("recommendation"),
            "pillars": {
                "cashFlow": ps.get("cash_flow"),
                "compliance": ps.get("compliance"),
                "growth": ps.get("growth"),
                "stability": ps.get("stability"),
                "creditWorthiness": ps.get("credit_worthiness"),
            },
            "ntcFlag": score.get("ntc_flag", False),
            "dataSourcesUsed": ["GST", "UPI/AA", "EPFO"] + (["CIBIL"] if not score.get("ntc_flag") else []),
        },
        "lender": {"id": "IDBI-OCEN-NODE-001", "name": "IDBI Bank Ltd"},
        "timestamp": now.isoformat() + "Z",
    }


def _simulate_ocen_response(request: dict) -> dict:
    """Simulate the bank OCEN node's decision response."""
    score = request["creditAssessment"]["overallScore"] or 0
    approved = score >= 60
    now = datetime.utcnow()
    return {
        "status": "SUCCESS",
        "requestId": request["requestId"],
        "receivedAt": now.isoformat() + "Z",
        "bankDecision": {
            "status": "APPROVED" if approved else "REVIEW_REQUIRED",
            "recommendedAmount": request["creditRequest"]["requestedAmount"] if approved else 0,
            "riskBand": request["creditAssessment"]["riskBand"],
            "processingTimeMinutes": 2,
            "nextStep": "Disbursement initiated" if approved else "Routed to manual underwriting",
        },
        "node": {"id": "IDBI-OCEN-NODE-001", "name": "IDBI Bank Ltd", "protocol": "OCEN 2.0 / ECL"},
    }


@router.post("/submit-credit-request")
def submit_credit_request(
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_banker),
):
    """Submit a stored score to the bank's OCEN node and return request + node response."""
    msme_id = request.get("msme_id")
    if not msme_id:
        raise HTTPException(status_code=400, detail="msme_id is required.")

    # Single-bank model: a banker may submit any assessed MSME.
    score = load_score_by_id(db, msme_id)
    if not score:
        raise HTTPException(status_code=404, detail="Score not found for this MSME.")

    ocen_request = _build_ocen_request(score)
    ocen_response = _simulate_ocen_response(ocen_request)
    return {"request": ocen_request, "response": ocen_response}


@router.get("/status")
def ocen_status(current_user: User = Depends(get_current_user)):
    """Health/handshake info for the OCEN node integration."""
    return {
        "connected": True,
        "node": {"id": "IDBI-OCEN-NODE-001", "name": "IDBI Bank Ltd", "protocol": "OCEN 2.0 / ECL"},
        "mode": "SANDBOX",
    }
