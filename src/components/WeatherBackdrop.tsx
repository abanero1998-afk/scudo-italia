"use client";
import type { WeatherMood } from "@/lib/weather";
export default function WeatherBackdrop({ mood }: { mood: WeatherMood }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {mood === "sole" && (<><div className="sun-orb" /><div className="sun-rays" /><div className="sun-glow" /></>)}
      {mood === "brutto" && (<><div className="storm-veil" /><div className="lightning l1" /><div className="lightning l2" /><div className="lightning l3" /><div className="rain-sheet" /></>)}
      {mood === "variabile" && <div className="haze-veil" />}
    </div>
  );
}
