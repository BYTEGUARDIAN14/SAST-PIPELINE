"""
═══════════════════════════════════════════════════════════════
SAST Pipeline — Flask REST API
Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
Repo  : BYTEGUARDIAN14/sast-pipeline
Reg   : 6176AC23UCS097

Endpoints:
  POST /scan      — Ingest Semgrep findings from CI
  GET  /findings  — Query stored findings with filters
  GET  /scans     — List past scans
  GET  /stats     — Aggregated dashboard statistics
  GET  /health    — Healthcheck
═══════════════════════════════════════════════════════════════
"""

import os
import json
import logging
from datetime import datetime

import requests as http_requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import func, select

from models import Base, Scan, Finding, init_db

# ── Load environment variables ───────────────────────────────
load_dotenv()

# ── Configure logging ────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ── Initialize Flask app ─────────────────────────────────────
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")

# ── CORS setup ───────────────────────────────────────────────
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
CORS(app, origins=[o.strip() for o in cors_origins.split(",")])

# ── Database setup ───────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///findings.db")
engine, SessionLocal = init_db(DATABASE_URL)

# ── Severity mapping (Semgrep → our system) ──────────────────
SEVERITY_MAP = {
    "ERROR": "CRITICAL",
    "WARNING": "HIGH",
    "INFO": "MEDIUM",
}


def map_severity(semgrep_severity):
    """Map a Semgrep severity string to our severity scheme."""
    return SEVERITY_MAP.get(semgrep_severity.upper(), "LOW")


# ══════════════════════════════════════════════════════════════
# Slack Alerting
# ══════════════════════════════════════════════════════════════

def send_slack_alert(findings, scan_id, commit_sha, branch):
    """
    Send a Slack incoming-webhook alert for critical findings.
    Silently returns if SLACK_WEBHOOK_URL is not configured or
    if any exception occurs (never crash the main request).
    """
    webhook_url = os.getenv("SLACK_WEBHOOK_URL", "").strip()
    if not webhook_url:
        logger.info("SLACK_WEBHOOK_URL not set — skipping Slack alert.")
        return

    try:
        finding_lines = []
        for f in findings:
            finding_lines.append(
                f"• *{f['rule_id']}* in `{f['file_path']}:{f['line_number']}`\n"
                f"  _{f['message'][:120]}_"
            )

        text = (
            f":rotating_light: *CRITICAL Security Findings Detected*\n"
            f"*Scan ID:* {scan_id}\n"
            f"*Commit:* `{commit_sha[:8]}`\n"
            f"*Branch:* `{branch}`\n"
            f"*Critical Findings:* {len(findings)}\n\n"
            + "\n".join(finding_lines)
        )

        payload = {"text": text}
        resp = http_requests.post(webhook_url, json=payload, timeout=10)
        logger.info(f"Slack alert sent — status {resp.status_code}")
    except Exception as exc:
        logger.warning(f"Slack alert failed (non-fatal): {exc}")


# ══════════════════════════════════════════════════════════════
# API Endpoints
# ══════════════════════════════════════════════════════════════

# ── POST /scan ───────────────────────────────────────────────
@app.route("/scan", methods=["POST"])
def create_scan():
    """
    Ingest Semgrep findings from a CI run.

    Expected JSON body:
      {
        "commit_sha": "abc123...",
        "branch": "main",
        "results": [ ...Semgrep results array... ]
      }
    """
    # Validate request content type
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    commit_sha = data.get("commit_sha", "").strip()
    branch = data.get("branch", "").strip()
    results = data.get("results", [])

    if not commit_sha:
        return jsonify({"error": "commit_sha is required"}), 400
    if not branch:
        return jsonify({"error": "branch is required"}), 400
    if not isinstance(results, list):
        return jsonify({"error": "results must be an array"}), 400

    # Count severities
    severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    parsed_findings = []

    for item in results:
        extra = item.get("extra", {})
        raw_severity = extra.get("severity", "INFO")
        mapped = map_severity(raw_severity)
        severity_counts[mapped] = severity_counts.get(mapped, 0) + 1

        # Extract CWE from metadata if available
        metadata = extra.get("metadata", {})
        cwe_list = metadata.get("cwe", [])
        cwe_str = cwe_list[0] if isinstance(cwe_list, list) and cwe_list else ""
        if isinstance(cwe_list, str):
            cwe_str = cwe_list

        parsed_findings.append({
            "severity": mapped,
            "rule_id": item.get("check_id", "unknown"),
            "file_path": item.get("path", "unknown"),
            "line_number": item.get("start", {}).get("line", 0),
            "message": extra.get("message", "No message provided"),
            "cwe": cwe_str,
        })

    # Persist to database
    session = SessionLocal()
    try:
        scan = Scan(
            commit_sha=commit_sha,
            branch=branch,
            total_findings=len(parsed_findings),
            critical_count=severity_counts["CRITICAL"],
            high_count=severity_counts["HIGH"],
            medium_count=severity_counts["MEDIUM"],
            low_count=severity_counts["LOW"],
        )
        session.add(scan)
        session.flush()  # get scan.id before adding findings

        for pf in parsed_findings:
            finding = Finding(
                scan_id=scan.id,
                severity=pf["severity"],
                rule_id=pf["rule_id"],
                file_path=pf["file_path"],
                line_number=pf["line_number"],
                message=pf["message"],
                cwe=pf["cwe"],
            )
            session.add(finding)

        session.commit()
        scan_id = scan.id
    except Exception as exc:
        session.rollback()
        logger.error(f"Database error: {exc}")
        return jsonify({"error": "Failed to store scan results"}), 500
    finally:
        session.close()

    # Fire Slack alert if any CRITICAL findings
    critical_findings = [f for f in parsed_findings if f["severity"] == "CRITICAL"]
    if critical_findings:
        send_slack_alert(critical_findings, scan_id, commit_sha, branch)

    logger.info(
        f"Scan {scan_id} stored: {len(parsed_findings)} findings "
        f"({severity_counts['CRITICAL']}C/{severity_counts['HIGH']}H/"
        f"{severity_counts['MEDIUM']}M/{severity_counts['LOW']}L)"
    )

    return jsonify({
        "scan_id": scan_id,
        "findings_stored": len(parsed_findings),
        "critical": severity_counts["CRITICAL"],
        "message": (
            "Critical findings detected — Slack alert sent"
            if critical_findings
            else "Scan results stored successfully"
        ),
    }), 201


# ── GET /findings ────────────────────────────────────────────
@app.route("/findings", methods=["GET"])
def get_findings():
    """
    Query stored findings with optional filters.

    Query params:
      severity  — filter by severity (CRITICAL, HIGH, MEDIUM, LOW)
      scan_id   — filter by scan ID
      branch    — filter by branch name
      limit     — max results to return (default 100)
      offset    — pagination offset (default 0)
    """
    severity = request.args.get("severity", "").strip().upper()
    scan_id = request.args.get("scan_id", type=int)
    branch = request.args.get("branch", "").strip()
    limit = request.args.get("limit", 100, type=int)
    offset = request.args.get("offset", 0, type=int)

    session = SessionLocal()
    try:
        stmt = select(Finding)

        if severity:
            stmt = stmt.where(Finding.severity == severity)
        if scan_id:
            stmt = stmt.where(Finding.scan_id == scan_id)
        if branch:
            stmt = stmt.join(Scan).where(Scan.branch == branch)

        # Get total count before pagination
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = session.execute(count_stmt).scalar()

        # Apply pagination
        stmt = stmt.order_by(Finding.id.desc()).limit(limit).offset(offset)
        findings = session.execute(stmt).scalars().all()

        return jsonify({
            "findings": [f.to_dict() for f in findings],
            "total": total,
            "returned": len(findings),
        })
    except Exception as exc:
        logger.error(f"Query error: {exc}")
        return jsonify({"error": "Failed to query findings"}), 500
    finally:
        session.close()


# ── GET /scans ───────────────────────────────────────────────
@app.route("/scans", methods=["GET"])
def get_scans():
    """
    List past scans with optional filters.

    Query params:
      branch — filter by branch name
      limit  — max results to return (default 30)
    """
    branch = request.args.get("branch", "").strip()
    limit = request.args.get("limit", 30, type=int)

    session = SessionLocal()
    try:
        stmt = select(Scan)

        if branch:
            stmt = stmt.where(Scan.branch == branch)

        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = session.execute(count_stmt).scalar()

        # Apply ordering and limit
        stmt = stmt.order_by(Scan.timestamp.desc()).limit(limit)
        scans = session.execute(stmt).scalars().all()

        return jsonify({
            "scans": [s.to_dict() for s in scans],
            "total": total,
        })
    except Exception as exc:
        logger.error(f"Query error: {exc}")
        return jsonify({"error": "Failed to query scans"}), 500
    finally:
        session.close()


# ── GET /stats ───────────────────────────────────────────────
@app.route("/stats", methods=["GET"])
def get_stats():
    """
    Return aggregated dashboard statistics across all scans.
    """
    session = SessionLocal()
    try:
        # Total findings
        total_findings = session.execute(
            select(func.count(Finding.id))
        ).scalar() or 0

        # Severity breakdowns
        critical = session.execute(
            select(func.count(Finding.id)).where(Finding.severity == "CRITICAL")
        ).scalar() or 0

        high = session.execute(
            select(func.count(Finding.id)).where(Finding.severity == "HIGH")
        ).scalar() or 0

        medium = session.execute(
            select(func.count(Finding.id)).where(Finding.severity == "MEDIUM")
        ).scalar() or 0

        low = session.execute(
            select(func.count(Finding.id)).where(Finding.severity == "LOW")
        ).scalar() or 0

        # Unique files affected
        files_affected = session.execute(
            select(func.count(func.distinct(Finding.file_path)))
        ).scalar() or 0

        # Total scans
        total_scans = session.execute(
            select(func.count(Scan.id))
        ).scalar() or 0

        # Last scan timestamp
        last_scan_row = session.execute(
            select(Scan.timestamp).order_by(Scan.timestamp.desc()).limit(1)
        ).first()
        last_scan = last_scan_row[0].isoformat() if last_scan_row else None

        return jsonify({
            "total_findings": total_findings,
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
            "files_affected": files_affected,
            "total_scans": total_scans,
            "last_scan": last_scan,
        })
    except Exception as exc:
        logger.error(f"Stats error: {exc}")
        return jsonify({"error": "Failed to compute stats"}), 500
    finally:
        session.close()


# ── GET /health ──────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    """Simple healthcheck endpoint."""
    return jsonify({
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
    })


# ══════════════════════════════════════════════════════════════
# Entry point
# ══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_ENV", "production") == "development"
    logger.info(f"Starting SAST Pipeline API on port {port} (debug={debug})")
    app.run(host="0.0.0.0", port=port, debug=debug)
