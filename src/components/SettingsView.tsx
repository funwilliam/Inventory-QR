import React, { useEffect, useState } from "react";
import type { AppSettings } from "../types";

type Props = {
  sessionName: string;
  setSessionName: (s: string) => void;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
};

export default function SettingsView({ sessionName, setSessionName, settings, setSettings }: Props) {
  const [tmpName, setTmpName] = useState(sessionName);

  useEffect(() => setTmpName(sessionName), [sessionName]);

  return (
    <div className="px-4 pb-24 pt-4 space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="text-sm font-semibold">盤點批次名稱</div>
        <div className="mt-2 flex gap-2">
          <input
            value={tmpName}
            onChange={(e) => setTmpName(e.target.value)}
            className="flex-1 rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm outline-none focus:border-slate-600"
            placeholder="例如：倉庫A-12月盤點"
          />
          <button
            onClick={() => setSessionName(tmpName.trim() || "未命名盤點")}
            className="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold"
          >
            保存
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="text-sm font-semibold">掃描行為</div>

        <label className="mt-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm">去重模式（建議）</div>
            <div className="text-xs text-slate-400">同一個 QR 再次掃到會提示「已掃過」，但不會新增一筆。</div>
          </div>
          <input
            type="checkbox"
            checked={settings.uniqueOnly}
            onChange={(e) => setSettings({ ...settings, uniqueOnly: e.target.checked })}
            className="h-6 w-6"
          />
        </label>

        <label className="mt-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm">提示音</div>
            <div className="text-xs text-slate-400">成功 / 重複使用不同音高。</div>
          </div>
          <input
            type="checkbox"
            checked={settings.beep}
            onChange={(e) => setSettings({ ...settings, beep: e.target.checked })}
            className="h-6 w-6"
          />
        </label>

        <div className="mt-4">
          <div className="text-sm">同碼冷卻（ms）</div>
          <div className="text-xs text-slate-400">避免鏡頭停在同一張 QR 上導致重複觸發（預設 1200ms）。</div>
          <input
            type="range"
            min={300}
            max={3000}
            step={100}
            value={settings.ignoreSameCodeCooldownMs}
            onChange={(e) => setSettings({ ...settings, ignoreSameCodeCooldownMs: Number(e.target.value) })}
            className="mt-2 w-full"
          />
          <div className="mt-1 text-xs font-mono text-slate-300">{settings.ignoreSameCodeCooldownMs}ms</div>
        </div>
      </div>

      <div className="text-xs text-slate-400 leading-relaxed">
        注意：相機掃描需要 HTTPS（安全上下文）。若你用內網臨時部署，務必用有效憑證或在 iPhone 上信任自簽憑證後再安裝 PWA。
      </div>
    </div>
  );
}
