// lib/voice.ts — browser voice helpers, ported from the prototype.
//   speak()      — reads a line aloud in the protagonist's voice (TTS)
//   listen()     — push-to-talk speech recognition (hold to talk)
// These use the Web Speech API and only run in the browser. They require a
// real page (https or localhost), so they won't work from a file:// preview.

export const speechSynthSupported =
  typeof window !== "undefined" && "speechSynthesis" in window;

export const speechRecogSupported =
  typeof window !== "undefined" &&
  // @ts-expect-error vendor-prefixed
  (window.SpeechRecognition || window.webkitSpeechRecognition);

/** Read a line aloud. pitch < 1 = lower/masculine, ~1 = neutral/feminine. */
export function speak(text: string, pitch = 0.95) {
  if (!speechSynthSupported || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.96;
    u.pitch = pitch;
    const voices = window.speechSynthesis.getVoices();
    const want =
      pitch < 0.9
        ? /male|daniel|alex|fred|diego/i
        : /female|woman|samantha|zira|aria|paloma|monica/i;
    const v = voices.find((x) => want.test(x.name)) || voices[0];
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

export function stopSpeaking() {
  if (speechSynthSupported) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

export interface Recognizer {
  stop: () => void;
}

/**
 * Start push-to-talk recognition. onInterim fires with live text; the returned
 * handle's stop() ends capture. Call onEnd-style handling via onInterim's last
 * value before stop. Returns null if unsupported.
 */
export function listen(
  lang: "en" | "es",
  onInterim: (text: string) => void,
  onError?: (err: string) => void
): Recognizer | null {
  // @ts-expect-error vendor-prefixed
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  try {
    const rec = new SR();
    rec.lang = lang === "es" ? "es-ES" : "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      let t = "";
      for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript;
      onInterim(t);
    };
    rec.onerror = (ev: { error: string }) => {
      if (onError) onError(ev.error);
    };
    rec.start();
    return { stop: () => { try { rec.stop(); } catch { /* ignore */ } } };
  } catch {
    return null;
  }
}
