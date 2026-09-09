import { NextResponse } from "next/server";
import { ITALY_CITIES } from "@/lib/cities";
import { hailRisk, weatherLabel, type CityWeather } from "@/lib/weather";

export const revalidate = 600;

export async function GET() {
  const lats = ITALY_CITIES.map((c) => c.lat).join(",");
  const lngs = ITALY_CITIES.map((c) => c.lng).join(",");
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}` +
    `&current=temperature_2m,precipitation,weather_code,wind_speed_10m` +
    `&hourly=precipitation_probability&forecast_days=1&timezone=Europe%2FRome`;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) return NextResponse.json({ error: "meteo non disponibile" }, { status: 502 });
  const raw = await res.json();
  const rows = Array.isArray(raw) ? raw : [raw];
  const cities: CityWeather[] = ITALY_CITIES.map((city, i) => {
    const block = rows[i] ?? rows[0];
    const cur = block.current ?? {};
    const probs: number[] = block.hourly?.precipitation_probability ?? [];
    const precipProb = probs.length ? Math.max(...probs.slice(0, 6)) : null;
    const code = typeof cur.weather_code === "number" ? cur.weather_code : null;
    const wind = typeof cur.wind_speed_10m === "number" ? cur.wind_speed_10m : null;
    return {
      name: city.name, lat: city.lat, lng: city.lng,
      temp: typeof cur.temperature_2m === "number" ? cur.temperature_2m : null,
      wind,
      precip: typeof cur.precipitation === "number" ? cur.precipitation : null,
      precipProb, code, label: weatherLabel(code), hailRisk: hailRisk(code, precipProb, wind),
    };
  });
  const alerts = cities.filter((c) => c.hailRisk === "alto" || c.hailRisk === "estremo" || c.code === 96 || c.code === 99);
  return NextResponse.json({ updatedAt: new Date().toISOString(), cities, alerts });
}
