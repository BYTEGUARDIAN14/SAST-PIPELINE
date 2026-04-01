/**
 * ═══════════════════════════════════════════════════════════════
 * SAST Pipeline — StatCards Component
 * Author: Mohamed Adhnaan J M | BYTEAEGIS (byteaegis.in)
 *
 * Displays 4 summary stat cards: Total, Critical, High, Files.
 * Shows skeleton placeholders while loading.
 * ═══════════════════════════════════════════════════════════════
 */

import React from "react";

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    background: "linear-gradient(135deg, #161b22 0%, #1c2333 100%)",
    border: "1px solid #30363d",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
    cursor: "default",
    position: "relative",
    overflow: "hidden",
  },
  cardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
  },
  label: {
    fontSize: "13px",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#8b949e",
  },
  value: {
    fontSize: "36px",
    fontWeight: 700,
    lineHeight: 1,
    fontFamily: "'SF Mono', 'Cascadia Code', monospace",
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    borderRadius: "12px 12px 0 0",
  },
  skeleton: {
    background: "linear-gradient(90deg, #21262d 25%, #30363d 50%, #21262d 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s ease-in-out infinite",
    borderRadius: "6px",
    height: "36px",
    width: "80px",
  },
  skeletonLabel: {
    background: "linear-gradient(90deg, #21262d 25%, #30363d 50%, #21262d 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s ease-in-out infinite",
    borderRadius: "4px",
    height: "14px",
    width: "100px",
  },
};

// Inject keyframes for shimmer animation
const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

const CARDS = [
  {
    key: "total",
    label: "Total Findings",
    propName: "total",
    color: "#58a6ff",
    activeColor: "#58a6ff",
    alwaysActive: true,
  },
  {
    key: "critical",
    label: "Critical",
    propName: "critical",
    color: "#30363d",
    activeColor: "#f85149",
    alwaysActive: false,
  },
  {
    key: "high",
    label: "High",
    propName: "high",
    color: "#30363d",
    activeColor: "#d29922",
    alwaysActive: false,
  },
  {
    key: "files",
    label: "Files Affected",
    propName: "filesAffected",
    color: "#58a6ff",
    activeColor: "#58a6ff",
    alwaysActive: true,
  },
];

function StatCard({ label, value, color, activeColor, isActive, loading }) {
  const [hovered, setHovered] = React.useState(false);

  const indicatorColor = isActive ? activeColor : color;
  const valueColor = isActive ? activeColor : "#e6edf3";

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={{ ...styles.indicator, background: "#30363d" }} />
        <div style={styles.skeletonLabel} />
        <div style={styles.skeleton} />
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHover : {}),
        borderColor: hovered ? indicatorColor : "#30363d",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...styles.indicator, background: indicatorColor }} />
      <span style={styles.label}>{label}</span>
      <span style={{ ...styles.value, color: valueColor }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

export default function StatCards({ total, critical, high, filesAffected, loading }) {
  const values = { total, critical, high, filesAffected };

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div style={styles.container}>
        {CARDS.map((card) => {
          const val = values[card.propName] || 0;
          const isActive = card.alwaysActive || val > 0;
          return (
            <StatCard
              key={card.key}
              label={card.label}
              value={val}
              color={card.color}
              activeColor={card.activeColor}
              isActive={isActive}
              loading={loading}
            />
          );
        })}
      </div>
    </>
  );
}
