#!/usr/bin/env python3
"""
Provision a Bank Manager account.

Real banking orgs don't let employees self-register through the customer-facing
UI (see AuthPage.jsx) -- accounts are provisioned by IT/Admin instead. This
script is that provisioning tool. It reuses the app's own DATABASE_URL
resolution (database.py), so it writes to whichever DB the API server is
actually using -- local sqlite in dev, or the live MYSQL_URL/DATABASE_URL in
Railway -- with no separate connection string to hardcode or keep in sync.

Local:       python seed_banker.py --email manager@idbibank.in --password ChangeMe123 --name "Rohan Mehta"
Live/Railway: railway run python seed_banker.py --email manager@idbibank.in --password ChangeMe123 --name "Rohan Mehta"
"""
import argparse
import sys

from database import SessionLocal, User, init_db
from routers.auth import hash_password


def seed_banker(email: str, password: str, full_name: str, force: bool = False):
    init_db()
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            if existing.role != "banker":
                print(f"[ERROR] {email} already exists with role={existing.role!r} — refusing to overwrite.")
                sys.exit(1)
            if not force:
                print(f"[SKIP] {email} already exists as a banker. Re-run with --force to reset its password.")
                return
            existing.hashed_password = hash_password(password)
            existing.full_name = full_name or existing.full_name
            db.commit()
            print(f"[OK] Password reset for existing banker {email}")
            return

        user = User(email=email, hashed_password=hash_password(password), full_name=full_name, role="banker")
        db.add(user)
        db.commit()
        print(f"[OK] Created banker account: {email} ({full_name or 'no name set'})")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Provision a Bank Manager (banker) account.")
    parser.add_argument("--email", required=True, help="Login email / employee ID, e.g. manager@idbibank.in")
    parser.add_argument("--password", required=True, help="Login password (min 6 characters)")
    parser.add_argument("--name", default="", help="Full name shown in the portal")
    parser.add_argument("--force", action="store_true", help="Reset the password if the account already exists")
    args = parser.parse_args()

    if len(args.password) < 6:
        print("[ERROR] Password must be at least 6 characters.")
        sys.exit(1)

    seed_banker(args.email, args.password, args.name, args.force)
