# ==========================================
# Production-Grade Dockerfile
# FastAPI Backend (Python 3.11 / Uvicorn)
# ==========================================

# 1. Base Image
FROM python:3.11-slim AS base

WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies & curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Dependencies Stage
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Application Code & Non-root User
COPY . .

# Create non-root system user for security compliance
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 appuser && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

# Health check to ensure FastAPI backend is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:8000/api/health || exit 1

# Run Uvicorn in production mode with proxy headers & multiple workers
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--proxy-headers", "--forwarded-allow-ips=*"]
