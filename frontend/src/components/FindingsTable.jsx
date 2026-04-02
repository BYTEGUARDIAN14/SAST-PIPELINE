/**
 * ═══════════════════════════════════════════════════════════════
 * SAST Pipeline — FindingsTable Component
 * Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
 *
 * Sortable, filterable table of security findings.
 * Follows the Refined Dark Enterprise aesthetic exactly.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useMemo } from "react";

const SEVERITY_COLORS = {
  CRITICAL: {
    bg: "var(--red-badge-bg)",
    text: "var(--red-badge-text)",
    border: "var(--red-border)",
  },
  HIGH: {
    bg: "var(--amber-badge-bg)",
    text: "var(--amber-badge-text)",
    border: "var(--amber-border)",
  },
  MEDIUM: {
    bg: "var(--blue-badge-bg)",
    text: "var(--blue-badge-text)",
    border: "var(--blue-border)",
  },
  LOW: {
    bg: "var(--green-badge-bg)",
    text: "var(--green-badge-text)",
    border: "var(--green-border)",
  },
};

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const FILTER_OPTIONS = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

const COLUMNS = [
  { key: "severity", label: "SEVERITY", sortKey: "severity" },
  { key: "file", label: "FILE", sortKey: "file_path" },
  { key: "rule", label: "RULE", sortKey: "rule_id" },
  { key: "message", label: "MESSAGE", sortKey: "message" },
  { key: "cwe", label: "CWE", sortKey: "cwe" },
];

function ShieldOutlineIcon({ size = 40, color = "var(--border-focus)" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginBottom: "16px" }}
    >
      <path
        d="M12 2L3 7V12C3 17.25 6.75 22.13 12 23C17.25 22.13 21 17.25 21 12V7L12 2Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function SeverityBadge({ severity }) {
  const colorSet = SEVERITY_COLORS[severity] || SEVERITY_COLORS.LOW;
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <span
        style={{
          background: colorSet.bg,
          color: colorSet.text,
          border: `1px solid ${colorSet.border}`,
          borderRadius: "4px",
          padding: "3px 8px",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: "10px",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {severity}
      </span>
    </div>
  );
}

export default function FindingsTable({ findings, loading }) {
  const [filter, setFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [hoveredRow, setHoveredRow] = useState(null);

  const filteredFindings = useMemo(() => {
    if (!findings) return [];
    if (filter === "ALL") return findings;
    return findings.filter((f) => f.severity === filter);
  }, [findings, filter]);

  const sortedFindings = useMemo(() => {
    if (!sortConfig.key) return filteredFindings;

    return [...filteredFindings].sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.key === "severity") {
        aVal = SEVERITY_ORDER[a.severity] ?? 99;
        bVal = SEVERITY_ORDER[b.severity] ?? 99;
      } else {
        aVal = a[sortConfig.key] ?? "";
        bVal = b[sortConfig.key] ?? "";
      }

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredFindings, sortConfig]);

  function handleSort(sortKey) {
    setSortConfig((prev) => ({
      key: sortKey,
      direction: prev.key === sortKey && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function truncate(str, maxLen) {
    if (!str) return "";
    return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
  }

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Section Header & Filters ───────────────────── */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "var(--text-primary)",
              letterSpacing: "0.01em",
              margin: 0,
            }}
          >
            Security Findings
          </h2>
          {!loading && findings && (
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: "12px",
                borderRadius: "6px",
                padding: "2px 8px",
              }}
            >
              {sortedFindings.length}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = filter === opt;
            return (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                style={{
                  background: isActive ? "var(--accent-muted)" : "var(--bg-elevated)",
                  border: `1px solid ${isActive ? "var(--accent)" : "var(--border-subtle)"}`,
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
                }}
              >
                {opt === "ALL" ? "All" : opt.charAt(0) + opt.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────── */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr
              style={{
                background: "var(--bg-base)",
                borderBottom: "1px solid var(--border-default)",
                borderTop: "1px solid var(--border-default)",
              }}
            >
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.sortKey)}
                  style={{
                    padding: "10px 16px",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: "11px",
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                    textAlign: col.key === "severity" ? "center" : "left",
                  }}
                >
                  {col.label}
                  {sortConfig.key === col.sortKey && (
                    <span style={{ color: "var(--accent)", marginLeft: "4px", fontSize: "10px" }}>
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td colSpan={5} style={{ padding: "12px 16px" }}>
                    <div
                      style={{
                        height: "20px",
                        background: "var(--bg-elevated)",
                        borderRadius: "4px",
                        opacity: 0.5,
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : sortedFindings.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ borderBottom: "none" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "200px",
                    }}
                  >
                    <ShieldOutlineIcon />
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        marginBottom: "4px",
                      }}
                    >
                      No findings detected
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
                      Your codebase is clean
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedFindings.map((finding, idx) => (
                <tr
                  key={finding.id || idx}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    background: hoveredRow === idx ? "var(--bg-hover)" : "var(--bg-surface)",
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background 150ms ease",
                  }}
                >
                  {/* SEVERITY */}
                  <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                    <SeverityBadge severity={finding.severity} />
                  </td>

                  {/* FILE */}
                  <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {finding.file_path}
                      <span style={{ color: "var(--text-tertiary)" }}>
                        :{finding.line_number}
                      </span>
                    </div>
                  </td>

                  {/* RULE */}
                  <td style={{ padding: "12px 16px", verticalAlign: "top", maxWidth: "250px" }}>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "11px",
                        color: "var(--text-tertiary)",
                      }}
                      title={finding.rule_id}
                    >
                      {truncate(finding.rule_id, 40)}
                    </div>
                  </td>

                  {/* MESSAGE */}
                  <td style={{ padding: "12px 16px", verticalAlign: "top", maxWidth: "350px" }}>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        lineHeight: 1.4,
                      }}
                      title={finding.message}
                    >
                      {truncate(finding.message, 70)}
                    </div>
                  </td>

                  {/* CWE */}
                  <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                    <div
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "12px",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {finding.cwe || "—"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
