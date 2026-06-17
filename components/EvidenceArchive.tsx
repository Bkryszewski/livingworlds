"use client";
import { useMemo, useState } from "react";
import type { Clue, Lang, Role, World } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * EvidenceArchive — the role-gated evidence system. Searching surfaces clues
 * that (a) match the query keywords and (b) are permitted by the player's
 * role. Sending a clue passes it back to the conversation as a "finding".
 */
export default function EvidenceArchive({
  world,
  role,
  lang,
  discovered,
  onSend,
  onBack,
}: {
  world: World;
  role: Role;
  lang: Lang;
  discovered: string[];
  onSend: (clue: Clue) => void;
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const allowed = (c: Clue) =>
    role.clueTags.includes("*") ||
    c.tags.some((tag) => role.clueTags.includes(tag));

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return world.archive.filter(
      (c) =>
        allowed(c) &&
        (c.keys.some((k) => q.includes(k) || k.includes(q)) ||
          c.title.toLowerCase().includes(q))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, world, role]);

  return (
    <div className="lw-view">
      <button className="lw-back" onClick={onBack}>
        ← {t(lang, "back")}
      </button>
      <div className="lw-kicker" style={{ color: world.accent, marginTop: 12 }}>
        {t(lang, "evidence")}
      </div>
      <h1 className="lw-title" style={{ marginBottom: 12 }}>
        {t(lang, "archive")}
      </h1>

      <div className="lw-inrow">
        <div className="lw-inpill">
          <input
            value={query}
            placeholder={t(lang, "searchArchive")}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearched(true)}
          />
        </div>
        <button
          className="lw-snd"
          style={{ background: world.accent }}
          onClick={() => setSearched(true)}
          aria-label={t(lang, "search")}
        >
          🔍
        </button>
      </div>

      {searched && results.length === 0 && (
        <p className="lw-sub" style={{ marginTop: 12 }}>
          {t(lang, "noResults")}
        </p>
      )}

      {results.map((c) => (
        <div key={c.id} className="lw-clue" style={{ ["--accent" as string]: world.accent }}>
          <div className="ct" style={{ color: world.accent }}>
            {c.title}
          </div>
          <div className="cb">{c.body}</div>
          <button
            className="csend"
            disabled={discovered.includes(c.title)}
            onClick={() => onSend(c)}
          >
            {discovered.includes(c.title)
              ? "✓ " + t(lang, "evidence")
              : t(lang, "send_to") + " " + world.character + " →"}
          </button>
        </div>
      ))}
      <div style={{ height: 20 }} />
    </div>
  );
}
