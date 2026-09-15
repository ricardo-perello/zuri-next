import type { Departure, Line } from "./types.js";

/** Display label for the ETH eLink shuttle (feed line number is "E"). */
export const ELINK_DISPLAY_NAME = "eLink";

export interface ElinkLike {
  number?: string | null;
  operator?: string | null;
  category?: string | null;
  /** Destination / `to` — used only as a safe fallback when operator is missing. */
  destination?: string | null;
  name?: string | null;
}

function norm(s: string | null | undefined): string {
  return (s ?? "").trim();
}

/**
 * Detect ETH eLink from transport.opendata.ch stationboard fields.
 * Primary rule: number === "E" and operator VBG (category is typically "B").
 * Fallback when operator is absent: bus category "B", number "E", destination mentions ETH.
 * Does not match unrelated lines (e.g. tram/bus with other numbers).
 */
export function isElink(row: ElinkLike): boolean {
  const number = norm(row.number).toUpperCase();
  if (number !== "E") return false;

  const operator = norm(row.operator).toUpperCase().replace(/\s+/g, " ");
  if (operator === "VBG" || operator.startsWith("VBG ")) return true;

  // Operator sometimes omitted; require bus + ETH destination to avoid false positives.
  if (!operator) {
    const category = norm(row.category).toUpperCase();
    const dest = norm(row.destination);
    if (category === "B" && /ETH/i.test(dest)) return true;
  }

  return false;
}

/** Map a raw feed line to a display name ("eLink" when detected). */
export function lineDisplayName(row: ElinkLike): string {
  if (isElink(row)) return ELINK_DISPLAY_NAME;
  const number = norm(row.number);
  if (number) return number;
  const name = norm(row.name);
  return name || "?";
}

export function isElinkLine(line: Line): boolean {
  return (
    line.name === ELINK_DISPLAY_NAME ||
    isElink({
      number: line.number,
      operator: line.operator,
      category: line.category,
    })
  );
}

/**
 * Stable sort: eLink departures first (keeping relative order within groups),
 * then by countdown. Safe no-op when no eLink is present.
 */
export function sortDeparturesElinkFirst(departures: Departure[]): Departure[] {
  return [...departures].sort((a, b) => {
    const ae = isElinkLine(a.line) ? 0 : 1;
    const be = isElinkLine(b.line) ? 0 : 1;
    if (ae !== be) return ae - be;
    return a.countdownSeconds - b.countdownSeconds;
  });
}

/** Treat eLink as a bus for mode filters so bus-on does not hide it. */
export function isBusLike(line: Line): boolean {
  if (isElinkLine(line)) return true;
  const cat = norm(line.category).toUpperCase();
  return cat === "B" || cat === "BUS";
}
