#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FinHealth AI -> TiDB Migration Script
WARNING: Tests connection, creates finhealth DB, initializes all tables & demo data
"""

import sys
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
import json

# TiDB connection details
TIDB_HOST = "gateway01.ap-southeast-1.prod.aws.tidbcloud.com"
TIDB_PORT = 4000
TIDB_USER = "45YQw5GHn42CMte.root"
TIDB_PASSWORD = "AlvrFGDTt16kjnLx"
TIDB_NAME = "test"

# Connection URLs
TIDB_ROOT_URL = f"mysql+pymysql://{TIDB_USER}:{TIDB_PASSWORD}@{TIDB_HOST}:{TIDB_PORT}/"
TIDB_FINHEALTH_URL = f"mysql+pymysql://{TIDB_USER}:{TIDB_PASSWORD}@{TIDB_HOST}:{TIDB_PORT}/finhealth?ssl_verify_cert=true&ssl_verify_identity=true"

# Password hashing - use argon2 instead of bcrypt for better compatibility
try:
    pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
except:
    # Fallback to simpler hashing
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["plaintext"], deprecated="auto")

print("\n" + "="*70)
print("[BANK] FinHealth AI -> TiDB Migration")
print("="*70)

# --- STEP 1: Test Connection to TiDB ---
print("\n[1/5] Testing TiDB connection...")
try:
    engine_root = create_engine(TIDB_ROOT_URL, echo=False, connect_args={"ssl_verify_cert": True, "ssl_verify_identity": True})
    with engine_root.connect() as conn:
        result = conn.execute(text("SELECT VERSION()"))
        version = result.scalar()
        print(f"[OK] Connected to TiDB: {version}")
except Exception as e:
    print(f"[ERROR] Connection failed: {e}")
    sys.exit(1)

# --- STEP 2: Create finhealth Database ---
print("\n[2/5] Creating 'finhealth' database...")
try:
    with engine_root.connect() as conn:
        # Check if exists
        result = conn.execute(text("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'finhealth'"))
        exists = result.scalar() is not None

        if exists:
            print("[WARN] Database 'finhealth' already exists (will reuse)")
        else:
            conn.execute(text("CREATE DATABASE finhealth"))
            conn.commit()
            print("[OK] Created database 'finhealth'")
except Exception as e:
    print(f"[ERROR] Database creation failed: {e}")
    sys.exit(1)

# --- STEP 3: Create Tables in finhealth ---
print("\n[3/5] Creating tables in 'finhealth'...")

# Import the models after we know DB exists
sys.path.insert(0, os.path.dirname(__file__))
from database import Base

try:
    engine_fh = create_engine(TIDB_FINHEALTH_URL, echo=False, connect_args={"ssl_verify_cert": True, "ssl_verify_identity": True})

    # Create all tables
    Base.metadata.create_all(bind=engine_fh)

    # Verify tables
    inspector = inspect(engine_fh)
    tables = inspector.get_table_names()
    print(f"[OK] Created {len(tables)} tables:")
    for t in sorted(tables):
        print(f"   - {t}")

except Exception as e:
    print(f"[ERROR] Table creation failed: {e}")
    sys.exit(1)

# --- STEP 4: Seed Demo Data & Accounts ---
print("\n[4/5] Creating demo accounts & data...")

try:
    from database import User, ScoreRecord, ScoreSnapshot, LoanApplication, AuditLog
    Session = sessionmaker(bind=engine_fh)
    db = Session()

    # Demo accounts
    demo_owner_email = "owner@demo.com"
    demo_manager_email = "manager@demo.com"
    demo_password = "Demo123"

    # Check if accounts exist
    owner_exists = db.query(User).filter(User.email == demo_owner_email).first()
    manager_exists = db.query(User).filter(User.email == demo_manager_email).first()

    if not owner_exists:
        owner_user = User(
            email=demo_owner_email,
            hashed_password=pwd_context.hash(demo_password),
            full_name="Demo Owner",
            role="msme",
        )
        db.add(owner_user)
        db.commit()
        db.refresh(owner_user)
        print(f"[OK] Created demo owner account")
        print(f"   Email: {demo_owner_email}")
        print(f"   Password: {demo_password}")
        owner_id = owner_user.id
    else:
        owner_id = owner_exists.id
        print(f"[WARN] Demo owner account already exists")

    if not manager_exists:
        manager_user = User(
            email=demo_manager_email,
            hashed_password=pwd_context.hash(demo_password),
            full_name="Demo Manager",
            role="banker",
        )
        db.add(manager_user)
        db.commit()
        db.refresh(manager_user)
        print(f"[OK] Created demo manager account")
        print(f"   Email: {demo_manager_email}")
        print(f"   Password: {demo_password}")
        manager_id = manager_user.id
    else:
        manager_id = manager_exists.id
        print(f"[WARN] Demo manager account already exists")

    # Demo score data (Growth Star scenario)
    demo_score_data = {
        "msme_id": "DEMO-GROWTH-STAR-001",
        "business_name": "Sharma Textiles Pvt Ltd",
        "gstin": "27AAPFU0939F1ZV",
        "business_type": "Textile",
        "city": "Mumbai",
        "years_in_business": 5,
        "ntc_flag": False,
        "ntb_flag": False,
        "pillar_scores": {
            "cash_flow": 82,
            "compliance": 78,
            "growth": 85,
            "stability": 80,
            "credit": 88,
            "overall": 84
        },
        "loan_eligibility": {
            "eligible": True,
            "risk_band": "LOW",
            "risk_description": "LOW risk - Instant approval recommended",
            "max_loan": 5000000,
            "multiplier_used": 1.0,
            "eligible_products": ["MUDRA_KISHORE", "MUDRA_TARUN", "CGTMSE", "BUSINESS_LOAN"]
        },
        "ml_prediction": {"creditworthy": True, "confidence": 0.94},
        "explanations": {
            "top_drivers": [
                {"feature": "Revenue Growth", "value": 0.25},
                {"feature": "Cash Flow Stability", "value": 0.22},
                {"feature": "Compliance Rate", "value": 0.18}
            ]
        },
        "recommendations": [
            "Strong revenue growth suggests business is expanding",
            "Good compliance indicates organized operations",
            "Healthy cash flow supports debt servicing"
        ],
        "monthly_revenues": [450000, 480000, 520000, 510000, 560000, 580000, 600000, 620000, 640000, 660000, 680000, 700000, 720000, 750000, 780000, 800000, 820000, 850000],
        "monthly_inflows": [400000, 420000, 450000, 440000, 480000, 500000, 520000, 540000, 560000, 580000, 600000, 620000, 640000, 660000, 680000, 700000, 720000, 750000],
        "data_sources": {
            "gst": "GST SETU",
            "upi": "RBI AA Account Aggregator",
            "epfo": "EPFO Unified Portal",
            "credit": "CIBIL"
        },
        "raw_features": {
            "cash_flow_ratio": 2.1,
            "inflow_stability": 0.95,
            "bounce_rate": 0.02,
            "avg_balance_ratio": 1.8,
            "net_cash_flow_mean": 450000,
            "gst_compliance": 0.94,
            "epfo_compliance": 0.91,
            "combined_compliance": 0.93,
            "tax_to_revenue": 0.18,
            "revenue_growth": 0.15,
            "emp_growth": 0.08,
            "revenue_trend_norm": 0.82,
            "avg_monthly_revenue": 600000,
            "revenue_cv": 0.12,
            "buyer_diversity": 0.78,
            "buyer_concentration_risk": 0.22,
            "salary_stability": 0.91,
            "years_in_business": 5,
            "has_credit_history": 1,
            "credit_score_norm": 0.88,
            "dpd_30": 0,
            "dpd_90": 0,
            "active_loans": 1
        },
        "generated_at": datetime.utcnow().isoformat()
    }

    # Check if demo score exists
    demo_exists = db.query(ScoreRecord).filter(ScoreRecord.msme_id == demo_score_data["msme_id"]).first()
    if not demo_exists:
        demo_record = ScoreRecord(
            msme_id=demo_score_data["msme_id"],
            user_id=owner_id,
            business_name=demo_score_data["business_name"],
            gstin=demo_score_data["gstin"],
            business_type=demo_score_data["business_type"],
            city=demo_score_data["city"],
            years_in_business=str(demo_score_data["years_in_business"]),
            data_json=json.dumps(demo_score_data),
        )
        db.add(demo_record)

        # Add snapshot
        snapshot = ScoreSnapshot(
            msme_id=demo_score_data["msme_id"],
            user_id=owner_id,
            gstin=demo_score_data["gstin"],
            overall=demo_score_data["pillar_scores"]["overall"],
            risk_band=demo_score_data["loan_eligibility"]["risk_band"],
            generated_at=demo_score_data["generated_at"],
        )
        db.add(snapshot)
        db.commit()
        print(f"[OK] Created demo score (Growth Star - Score 84)")
    else:
        print(f"[WARN] Demo score already exists")

    # Create demo loan application
    demo_app_exists = db.query(LoanApplication).filter(
        LoanApplication.msme_id == demo_score_data["msme_id"]
    ).first()

    if not demo_app_exists:
        demo_app = LoanApplication(
            reference="FH-DEMO001",
            msme_id=demo_score_data["msme_id"],
            user_id=owner_id,
            gstin=demo_score_data["gstin"],
            business_name=demo_score_data["business_name"],
            product="MUDRA_KISHORE",
            loan_amount=2500000,
            interest_rate=8.5,
            tenure_months=36,
            score=84,
            status="SUBMITTED",
        )
        db.add(demo_app)
        db.commit()
        print(f"[OK] Created demo loan application (25L MUDRA)")
    else:
        print(f"[WARN] Demo application already exists")

    db.close()

except Exception as e:
    print(f"[ERROR] Demo data creation failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# --- STEP 5: Verify Migration ---
print("\n[5/5] Verifying migration...")
try:
    from database import User, ScoreRecord, LoanApplication
    Session = sessionmaker(bind=engine_fh)
    db = Session()

    user_count = db.query(User).count()
    score_count = db.query(ScoreRecord).count()
    app_count = db.query(LoanApplication).count()

    print(f"[OK] Database Statistics:")
    print(f"   Users: {user_count}")
    print(f"   Scores: {score_count}")
    print(f"   Loan Applications: {app_count}")

    db.close()

except Exception as e:
    print(f"[ERROR] Verification failed: {e}")
    sys.exit(1)

# --- Final Summary ---
print("\n" + "="*70)
print("[SUCCESS] MIGRATION COMPLETE!")
print("="*70)
print("\nNEXT STEPS:")
print("1. Update backend/.env with TiDB connection:")
print("   DATABASE_URL=mysql+pymysql://45YQw5GHn42CMte.root:AlvrFGDTt16kjnLx@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/finhealth?ssl_verify_cert=true&ssl_verify_identity=true")
print("\n2. Test backend locally:")
print("   cd backend && uvicorn main:app --reload")
print("   Visit: http://localhost:8000/docs")
print("\n3. Test demo accounts:")
print(f"   Owner  -> {demo_owner_email} / Demo@123456")
print(f"   Manager -> {demo_manager_email} / Demo@123456")
print("\n4. Deploy to Vercel")
print("="*70 + "\n")
