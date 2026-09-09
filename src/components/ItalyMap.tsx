"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { COVERED_PARKS, LIVE_CAMS } from "@/lib/data";
import type { CityWeather } from "@/lib/weather";
import { premiumWxIcon, weatherKind } from "@/lib/weather";

export const ITALY_BOUNDS: [[number, number], [number, number]] = [[6.2, 35.4], [18.8, 47.2]];
export const ITALY_CENTER: [number, number] = [12.5, 41.9];
export type MapPin = { id: string; lat: number; lng: number };

const SAT_STYLE = {
  version: 8 as const,
  sources: {
    sat: {
      type: "raster" as const,
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "Esri World Imagery",
    },
    labels: {
      type: "raster" as const,
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      maxzoom: 16,
    },
  },
  layers: [
    { id: "sat", type: "raster" as const, source: "sat" },
    { id: "labels", type: "raster" as const, source: "labels", paint: { "raster-opacity": 0.55 } },
  ],
};

function destPoint(lng: number, lat: number, km: number, bearing: number): [number, number] {
  const R = 6371;
  const br = (bearing * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(km / R) + Math.cos(lat1) * Math.sin(km / R) * Math.cos(br));
  const lng2 = lng1 + Math.atan2(Math.sin(br) * Math.sin(km / R) * Math.cos(lat1), Math.cos(km / R) - Math.sin(lat1) * Math.sin(lat2));
  return [(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
}

type Props = {
  reports: MapPin[];
  weather?: CityWeather[];
  mode?: "grandine" | "parcheggi" | "sos";
  userPos?: { lat: number; lng: number } | null;
  onCamClick?: (id: number) => void;
  flyTo?: { lng: number; lat: number } | null;
};

export default function ItalyMap({ reports, weather = [], mode = "grandine", userPos, onCamClick, flyTo }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const hailMarkers = useRef<Marker[]>([]);
  const wxMarkers = useRef<Marker[]>([]);
  const parkMarkers = useRef<Marker[]>([]);
  const userMarker = useRef<Marker | null>(null);
  const onCamRef = useRef(onCamClick);
  onCamRef.current = onCamClick;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: elRef.current,
      style: SAT_STYLE,
      center: ITALY_CENTER,
      zoom: 5.35,
      pitch: 64,
      bearing: -14,
      maxBounds: ITALY_BOUNDS,
      minZoom: 4.6,
      maxZoom: 18,
      attributionControl: false,
    });
    mapRef.current = map;
    map.touchZoomRotate.enable();
    map.touchZoomRotate.enableRotation();
    map.on("load", () => {
      try {
        map.addSource("italy-dem", {
          type: "raster-dem",
          tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
          tileSize: 256,
          encoding: "terrarium",
          maxzoom: 15,
        });
        map.setTerrain({ source: "italy-dem", exaggeration: 1.85 });
        map.addLayer({ id: "italy-hillshade", type: "hillshade", source: "italy-dem", paint: { "hillshade-exaggeration": 0.55 } });
      } catch (e) { console.warn(e); }
      map.addSource("winds", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({ id: "winds-glow", type: "line", source: "winds", paint: { "line-color": "#ffffff", "line-width": 5, "line-opacity": 0.22, "line-blur": 4 } });
      map.addLayer({ id: "winds", type: "line", source: "winds", paint: { "line-color": "#ffffff", "line-width": 1.7, "line-opacity": 0.92, "line-dasharray": [0.4, 1.6] } });
      LIVE_CAMS.forEach((c) => {
        const el = document.createElement("div");
        el.innerHTML = '<div style="width:28px;height:28px;background:#fff;border-radius:9999px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">cam</div>';
        el.onclick = () => onCamRef.current?.(c.id);
        new maplibregl.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map);
      });
      map.fitBounds(ITALY_BOUNDS, { padding: 40, pitch: 60, bearing: -12, duration: 0 });
      setReady(true);
    });
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getSource("winds")) return;
    const features = weather.map((c) => {
      const dir = ((c.windDir ?? 0) + 180) % 360;
      const km = Math.min(90, 18 + (c.wind ?? 10) * 0.7);
      const end = destPoint(c.lng, c.lat, km / 111, dir);
      return { type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates: [[c.lng, c.lat], end] } };
    });
    (map.getSource("winds") as maplibregl.GeoJSONSource).setData({ type: "FeatureCollection", features });
  }, [weather, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    hailMarkers.current.forEach((m) => m.remove());
    hailMarkers.current = [];
    if (mode !== "grandine") return;
    reports.forEach((r) => {
      const el = document.createElement("div");
      el.className = "hail-pin";
      el.innerHTML = '<div class="ping-dot"></div><div style="position:relative;width:22px;height:22px;background:#ef4444;border-radius:9999px;border:2px solid #fff;"></div>';
      hailMarkers.current.push(new maplibregl.Marker({ element: el }).setLngLat([r.lng, r.lat]).addTo(map));
    });
  }, [reports, ready, mode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    wxMarkers.current.forEach((m) => m.remove());
    wxMarkers.current = [];
    weather.forEach((c) => {
      const el = document.createElement("div");
      const kind = weatherKind(c.code, c.wind);
      el.innerHTML = `<div class="wx-badge ${kind}" title="${c.name}">${premiumWxIcon(kind)}</div>`;
      wxMarkers.current.push(new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([c.lng, c.lat]).addTo(map));
    });
  }, [weather, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    parkMarkers.current.forEach((m) => m.remove());
    parkMarkers.current = [];
    if (mode !== "parcheggi") return;
    COVERED_PARKS.forEach((p) => {
      const el = document.createElement("div");
      el.innerHTML = '<div style="background:#111;color:#fff;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:800;border:1px solid #fff">P</div>';
      parkMarkers.current.push(new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map));
    });
  }, [mode, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPos) return;
    if (!userMarker.current) {
      const el = document.createElement("div");
      el.innerHTML = '<div style="width:16px;height:16px;background:#38bdf8;border:3px solid #fff;border-radius:999px;box-shadow:0 0 16px #38bdf8"></div>';
      userMarker.current = new maplibregl.Marker({ element: el }).setLngLat([userPos.lng, userPos.lat]).addTo(map);
    } else userMarker.current.setLngLat([userPos.lng, userPos.lat]);
  }, [userPos, ready]);

  useEffect(() => {
    if (!flyTo || !mapRef.current) return;
    mapRef.current.flyTo({ center: [flyTo.lng, flyTo.lat], zoom: 11.2, pitch: 62, duration: 1600 });
  }, [flyTo]);

  return <div ref={elRef} className="h-full w-full" />;
}
