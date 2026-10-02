"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { POSADAS_CENTER } from "@/lib/zones";
import type { JobMapItem } from "./JobMap";

function pin(label: string, highlight: boolean) {
  return L.divIcon({
    className: "",
    html: `<span class="pj-pin${highlight ? " pj-pin--hot" : ""}"><span>${label}</span></span>`,
    iconSize: [38, 46],
    iconAnchor: [19, 44],
    popupAnchor: [0, -40],
  });
}

function spread(jobs: JobMapItem[]) {
  const seen = new Map<string, number>();
  return jobs.map((j) => {
    const key = `${j.lat.toFixed(4)},${j.lng.toFixed(4)}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    if (!n) return j;
    const angle = n * 2.4;
    const radius = 0.0016 * Math.sqrt(n);
    return { ...j, lat: j.lat + Math.sin(angle) * radius, lng: j.lng + Math.cos(angle) * radius };
  });
}

/** Tiles gratis sin API key (Esri). OSM.org bloquea muchos deploys con 403. */
const TILES = {
  light: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};

export default function JobMapInner({ jobs, height = 460, dark = false }: { jobs: JobMapItem[]; height?: number; dark?: boolean }) {
  const points = useMemo(() => spread(jobs), [jobs]);
  const bounds = useMemo(
    () => (points.length > 1 ? L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])).pad(0.25) : undefined),
    [points],
  );
  const center: [number, number] = points.length === 1 ? [points[0].lat, points[0].lng] : POSADAS_CENTER;

  return (
    <MapContainer
      key={`${dark ? "dark" : "light"}-${points.map((p) => p.id).join("|")}`}
      center={center}
      zoom={points.length === 1 ? 15 : 12}
      bounds={bounds}
      scrollWheelZoom={false}
      style={{ height, width: "100%" }}
      className="z-0 pj-map"
    >
      <TileLayer
        attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, OpenStreetMap'
        url={dark ? TILES.dark : TILES.light}
        maxZoom={19}
      />
      {points.map((j) => (
        <Marker key={j.id} position={[j.lat, j.lng]} icon={pin(j.company.slice(0, 1).toUpperCase(), (j.match ?? 0) >= 60)}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="text-[11px] font-bold uppercase tracking-wide text-river-600">{j.company}</p>
              <p className="mt-0.5 font-display text-sm font-bold text-forest-950">{j.title}</p>
              <p className="mt-0.5 text-xs text-forest-700">
                {j.zone} · {j.modality}
                {j.match != null ? ` · ${j.match}% match` : ""}
              </p>
              <Link href={`/empleos/${j.id}`} className="mt-2 inline-block text-xs font-bold text-river-700 hover:underline">
                Ver empleo →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
