# FinHealth AI - Backend Server
# For Railway deployment

FROM python:3.12-slim

# Install system dependencies (libgomp for XGBoost, build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgomp1 gcc g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ .

EXPOSE 8000

# Environment variables (set in Railway dashboard)
# DATABASE_URL, SECRET_KEY, GEMINI_API_KEY

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
