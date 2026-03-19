"use client";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

export default function LineChart({ data }) {
  const labels = data.map((d) => d.date);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Profile Views",
        data: data.map((d) => Number(d.profile_views)),
        borderColor: "#1E3A5F"
      },
      {
        label: "Connections",
        data: data.map((d) => Number(d.connections)),
        borderColor: "#E8E1D9"
      },
      {
        label: "Impressions",
        data: data.map((d) => Number(d.post_impressions)),
        borderColor: "#888"
      }
    ]
  };

  return <Line data={chartData} />;
}