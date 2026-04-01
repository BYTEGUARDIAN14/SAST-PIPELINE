# 🛡️ SAST Pipeline

**Automated Static Application Security Testing Pipeline**

[![SAST Scan](https://github.com/BYTEGUARDIAN14/sast-pipeline/actions/workflows/sast.yml/badge.svg)](https://github.com/BYTEGUARDIAN14/sast-pipeline/actions/workflows/sast.yml)

> Built by **Mohamed Adhnaan J M** · [BYTEAEGIS](https://byteaegis.in) · Registration: 6176AC23UCS097

---

## 📋 Overview

Every time code is pushed to the `main` branch, this pipeline automatically:

1. 🚀 Boots a temporary Ubuntu runner via GitHub Actions
2. 📥 Checks out the latest code
3. 🔍 Runs **Semgrep** with the `p/owasp-top-ten` ruleset
4. 💾 Saves findings as `findings.json`
5. 📡 POSTs findings to a **Flask REST API** via `send_results.py`
6. 🗄️ Flask parses the JSON and stores results in **SQLite**
7. 🚨 If any **CRITICAL** finding exists, fires a **Slack webhook alert**
8. 📊 A **React dashboard** polls Flask every 30s and displays:
   - Summary stat cards (Total, Critical, High, Files Affected)
   - Bar chart of findings per scan over time (Recharts)
   - Sortable, filterable findings table with severity badges

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **CI/CD** | GitHub Actions |
| **Scanner** | Semgrep (p/owasp-top-ten) |
| **Backend** | Python 3.11 + Flask 3.x |
| **ORM** | SQLAlchemy 2.x |
| **Database** | SQLite |
| **CORS** | flask-cors |
| **Frontend** | React 18 + Vite 5 |
| **Charts** | Recharts 2.x |
| **HTTP Client** | Axios |
| **Containers** | Docker + Docker Compose V2 |
| **Alerts** | Slack Incoming Webhooks |

---

## 📁 Project Structure

```
sast-pipeline/
├── .github/workflows/
│   └── sast.yml              # GitHub Actions SAST workflow
├── backend/
│   ├── app.py                # Flask REST API
│   ├── models.py             # SQLAlchemy models (Scan, Finding)
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Backend container
├── frontend/
│   ├── package.json          # Node.js dependencies
│   ├── index.html            # Vite entry point
│   ├── vite.config.js        # Vite configuration
│   ├── Dockerfile            # Multi-stage frontend container
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # Root component with polling
│       ├── api.js            # Axios API client
│       └── components/
│           ├── StatCards.jsx      # Summary stat cards
│           ├── TrendChart.jsx     # Recharts bar chart
│           └── FindingsTable.jsx  # Sortable findings table
├── send_results.py           # CI script to POST findings
├── docker-compose.yml        # Container orchestration
├── .env.example              # Environment variable template
├── .gitignore                # Git exclusions
└── README.md                 # This file
```

---

## 🚀 How to Run This Project

### Prerequisites

- **Docker & Docker Compose** (recommended) OR
- **Python 3.11+** and **Node.js 18+** (for manual setup)

---

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/BYTEGUARDIAN14/sast-pipeline.git
cd sast-pipeline

# Create .env from the example
cp .env.example .env

# Generate a secret key and add it to .env
python -c "import secrets; print(secrets.token_hex(32))"
# → paste the output as FLASK_SECRET_KEY in .env

# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f
```

- **Dashboard**: http://localhost:3000
- **API**: http://localhost:5000
- **Healthcheck**: http://localhost:5000/health

To stop:
```bash
docker compose down
```

---

### Option 2: Manual Setup (No Docker)

#### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp ../.env.example ../.env
# Edit ../.env and set FLASK_SECRET_KEY

# Run the Flask API
python app.py
```

The API will start on http://localhost:5000.

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dashboard will open at http://localhost:3000.

---

### Trigger a Test Scan Locally

You can simulate a scan by POSTing sample data to the API:

```bash
curl -X POST http://localhost:5000/scan \
  -H "Content-Type: application/json" \
  -d '{
    "commit_sha": "abc123def456789012345678901234567890abcd",
    "branch": "main",
    "results": [
      {
        "check_id": "python.lang.security.audit.dangerous-subprocess-use",
        "path": "app/utils.py",
        "start": { "line": 42 },
        "extra": {
          "severity": "ERROR",
          "message": "Detected subprocess call with shell=True, which is potentially dangerous.",
          "metadata": {
            "cwe": ["CWE-78: OS Command Injection"]
          }
        }
      },
      {
        "check_id": "python.lang.security.audit.insecure-hash-md5",
        "path": "app/auth.py",
        "start": { "line": 15 },
        "extra": {
          "severity": "WARNING",
          "message": "Use of insecure MD5 hash function detected.",
          "metadata": {
            "cwe": ["CWE-328: Reversible One-Way Hash"]
          }
        }
      },
      {
        "check_id": "python.lang.security.audit.hardcoded-password",
        "path": "config/settings.py",
        "start": { "line": 8 },
        "extra": {
          "severity": "INFO",
          "message": "Possible hardcoded password detected in variable assignment.",
          "metadata": {
            "cwe": ["CWE-798: Hardcoded Credentials"]
          }
        }
      }
    ]
  }'
```

Then refresh the dashboard to see the results!

---

### GitHub Actions Setup

To enable the CI/CD pipeline:

1. Go to your GitHub repository **Settings → Secrets and Variables → Actions**
2. Add the following secret:
   - `FLASK_API_URL`: The public URL of your Flask API (e.g., `https://your-server.com`)
3. Push code to the `main` branch — the SAST workflow will trigger automatically

---

### Slack Alerts (Optional)

1. Create a [Slack Incoming Webhook](https://api.slack.com/messaging/webhooks)
2. Add the webhook URL to your `.env`:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...
   ```
3. Critical findings will now trigger Slack notifications automatically

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/scan` | Ingest Semgrep findings from CI |
| `GET` | `/findings` | Query findings (filter by severity, scan_id, branch) |
| `GET` | `/scans` | List past scans |
| `GET` | `/stats` | Aggregated dashboard statistics |
| `GET` | `/health` | Healthcheck |

---

## 📜 License

This project is part of an academic submission.

**Author**: Mohamed Adhnaan J M
**Brand**: [BYTEAEGIS](https://byteaegis.in)
**GitHub**: [BYTEGUARDIAN14](https://github.com/BYTEGUARDIAN14)
**Registration**: 6176AC23UCS097
