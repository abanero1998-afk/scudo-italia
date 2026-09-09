"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReportForm from "@/components/ReportForm";
import ItalyMap from "@/components/ItalyMap";
import WeatherBackdrop from "@/components/WeatherBackdrop";
import { COVERED_PARKS, FALLBACK_REPORTS, LIVE_CAMS, SOS_ACTIONS, kmBetween, relativeTime } from "@/lib/data";
import { getSupabase, type HailReport } from "@/lib/supabase";
import { italyMood, type CityWeather } from "@/lib/weather";

type Cam = (typeof LIVE_CAMS)[number];
type Mode = "grandine" | "parcheggi" | "sos";
type UiReport = { id: string; lat: number; lng: number; size: string; intensity?: string; user: string; time: string; created_at?: string };
function toUi(r: HailReport): UiReport {
  return { id: r.id, lat: r.lat, lng: r.lng, size: r.size, intensity: r.intensity, user: r.user_name, time: relativeTime(r.created_at), created_at: r.created_at };
}

export default function ScudoItalia() {
  const [selectedCam, setSelectedCam] = useState<Cam | null>(null);
  const [mode, setMode] = useState<Mode>("grandine");
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState<UiReport[]>(FALLBACK_REPORTS.map((r) => ({ id: r.id, lat: r.lat, lng: r.lng, size: r.size, intensity: r.intensity, user: r.user, time: r.time })));
  const [pushOn, setPushOn] = useState(false);
  const [weather, setWeather] = useState<CityWeather[]>([]);
  const [flyTo, setFlyTo] = useState<{ lng: number; lat: number } | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

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
    setPushOn(true);
  }

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
    const load = () => fetch("/api/weather").then((r) => r.json()).then((d) => {
      if (d.cities) setWeather(d.cities);
    }).catch(() => {});
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(next);
          setFlyTo(next);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 12000 }
      );
    }
    void enablePush();
  }, []);

  const mood = italyMood(weather);
  const nearbyParks = [...COVERED_PARKS]
    .map((p) => ({ ...p, km: userPos ? kmBetween(userPos, p) : null }))
    .sort((a, b) => (a.km ?? 9999) - (b.km ?? 9999))
    .slice(0, 6);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      <ItalyMap reports={reports} weather={weather} mode={mode} userPos={userPos} flyTo={flyTo} onCamClick={(id) => setSelectedCam(LIVE_CAMS.find((c) => c.id === id) ?? null)} />
      <WeatherBackdrop mood={mood} />
      <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="pointer-events-none absolute top-4 right-4 left-4 z-20 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-[20px] border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-black text-black">S</div>
          <div>
            <p className="font-bold leading-none text-white">SCUDO ITALIA</p>
            <p className="text-xs text-white/60">{weather.length} citta live · {userPos ? "gps on" : "gps"}</p>
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
      {mode !== "grandine" && (
        <div className="absolute bottom-4 left-4 z-20 w-[min(360px,calc(100%-2rem))] rounded-[24px] bg-white/95 p-4 text-black shadow-2xl">
          <h3 className="mb-3 font-bold">{mode === "parcheggi" ? "Parcheggi coperti vicino a te" : "SOS"}</h3>
          {mode === "parcheggi" && nearbyParks.map((p) => (
            <button key={p.id} onClick={() => setFlyTo({ lat: p.lat, lng: p.lng })} className="flex w-full items-center justify-between border-b py-2 text-left last:border-0">
              <div><p className="text-sm font-bold">{p.name}</p><p className="text-xs text-gray-500">{p.city} · {p.km != null ? p.km.toFixed(1) + " km" : ""}</p></div>
              <span className="text-xs font-bold">VAI</span>
            </button>
          ))}
          {mode === "sos" && (
            <div className="space-y-2">
              {SOS_ACTIONS.map((a) => (
                <a key={a.id} href={a.href} className="flex items-center justify-between rounded-2xl bg-red-50 px-3 py-2">
                  <div><p className="text-sm font-bold text-red-700">{a.title}</p><p className="text-xs text-gray-500">{a.hint}</p></div>
                  <span className="text-xs font-black">CHIAMA</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      {selectedCam && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedCam(null)}>
          <div className="w-full max-w-3xl overflow-hidden rounded-[24px] bg-white text-black" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between p-4"><p className="font-bold">{selectedCam.name}</p><button onClick={() => setSelectedCam(null)}>X</button></div>
            <iframe title={selectedCam.name} src={selectedCam.url} className="aspect-video w-full border-0" />
          </div>
        </div>
      )}
      {showForm && <ReportForm onClose={() => setShowForm(false)} onSubmitted={(r) => { setReports((p) => [{ id: r.id, lat: r.lat, lng: r.lng, size: r.size, intensity: r.intensity, user: r.user_name, time: "adesso", created_at: r.created_at }, ...p]); setShowForm(false); setFlyTo({ lng: r.lng, lat: r.lat }); }} />}
    </div>
  );
}
