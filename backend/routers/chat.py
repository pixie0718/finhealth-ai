import os
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from google import genai

from database import User
from routers.auth import get_current_user

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Ordered fallback chain — best model first. If one is overloaded (503) or rate-limited
# (429), the next is tried so users don't hit a hard error on a temporary spike.
FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-lite",
]

_client = None


def get_client():
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=503, detail="AI assistant not configured. Set GEMINI_API_KEY.")
        _client = genai.Client(api_key=api_key)
    return _client


class ChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None


def build_system_prompt(context: Optional[dict]) -> str:
    base = (
        "You are FinHealth AI Assistant, an expert financial advisor embedded in the FinHealth AI platform — "
        "an MSME credit assessment tool used by IDBI Bank. "
        "You help both bank officers and MSME business owners understand financial health scores, "
        "loan eligibility, credit improvement strategies, and alternate data (GST, UPI, EPFO, CIBIL). "
        "Be concise, factual, and practical. Use ₹ for currency. "
        "Do not make up specific numbers unless they come from the provided data."
    )

    if not context:
        return base

    ps = context.get("pillar_scores", {})
    le = context.get("loan_eligibility", {})
    ml = context.get("ml_prediction", {})
    rf = context.get("raw_features", {})

    summary = f"""

You are currently viewing the Financial Health Card for:
- Business: {context.get('business_name', 'N/A')} ({context.get('gstin', 'N/A')})
- Type: {context.get('business_type', 'N/A')} | City: {context.get('city', 'N/A')} | {context.get('years_in_business', 'N/A')} years in business

PILLAR SCORES (0-100):
- Cash Flow: {ps.get('cash_flow', 'N/A')}
- Compliance: {ps.get('compliance', 'N/A')}
- Growth: {ps.get('growth', 'N/A')}
- Stability: {ps.get('stability', 'N/A')}
- Credit Worthiness: {ps.get('credit_worthiness', 'N/A')}
- Overall Score: {ps.get('overall', 'N/A')}

LOAN ELIGIBILITY:
- Risk Band: {le.get('risk_band', 'N/A')}
- Recommendation: {le.get('recommendation', 'N/A')}
- Eligible Loan Amount: Rs.{le.get('eligible_loan_amount', 0):,.0f}

ML PREDICTION: {ml.get('prediction', 'N/A')} (confidence: {float(ml.get('confidence', 0))*100:.0f}%)

KEY METRICS:
- GST Compliance: {rf.get('gst_compliance', 'N/A')}
- EPFO Compliance: {rf.get('epfo_compliance', 'N/A')}
- Cash Flow Ratio: {rf.get('cash_flow_ratio', 'N/A')}
- Bounce Rate: {rf.get('bounce_rate', 'N/A')}
- Revenue Growth: {rf.get('revenue_growth', 'N/A')}
- Avg Monthly Revenue: Rs.{rf.get('avg_monthly_revenue', 0):,.0f}
- Credit Score (normalised): {rf.get('credit_score_norm', 'N/A')}
- DPD 30/90: {rf.get('dpd_30', 0)}/{rf.get('dpd_90', 0)}

Answer questions specifically about this MSME's data when relevant."""

    return base + summary


@router.post("")
def chat(
    body: ChatMessage,
    current_user: User = Depends(get_current_user),
):
    system_prompt = build_system_prompt(body.context)
    full_prompt = f"{system_prompt}\n\nUser: {body.message}"

    client = get_client()  # raises 503 (not configured) — kept outside try so it isn't masked as 502

    # Try each model in order; if one is overloaded/rate-limited (503/429), fall back
    # to the next so a temporary spike on a single model doesn't surface to the user.
    last_error = None
    for model in FALLBACK_MODELS:
        try:
            response = client.models.generate_content(model=model, contents=full_prompt)
            if response and response.text:
                return {"reply": response.text}
        except Exception as e:
            last_error = e
            continue

    print(f"[chat] all models failed, last error: {last_error}")
    raise HTTPException(
        status_code=503,
        detail="The AI assistant is busy right now. Please try again in a moment.",
    )
