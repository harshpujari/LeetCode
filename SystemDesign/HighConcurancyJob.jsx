import { useState, useEffect } from "react";

const C = {
  bg: '#0a0e17', surface: '#111827', surface2: '#1a2340',
  border: '#2a3555', text: '#e2e8f0', dim: '#64748b',
  accent: '#38bdf8', accentGlow: 'rgba(56,189,248,0.15)',
  green: '#4ade80', greenGlow: 'rgba(74,222,128,0.15)',
  orange: '#fb923c', red: '#f87171', redGlow: 'rgba(248,113,113,0.15)',
  purple: '#a78bfa', purpleGlow: 'rgba(167,139,250,0.15)',
  nullC: '#475569',
};
const mono = "'Menlo','Monaco','Cascadia Code','Consolas','JetBrains Mono',monospace";
const sans = "system-ui,-apple-system,'Segoe UI',sans-serif";

// ── Shared drawing primitives ───────────────────────────────────────────────

function Box({ label, sub, color = C.accent, width = 100, glow = true }) {
  return (
    <div style={{
      width, minHeight: 52,
      border: `2px solid ${color}`,
      borderRadius: 10,
      background: glow ? `rgba(${hexToRgb(color)},0.1)` : C.surface2,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '8px 10px',
      boxShadow: glow ? `0 0 18px rgba(${hexToRgb(color)},0.18)` : 'none',
    }}>
      <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color, textAlign: 'center' }}>{label}</span>
      {sub && <span style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 2, textAlign: 'center' }}>{sub}</span>}
    </div>
  );
}

function Arrow({ label, color = C.dim, vertical = false, length = 60, dashed = false }) {
  if (vertical) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{
          width: 2, height: length,
          background: dashed
            ? `repeating-linear-gradient(to bottom, ${color} 0px, ${color} 5px, transparent 5px, transparent 10px)`
            : color,
        }} />
        <span style={{ fontFamily: mono, fontSize: 8, color: C.dim }}>{label}</span>
        <span style={{ color, fontSize: 12, lineHeight: 1 }}>▼</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <div style={{
          height: 2, width: length,
          background: dashed
            ? `repeating-linear-gradient(to right, ${color} 0px, ${color} 5px, transparent 5px, transparent 10px)`
            : color,
        }} />
        <span style={{ color, fontSize: 12, lineHeight: 1 }}>▶</span>
      </div>
      {label && <span style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 2 }}>{label}</span>}
    </div>
  );
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ── Section Diagrams ────────────────────────────────────────────────────────

// Section 1: Goal statement
function Diagram1() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '20px 0' }}>
      <div style={{
        border: `2px solid ${C.accent}`,
        borderRadius: 16, padding: '20px 40px',
        background: C.accentGlow,
        boxShadow: `0 0 32px rgba(56,189,248,0.2)`,
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 700, color: C.accent }}>10,000</div>
        <div style={{ fontFamily: mono, fontSize: 13, color: C.dim, marginTop: 4 }}>jobs / second</div>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{
          border: `1px solid ${C.green}44`, borderRadius: 10, padding: '12px 24px',
          background: C.greenGlow, textAlign: 'center',
        }}>
          <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.green }}>≤ 2s</div>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 2 }}>execution latency</div>
        </div>
        <div style={{
          border: `1px solid ${C.purple}44`, borderRadius: 10, padding: '12px 24px',
          background: C.purpleGlow, textAlign: 'center',
        }}>
          <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: C.purple }}>∞</div>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 2 }}>horizontal scale</div>
        </div>
      </div>
      <div style={{ fontFamily: mono, fontSize: 11, color: C.dim, textAlign: 'center', maxWidth: 320 }}>
        Any job, scheduled at any future time, fires within 2 seconds of its due time — at any scale.
      </div>
    </div>
  );
}

// Section 2: DB polling problem
function Diagram2() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '20px 0' }}>
      {/* Polling flow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Box label="WORKER" sub="polling" color={C.dim} glow={false} width={90} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Arrow label="every 5s" color={C.red} length={70} />
          <Arrow label="response" color={C.dim} length={70} />
        </div>
        <Box label="DATABASE" sub="source of truth" color={C.orange} width={110} />
      </div>

      {/* Problems */}
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 400 }}>
        {[
          { icon: '✗', text: 'Massive DB load at high poll frequency', color: C.red },
          { icon: '✗', text: 'Precision bounded by poll interval (poll every 5s = up to 5s late)', color: C.red },
          { icon: '✗', text: 'Thundering herd — all workers hit DB at same time', color: C.red },
        ].map((p, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '8px 12px', borderRadius: 8,
            background: C.redGlow, border: `1px solid ${C.red}33`,
          }}>
            <span style={{ fontFamily: mono, fontSize: 12, color: C.red, flexShrink: 0 }}>{p.icon}</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: C.dim, lineHeight: 1.5 }}>{p.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Section 3: 2-Layer solution
function Diagram3() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '20px 0' }}>
      <div style={{ display: 'flex', gap: 40, alignItems: 'stretch' }}>
        {/* DB layer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 4,
          }}>Layer 1</div>
          <Box label="DATABASE" sub="durability" color={C.orange} width={120} />
          <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, textAlign: 'center', maxWidth: 120 }}>
            source of truth<br />every job lives here
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <div style={{ width: 1, height: 40, background: C.border }} />
          <span style={{ fontFamily: mono, fontSize: 9, color: C.border }}>+</span>
          <div style={{ width: 1, height: 40, background: C.border }} />
        </div>

        {/* Queue layer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 4,
          }}>Layer 2</div>
          <Box label="DELAY QUEUE" sub="precision timing" color={C.accent} width={130} />
          <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, textAlign: 'center', maxWidth: 130 }}>
            message appears EXACTLY<br />at scheduled_at
          </div>
        </div>
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 20 }}>
        {[
          { label: 'DB owns WHAT', color: C.orange },
          { label: 'Queue owns WHEN', color: C.accent },
        ].map((b, i) => (
          <div key={i} style={{
            padding: '8px 20px', borderRadius: 8,
            border: `1px solid ${b.color}44`,
            background: `rgba(${hexToRgb(b.color)},0.08)`,
            fontFamily: mono, fontSize: 11, fontWeight: 700, color: b.color,
          }}>{b.label}</div>
        ))}
      </div>
    </div>
  );
}

// Section 4: How it works — full flow
function Diagram4() {
  const items = [
    { label: 'JOB CREATED', sub: 'POST /jobs', color: C.purple },
    { label: 'DATABASE', sub: 'INSERT status=PENDING', color: C.orange },
    { label: 'HOT PATH?', sub: 'delta < 300s', color: C.accent, diamond: true },
    { label: 'SQS QUEUE', sub: 'DelaySeconds=delta', color: C.accent },
    { label: 'WORKER', sub: 'long poll, picks up', color: C.green },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '12px 0' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {item.diamond ? (
            <div style={{
              width: 110, height: 52,
              background: C.accentGlow,
              border: `2px solid ${C.accent}`,
              transform: 'rotate(0deg)',
              borderRadius: 8,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '6px 10px',
            }}>
              <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.accent }}>{item.label}</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 2 }}>{item.sub}</span>
            </div>
          ) : (
            <Box label={item.label} sub={item.sub} color={item.color} width={140} />
          )}
          {i < items.length - 1 && (
            <Arrow vertical color={i === 2 ? C.accent : C.dim} length={24} />
          )}
        </div>
      ))}
      <div style={{
        marginTop: 12, padding: '6px 18px', borderRadius: 8,
        background: C.greenGlow, border: `1px solid ${C.green}44`,
        fontFamily: mono, fontSize: 10, color: C.green,
      }}>execute_job(payload) → status=DONE → delete from SQS</div>
    </div>
  );
}

// Section 5: Cron cold path
function Diagram5() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '20px 0' }}>

      {/* Cron cycle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          border: `2px solid ${C.orange}`, borderRadius: 10,
          padding: '12px 18px', background: `rgba(${hexToRgb(C.orange)},0.1)`,
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.orange }}>CRON</div>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 2 }}>every 5 min</div>
        </div>
        <Arrow label="SELECT PENDING\nwhere due ≤ now+5m" color={C.orange} length={80} />
        <Box label="DATABASE" color={C.orange} sub="SKIP LOCKED" width={110} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Box label="SQS QUEUE" color={C.accent} sub="DelaySeconds = δ" width={120} />
        <Arrow label="push each job with exact delay" color={C.accent} length={90} />
        <div style={{
          border: `2px solid ${C.orange}`, borderRadius: 10,
          padding: '12px 18px', background: `rgba(${hexToRgb(C.orange)},0.1)`,
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.orange }}>CRON</div>
        </div>
      </div>

      {/* Why 5 min box */}
      <div style={{
        marginTop: 4, padding: '12px 20px', borderRadius: 10,
        border: `1px solid ${C.accent}33`, background: C.accentGlow,
        fontFamily: mono, fontSize: 10, color: C.dim, textAlign: 'center', maxWidth: 380,
      }}>
        <span style={{ color: C.accent }}>Why 5 minutes?</span>
        {' '}SQS max DelaySeconds = 900s = 15min.<br />
        5 min window keeps max delay = 300s. Safe buffer of 600s.
      </div>
    </div>
  );
}

// Section 6: Horizontal scaling with SKIP LOCKED
function Diagram6() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '16px 0' }}>
      {/* DB */}
      <Box label="DATABASE" sub="50,000 PENDING rows" color={C.orange} width={180} />

      {/* Two crons */}
      <div style={{ display: 'flex', gap: 50, alignItems: 'flex-start' }}>
        {/* C1 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Arrow vertical color={C.accent} length={24} label="" />
          <div style={{
            border: `2px solid ${C.accent}`, borderRadius: 10,
            padding: '10px 16px', background: C.accentGlow, textAlign: 'center',
          }}>
            <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.accent }}>CRON 1</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 2 }}>LIMIT 10,000</div>
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, textAlign: 'center' }}>
            locks rows<br />1, 3, 4, 7...
          </div>
          <Arrow vertical color={C.accent} length={18} label="" />
          <Box label="SQS" sub="10k messages" color={C.accent} width={100} />
        </div>

        {/* C2 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Arrow vertical color={C.purple} length={24} label="" />
          <div style={{
            border: `2px solid ${C.purple}`, borderRadius: 10,
            padding: '10px 16px', background: C.purpleGlow, textAlign: 'center',
          }}>
            <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.purple }}>CRON 2</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 2 }}>LIMIT 10,000</div>
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, textAlign: 'center' }}>
            locks rows<br />2, 5, 6, 8...
          </div>
          <Arrow vertical color={C.purple} length={18} label="" />
          <Box label="SQS" sub="10k messages" color={C.purple} width={100} />
        </div>
      </div>

      <div style={{
        padding: '8px 18px', borderRadius: 8,
        border: `1px solid ${C.green}44`, background: C.greenGlow,
        fontFamily: mono, fontSize: 10, color: C.green,
      }}>
        SKIP LOCKED → no row owned by both. Zero duplicates.
      </div>
    </div>
  );
}

// Section 7: Final architecture
function Diagram7() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, padding: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Box label="CLIENT" sub="POST /jobs" color={C.purple} width={90} />
        <Arrow color={C.purple} length={40} />
        <Box label="DATABASE" sub="PENDING" color={C.orange} width={100} />
      </div>

      {/* Two paths from DB */}
      <div style={{ display: 'flex', gap: 60, marginTop: 0 }}>
        {/* Hot */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Arrow vertical color={C.accent} length={20} label="" />
          <div style={{ fontFamily: mono, fontSize: 8, color: C.accent, marginBottom: 4 }}>HOT PATH (δ&lt;5m)</div>
          <Arrow vertical color={C.accent} length={20} label="" />
          <Box label="SQS" sub="DelaySeconds=δ" color={C.accent} width={120} />
        </div>
        {/* Cold */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Arrow vertical color={C.orange} length={20} label="" />
          <div style={{ fontFamily: mono, fontSize: 8, color: C.orange, marginBottom: 4 }}>COLD PATH (cron)</div>
          <Arrow vertical color={C.orange} length={20} label="" />
          <Box label="CRON" sub="every 5 min" color={C.orange} width={110} />
          <Arrow vertical color={C.orange} length={18} label="" />
          <Box label="SQS" sub="DelaySeconds=δ" color={C.accent} width={120} />
        </div>
      </div>

      {/* Workers */}
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Arrow vertical color={C.accent} length={20} label="" />
        <div style={{ display: 'flex', gap: 10 }}>
          {['W1', 'W2', 'W3', 'W4'].map(w => (
            <div key={w} style={{
              border: `2px solid ${C.green}`, borderRadius: 8,
              padding: '8px 14px', background: C.greenGlow,
              fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.green,
            }}>{w}</div>
          ))}
        </div>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 6 }}>
          Workers long-poll SQS — zero DB calls at execution time
        </div>
      </div>

      {/* Result */}
      <div style={{
        marginTop: 16, padding: '8px 24px', borderRadius: 10,
        border: `2px solid ${C.green}`, background: C.greenGlow,
        fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.green,
        boxShadow: `0 0 20px rgba(74,222,128,0.2)`,
      }}>
        Durable ✓ &nbsp; Precise ✓ &nbsp; Horizontally Scalable ✓
      </div>
    </div>
  );
}

// ── Step definitions ────────────────────────────────────────────────────────

const STEPS = [
  {
    section: '0:00 – 0:08',
    title: 'Section 1 — The Goal',
    draw: 'Draw: "10k jobs/sec" in big text. Two boxes below: "≤2s precision" and "horizontal scale".',
    script: '"You need to run 10,000 jobs per second — each one firing at an exact scheduled time. How do you build that?"',
    diagram: <Diagram1 />,
    codeHL: C.accent,
  },
  {
    section: '0:08 – 0:22',
    title: 'Section 2 — Why Polling Fails',
    draw: 'Draw: Worker → (poll every 5s) → DB. Then draw three red ✗ boxes listing the problems.',
    script: '"The naive solution — poll the database every few seconds. But this destroys you at scale..."',
    diagram: <Diagram2 />,
    codeHL: C.red,
  },
  {
    section: '0:22 – 0:38',
    title: 'Section 3 — 2-Layer Solution',
    draw: 'Draw: Two boxes side by side. DB (durability). Delay Queue (precision). Label them Layer 1 and Layer 2.',
    script: '"Two layers. Database for durability — source of truth. Delay Queue for precision timing."',
    diagram: <Diagram3 />,
    codeHL: C.orange,
  },
  {
    section: '0:38 – 1:00',
    title: 'Section 4 — Hot Path Flow',
    draw: 'Draw top-down: Job Created → DB → (Hot Path check) → SQS Queue → Worker → execute.',
    script: '"Job comes in. Saved to DB. Due within 5 minutes? Push to SQS with exact delay. Worker fires at scheduled time."',
    diagram: <Diagram4 />,
    codeHL: C.accent,
  },
  {
    section: '1:00 – 1:20',
    title: 'Section 5 — Cron Cold Path',
    draw: 'Draw: Cron → (SELECT PENDING ≤ now+5min) → DB. Then Cron → (push with delay) → SQS. Label "every 5 min".',
    script: '"What about jobs days ahead? Cron runs every 5 minutes, fetches upcoming jobs, pushes each with exact delay."',
    diagram: <Diagram5 />,
    codeHL: C.orange,
  },
  {
    section: '1:20 – 1:40',
    title: 'Section 6 — Horizontal Scaling',
    draw: 'Draw: DB at top. Two arrows down to Cron 1 and Cron 2. Each has LIMIT 10k. Both point to SQS. Label "SKIP LOCKED = no overlap".',
    script: '"Each cron runs with LIMIT 10,000. SKIP LOCKED means two crons never grab the same row. Parallel. No duplicates."',
    diagram: <Diagram6 />,
    codeHL: C.purple,
  },
  {
    section: '1:40 – 2:05',
    title: 'Section 7 — Final Architecture',
    draw: 'Draw full flow: Client → DB → (two paths: hot + cron) → SQS → Workers (W1 W2 W3 W4). Green result box at bottom.',
    script: '"DB owns WHAT. Queue owns WHEN. Workers just execute. Each layer fails independently."',
    diagram: <Diagram7 />,
    codeHL: C.green,
  },
];

// ── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const total = STEPS.length;

  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); setStep(p => Math.min(p + 1, total - 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setStep(p => Math.max(p - 1, 0)); }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: sans, padding: '20px 12px' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        input[type=range] { -webkit-appearance: none; width: 100%; height: 6px;
          background: ${C.border}; border-radius: 3px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: ${C.accent}; cursor: pointer;
          box-shadow: 0 0 8px rgba(56,189,248,0.4); }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: mono, fontSize: 17, fontWeight: 700, color: C.accent, marginBottom: 4 }}>
            High-Precision Job Scheduler — Reel Diagrams
          </h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            7 sections · iPad drawing guide · Use ← → keys or buttons
          </p>
        </div>

        {/* Step counter + section timestamp */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.text }}>{s.title}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              fontFamily: mono, fontSize: 11, color: s.codeHL,
              background: C.surface, padding: '3px 10px', borderRadius: 6,
              border: `1px solid ${s.codeHL}44`,
            }}>{s.section}</div>
            <div style={{
              fontFamily: mono, fontSize: 11, color: C.dim,
              background: C.surface, padding: '3px 10px', borderRadius: 6,
            }}>Step {step + 1} / {total}</div>
          </div>
        </div>

        {/* Main: Diagram + Drawing Guide — fixed height so controls never shift */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'stretch', height: 340 }}>

          {/* Diagram panel */}
          <div style={{
            flex: '1 1 auto',
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
              fontFamily: mono, fontSize: 10, color: C.dim,
              letterSpacing: 2, textTransform: 'uppercase', flexShrink: 0,
            }}>Diagram Reference</div>
            <div style={{ padding: '16px 20px', overflowY: 'auto', overflowX: 'auto', flex: 1 }}>
              {s.diagram}
            </div>
          </div>

          {/* Drawing guide panel */}
          <div style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, overflow: 'hidden', flex: 1,
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
                fontFamily: mono, fontSize: 10, color: C.dim,
                letterSpacing: 2, textTransform: 'uppercase', flexShrink: 0,
              }}>Draw on iPad</div>
              <div style={{ padding: '14px', flex: 1, overflowY: 'auto' }}>
                <div style={{
                  padding: '12px', borderRadius: 8,
                  background: `rgba(${hexToRgb(s.codeHL)},0.08)`,
                  border: `1px solid ${s.codeHL}33`,
                  fontFamily: mono, fontSize: 11, color: C.dim, lineHeight: 1.7,
                }}>
                  {s.draw}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Script — fixed height, scrolls internally */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${s.codeHL}`,
          borderRadius: '0 10px 10px 0',
          padding: '14px 18px', marginBottom: 16,
          height: 90, overflowY: 'auto',
        }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
            What you say
          </div>
          <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, fontFamily: sans, fontStyle: 'italic' }}>
            {s.script}
          </p>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          {STEPS.map((st, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? 24 : 8, height: 8, borderRadius: 4,
                background: i === step ? C.accent : i < step ? C.dim : C.border,
                cursor: 'pointer', transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: '16px 20px',
        }}>
          <input
            type="range" min={0} max={total - 1} value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14 }}>
            <button onClick={() => setStep(0)} disabled={step === 0} style={{
              fontFamily: mono, fontSize: 11, fontWeight: 600, padding: '8px 14px', borderRadius: 8,
              background: C.surface2, color: step === 0 ? C.dim : C.text,
              border: `1px solid ${C.border}`, cursor: step === 0 ? 'default' : 'pointer',
            }}>Reset</button>
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{
              fontFamily: mono, fontSize: 12, fontWeight: 600, padding: '8px 20px', borderRadius: 8,
              background: step === 0 ? C.surface2 : C.accent + '20', color: step === 0 ? C.dim : C.accent,
              border: `1px solid ${step === 0 ? C.border : C.accent + '40'}`, cursor: step === 0 ? 'default' : 'pointer',
            }}>&larr; Prev</button>
            <button onClick={() => setStep(Math.min(total - 1, step + 1))} disabled={step === total - 1} style={{
              fontFamily: mono, fontSize: 12, fontWeight: 600, padding: '8px 20px', borderRadius: 8,
              background: step === total - 1 ? C.surface2 : C.accent, color: step === total - 1 ? C.dim : '#0a0e17',
              border: `1px solid ${step === total - 1 ? C.border : C.accent}`, cursor: step === total - 1 ? 'default' : 'pointer',
            }}>Next &rarr;</button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: C.border, marginTop: 16, fontFamily: mono }}>
          ← → arrow keys · spacebar = next
        </p>
      </div>
    </div>
  );
}