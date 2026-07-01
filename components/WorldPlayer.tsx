"use client";
import { useEffect, useRef, useState } from "react";
import type {
  AIConfig,
  AssistanceLevel,
  ChatMessage,
  Lang,
  ScriptChoice,
  World,
} from "@/lib/types";
import { getScript } from "@/data/scripts";
import { getEvidence } from "@/data/evidence";
import { aiTurn, aiCut } from "@/lib/aiClient";
import { speak, stopSpeaking } from "@/lib/voice";
import CommsPanel from "./CommsPanel";
import EvidenceViewer from "./EvidenceViewer";
import CallScreen from "./CallScreen";

const CUTS: Record<string, { en: string; es: string }> = {
  end_good: {
    en: "You talked her off the edge. Veros capped the pen, lit one small flame, and chose the only wish the world can't bill her for: to become someone who can hold what she wants.",
    es: "La alejaste del borde. Veros tapó la pluma, encendió una pequeña llama y eligió el único deseo que el mundo no puede cobrarle: convertirse en alguien capaz de sostener lo que quiere.",
  },
  end_push: {
    en: "You pushed, and she nearly wrote it. In the end the cost stopped her hand — but you were the voice in the room when she decided what she was willing to spend, and what she wasn't.",
    es: "Empujaste, y casi lo escribe. Al final el precio detuvo su mano — pero fuiste la voz en la sala cuando decidió qué estaba dispuesta a gastar, y qué no.",
  },
  end_live: {
    en: "You were the hand that pulled him back. Rivera surfaced, kept the journal, and carried the truth he'd spent a life refusing — the boy still sixteen, somewhere under the wrong stars.",
    es: "Fuiste la mano que lo trajo de vuelta. Rivera salió a la superficie, guardó el diario y cargó la verdad que pasó la vida negando — el chico aún de dieciséis, en algún lugar bajo las estrellas equivocadas.",
  },
  end_reach: {
    en: "You told him not to lose the boy twice, and he almost stayed. They hauled him out by the harness. He survived it — and is still deciding whether surviving was the same as choosing to live.",
    es: "Le dijiste que no perdiera al chico dos veces, y casi se queda. Lo sacaron por el arnés. Sobrevivió — y todavía decide si sobrevivir fue lo mismo que elegir vivir.",
  },
  end_pie: {
    en: "Seven months for a ball nobody needed — and you got her to sit down anyway. Two strangers on a concrete step, eating meat pies, while the LED on the dead ball blinked out for good.",
    es: "Siete meses por un balón que nadie necesitaba — y aun así lograste que se sentara. Dos desconocidos en un escalón de concreto, comiendo empanadas, mientras el LED del balón muerto se apagaba para siempre.",
  },
  end_report: {
    en: "You sent her up the stairs to file it all — including the part where she buried the notice. The cleanest operation anyone ever signed off on, and the only provable crime was hers.",
    es: "La mandaste a subir a redactarlo todo — incluida la parte donde enterró el aviso. La operación más limpia que alguien aprobó jamás, y el único delito demostrable fue el suyo.",
  },
};

export default function WorldPlayer({
  world,
  roleId,
  assistance,
  lang,
  playerName,
  aiConfig,
  onProgress,
  onComplete,
}: {
  world: World;
  roleId: string;
  assistance: AssistanceLevel;
  lang: Lang;
  playerName: string;
  aiConfig: AIConfig;
  onProgress?: (exchanges: number) => void;
  onComplete: (
    cut: string,
    stats: { trust: number; clues: number; exchanges: number },
    script: string
  ) => void;
}) {
  const role = world.roles.find((r) => r.id === roleId) || world.roles[0];
  const script = getScript(world.id);
  const evidence = getEvidence(world.id);
  // AI mode engages on the toggle alone. With a player key it runs BYOK
  // (browser → provider); without one it uses the studio server route. If
  // neither key exists the first turn returns a clear error instead of
  // silently dropping back to the scripted choices.
  const useAI = aiConfig.enabled;
  const pitch = world.id === "perdido" ? 0.8 : 0.95;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [view, setView] = useState<"comms" | "evidence" | "call">("comms");
  const [mode, setMode] = useState<"text" | "call">("text");
  const [voiceOn, setVoiceOn] = useState(false);
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [exchanges, setExchanges] = useState(0);
  const [evidenceRevealed, setEvidenceRevealed] = useState(false);

  const [nodeId, setNodeId] = useState<string | null>(null);
  const node = script && nodeId ? script.nodes[nodeId] : null;

  // Report progress up so the app can offer a save on a real mid-story exit.
  useEffect(() => {
    onProgress?.(exchanges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchanges]);

  function uniq(a: string[]) { return Array.from(new Set(a)); }
  function clueTitle(id: string): string {
    const c = world.archive.find((x) => x.id === id);
    return c ? c.title : id;
  }
  // Serialize the playthrough into a readable scene — the "new script" the
  // player generated, shown and saved on the Your Cut screen.
  function buildScript(list: ChatMessage[]): string {
    const who = (playerName && playerName.trim()) || "YOU";
    const head = `${world.title.toUpperCase()} — ${role.label.toUpperCase()}\nan interactive playthrough · Legacy Studio Originals\n`;
    const body = list
      .filter((m) => m.role === "character" || m.role === "user")
      .map((m) =>
        m.role === "character"
          ? `${world.character.toUpperCase()}\n    ${m.text}`
          : `${who.toUpperCase()}\n    ${m.text}`
      )
      .join("\n\n");
    return `${head}\n${body}\n\nFADE OUT.`;
  }
  function sayIfVoice(text: string) {
    if (voiceOn && view !== "call") speak(text, pitch);
  }

  // Seed opener once.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const opener = role.opener || world.defaultOpener;
    if (useAI || !script) {
      setMessages([{ role: "character", text: opener }]);
    } else {
      const start = script.nodes[script.start];
      const lines = [opener, ...(start ? start.lines : [])];
      setMessages(lines.map((text) => ({ role: "character", text })));
      if (start?.unlock) setDiscovered((d) => uniq([...d, clueTitle(start.unlock!)]));
      setNodeId(script.start);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => stopSpeaking(), []);

  // ----------------------- SCRIPTED MODE -----------------------
  function chooseScripted(choice: ScriptChoice) {
    if (!script || waiting) return;
    setMessages((m) => [...m, { role: "user", text: choice.label }]);
    setExchanges((n) => n + 1);
    if (choice.unlock) setDiscovered((d) => uniq([...d, clueTitle(choice.unlock!)]));
    const nextNode = script.nodes[choice.to];
    if (!nextNode) return;
    setNodeId(choice.to);
    setWaiting(true);
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        ...nextNode.lines.map((text) => ({ role: "character" as const, text })),
      ]);
      if (nextNode.unlock) {
        const title = clueTitle(nextNode.unlock);
        setDiscovered((d) => uniq([...d, title]));
        setMessages((m) => [...m, { role: "finding", text: "📎 " + title }]);
      }
      sayIfVoice(nextNode.lines.join(" "));
      setWaiting(false);
    }, 600);
  }

  function finishScripted() {
    const coda =
      node && CUTS[node.id]
        ? CUTS[node.id][lang]
        : "The line went quiet. Whatever happened next, you were the one who heard it first.";
    stopSpeaking();
    onComplete(coda, { trust: 70, clues: discovered.length, exchanges }, buildScript(messages));
  }

  // ------------------------- AI MODE ---------------------------
  function buildHistory(list: ChatMessage[]) {
    return list
      .filter((m) => m.role === "user" || m.role === "character")
      .map((m) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.text,
      }));
  }
  function aiCtx(extraDiscovered?: string[]) {
    return {
      cfg: aiConfig, world, role, assistance, lang,
      discovered: extraDiscovered ?? discovered, mode, playerName,
    };
  }
  async function sendAIText(text: string) {
    if (!text || waiting) return;
    const next: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setExchanges((n) => n + 1);
    setWaiting(true);
    try {
      const reply = await aiTurn(aiCtx(), buildHistory(next));
      setMessages([...next, { role: "character", text: reply }]);
      sayIfVoice(reply);
    } catch (e) {
      setMessages([
        ...next,
        { role: "system", text: "signal lost — " + (e instanceof Error ? e.message : "try again") },
      ]);
    } finally {
      setWaiting(false);
    }
  }
  function sendAI() { sendAIText(input.trim()); }

  async function finishAI() {
    setWaiting(true);
    stopSpeaking();
    try {
      const cut = await aiCut(aiCtx(), buildHistory(messages));
      onComplete(cut, { trust: 60, clues: discovered.length, exchanges }, buildScript(messages));
    } catch {
      onComplete(
        "The line went quiet. Whatever happened next, you were the one who heard it first.",
        { trust: 50, clues: discovered.length, exchanges },
        buildScript(messages)
      );
    } finally {
      setWaiting(false);
    }
  }

  // ------------------------- EVIDENCE --------------------------
  function revealEvidence() {
    if (!evidence || evidenceRevealed) return;
    setEvidenceRevealed(true);
    setDiscovered((d) => uniq([...d, evidence.pushTitle]));
    setMessages((m) => [...m, { role: "character", text: evidence.revealLine }]);
    if (voiceOn) speak(evidence.revealLine, pitch);
  }

  // --------------------------- CALL ----------------------------
  function enterCall() { setMode("call"); setView("call"); }
  function exitCall() { setMode("text"); stopSpeaking(); setView("comms"); }

  const lastCharacterLine =
    [...messages].reverse().find((m) => m.role === "character")?.text || "";

  // ----------------------------- VIEWS -------------------------
  if (view === "evidence" && evidence) {
    return (
      <EvidenceViewer
        world={world}
        evidence={evidence}
        lang={lang}
        alreadyRevealed={evidenceRevealed}
        onReveal={revealEvidence}
        onBack={() => setView("comms")}
      />
    );
  }

  if (view === "call") {
    return (
      <CallScreen
        world={world}
        lang={lang}
        caption={lastCharacterLine}
        busy={waiting}
        aiMode={useAI}
        choices={!useAI && node && !node.ending ? node.choices || [] : []}
        onChoice={chooseScripted}
        onSendText={sendAIText}
        onHangup={exitCall}
      />
    );
  }

  const atEnding = !useAI && !!node && !!node.ending;

  return (
    <CommsPanel
      world={world}
      lang={lang}
      messages={messages}
      waiting={waiting}
      aiEnabled={useAI}
      voiceOn={voiceOn}
      hasEvidence={!!evidence}
      input={input}
      setInput={setInput}
      onSend={sendAI}
      onToggleVoice={() => { if (voiceOn) stopSpeaking(); setVoiceOn((v) => !v); }}
      onOpenEvidence={() => setView("evidence")}
      onOpenCall={enterCall}
      choices={!useAI && node && !node.ending ? node.choices || [] : []}
      onChoice={chooseScripted}
      atEnding={atEnding}
      onGenerateCut={useAI ? finishAI : finishScripted}
      canGenerateCut={useAI ? exchanges >= 2 && !waiting : true}
    />
  );
}