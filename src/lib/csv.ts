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
  // Use CRLF for better Excel compatibility on Windows.
  return lines.join("\r\n") + "\r\n";
}

export function makeCsvFile(rows: ScanRow[], filename: string): File {
  const normalizedFilename = filename.normalize("NFC");
  // Add UTF-8 BOM so Excel can reliably detect UTF-8 and show CJK correctly.
  const csv = "\uFEFF" + toCsvRows(rows);
  return new File([csv], normalizedFilename, { type: "text/csv;charset=utf-8" });
}
