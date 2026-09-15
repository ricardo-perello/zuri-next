import { defaultCache } from "./cache.js";
import { DEFAULT_RADIUS_METERS, distanceMeters } from "./geo.js";
import {
  NEARBY_CACHE_TTL_MS,
  STATIONBOARD_CACHE_TTL_MS,
} from "./refresh.js";
import { lineDisplayName, sortDeparturesElinkFirst } from "./elink.js";
import type {
  Departure,
  Delay,
  Line,
  NearbyStopsOptions,
  StationboardOptions,
  Stop,
  TransportClientConfig,
} from "./types.js";

const PROD_BASE = "https://transport.opendata.ch/v1";

export function createTransportClient(config?: Partial<TransportClientConfig>) {
  const baseUrl = (config?.baseUrl ?? PROD_BASE).replace(/\/$/, "");
  const fetchImpl = config?.fetchImpl ?? fetch.bind(globalThis);

  async function getJson<T>(path: string, params: Record<string, string | number>): Promise<T> {
    let finalUrl: string;
    if (baseUrl.startsWith("http")) {
      const u = new URL(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
      for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
      finalUrl = u.toString();
    } else {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) q.set(k, String(v));
      const p = path.startsWith("/") ? path : `/${path}`;
      finalUrl = `${baseUrl}${p}?${q.toString()}`;
    }

    const res = await fetchImpl(finalUrl);
    if (!res.ok) {
      throw new Error(`Transport API ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  }

  async function getNearbyStops(
    lat: number,
    lng: number,
    options: NearbyStopsOptions = {},
  ): Promise<Stop[]> {
    const radiusMeters = options.radiusMeters ?? DEFAULT_RADIUS_METERS;
    const limit = options.limit ?? 10;
    const cacheKey = `nearby:${lat.toFixed(5)},${lng.toFixed(5)}:${radiusMeters}:${limit}`;
    const cached = defaultCache.get<Stop[]>(cacheKey);
    if (cached) return cached;

    type LocResponse = {
      stations: Array<{
        id: string | null;
        name: string;
        coordinate?: { type?: string; x: number | null; y: number | null };
        distance?: number | null;
      }>;
    };

    // transport.opendata.ch uses x=longitude, y=latitude
    const data = await getJson<LocResponse>("/locations", {
      x: lng,
      y: lat,
      type: "station",
    });

    const stops: Stop[] = [];
    for (const s of data.stations ?? []) {
      if (!s.id || !s.name) continue;
      const slat = s.coordinate?.y;
      const slng = s.coordinate?.x;
      if (slat == null || slng == null) continue;
      const dist =
        typeof s.distance === "number"
          ? s.distance
          : distanceMeters(lat, lng, slat, slng);
      if (dist > radiusMeters) continue;
      stops.push({
        id: s.id,
        name: s.name,
        lat: slat,
        lng: slng,
        distance: Math.round(dist),
      });
    }

    stops.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    const sliced = stops.slice(0, limit);
    defaultCache.set(cacheKey, sliced, NEARBY_CACHE_TTL_MS);
    return sliced;
  }

  async function getStationboard(
    stationIdOrName: string,
    options: StationboardOptions = {},
  ): Promise<Departure[]> {
    const limit = options.limit ?? 16;
    const cacheKey = `board:${stationIdOrName}:${limit}`;
    const cached = defaultCache.get<Departure[]>(cacheKey);
    if (cached) return cached;

    type BoardResponse = {
      stationboard: Array<{
        name?: string;
        category?: string;
        number?: string;
        operator?: string;
        to?: string;
        stop?: {
          departure?: string;
          delay?: number | null;
          platform?: string | null;
        };
      }>;
    };

    const data = await getJson<BoardResponse>("/stationboard", {
      station: stationIdOrName,
      limit,
    });

    const now = Date.now();
    const departures: Departure[] = [];

    for (const row of data.stationboard ?? []) {
      const depIso = row.stop?.departure;
      if (!depIso) continue;
      const depMs = Date.parse(depIso);
      const countdownSeconds = Math.max(0, Math.round((depMs - now) / 1000));
      const line: Line = {
        name: lineDisplayName({
          number: row.number,
          operator: row.operator,
          category: row.category,
          destination: row.to,
          name: row.name,
        }),
        category: row.category,
        number: row.number,
        operator: row.operator?.trim() || undefined,
      };
      let delay: Delay | undefined;
      if (typeof row.stop?.delay === "number" && row.stop.delay !== 0) {
        delay = { minutes: row.stop.delay };
      }
      const platform = row.stop?.platform ?? undefined;
      departures.push({
        id: `${stationIdOrName}:${depIso}:${line.name}:${row.to ?? ""}`,
        line,
        destination: row.to ?? "\u2014",
        departureISO: depIso,
        countdownSeconds,
        delay,
        platform: platform || undefined,
      });
    }

    const sorted = sortDeparturesElinkFirst(departures);
    defaultCache.set(cacheKey, sorted, STATIONBOARD_CACHE_TTL_MS);
    return sorted;
  }

  function invalidateCache(): void {
    defaultCache.clear();
  }

  return {
    baseUrl,
    getNearbyStops,
    getStationboard,
    invalidateCache,
  };
}

export type TransportClient = ReturnType<typeof createTransportClient>;

export const PRODUCTION_API_BASE = PROD_BASE;
