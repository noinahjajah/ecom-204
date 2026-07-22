import React from "react";

// 📊 SalesTrendChart — small dependency-free SVG bar chart (no chart
// library needed for one chart). `points`: [{ key, revenue, orders }],
// already sorted oldest → newest. `formatLabel(key)` turns a bucket
// key ("2026-07-21" for daily, or that week's Monday date for weekly)
// into the short label shown under each bar. Hover a bar for the exact
// revenue/order count (native <title> tooltip — no extra JS needed).

export default function SalesTrendChart({ points, formatLabel, height = 220 }) {
  if (!points || points.length === 0) {
    return <div className="admin-chart-empty">ยังไม่มีข้อมูลยอดขายในช่วงนี้</div>;
  }

  const width = Math.max(points.length * 56, 320);
  const max = Math.max(...points.map((p) => p.revenue), 1);
  const slot = width / points.length;
  const barWidth = Math.min(32, slot - 14);
  const chartBottom = height - 34;
  const usableHeight = chartBottom - 16;

  return (
    <div className="admin-chart-scroll">
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="admin-chart-svg">
        <line x1="0" y1={chartBottom} x2={width} y2={chartBottom} stroke="var(--line-strong)" strokeWidth="1" />
        {points.map((p, i) => {
          const barH = max > 0 ? (p.revenue / max) * usableHeight : 0;
          const x = i * slot + (slot - barWidth) / 2;
          const y = chartBottom - barH;
          return (
            <g key={p.key}>
              <title>
                {formatLabel(p.key)} — ฿{Math.round(p.revenue).toLocaleString("th-TH")} · {p.orders} ออเดอร์
              </title>
              <rect x={x} y={y} width={barWidth} height={barH} rx="5" fill="var(--gold)" opacity="0.85" />
              <text x={x + barWidth / 2} y={chartBottom + 16} textAnchor="middle" className="admin-chart-axis-label">
                {formatLabel(p.key)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
