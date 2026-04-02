/**
 * ═══════════════════════════════════════════════════════════════
 * SAST Pipeline — TrendChart Component
 * Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
 *
 * Displays a Recharts BarChart showing findings per scan over
 * time. Bar colors reflect severity using semantic design tokens.
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
  if (scan.critical_count > 0) return "var(--red-text)";
  if (scan.high_count > 0) return "var(--amber-text)";
  return "var(--blue-text)";
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
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "8px",
        padding: "12px",
        fontFamily: "'Inter', sans-serif",
        fontSize: "13px",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ color: "var(--text-tertiary)", marginBottom: "4px" }}>
        {data.fullDate}
      </div>
      <div style={{ color: "var(--text-secondary)", marginBottom: "8px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
        Commit: <span style={{ color: "var(--accent)" }}>{data.shortSha}</span>
      </div>
      <div style={{ fontWeight: 600, marginBottom: "4px" }}>
        Total: {data.total_findings}
      </div>
      <div style={{ color: "var(--red-text)" }}>
        Critical: {data.critical_count}
      </div>
      <div style={{ color: "var(--amber-text)" }}>
        High: {data.high_count}
      </div>
    </div>
  );
}

export default function TrendChart({ scans, loading }) {
  if (loading) {
    return (
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "10px",
          padding: "24px",
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            color: "var(--text-primary)",
            letterSpacing: "0.01em",
            marginBottom: "16px",
          }}
        >
          Findings Trend
        </div>
        <div
          style={{
            height: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            color: "var(--text-tertiary)",
          }}
        >
          Loading chart data...
        </div>
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "10px",
          padding: "24px",
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            color: "var(--text-primary)",
            letterSpacing: "0.01em",
            marginBottom: "16px",
          }}
        >
          Findings Trend
        </div>
        <div
          style={{
            height: "240px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            No scan data yet
          </div>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              color: "var(--text-tertiary)",
              fontStyle: "italic",
            }}
          >
            Push code to trigger your first scan
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data — reverse so oldest is on the left
  const chartData = [...scans].reverse().map((scan) => ({
    ...scan,
    label: `${formatDate(scan.timestamp)}`,
    shortSha: scan.commit_sha?.slice(0, 7) || "",
    fullDate: scan.timestamp ? new Date(scan.timestamp).toLocaleString() : "",
  }));

  const scanCount = chartData.length;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            color: "var(--text-primary)",
            letterSpacing: "0.01em",
          }}
        >
          Findings Trend
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            color: "var(--text-tertiary)",
          }}
        >
          Last {scanCount} scan{scanCount !== 1 ? "s" : ""}
        </div>
      </div>
      <div style={{ height: "240px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: -24, bottom: -4 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--text-tertiary)", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: "var(--border-default)" }}
              tickLine={{ stroke: "var(--border-default)" }}
              interval="preserveStartEnd"
              tickMargin={12}
            />
            <YAxis
              tick={{ fill: "var(--text-tertiary)", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: "var(--border-default)" }}
              tickLine={{ stroke: "var(--border-default)" }}
              allowDecimals={false}
              tickMargin={8}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "var(--bg-hover)" }}
              isAnimationActive={false}
            />
            <Bar dataKey="total_findings" radius={[2, 2, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
