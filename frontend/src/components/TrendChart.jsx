/**
 * ═══════════════════════════════════════════════════════════════
 * SAST Pipeline — TrendChart Component
 * Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
 *
 * Displays a Recharts BarChart showing findings per scan over
 * time. Bar colors reflect severity: red for critical scans,
 * amber for high-only, blue for clean scans.
 * ═══════════════════════════════════════════════════════════════
 */

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const styles = {
  container: {
    background: "linear-gradient(135deg, #161b22 0%, #1c2333 100%)",
    border: "1px solid #30363d",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  },
  title: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#e6edf3",
    marginBottom: "16px",
  },
  empty: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "240px",
    color: "#8b949e",
    fontSize: "14px",
    fontStyle: "italic",
  },
  loadingBar: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: "8px",
    height: "240px",
    paddingBottom: "40px",
  },
};

const shimmerKeyframes = `
@keyframes barPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
`;

/**
 * Format a date string to "MMM DD" format.
 */
function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Get bar color based on scan severity counts.
 */
function getBarColor(scan) {
  if (scan.critical_count > 0) return "#f85149";
  if (scan.high_count > 0) return "#d29922";
  return "#58a6ff";
}

/**
 * Custom tooltip for the bar chart.
 */
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div
      style={{
        background: "#1c2333",
        border: "1px solid #30363d",
        borderRadius: "8px",
        padding: "12px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ fontSize: "12px", color: "#8b949e", marginBottom: "4px" }}>
        {data.fullDate}
      </div>
      <div style={{ fontSize: "12px", color: "#8b949e", marginBottom: "8px" }}>
        Commit: <span style={{ color: "#58a6ff", fontFamily: "monospace" }}>{data.shortSha}</span>
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#e6edf3", marginBottom: "4px" }}>
        Total: {data.total_findings}
      </div>
      <div style={{ fontSize: "12px", color: "#f85149" }}>
        Critical: {data.critical_count}
      </div>
      <div style={{ fontSize: "12px", color: "#d29922" }}>
        High: {data.high_count}
      </div>
    </div>
  );
}

export default function TrendChart({ scans, loading }) {
  if (loading) {
    return (
      <div style={styles.container}>
        <style>{shimmerKeyframes}</style>
        <div style={styles.title}>Findings Trend</div>
        <div style={styles.loadingBar}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "32px",
                height: `${40 + Math.random() * 120}px`,
                background: "#30363d",
                borderRadius: "4px 4px 0 0",
                animation: `barPulse 1.5s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.title}>Findings Trend</div>
        <div style={styles.empty}>
          <span>📊 No scan data yet — push code to trigger your first scan</span>
        </div>
      </div>
    );
  }

  // Prepare chart data — reverse so oldest is on the left
  const chartData = [...scans].reverse().map((scan) => ({
    ...scan,
    label: `${formatDate(scan.timestamp)} · ${scan.commit_sha?.slice(0, 7) || ""}`,
    shortSha: scan.commit_sha?.slice(0, 7) || "",
    fullDate: scan.timestamp ? new Date(scan.timestamp).toLocaleString() : "",
  }));

  return (
    <div style={styles.container}>
      <div style={styles.title}>Findings Trend</div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#8b949e", fontSize: 11 }}
            axisLine={{ stroke: "#30363d" }}
            tickLine={{ stroke: "#30363d" }}
            interval="preserveStartEnd"
          />
          <YAxis
            label={{
              value: "Findings",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#8b949e", fontSize: 12 },
            }}
            tick={{ fill: "#8b949e", fontSize: 11 }}
            axisLine={{ stroke: "#30363d" }}
            tickLine={{ stroke: "#30363d" }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(88,166,255,0.08)" }} />
          <Bar dataKey="total_findings" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
