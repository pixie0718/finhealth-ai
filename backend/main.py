from dotenv import load_dotenv
load_dotenv()  # load SECRET_KEY / GEMINI_API_KEY from backend/.env before routers import

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import score
from routers import auth
from routers import chat
from routers import ocen
from database import init_db, SessionLocal, write_audit, User

app = FastAPI(
    title="MSME Financial Health Score API",
    description="AI-powered financial health assessment for MSMEs using alternate data (GST, UPI, AA, EPFO)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # Auth is via Bearer token in the Authorization header, not cookies, so
    # credentials aren't needed — and wildcard origin + credentials is invalid per CORS spec.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(score.router)
app.include_router(chat.router)
app.include_router(ocen.router)


# ─── Audit/compliance middleware ──────────────────────────────────────────────
# Logs every meaningful (mutating) API action with the acting user, for a
# compliance trail banks can verify. Read-only polling GETs are skipped to avoid noise.
def _user_from_request(request: Request, db):
    from jose import jwt, JWTError
    authz = request.headers.get("authorization", "")
    if not authz.lower().startswith("bearer "):
        return None
    try:
        payload = jwt.decode(authz.split(" ", 1)[1], auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email = payload.get("sub")
        if not email:
            return None
        return db.query(User).filter(User.email == email).first()
    except JWTError:
        return None


@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    response = await call_next(request)
    path = request.url.path
    # Only log state-changing calls to our API (register/login/generate/apply/outcome/ocen/chat…)
    if path.startswith("/api/") and request.method in ("POST", "PATCH", "PUT", "DELETE"):
        db = SessionLocal()
        try:
            user = _user_from_request(request, db)
            write_audit(
                db,
                user_id=getattr(user, "id", None),
                user_email=getattr(user, "email", None),
                role=getattr(user, "role", None),
                action=f"{request.method} {path}",
                method=request.method, path=path,
                status_code=response.status_code,
                ip_address=request.client.host if request.client else None,
            )
        finally:
            db.close()
    return response


@app.get("/")
def root():
    return {
        "message": "MSME Financial Health Score API",
        "version": "1.0.0",
        "endpoints": {
            "register": "/api/auth/register",
            "login": "/api/auth/login",
            "me": "/api/auth/me",
            "demo_score": "/api/score/demo",
            "generate_score": "/api/score/generate",
            "all_scores": "/api/score/history",
            "chat": "/api/chat",
            "docs": "/docs",
        },
    }


@app.on_event("startup")
async def startup_event():
    init_db()
    print("Database ready.")
    print("Loading ML model...")
    from routers.score import get_model, _compute_benchmark
    from data.synthetic_generator import BUSINESS_TYPES, CITIES
    from database import SessionLocal, get_cached_benchmark, save_benchmark_cache

    get_model()
    print("ML model ready.")

    # Pre-compute benchmark cache for all (business_type × city) combinations
    db = SessionLocal()
    try:
        total = len(BUSINESS_TYPES) * len(CITIES)
        computed = 0
        print(f"Pre-computing benchmark cache ({total} combinations)…")
        for bt in BUSINESS_TYPES:
            for city in CITIES:
                if not get_cached_benchmark(db, bt, city):
                    try:
                        data = _compute_benchmark(bt, city, n=150)
                        save_benchmark_cache(db, bt, city, data)
                        computed += 1
                    except Exception as e:
                        print(f"  Benchmark error {bt}/{city}: {e}")
        print(f"Benchmark cache ready ({computed} new, {total - computed} cached).")
    finally:
        db.close()
