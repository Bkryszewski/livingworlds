"use client";
import { useState } from "react";
import type { AIConfig, AIProvider, Lang } from "@/lib/types";
import { aiTest } from "@/lib/aiClient";
import { t } from "@/lib/i18n";

/**
 * AIEngine — the optional "bring your own key" panel.
 *
 * Living Worlds plays free for everyone on authored scripts. Turning the AI
 * engine ON lets a player use their OWN API key for an open, improvised version
 * of the same story. The key lives only in their browser; the studio is never
 * billed. A short walkthrough shows non-technical players how to get a key.
 */

const PROVIDERS: { id: AIProvider; label: string }[] = [
  { id: "anthropic", label: "Anthropic (Claude)" },
  { id: "openai", label: "OpenAI (ChatGPT)" },
  { id: "gemini", label: "Google Gemini" },
  { id: "azure", label: "Azure OpenAI" },
  { id: "custom", label: "Custom / OpenAI-compatible" },
];

const KEY_HELP: Record<AIProvider, { url: string; steps: string[] }> = {
  anthropic: {
    url: "https://console.anthropic.com/settings/keys",
    steps: [
      "Go to console.anthropic.com and sign in (this is the developer console — separate from the Claude chat app).",
      "Add a payment method under Billing, then buy a little credit ($5 is plenty to play).",
      "Open API Keys → Create Key, copy it, and paste it below.",
    ],
  },
  openai: {
    url: "https://platform.openai.com/api-keys",
    steps: [
      "Go to platform.openai.com and sign in (the developer platform — not the ChatGPT app).",
      "Add a payment method and a few dollars of credit under Billing.",
      "Open API keys → Create new secret key, copy it, and paste it below.",
    ],
  },
  gemini: {
    url: "https://aistudio.google.com/app/apikey",
    steps: [
      "Go to aistudio.google.com and sign in with a Google account.",
      "Open Get API key → Create API key.",
      "Copy it and paste it below. (Gemini has a free tier to start.)",
    ],
  },
  azure: {
    url: "https://portal.azure.com",
    steps: [
      "In the Azure portal, open your Azure OpenAI resource.",
      "Copy the Endpoint and a Key, and note your deployment name.",
      "Fill in the endpoint, deployment, and key fields below.",
    ],
  },
  custom: {
    url: "",
    steps: [
      "Use any OpenAI-compatible endpoint (self-hosted, OpenRouter, etc.).",
      "Enter the base URL (everything before /chat/completions) and your key.",
    ],
  },
};

export default function AIEngine({
  lang,
  config,
  onChange,
  onClose,
}: {
  lang: Lang;
  config: AIConfig;
  onChange: (cfg: AIConfig) => void;
  onClose: () => void;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const [testState, setTestState] = useState<string>("");
  const help = KEY_HELP[config.provider];

  function set<K extends keyof AIConfig>(k: K, v: AIConfig[K]) {
    onChange({ ...config, [k]: v });
  }

  async function runTest() {
    setTestState("testing");
    try {
      const r = await aiTest(config);
      setTestState(r ? "ok — " + config.provider + " responded" : "no response — check model/key");
    } catch (e) {
      setTestState("failed — " + (e instanceof Error ? e.message : "check key / provider"));
    }
  }

  return (
    <div className="lw-aiwrap">
      <div className="lw-aihead">
        <div className="lw-aititle">{t(lang, "aiEngine")}</div>
        <button className="lw-aiclose" onClick={onClose} aria-label="close">
          ✕
        </button>
      </div>

      <p className="lw-aiblurb">{t(lang, "aiBlurb")}</p>

      <button
        className={`lw-aitoggle ${config.enabled ? "on" : ""}`}
        onClick={() => set("enabled", !config.enabled)}
      >
        <span className="kn" />
        <span className="lb">
          {config.enabled ? t(lang, "aiOn") : t(lang, "aiOff")}
        </span>
      </button>

      {config.enabled && (
        <div className="lw-aibody">
          <label className="lw-ailabel">{t(lang, "aiProvider")}</label>
          <select
            className="lw-aisel"
            value={config.provider}
            onChange={(e) => {
              set("provider", e.target.value as AIProvider);
              setTestState("");
            }}
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {config.provider === "azure" && (
            <>
              <input
                className="lw-aiin"
                placeholder="Azure endpoint (https://...)"
                value={config.azureEndpoint || ""}
                onChange={(e) => set("azureEndpoint", e.target.value)}
              />
              <input
                className="lw-aiin"
                placeholder="Deployment name"
                value={config.azureDeployment || ""}
                onChange={(e) => set("azureDeployment", e.target.value)}
              />
            </>
          )}
          {config.provider === "custom" && (
            <input
              className="lw-aiin"
              placeholder="Base URL (before /chat/completions)"
              value={config.baseUrl || ""}
              onChange={(e) => set("baseUrl", e.target.value)}
            />
          )}

          <label className="lw-ailabel">{t(lang, "aiKey")}</label>
          <input
            className="lw-aiin"
            type="password"
            placeholder={t(lang, "aiKeyPlaceholder")}
            value={config.key}
            onChange={(e) => set("key", e.target.value)}
          />

          <input
            className="lw-aiin"
            placeholder={t(lang, "aiModelPlaceholder")}
            value={config.model}
            onChange={(e) => set("model", e.target.value)}
          />

          <div className="lw-airow">
            <button className="lw-aibtn" onClick={runTest}>
              {t(lang, "aiTest")}
            </button>
            <button
              className="lw-aibtn ghost"
              onClick={() => setShowHelp((s) => !s)}
            >
              {t(lang, "aiHowTo")}
            </button>
          </div>

          {testState && testState !== "testing" && (
            <div className="lw-aitest">{testState}</div>
          )}
          {testState === "testing" && (
            <div className="lw-aitest">…</div>
          )}

          {showHelp && (
            <div className="lw-aihelp">
              <div className="lw-aihelptitle">{t(lang, "aiHowToTitle")}</div>
              <ol>
                {help.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              {help.url && (
                <a
                  className="lw-ailink"
                  href={help.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {help.url.replace("https://", "")}
                </a>
              )}
              <p className="lw-ainote">{t(lang, "aiKeyNote")}</p>
            </div>
          )}
        </div>
      )}

      {!config.enabled && (
        <p className="lw-ainote">{t(lang, "aiFreeNote")}</p>
      )}
    </div>
  );
}
