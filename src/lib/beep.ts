let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export async function beep(kind: "ok" | "dup" = "ok") {
  const c = ctx();
  // iOS: must be triggered by a user gesture at least once.
  if (c.state === "suspended") await c.resume();

  const o = c.createOscillator();
  const g = c.createGain();

  // Frequencies chosen to be distinct but not annoying.
  o.frequency.value = kind === "ok" ? 880 : 220;
  o.type = "sine";

  g.gain.value = 0.0001;

  o.connect(g);
  g.connect(c.destination);

  const now = c.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);

  o.start(now);
  o.stop(now + 0.12);
}
