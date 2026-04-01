# ═══════════════════════════════════════════════════════════════
# SAST Pipeline — Backend Dockerfile
# Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
# ═══════════════════════════════════════════════════════════════

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application
COPY . .

# Expose the API port
EXPOSE 5000

# Run with gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
