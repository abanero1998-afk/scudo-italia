"use client";
import { useState } from "react";
import { HAIL_SIZES, INTENSITIES } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";

type Props = {
  onClose: () => void;
  onSubmitted: (report: { id: string; lat: number; lng: number; size: string; intensity: string; user_name: string; created_at: string }) => void;
};

export default function ReportForm({ onClose, onSubmitted }: Props) {
  const [size, setSize] = useState<(typeof HAIL_SIZES)[number]>("noce");
  const [intensity, setIntensity] = useState<(typeof INTENSITIES)[number]>("media");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "locating" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setStatus("locating");
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Geolocalizzazione non disponibile"));
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000 });
    }).catch((e: Error) => { setStatus("error"); setError(e.message || "Permetti la posizione."); return null; });
    if (!pos) return;
    const payload = { lat: pos.coords.latitude, lng: pos.coords.longitude, size, intensity, note: note || null, user_name: name.trim() || "Anonimo", source: "app" };
    setStatus("saving");
    const sb = getSupabase();
    let id = crypto.randomUUID();
    let created_at = new Date().toISOString();
    if (sb) {
      const { data, error: dbError } = await sb.from("hail_reports").insert(payload).select("id, created_at").single();
      if (dbError) { setStatus("error"); setError(dbError.message); return; }
      id = data.id; created_at = data.created_at;
    }
    onSubmitted({ id, lat: payload.lat, lng: payload.lng, size: payload.size, intensity: payload.intensity, user_name: payload.user_name, created_at });
    setStatus("idle");
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-[28px] bg-white p-5 text-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex justify-between"><div><p className="text-lg font-black">Segnala grandine</p><p className="text-xs text-gray-500">Usiamo il GPS come punto sulla rete.</p></div><button onClick={onClose}>X</button></div>
        <div className="mb-4 flex flex-wrap gap-2">{HAIL_SIZES.map((s) => <button key={s} type="button" onClick={() => setSize(s)} className={`rounded-full px-3 py-1.5 text-sm capitalize ${size === s ? "bg-black text-white" : "bg-gray-100"}`}>{s}</button>)}</div>
        <div className="mb-4 flex flex-wrap gap-2">{INTENSITIES.map((s) => <button key={s} type="button" onClick={() => setIntensity(s)} className={`rounded-full px-3 py-1.5 text-sm capitalize ${intensity === s ? "bg-red-500 text-white" : "bg-gray-100"}`}>{s}</button>)}</div>
        <input className="mb-3 w-full rounded-2xl border px-4 py-3 text-sm" placeholder="Nome (opzionale)" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="mb-4 w-full rounded-2xl border px-4 py-3 text-sm" rows={3} placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button onClick={submit} disabled={status !== "idle" && status !== "error"} className="w-full rounded-full bg-red-500 py-3.5 text-sm font-bold text-white disabled:opacity-60">
          {status === "locating" ? "Rilevo posizione..." : status === "saving" ? "Invio in rete..." : "Invia alla rete Italia"}
        </button>
      </div>
    </div>
  );
}
