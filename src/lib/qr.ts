import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";

export type QrScanCallbacks = {
  onResult: (text: string) => void;
  onError?: (err: unknown) => void;
};

export type QrScannerHandle = {
  stop: () => void;
};

export async function startQrScanner(
  videoEl: HTMLVideoElement,
  cb: QrScanCallbacks
): Promise<QrScannerHandle> {
  const reader = new BrowserMultiFormatReader();

  // Prefer back camera
  const constraints: MediaStreamConstraints = {
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  };

  let controls: IScannerControls | null = null;

  try {
    controls = await reader.decodeFromConstraints(constraints, videoEl, (result, err) => {
      if (result) cb.onResult(result.getText());
      if (err) cb.onError?.(err);
    });
  } catch (e) {
    cb.onError?.(e);
    throw e;
  }

  return {
    stop: () => {
      try { controls?.stop(); } catch {}
      try { reader.reset(); } catch {}
    },
  };
}
