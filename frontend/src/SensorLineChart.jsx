import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler, TimeScale);

export default function SensorLineChart({ label, data }) {
  const [fullscreen, setFullscreen] = useState(false);
  // data: array of { x: label/date, value: number }
  const chartData = {
    labels: data.map((d) => d.x),
    datasets: [
      {
        label: label,
        data: data.map((d) => d.value),
        fill: false,
        borderColor: "#2563eb", // blue-600
        backgroundColor: "#2563eb",
        pointBackgroundColor: "#2563eb",
        pointBorderColor: "#2563eb",
        tension: 0.2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            return `${ctx.dataset.label}: ${ctx.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Date" },
        ticks: { autoSkip: true, maxTicksLimit: 8 },
      },
      y: {
        title: { display: true, text: "Valeur" },
        beginAtZero: false,
      },
    },
  };
  return (
    <div style={{ width: "100%", height: "100%", minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "stretch", alignItems: "stretch", position: "relative" }}>
      <button
        onClick={() => setFullscreen(true)}
        style={{ position: "absolute", top: 8, right: 8, zIndex: 2, background: "rgba(255,255,255,0.8)", border: "none", borderRadius: 4, cursor: "pointer", padding: 4 }}
        title="Agrandir le graphique"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/></svg>
      </button>
      <Line data={chartData} options={options} style={{ flex: 1, height: "100%", width: "100%" }} />
      {fullscreen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 16, boxShadow: "0 4px 32px #0005", width: "90vw", height: "80vh", display: "flex", flexDirection: "column", position: "relative" }}>
            <button onClick={() => setFullscreen(false)} style={{ position: "absolute", top: 12, right: 12, background: "#eee", border: "none", borderRadius: 4, cursor: "pointer", padding: 6, zIndex: 2 }} title="Fermer">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>
            </button>
            <Line data={chartData} options={options} style={{ flex: 1, height: "100%", width: "100%" }} />
          </div>
        </div>
      )}
    </div>
  );
}
