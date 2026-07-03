# FinHealth AI — backend (FastAPI + XGBoost/SHAP)
FROM python:3.12-slim

# Runtime lib xgboost needs (libgomp) + minimal build tools for any wheels that compile.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgomp1 gcc g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code (trained_model.joblib ships in the repo, so scoring works out of the box)
COPY . .

EXPOSE 8000

# SECRET_KEY / GEMINI_API_KEY / GST_SETU_API_KEY are provided via env (see docker-compose)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
