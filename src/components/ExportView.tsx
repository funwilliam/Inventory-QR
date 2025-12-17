import React, { useMemo, useState } from "react";
import type { ScanRow } from "../types";
import { makeCsvFile } from "../lib/csv";
import { shareOrDownloadFile } from "../lib/share";

type Props = {
  rows: ScanRow[];
  sessionName: string;
};

function safeFilename(s: string) {
  return s.replace(/[^a-zA-Z0-9-_\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]+/g, "_").slice(0, 48) || "inventory";
}

export default function ExportView({ rows, sessionName }: Props) {
  const [status, setStatus] = useState<string>("");

  const filename = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
    return `inventory-${safeFilename(sessionName)}-${stamp}.csv`;
  }, [sessionName]);

  return (
    <div className="px-4 pb-24 pt-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="text-sm text-slate-300">匯出檔名</div>
        <div className="mt-1 font-mono text-sm break-all">{filename}</div>

        <div className="mt-3 text-sm text-slate-300">
          共 <span className="font-semibold text-white">{rows.length}</span> 筆
        </div>

        <button
          disabled={rows.length === 0}
          onClick={async () => {
            setStatus("");
            const file = makeCsvFile(rows, filename);
            const r = await shareOrDownloadFile(file);
            if (r === "shared") setStatus("已開啟分享面板（建議直接選 Mail 寄出）。");
            else if (r === "downloaded") setStatus("已觸發下載（若顯示預覽，可用「分享」→「儲存到檔案」。）");
            else setStatus("無法匯出：可能被瀏覽器阻擋，請改用 Safari 開啟或再次嘗試。");
          }}
          className={[
            "mt-4 w-full rounded-2xl px-4 py-4 text-base font-semibold active:scale-[0.99]",
            rows.length === 0 ? "bg-slate-800 text-slate-500" : "bg-sky-600 text-white",
          ].join(" ")}
        >
          匯出 CSV（分享 / 下載）
        </button>

        {status ? <div className="mt-3 text-xs text-slate-400">{status}</div> : null}
      </div>

      <div className="mt-4 text-xs text-slate-400 leading-relaxed">
        建議流程（iOS）：<br />
        1) 點「匯出 CSV」→ 直接選「郵件」寄給同仁；或選「儲存到檔案」後再從 Files 附加。<br />
        2) 長時間掃描（數百～上千次）建議每隔一段時間先匯出一次，避免意外清除快取造成資料損失。
      </div>
    </div>
  );
}
