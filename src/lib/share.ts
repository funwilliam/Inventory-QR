export async function shareOrDownloadFile(file: File): Promise<"shared" | "downloaded" | "blocked"> {
  const filename = file.name.normalize("NFC");
  const normalizedFile = file.name === filename ? file : new File([file], filename, { type: file.type });
  // Prefer iOS share sheet (Mail / Files / AirDrop).
  const navAny = navigator as any;
  if (navAny?.canShare && navAny.canShare({ files: [normalizedFile] }) && navAny.share) {
    try {
      await navAny.share({
        title: filename,
        text: "盤點結果 CSV",
        files: [normalizedFile],
      });
      return "shared";
    } catch {
      // User canceled or share target failed.
    }
  }

  // Fallback: download (iOS Safari may show a preview first; user can Save to Files).
  try {
    const url = URL.createObjectURL(normalizedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return "downloaded";
  } catch {
    return "blocked";
  }
}
