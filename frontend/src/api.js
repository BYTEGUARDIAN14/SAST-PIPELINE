/**
 * ═══════════════════════════════════════════════════════════════
 * SAST Pipeline — API Client
 * Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
 * Repo  : BYTEGUARDIAN14/sast-pipeline
 *
 * Axios-based HTTP client for the Flask backend API.
 * Base URL is configurable via VITE_API_URL env variable.
 * ═══════════════════════════════════════════════════════════════
 */

import axios from "axios";

// Base URL: use environment variable or fallback to localhost
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Fetch aggregated dashboard statistics.
 * GET /stats
 */
export async function fetchStats() {
  try {
    const response = await api.get("/stats");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    throw error;
  }
}

/**
 * Fetch findings with optional query parameters.
 * GET /findings?severity=...&scan_id=...&limit=...&offset=...
 */
export async function fetchFindings(params = {}) {
  try {
    const response = await api.get("/findings", { params });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch findings:", error);
    throw error;
  }
}

/**
 * Fetch scan history with optional query parameters.
 * GET /scans?branch=...&limit=...
 */
export async function fetchScans(params = {}) {
  try {
    const response = await api.get("/scans", { params });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch scans:", error);
    throw error;
  }
}
