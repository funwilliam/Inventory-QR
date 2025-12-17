import { get, set } from "idb-keyval";
import type { ScanRow, AppSettings } from "../types";

const K_ROWS = "rows_v1";
const K_SETTINGS = "settings_v1";
const K_SESSION = "session_name_v1";

const DEFAULT_SETTINGS: AppSettings = {
  uniqueOnly: true,
  ignoreSameCodeCooldownMs: 1200,
  beep: true,
};

export async function loadRows(): Promise<ScanRow[]> {
  return (await get(K_ROWS)) ?? [];
}

export async function saveRows(rows: ScanRow[]): Promise<void> {
  await set(K_ROWS, rows);
}

// Buffered persistence to avoid hammering IndexedDB on every scan.
let pending: ScanRow[] | null = null;
let flushTimer: number | null = null;

export function stageRowsAndFlushSoon(rows: ScanRow[], delayMs = 800) {
  pending = rows;
  if (flushTimer) window.clearTimeout(flushTimer);
  flushTimer = window.setTimeout(async () => {
    if (!pending) return;
    const r = pending;
    pending = null;
    flushTimer = null;
    await saveRows(r);
  }, delayMs);
}

export async function loadSettings(): Promise<AppSettings> {
  const s = (await get(K_SETTINGS)) as AppSettings | undefined;
  return { ...DEFAULT_SETTINGS, ...(s ?? {}) };
}

export async function saveSettings(s: AppSettings): Promise<void> {
  await set(K_SETTINGS, s);
}

export async function loadSessionName(): Promise<string> {
  return (await get(K_SESSION)) ?? "未命名盤點";
}

export async function saveSessionName(name: string): Promise<void> {
  await set(K_SESSION, name);
}
