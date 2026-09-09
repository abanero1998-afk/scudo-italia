export type CityWeather = {
  name: string; lat: number; lng: number;
  temp: number | null; wind: number | null; precip: number | null;
  precipProb: number | null; code: number | null; label: string;
  hailRisk: "basso" | "medio" | "alto" | "estremo";
};
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
