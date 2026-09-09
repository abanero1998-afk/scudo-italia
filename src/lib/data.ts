export const LIVE_CAMS = [
  { id: 1, name: "A1 Firenze - Colle Salvetti", lat: 43.6, lng: 10.48, url: "https://www.skylinewebcams.com/it/webcam/italia/toscana/livorno/livorno.html", type: "Autostrada" },
  { id: 2, name: "Livorno Porto", lat: 43.55, lng: 10.31, url: "https://www.skylinewebcams.com/it/webcam/italia/toscana/livorno/livorno.html", type: "Meteo" },
  { id: 3, name: "Milano Duomo", lat: 45.464, lng: 9.19, url: "https://www.skylinewebcams.com/it/webcam/italia/lombardia/milano/duomo-milano.html", type: "Città" },
  { id: 4, name: "Roma Centro", lat: 41.9028, lng: 12.4964, url: "https://www.skylinewebcams.com/it/webcam/italia/lazio/roma/piazza-venezia.html", type: "Città" },
  { id: 5, name: "Napoli Golfo", lat: 40.8518, lng: 14.2681, url: "https://www.skylinewebcams.com/it/webcam/italia/campania/napoli/napoli.html", type: "Meteo" },
];
export const FALLBACK_REPORTS = [
  { id: "local-1", lat: 43.6, lng: 10.48, size: "noce", time: "2 min fa", user: "Marco", intensity: "forte" },
  { id: "local-2", lat: 44.49, lng: 11.34, size: "pallina tennis", time: "5 min fa", user: "Giulia", intensity: "estremo" },
  { id: "local-3", lat: 45.06, lng: 7.68, size: "moneta", time: "12 min fa", user: "Alessio", intensity: "media" },
];
export const HAIL_SIZES = ["chicco", "moneta", "noce", "pallina tennis", "uovo", "palla da baseball"] as const;
export const INTENSITIES = ["lieve", "media", "forte", "estremo"] as const;
export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.max(0, Math.round(diff / 60000));
  if (m < 1) return "adesso";
  if (m < 60) return `${m} min fa`;
  return `${Math.round(m / 60)} ore fa`;
}
