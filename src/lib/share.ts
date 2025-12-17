export async function shareOrDownloadFile(file: File): Promise<"shared" | "downloaded" | "blocked"> {
  // Prefer iOS share sheet (Mail / Files / AirDrop).
  const navAny = navigator as any;
  if (navAny?.canShare && navAny.canShare({ files: [file] }) && navAny.share) {
    try {
      await navAny.share({
        title: file.name,
        text: "盤點結果 CSV",
        files: [file],
      });
      return "shared";
    } catch {
      // User canceled or share target failed.
    }
  }

  // Fallback: download (iOS Safari may show a preview first; user can Save to Files).
  try {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
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
