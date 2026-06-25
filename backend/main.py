from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import score
from routers import auth
from routers import chat
from database import init_db

app = FastAPI(
    title="MSME Financial Health Score API",
    description="AI-powered financial health assessment for MSMEs using alternate data (GST, UPI, AA, EPFO)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(score.router)
app.include_router(chat.router)


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
