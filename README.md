<div align="center">

<br/>

```
███████╗ █████╗ ███████╗████████╗    ██████╗ ██╗██████╗ ███████╗██╗     ██╗███╗   ██╗███████╗
██╔════╝██╔══██╗██╔════╝╚══██╔══╝    ██╔══██╗██║██╔══██╗██╔════╝██║     ██║████╗  ██║██╔════╝
███████╗███████║███████╗   ██║       ██████╔╝██║██████╔╝█████╗  ██║     ██║██╔██╗ ██║█████╗
╚════██║██╔══██║╚════██║   ██║       ██╔═══╝ ██║██╔═══╝ ██╔══╝  ██║     ██║██║╚██╗██║██╔══╝
███████║██║  ██║███████║   ██║       ██║     ██║██║     ███████╗███████╗██║██║ ╚████║███████╗
╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝       ╚═╝     ╚═╝╚═╝     ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
```

### **Automated Security Analysis with Real-Time Vulnerability Dashboard**

*Find security vulnerabilities in your code automatically — on every single push.*

<br/>

[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Scanner](https://img.shields.io/badge/Scanner-Semgrep-3B8BD4?style=for-the-badge&logo=semgrep&logoColor=white)](https://semgrep.dev)
[![Backend](https://img.shields.io/badge/Backend-Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Database](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Containers](https://img.shields.io/badge/Containers-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Node](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![OWASP](https://img.shields.io/badge/Rules-OWASP_Top_10-red?style=for-the-badge)](https://owasp.org/www-project-top-ten/)

<br/>

</div>

-----

## Table of Contents

- [Overview](#overview)
- [Why This Project Exists](#why-this-project-exists)
- [Architecture](#architecture)
  - [High-Level System Diagram](#high-level-system-diagram)
  - [Data Flow Walkthrough](#data-flow-walkthrough)
  - [Component Breakdown](#component-breakdown)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [GitHub Actions Workflow](#github-actions-workflow)
- [Dashboard UI](#dashboard-ui)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup (Flask)](#2-backend-setup-flask)
  - [3. Frontend Setup (React)](#3-frontend-setup-react)
  - [4. Docker Setup (Recommended)](#4-docker-setup-recommended)
  - [5. GitHub Actions Configuration](#5-github-actions-configuration)
- [Running the Project](#running-the-project)
- [Configuration](#configuration)
- [What Semgrep Detects](#what-semgrep-detects)
- [Slack Alerts](#slack-alerts)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

-----

## Overview

**SAST Pipeline** is a fully automated security analysis system that scans your source code for vulnerabilities every time you push to GitHub. It combines the power of **Semgrep** (a best-in-class static analysis engine), **GitHub Actions** (free CI/CD automation), a **Flask REST API** (for storing and serving results), and a **React dashboard** (for visualizing findings in real time).

Instead of manually auditing code for security issues — a slow, error-prone, and often skipped process — this pipeline makes security analysis **automatic, continuous, and visible**. Every commit is scanned. Every vulnerability is logged. Every trend is charted.

```
You write code → push to GitHub → pipeline scans automatically
→ results stored → dashboard updates → you see exactly what's broken and where
```

This is a **DevSecOps** project — shifting security left in the development lifecycle so vulnerabilities are caught at the code stage, before they ever reach production.

-----

## Why This Project Exists

Most developers only think about security after a breach. By then it’s too late.

The industry solution is **Shift Left Security** — catching bugs earlier in the development pipeline when they’re cheapest to fix. A vulnerability found during code review costs 10× less to fix than one found in production. This project automates that process completely.

**Without this pipeline:**

- Security audits happen manually and rarely
- Vulnerabilities accumulate silently in the codebase
- No historical data on whether the codebase is getting safer or worse
- Developers have no immediate feedback on insecure code patterns

**With this pipeline:**

- Every push triggers an automatic OWASP Top 10 scan (< 30 seconds)
- All findings are persisted with full history
- Trends are visualized so you can see the security posture improving over time
- Critical findings send an instant Slack alert

-----

## Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPER MACHINE                               │
│                                                                          │
│   [ Source Code ]  ──── git push ────▶  [ GitHub Repository ]           │
│                                                  │                       │
└──────────────────────────────────────────────────┼───────────────────────┘
                                                   │ webhook trigger
                                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        GITHUB ACTIONS (CI Runner)                        │
│                                                                          │
│   1. Checkout code          (actions/checkout@v4)                        │
│   2. Install Python         (actions/setup-python@v5)                   │
│   3. Install Semgrep        (pip install semgrep)                        │
│   4. Run scan               (semgrep --config p/owasp-top-ten --json)   │
│   5. POST results to API    (python send_results.py)                     │
│                                                                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP POST /scan
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Flask API)                              │
│                                                                          │
│   POST /scan       ──── parse JSON ────▶  SQLite DB (findings.db)        │
│   GET  /findings   ◀─── query DB   ──────────────────────────────────── │
│   GET  /scans      ◀─── query DB   ──────────────────────────────────── │
│   GET  /stats      ◀─── aggregate  ──────────────────────────────────── │
│                                                                          │
│   [ Critical finding? ] ────▶ Slack Webhook POST                         │
│                                                                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP GET (every 30s)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React Dashboard)                         │
│                                                                          │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│   │ Stat     │  │ Stat     │  │ Stat     │  │ Stat                 │   │
│   │ Total    │  │ Critical │  │ High     │  │ Files Affected       │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────────────┘   │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │  Trend Chart — Findings per scan (Recharts BarChart)             │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │  Findings Table — File | Vulnerability | Line | Severity         │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Walkthrough

Here is the complete, step-by-step journey of data through the system from a single `git push`:

|Step|What Happens                                                                   |Where                 |
|----|-------------------------------------------------------------------------------|----------------------|
|1   |Developer runs `git push origin main`                                          |Local machine         |
|2   |GitHub detects the push, reads `.github/workflows/sast.yml`                    |GitHub                |
|3   |GitHub boots a free Ubuntu runner (temporary virtual machine)                  |GitHub cloud          |
|4   |Runner clones the repository onto itself                                       |GitHub runner         |
|5   |Runner installs Python 3.11 and Semgrep                                        |GitHub runner         |
|6   |Semgrep scans all source files against OWASP Top 10 rules                      |GitHub runner         |
|7   |Semgrep writes `findings.json` with all detected vulnerabilities               |GitHub runner         |
|8   |`send_results.py` reads the JSON and POSTs it to `http://your-server:5000/scan`|GitHub runner → Flask |
|9   |Flask parses the JSON, creates a `scans` row and N `findings` rows in SQLite   |Flask → SQLite        |
|10  |If any finding has `severity=CRITICAL`, Flask POSTs to the Slack webhook URL   |Flask → Slack         |
|11  |Every 30 seconds, the React app calls `GET /findings` and `GET /stats`         |React → Flask         |
|12  |Flask queries SQLite and returns JSON                                          |Flask → SQLite → React|
|13  |React updates its state, re-rendering the chart and table with fresh data      |React (browser)       |

### Component Breakdown

```
┌────────────────────────────────────────────────────────────────────────┐
│  COMPONENT          TECHNOLOGY       RESPONSIBILITY                     │
├────────────────────────────────────────────────────────────────────────┤
│  CI Trigger         GitHub Actions   Detects push, boots runner         │
│  Scanner            Semgrep          Static code analysis, OWASP rules  │
│  Result Poster      Python script    Sends JSON findings to Flask API   │
│  REST API           Flask (Python)   Receives, stores, serves findings  │
│  Database           SQLite           Persists scan history and findings  │
│  Dashboard UI       React + Recharts Visualizes data in real time       │
│  Alert System       Slack Webhooks   Notifies on critical severity      │
│  Containerization   Docker Compose   Packages and runs entire stack     │
└────────────────────────────────────────────────────────────────────────┘
```

-----

## Tech Stack

|Layer             |Technology                                           |Version|Purpose                                                              |
+|------------------|-----------------------------------------------------|-------|---------------------------------------------------------------------|
+|Security Scanner  |[Semgrep](https://semgrep.dev)                       |Latest |Static analysis engine — detects OWASP Top 10 vulnerabilities        |
+|CI/CD             |[GitHub Actions](https://github.com/features/actions)|—      |Triggers scan automatically on every push                            |
+|Backend Framework |[Flask](https://flask.palletsprojects.com)           |3.x    |Lightweight Python web framework for building the REST API           |
+|ORM               |[SQLAlchemy](https://sqlalchemy.org)                 |2.x    |Python library for interacting with the database without raw SQL     |
+|Database          |[SQLite](https://sqlite.org)                         |3.x    |Single-file relational database — no server setup needed             |
+|CORS Handling     |[flask-cors](https://flask-cors.readthedocs.io)      |Latest |Allows the React frontend to call the Flask API from a different port|
+|Frontend Framework|[React](https://react.dev)                           |18.x   |UI component library for building the interactive dashboard          |
+|Charts            |[Recharts](https://recharts.org)                     |2.x    |React-native charting library for the trend visualization            |
+|HTTP Client       |[Axios](https://axios-http.com)                      |Latest |Makes API calls from React to Flask cleanly                          |
+|Build Tool        |[Vite](https://vitejs.dev)                           |Latest |Fast React build tool and dev server                                 |
+|Containerization  |[Docker](https://docker.com)                         |Latest |Packages both services into containers                               |
+|Orchestration     |[Docker Compose](https://docs.docker.com/compose/)   |V2     |Runs Flask + React containers together                               |

-----

## Features

### Core Features

- **Automatic scanning on push** — GitHub Actions triggers Semgrep every time code lands on `main`. No manual step required. Zero human intervention.
- **OWASP Top 10 coverage** — Uses Semgrep’s `p/owasp-top-ten` ruleset covering SQL injection, XSS, hardcoded secrets, insecure deserialization, broken authentication, command injection, path traversal, insecure cryptography, sensitive data exposure, and more.
- **Persistent scan history** — Every scan is stored with its commit SHA, branch name, timestamp, and total finding count. Full audit trail. Never lose historical data.
- **REST API with filtering** — Flask endpoints support filtering by severity, date range, branch, file path, and rule ID using URL query parameters.
- **Real-time React dashboard** — Auto-refreshes every 30 seconds. Shows findings the moment a scan completes without any page reload.
- **Findings trend chart** — Bar chart of total vulnerabilities per scan over time. See at a glance whether your codebase’s security posture is improving.
- **Severity breakdown cards** — Total findings, Critical count, High count, and Files Affected displayed as summary cards at the top of the dashboard.
- **Sortable findings table** — Full list of vulnerabilities with file path, line number, rule ID, severity badge, and message. Sortable by any column. Clickable rows for detail view.
- **Slack alert on critical findings** — Instant notification to a Slack channel when a CRITICAL severity vulnerability is detected, before you even open the dashboard.
- **Docker Compose deployment** — Start the entire stack (Flask + React + SQLite) with a single `docker-compose up` command. Works identically on any machine.

### Security Features

- Semgrep runs in a sandboxed GitHub runner — your code never leaves GitHub’s infrastructure during scanning.
- The Flask API validates and sanitizes all incoming JSON before writing to the database.
- SQLite file is volume-mounted in Docker — data persists across container restarts.
- Slack webhook URL and other secrets are stored as GitHub Secrets — never hardcoded in code.

-----

## Project Structure

```
sast-pipeline/
│
├── .github/
│   └── workflows/
│       └── sast.yml                  # GitHub Actions workflow definition
│                                     # Triggers on push to main, runs Semgrep,
│                                     # POSTs results to Flask API
│
├── backend/
│   ├── app.py                        # Main Flask application
│   │                                 # Defines all API endpoints:
│   │                                 #   POST /scan
│   │                                 #   GET  /findings
│   │                                 #   GET  /scans
│   │                                 #   GET  /stats
│   │
│   ├── models.py                     # SQLAlchemy ORM models
│   │                                 # Defines Scan and Finding table classes
│   │                                 # Maps Python objects ↔ SQLite rows
│   │
│   ├── requirements.txt              # Python dependencies:
│   │                                 #   flask, flask-cors, sqlalchemy,
│   │                                 #   requests, python-dotenv
│   │
│   ├── Dockerfile                    # Docker image definition for Flask
│   │                                 # Base: python:3.11-slim
│   │                                 # Installs requirements, exposes port 5000
│   │
│   └── findings.db                   # SQLite database file (auto-created)
│                                     # Contains: scans table, findings table
│
├── frontend/
│   ├── package.json                  # Node.js project config
│   │                                 # Dependencies: react, recharts, axios, vite
│   │
│   ├── Dockerfile                    # Docker image definition for React
│   │                                 # Base: node:20-slim
│   │                                 # Builds static files, serves via nginx
│   │
│   ├── index.html                    # HTML entry point for Vite
│   │
│   └── src/
│       ├── App.jsx                   # Root component
│       │                             # Holds page layout and routing
│       │                             # Fetches data on mount and every 30s
│       │
│       ├── api.js                    # Centralized API call functions
│       │                             # fetchFindings(), fetchScans(), fetchStats()
│       │                             # All Axios calls live here — single source
│       │
│       └── components/
│           ├── StatCards.jsx         # Four summary metric cards (top row)
│           │                         # Props: total, critical, high, filesAffected
│           │
│           ├── TrendChart.jsx        # Recharts BarChart of findings over time
│           │                         # X-axis: scan date, Y-axis: finding count
│           │                         # Color-coded bars by max severity
│           │
│           └── FindingsTable.jsx     # Full findings list
│                                     # Columns: File, Line, Rule, Message, Severity
│                                     # Sortable, filterable by severity dropdown
│
├── send_results.py                   # Run inside GitHub Actions after Semgrep
│                                     # Reads findings.json, POSTs to Flask API
│                                     # Includes commit SHA and branch from env vars
│
├── docker-compose.yml                # Orchestrates Flask + React containers
│                                     # Sets up networking between services
│                                     # Mounts findings.db as a volume
│
├── .env.example                      # Template for environment variables
│                                     # Copy to .env and fill in values
│
├── .gitignore                        # Excludes .env, findings.db, node_modules,
│                                     # __pycache__, .venv, dist, findings.json
│
└── README.md                         # This file
```

-----

## Database Schema

The project uses two SQLite tables with a one-to-many relationship.

```
┌──────────────────────────────────────────────────────────────┐
│                           scans                               │
├─────────────────┬─────────────┬──────────────────────────────┤
│ Column          │ Type        │ Description                  │
├─────────────────┼─────────────┼──────────────────────────────┤
│ id              │ INTEGER PK  │ Auto-incrementing unique ID   │
│ timestamp       │ DATETIME    │ When the scan was received    │
│ commit_sha      │ TEXT        │ Git commit hash (e.g. a3f9d12)│
│ branch          │ TEXT        │ Git branch name (e.g. main)   │
│ total_findings  │ INTEGER     │ Count of all findings in scan │
│ critical_count  │ INTEGER     │ Count of CRITICAL findings    │
│ high_count      │ INTEGER     │ Count of HIGH findings        │
│ medium_count    │ INTEGER     │ Count of MEDIUM findings      │
│ low_count       │ INTEGER     │ Count of LOW findings         │
└─────────────────┴─────────────┴──────────────────────────────┘
                         │ (one scan has many findings)
                         │ 1 ──────────────────── N
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                          findings                             │
├─────────────────┬─────────────┬──────────────────────────────┤
│ Column          │ Type        │ Description                  │
├─────────────────┼─────────────┼──────────────────────────────┤
│ id              │ INTEGER PK  │ Auto-incrementing unique ID   │
│ scan_id         │ INTEGER FK  │ References scans.id           │
│ severity        │ TEXT        │ CRITICAL / HIGH / MEDIUM / LOW│
│ rule_id         │ TEXT        │ Semgrep rule name             │
│ file_path       │ TEXT        │ Relative path to affected file│
│ line_number     │ INTEGER     │ Line where issue was found    │
│ message         │ TEXT        │ Human-readable description    │
│ cwe             │ TEXT        │ CWE identifier (e.g. CWE-89)  │
└─────────────────┴─────────────┴──────────────────────────────┘
```

**PK** = Primary Key (unique row identifier)
**FK** = Foreign Key (references a row in another table)
**CWE** = Common Weakness Enumeration — the industry standard classification for vulnerability types

-----

## API Reference

All endpoints return JSON. The base URL when running locally is `http://localhost:5000`.

-----

### `POST /scan`

Receives Semgrep scan results from GitHub Actions and stores them in the database.

**Request body:**

```json
{
  "commit_sha": "a3f9d12e8b44c1...",
  "branch": "main",
  "results": [
    {
      "check_id": "python.lang.security.audit.hardcoded-password",
      "path": "app/auth.py",
      "start": { "line": 14 },
      "extra": {
        "severity": "ERROR",
        "message": "Hardcoded password detected",
        "metadata": {
          "cwe": ["CWE-798"]
        }
      }
    }
  ]
}
```

**Response `201 Created`:**

```json
{
  "scan_id": 42,
  "findings_stored": 7,
  "critical": 2,
  "message": "Scan recorded successfully"
}
```

-----

### `GET /findings`

Returns a list of all stored findings, with optional filters.

**Query parameters:**

|Parameter |Type   |Example             |Description                         |
|----------|-------|--------------------|------------------------------------|
|`severity`|string |`?severity=CRITICAL`|Filter by severity level            |
|`scan_id` |integer|`?scan_id=42`       |Filter to a specific scan           |
|`branch`  |string |`?branch=main`      |Filter by branch name               |
|`limit`   |integer|`?limit=50`         |Max results to return (default: 100)|
+|`offset`  |integer|`?offset=0`         |Pagination offset                   |

**Response `200 OK`:**

```json
{
  "findings": [
    {
      "id": 1,
      "scan_id": 42,
      "severity": "CRITICAL",
      "rule_id": "python.lang.security.audit.hardcoded-password",
      "file_path": "app/auth.py",
      "line_number": 14,
      "message": "Hardcoded password detected. Move this to an environment variable.",
      "cwe": "CWE-798"
    }
  ],
  "total": 24,
  "returned": 24
}
```

-----

### `GET /scans`

Returns a list of all scan runs with metadata.

**Query parameters:**

|Parameter|Type   |Example       |Description              |
|---------|-------|--------------|-------------------------|
|`branch` |string |`?branch=main`|Filter by branch         |
|`limit`  |integer|`?limit=10`   |Max results (default: 30)|

**Response `200 OK`:**

```json
{
  "scans": [
    {
      "id": 42,
      "timestamp": "2026-03-30T14:22:11Z",
      "commit_sha": "a3f9d12",
      "branch": "main",
      "total_findings": 7,
      "critical_count": 2,
      "high_count": 3,
      "medium_count": 2,
      "low_count": 0
    }
  ],
  "total": 15
}
```

-----

### `GET /stats`

Returns aggregated statistics for the dashboard summary cards.

**Response `200 OK`:**

```json
{
  "total_findings": 24,
  "critical": 3,
  "high": 7,
  "medium": 9,
  "low": 5,
  "files_affected": 9,
  "total_scans": 15,
  "last_scan": "2026-03-30T14:22:11Z"
}
```

-----

## GitHub Actions Workflow

The workflow file lives at `.github/workflows/sast.yml`. Here is the complete file with inline explanation of every line:

```yaml
name: SAST Security Scan

# Trigger: run this workflow on every push to the main branch
on:
  push:
    branches: [ "main" ]
  # Also allow manual trigger from the Actions tab
  workflow_dispatch:

jobs:
  sast-scan:
    # Use the latest Ubuntu virtual machine as the runner
    runs-on: ubuntu-latest

    steps:
      # Step 1: Download your repository onto the runner
      - name: Checkout code
        uses: actions/checkout@v4

      # Step 2: Install Python 3.11 on the runner
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      # Step 3: Install Semgrep and the requests library
      - name: Install dependencies
        run: |
          pip install semgrep requests

      # Step 4: Run Semgrep against all files in the repo
      # --config p/owasp-top-ten  →  use the OWASP Top 10 ruleset
      # --json                    →  output results as JSON
      # --output findings.json    →  save to this file
      # || true                   →  don't fail the workflow if issues are found
      #                              (we handle failures ourselves)
      - name: Run Semgrep scan
        run: |
          semgrep --config p/owasp-top-ten --json --output findings.json . || true

      # Step 5: Send the findings to your Flask API
      # GitHub automatically provides GITHUB_SHA and GITHUB_REF_NAME
      # FLASK_API_URL is stored as a GitHub Secret (never exposed in logs)
      - name: Send results to dashboard
        env:
          FLASK_API_URL: ${{ secrets.FLASK_API_URL }}
          COMMIT_SHA: ${{ github.sha }}
          BRANCH: ${{ github.ref_name }}
        run: |
          python send_results.py

      # Step 6 (optional): Fail the workflow if CRITICAL findings exist
      # This blocks merging PRs with critical vulnerabilities
      - name: Check for critical findings
        run: |
          python -c "
          import json, sys
          with open('findings.json') as f:
              data = json.load(f)
          critical = [r for r in data.get('results', []) if r.get('extra', {}).get('severity') == 'ERROR']
          if critical:
              print(f'CRITICAL: {len(critical)} critical finding(s) detected. Fix before merging.')
              sys.exit(1)
          print('No critical findings. Scan passed.')
          "
```

-----

## Dashboard UI

The React dashboard is organized into three sections:

**Section 1 — Summary Cards (top row)**

Four metric cards update on every data refresh:

- **Total Findings** — total vulnerability count across the latest scan
- **Critical** — count of CRITICAL severity issues (shown in red)
- **High** — count of HIGH severity issues (shown in amber)
- **Files Affected** — number of unique files containing at least one issue

**Section 2 — Trend Chart**

A `BarChart` from Recharts showing the total findings count per scan run across the last N scans. The X-axis shows the scan date and commit SHA. The Y-axis shows finding count. The color of each bar reflects the highest severity found in that scan (red for critical, amber for high, blue otherwise). This chart answers the key question: *Is the codebase getting more or less secure over time?*

**Section 3 — Findings Table**

A sortable table of all individual vulnerabilities with the following columns:

+|Column  |Content                                                  |
+|--------|---------------------------------------------------------|
+|File    |Relative file path and line number, e.g. `app/auth.py:14`|
+|Rule    |Semgrep rule ID that triggered the finding               |
+|Message |Plain English description of the vulnerability           |
+|CWE     |Industry standard weakness classification                |
+|Severity|Color-coded badge: CRITICAL / HIGH / MEDIUM / LOW        |

The table supports client-side sorting by any column and filtering by severity using a dropdown.

-----

## What Semgrep Detects

This project uses the `p/owasp-top-ten` ruleset, which maps directly to the [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/).

|OWASP Category                 |What It Catches                                |Example Vulnerable Code                             |
|-------------------------------|-----------------------------------------------|----------------------------------------------------|
|A01 — Broken Access Control    |Missing authentication checks, IDOR patterns   |`@app.route('/admin')` without auth decorator       |
|A02 — Cryptographic Failures   |MD5/SHA1 for passwords, HTTP instead of HTTPS  |`hashlib.md5(password.encode()).hexdigest()`        |
|A03 — Injection                |SQL injection, command injection, XSS          |`query = "SELECT * FROM users WHERE id=" + user_id` |
+|A04 — Insecure Design          |Hardcoded credentials, debug mode in production|`app.run(debug=True)` in production config          |
+|A05 — Security Misconfiguration|Exposed stack traces, default credentials      |`DEBUG = True` in settings                          |
+|A06 — Vulnerable Components    |Use of known-vulnerable library versions       |Detected via `requirements.txt` analysis            |
+|A07 — Identification Failures  |Weak session management, missing token expiry  |Sessions without `SESSION_COOKIE_SECURE`            |
+|A08 — Software/Data Integrity  |Insecure deserialization                       |`pickle.loads(user_supplied_data)`                  |
+|A09 — Logging Failures         |Passwords or tokens printed to logs            |`print(f"Password: {password}")`                    |
+|A10 — SSRF                     |Server-side request forgery patterns           |`requests.get(user_provided_url)` without validation|

**Severity mapping from Semgrep to this project:**

|Semgrep Severity|This Project’s Label|Meaning                                                     |
|----------------|--------------------|------------------------------------------------------------|
|`ERROR`         |CRITICAL            |Fix immediately. Exploitable vulnerability. Blocks PR merge.|
|`WARNING`       |HIGH                |Fix soon. Significant risk. Highlighted in dashboard.       |
|`INFO`          |MEDIUM              |Fix in current sprint. Moderate risk.                       |
|—               |LOW                 |Fix when convenient. Low exploitability.                    |

-----

## Slack Alerts

When the Flask API receives a finding with `severity = CRITICAL`, it sends an immediate Slack message via an Incoming Webhook.

**Setup:**

1. Go to your Slack workspace → Apps → Incoming Webhooks
1. Create a new webhook for your chosen channel
1. Copy the Webhook URL (looks like `https://hooks.slack.com/services/T.../B.../...`)
1. Add it to your `.env` file as `SLACK_WEBHOOK_URL`

**Example Slack message:**

```
[CRITICAL] Security Alert — SAST Pipeline

Repository:  my-org/my-repo
Branch:      main
Commit:      a3f9d12
Scanned at:  2026-03-30 14:22 UTC

2 critical finding(s) detected:

  • app/auth.py:14
    Hardcoded password detected (CWE-798)

  • api/views.py:82
    SQL injection via string concatenation (CWE-89)

View full report: http://your-server:3000
```

-----

## Prerequisites

Before setting up the project, make sure you have the following installed:

|Tool          |Version|How to check            |Install                           |
|--------------|-------|------------------------|----------------------------------|
|Git           |Any    |`git --version`         |[git-scm.com](https://git-scm.com)|
|Python        |3.11+  |`python --version`      |[python.org](https://python.org)  |
|Node.js       |20+    |`node --version`        |[nodejs.org](https://nodejs.org)  |
|Docker        |Latest |`docker --version`      |[docker.com](https://docker.com)  |
+|Docker Compose|V2     |`docker compose version`|Included with Docker Desktop      |

A GitHub account is also required for the CI/CD pipeline.

-----

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/sast-pipeline.git
cd sast-pipeline
```

Copy the environment variables template:

```bash
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables](#environment-variables)).

-----

### 2. Backend Setup (Flask)

```bash
cd backend

# Create a virtual environment (isolated Python environment)
python -m venv .venv

# Activate it (Linux/macOS)
source .venv/bin/activate

# Activate it (Windows)
.venv\Scripts\activate

# Install all Python dependencies
pip install -r requirements.txt

# Initialize the database (creates findings.db with empty tables)
python -c "from app import db, app; app.app_context().push(); db.create_all(); print('DB ready.')"

# Start the Flask development server
+flask run --host=0.0.0.0 --port=5000
```

Flask is now running at `http://localhost:5000`. Test it:

```bash
curl http://localhost:5000/stats
# Expected: {"total_findings": 0, "critical": 0, ...}
```

-----

### 3. Frontend Setup (React)

Open a new terminal window:

```bash
cd frontend

# Install all Node.js dependencies
npm install

# Start the Vite development server
npm run dev
```

React is now running at `http://localhost:3000`. Open it in your browser — you should see the dashboard with zero findings (the database is empty at this point).

-----

### 4. Docker Setup (Recommended)

Docker Compose starts both services together with a single command:

```bash
# Build both images and start both containers
docker compose up --build

# To run in the background (detached mode)
docker compose up --build -d

# To stop all containers
docker compose down

# To stop AND delete the database volume (fresh start)
docker compose down -v
```

After `docker compose up`, the services are available at:

- React dashboard: `http://localhost:3000`
- Flask API: `http://localhost:5000`

-----

### 5. GitHub Actions Configuration

To connect GitHub Actions to your running Flask API, you need to add secrets to your GitHub repository.

1. Go to your repository on GitHub
1. Click **Settings** → **Secrets and variables** → **Actions**
1. Click **New repository secret** for each of the following:

+|Secret name        |Value                        |Description                        |
+|-------------------|-----------------------------|-----------------------------------|
+|`FLASK_API_URL`    |`http://your-server-ip:5000` |Public URL of your Flask API       |
+|`SLACK_WEBHOOK_URL`|`https://hooks.slack.com/...`|Slack webhook for alerts (optional)|


> **Important:** Your Flask API must be publicly reachable for GitHub Actions (which runs on GitHub’s servers) to POST to it. For local development, use [ngrok](https://ngrok.com) to create a temporary public tunnel: `ngrok http 5000`.

-----

## Running the Project

### Without Docker

```bash
# Terminal 1 — Flask API
cd backend && source .venv/bin/activate && flask run --host=0.0.0.0 --port=5000

# Terminal 2 — React dashboard
cd frontend && npm run dev
```

### With Docker

```bash
docker compose up --build
```

### Testing a Manual Scan Locally

To test the full pipeline without pushing to GitHub:

```bash
# Install Semgrep
pip install semgrep

# Scan this project itself and save results
semgrep --config p/owasp-top-ten --json --output findings.json .

# Send results to Flask
FLASK_API_URL=http://localhost:5000 \
COMMIT_SHA=test-manual-run \
BRANCH=local \
python send_results.py

# Open the dashboard
open http://localhost:3000
```

-----

## Configuration

All configuration is done through environment variables in the `.env` file.

```bash
# .env.example — copy this to .env and fill in your values

# Flask backend settings
FLASK_ENV=development          # Set to 'production' when deploying live
FLASK_SECRET_KEY=              # Random string for Flask session security
                               # Generate one with: python -c "import secrets; print(secrets.token_hex(32))"

# Database
DATABASE_URL=sqlite:///findings.db  # Path to SQLite file (relative to backend/)

# CORS — which origin the React app runs on (Flask allows requests from this URL)
CORS_ORIGINS=http://localhost:3000

# Slack integration (optional)
SLACK_WEBHOOK_URL=             # Your Slack incoming webhook URL
SLACK_ENABLED=true             # Set to 'false' to disable Slack alerts

# Dashboard settings
REACT_APP_API_URL=http://localhost:5000   # URL the React app uses to call Flask
REFRESH_INTERVAL_MS=30000                 # How often the dashboard polls for new data (ms)
```

-----

## Roadmap

Features planned for future versions:

- [ ] **Multi-repo support** — scan multiple repositories and view them all in one dashboard with a dropdown filter
- [ ] **PR blocking** — automatically block pull request merges if critical findings are detected
- [ ] **User authentication** — login system for the dashboard with JWT tokens
- [ ] **Email alerts** — send vulnerability reports via email in addition to Slack
- [ ] **Custom ruleset upload** — allow uploading your own Semgrep YAML rules through the dashboard UI
- [ ] **Diff view** — show only findings that are new compared to the previous scan (delta analysis)
- [ ] **Language support badges** — detect which languages are in the repo and apply language-specific rulesets automatically
- [ ] **Kubernetes deployment** — Helm chart for deploying to a Kubernetes cluster
- [ ] **PDF report export** — download a formatted security report as a PDF from the dashboard
- [ ] **SARIF output** — export findings in SARIF format for compatibility with GitHub’s native code scanning UI

-----

## Contributing

Contributions are welcome. Here is the workflow:

1. Fork this repository
1. Create a feature branch: `git checkout -b feature/your-feature-name`
1. Make your changes and write tests where applicable
1. Commit with a descriptive message: `git commit -m "feat: add PDF export endpoint"`
1. Push to your fork: `git push origin feature/your-feature-name`
1. Open a Pull Request against the `main` branch of this repository

**Commit message conventions:**

+|Prefix     |When to use                              |
+|-----------|-----------------------------------------|
+|`feat:`    |Adding a new feature                     |
+|`fix:`     |Fixing a bug                             |
+|`docs:`    |Documentation changes only               |
+|`refactor:`|Code restructuring without feature change|
+|`chore:`   |Dependency updates, config changes       |

Please open an issue first before working on large changes so we can discuss the approach.

-----

## License

This project is licensed under the **MIT License** — see the <LICENSE> file for the full text.

MIT means you are free to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of this software. The only requirement is that the original copyright notice is preserved.

-----

<div align="center">

Built as a DevSecOps learning project — automating security, one push at a time..

**Mohamed Adhnaan J M** · BYTEAEGIS · [byteaegis.in](https://byteaegis.in) · [GitHub](https://github.com/BYTEGUARDIAN14)

</div>
