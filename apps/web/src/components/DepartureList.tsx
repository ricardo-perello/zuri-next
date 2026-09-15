import { useEffect, useState } from "react";
import { isElinkLine, type Departure } from "@zuri-next/core";

interface Props {
  departures: Departure[];
  fetchedAt: number | null;
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "now";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m`;
  }
  if (m === 0) return `${s}s`;
  return `${m} min`;
}

export function DepartureList({ departures, fetchedAt }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (departures.length === 0) {
    return <p className="muted">No departures right now.</p>;
  }

  return (
    <ul className="dep-list">
      {departures.map((d) => {
        const remaining = Math.max(
          0,
          Math.round((Date.parse(d.departureISO) - now) / 1000),
        );
        void fetchedAt;
        const elink = isElinkLine(d.line);
        return (
          <li key={d.id} className={elink ? "dep dep-elink" : "dep"}>
            <span
              className={elink ? "line-badge line-badge-elink" : "line-badge"}
              title={elink ? "ETH eLink (line E, VBG)" : undefined}
            >
              {d.line.name}
            </span>
            <span className="dep-to">{d.destination}</span>
            <span className="dep-meta">
              <span className="countdown">{formatCountdown(remaining)}</span>
              {d.delay && (
                <span className="delay">
                  {d.delay.minutes > 0 ? `+${d.delay.minutes}` : d.delay.minutes}′
                </span>
              )}
              {d.platform && <span className="platform">Pl. {d.platform}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
