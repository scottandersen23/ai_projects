"use client";

import { geoAlbersUsa, geoPath } from "d3-geo";
import { useEffect, useMemo, useState } from "react";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Topology } from "topojson-specification";

type JobPoint = {
  id: string;
  city: string;
  jobs: number;
  coordinates: [number, number];
};

const US_TOPO_JSON = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const jobPointsSeed: JobPoint[] = [
  { id: "la", city: "Los Angeles", jobs: 18, coordinates: [-118.24, 34.05] },
  { id: "phx", city: "Phoenix", jobs: 12, coordinates: [-112.07, 33.45] },
  { id: "den", city: "Denver", jobs: 10, coordinates: [-104.99, 39.74] },
  { id: "dfw", city: "Dallas", jobs: 20, coordinates: [-96.8, 32.78] },
  { id: "chi", city: "Chicago", jobs: 16, coordinates: [-87.62, 41.88] },
  { id: "atl", city: "Atlanta", jobs: 11, coordinates: [-84.39, 33.75] },
  { id: "nyc", city: "New York", jobs: 19, coordinates: [-74.0, 40.71] },
  { id: "mia", city: "Miami", jobs: 9, coordinates: [-80.19, 25.76] },
];

function markerRadius(jobCount: number): number {
  if (jobCount >= 18) return 7;
  if (jobCount >= 13) return 6;
  if (jobCount >= 10) return 5;
  return 4;
}

export function RegionMap() {
  const [stateFeatures, setStateFeatures] = useState<Array<Feature<Geometry>>>(
    [],
  );
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const points = useMemo(() => jobPointsSeed, []);
  const hoveredPoint = points.find((point) => point.id === hoveredPointId);
  const width = 820;
  const height = 300;

  useEffect(() => {
    let isMounted = true;

    async function loadUsTopo() {
      try {
        const response = await fetch(US_TOPO_JSON);
        if (!response.ok) {
          throw new Error("Unable to load map topology");
        }
        const topology = (await response.json()) as Topology;
        const statesObject = topology.objects.states;
        if (!statesObject) {
          throw new Error("States topology missing");
        }
        const geo = feature(
          topology,
          statesObject,
        ) as FeatureCollection<Geometry>;
        if (isMounted) {
          setStateFeatures(geo.features ?? []);
          setMapError(null);
        }
      } catch {
        if (isMounted) setMapError("Map data unavailable");
      }
    }

    loadUsTopo();
    return () => {
      isMounted = false;
    };
  }, []);

  const projection = useMemo(
    () =>
      geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(980),
    [height, width],
  );
  const pathBuilder = useMemo(() => geoPath(projection), [projection]);

  return (
    <div className="relative mt-3 rounded-md border border-slate-200 bg-slate-50 p-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[300px] w-full"
        role="img"
        aria-label="Interactive map showing recent jobs by region"
      >
        {stateFeatures.map((shape, index) => {
          const path = pathBuilder(shape);
          if (!path) return null;
          return (
            <path
              key={`state-${index}`}
              d={path}
              fill="#c9cfd9"
              stroke="#ffffff"
              strokeWidth={0.6}
            />
          );
        })}

        {points.map((point) => {
          const projected = projection(point.coordinates);
          if (!projected) return null;
          return (
            <circle
              key={point.id}
              cx={projected[0]}
              cy={projected[1]}
              r={markerRadius(point.jobs)}
              fill="#f6b73c"
              fillOpacity={0.65}
              stroke="#f59e0b"
              strokeWidth={1}
              onMouseEnter={() => setHoveredPointId(point.id)}
              onMouseLeave={() => setHoveredPointId(null)}
            />
          );
        })}
      </svg>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{mapError ?? "Hover hotspots for regional job volume"}</span>
        {hoveredPoint ? (
          <span className="font-medium text-slate-700">
            {hoveredPoint.city}: {hoveredPoint.jobs} jobs
          </span>
        ) : (
          <span>8 active cities</span>
        )}
      </div>
    </div>
  );
}
