import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AppSettings, ScanRow } from "../types";
import { startQrScanner } from "../lib/qr";
import { beep } from "../lib/beep";

type Props = {
  rows: ScanRow[];
  setRows: (rows: ScanRow[]) => void;
  settings: AppSettings;
  sessionName: string;
};

type Flash = { kind: "ok" | "dup"; text: string; ts: number };

export default function ScannerView({ rows, setRows, settings, sessionName }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handleRef = useRef<{ stop: () => void } | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [lastText, setLastText] = useState<string>("");
  const [lastTs, setLastTs] = useState<number>(0);

  const seen = useMemo(() => {
    // For quick duplicate check.
    const m = new Set<string>();
    for (const r of rows) m.add(r.code);
    return m;
  }, [rows]);

  const total = rows.length;

  async function start() {
    if (!videoRef.current) return;
    if (handleRef.current) return;

    setIsRunning(true);

    try {
      handleRef.current = await startQrScanner(videoRef.current, {
        onResult: (text) => {
          const now = Date.now();
          const cleaned = text.trim();
          if (!cleaned) return;

          // Cooldown: ignore rapid repeats of the same code (helps jitter when camera stays on the same QR)
          if (cleaned === lastText && now - lastTs < settings.ignoreSameCodeCooldownMs) return;

          setLastText(cleaned);
          setLastTs(now);

          const isDup = seen.has(cleaned);

          if (!isDup || !settings.uniqueOnly) {
            setRows([...rows, { code: cleaned, ts: now }]);
          }

          setFlash({ kind: isDup ? "dup" : "ok", text: cleaned, ts: now });

          if (settings.beep) {
            // Fire-and-forget
            beep(isDup ? "dup" : "ok").catch(() => {});
          }
        },
      });
    } catch (e) {
      setFlash({ kind: "dup", text: "相機啟動失敗：請確認 HTTPS / 相機權限", ts: Date.now() });
      stop();
    }
  }

  function stop() {
    try {
      handleRef.current?.stop();
    } finally {
      handleRef.current = null;
      setIsRunning(false);
    }
  }

  // Stop camera when leaving page (or when component unmounts)
  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-clear flash
  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 900);
    return () => window.clearTimeout(t);
  }, [flash]);

  const modeLabel = settings.uniqueOnly ? "去重模式" : "允許重複";

  return (
    <div className="px-4 pb-24 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-300">
          <span className="font-semibold text-white">{sessionName}</span>
          <span className="ml-2 text-xs text-slate-400">{modeLabel}</span>
        </div>
        <div className="text-sm">
          <span className="text-slate-400">已記錄</span> <span className="font-semibold">{total}</span>
        </div>
      </div>

      <div className="mt-3 rounded-2xl overflow-hidden border border-slate-800 bg-black">
        <div className="relative">
          <video ref={videoRef} className="w-full aspect-[3/4] object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-2xl border-2 border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>

          {flash ? (
            <div
              className={[
                "absolute left-3 right-3 top-3 rounded-xl px-3 py-2 text-sm font-semibold",
                flash.kind === "ok" ? "bg-emerald-600/90" : "bg-amber-600/90",
              ].join(" ")}
            >
              {flash.kind === "ok" ? "已記錄：" : "已掃過："} {flash.text}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {!isRunning ? (
          <button
            onClick={start}
            className="rounded-2xl bg-emerald-600 px-4 py-4 text-base font-semibold active:scale-[0.99]"
          >
            開始掃描
          </button>
        ) : (
          <button
            onClick={stop}
            className="rounded-2xl bg-slate-700 px-4 py-4 text-base font-semibold active:scale-[0.99]"
          >
            暫停
          </button>
        )}

        <button
          onClick={() => {
            if (rows.length === 0) return;
            // Undo last recorded row
            setRows(rows.slice(0, -1));
            setFlash({ kind: "dup", text: "已復原上一筆", ts: Date.now() });
          }}
          className="rounded-2xl bg-slate-900 border border-slate-700 px-4 py-4 text-base font-semibold active:scale-[0.99]"
        >
          復原上一筆
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-400 leading-relaxed">
        小技巧：掃描時不需要點任何按鈕。保持鏡頭對準 QR（框內），成功後會顯示「已記錄 / 已掃過」。
        若 iOS 回到背景再切回導致相機怪怪的，請先按「暫停」再「開始掃描」。
      </div>
    </div>
  );
}
