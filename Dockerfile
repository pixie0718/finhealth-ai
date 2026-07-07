# FinHealth AI - Backend Server (FastAPI + XGBoost + SHAP)
# For Railway deployment

FROM python:3.11-slim

# Install all build dependencies needed
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        g++ \
        gfortran \
        libgomp1 \
        liblapack-dev \
        libblas-dev \
        libffi-dev \
        libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ .

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/docs || exit 1

# Start the application
# DATABASE_URL, SECRET_KEY set via Railway environment variables
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
