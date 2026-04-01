/**
 * ═══════════════════════════════════════════════════════════════
 * SAST Pipeline — FindingsTable Component
 * Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
 *
 * Sortable, filterable table of security findings with severity
 * badges, column sorting, and client-side severity filtering.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useMemo } from "react";

// ── Severity badge color map ────────────────────────────────
const SEVERITY_COLORS = {
  CRITICAL: { bg: "#f8514926", text: "#f85149", border: "#f8514940" },
  HIGH:     { bg: "#d2992226", text: "#d29922", border: "#d2992240" },
  MEDIUM:   { bg: "#58a6ff26", text: "#58a6ff", border: "#58a6ff40" },
  LOW:      { bg: "#3fb95026", text: "#3fb950", border: "#3fb95040" },
};

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const FILTER_OPTIONS = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

// ── Styles ──────────────────────────────────────────────────
const styles = {
  container: {
    background: "linear-gradient(135deg, #161b22 0%, #1c2333 100%)",
    border: "1px solid #30363d",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#e6edf3",
  },
  filterGroup: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "5px 14px",
    fontSize: "12px",
    fontWeight: 500,
    border: "1px solid #30363d",
    borderRadius: "20px",
    background: "transparent",
    color: "#8b949e",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  filterBtnActive: {
    background: "#58a6ff20",
    color: "#58a6ff",
    borderColor: "#58a6ff50",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#8b949e",
    borderBottom: "1px solid #30363d",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    transition: "color 0.15s ease",
  },
  thHover: {
    color: "#e6edf3",
  },
  td: {
    padding: "10px 14px",
    fontSize: "13px",
    color: "#c9d1d9",
    borderBottom: "1px solid #21262d",
    verticalAlign: "top",
  },
  row: {
    transition: "background 0.15s ease",
  },
  rowHover: {
    background: "#1c2333",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  },
  empty: {
    textAlign: "center",
    padding: "48px 16px",
    color: "#8b949e",
    fontSize: "14px",
    fontStyle: "italic",
  },
  filePath: {
    fontFamily: "'SF Mono', 'Cascadia Code', Consolas, monospace",
    fontSize: "12px",
    color: "#58a6ff",
  },
  ruleId: {
    fontFamily: "'SF Mono', 'Cascadia Code', Consolas, monospace",
    fontSize: "12px",
    color: "#d2a8ff",
  },
  sortArrow: {
    marginLeft: "4px",
    fontSize: "10px",
  },
};

// ── Skeleton loading row ────────────────────────────────────
const shimmerKeyframes = `
@keyframes tableShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

function SkeletonRow() {
  const skeletonCell = {
    background: "linear-gradient(90deg, #21262d 25%, #30363d 50%, #21262d 75%)",
    backgroundSize: "200% 100%",
    animation: "tableShimmer 1.5s ease-in-out infinite",
    borderRadius: "4px",
    height: "14px",
  };

  return (
    <tr>
      <td style={styles.td}><div style={{ ...skeletonCell, width: "160px" }} /></td>
      <td style={styles.td}><div style={{ ...skeletonCell, width: "140px" }} /></td>
      <td style={styles.td}><div style={{ ...skeletonCell, width: "200px" }} /></td>
      <td style={styles.td}><div style={{ ...skeletonCell, width: "60px" }} /></td>
      <td style={styles.td}><div style={{ ...skeletonCell, width: "70px" }} /></td>
    </tr>
  );
}

// ── Severity badge ──────────────────────────────────────────
function SeverityBadge({ severity }) {
  const colorSet = SEVERITY_COLORS[severity] || SEVERITY_COLORS.LOW;
  return (
    <span
      style={{
        ...styles.badge,
        background: colorSet.bg,
        color: colorSet.text,
        border: `1px solid ${colorSet.border}`,
      }}
    >
      {severity}
    </span>
  );
}

// ── Column definitions ──────────────────────────────────────
const COLUMNS = [
  { key: "file", label: "File", sortKey: "file_path" },
  { key: "rule", label: "Rule ID", sortKey: "rule_id" },
  { key: "message", label: "Message", sortKey: "message" },
  { key: "cwe", label: "CWE", sortKey: "cwe" },
  { key: "severity", label: "Severity", sortKey: "severity" },
];

export default function FindingsTable({ findings, loading }) {
  const [filter, setFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredHeader, setHoveredHeader] = useState(null);

  // ── Client-side severity filter ─────────────────────────
  const filteredFindings = useMemo(() => {
    if (!findings) return [];
    if (filter === "ALL") return findings;
    return findings.filter((f) => f.severity === filter);
  }, [findings, filter]);

  // ── Client-side sorting ─────────────────────────────────
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

  // ── Handle column header click ──────────────────────────
  function handleSort(sortKey) {
    setSortConfig((prev) => ({
      key: sortKey,
      direction: prev.key === sortKey && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  // ── Truncate long strings ───────────────────────────────
  function truncate(str, maxLen = 80) {
    if (!str) return "";
    return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
  }

  return (
    <div style={styles.container}>
      <style>{shimmerKeyframes}</style>

      {/* Header with title and filter pills */}
      <div style={styles.header}>
        <span style={styles.title}>
          Security Findings
          {!loading && findings && (
            <span style={{ color: "#8b949e", fontWeight: 400, fontSize: "13px", marginLeft: "8px" }}>
              ({sortedFindings.length}{filter !== "ALL" ? ` ${filter.toLowerCase()}` : ""})
            </span>
          )}
        </span>
        <div style={styles.filterGroup}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              style={{
                ...styles.filterBtn,
                ...(filter === opt ? styles.filterBtnActive : {}),
              }}
            >
              {opt === "ALL" ? "All" : opt.charAt(0) + opt.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...styles.th,
                    ...(hoveredHeader === col.key ? styles.thHover : {}),
                  }}
                  onClick={() => handleSort(col.sortKey)}
                  onMouseEnter={() => setHoveredHeader(col.key)}
                  onMouseLeave={() => setHoveredHeader(null)}
                >
                  {col.label}
                  {sortConfig.key === col.sortKey && (
                    <span style={styles.sortArrow}>
                      {sortConfig.direction === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : sortedFindings.length === 0 ? (
              <tr>
                <td colSpan={5} style={styles.empty}>
                  🔒 No findings {filter !== "ALL" ? `with ${filter.toLowerCase()} severity` : "to display"}
                </td>
              </tr>
            ) : (
              sortedFindings.map((finding, idx) => (
                <tr
                  key={finding.id || idx}
                  style={{
                    ...styles.row,
                    ...(hoveredRow === idx ? styles.rowHover : {}),
                  }}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={styles.td}>
                    <span style={styles.filePath}>
                      {finding.file_path}:{finding.line_number}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.ruleId}>{finding.rule_id}</span>
                  </td>
                  <td style={{ ...styles.td, maxWidth: "320px" }}>
                    {truncate(finding.message, 80)}
                  </td>
                  <td style={styles.td}>
                    {finding.cwe || "—"}
                  </td>
                  <td style={styles.td}>
                    <SeverityBadge severity={finding.severity} />
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
