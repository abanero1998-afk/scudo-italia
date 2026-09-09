export type CityWeather = {
  name: string; lat: number; lng: number;
  temp: number | null; wind: number | null; precip: number | null;
  precipProb: number | null; code: number | null; label: string;
  hailRisk: "basso" | "medio" | "alto" | "estremo";
};
export type WeatherMood = "sole" | "variabile" | "brutto";
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
export function weatherIcon(code: number | null) {
  if (code == null) return "·";
  if (code <= 1) return "sole";
  if (code === 2) return "nubi";
  if (code === 3 || code === 45 || code === 48) return "coperto";
  if (code >= 71 && code < 80) return "neve";
  if (code >= 95) return "storm";
  if (code >= 51) return "pioggia";
  return "nubi";
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
