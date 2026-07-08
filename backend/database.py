import json
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, String, Text, DateTime, func, Integer, Float, text, event
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool

import os
import sys

# Debug: Check if PyMySQL is available
try:
    import pymysql
    print("[DB] ✓ PyMySQL is installed")
except ImportError:
    print("[DB] ✗ WARNING: PyMySQL NOT found - will fail on MySQL URLs!")
    sys.exit(1)

# Determine database URL with proper driver configuration
DATABASE_URL = os.environ.get("DATABASE_URL")
print(f"[DB] DATABASE_URL env var: {bool(DATABASE_URL)}")

if not DATABASE_URL:
    # Railway provides MYSQL_URL; convert to explicit mysql+pymysql:// format
    mysql_url = os.environ.get("MYSQL_URL")
    print(f"[DB] MYSQL_URL env var: {bool(mysql_url)}")
    DATABASE_URL = mysql_url or "sqlite:///./finhealth.db"

# ALWAYS convert mysql:// to mysql+pymysql:// (works for both DATABASE_URL and MYSQL_URL)
if DATABASE_URL and DATABASE_URL.startswith("mysql://"):
    print(f"[DB] Converting mysql:// to mysql+pymysql://")
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
    print(f"[DB] ✓ Converted successfully")

print(f"[DB] Final DATABASE_URL dialect: {DATABASE_URL.split(':')[0] if ':' in DATABASE_URL else 'unknown'}")

# Create engine with proper config
if "sqlite" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
else:
    # MySQL: use explicit pymysql driver, pool config for Railway (ephemeral containers)
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_size=5,
        max_overflow=10,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="msme")
    created_at = Column(DateTime, server_default=func.now())


class ScoreRecord(Base):
    __tablename__ = "scores"
    msme_id = Column(String(50), primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    business_name = Column(String(255), nullable=False)
    gstin = Column(String(15), nullable=True, index=True)
    business_type = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    years_in_business = Column(String(50), nullable=True)
    data_json = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class ScoreSnapshot(Base):
    """Append-only log of every score run, so a business's score can be trended over time.

    The `scores` table keeps only the latest row per msme_id (upsert via merge), which means
    re-scoring the same GSTIN overwrites history. This table records each run instead.
    """
    __tablename__ = "score_snapshots"
    id = Column(Integer, primary_key=True, autoincrement=True)
    msme_id = Column(String(50), nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    gstin = Column(String(15), nullable=True, index=True)
    overall = Column(Float, nullable=True)
    risk_band = Column(String(50), nullable=True)
    generated_at = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class ConsentArtifact(Base):
    """Stores AA-style consent artifacts per GSTIN application."""
    __tablename__ = "consent_artifacts"
    consent_id = Column(String(100), primary_key=True, index=True)
    msme_id = Column(String(50), nullable=False, index=True)
    gstin = Column(String(15), nullable=True)
    user_id = Column(Integer, nullable=True)
    artifact_json = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="ACTIVE")   # ACTIVE | REVOKED | EXPIRED


class LoanOutcome(Base):
    """Tracks post-disbursement loan outcomes for model feedback."""
    __tablename__ = "loan_outcomes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    msme_id = Column(String(50), nullable=False, index=True)
    user_id = Column(Integer, nullable=True)
    outcome = Column(String(50), nullable=False)   # repaid | npa | active | rejected
    loan_product = Column(String(100), nullable=True)
    loan_amount = Column(Float, nullable=True)
    original_risk_band = Column(String(50), nullable=True)
    original_score = Column(Float, nullable=True)
    banker_notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, server_default=func.now())


class LoanApplication(Base):
    """A loan application submitted by an MSME from the result screen."""
    __tablename__ = "loan_applications"
    id = Column(Integer, primary_key=True, autoincrement=True)
    reference = Column(String(50), unique=True, index=True)
    msme_id = Column(String(50), nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    gstin = Column(String(15), nullable=True)
    business_name = Column(String(255), nullable=True)
    product = Column(String(100), nullable=True)
    loan_amount = Column(Float, nullable=True)
    interest_rate = Column(Float, nullable=True)
    tenure_months = Column(Integer, nullable=True)
    score = Column(Float, nullable=True)
    status = Column(String(50), default="SUBMITTED")   # SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED
    created_at = Column(DateTime, server_default=func.now())


class AuditLog(Base):
    """Compliance audit trail — one row per meaningful API action / data access."""
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=True, index=True)
    user_email = Column(String(255), nullable=True)
    role = Column(String(50), nullable=True)
    action = Column(String(255), nullable=False)          # e.g. "POST /api/score/generate"
    method = Column(String(20), nullable=True)
    path = Column(String(255), nullable=True)
    status_code = Column(Integer, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)


class BenchmarkCache(Base):
    """Pre-computed peer benchmark statistics per (business_type, city)."""
    __tablename__ = "benchmark_cache"
    id = Column(Integer, primary_key=True, autoincrement=True)
    business_type = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
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
    # Append an immutable snapshot so re-scoring the same GSTIN builds a trend history.
    db.add(ScoreSnapshot(
        msme_id=result["msme_id"],
        user_id=user_id,
        gstin=result.get("gstin", ""),
        overall=(result.get("pillar_scores") or {}).get("overall"),
        risk_band=(result.get("loan_eligibility") or {}).get("risk_band"),
        generated_at=result.get("generated_at"),
    ))
    db.commit()


def load_score_trend(db, gstin: str, user_id: int = None) -> list:
    """Chronological score snapshots for one GSTIN (for the Score Journey chart)."""
    q = db.query(ScoreSnapshot).filter(ScoreSnapshot.gstin == gstin)
    if user_id is not None:
        q = q.filter(ScoreSnapshot.user_id == user_id)
    records = q.order_by(ScoreSnapshot.created_at.asc()).all()
    return [{
        "msme_id": r.msme_id,
        "gstin": r.gstin,
        "overall": r.overall,
        "risk_band": r.risk_band,
        "generated_at": r.generated_at or str(r.created_at),
    } for r in records]


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


def get_outcome_stats(db, user_id: int = None) -> dict:
    """Portfolio quality stats for banker dashboard, scoped to the current banker."""
    q = db.query(LoanOutcome)
    if user_id is not None:
        q = q.filter(LoanOutcome.user_id == user_id)
    records = q.all()
    total = len(records)
    if not total:
        return {"total": 0, "repaid": 0, "npa": 0, "active": 0, "npa_rate": 0}
    counts = {"repaid": 0, "npa": 0, "active": 0, "rejected": 0}
    for r in records:
        counts[r.outcome] = counts.get(r.outcome, 0) + 1
    npa_rate = round(counts["npa"] / total * 100, 1) if total else 0
    return {"total": total, **counts, "npa_rate": npa_rate}


# ─── Loan application helpers ─────────────────────────────────────────────────

def save_application(db, data: dict, user_id: int = None) -> "LoanApplication":
    import uuid
    reference = "FH-" + uuid.uuid4().hex[:8].upper()
    record = LoanApplication(
        reference=reference,
        msme_id=data.get("msme_id"),
        user_id=user_id,
        gstin=data.get("gstin"),
        business_name=data.get("business_name"),
        product=data.get("product"),
        loan_amount=data.get("loan_amount"),
        interest_rate=data.get("interest_rate"),
        tenure_months=data.get("tenure_months"),
        score=data.get("score"),
        status="SUBMITTED",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update_application_status(db, reference: str, status: str):
    rec = db.query(LoanApplication).filter(LoanApplication.reference == reference).first()
    if not rec:
        return None
    rec.status = status
    db.commit()
    return {"reference": rec.reference, "status": rec.status, "msme_id": rec.msme_id}


def load_applications(db, user_id: int = None) -> list:
    q = db.query(LoanApplication)
    if user_id is not None:
        q = q.filter(LoanApplication.user_id == user_id)
    records = q.order_by(LoanApplication.created_at.desc()).all()
    return [{
        "reference": r.reference, "msme_id": r.msme_id, "gstin": r.gstin,
        "business_name": r.business_name, "product": r.product,
        "loan_amount": r.loan_amount, "interest_rate": r.interest_rate,
        "tenure_months": r.tenure_months, "score": r.score,
        "status": r.status, "created_at": str(r.created_at),
    } for r in records]


# ─── Audit log helpers ────────────────────────────────────────────────────────

def write_audit(db, *, user_id=None, user_email=None, role=None, action="",
                method=None, path=None, status_code=None, ip_address=None):
    try:
        db.add(AuditLog(
            user_id=user_id, user_email=user_email, role=role, action=action,
            method=method, path=path, status_code=status_code, ip_address=ip_address,
        ))
        db.commit()
    except Exception:
        db.rollback()


def load_audit_logs(db, limit: int = 100) -> list:
    records = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [{
        "id": r.id, "user_email": r.user_email, "role": r.role,
        "action": r.action, "status_code": r.status_code,
        "ip_address": r.ip_address, "created_at": str(r.created_at),
    } for r in records]


# ─── Benchmark cache helpers ──────────────────────────────────────────────────

BENCHMARK_CACHE_TTL = timedelta(hours=24)


def get_cached_benchmark(db, business_type: str, city: str):
    record = db.query(BenchmarkCache).filter(
        BenchmarkCache.business_type == business_type,
        BenchmarkCache.city == city,
    ).first()
    if not record:
        return None
    # A stale row (e.g. seeded by an older, buggy generator) would otherwise be
    # served forever — expire it so peer stats stay in sync with the current
    # scoring logic instead of calcifying on whatever was computed first.
    if datetime.utcnow() - record.computed_at > BENCHMARK_CACHE_TTL:
        return None
    return json.loads(record.cache_json)


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
