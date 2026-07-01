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
                      compliance_rate: float = None, rng=None, quality: float = 0.6) -> dict:
    """quality ∈ [0,1] drives filing compliance, revenue trend/volatility and buyer diversity
    so that a business's fundamentals move together (good businesses look good across pillars)."""
    if rng is None:
        rng = random
    if revenue_base is None:
        revenue_base = rng.uniform(200000, 5000000)
    if compliance_rate is None:
        compliance_rate = min(1.0, max(0.35, 0.45 + 0.55 * quality + rng.uniform(-0.08, 0.08)))

    trend = -0.025 + 0.055 * quality          # monthly drift: poor shrinks, good grows
    vol = 0.03 + 0.15 * (1 - quality)         # good = steady revenue, poor = volatile
    b_mean = 4 + 18 * quality                 # good = many buyers, poor = few
    running = revenue_base
    monthly_revenues, gst_filed, buyers = [], [], []
    for _ in range(months):
        noise = rng.uniform(1 - vol, 1 + vol)
        monthly_revenues.append(round(max(1000, running * noise), 2))
        gst_filed.append(1 if rng.random() < compliance_rate else 0)
        buyers.append(max(1, rng.randint(int(b_mean) - 3, int(b_mean) + 4)))
        running *= (1 + trend)

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


def generate_upi_aa_data(months: int = 18, revenue_base: float = None, rng=None, quality: float = 0.6) -> dict:
    """quality drives cash retention (net cash flow), inflow stability, bounce rate and balance."""
    if rng is None:
        rng = random
    if revenue_base is None:
        revenue_base = rng.uniform(150000, 4000000)

    out_ratio = 0.85 - 0.32 * quality         # good businesses retain more cash
    vol = 0.04 + 0.16 * (1 - quality)         # good = steady inflows
    bal_ratio = 0.12 + 0.42 * quality         # good keep a healthier balance
    trend = -0.02 + 0.05 * quality
    running = revenue_base
    monthly_inflows, monthly_outflows, bounce_counts, transaction_counts = [], [], [], []
    for _ in range(months):
        inflow = running * rng.uniform(1 - vol, 1 + vol)
        outflow = inflow * min(0.97, max(0.4, out_ratio + rng.uniform(-0.05, 0.05)))
        txn_count = rng.randint(80, 500)
        bounce = rng.randint(0, max(1, int(txn_count * 0.06 * (1 - quality))))
        monthly_inflows.append(round(inflow, 2))
        monthly_outflows.append(round(outflow, 2))
        bounce_counts.append(bounce)
        transaction_counts.append(txn_count)
        running *= (1 + trend)

    return {
        "monthly_inflows": monthly_inflows,
        "monthly_outflows": monthly_outflows,
        "bounce_counts": bounce_counts,
        "transaction_counts": transaction_counts,
        "avg_monthly_balance": round(np.mean(monthly_inflows) * bal_ratio, 2),
    }


def generate_epfo_data(months: int = 18, rng=None, quality: float = 0.6) -> dict:
    """quality drives EPFO compliance, headcount growth and salary stability."""
    if rng is None:
        rng = random
    base_employees = rng.randint(5, 150)
    epfo_rate = min(1.0, max(0.4, 0.55 + 0.45 * quality + rng.uniform(-0.08, 0.08)))
    base_salary = rng.uniform(15000, 42000)
    sal_vol = 0.02 + 0.12 * (1 - quality)     # good = steady payroll
    # hiring pattern: good businesses tend to add staff, weak ones shed
    steps = [1, 1, 2, 0] if quality > 0.6 else ([0, 0, -1, 1] if quality < 0.35 else [0, 0, 1, 1, -1, 2])
    employee_counts, avg_salaries, compliance_months = [], [], []
    for _ in range(months):
        base_employees = max(1, base_employees + rng.choice(steps))
        salary = base_salary * rng.uniform(1 - sal_vol, 1 + sal_vol)
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


def generate_credit_history(rng=None, ntc_forced: bool = False, quality: float = 0.6) -> dict:
    """quality drives CIBIL score and delinquency (DPD) for businesses with a credit file."""
    if rng is None:
        rng = random
    if ntc_forced or rng.random() < 0.30:
        return {"has_credit_history": False, "credit_score": None, "active_loans": 0, "dpd_30": 0, "dpd_90": 0}
    credit_score = int(min(850, max(500, 520 + 320 * quality + rng.uniform(-40, 40))))
    return {
        "has_credit_history": True,
        "credit_score": credit_score,
        "active_loans": rng.randint(0, 3),
        "dpd_30": rng.randint(0, max(0, int(4 * (1 - quality)))),
        "dpd_90": rng.randint(0, max(0, int(2 * (1 - quality)))),
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

    # Overall business "quality" for this GSTIN — deterministic from the seed, nudged up
    # by tenure. Drives every pillar together so a given GSTIN is coherently strong/weak.
    quality = min(0.97, max(0.05, rng.uniform(0.18, 0.92) + (years_in_business / 20) * 0.12 - 0.04))

    # NTB detection: new businesses or very low revenue → likely no bank relationship
    ntb_flag = years_in_business <= 2 or revenue_base < 300000
    # NTC: seeded by GSTIN
    ntc_forced = rng.random() < (0.50 if ntb_flag else 0.25)

    gst = generate_gst_data(revenue_base=revenue_base, rng=rng, quality=quality)
    upi = generate_upi_aa_data(revenue_base=revenue_base * 0.9, rng=rng, quality=quality)
    epfo = generate_epfo_data(rng=rng, quality=quality)
    credit = generate_credit_history(rng=rng, ntc_forced=ntc_forced, quality=quality)

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

    # Map the quality label to a numeric factor q ∈ [0,1] that drives every generator.
    if quality == "good":
        q = random.uniform(0.70, 0.96)
        revenue_base = random.uniform(1000000, 5000000)
    elif quality == "poor":
        q = random.uniform(0.06, 0.34)
        revenue_base = random.uniform(100000, 500000)
    else:
        q = random.uniform(0.12, 0.92)
        revenue_base = random.uniform(200000, 4000000)

    gst = generate_gst_data(revenue_base=revenue_base, quality=q)
    upi = generate_upi_aa_data(revenue_base=revenue_base * 0.9, quality=q)
    epfo = generate_epfo_data(quality=q)
    credit = generate_credit_history(quality=q)

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
