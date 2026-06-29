// app/privacy/page.tsx — Living Worlds Privacy Policy (standalone route).
// Plain, readable policy. DRAFT — have counsel review before relying on it.

export const metadata = {
  title: "Privacy Policy · Living Worlds",
};

const wrap: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "48px 22px 80px",
  color: "#cfd6e2",
  fontSize: 15,
  lineHeight: 1.7,
};
const h1: React.CSSProperties = {
  color: "#f5f0df",
  fontSize: 28,
  margin: "0 0 6px",
};
const h2: React.CSSProperties = {
  color: "#f5f0df",
  fontSize: 18,
  margin: "30px 0 8px",
};
const muted: React.CSSProperties = { color: "#9aa0ad", fontSize: 13 };
const a: React.CSSProperties = { color: "#46C7E6" };

export default function PrivacyPage() {
  return (
    <main style={wrap}>
      <a href="/" style={{ ...a, fontSize: 13 }}>
        ← Back to Living Worlds
      </a>
      <h1 style={{ ...h1, marginTop: 18 }}>Privacy Policy</h1>
      <p style={muted}>Effective date: June 28, 2026 · Living Worlds is operated by Legacy Publishing Agency LLC.</p>

      <h2 style={h2}>1. Information we collect</h2>
      <p>
        <strong>Account information:</strong> your name and email address, used
        to sign you in through a one-time email link.
        <br />
        <strong>Preferences:</strong> your language choice (English or Spanish).
        <br />
        <strong>Gameplay data:</strong> the worlds you play, your progress, and
        the scenes or “cuts” you generate.
        <br />
        <strong>Usage and analytics data:</strong> basic information about how
        the app is used — such as pages visited, device and browser type, and
        anonymized interaction patterns (including aggregated heatmaps and
        session activity) — collected to help us understand and improve the
        experience.
        <br />
        <strong>Purchase information:</strong> when you buy a pass, our payment
        processor collects your payment details. We do not see or store your
        full card information.
      </p>

      <h2 style={h2}>2. How we use your information</h2>
      <p>
        We use your information only to operate and improve Living Worlds —
        specifically to create and secure your account, sign you in, save your
        progress and generated cuts, provide access to passes you purchase, send
        you essential communications about updates, upgrades, rules, and policy
        changes, and respond to your support requests.
      </p>

      <h2 style={h2}>3. Analytics and improving your experience</h2>
      <p>
        We use analytics and product-improvement tools — currently Vercel
        Analytics and Microsoft Clarity — to understand how people use Living
        Worlds so we can make it better. These tools collect aggregated usage
        metrics and may record anonymized session activity and heatmaps (for
        example, which areas people tap or scroll). We use this only to improve
        usability, performance, and the overall experience. We do not use it to
        advertise to you, and we do not sell this information. These tools may
        set cookies or similar technologies in your browser to function.
      </p>

      <h2 style={h2}>4. What we do not do</h2>
      <p>
        We do not sell, rent, or trade your personal information to third
        parties, and we do not use it for third-party advertising. Your
        information is used to run the app, to understand and improve how it is
        used, and to communicate with you about it.
      </p>

      <h2 style={h2}>5. Service providers</h2>
      <p>
        We rely on trusted providers that process data on our behalf: Supabase
        (database and sign-in), our payment processor (purchases), Vercel
        (hosting and analytics), and Microsoft Clarity (product analytics and
        session/heatmap insights used to improve usability). Each handles data
        under its own security and privacy terms.
      </p>

      <h2 style={h2}>6. Keeping and deleting your data</h2>
      <p>
        We keep your information while your account is active. You may request
        access to, correction of, or deletion of your data at any time by
        emailing us at <a style={a} href="mailto:support@legacypublishing.agency">support@legacypublishing.agency</a>.
        Deleting your account removes your profile and associated data.
      </p>

      <h2 style={h2}>7. Security</h2>
      <p>
        We use industry-standard measures, including encrypted connections and
        managed authentication, to protect your data. No method is perfectly
        secure, but we work to safeguard your information.
      </p>

      <h2 style={h2}>8. Children</h2>
      <p>
        Living Worlds is not directed to children under 13 (or the minimum age
        in your location), and we do not knowingly collect their information.
      </p>

      <h2 style={h2}>9. Changes</h2>
      <p>
        We may update this policy; material changes will be posted here with a
        new effective date.
      </p>

      <h2 style={h2}>10. Contact</h2>
      <p>
        Legacy Publishing Agency LLC ·{" "}
        <a style={a} href="mailto:support@legacypublishing.agency">support@legacypublishing.agency</a>
      </p>

      <p style={{ ...muted, marginTop: 32 }}>
        See also our <a style={a} href="/terms">Terms of Use</a>.
      </p>
    </main>
  );
}