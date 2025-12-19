import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AppSettings, ScanRow } from "../types";
import { startQrScanner } from "../lib/qr";
import { beep } from "../lib/beep";

type Props = {
  rows: ScanRow[];
  setRows: React.Dispatch<React.SetStateAction<ScanRow[]>>;
  settings: AppSettings;
  sessionName: string;
  setSessionName: (name: string) => void | Promise<void>;
};

type Flash = { kind: "ok" | "dup"; text: string; ts: number };

export default function ScannerView({ rows, setRows, settings, sessionName, setSessionName }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handleRef = useRef<{ stop: () => void } | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(sessionName);

  const settingsRef = useRef<AppSettings>(settings);
  const seenRef = useRef<Set<string>>(new Set());
  const lastTextRef = useRef<string>("");
  const lastTsRef = useRef<number>(0);

  const seen = useMemo(() => {
    // For quick duplicate check.
    const m = new Set<string>();
    for (const r of rows) m.add(r.code);
    return m;
  }, [rows]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    seenRef.current = seen;
  }, [seen]);

  useEffect(() => {
    if (!isEditingName) setNameDraft(sessionName);
  }, [isEditingName, sessionName]);

  useEffect(() => {
    if (!isEditingName) return;
    const id = window.setTimeout(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(id);
  }, [isEditingName]);

  const total = rows.length;

  function refreshTorchSupport() {
    const stream = (videoRef.current?.srcObject ?? null) as MediaStream | null;
    const track = stream?.getVideoTracks?.()?.[0] ?? null;
    videoTrackRef.current = track;

    if (!track) {
      setTorchSupported(false);
      setTorchOn(false);
      return;
    }

    const caps = (track.getCapabilities?.() ?? {}) as any;
    const supported = !!caps?.torch;
    setTorchSupported(supported);
    if (!supported) setTorchOn(false);
  }

  async function setTorch(nextOn: boolean) {
    const track = videoTrackRef.current;
    if (!track) return;

    try {
      await track.applyConstraints({ advanced: [{ torch: nextOn }] } as any);
      setTorchOn(nextOn);
    } catch {
      setTorchOn(false);
    }
  }

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

          const s = settingsRef.current;

          // Cooldown: ignore rapid repeats of the same code (helps jitter when camera stays on the same QR)
          if (cleaned === lastTextRef.current && now - lastTsRef.current < s.ignoreSameCodeCooldownMs) return;

          lastTextRef.current = cleaned;
          lastTsRef.current = now;

          const isDup = seenRef.current.has(cleaned);

          if (!isDup || !s.uniqueOnly) {
            setRows((prev) => [...prev, { code: cleaned, ts: now }]);
            seenRef.current.add(cleaned);
          }

          setFlash({ kind: isDup ? "dup" : "ok", text: cleaned, ts: now });

          if (s.beep) {
            // Fire-and-forget
            beep(isDup ? "dup" : "ok").catch(() => {});
          }
        },
      });

      // `decodeFromConstraints` attaches the MediaStream to the video element.
      refreshTorchSupport();
      // Some browsers attach `srcObject` async; re-check shortly.
      window.setTimeout(() => {
        if (handleRef.current) refreshTorchSupport();
      }, 150);
    } catch (e) {
      setFlash({ kind: "dup", text: "相機啟動失敗：請確認 HTTPS / 相機權限", ts: Date.now() });
      stop();
    }
  }

  function stop() {
    try {
      // Best-effort: turn off torch before releasing the track.
      if (torchOn) setTorch(false).catch(() => {});
      handleRef.current?.stop();
    } finally {
      handleRef.current = null;
      setIsRunning(false);
      videoTrackRef.current = null;
      setTorchSupported(false);
      setTorchOn(false);
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

  async function commitSessionName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      const fallbackName = "未命名盤點";
      setNameDraft(fallbackName);
      await setSessionName(fallbackName);
      setIsEditingName(false);
      return;
    }

    await setSessionName(trimmed);
    setIsEditingName(false);
  }

  const modeLabel = settings.uniqueOnly ? "去重模式" : "允許重複";

  return (
    <div className="px-4 pb-24 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-300">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                onBlur={() => {
                  void commitSessionName();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setNameDraft(sessionName);
                    setIsEditingName(false);
                  }
                }}
                className="min-w-0 w-40 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                aria-label="Session name"
              />
              <span className="text-xs text-slate-400">{modeLabel}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="font-semibold text-white truncate"
              >
                {sessionName}
              </button>
              <span className="text-xs text-slate-400">{modeLabel}</span>
            </div>
          )}
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

          {isRunning && torchSupported ? (
            <button
              type="button"
              onClick={() => setTorch(!torchOn)}
              className={[
                "absolute right-3 bottom-3 rounded-xl px-3 py-2 text-sm font-semibold",
                "border border-white/15 backdrop-blur active:scale-[0.99]",
                torchOn ? "bg-amber-400/90 text-slate-950" : "bg-slate-900/70 text-white",
              ].join(" ")}
              aria-pressed={torchOn}
              aria-label={torchOn ? "關閉手電筒" : "開啟手電筒"}
            >
              {torchOn ? "手電筒：開" : "手電筒：關"}
            </button>
          ) : null}

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
            setRows((prev) => prev.slice(0, -1));
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
