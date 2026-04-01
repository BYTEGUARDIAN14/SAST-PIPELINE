/**
 * ═══════════════════════════════════════════════════════════════
 * SAST Pipeline — Main Application
 * Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
 * Repo  : BYTEGUARDIAN14/sast-pipeline
 * Reg   : 6176AC23UCS097
 *
 * Root component that composes the SAST Security Dashboard.
 * Polls the Flask API every 30 seconds for live updates.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from "react";
import { fetchStats, fetchFindings, fetchScans } from "./api.js";
import StatCards from "./components/StatCards.jsx";
import TrendChart from "./components/TrendChart.jsx";
import FindingsTable from "./components/FindingsTable.jsx";

// ── Polling interval (30 seconds) ───────────────────────────
const POLL_INTERVAL = 30000;

// ── Styles ──────────────────────────────────────────────────
const styles = {
  app: {
    minHeight: "100vh",
    background: "#0d1117",
    color: "#e6edf3",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, monospace",
  },
  header: {
    background: "linear-gradient(135deg, #161b22 0%, #0d1117 100%)",
    borderBottom: "1px solid #30363d",
    padding: "20px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(12px)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logo: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #58a6ff 0%, #a371f7 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#e6edf3",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: "12px",
    color: "#8b949e",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    animation: "pulse 2s ease-in-out infinite",
  },
  lastUpdated: {
    fontSize: "12px",
    color: "#8b949e",
  },
  main: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "24px 32px",
  },
  errorBanner: {
    background: "#f8514915",
    border: "1px solid #f8514940",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#f85149",
  },
  footer: {
    textAlign: "center",
    padding: "32px 16px",
    fontSize: "13px",
    color: "#484f58",
    borderTop: "1px solid #21262d",
  },
  footerLink: {
    color: "#58a6ff",
    textDecoration: "none",
  },
};

const pulseKeyframes = `
@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(63, 185, 80, 0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(63, 185, 80, 0); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

export default function App() {
  const [stats, setStats] = useState(null);
  const [findings, setFindings] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ── Fetch all data from the API ─────────────────────────
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

  // ── Initial load + polling ──────────────────────────────
  useEffect(() => {
    loadData(true);

    const interval = setInterval(() => {
      loadData(false);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [loadData]);

  // ── Format "last updated" time ──────────────────────────
  function formatLastUpdated() {
    if (!lastUpdated) return "";
    return lastUpdated.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div style={styles.app}>
      <style>{pulseKeyframes}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>⛨</div>
          <div style={styles.titleGroup}>
            <h1 style={styles.title}>SAST Dashboard</h1>
            <span style={styles.subtitle}>
              Static Application Security Testing Pipeline
            </span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div
            style={{
              ...styles.statusDot,
              background: error ? "#f85149" : "#3fb950",
            }}
          />
          <span style={styles.lastUpdated}>
            {lastUpdated
              ? `Last updated: ${formatLastUpdated()}`
              : "Connecting..."}
          </span>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────── */}
      <main style={styles.main}>
        {/* Error banner */}
        {error && (
          <div style={styles.errorBanner}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <StatCards
            total={stats?.total_findings || 0}
            critical={stats?.critical || 0}
            high={stats?.high || 0}
            filesAffected={stats?.files_affected || 0}
            loading={loading}
          />
        </div>

        {/* Trend Chart */}
        <div style={{ animation: "fadeIn 0.4s ease 0.1s both" }}>
          <TrendChart scans={scans} loading={loading} />
        </div>

        {/* Findings Table */}
        <div style={{ animation: "fadeIn 0.4s ease 0.2s both" }}>
          <FindingsTable findings={findings} loading={loading} />
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={styles.footer}>
        <span>
          <strong style={{ color: "#8b949e" }}>BYTEAEGIS</strong>
          {" · "}
          <a
            href="https://byteaegis.in"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerLink}
          >
            byteaegis.in
          </a>
        </span>
      </footer>
    </div>
  );
}
