import type { ChartOptions } from "chart.js";

export const GRADE_ORDER = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];

export const GRADE_COLORS: Record<string, string> = {
  "A+": "#0f766e",
  A: "#14b8a6",
  "B+": "#0284c7",
  B: "#2563eb",
  "C+": "#7c3aed",
  C: "#f59e0b",
  D: "#f97316",
  F: "#ef4444",
};

export const SHARED_BAR_COLORS = [
  "rgba(14, 165, 233, 0.82)",
  "rgba(6, 182, 212, 0.82)",
  "rgba(16, 185, 129, 0.82)",
  "rgba(245, 158, 11, 0.82)",
  "rgba(99, 102, 241, 0.82)",
  "rgba(124, 58, 237, 0.82)",
];

export const sharedBarOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        usePointStyle: true,
        color: "#475569",
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#64748b" },
    },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(148, 163, 184, 0.18)" },
      ticks: { color: "#64748b", precision: 0 },
    },
  },
};

export const sharedPieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        usePointStyle: true,
        color: "#475569",
      },
    },
  },
};
