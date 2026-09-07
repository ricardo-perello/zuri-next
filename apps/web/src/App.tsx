import { useCallback, useMemo, useState } from "react";
import { DEFAULT_RADIUS_METERS, type CampusPreset } from "@zuri-next/core";
import { CampusChips } from "./components/CampusChips";
import { DepartureList } from "./components/DepartureList";
import { StopList } from "./components/StopList";
import { useFavourites } from "./hooks/useFavourites";
import { useNearbyDepartures, type LocationSource } from "./hooks/useNearbyDepartures";

type Mode = { kind: "gps" } | { kind: "preset"; preset: CampusPreset };

export default function App() {
  const [mode, setMode] = useState<Mode>({ kind: "preset", preset: {
    id: "hb",
    label: "Zurich HB",
    lat: 47.3782,
    lng: 8.5402,
  }});
  const [gpsLoc, setGpsLoc] = useState<LocationSource | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS_METERS);
  const { favouriteIds, toggleFavourite } = useFavourites();

  const location: LocationSource | null = useMemo(() => {
    if (mode.kind === "preset") {
      return { lat: mode.preset.lat, lng: mode.preset.lng, label: mode.preset.label };
    }
    return gpsLoc;
  }, [mode, gpsLoc]);

  const {
    stops,
    selectedStopId,
    departures,
    loading,
    error,
    lastUpdated,
    refresh,
    selectStop,
  } = useNearbyDepartures(location, favouriteIds, radius);

  const requestGps = useCallback(() => {
    setGpsError(null);
    setMode({ kind: "gps" });
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Near me",
        });
      },
      (err) => setGpsError(err.message || "Location denied"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  }, []);

  const selectedStop = stops.find((s) => s.id === selectedStopId);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Zuri Next</h1>
          <p className="tagline">Nearby departures</p>
        </div>
        <button type="button" className="btn" onClick={() => refresh()} disabled={loading || !location}>
          Refresh
        </button>
      </header>

      <CampusChips
        activeId={mode.kind === "preset" ? mode.preset.id : null}
        gpsActive={mode.kind === "gps"}
        onSelect={(preset) => setMode({ kind: "preset", preset })}
        onUseGps={requestGps}
      />

      <label className="radius">
        <span>Radius {radius} m</span>
        <input
          type="range"
          min={300}
          max={1500}
          step={50}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        />
      </label>

      {(gpsError || error) && (
        <p className="error" role="alert">{gpsError || error}</p>
      )}

      {mode.kind === "gps" && !gpsLoc && !gpsError && (
        <p className="muted">Getting location…</p>
      )}

      <section className="panel">
        <h2>Stops {location?.label ? `· ${location.label}` : ""}</h2>
        {loading && stops.length === 0 ? (
          <p className="muted">Loading…</p>
        ) : (
          <StopList
            stops={stops}
            selectedStopId={selectedStopId}
            favouriteIds={favouriteIds}
            onSelect={(id) => void selectStop(id)}
            onToggleFavourite={toggleFavourite}
          />
        )}
      </section>

      <section className="panel">
        <h2>
          Departures
          {selectedStop ? ` · ${selectedStop.name}` : ""}
        </h2>
        {loading && departures.length === 0 ? (
          <p className="muted">Loading…</p>
        ) : (
          <DepartureList departures={departures} fetchedAt={lastUpdated} />
        )}
        {lastUpdated && (
          <p className="muted tiny">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </section>
    </div>
  );
}
