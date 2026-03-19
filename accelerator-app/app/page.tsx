"use client";

import { useState } from "react";
import Papa from "papaparse";
import LineChart from "../components/LineChart";

export default function Home() {
  const [data, setData] = useState([]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setData(results.data);
      }
    });
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">LinkedIn Analytics</h2>

      <input type="file" accept=".csv" onChange={handleFile} className="mb-6" />

      {data.length > 0 && <LineChart data={data} />}
    </main>
  );
}