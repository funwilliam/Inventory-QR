import React, { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import TabBar, { type TabKey } from "./components/TabBar";
import ScannerView from "./components/ScannerView";
import ListView from "./components/ListView";
import ExportView from "./components/ExportView";
import SettingsView from "./components/SettingsView";
import type { AppSettings, ScanRow } from "./types";
import { loadRows, loadSessionName, loadSettings, saveSessionName, saveSettings, stageRowsAndFlushSoon } from "./lib/storage";

export default function App() {
  const [tab, setTab] = useState<TabKey>("scan");

  const [rows, setRows] = useState<ScanRow[]>([]);
  const [sessionName, setSessionNameState] = useState("未命名盤點");
  const [settings, setSettingsState] = useState<AppSettings>({
    uniqueOnly: true,
    ignoreSameCodeCooldownMs: 1200,
    beep: true,
  });

  // Hydrate from IndexedDB
  useEffect(() => {
    (async () => {
      setRows(await loadRows());
      setSessionNameState(await loadSessionName());
      setSettingsState(await loadSettings());
    })().catch(() => {});
  }, []);

  // Persist rows (buffered)
  useEffect(() => {
    stageRowsAndFlushSoon(rows);
  }, [rows]);

  async function setSessionName(name: string) {
    setSessionNameState(name);
    await saveSessionName(name);
  }

  async function setSettings(s: AppSettings) {
    setSettingsState(s);
    await saveSettings(s);
  }

  const titleByTab: Record<TabKey, string> = {
    scan: "掃描",
    list: "清單",
    export: "匯出",
    settings: "設定",
  };
  const subtitleByTab: Record<TabKey, string> = {
    scan: "讀取條碼",
    list: "可搜尋 / 清空",
    export: "分享或下載 CSV",
    settings: "批次與掃描行為",
  };

  const title = titleByTab[tab];
  const subtitle = subtitleByTab[tab];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto w-full max-w-[440px]">
        <TopBar title={title} subtitle={subtitle} />

        {tab === "scan" ? (
          <ScannerView rows={rows} setRows={setRows} settings={settings} sessionName={sessionName} setSessionName={setSessionName} />
        ) : tab === "list" ? (
          <ListView rows={rows} setRows={setRows} />
        ) : tab === "export" ? (
          <ExportView rows={rows} sessionName={sessionName} />
        ) : (
          <SettingsView sessionName={sessionName} setSessionName={setSessionName} settings={settings} setSettings={setSettings} />
        )}
      </div>

      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}
