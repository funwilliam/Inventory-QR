import type { ScanRow } from "../types";

function escapeCsvCell(v: string): string {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function toCsvRows(rows: ScanRow[]): string {
  // Keep it simple: each scan is a row (timestamp + code).
  // If you want aggregated counts, do it in Excel/Python after export.
  const header = ["timestamp_iso", "code"];
  const lines = [header.join(",")];

  for (const r of rows) {
    const iso = new Date(r.ts).toISOString();
    lines.push([escapeCsvCell(iso), escapeCsvCell(r.code)].join(","));
  }
  return lines.join("\n") + "\n";
}

export function makeCsvFile(rows: ScanRow[], filename: string): File {
  const csv = toCsvRows(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  return new File([blob], filename, { type: "text/csv" });
}
