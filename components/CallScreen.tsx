"use client";
import { useEffect, useRef, useState } from "react";
import type { Lang, ScriptChoice, World } from "@/lib/types";
import { t } from "@/lib/i18n";
import { speak, stopSpeaking, listen, speechRecogSupported, type Recognizer } from "@/lib/voice";

/**
 * CallScreen — the FaceTime-style live call, ported from the prototype.
 * The protagonist's lines are read aloud (TTS). In AI mode the player can
 * hold-to-talk (speech recognition) or type; in scripted mode they pick the
 * authored choices. Speaker can be muted; hang up returns to comms.
 */
export default function CallScreen({
  world,
  lang,
  caption,
  busy,
  aiMode,
  choices,
  onChoice,
  onSendText,
  onHangup,
}: {
  world: World;
  lang: Lang;
  caption: string;
  busy: boolean;
  aiMode: boolean;
  choices: ScriptChoice[];
  onChoice: (c: ScriptChoice) => void;
  onSendText: (text: string) => void;
  onHangup: () => void;
}) {
  const pitch = world.id === "perdido" ? 0.8 : 0.95;
  const [voiceOn, setVoiceOn] = useState(true);
  const [typed, setTyped] = useState("");
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const recRef = useRef<Recognizer | null>(null);
  const heardRef = useRef("");
  const canTalk = aiMode && !!speechRecogSupported;

  // Read each new caption aloud.
  const last = useRef("");
  useEffect(() => {
    if (voiceOn && caption && caption !== last.current) {
      last.current = caption;
      speak(caption, pitch);
    }
  }, [caption, voiceOn, pitch]);

  useEffect(() => () => stopSpeaking(), []);

  function startTalk() {
    if (busy) return;
    stopSpeaking();
    heardRef.current = "";
    setHeard("");
    const r = listen(
      lang,
      (txt) => {
        heardRef.current = txt;
        setHeard(txt);
      },
      () => setListening(false)
    );
    if (r) {
      recRef.current = r;
      setListening(true);
    }
  }
  function stopTalk() {
    if (recRef.current) recRef.current.stop();
    recRef.current = null;
    setListening(false);
    const said = heardRef.current.trim();
    heardRef.current = "";
    setHeard("");
    if (said) onSendText(said);
  }

  function hangup() {
    stopSpeaking();
    if (recRef.current) recRef.current.stop();
    onHangup();
  }

  return (
    <div className="lw-call" style={{ ["--accent" as string]: world.accent }}>
      <div className="lw-feed">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={world.poster} alt={world.character} />
        <div className="cscrim" />
      </div>

      <div className="lw-callmeta">
        <div className="nm">{world.character}</div>
        <div className="st">Living Worlds · {world.title}</div>
      </div>

      <div className={"lw-cap" + (busy ? " wait" : "")}>
        {listening
          ? "🎙 " + (heard || t(lang, "listening"))
          : busy
          ? t(lang, "connecting")
          : caption}
      </div>

      {/* scripted choices inside the call */}
      {!aiMode && !busy && choices.length > 0 && (
        <div className="lw-callchoices">
          {choices.map((c, i) => (
            <button key={i} className="lw-callchoice" onClick={() => onChoice(c)}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="lw-callctl">
        <button
          className={"lw-rnd spk" + (voiceOn ? " on" : "")}
          onClick={() => {
            if (voiceOn) stopSpeaking();
            setVoiceOn((v) => !v);
          }}
          title={t(lang, "hearAloud")}
        >
          🔊
        </button>

        {aiMode &&
          (canTalk ? (
            <button
              className={"lw-talk" + (listening ? " live" : "")}
              onPointerDown={startTalk}
              onPointerUp={stopTalk}
              onPointerCancel={stopTalk}
              disabled={busy}
            >
              🎙 <span>{listening ? t(lang, "releaseToSend") : t(lang, "holdToTalk")}</span>
            </button>
          ) : (
            <input
              className="lw-callinput"
              placeholder={t(lang, "saySomething")}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && typed.trim() && !busy) {
                  onSendText(typed.trim());
                  setTyped("");
                }
              }}
              disabled={busy}
            />
          ))}

        <button className="lw-rnd end" onClick={hangup} title={t(lang, "hangUp")}>
          ✕
        </button>
      </div>

      {aiMode && canTalk && (
        <div className="lw-callsub">{t(lang, "holdBarHint")}</div>
      )}
      {aiMode && !canTalk && (
        <div className="lw-callsub dim">{t(lang, "noVoiceInput")}</div>
      )}
    </div>
  );
}
