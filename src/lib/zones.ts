export type Zone = { name: string; lat: number; lng: number };

export const ZONES: Zone[] = [
  { name: "Centro", lat: -27.3671, lng: -55.8961 },
  { name: "Costanera", lat: -27.3598, lng: -55.8925 },
  { name: "Villa Sarita", lat: -27.374, lng: -55.887 },
  { name: "Bajada Vieja", lat: -27.3625, lng: -55.904 },
  { name: "El Brete", lat: -27.3565, lng: -55.9105 },
  { name: "Villa Urquiza", lat: -27.383, lng: -55.905 },
  { name: "Villa Cabello", lat: -27.396, lng: -55.92 },
  { name: "Miguel Lanús", lat: -27.432, lng: -55.889 },
  { name: "Itaembé Miní", lat: -27.43, lng: -55.93 },
  { name: "Garupá", lat: -27.479, lng: -55.829 },
];

export const POSADAS_CENTER: [number, number] = [-27.3885, -55.9];

export function zoneCoords(name: string | null | undefined): Zone {
  return ZONES.find((z) => z.name === name) || ZONES[0];
}
