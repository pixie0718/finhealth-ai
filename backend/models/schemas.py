from pydantic import BaseModel
from typing import Optional, List


class MSMEOnboardRequest(BaseModel):
    business_name: str
    gstin: str
    business_type: str
    city: str
    years_in_business: int
    consent_given: bool = True


class PillarScore(BaseModel):
    cash_flow: float
    compliance: float
    growth: float
    stability: float
    credit_worthiness: Optional[float]   # None in NTC mode
    overall: float


class ExplanationItem(BaseModel):
    feature: str
    label: str
    shap_value: float
    feature_value: float


class Explanations(BaseModel):
    strengths: List[ExplanationItem]
    risks: List[ExplanationItem]
    base_value: float


class LoanEligibility(BaseModel):
    risk_band: str
    recommendation: str
    eligible_loan_amount: float
    multiplier_used: float


class HealthCardResponse(BaseModel):
    msme_id: str
    business_name: str
    gstin: str
    business_type: str
    city: str
    years_in_business: int
    pillar_scores: PillarScore
    loan_eligibility: LoanEligibility
    ml_prediction: dict
    explanations: Explanations
    raw_features: dict
    generated_at: str


class DashboardMSME(BaseModel):
    msme_id: str
    business_name: str
    city: str
    business_type: str
    overall_score: float
    risk_band: str
    recommendation: str
    eligible_loan_amount: float
    generated_at: str
