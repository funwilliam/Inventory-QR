export type ScanRow = {
  code: string;
  ts: number; // epoch ms
};

export type AppSettings = {
  uniqueOnly: boolean;          // default true
  ignoreSameCodeCooldownMs: number; // default 1200ms
  beep: boolean;               // default true
};
