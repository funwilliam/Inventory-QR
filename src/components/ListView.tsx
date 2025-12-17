import React, { useMemo, useState } from "react";
import type { ScanRow } from "../types";

type Props = {
  rows: ScanRow[];
  setRows: React.Dispatch<React.SetStateAction<ScanRow[]>>;
};

function fmt(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("zh-Hant", { hour12: false });
}

export default function ListView({ rows, setRows }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim();
    if (!s) return rows;
    return rows.filter((r) => r.code.includes(s));
  }, [rows, q]);

  return (
    <div className="px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋掃描字串…"
          className="flex-1 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm outline-none focus:border-slate-600"
        />
        <button
          onClick={() => {
            if (!confirm("確定要清空所有掃描紀錄？此動作無法復原。")) return;
            setRows([]);
          }}
          className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold"
        >
          清空
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        共 <span className="font-semibold text-white">{rows.length}</span> 筆（顯示 {filtered.length} 筆）
      </div>

      <div className="mt-3 space-y-2">
        {filtered.slice().reverse().map((r, idx) => (
          <div key={`${r.ts}-${idx}`} className="rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2">
            <div className="text-sm font-mono break-all">{r.code}</div>
            <div className="mt-1 text-xs text-slate-400">{fmt(r.ts)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
