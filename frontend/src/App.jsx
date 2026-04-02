/**
 * ═══════════════════════════════════════════════════════════════
 * SAST Pipeline — Main Application
 * Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
 *
 * Root component — Refined Dark Enterprise dashboard.
 * Polls the Flask API every 30 seconds for live updates.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from "react";
import { fetchStats, fetchFindings, fetchScans } from "./api.js";
import StatCards from "./components/StatCards.jsx";
import TrendChart from "./components/TrendChart.jsx";
import FindingsTable from "./components/FindingsTable.jsx";
import "./index.css";

const POLL_INTERVAL = 30000;

/* ── Shield SVG Icon ──────────────────────────────────────── */
function ShieldIcon({ size = 20, color = "var(--accent)" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L3 7V12C3 17.25 6.75 22.13 12 23C17.25 22.13 21 17.25 21 12V7L12 2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const [stats, setStats] = useState(null);
  const [findings, setFindings] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);

    try {
      const [statsData, findingsData, scansData] = await Promise.all([
        fetchStats(),
        fetchFindings({ limit: 200 }),
        fetchScans({ limit: 30 }),
      ]);

      setStats(statsData);
      setFindings(findingsData.findings || []);
      setScans(scansData.scans || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(
        err.code === "ERR_NETWORK"
          ? "Cannot connect to the API server. Is the backend running?"
          : "Failed to load dashboard data. Will retry automatically."
      );
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  function formatLastUpdated() {
    if (!lastUpdated) return "";
    return lastUpdated.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <header
        style={{
          height: "56px",
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldIcon size={20} color="var(--accent)" />
          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "var(--text-primary)",
              letterSpacing: "0.01em",
            }}
          >
            SAST Dashboard
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: error ? "var(--red-text)" : "#5DB87A",
              animation: error
                ? "none"
                : "pulse-dot 1s ease-in-out infinite alternate",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "var(--text-tertiary)",
            }}
          >
            {lastUpdated
              ? `Last updated: ${formatLastUpdated()}`
              : "Connecting..."}
          </span>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────── */}
      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "var(--red-bg)",
              border: "1px solid var(--red-border)",
              borderRadius: "10px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "var(--red-text)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--red-text)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Stat Cards */}
        <StatCards
          total={stats?.total_findings || 0}
          critical={stats?.critical || 0}
          high={stats?.high || 0}
          filesAffected={stats?.files_affected || 0}
          loading={loading}
        />

        {/* Trend Chart */}
        <TrendChart scans={scans} loading={loading} />

        {/* Findings Table */}
        <FindingsTable findings={findings} loading={loading} />
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        style={{
          padding: "32px 0",
          textAlign: "center",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            color: "var(--text-tertiary)",
          }}
        >
          BYTEAEGIS · byteaegis.in
        </span>
      </footer>
    </div>
  );
}
