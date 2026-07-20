import React from "react";

export function BarChart({ data, height = 160 }) {
  if (!data?.length) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.5,
        }}
      >
        No data
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.v), 1);

  return (
    <svg
      viewBox={`0 0 ${data.length * 50} ${height + 30}`}
      style={{ width: "100%", height: "auto" }}
    >
      {data.map((d, i) => {
        const bh = (d.v / max) * (height - 35);
        const x = i * 50 + 10;
        return (
          <g key={i}>
            <rect
              x={x}
              y={height - 10 - bh}
              width={28}
              height={bh}
              rx={4}
              fill="#b8975a"
              opacity={0.7 + (d.v / max) * 0.3}
            />
            <text
              x={x + 14}
              y={height - 16 - bh}
              fontSize={9}
              fill="#5c5549"
              textAnchor="middle"
            >
              {d.v.toLocaleString()}
            </text>
            <text
              x={x + 14}
              y={height + 12}
              fontSize={8}
              fill="#5c5549"
              opacity="0.6"
              textAnchor="middle"
            >
              {d.l}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ data, size = 120 }) {
  if (!data?.length) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#eee",
        }}
      />
    );
  }

  const total = data.reduce((s, d) => s + d.v, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = 38;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const colors = ["#b8975a", "#227a3c", "#b13030", "#946200", "#2358a3"];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#f0e8d6"
        strokeWidth={20}
      />
      {data.map((d, i) => {
        const len = (d.v / total) * circ;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={colors[i % colors.length]}
            strokeWidth={20}
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            opacity="0.85"
          />
        );
        offset += len;
        return el;
      })}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontSize={16}
        fontWeight="700"
        fill="#221f1c"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize={8}
        fill="#5c5549"
      >
        รายการ
      </text>
    </svg>
  );
}

