import { ZURICH_CAMPUS_PRESETS, type CampusPreset } from "@zuri-next/core";

interface Props {
  activeId: string | null;
  onSelect: (preset: CampusPreset) => void;
  onUseGps: () => void;
  gpsActive: boolean;
}

export function CampusChips({ activeId, onSelect, onUseGps, gpsActive }: Props) {
  return (
    <div className="chips" role="toolbar" aria-label="Location presets">
      <button
        type="button"
        className={gpsActive ? "chip chip-active" : "chip"}
        onClick={onUseGps}
      >
        Near me
      </button>
      {ZURICH_CAMPUS_PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          className={activeId === p.id ? "chip chip-active" : "chip"}
          onClick={() => onSelect(p)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
