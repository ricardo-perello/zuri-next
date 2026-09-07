import { useCallback, useEffect, useState } from "react";
import {
  FAVOURITES_STORAGE_KEY,
  parseFavourites,
  serializeFavourites,
  toggleFavourite,
} from "@zuri-next/core";

export function useFavourites() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(parseFavourites(localStorage.getItem(FAVOURITES_STORAGE_KEY)));
  }, []);

  const toggle = useCallback((stopId: string) => {
    setIds((prev) => {
      const next = toggleFavourite(prev, stopId);
      localStorage.setItem(FAVOURITES_STORAGE_KEY, serializeFavourites(next));
      return next;
    });
  }, []);

  return { favouriteIds: ids, toggleFavourite: toggle };
}
