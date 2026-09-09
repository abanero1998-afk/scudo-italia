export type CityWeather = {
  name: string; lat: number; lng: number;
  temp: number | null; wind: number | null; windDir?: number | null;
  precip: number | null; precipProb: number | null; code: number | null; label: string;
  hailRisk: "basso" | "medio" | "alto" | "estremo";
};
export type WeatherMood = "sole" | "variabile" | "brutto";
export type WxKind = "sole" | "pioggia" | "vento";
const WMO: Record<number, string> = {
  0: "Sereno", 1: "Prevalentemente sereno", 2: "Parzialmente nuvoloso", 3: "Coperto",
  45: "Nebbia", 48: "Nebbia ghiacciata", 51: "Pioviggine", 61: "Pioggia", 63: "Pioggia",
  65: "Pioggia forte", 71: "Neve", 80: "Rovesci", 81: "Rovesci forti", 82: "Rovesci violenti",
  95: "Temporale", 96: "Temporale con grandine", 99: "Temporale violento con grandine",
};
export function weatherLabel(code: number | null) {
  if (code == null) return "N/D";
  return WMO[code] ?? `Codice ${code}`;
}
export function hailRisk(code: number | null, precipProb: number | null, wind: number | null): CityWeather["hailRisk"] {
  if (code === 99) return "estremo";
  if (code === 96) return "alto";
  if (code === 95 && (precipProb ?? 0) >= 60) return "alto";
  if (code === 95 || ((precipProb ?? 0) >= 70 && (wind ?? 0) >= 40)) return "medio";
  if ((precipProb ?? 0) >= 50) return "medio";
  return "basso";
}
export function italyMood(cities: CityWeather[]): WeatherMood {
  if (!cities.length) return "variabile";
  const storms = cities.filter((c) => (c.code ?? 0) >= 80 || c.hailRisk === "alto" || c.hailRisk === "estremo").length;
  const rain = cities.filter((c) => (c.code ?? 0) >= 51 && (c.code ?? 0) < 80).length;
  const sun = cities.filter((c) => (c.code ?? 0) <= 1).length;
  if (storms >= 2 || storms + rain >= Math.ceil(cities.length * 0.4)) return "brutto";
  if (sun >= Math.ceil(cities.length * 0.5) && storms === 0) return "sole";
  return "variabile";
}
export function weatherKind(code: number | null, wind: number | null): WxKind {
  if (code != null && code >= 51) return "pioggia";
  if (code != null && code <= 1 && (wind ?? 0) < 28) return "sole";
  return "vento";
}
export function premiumWxIcon(kind: WxKind) {
  if (kind === "sole") {
    return `<svg class="wx-svg sun" viewBox="0 0 64 64" width="44" height="44"><g class="sun-spin"><g stroke="#fbbf24" stroke-width="3" stroke-linecap="round"><line x1="32" y1="6" x2="32" y2="14"/><line x1="32" y1="50" x2="32" y2="58"/><line x1="6" y1="32" x2="14" y2="32"/><line x1="50" y1="32" x2="58" y2="32"/><line x1="13" y1="13" x2="19" y2="19"/><line x1="45" y1="45" x2="51" y2="51"/><line x1="13" y1="51" x2="19" y2="45"/><line x1="45" y1="19" x2="51" y2="13"/></g></g><circle cx="32" cy="32" r="12" fill="#fbbf24"/><circle cx="32" cy="32" r="7" fill="#fff7c2"/></svg>`;
  }
  if (kind === "pioggia") {
    return `<svg class="wx-svg storm" viewBox="0 0 64 64" width="46" height="46"><path d="M22 24c0-7 6-12 13-12 6 0 11 4 12 10 6 1 10 6 10 12 0 7-6 12-13 12H24c-7 0-13-5-13-12 0-6 4-11 11-12z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/><path class="bolt" d="M34 28l-8 12h7l-3 12 12-16h-7z" fill="#fde047"/></svg>`;
  }
  return `<svg class="wx-svg wind" viewBox="0 0 64 64" width="46" height="46"><path d="M18 30c0-6 5-11 12-11 6 0 10 4 11 9h11c5 0 9 4 9 9s-4 9-9 9H22c-6 0-11-5-11-10 0-5 4-9 7-10z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.4"/><path class="wind-line" d="M14 50h28" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/><path class="wind-line d2" d="M20 56h18" stroke="#e2e8f0" stroke-width="2.4" stroke-linecap="round"/></svg>`;
}
