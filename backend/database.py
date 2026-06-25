import json
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, String, Text, DateTime, func, Integer, Float, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./finhealth.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="msme")
    created_at = Column(DateTime, server_default=func.now())


class ScoreRecord(Base):
    __tablename__ = "scores"
    msme_id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    business_name = Column(String, nullable=False)
    gstin = Column(String, nullable=True, index=True)
    business_type = Column(String, nullable=True)
    city = Column(String, nullable=True)
    years_in_business = Column(String, nullable=True)
    data_json = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class ConsentArtifact(Base):
    """Stores AA-style consent artifacts per GSTIN application."""
    __tablename__ = "consent_artifacts"
    consent_id = Column(String, primary_key=True, index=True)
    msme_id = Column(String, nullable=False, index=True)
    gstin = Column(String, nullable=True)
    user_id = Column(Integer, nullable=True)
    artifact_json = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=True)
    status = Column(String, default="ACTIVE")   # ACTIVE | REVOKED | EXPIRED


class LoanOutcome(Base):
    """Tracks post-disbursement loan outcomes for model feedback."""
    __tablename__ = "loan_outcomes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    msme_id = Column(String, nullable=False, index=True)
    user_id = Column(Integer, nullable=True)
    outcome = Column(String, nullable=False)   # repaid | npa | active | rejected
    loan_product = Column(String, nullable=True)
    loan_amount = Column(Float, nullable=True)
    original_risk_band = Column(String, nullable=True)
    original_score = Column(Float, nullable=True)
    banker_notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, server_default=func.now())


class BenchmarkCache(Base):
    """Pre-computed peer benchmark statistics per (business_type, city)."""
    __tablename__ = "benchmark_cache"
    id = Column(Integer, primary_key=True, autoincrement=True)
    business_type = Column(String, nullable=False)
    city = Column(String, nullable=False)
    cache_json = Column(Text, nullable=False)
    computed_at = Column(DateTime, server_default=func.now())


def init_db():
    Base.metadata.create_all(bind=engine)
    # Migrate: add user_id column to existing scores table if missing
    with engine.connect() as conn:
        for col in ["user_id INTEGER", "gstin TEXT"]:
            try:
                conn.execute(text(f"ALTER TABLE scores ADD COLUMN {col}"))
                conn.commit()
            except Exception:
                pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── Score helpers ────────────────────────────────────────────────────────────

def save_score(db, result: dict, user_id: int = None):
    record = ScoreRecord(
        msme_id=result["msme_id"],
        user_id=user_id,
        business_name=result.get("business_name", ""),
        gstin=result.get("gstin", ""),
        business_type=result.get("business_type", ""),
        city=result.get("city", ""),
        years_in_business=str(result.get("years_in_business", "")),
        data_json=json.dumps(result),
    )
    db.merge(record)
    db.commit()


def load_all_scores(db, user_id: int = None) -> list:
    q = db.query(ScoreRecord)
    if user_id is not None:
        q = q.filter(ScoreRecord.user_id == user_id)
    records = q.order_by(ScoreRecord.created_at.desc()).all()
    return [json.loads(r.data_json) for r in records]


def load_score_by_id(db, msme_id: str, user_id: int = None):
    q = db.query(ScoreRecord).filter(ScoreRecord.msme_id == msme_id)
    if user_id is not None:
        q = q.filter(ScoreRecord.user_id == user_id)
    record = q.first()
    return json.loads(record.data_json) if record else None


# ─── Consent helpers ──────────────────────────────────────────────────────────

def save_consent(db, consent_id: str, msme_id: str, gstin: str, artifact: dict, user_id: int = None):
    expires = datetime.utcnow() + timedelta(days=90)
    record = ConsentArtifact(
        consent_id=consent_id,
        msme_id=msme_id,
        gstin=gstin,
        user_id=user_id,
        artifact_json=json.dumps(artifact),
        expires_at=expires,
        status="ACTIVE",
    )
    db.add(record)
    db.commit()


def load_consent(db, consent_id: str):
    record = db.query(ConsentArtifact).filter(ConsentArtifact.consent_id == consent_id).first()
    if not record:
        return None
    return {**json.loads(record.artifact_json), "status": record.status}


# ─── Outcome helpers ──────────────────────────────────────────────────────────

def save_outcome(db, msme_id: str, outcome_data: dict, user_id: int = None):
    record = LoanOutcome(
        msme_id=msme_id,
        user_id=user_id,
        outcome=outcome_data.get("outcome"),
        loan_product=outcome_data.get("loan_product"),
        loan_amount=outcome_data.get("loan_amount"),
        original_risk_band=outcome_data.get("original_risk_band"),
        original_score=outcome_data.get("original_score"),
        banker_notes=outcome_data.get("banker_notes"),
    )
    db.add(record)
    db.commit()
    return record


def load_outcomes(db, user_id: int = None) -> list:
    q = db.query(LoanOutcome)
    if user_id is not None:
        q = q.filter(LoanOutcome.user_id == user_id)
    records = q.order_by(LoanOutcome.recorded_at.desc()).all()
    return [{
        "id": r.id, "msme_id": r.msme_id, "outcome": r.outcome,
        "loan_product": r.loan_product, "loan_amount": r.loan_amount,
        "original_risk_band": r.original_risk_band, "original_score": r.original_score,
        "banker_notes": r.banker_notes, "recorded_at": str(r.recorded_at),
    } for r in records]


def get_outcome_stats(db) -> dict:
    """Portfolio quality stats for banker dashboard."""
    records = db.query(LoanOutcome).all()
    total = len(records)
    if not total:
        return {"total": 0, "repaid": 0, "npa": 0, "active": 0, "npa_rate": 0}
    counts = {"repaid": 0, "npa": 0, "active": 0, "rejected": 0}
    for r in records:
        counts[r.outcome] = counts.get(r.outcome, 0) + 1
    npa_rate = round(counts["npa"] / total * 100, 1) if total else 0
    return {"total": total, **counts, "npa_rate": npa_rate}


# ─── Benchmark cache helpers ──────────────────────────────────────────────────

def get_cached_benchmark(db, business_type: str, city: str):
    record = db.query(BenchmarkCache).filter(
        BenchmarkCache.business_type == business_type,
        BenchmarkCache.city == city,
    ).first()
    return json.loads(record.cache_json) if record else None


def save_benchmark_cache(db, business_type: str, city: str, data: dict):
    existing = db.query(BenchmarkCache).filter(
        BenchmarkCache.business_type == business_type,
        BenchmarkCache.city == city,
    ).first()
    if existing:
        existing.cache_json = json.dumps(data)
        existing.computed_at = datetime.utcnow()
    else:
        record = BenchmarkCache(business_type=business_type, city=city, cache_json=json.dumps(data))
        db.add(record)
    db.commit()
