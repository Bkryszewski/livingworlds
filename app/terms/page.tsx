// app/terms/page.tsx — Living Worlds Terms of Use (standalone route).
// Personal-use license posture. DRAFT — have counsel review before relying on it.

export const metadata = {
  title: "Terms of Use · Living Worlds",
};

const wrap: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "48px 22px 80px",
  color: "#cfd6e2",
  fontSize: 15,
  lineHeight: 1.7,
};
const h1: React.CSSProperties = { color: "#f5f0df", fontSize: 28, margin: "0 0 6px" };
const h2: React.CSSProperties = { color: "#f5f0df", fontSize: 18, margin: "30px 0 8px" };
const muted: React.CSSProperties = { color: "#9aa0ad", fontSize: 13 };
const a: React.CSSProperties = { color: "#46C7E6" };

export default function TermsPage() {
  return (
    <main style={wrap}>
      <a href="/" style={{ ...a, fontSize: 13 }}>
        ← Back to Living Worlds
      </a>
      <h1 style={{ ...h1, marginTop: 18 }}>Terms of Use</h1>
      <p style={muted}>Effective date: [DATE] · Living Worlds is operated by Legacy Publishing Agency LLC.</p>

      <h2 style={h2}>1. The works</h2>
      <p>
        All worlds, characters, stories, dialogue, and related materials (the
        “Underlying Works”) are original copyrighted works owned exclusively by
        Legacy Publishing Agency LLC and its operating divisions, or licensed to
        it. All rights are reserved.
      </p>

      <h2 style={h2}>2. Content you generate is derivative</h2>
      <p>
        Any story, scene, “cut,” or script you create through the app
        (“Generated Content”) is a derivative work of the Underlying Works. As
        between you and us, all rights in the Underlying Works and in Generated
        Content remain exclusively with Legacy Publishing Agency LLC and/or the
        original author and screenwriter of the relevant work.
      </p>

      <h2 style={h2}>3. Your personal license</h2>
      <p>
        We grant you a limited, personal, non-exclusive, non-transferable,
        non-commercial license to access and enjoy the Generated Content you
        create, for your own personal use. You may not sell, publish,
        distribute, adapt, or commercially exploit any Generated Content or
        Underlying Works without our prior written permission.
      </p>

      <h2 style={h2}>4. Passes and billing</h2>
      <p>
        Access is offered as time-limited passes (for example, a 1-Year Pass or
        a 30-Day Pass). Each pass is a one-time purchase that grants access for
        the stated period and does not automatically renew. Access ends when the
        pass period ends. [State your refund policy here.]
      </p>

      <h2 style={h2}>5. Your account</h2>
      <p>
        You are responsible for your account. Please sign in with a consistent
        email, and use that same email at checkout, so your pass unlocks
        correctly.
      </p>

      <h2 style={h2}>6. Acceptable use</h2>
      <p>
        You agree not to misuse the app, reverse-engineer it, scrape it, or
        attempt to bypass access controls, and not to reproduce or distribute
        the Underlying Works or Generated Content except as permitted above.
      </p>

      <h2 style={h2}>7. Future features</h2>
      <p>
        Additional tiers — such as the Judge’s Credential and the Studio Pass —
        are not yet available. When released, they will be governed by separate
        terms presented at that time.
      </p>

      <h2 style={h2}>8. Termination</h2>
      <p>
        We may suspend or end access for breach of these Terms, including any
        unauthorized use or distribution of our works.
      </p>

      <h2 style={h2}>9. Disclaimers and liability</h2>
      <p>
        The app is provided “as is,” without warranties of any kind. [Standard
        limitation-of-liability and indemnification language to be finalized by
        counsel.]
      </p>

      <h2 style={h2}>10. Governing law</h2>
      <p>These Terms are governed by the laws of the State of Texas.</p>

      <h2 style={h2}>11. Contact</h2>
      <p>
        Legacy Publishing Agency LLC ·{" "}
        <a style={a} href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>
      </p>

      <p style={{ ...muted, marginTop: 32 }}>
        See also our <a style={a} href="/privacy">Privacy Policy</a>.
      </p>
    </main>
  );
}