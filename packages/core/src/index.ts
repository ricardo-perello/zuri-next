export type {
  Coordinates,
  Stop,
  Line,
  Delay,
  Departure,
  NearbyStopsOptions,
  StationboardOptions,
  CampusPreset,
  TransportClientConfig,
} from "./types.js";

export { TtlCache, defaultCache } from "./cache.js";
export type { CacheEntry } from "./cache.js";

export { ZURICH_CAMPUS_PRESETS, getPresetById } from "./presets.js";

export {
  FAVOURITES_STORAGE_KEY,
  parseFavourites,
  serializeFavourites,
  isFavourite,
  toggleFavourite,
  sortStopsFavouritesFirst,
} from "./favourites.js";

export {
  DEFAULT_REFRESH_MS,
  NEARBY_CACHE_TTL_MS,
  STATIONBOARD_CACHE_TTL_MS,
  shouldAutoRefresh,
  nextRefreshAt,
} from "./refresh.js";
export type { VisibilityState } from "./refresh.js";

export { distanceMeters, DEFAULT_RADIUS_METERS } from "./geo.js";

export { createTransportClient, PRODUCTION_API_BASE } from "./client.js";
export type { TransportClient } from "./client.js";

export {
  ELINK_DISPLAY_NAME,
  isElink,
  isElinkLine,
  lineDisplayName,
  sortDeparturesElinkFirst,
  isBusLike,
} from "./elink.js";
export type { ElinkLike } from "./elink.js";
