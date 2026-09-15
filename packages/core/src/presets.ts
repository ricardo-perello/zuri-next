import type { CampusPreset } from "./types.js";

/** Zurich campus / landmark location chips (includes eLink-relevant stops). */
export const ZURICH_CAMPUS_PRESETS: readonly CampusPreset[] = [
  { id: "eth-zentrum", label: "ETH Zentrum", lat: 47.3763, lng: 8.5476 },
  { id: "haldenegg", label: "Haldenegg", lat: 47.379634, lng: 8.544512 },
  { id: "polyterrasse", label: "ETH / Uni", lat: 47.377278, lng: 8.548224 },
  { id: "honggerberg", label: "Hönggerberg", lat: 47.4085, lng: 8.5076 },
  { id: "hb", label: "Zurich HB", lat: 47.3782, lng: 8.5402 },
  { id: "bellevue", label: "Bellevue", lat: 47.3668, lng: 8.5452 },
] as const;

export function getPresetById(id: string): CampusPreset | undefined {
  return ZURICH_CAMPUS_PRESETS.find((p) => p.id === id);
}
