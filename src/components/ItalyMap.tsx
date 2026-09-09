"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { LIVE_CAMS } from "@/lib/data";
import type { CityWeather } from "@/lib/weather";
import { weatherIcon } from "@/lib/weather";

export const ITALY_BOUNDS: [[number, number], [number, number]] = [[6.2, 35.4], [18.8, 47.2]];
export const ITALY_CENTER: [number, number] = [12.5, 41.9];
export type MapPin = { id: string; lat: number; lng: number };

type Props = {
  reports: MapPin[];
  weather?: CityWeather[];
  onCamClick?: (id: number) => void;
  flyTo?: { lng: number; lat: number } | null;
};

export default function ItalyMap({ reports, weather = [], onCamClick, flyTo }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const hailMarkers = useRef<Marker[]>([]);
  const wxMarkers = useRef<Marker[]>([]);
  const onCamRef = useRef(onCamClick);
  onCamRef.current = onCamClick;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: elRef.current,
      style: "https://tiles.openfreemap.org/styles/dark",
      center: ITALY_CENTER,
      zoom: 5.15,
      pitch: 62,
      bearing: -12,
      maxBounds: ITALY_BOUNDS,
      minZoom: 4.4,
      maxZoom: 16,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    map.on("load", () => {
      try {
        map.addSource("italy-dem", {
          type: "raster-dem",
          tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
          tileSize: 256,
          encoding: "terrarium",
          maxzoom: 15,
        });
        map.setTerrain({ source: "italy-dem", exaggeration: 1.65 });
        map.addLayer({ id: "italy-hillshade", type: "hillshade", source: "italy-dem", paint: { "hillshade-exaggeration": 0.5 } });
      } catch (e) { console.warn(e); }
      LIVE_CAMS.forEach((c) => {
        const el = document.createElement("div");
        el.innerHTML = '<div style="width:28px;height:28px;background:#fff;border-radius:9999px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;">cam</div>';
        el.onclick = () => onCamRef.current?.(c.id);
        new maplibregl.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map);
      });
      map.fitBounds(ITALY_BOUNDS, { padding: 48, pitch: 58, bearing: -10, duration: 0 });
      setReady(true);
    });
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    hailMarkers.current.forEach((m) => m.remove());
    hailMarkers.current = [];
    reports.forEach((r) => {
      const el = document.createElement("div");
      el.className = "hail-pin";
      el.innerHTML = '<div class="ping-dot"></div><div style="position:relative;width:22px;height:22px;background:#ef4444;border-radius:9999px;border:2px solid #fff;"></div>';
      hailMarkers.current.push(new maplibregl.Marker({ element: el }).setLngLat([r.lng, r.lat]).addTo(map));
    });
  }, [reports, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    wxMarkers.current.forEach((m) => m.remove());
    wxMarkers.current = [];
    weather.forEach((c) => {
      const el = document.createElement("div");
      const risk = c.hailRisk === "alto" || c.hailRisk === "estremo";
      el.innerHTML = `<div class="wx-pin ${risk ? "wx-alert" : ""}"><span class="wx-ico">${weatherIcon(c.code)}</span><span class="wx-meta">${c.name}<br/>${c.temp != null ? Math.round(c.temp) + "°" : ""}</span></div>`;
      wxMarkers.current.push(new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat([c.lng, c.lat]).addTo(map));
    });
  }, [weather, ready]);

  useEffect(() => {
    if (!flyTo || !mapRef.current) return;
    mapRef.current.flyTo({ center: [flyTo.lng, flyTo.lat], zoom: 9.5, pitch: 60, duration: 1400 });
  }, [flyTo]);

  return <div ref={elRef} className="h-full w-full" />;
}
