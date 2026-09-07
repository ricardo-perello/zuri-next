export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance?: number;
}

export interface Line {
  name: string;
  category?: string;
  number?: string;
}

export interface Delay {
  /** Delay in minutes (positive = late). */
  minutes: number;
}

export interface Departure {
  id: string;
  line: Line;
  destination: string;
  /** Planned/absolute departure time as ISO string. */
  departureISO: string;
  /** Seconds until departure from now at fetch time; UI may recompute. */
  countdownSeconds: number;
  delay?: Delay;
  platform?: string;
}

export interface NearbyStopsOptions {
  radiusMeters?: number;
  limit?: number;
}

export interface StationboardOptions {
  limit?: number;
}

export interface CampusPreset {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

export interface TransportClientConfig {
  /** API base, e.g. https://transport.opendata.ch/v1 or /transport/v1 in dev. */
  baseUrl: string;
  fetchImpl?: typeof fetch;
}
