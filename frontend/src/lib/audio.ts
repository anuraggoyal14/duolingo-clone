// Feedback sounds are synthesized with the Web Audio API (no audio assets needed), and
// exercise audio uses the browser's built-in text-to-speech.

const SOUND_KEY = "sound-effects";

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
  } catch {
    /* ignore */
  }
}

let audioContext: AudioContext | null = null;

function tone(frequency: number, start: number, duration: number, type: OscillatorType = "sine", gain = 0.15) {
  if (!audioContext) audioContext = new AudioContext();
  const ctx = audioContext;
  const osc = ctx.createOscillator();
  const volume = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  volume.gain.setValueAtTime(gain, ctx.currentTime + start);
  volume.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
  osc.connect(volume).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration);
}

export function playSound(kind: "correct" | "wrong" | "complete") {
  if (!soundEnabled()) return;
  try {
    if (kind === "correct") {
      tone(880, 0, 0.12);
      tone(1320, 0.1, 0.2);
    } else if (kind === "wrong") {
      tone(220, 0, 0.18, "square", 0.06);
      tone(180, 0.15, 0.25, "square", 0.06);
    } else {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, "triangle"));
    }
  } catch {
    /* audio not available (e.g. autoplay policy): stay silent */
  }
}

const VOICE_LANG: Record<string, string> = { es: "es-ES", en: "en-US" };

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, lang: string) {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = VOICE_LANG[lang] ?? lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
