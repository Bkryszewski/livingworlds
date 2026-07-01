'use client';

/* ============================================================================
   OpeningExperience.tsx  —  Living Worlds cinematic cold-open
   ----------------------------------------------------------------------------
   TikTok "Learn More" → app mounts this FIRST (skip the loading screen) →
   2s brand wave → FaceTime-style incoming call from Ruben Rivera →
   connected beats → CTA → onEnter() drops the visitor into Perdido.

   WIRING (app/page.tsx stage machine):
     const [stage, setStage] = useState<'opening' | 'app'>('opening');
     if (stage === 'opening')
       return <OpeningExperience onEnter={() => setStage('app')} />;

   To force it only for TikTok traffic, gate on a query param:
     const tiktok = useSearchParams().get('exp') === 'call';   // link: ?exp=call
   ============================================================================ */

import { useEffect, useRef, useState, useCallback } from 'react';
import analytics from '@/lib/analytics';

type Lang = 'es' | 'en';
type Stage = 'wave' | 'incoming' | 'call' | 'lost' | 'fade' | 'enter';
type Beat = 'speak' | 'signal' | 'urgent' | 'final';

interface Props {
  onEnter: () => void;          // hand off into the game
  onDecline?: () => void;
  lang?: Lang | 'auto';         // 'en' (default), 'es', or 'auto' (Spanish only if locale is Spanish)
  posterUrl?: string;           // Ruben still (wet, stormy). '' → stylized fallback
  videoSrc?: string;            // optional looping backdrop clip (mp4/webm)
  audioSrc?: string;            // master timeline audio (voice + ambience mixed)
  ringtoneSrc?: string;         // optional call ringtone file; omit to use built-in synth ring
  howToUrl?: string;
  autoAcceptMs?: number;        // auto-answer if untouched (default 6000)
}

const COPY = {
  es: {
    inLabel: 'FaceTime entrante…', decline: 'Rechazar', accept: 'Aceptar',
    hint: 'Responde — alguien te necesita',
    speak: ['¿Hola?…', '¿Hola? ¿Alguien me escucha?'],
    signal: '(la señal se corta…)',
    urgent: ['Si alguien está recibiendo esto…', 'Necesito tu ayuda.'],
    final: ['Ya no están…', 'No sé qué pasó…'],
    lost1: 'CONEXIÓN PERDIDA', lost2: 'LLAMADA FINALIZADA',
    fade: ['Estaba buscando algo…', 'Ahora cuenta contigo.'],
    sub: ['Entra en la historia.', 'Elige tu papel.', 'Cambia el final.'],
    cta: 'ENTRAR A LIVING WORLDS', how: 'Cómo se juega', skip: 'Saltar',
  },
  en: {
    inLabel: 'Incoming FaceTime…', decline: 'Decline', accept: 'Accept',
    hint: 'Answer — someone needs you',
    speak: ['Hello?…', 'Hello? Can anybody hear me?'],
    signal: '(signal breaking up…)',
    urgent: ["If somebody's getting this…", 'I need your help.'],
    final: ["They're gone…", "I don't know what happened…"],
    lost1: 'CONNECTION LOST', lost2: 'CALL ENDED',
    fade: ['He was searching for something…', "Now he's counting on you."],
    sub: ['Step into the story.', 'Choose your role.', 'Change the ending.'],
    cta: 'ENTER LIVING WORLDS', how: 'How to play', skip: 'Skip',
  },
} as const;

export default function OpeningExperience({
  onEnter,
  onDecline,
  lang = 'en',
  posterUrl = '',
  videoSrc = '',
  audioSrc = '',
  ringtoneSrc = '',
  howToUrl,
  autoAcceptMs = 3500,
}: Props) {
  const [autoLang, setAutoLang] = useState<Lang>('en');
  useEffect(() => {
    if (lang === 'auto' && typeof navigator !== 'undefined') {
      setAutoLang(navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en');
    }
  }, [lang]);
  const resolvedLang: Lang = lang === 'auto' ? autoLang : lang;
  const t = COPY[resolvedLang];
  const hasPoster = !!posterUrl;

  const [stage, setStage] = useState<Stage>('wave');
  const [beat, setBeat] = useState<Beat>('speak');
  const [now, setNow] = useState('9:41');

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ringAudioRef = useRef<HTMLAudioElement>(null);
  const ringCtxRef = useRef<AudioContext | null>(null);
  const ringTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const after = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };
  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  // --- incoming-call ringtone (generic synth ring; no external assets needed) ---
  const startRing = () => {
    if (ringtoneSrc) { ringAudioRef.current?.play().catch(() => {}); return; }
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = ringCtxRef.current ?? new AC();
      ringCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const burst = () => {
        const c = ringCtxRef.current;
        if (!c) return;
        const t0 = c.currentTime;
        // FaceTime-style warble cadence: two ascending note-pairs, then a pause
        [880, 1174.7, 880, 1174.7].forEach((f, i) => {
          const s = t0 + i * 0.19;
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = 'triangle';
          o.frequency.value = f;
          o.connect(g); g.connect(c.destination);
          g.gain.setValueAtTime(0, s);
          g.gain.linearRampToValueAtTime(0.16, s + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, s + 0.17);
          o.start(s); o.stop(s + 0.2);
        });
      };
      burst();
      ringTimerRef.current = setInterval(burst, 2600);
    } catch { /* audio unavailable */ }
  };
  const stopRing = () => {
    if (ringTimerRef.current) { clearInterval(ringTimerRef.current); ringTimerRef.current = null; }
    ringCtxRef.current?.suspend?.().catch(() => {});
    if (ringAudioRef.current) { ringAudioRef.current.pause(); ringAudioRef.current.currentTime = 0; }
  };

  // live clock (sells "this is really my phone")
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(`${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  // STAGE 0 → wave 2s → incoming
  useEffect(() => {
    analytics.openingStarted();
    after(1200, () => { analytics.splashCompleted(); setStage('incoming'); });
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // STAGE 1 → ring + auto-accept fallback
  useEffect(() => {
    if (stage !== 'incoming') return;
    analytics.facetimePresented();
    startRing();
    // iOS blocks audio until a gesture — first touch anywhere kicks the ring in
    const unlock = () => { ringCtxRef.current?.resume?.().catch(() => {}); };
    window.addEventListener('pointerdown', unlock, { once: true });
    const id = setTimeout(accept, autoAcceptMs);
    return () => { clearTimeout(id); window.removeEventListener('pointerdown', unlock); stopRing(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, autoAcceptMs]);

  const accept = useCallback(() => {
    stopRing();
    analytics.facetimeAccepted();
    setStage('call');
    if (audioSrc && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc]);

  const decline = useCallback(() => {
    stopRing();
    analytics.facetimeDeclined();
    onDecline?.();
    setStage('lost');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDecline]);

  // STAGE 2..6 — connected beat timeline, then straight to CALL ENDED
  useEffect(() => {
    if (stage !== 'call') return;
    setBeat('speak');
    after(1600, () => setBeat('signal'));
    after(2900, () => setBeat('urgent'));
    after(4800, () => setBeat('final'));
    after(6400, () => setStage('lost'));
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // CALL ENDED → drop straight into ENTER (short beat)
  useEffect(() => {
    if (stage !== 'lost') return;
    after(900, () => setStage('enter'));
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // ENTER LIVING WORLDS landing page shown
  useEffect(() => {
    if (stage === 'enter') analytics.landingLoaded();
  }, [stage]);

  const enterApp = () => { stopRing(); analytics.enterClicked(); audioRef.current?.pause(); onEnter(); };
  const skip = () => { stopRing(); clearTimers(); setStage('enter'); };

  const posterStyle = hasPoster
    ? { backgroundImage: `url("${posterUrl}")` }
    : undefined;

  const captionLines =
    beat === 'speak' ? t.speak :
    beat === 'signal' ? [t.signal] :
    beat === 'urgent' ? t.urgent : t.final;
  const glitching = stage === 'call' && beat === 'signal';
  const connected = stage === 'call';

  return (
    <div className="lw-oe" role="dialog" aria-label="Living Worlds intro">
      {/* status bar */}
      <div className="lw-status">
        <span>{now}</span>
        <span className="r">
          <svg width="18" height="12" viewBox="0 0 18 12"><g fill="#fff"><rect x="0" y="7" width="3" height="5" rx="1" /><rect x="4.5" y="4.5" width="3" height="7.5" rx="1" /><rect x="9" y="2" width="3" height="10" rx="1" /><rect x="13.5" y="0" width="3" height="12" rx="1" /></g></svg>
          <svg width="26" height="12" viewBox="0 0 26 12"><rect x="1" y="1" width="21" height="10" rx="3" fill="none" stroke="#fff" strokeOpacity=".5" /><rect x="23" y="4" width="2" height="4" rx="1" fill="#fff" fillOpacity=".5" /><rect x="2.5" y="2.5" width="16" height="7" rx="1.5" fill="#fff" /></svg>
        </span>
      </div>

      <button className="lw-skip" onClick={skip}>{t.skip} ⏭</button>

      {/* connected backdrop */}
      {(connected || stage === 'lost') && (
        <div className={`lw-backdrop${glitching ? ' glitch' : ''}${stage === 'lost' ? ' out' : ''}`}>
          {videoSrc
            ? <video className="lw-video" src={videoSrc} autoPlay muted loop playsInline />
            : hasPoster
              ? <div className="lw-poster" style={posterStyle} />
              : <div className="lw-fallback" />}
          {hasPoster && glitching && (
            <div className="lw-slice"><b style={posterStyle} /><b style={posterStyle} /><b style={posterStyle} /></div>
          )}
          {glitching && <div className="lw-rgb" />}
          <div className="lw-rain on" />
          <div className="lw-scan" />
          <div className="lw-grain" />
          <div className="lw-vignette" />
        </div>
      )}

      {/* call meta + captions + controls */}
      {connected && (
        <>
          <div className="lw-meta">
            <div className="nm">Ruben Rivera</div>
            <div className="lv">LIVE</div>
          </div>
          <div className="lw-caption" key={beat}>
            {captionLines.map((ln, i) => (
              <span key={i} className={`line${beat === 'signal' ? ' dim' : ''}`} style={{ animationDelay: `${i * 0.32}s` }}>{ln}</span>
            ))}
          </div>
          <div className="lw-controls">
            <button className="c end" aria-label="End" onClick={() => setStage('lost')}>
              <svg viewBox="0 0 24 24" fill="#fff"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.67-1.85.998.998 0 0 1-.56-.9v-3.1A16.11 16.11 0 0 0 12 9z" /></svg>
            </button>
            <button className="c" aria-label="Video">
              <svg viewBox="0 0 24 24" fill="#fff"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" /></svg>
            </button>
          </div>
        </>
      )}

      {/* STAGE 0 — WAVE */}
      {stage === 'wave' && (
        <div className="lw-wave">
          <div className="wm">
            <div className="kick">LEGACY STUDIO ENTERTAINMENT</div>
            <div className="word">LIVING&nbsp;WORLDS</div>
            <div className="bars">{Array.from({ length: 7 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />)}</div>
          </div>
        </div>
      )}

      {/* STAGE 1 — INCOMING */}
      {stage === 'incoming' && (
        <div className="lw-incoming">
          <div className="inbg">{hasPoster ? <div className="lw-poster" style={posterStyle} /> : <div className="lw-fallback in" />}</div>
          <div className="lbl">{t.inLabel}</div>
          <div className="innm">Ruben Rivera</div>
          <div className="inlv">LIVE</div>
          <div className="avatar">
            <span className="ring" /><span className="ring" /><span className="ring" />
            {hasPoster ? <div className="img" style={posterStyle} /> : <div className="imgfb" />}
          </div>
          <div className="answer">
            <button className="b decline" onClick={decline}>
              <span className="disc"><svg viewBox="0 0 24 24" fill="#fff"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.7l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.67-1.85.998.998 0 0 1-.56-.9v-3.1A16.11 16.11 0 0 0 12 9z" /></svg></span>
              <span className="l">{t.decline}</span>
            </button>
            <button className="b accept" onClick={accept}>
              <span className="disc"><svg viewBox="0 0 24 24" fill="#fff"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z" /></svg></span>
              <span className="l">{t.accept}</span>
            </button>
          </div>
          <div className="hint">{t.hint}</div>
        </div>
      )}

      {/* CONNECTION LOST */}
      {stage === 'lost' && (
        <div className="lw-lost">
          <div className="t1">{t.lost1}</div>
          <div className="t2">{t.lost2}</div>
        </div>
      )}

      {/* FADE / UNDERWATER */}
      {stage === 'fade' && (
        <div className="lw-fade">
          <div className="bubbles">{Array.from({ length: 24 }).map((_, i) => {
            const sz = 4 + Math.random() * 14;
            return <i key={i} style={{ width: sz, height: sz, left: `${Math.random() * 100}%`, animationDuration: `${4 + Math.random() * 5}s`, animationDelay: `${-Math.random() * 6}s` }} />;
          })}</div>
          <div className="msg">{t.fade.map((ln, i) => <span key={i} className="line" style={{ animationDelay: `${i * 0.55}s` }}>{ln}</span>)}</div>
        </div>
      )}

      {/* ENTER LIVING WORLDS */}
      {stage === 'enter' && (
        <div className="lw-enter">
          <div className="kick">LEGACY STUDIO ENTERTAINMENT</div>
          <div className="lw"><b>LIVING</b><b>WORLDS</b></div>
          <div className="sub">{t.sub.map((s, i) => <div key={i}>{s}</div>)}</div>
          <button className="cta" onClick={enterApp}>{t.cta}</button>
          {howToUrl && <a className="how" href={howToUrl}>{t.how}</a>}
        </div>
      )}

      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="auto" playsInline />}
      {ringtoneSrc && <audio ref={ringAudioRef} src={ringtoneSrc} preload="auto" loop playsInline />}

      <style>{styles}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ styles */
const styles = `
.lw-oe{position:fixed;inset:0;z-index:9999;background:#0a0908;color:#fff;overflow:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,sans-serif}
.lw-oe *{box-sizing:border-box}

.lw-status{position:absolute;top:0;left:0;right:0;height:52px;z-index:60;display:flex;align-items:center;justify-content:space-between;padding:0 26px;font-size:15px;font-weight:600;pointer-events:none}
.lw-status .r{display:flex;gap:7px;align-items:center}

.lw-skip{position:absolute;top:56px;right:18px;z-index:90;font-size:12px;color:rgba(255,255,255,.55);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);padding:6px 12px;border-radius:20px;cursor:pointer;backdrop-filter:blur(6px)}

.lw-backdrop{position:absolute;inset:0;z-index:1;overflow:hidden;background:#05070c;transition:opacity .4s}
.lw-backdrop.out{opacity:0}
.lw-backdrop.glitch .lw-poster,.lw-backdrop.glitch .lw-fallback,.lw-backdrop.glitch .lw-video{animation:lwShake .18s infinite}
.lw-poster,.lw-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background-size:cover;background-position:center 30%;filter:saturate(.9) contrast(1.05)}
.lw-fallback{position:absolute;inset:0;background:
  radial-gradient(120% 80% at 50% 8%,rgba(70,90,120,.35),transparent 55%),
  radial-gradient(90% 60% at 50% 42%,rgba(120,130,150,.22),transparent 60%),
  linear-gradient(180deg,#0b1220,#0a0f18 45%,#05080d)}
.lw-fallback::after{content:"";position:absolute;inset:0;background:radial-gradient(60% 45% at 50% 40%,rgba(180,190,210,.14),transparent 70%);mix-blend-mode:screen}
.lw-fallback.in{background:radial-gradient(100% 60% at 50% 20%,rgba(60,80,120,.4),transparent 60%),linear-gradient(180deg,#0a1424,#070d18 60%,#04060c)}
.lw-vignette{position:absolute;inset:0;z-index:5;background:radial-gradient(120% 90% at 50% 40%,transparent 45%,rgba(0,0,0,.72));pointer-events:none}
.lw-grain{position:absolute;inset:-40%;z-index:6;opacity:.06;pointer-events:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");animation:lwGrain .5s steps(3) infinite}
.lw-scan{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:.5;background:repeating-linear-gradient(180deg,rgba(255,255,255,.03) 0 1px,transparent 1px 3px);animation:lwScan 6s linear infinite}
.lw-rain{position:absolute;inset:0;z-index:7;pointer-events:none;opacity:0;transition:opacity .6s;
  background:repeating-linear-gradient(100deg,transparent 0 7px,rgba(200,215,235,.10) 7px 8px)}
.lw-rain.on{opacity:.5;animation:lwRain .5s linear infinite}
.lw-slice{position:absolute;inset:0;z-index:8;pointer-events:none}
.lw-slice b{position:absolute;left:0;right:0;background-size:cover;background-position:center 30%;mix-blend-mode:screen;opacity:.55}
.lw-slice b:nth-child(1){top:22%;height:9%;animation:lwSl1 .4s steps(2) infinite;filter:hue-rotate(-40deg)}
.lw-slice b:nth-child(2){top:48%;height:7%;animation:lwSl2 .3s steps(2) infinite;filter:hue-rotate(60deg)}
.lw-slice b:nth-child(3){top:70%;height:6%;animation:lwSl1 .5s steps(3) infinite}
.lw-rgb{position:absolute;inset:0;z-index:9;pointer-events:none;mix-blend-mode:screen;opacity:.6;animation:lwRgb .12s infinite}

.lw-meta{position:absolute;top:64px;left:0;right:0;z-index:30;text-align:center;animation:lwFade .5s}
.lw-meta .nm{font-size:19px;font-weight:600}
.lw-meta .lv{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:800;letter-spacing:1.5px;color:#34c759;margin-top:2px}
.lw-meta .lv::before{content:"";width:7px;height:7px;border-radius:50%;background:#34c759;box-shadow:0 0 8px #34c759;animation:lwBlink 1.4s infinite}

.lw-caption{position:absolute;left:0;right:0;bottom:150px;z-index:30;padding:0 34px;text-align:center;font-size:23px;line-height:1.32;font-weight:500;text-shadow:0 2px 18px rgba(0,0,0,.9)}
.lw-caption .line{display:block;opacity:0;transform:translateY(10px);animation:lwLine .45s forwards}
.lw-caption .dim{opacity:.7;font-size:19px;font-weight:400;font-style:italic}

.lw-controls{position:absolute;left:0;right:0;bottom:52px;z-index:35;display:flex;justify-content:center;gap:64px;align-items:center;animation:lwFade .5s}
.lw-controls .c{width:62px;height:62px;border-radius:50%;display:grid;place-items:center;border:none;cursor:pointer;background:rgba(255,255,255,.14);backdrop-filter:blur(8px)}
.lw-controls .c.end{background:#ff453a}
.lw-controls .c svg{width:26px;height:26px}

.lw-wave{position:absolute;inset:0;z-index:80;display:grid;place-items:center;background:radial-gradient(120% 80% at 50% 40%,#0f1626,#05070c 80%)}
.lw-wave .wm{text-align:center}
.lw-wave .kick{font-size:11px;letter-spacing:5px;color:#27B6AC;font-weight:700;opacity:0;animation:lwFadeUp .7s .1s forwards}
.lw-wave .word{font-size:clamp(34px,10vw,52px);font-weight:200;letter-spacing:.22em;line-height:1;margin-top:10px;background:linear-gradient(100deg,#7d8aa0,#fff 45%,#7d8aa0 60%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:lwSweep 1.1s ease-in-out forwards}
.lw-wave .bars{display:flex;gap:5px;justify-content:center;height:34px;align-items:flex-end;margin-top:22px}
.lw-wave .bars span{width:4px;border-radius:3px;background:linear-gradient(#27B6AC,#1f6bff);animation:lwEq 1s ease-in-out infinite}

.lw-incoming{position:absolute;inset:0;z-index:70;display:flex;flex-direction:column;align-items:center;padding-top:96px}
.lw-incoming .inbg{position:absolute;inset:0;z-index:-1}
.lw-incoming .inbg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,7,12,.35),rgba(5,7,12,.85))}
.lw-incoming .lbl{font-size:15px;color:#c9d2e0;font-weight:500;opacity:0;animation:lwFadeUp .6s .15s forwards}
.lw-incoming .innm{font-size:34px;font-weight:600;margin-top:4px;opacity:0;animation:lwFadeUp .6s .25s forwards}
.lw-incoming .inlv{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:800;letter-spacing:2px;color:#34c759;margin-top:8px;opacity:0;animation:lwFadeUp .6s .35s forwards}
.lw-incoming .inlv::before{content:"";width:8px;height:8px;border-radius:50%;background:#34c759;box-shadow:0 0 10px #34c759;animation:lwBlink 1.4s infinite}
.lw-incoming .avatar{position:relative;width:150px;height:150px;margin-top:38px}
.lw-incoming .avatar .img{position:absolute;inset:0;border-radius:50%;background-size:cover;background-position:center 25%;box-shadow:0 12px 40px rgba(0,0,0,.6);border:2px solid rgba(255,255,255,.12)}
.lw-incoming .avatar .imgfb{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 50% 35%,#3a4d6b,#0d1526);border:2px solid rgba(255,255,255,.12);box-shadow:0 12px 40px rgba(0,0,0,.6);overflow:hidden}
.lw-incoming .avatar .imgfb::after{content:"";position:absolute;inset:0;background:radial-gradient(40% 30% at 50% 40%,rgba(200,210,230,.25),transparent 70%)}
.lw-incoming .avatar .ring{position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(80,180,255,.5);animation:lwPulse 2s ease-out infinite}
.lw-incoming .avatar .ring:nth-child(2){animation-delay:.66s}
.lw-incoming .avatar .ring:nth-child(3){animation-delay:1.33s}
.lw-incoming .answer{position:absolute;bottom:64px;left:0;right:0;display:flex;justify-content:center;gap:92px}
.lw-incoming .answer .b{display:flex;flex-direction:column;align-items:center;gap:9px;cursor:pointer;border:none;background:none;color:#fff}
.lw-incoming .answer .disc{width:70px;height:70px;border-radius:50%;display:grid;place-items:center}
.lw-incoming .answer .disc svg{width:30px;height:30px}
.lw-incoming .answer .decline .disc{background:#ff453a}
.lw-incoming .answer .accept .disc{background:#34c759;animation:lwJiggle 1.4s ease-in-out infinite}
.lw-incoming .answer .l{font-size:14px;color:#dfe4ec}
.lw-incoming .hint{position:absolute;bottom:20px;left:0;right:0;text-align:center;font-size:12px;color:#7b8598;opacity:0;animation:lwFadeUp .6s 2.4s forwards}

.lw-lost{position:absolute;inset:0;z-index:75;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#000;text-align:center}
.lw-lost .t1{font-size:26px;font-weight:600;letter-spacing:1px}
.lw-lost .t2{font-size:14px;font-weight:800;letter-spacing:3px;color:#ff453a;margin-top:12px;opacity:0;animation:lwFadeUp .5s .4s forwards}

.lw-fade{position:absolute;inset:0;z-index:76;display:flex;align-items:center;justify-content:center;background:radial-gradient(120% 80% at 50% 60%,#04121a,#010509 80%);text-align:center;padding:0 40px}
.lw-fade .msg{font-size:22px;line-height:1.5;font-weight:400}
.lw-fade .msg .line{display:block;opacity:0;transform:translateY(10px);animation:lwLine .6s forwards}
.lw-fade .bubbles{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.lw-fade .bubbles i{position:absolute;bottom:-20px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.5),rgba(120,180,220,.06));animation:lwRise linear infinite}

.lw-enter{position:absolute;inset:0;z-index:77;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 34px;background:radial-gradient(120% 80% at 50% 30%,#0c1626,#05070c 80%);animation:lwFadeUp .8s}
.lw-enter .kick{font-size:11px;letter-spacing:5px;color:#27B6AC;font-weight:700}
.lw-enter .lw{font-size:clamp(38px,11vw,58px);font-weight:200;letter-spacing:.2em;line-height:1;margin-top:14px}
.lw-enter .lw b{display:block;font-weight:200}
.lw-enter .sub{margin-top:26px;color:#8fb7ff;font-size:18px;line-height:1.6;font-weight:500}
.lw-enter .cta{margin-top:34px;padding:18px 40px;border:none;border-radius:16px;font-size:17px;font-weight:800;letter-spacing:.5px;color:#fff;cursor:pointer;background:linear-gradient(120deg,#39a9ff,#1f6bff);box-shadow:0 14px 40px rgba(31,107,255,.5);animation:lwCta 2.4s ease-in-out infinite}
.lw-enter .how{margin-top:20px;color:#9fb0c8;font-size:14px;text-decoration:underline;cursor:pointer}

@keyframes lwShake{0%{transform:translate(0,0)}25%{transform:translate(-3px,1px)}50%{transform:translate(3px,-2px)}75%{transform:translate(-2px,2px)}100%{transform:translate(0,0)}}
@keyframes lwGrain{0%{transform:translate(0,0)}33%{transform:translate(-3%,2%)}66%{transform:translate(2%,-3%)}100%{transform:translate(0,0)}}
@keyframes lwScan{to{background-position:0 60px}}
@keyframes lwRain{to{background-position:40px 120px}}
@keyframes lwSl1{0%{transform:translateX(-14px)}50%{transform:translateX(16px)}100%{transform:translateX(-6px)}}
@keyframes lwSl2{0%{transform:translateX(12px)}50%{transform:translateX(-18px)}100%{transform:translateX(4px)}}
@keyframes lwRgb{0%{box-shadow:inset 3px 0 0 rgba(255,0,80,.4),inset -3px 0 0 rgba(0,200,255,.4)}100%{box-shadow:inset -4px 0 0 rgba(255,0,80,.4),inset 4px 0 0 rgba(0,200,255,.4)}}
@keyframes lwBlink{50%{opacity:.25}}
@keyframes lwLine{to{opacity:1;transform:none}}
@keyframes lwFade{from{opacity:0}to{opacity:1}}
@keyframes lwFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes lwSweep{0%{background-position:120% 0;opacity:.2}40%{opacity:1}100%{background-position:-40% 0;opacity:1}}
@keyframes lwEq{0%,100%{height:6px}50%{height:32px}}
@keyframes lwPulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.6);opacity:0}}
@keyframes lwJiggle{0%,100%{transform:translateY(0)}25%{transform:translateY(-6px) rotate(-8deg)}75%{transform:translateY(-6px) rotate(8deg)}}
@keyframes lwRise{to{transform:translateY(-110vh) translateX(20px);opacity:0}}
@keyframes lwCta{50%{box-shadow:0 14px 55px rgba(57,169,255,.8)}}

@media(prefers-reduced-motion:reduce){
  .lw-oe *{animation-duration:.01ms!important;animation-iteration-count:1!important}
}
`;