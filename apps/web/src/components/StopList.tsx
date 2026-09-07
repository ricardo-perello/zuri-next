import { isFavourite, type Stop } from "@zuri-next/core";

interface Props {
  stops: Stop[];
  selectedStopId: string | null;
  favouriteIds: readonly string[];
  onSelect: (id: string) => void;
  onToggleFavourite: (id: string) => void;
}

export function StopList({
  stops,
  selectedStopId,
  favouriteIds,
  onSelect,
  onToggleFavourite,
}: Props) {
  if (stops.length === 0) {
    return <p className="muted">No stops in range. Try a preset or widen radius.</p>;
  }
  return (
    <ul className="stop-list">
      {stops.map((stop) => {
        const fav = isFavourite(favouriteIds, stop.id);
        const selected = stop.id === selectedStopId;
        return (
          <li key={stop.id} className={selected ? "stop stop-selected" : "stop"}>
            <button type="button" className="stop-main" onClick={() => onSelect(stop.id)}>
              <span className="stop-name">{stop.name}</span>
              {typeof stop.distance === "number" && (
                <span className="stop-dist">{stop.distance} m</span>
              )}
            </button>
            <button
              type="button"
              className={fav ? "pin pin-on" : "pin"}
              aria-label={fav ? "Unpin stop" : "Pin stop"}
              aria-pressed={fav}
              onClick={() => onToggleFavourite(stop.id)}
            >
              {fav ? "★" : "☆"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
