/**
 * ═══════════════════════════════════════════════════════════════
 * SAST Pipeline — StatCards Component
 * Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
 *
 * Four summary metric cards with top accent lines.
 * ═══════════════════════════════════════════════════════════════
 */

import React from "react";

const CARDS = [
  {
    key: "total",
    label: "TOTAL FINDINGS",
    propName: "total",
    accentColor: "var(--accent)",
    valueColorWhenActive: null,
    subLabel: "across all scans",
  },
  {
    key: "critical",
    label: "CRITICAL",
    propName: "critical",
    accentColor: "var(--red-border)",
    valueColorWhenActive: "var(--red-text)",
    subLabel: "require immediate fix",
  },
  {
    key: "high",
    label: "HIGH",
    propName: "high",
    accentColor: "var(--amber-border)",
    valueColorWhenActive: "var(--amber-text)",
    subLabel: "fix in current sprint",
  },
  {
    key: "files",
    label: "FILES AFFECTED",
    propName: "filesAffected",
    accentColor: "var(--accent)",
    valueColorWhenActive: null,
    subLabel: "unique source files",
  },
];

function StatCard({ label, value, accentColor, valueColor, subLabel, loading }) {
  if (loading) {
    return (
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "10px",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "var(--border-subtle)",
          }}
        />
        <div
          style={{
            height: "13px",
            width: "100px",
            background: "var(--bg-elevated)",
            borderRadius: "4px",
            opacity: 0.5,
            marginBottom: "12px",
          }}
        />
        <div
          style={{
            height: "36px",
            width: "60px",
            background: "var(--bg-elevated)",
            borderRadius: "4px",
            opacity: 0.5,
            marginBottom: "8px",
          }}
        />
        <div
          style={{
            height: "11px",
            width: "80px",
            background: "var(--bg-elevated)",
            borderRadius: "4px",
            opacity: 0.5,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "10px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: accentColor,
        }}
      />

      {/* Label */}
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          fontSize: "11px",
          letterSpacing: "0.08em",
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        {label}
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: "36px",
          lineHeight: 1,
          color: valueColor || "var(--text-primary)",
          marginBottom: "8px",
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>

      {/* Sub-label */}
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "11px",
          color: "var(--text-tertiary)",
        }}
      >
        {subLabel}
      </div>
    </div>
  );
}

export default function StatCards({ total, critical, high, filesAffected, loading }) {
  const values = { total, critical, high, filesAffected };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
      }}
    >
      {CARDS.map((card) => {
        const val = values[card.propName] || 0;
        const valueColor =
          card.valueColorWhenActive && val > 0
            ? card.valueColorWhenActive
            : null;

        return (
          <StatCard
            key={card.key}
            label={card.label}
            value={val}
            accentColor={card.accentColor}
            valueColor={valueColor}
            subLabel={card.subLabel}
            loading={loading}
          />
        );
      })}
    </div>
  );
}
