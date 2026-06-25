import hashlib
import numpy as np
import pandas as pd
from faker import Faker
import random
from datetime import datetime, timedelta

fake = Faker("en_IN")

BUSINESS_TYPES = ["Textile","Pharma","Electronics","Food Processing","Retail","Construction","IT Services","Logistics"]
CITIES = ["Mumbai","Delhi","Surat","Ahmedabad","Pune","Bangalore","Chennai","Hyderabad","Kolkata","Jaipur"]

# GSTIN state code → primary city mapping
STATE_CITY_MAP = {
    "01":"Jammu", "02":"Shimla", "03":"Chandigarh", "04":"Chandigarh",
    "05":"Dehradun", "06":"Delhi", "07":"Delhi", "08":"Jaipur",
    "09":"Lucknow", "10":"Patna", "18":"Guwahati", "19":"Kolkata",
    "20":"Ranchi", "21":"Bhubaneswar", "22":"Raipur", "23":"Bhopal",
    "24":"Surat", "27":"Mumbai", "29":"Bangalore", "30":"Panaji",
    "32":"Kochi", "33":"Chennai", "36":"Hyderabad", "37":"Vijayawada",
}

# Business type → typical revenue range (in INR/month)
REVENUE_RANGES = {
    "Textile":        (500000, 8000000),
    "Pharma":         (800000, 12000000),
    "Electronics":    (600000, 10000000),
    "Food Processing":(300000, 5000000),
    "Retail":         (200000, 4000000),
    "Construction":   (1000000, 15000000),
    "IT Services":    (400000, 8000000),
    "Logistics":      (500000, 7000000),
}


def _gstin_seed(gstin: str) -> int:
    """Convert GSTIN to a stable integer seed — same GSTIN = same random profile."""
    digest = hashlib.sha256(gstin.upper().strip().encode()).hexdigest()
    return int(digest[:16], 16)


def validate_gstin(gstin: str) -> dict:
    """Basic GSTIN format validation. Returns state_code and pan."""
    gstin = gstin.upper().strip()
    if len(gstin) != 15:
        return {"valid": False, "reason": "GSTIN must be 15 characters"}
    try:
        state_code = gstin[:2]
        int(state_code)   # must be numeric
    except ValueError:
        return {"valid": False, "reason": "Invalid state code"}
    return {"valid": True, "state_code": state_code, "pan": gstin[2:12]}


def infer_city_from_gstin(gstin: str, requested_city: str) -> str:
    """Use GSTIN state code to validate/infer city; fall back to requested."""
    state_code = gstin[:2] if len(gstin) >= 2 else "27"
    return STATE_CITY_MAP.get(state_code, requested_city)


def generate_gst_data(months: int = 18, revenue_base: float = None,
                      compliance_rate: float = None, rng=None) -> dict:
    if rng is None:
        rng = random
    if revenue_base is None:
        revenue_base = rng.uniform(200000, 5000000)
    if compliance_rate is None:
        compliance_rate = rng.uniform(0.55, 1.0)

    monthly_revenues, gst_filed, buyers = [], [], []
    for _ in range(months):
        growth = 1 + rng.uniform(-0.05, 0.12)
        noise = rng.uniform(0.85, 1.15)
        revenue = revenue_base * growth * noise
        monthly_revenues.append(round(revenue, 2))
        gst_filed.append(1 if rng.random() < compliance_rate else 0)
        buyers.append(rng.randint(3, 25))
        revenue_base = revenue * 0.98

    total_revenue = sum(monthly_revenues)
    tax_amount = total_revenue * 0.18
    return {
        "monthly_revenues": monthly_revenues,
        "gst_filed_months": gst_filed,
        "tax_paid": round(tax_amount * compliance_rate, 2),
        "unique_buyers_per_month": buyers,
        "filing_compliance_rate": sum(gst_filed) / months,
        "total_months": months,
    }


def generate_upi_aa_data(months: int = 18, revenue_base: float = None, rng=None) -> dict:
    if rng is None:
        rng = random
    if revenue_base is None:
        revenue_base = rng.uniform(150000, 4000000)

    monthly_inflows, monthly_outflows, bounce_counts, transaction_counts = [], [], [], []
    for _ in range(months):
        inflow = revenue_base * rng.uniform(0.8, 1.2)
        outflow = inflow * rng.uniform(0.55, 0.85)
        txn_count = rng.randint(80, 500)
        bounce = rng.randint(0, max(1, int(txn_count * 0.05)))
        monthly_inflows.append(round(inflow, 2))
        monthly_outflows.append(round(outflow, 2))
        bounce_counts.append(bounce)
        transaction_counts.append(txn_count)
        revenue_base = inflow * 0.97

    return {
        "monthly_inflows": monthly_inflows,
        "monthly_outflows": monthly_outflows,
        "bounce_counts": bounce_counts,
        "transaction_counts": transaction_counts,
        "avg_monthly_balance": round(np.mean(monthly_inflows) * 0.3, 2),
    }


def generate_epfo_data(months: int = 18, rng=None) -> dict:
    if rng is None:
        rng = random
    base_employees = rng.randint(5, 150)
    employee_counts, avg_salaries, compliance_months = [], [], []
    epfo_rate = rng.uniform(0.7, 1.0)
    for _ in range(months):
        growth = rng.choice([0, 0, 0, 1, 1, 2, -1])
        base_employees = max(1, base_employees + growth)
        salary = rng.uniform(12000, 45000)
        complied = 1 if rng.random() < epfo_rate else 0
        employee_counts.append(base_employees)
        avg_salaries.append(round(salary, 2))
        compliance_months.append(complied)
    return {
        "employee_counts": employee_counts,
        "avg_salaries": avg_salaries,
        "epfo_compliance_months": compliance_months,
        "compliance_rate": sum(compliance_months) / months,
    }


def generate_credit_history(rng=None, ntc_forced: bool = False) -> dict:
    if rng is None:
        rng = random
    if ntc_forced or rng.random() < 0.35:
        return {"has_credit_history": False, "credit_score": None, "active_loans": 0, "dpd_30": 0, "dpd_90": 0}
    credit_score = rng.randint(550, 850)
    return {
        "has_credit_history": True,
        "credit_score": credit_score,
        "active_loans": rng.randint(0, 3),
        "dpd_30": rng.randint(0, 3),
        "dpd_90": rng.randint(0, 1),
    }


def generate_msme_profile_from_gstin(
    gstin: str,
    business_name: str,
    business_type: str,
    city: str,
    years_in_business: int,
) -> dict:
    """
    Deterministic profile generation — same GSTIN always yields the same profile.
    Uses SHA-256(GSTIN) as the RNG seed so values are reproducible but unique per GSTIN.
    """
    seed = _gstin_seed(gstin)
    rng = random.Random(seed)
    np_rng = np.random.RandomState(seed % (2**32))

    # Infer city from state code if possible
    inferred_city = infer_city_from_gstin(gstin, city)

    # Revenue base tuned by business type
    rev_lo, rev_hi = REVENUE_RANGES.get(business_type, (200000, 4000000))
    revenue_base = rng.uniform(rev_lo, rev_hi)

    # Compliance tuned by years_in_business (older = more compliant on average)
    base_compliance = min(0.55 + (years_in_business / 20) * 0.40, 1.0)
    compliance_rate = rng.uniform(max(0.40, base_compliance - 0.15), min(1.0, base_compliance + 0.15))

    # NTB detection: new businesses or very low revenue → likely no bank relationship
    ntb_flag = years_in_business <= 2 or revenue_base < 300000
    # NTC: seeded by GSTIN
    ntc_forced = rng.random() < (0.50 if ntb_flag else 0.25)

    gst = generate_gst_data(revenue_base=revenue_base, compliance_rate=compliance_rate, rng=rng)
    upi = generate_upi_aa_data(revenue_base=revenue_base * 0.9, rng=rng)
    epfo = generate_epfo_data(rng=rng)
    credit = generate_credit_history(rng=rng, ntc_forced=ntc_forced)

    import uuid
    return {
        "msme_id": str(uuid.UUID(hashlib.md5(gstin.encode()).hexdigest())),
        "business_name": business_name,
        "gstin": gstin,
        "business_type": business_type,
        "city": inferred_city,
        "years_in_business": years_in_business,
        "ntc_flag": not credit["has_credit_history"],
        "ntb_flag": ntb_flag,
        "gst_data": gst,
        "upi_aa_data": upi,
        "epfo_data": epfo,
        "credit_history": credit,
        "application_date": datetime.now().isoformat(),
        "data_sources": {
            "gst":    {"source": "GSTN e-Returns API", "months": 18, "status": "FETCHED"},
            "bank":   {"source": "AA Framework (Sahamati)", "months": 18, "status": "FETCHED"},
            "epfo":   {"source": "EPFO Unified Portal", "months": 18, "status": "FETCHED"},
            "credit": {"source": "CIBIL / Equifax", "status": "FETCHED" if credit["has_credit_history"] else "NO_RECORD"},
        },
    }


# ─── Keep old generate_msme_profile for dataset generation / benchmarks ──────

def generate_msme_profile(business_type=None, city=None, quality="random") -> dict:
    if business_type is None:
        business_type = random.choice(BUSINESS_TYPES)
    if city is None:
        city = random.choice(CITIES)

    if quality == "good":
        revenue_base = random.uniform(1000000, 5000000)
        compliance_rate = random.uniform(0.85, 1.0)
    elif quality == "poor":
        revenue_base = random.uniform(100000, 500000)
        compliance_rate = random.uniform(0.4, 0.65)
    else:
        revenue_base = random.uniform(200000, 4000000)
        compliance_rate = random.uniform(0.55, 1.0)

    gst = generate_gst_data(revenue_base=revenue_base, compliance_rate=compliance_rate)
    upi = generate_upi_aa_data(revenue_base=revenue_base * 0.9)
    epfo = generate_epfo_data()
    credit = generate_credit_history()

    import uuid, faker as fk
    _fake = fk.Faker("en_IN")
    years_in_business = random.randint(1, 15)
    return {
        "msme_id": str(uuid.uuid4()),
        "business_name": _fake.company(),
        "gstin": f"27{_fake.bothify('??########?#Z#')}",
        "business_type": business_type,
        "city": city,
        "years_in_business": years_in_business,
        "ntc_flag": not credit["has_credit_history"],
        "ntb_flag": years_in_business <= 2,
        "gst_data": gst,
        "upi_aa_data": upi,
        "epfo_data": epfo,
        "credit_history": credit,
        "application_date": datetime.now().isoformat(),
        "data_sources": {
            "gst": {"source": "GSTN", "months": 18, "status": "FETCHED"},
            "bank": {"source": "AA Framework", "months": 18, "status": "FETCHED"},
            "epfo": {"source": "EPFO", "months": 18, "status": "FETCHED"},
            "credit": {"source": "CIBIL", "status": "FETCHED" if credit["has_credit_history"] else "NO_RECORD"},
        },
    }


def generate_dataset(n: int = 500) -> list:
    profiles = []
    good = int(n * 0.4)
    poor = int(n * 0.25)
    random_count = n - good - poor
    for _ in range(good):
        profiles.append(generate_msme_profile(quality="good"))
    for _ in range(poor):
        profiles.append(generate_msme_profile(quality="poor"))
    for _ in range(random_count):
        profiles.append(generate_msme_profile(quality="random"))
    random.shuffle(profiles)
    return profiles
