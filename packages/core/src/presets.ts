import type { CampusPreset } from "./types.js";

/** Zurich campus / landmark location chips. */
export const ZURICH_CAMPUS_PRESETS: readonly CampusPreset[] = [
  { id: "eth-zentrum", label: "ETH Zentrum", lat: 47.3763, lng: 8.5476 },
  { id: "honggerberg", label: "Honggerberg", lat: 47.4085, lng: 8.5076 },
  { id: "hb", label: "Zurich HB", lat: 47.3782, lng: 8.5402 },
  { id: "bellevue", label: "Bellevue", lat: 47.3668, lng: 8.5452 },
] as const;

export function getPresetById(id: string): CampusPreset | undefined {
  return ZURICH_CAMPUS_PRESETS.find((p) => p.id === id);
}
