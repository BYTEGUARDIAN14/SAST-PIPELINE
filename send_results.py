"""
═══════════════════════════════════════════════════════════════
SAST Pipeline — Send Results to Flask API
Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
Repo  : BYTEGUARDIAN14/sast-pipeline
Reg   : 6176AC23UCS097

This script reads findings.json produced by Semgrep and POSTs
the results to the Flask backend API for storage and alerting.
It is designed to run inside the GitHub Actions CI environment.
═══════════════════════════════════════════════════════════════
"""

import json
import os
import sys

import requests


def main():
    # ── Read environment variables ───────────────────────────
    flask_api_url = (os.getenv("FLASK_API_URL") or "").strip()
    commit_sha = (os.getenv("COMMIT_SHA") or "").strip()
    branch = (os.getenv("BRANCH") or "").strip()

    # FLASK_API_URL is required — exit gracefully if missing
    if not flask_api_url:
        print("WARNING: FLASK_API_URL environment variable is not set.")
        print("Skipping result upload. Set the FLASK_API_URL secret in GitHub to enable.")
        sys.exit(0)  # exit 0 so CI doesn't fail just because backend isn't configured

    if not commit_sha:
        print("WARNING: COMMIT_SHA not set — using 'unknown'.")
        commit_sha = "unknown"

    if not branch:
        print("WARNING: BRANCH not set — using 'unknown'.")
        branch = "unknown"

    # ── Read findings.json ───────────────────────────────────
    findings_file = "findings.json"
    results = []

    if os.path.exists(findings_file):
        try:
            with open(findings_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            results = data.get("results", [])
            print(f"Loaded {len(results)} findings from {findings_file}")
        except json.JSONDecodeError as exc:
            print(f"WARNING: Failed to parse {findings_file}: {exc}")
            print("Proceeding with empty results array.")
            results = []
    else:
        print(f"WARNING: {findings_file} not found — sending empty results.")

    # ── Build and send POST request ──────────────────────────
    payload = {
        "commit_sha": commit_sha,
        "branch": branch,
        "results": results,
    }

    api_endpoint = f"{flask_api_url.rstrip('/')}/scan"
    print(f"POSTing {len(results)} findings to {api_endpoint}")

    try:
        response = requests.post(
            api_endpoint,
            json=payload,
            timeout=30,
            headers={"Content-Type": "application/json"},
        )

        print(f"Response status: {response.status_code}")

        try:
            response_json = response.json()
            print(f"Response body: {json.dumps(response_json, indent=2)}")
        except ValueError:
            print(f"Response body (raw): {response.text[:500]}")

        if response.status_code >= 400:
            print(f"ERROR: API returned status {response.status_code}")
            sys.exit(1)

        print("Results sent successfully.")

    except requests.exceptions.ConnectionError as exc:
        print(f"ERROR: Could not connect to {api_endpoint}: {exc}")
        print("Is your Flask backend reachable from the internet?")
        print("Use ngrok or a cloud host. See README for setup instructions.")
        sys.exit(1)
    except requests.exceptions.Timeout:
        print(f"ERROR: Request to {api_endpoint} timed out after 30 seconds.")
        sys.exit(1)
    except requests.exceptions.RequestException as exc:
        print(f"ERROR: Request failed: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
