import React from "react";

export type TabKey = "scan" | "list" | "export" | "settings";

const TABS: { key: TabKey; label: string }[] = [
  { key: "scan", label: "掃描" },
  { key: "list", label: "清單" },
  { key: "export", label: "匯出" },
  { key: "settings", label: "設定" },
];

export default function TabBar({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  return (
    <div className="safe-pb safe-px px-2 pb-2 pt-2 border-t border-slate-800 bg-slate-950/90 backdrop-blur fixed bottom-0 left-0 right-0 z-30">
      <div className="grid grid-cols-4 gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "rounded-xl px-2 py-2 text-sm font-medium",
              tab === t.key ? "bg-slate-800 text-white" : "bg-slate-900 text-slate-300",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
