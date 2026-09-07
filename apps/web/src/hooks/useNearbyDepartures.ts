import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_RADIUS_METERS,
  DEFAULT_REFRESH_MS,
  shouldAutoRefresh,
  sortStopsFavouritesFirst,
  type Departure,
  type Stop,
} from "@zuri-next/core";
import { transport } from "../api";

export interface LocationSource {
  lat: number;
  lng: number;
  label?: string;
}

interface State {
  stops: Stop[];
  selectedStopId: string | null;
  departures: Departure[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export function useNearbyDepartures(
  location: LocationSource | null,
  favouriteIds: readonly string[],
  radiusMeters: number = DEFAULT_RADIUS_METERS,
) {
  const [state, setState] = useState<State>({
    stops: [],
    selectedStopId: null,
    departures: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = state.selectedStopId;

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!location) return;
    if (!opts?.silent) {
      setState((s) => ({ ...s, loading: true, error: null }));
    }
    try {
      transport.invalidateCache();
      const stopsRaw = await transport.getNearbyStops(location.lat, location.lng, {
        radiusMeters,
        limit: 12,
      });
      const stops = sortStopsFavouritesFirst(stopsRaw, favouriteIds);
      let selectedStopId = selectedRef.current;
      if (!selectedStopId || !stops.some((s) => s.id === selectedStopId)) {
        selectedStopId = stops[0]?.id ?? null;
      }
      let departures: Departure[] = [];
      if (selectedStopId) {
        departures = await transport.getStationboard(selectedStopId, { limit: 20 });
      }
      setState({
        stops,
        selectedStopId,
        departures,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load";
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  }, [location, favouriteIds, radiusMeters]);

  const selectStop = useCallback(async (stopId: string) => {
    setState((s) => ({ ...s, selectedStopId: stopId, loading: true, error: null }));
    try {
      const departures = await transport.getStationboard(stopId, { limit: 20 });
      setState((s) => ({
        ...s,
        selectedStopId: stopId,
        departures,
        loading: false,
        lastUpdated: Date.now(),
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load departures";
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const tick = () => {
      if (!shouldAutoRefresh(document.visibilityState)) return;
      void load({ silent: true });
    };
    const id = window.setInterval(tick, DEFAULT_REFRESH_MS);
    const onVis = () => {
      if (shouldAutoRefresh(document.visibilityState)) void load({ silent: true });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  return {
    ...state,
    refresh: () => load(),
    selectStop,
  };
}
