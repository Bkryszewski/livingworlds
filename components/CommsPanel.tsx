"use client";
import { useEffect, useRef } from "react";
import type { ChatMessage, Lang, ScriptChoice, World } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * CommsPanel — the live transcript with the in-world character. Actions:
 * open the Evidence the character sent, jump to the live Call (voice), and
 * toggle read-aloud. Scripted mode renders authored choice buttons; AI mode
 * renders the free-text bar.
 */
export default function CommsPanel({
  world,
  lang,
  messages,
  waiting,
  aiEnabled,
  voiceOn,
  hasEvidence,
  input,
  setInput,
  onSend,
  onToggleVoice,
  onOpenEvidence,
  onOpenCall,
  choices,
  onChoice,
  atEnding,
  onGenerateCut,
  canGenerateCut,
}: {
  world: World;
  lang: Lang;
  messages: ChatMessage[];
  waiting: boolean;
  aiEnabled: boolean;
  voiceOn: boolean;
  hasEvidence: boolean;
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onToggleVoice: () => void;
  onOpenEvidence: () => void;
  onOpenCall: () => void;
  choices: ScriptChoice[];
  onChoice: (c: ScriptChoice) => void;
  atEnding: boolean;
  onGenerateCut: () => void;
  canGenerateCut: boolean;
}) {
  const threadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, waiting, choices]);

  const accent = world.accent;

  return (
    <div className="lw-view" style={{ ["--accent" as string]: accent }}>
      <div className="lw-msgbar">
        <div className="av">{world.character.charAt(0)}</div>
        <div>
          <div className="nm">{world.character}</div>
          <div className="st" style={{ color: accent }}>{t(lang, "online")}</div>
        </div>
      </div>

      <div className="lw-thread" ref={threadRef}>
        {messages.map((m, i) => {
          if (m.role === "system") return <div key={i} className="lw-bub sys">{m.text}</div>;
          if (m.role === "finding") return <div key={i} className="lw-bub find">{m.text}</div>;
          return (
            <div
              key={i}
              className={`lw-bub ${m.role === "user" ? "u" : "v"}`}
              style={m.role === "user" ? { ["--accent" as string]: accent } : undefined}
            >
              {m.text}
            </div>
          );
        })}
        {waiting && <div className="lw-typing"><i /><i /><i /></div>}
      </div>

      <div className="lw-actions">
        {hasEvidence && (
          <button className="lw-act" onClick={onOpenEvidence}>📂 {t(lang, "evidence")}</button>
        )}
        <button className="lw-act" onClick={onOpenCall}>📞 {t(lang, "call")}</button>
        <button className={"lw-act" + (voiceOn ? " on" : "")} onClick={onToggleVoice}>
          {voiceOn ? "🔊" : "🔈"} {t(lang, "voice")}
        </button>
        {aiEnabled && (
          <button className="lw-act" onClick={onGenerateCut} disabled={!canGenerateCut}>
            🎬 {t(lang, "generateCut")}
          </button>
        )}
      </div>

      {!aiEnabled && (
        <div className="lw-choices">
          {!atEnding && !waiting &&
            choices.map((c, i) => (
              <button
                key={i}
                className="lw-choice"
                style={{ ["--accent" as string]: accent }}
                onClick={() => onChoice(c)}
              >
                {c.label}
              </button>
            ))}
          {atEnding && !waiting && (
            <button className="lw-choice end" style={{ background: accent }} onClick={onGenerateCut}>
              🎬 {t(lang, "generateCut")}
            </button>
          )}
        </div>
      )}

      {aiEnabled && (
        <div className="lw-inrow">
          <div className="lw-inpill">
            <input
              value={input}
              placeholder={t(lang, "typeMessage")}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !waiting && onSend()}
            />
          </div>
          <button
            className="lw-snd"
            style={{ background: accent }}
            disabled={waiting || !input.trim()}
            onClick={onSend}
            aria-label={t(lang, "send")}
          >
            ↑
          </button>
        </div>
      )}
    </div>
  );
}
