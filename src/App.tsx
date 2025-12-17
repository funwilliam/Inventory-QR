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

  const title = tab === "scan" ? "掃描" : tab === "list" ? "清單" : tab === "export" ? "匯出" : "設定";
  const subtitle =
    tab === "scan"
      ? `已記錄 ${rows.length} 筆`
      : tab === "list"
      ? `可搜尋 / 清空`
      : tab === "export"
      ? `分享或下載 CSV`
      : `批次與掃描行為`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <TopBar title={title} subtitle={subtitle} right={<div className="text-xs text-slate-400">{sessionName}</div>} />

      {tab === "scan" ? (
        <ScannerView rows={rows} setRows={setRows} settings={settings} sessionName={sessionName} />
      ) : tab === "list" ? (
        <ListView rows={rows} setRows={setRows} />
      ) : tab === "export" ? (
        <ExportView rows={rows} sessionName={sessionName} />
      ) : (
        <SettingsView sessionName={sessionName} setSessionName={setSessionName} settings={settings} setSettings={setSettings} />
      )}

      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}
