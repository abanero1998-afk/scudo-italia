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
export function kmBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
export const COVERED_PARKS = [
  { id: "p1", name: "Park Duomo", city: "Milano", lat: 45.464, lng: 9.19, spots: 420, covered: true },
  { id: "p2", name: "Park Sempione", city: "Milano", lat: 45.473, lng: 9.172, spots: 210, covered: true },
  { id: "p3", name: "Lingotto Park", city: "Torino", lat: 45.032, lng: 7.665, spots: 280, covered: true },
  { id: "p4", name: "Porta Nuova Garage", city: "Torino", lat: 45.075, lng: 7.678, spots: 180, covered: true },
  { id: "p5", name: "Roma Termini Parking", city: "Roma", lat: 41.901, lng: 12.502, spots: 650, covered: true },
  { id: "p6", name: "Villa Borghese Park", city: "Roma", lat: 41.914, lng: 12.492, spots: 320, covered: true },
  { id: "p7", name: "Centro Campania", city: "Napoli", lat: 40.92, lng: 14.32, spots: 310, covered: true },
  { id: "p8", name: "Garibaldi Park", city: "Napoli", lat: 40.852, lng: 14.272, spots: 240, covered: true },
  { id: "p9", name: "Fiera Bologna P4", city: "Bologna", lat: 44.51, lng: 11.37, spots: 190, covered: true },
  { id: "p10", name: "Porta a Mare", city: "Livorno", lat: 43.55, lng: 10.31, spots: 140, covered: true },
  { id: "p11", name: "Stazione FS Firenze", city: "Firenze", lat: 43.776, lng: 11.248, spots: 220, covered: true },
  { id: "p12", name: "Arena Park", city: "Verona", lat: 45.438, lng: 10.994, spots: 160, covered: true },
  { id: "p13", name: "Tronchetto", city: "Venezia", lat: 45.44, lng: 12.306, spots: 400, covered: true },
  { id: "p14", name: "Fiera Genova", city: "Genova", lat: 44.41, lng: 8.93, spots: 200, covered: true },
  { id: "p15", name: "Stazione Bari", city: "Bari", lat: 41.118, lng: 16.87, spots: 150, covered: true },
  { id: "p16", name: "Forum Palermo", city: "Palermo", lat: 38.12, lng: 13.35, spots: 260, covered: true },
  { id: "p17", name: "Ichnusa Park", city: "Cagliari", lat: 39.223, lng: 9.12, spots: 130, covered: true },
  { id: "p18", name: "Centro Sicilia", city: "Catania", lat: 37.51, lng: 15.07, spots: 210, covered: true },
];
export const SOS_ACTIONS = [
  { id: "112", title: "Emergenza 112", hint: "Unico numero europeo", href: "tel:112" },
  { id: "115", title: "Vigili del fuoco 115", hint: "Incendi e soccorso tecnico", href: "tel:115" },
  { id: "118", title: "Soccorso 118", hint: "Emergenza sanitaria", href: "tel:118" },
  { id: "113", title: "Polizia 113", hint: "Ordine pubblico", href: "tel:113" },
];
