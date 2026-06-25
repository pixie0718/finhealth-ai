import React from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

const getColor = (score) => {
  if (score >= 75) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 45) return "#f97316";
  return "#ef4444";
};

const getLabel = (score) => {
  if (score >= 75) return "EXCELLENT";
  if (score >= 60) return "GOOD";
  if (score >= 45) return "FAIR";
  return "POOR";
};

export default function ScoreGauge({ score }) {
  const color = getColor(score);
  const data = [{ value: score, fill: color }];

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <RadialBarChart
        width={220}
        height={220}
        cx={110}
        cy={110}
        innerRadius={75}
        outerRadius={105}
        barSize={18}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background={{ fill: "#1e293b" }} dataKey="value" cornerRadius={10} angleAxisId={0} />
      </RadialBarChart>
      <div style={{
        position: "absolute",
        textAlign: "center",
        pointerEvents: "none",
      }}>
        <div style={{ fontSize: 42, fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, letterSpacing: 2, fontWeight: 600 }}>OUT OF 100</div>
        <div style={{
          marginTop: 6,
          fontSize: 11,
          fontWeight: 700,
          color,
          letterSpacing: 1.5,
          border: `1px solid ${color}33`,
          padding: "2px 8px",
          borderRadius: 20,
          display: "inline-block",
        }}>
          {getLabel(score)}
        </div>
      </div>
    </div>
  );
}
