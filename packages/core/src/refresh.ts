/** Default auto-refresh interval while the tab is visible. */
export const DEFAULT_REFRESH_MS = 45_000;

/** Nearby-stops cache TTL. */
export const NEARBY_CACHE_TTL_MS = 60_000;

/** Stationboard cache TTL (shorter so countdowns stay honest). */
export const STATIONBOARD_CACHE_TTL_MS = 30_000;

export type VisibilityState = "visible" | "hidden" | "prerender" | string;

/** Whether auto-refresh should run given document visibility. */
export function shouldAutoRefresh(visibilityState: VisibilityState): boolean {
  return visibilityState === "visible";
}

export function nextRefreshAt(fromMs: number = Date.now(), intervalMs: number = DEFAULT_REFRESH_MS): number {
  return fromMs + intervalMs;
}
