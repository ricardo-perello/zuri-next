export const FAVOURITES_STORAGE_KEY = "zuri-next:favourite-stops";

export function parseFavourites(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function serializeFavourites(ids: string[]): string {
  return JSON.stringify([...new Set(ids)]);
}

export function isFavourite(ids: readonly string[], stopId: string): boolean {
  return ids.includes(stopId);
}

export function toggleFavourite(ids: readonly string[], stopId: string): string[] {
  if (ids.includes(stopId)) {
    return ids.filter((id) => id !== stopId);
  }
  return [...ids, stopId];
}

export function sortStopsFavouritesFirst<T extends { id: string }>(
  stops: readonly T[],
  favouriteIds: readonly string[],
): T[] {
  const fav = new Set(favouriteIds);
  return [...stops].sort((a, b) => {
    const af = fav.has(a.id) ? 0 : 1;
    const bf = fav.has(b.id) ? 0 : 1;
    if (af !== bf) return af - bf;
    return 0;
  });
}
