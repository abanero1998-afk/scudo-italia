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
export const COVERED_PARKS = [
  { id: "p1", name: "Park Duomo", city: "Milano", lat: 45.464, lng: 9.19, spots: 420, covered: true },
  { id: "p2", name: "Lingotto Park", city: "Torino", lat: 45.032, lng: 7.665, spots: 280, covered: true },
  { id: "p3", name: "Roma Termini Parking", city: "Roma", lat: 41.901, lng: 12.502, spots: 650, covered: true },
  { id: "p4", name: "Centro Campania", city: "Napoli", lat: 40.92, lng: 14.32, spots: 310, covered: true },
  { id: "p5", name: "Fiera Bologna P4", city: "Bologna", lat: 44.51, lng: 11.37, spots: 190, covered: true },
  { id: "p6", name: "Porta a Mare", city: "Livorno", lat: 43.55, lng: 10.31, spots: 140, covered: true },
  { id: "p7", name: "Stazione FS Firenze", city: "Firenze", lat: 43.776, lng: 11.248, spots: 220, covered: true },
  { id: "p8", name: "Arena Park", city: "Verona", lat: 45.438, lng: 10.994, spots: 160, covered: true },
];
export const SOS_ACTIONS = [
  { id: "112", title: "Emergenza 112", hint: "Unico numero europeo", href: "tel:112" },
  { id: "115", title: "Vigili del fuoco 115", hint: "Incendi e soccorso tecnico", href: "tel:115" },
  { id: "118", title: "Soccorso 118", hint: "Emergenza sanitaria", href: "tel:118" },
  { id: "113", title: "Polizia 113", hint: "Ordine pubblico", href: "tel:113" },
];
