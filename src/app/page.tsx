"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { motion } from "framer-motion";
import ReportForm from "@/components/ReportForm";
import { FALLBACK_REPORTS, LIVE_CAMS, relativeTime } from "@/lib/data";
import { getSupabase, isSupabaseConfigured, type HailReport } from "@/lib/supabase";
import type { CityWeather } from "@/lib/weather";

const token = process.env.NEXT_PUBLIC_MAPBOX ?? "";
if (token && !token.includes("REPLACE")) mapboxgl.accessToken = token;

type Cam = (typeof LIVE_CAMS)[number];
type Mode = "grandine" | "parcheggi" | "sos";
type UiReport = { id: string; lat: number; lng: number; size: string; intensity?: string; user: string; time: string; created_at?: string };
function toUi(r: HailReport): UiReport {
  return { id: r.id, lat: r.lat, lng: r.lng, size: r.size, intensity: r.intensity, user: r.user_name, time: relativeTime(r.created_at), created_at: r.created_at };
}

export default function ScudoItalia() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [selectedCam, setSelectedCam] = useState<Cam | null>(null);
  const [mode, setMode] = useState<Mode>("grandine");
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState<UiReport[]>(FALLBACK_REPORTS.map((r) => ({ id: r.id, lat: r.lat, lng: r.lng, size: r.size, intensity: r.intensity, user: r.user, time: r.time })));
  const [pushOn, setPushOn] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [weather, setWeather] = useState<CityWeather[]>([]);
  const [wxAlerts, setWxAlerts] = useState<CityWeather[]>([]);

  const addReportMarker = useCallback((map: mapboxgl.Map, r: UiReport) => {
    const el = document.createElement("div");
    el.className = "hail-pin";
    el.innerHTML = '<div class="ping-dot"></div><div style="position:relative;width:24px;height:24px;background:#ef4444;border-radius:9999px;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:10px;">*</div>';
    markers.current.push(new mapboxgl.Marker(el).setLngLat([r.lng, r.lat]).addTo(map));
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;
    if (!token || token.includes("REPLACE")) { setTokenMissing(true); return; }
    const map = new mapboxgl.Map({ container: mapRef.current, style: "mapbox://styles/mapbox/dark-v11", center: [12.5, 42.5], zoom: 5.2, pitch: 60, bearing: -10, antialias: true });
    mapObj.current = map;
    map.on("load", () => {
      map.addSource("mapbox-dem", { type: "raster-dem", url: "mapbox://mapbox.mapbox-terrain-dem-v1" });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      LIVE_CAMS.forEach((c) => {
        const el = document.createElement("div");
        el.innerHTML = '<div style="width:32px;height:32px;background:white;border-radius:9999px;display:flex;align-items:center;justify-content:center;cursor:pointer;">C</div>';
        el.onclick = () => setSelectedCam(c);
        new mapboxgl.Marker(el).setLngLat([c.lng, c.lat]).addTo(map);
      });
      setMapReady(true);
    });
    return () => { map.remove(); mapObj.current = null; };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapObj.current) return;
    markers.current.forEach((m) => m.remove());
    markers.current = [];
    reports.forEach((r) => addReportMarker(mapObj.current!, r));
  }, [reports, mapReady, addReportMarker]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.from("hail_reports").select("*").order("created_at", { ascending: false }).limit(200).then(({ data }) => {
      if (data?.length) setReports((data as HailReport[]).map(toUi));
    });
    const channel = sb.channel("hail-live").on("postgres_changes", { event: "INSERT", schema: "public", table: "hail_reports" }, (payload) => {
      const row = payload.new as HailReport;
      setReports((prev) => (prev.some((p) => p.id === row.id) ? prev : [toUi(row), ...prev]));
    }).subscribe();
    return () => { sb.removeChannel(channel); };
  }, []);

  useEffect(() => {
    fetch("/api/weather").then((r) => r.json()).then((d) => {
      if (d.cities) setWeather(d.cities);
      if (d.alerts) setWxAlerts(d.alerts);
    }).catch(() => {});
  }, []);

  async function enablePush() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if ((await Notification.requestPermission()) !== "granted") return;
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BLCQKE17jCEmR1gjJ-bFpxffTvuqyT_l9BEtVf-wXvsjB3f_PB8Oo3tZismezHev2K_ZP917qOiMzkoLZgRKZB4";
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const key = Uint8Array.from(atob(vapid.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    }
    const json = sub.toJSON();
    await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }) });
    await fetch("/api/push/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "SCUDO ITALIA", body: "Push attive. Allerte grandine e meteo on." }) }).catch(() => {});
    setPushOn(true);
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      <div ref={mapRef} className="h-full w-full" />
      {weather.length > 0 && (
        <div className="absolute top-28 right-4 z-20 hidden max-h-[48vh] w-56 overflow-auto rounded-2xl border border-white/15 bg-black/55 p-3 text-white backdrop-blur-xl md:block">
          <p className="mb-2 text-xs font-bold uppercase text-white/70">Meteo Italia</p>
          {wxAlerts.length > 0 && <p className="mb-2 rounded-lg bg-red-500/80 px-2 py-1 text-[11px] font-bold">Allerta: {wxAlerts.map((a) => a.name).join(", ")}</p>}
          {weather.map((c) => (
            <div key={c.name} className="flex justify-between border-b border-white/10 py-1.5 text-xs last:border-0">
              <span>{c.name}</span>
              <span>{c.temp != null ? Math.round(c.temp) : "-"}&deg; · {c.hailRisk}</span>
            </div>
          ))}
        </div>
      )}
      {tokenMissing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black p-6">
          <div className="max-w-lg rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-2xl font-black">SCUDO ITALIA</p>
            <p className="mt-2 text-sm text-white/70">Aggiungi NEXT_PUBLIC_MAPBOX su Vercel per la mappa 3D. Meteo e push funzionano comunque.</p>
          </div>
        </div>
      )}
      <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="pointer-events-none absolute top-4 right-4 left-4 z-20 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-[20px] border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-black text-black">S</div>
          <div>
            <p className="font-bold leading-none text-white">SCUDO ITALIA</p>
            <p className="text-xs text-white/60">{reports.length} segnalazioni{isSupabaseConfigured ? " · live" : " · demo"}</p>
          </div>
          {(["grandine", "parcheggi", "sos"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-full px-3 py-2 text-sm capitalize ${mode === m ? "bg-white text-black" : "bg-white/10 text-white"}`}>{m}</button>
          ))}
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button onClick={enablePush} className="rounded-full bg-white/10 px-4 py-3 text-sm font-bold text-white">{pushOn ? "Allerte on" : "Attiva push"}</button>
          <button onClick={() => setShowForm(true)} className="rounded-full bg-red-500 px-5 py-3 font-bold text-white">SEGNALA GRANDINE</button>
        </div>
      </motion.div>
      <div className="absolute bottom-4 left-4 z-20 w-[min(360px,calc(100%-2rem))] rounded-[24px] bg-white/95 p-4 text-black shadow-2xl">
        <h3 className="mb-3 font-bold">{mode === "grandine" ? "Live ora sulla rete" : mode}</h3>
        {mode === "grandine" && reports.slice(0, 5).map((r) => (
          <div key={r.id} className="flex items-center justify-between border-b py-2 last:border-0">
            <div><p className="text-sm font-bold capitalize">{r.size}</p><p className="text-xs text-gray-500">{r.user} · {r.time}</p></div>
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-600">LIVE</span>
          </div>
        ))}
      </div>
      {selectedCam && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedCam(null)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-[24px] bg-white text-black" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between p-4"><p className="font-bold">{selectedCam.name}</p><button onClick={() => setSelectedCam(null)}>X</button></div>
            <iframe title={selectedCam.name} src={selectedCam.url} className="aspect-video w-full border-0" />
          </div>
        </div>
      )}
      {showForm && <ReportForm onClose={() => setShowForm(false)} onSubmitted={(r) => { setReports((p) => [{ id: r.id, lat: r.lat, lng: r.lng, size: r.size, intensity: r.intensity, user: r.user_name, time: "adesso", created_at: r.created_at }, ...p]); setShowForm(false); mapObj.current?.flyTo({ center: [r.lng, r.lat], zoom: 10, duration: 1200 }); }} />}
    </div>
  );
}
