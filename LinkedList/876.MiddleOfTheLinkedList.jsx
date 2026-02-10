import { useState, useEffect } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Theme
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const C = {
  bg: '#0a0e17', surface: '#111827', surface2: '#1a2340',
  border: '#2a3555', text: '#e2e8f0', dim: '#64748b',
  accent: '#38bdf8', accentGlow: 'rgba(56,189,248,0.12)',
  green: '#4ade80', orange: '#fb923c', red: '#f87171',
  purple: '#a78bfa', purpleGlow: 'rgba(167,139,250,0.12)',
  nullC: '#475569', slowC: '#4ade80', fastC: '#f87171',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Node Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NODES = [
  { data: 1, addr: '0x1A' },
  { data: 2, addr: '0x2B' },
  { data: 3, addr: '0x3C' },
  { data: 4, addr: '0x4D' },
  { data: 5, addr: '0x5E' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Layout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NW = 112, NH = 48, STRIDE = 152, NULL_W = 52;
const BOX_Y = 52;
const ARROW_Y = BOX_Y + NH / 2;
const VIS_H = 195;

const nX = (i) => 60 + i * STRIDE;
const nCX = (i) => nX(i) + NW / 2;
const nRX = (i) => nX(i) + NW;
const nlX = () => nX(5);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'slow = head', ind: 0 },
  { t: 'fast = head', ind: 0 },
  { t: '', ind: 0 },
  { t: 'while fast and fast.next:', ind: 0 },
  { t: 'slow = slow.next', ind: 1 },
  { t: 'fast = fast.next.next', ind: 1 },
  { t: '', ind: 0 },
  { t: 'return slow', ind: 0 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Linked List",
    desc: "head → 1 → 2 → 3 → 4 → 5 → NULL. Goal: find the middle node. Using the slow/fast pointer technique — slow moves 1 step, fast moves 2 steps. When fast reaches the end, slow is at the middle.",
    slow: null, fast: null,
    codeHL: [], result: null,
  },
  {
    title: "Initialize slow & fast",
    desc: "slow = head, fast = head — Both pointers start at the first node (value 1). slow moves one step at a time, fast moves two steps.",
    slow: 0, fast: 0,
    codeHL: [0, 1], result: null,
  },
  {
    title: "Iter 1 — Check condition",
    desc: "while fast and fast.next — fast is at node 1 (not null) and fast.next is node 2 (not null). Condition is True, enter the loop.",
    slow: 0, fast: 0,
    codeHL: [3], result: null,
  },
  {
    title: "Iter 1 — Move pointers",
    desc: "slow = slow.next → slow moves to node 2. fast = fast.next.next → fast jumps two steps to node 3. Fast is moving twice as quickly.",
    slow: 1, fast: 2,
    codeHL: [4, 5], result: null,
  },
  {
    title: "Iter 2 — Check condition",
    desc: "while fast and fast.next — fast is at node 3 (not null) and fast.next is node 4 (not null). Condition is True, continue.",
    slow: 1, fast: 2,
    codeHL: [3], result: null,
  },
  {
    title: "Iter 2 — Move pointers",
    desc: "slow = slow.next → slow moves to node 3. fast = fast.next.next → fast jumps to node 5. Slow is now at the center of the list.",
    slow: 2, fast: 4,
    codeHL: [4, 5], result: null,
  },
  {
    title: "Iter 3 — Check condition",
    desc: "while fast and fast.next — fast is at node 5 and fast.next is NULL. Condition is False (fast.next is None). Loop exits!",
    slow: 2, fast: 4,
    codeHL: [3], result: null,
  },
  {
    title: "Return Result ✅",
    desc: "return slow — slow points to node 3 (value 3), which is the middle of the list [1, 2, 3, 4, 5]. The middle node is 3. Done!",
    slow: 2, fast: null,
    codeHL: [7], result: 2,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const mono = "'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', 'JetBrains Mono', monospace";
const sans = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const T = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

function NodeBox({ x, node, nextAddr, visible, highlight }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: BOX_Y,
      width: NW, opacity: visible ? 1 : 0,
      transition: T, pointerEvents: visible ? 'auto' : 'none', zIndex: 2,
    }}>
      <div style={{
        textAlign: 'center', fontFamily: mono, fontSize: 10, fontWeight: 700,
        color: C.purple, marginBottom: 4, letterSpacing: 1,
      }}>{node.addr}</div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        border: `2px solid ${highlight ? C.green : C.accent}`,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: highlight ? `0 0 18px rgba(74,222,128,0.25)` : `0 0 14px ${C.accentGlow}`,
      }}>
        <div style={{
          padding: '7px 6px 5px', textAlign: 'center',
          background: highlight ? 'rgba(74,222,128,0.08)' : C.surface2,
          borderRight: `1px solid ${C.border}`,
        }}>
          <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: C.green }}>
            {node.data}
          </div>
          <div style={{ fontFamily: mono, fontSize: 6.5, color: C.dim, letterSpacing: 1.5, marginTop: 1 }}>DATA</div>
        </div>
        <div style={{ padding: '7px 6px 5px', textAlign: 'center', background: C.surface }}>
          <div style={{
            fontFamily: mono, fontSize: nextAddr === 'NULL' ? 10 : 9.5,
            fontWeight: 600, color: nextAddr === 'NULL' ? C.nullC : C.orange,
            lineHeight: '18px',
          }}>{nextAddr}</div>
          <div style={{ fontFamily: mono, fontSize: 6.5, color: C.dim, letterSpacing: 1.5, marginTop: 1 }}>NEXT</div>
        </div>
      </div>
    </div>
  );
}

function NullMarker({ x, visible }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: BOX_Y + 12,
      width: NULL_W, height: 30,
      border: `2px dashed ${C.nullC}`, borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.nullC,
      transition: T, opacity: visible ? 1 : 0, zIndex: 1,
    }}>NULL</div>
  );
}

function Arrow({ x1, x2, visible }) {
  const left = Math.min(x1, x2);
  const w = Math.abs(x2 - x1);
  return (
    <div style={{
      position: 'absolute', left, top: ARROW_Y - 1,
      width: w, height: 2, transition: T,
      opacity: visible ? 0.75 : 0, zIndex: 1,
      background: C.orange,
    }}>
      <div style={{
        position: 'absolute', right: -6, top: -4,
        width: 0, height: 0,
        borderLeft: `7px solid ${C.orange}`,
        borderTop: '4.5px solid transparent',
        borderBottom: '4.5px solid transparent',
        opacity: visible && w > 10 ? 1 : 0, transition: 'opacity 0.3s',
      }} />
    </div>
  );
}

function PointerTag({ x, label, color, below, visible }) {
  const top = below ? BOX_Y + NH + 10 : 0;
  return (
    <div style={{
      position: 'absolute', left: x, top,
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      transition: T, opacity: visible ? 1 : 0, zIndex: 5,
    }}>
      {!below && (
        <>
          <div style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color,
            background: color + '18', padding: '2px 8px', borderRadius: 4,
            letterSpacing: 1.5, whiteSpace: 'nowrap',
          }}>{label}</div>
          <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent', borderTop: `6px solid ${color}`,
            marginTop: 2,
          }} />
        </>
      )}
      {below && (
        <>
          <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent', borderBottom: `6px solid ${color}`,
            marginBottom: 2,
          }} />
          <div style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color,
            background: color + '18', padding: '2px 8px', borderRadius: 4,
            letterSpacing: 1.5, whiteSpace: 'nowrap',
          }}>{label}</div>
        </>
      )}
    </div>
  );
}

function CodePanel({ highlighted }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: 'hidden',
    }}>
      <div style={{
        padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        fontFamily: mono, fontSize: 10, color: C.dim, letterSpacing: 2,
        textTransform: 'uppercase',
      }}>Python Code</div>
      <div style={{ padding: '6px 0', overflowX: 'auto' }}>
        {CODE.map((line, i) => {
          const hl = highlighted.includes(i);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              padding: '2.5px 14px 2.5px 0',
              background: hl ? C.accentGlow : 'transparent',
              borderLeft: `3px solid ${hl ? C.accent : 'transparent'}`,
              transition: 'background 0.3s, border-color 0.3s',
            }}>
              <span style={{
                fontFamily: mono, fontSize: 10, color: C.dim,
                width: 32, textAlign: 'right', marginRight: 14,
                userSelect: 'none', flexShrink: 0,
              }}>{line.t ? i + 1 : ''}</span>
              <span style={{
                fontFamily: mono, fontSize: 12.5,
                color: hl ? C.text : (line.t ? C.dim : 'transparent'),
                whiteSpace: 'pre', transition: 'color 0.3s',
              }}>{'  '.repeat(line.ind)}{line.t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main App
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function App() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const total = STEPS.length;

  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setStep(p => Math.min(p + 1, total - 1));
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setStep(p => Math.max(p - 1, 0));
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  const nextAddrs = ['0x2B', '0x3C', '0x4D', '0x5E', 'NULL'];
  const headX = nCX(0);

  // Group overlapping pointers
  const ptrs = [];
  if (s.slow !== null) ptrs.push({ label: 'slow', color: C.slowC, x: nCX(s.slow) });
  if (s.fast !== null) ptrs.push({ label: 'fast', color: C.fastC, x: nCX(s.fast) });

  const groups = {};
  ptrs.forEach(p => {
    const k = Math.round(p.x);
    if (!groups[k]) groups[k] = [];
    groups[k].push(p);
  });

  return (
    <div style={{
      background: C.bg, minHeight: '100vh', color: C.text,
      fontFamily: sans, padding: '20px 12px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        input[type=range] { -webkit-appearance: none; width: 100%; height: 6px;
          background: ${C.border}; border-radius: 3px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none;
          width: 18px; height: 18px; border-radius: 50%;
          background: ${C.accent}; cursor: pointer;
          box-shadow: 0 0 8px ${C.accentGlow}; }
        input[type=range]::-moz-range-thumb { width: 18px; height: 18px;
          border-radius: 50%; background: ${C.accent}; cursor: pointer;
          border: none; box-shadow: 0 0 8px ${C.accentGlow}; }
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            fontFamily: mono, fontSize: 17, fontWeight: 700,
            color: C.accent, letterSpacing: -0.3, marginBottom: 4,
          }}>Middle of the Linked List</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            List: [1, 2, 3, 4, 5] &nbsp;·&nbsp; Slow/Fast pointer technique &nbsp;·&nbsp; Use ← → keys or buttons
          </p>
        </div>

        {/* ── Step Title ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div style={{
            fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.text,
          }}>{s.title}</div>
          <div style={{
            fontFamily: mono, fontSize: 11, color: C.dim,
            background: C.surface, padding: '3px 10px', borderRadius: 6,
          }}>Step {step + 1} / {total}</div>
        </div>

        {/* ── Visualization ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, marginBottom: 16, overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto', padding: '0 4px' }}>
            <div style={{ position: 'relative', width: 940, height: VIS_H, margin: '0 auto' }}>

              {/* HEAD label */}
              <PointerTag x={headX} label="HEAD" color={C.accent} below={false} visible={true} />

              {/* Nodes */}
              {NODES.map((node, i) => (
                <NodeBox
                  key={i}
                  x={nX(i)}
                  node={node}
                  nextAddr={nextAddrs[i]}
                  visible={true}
                  highlight={s.result === i}
                />
              ))}

              {/* Right NULL */}
              <NullMarker x={nlX()} visible={true} />

              {/* Arrows */}
              {NODES.map((_, i) => i < NODES.length - 1 ? (
                <Arrow key={i} x1={nRX(i)} x2={nX(i + 1)} visible={true} />
              ) : (
                <Arrow key={i} x1={nRX(i)} x2={nlX()} visible={true} />
              ))}

              {/* Pointer tags */}
              {Object.values(groups).map((group, gi) => {
                const x = group[0].x;
                if (group.length === 1) {
                  return <PointerTag key={gi} x={x} label={group[0].label} color={group[0].color} below={true} visible={true} />;
                }
                return (
                  <div key={gi} style={{
                    position: 'absolute', left: x, top: BOX_Y + NH + 10,
                    transform: 'translateX(-50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    transition: T, opacity: 1, zIndex: 5,
                  }}>
                    <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent', borderBottom: `6px solid ${C.dim}`,
                      marginBottom: 3,
                    }} />
                    <div style={{ display: 'flex', gap: 4 }}>
                      {group.map((p, pi) => (
                        <div key={pi} style={{
                          fontFamily: mono, fontSize: 10, fontWeight: 700, color: p.color,
                          background: p.color + '18', padding: '2px 8px', borderRadius: 4,
                          letterSpacing: 1.5,
                        }}>{p.label}</div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Result highlight */}
              {s.result !== null && (
                <div style={{
                  position: 'absolute', left: nX(s.result) - 6, top: BOX_Y - 22,
                  width: NW + 12, height: NH + 40,
                  border: `2px solid ${C.green}`, borderRadius: 14,
                  opacity: 0.25, pointerEvents: 'none',
                  boxShadow: `0 0 20px rgba(74,222,128,0.1)`,
                  transition: T,
                }} />
              )}
            </div>
          </div>
        </div>

        {/* ── Description ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${C.accent}`,
          borderRadius: '0 10px 10px 0',
          padding: '14px 18px', marginBottom: 16,
        }}>
          <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, fontFamily: sans }}>
            {s.desc}
          </p>
        </div>

        {/* ── Code Panel ── */}
        <div style={{ marginBottom: 20 }}>
          <CodePanel highlighted={s.codeHL} />
        </div>

        {/* ── Controls ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: '16px 20px',
        }}>
          <div>
            <input
              type="range" min={0} max={total - 1} value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{
            display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14,
          }}>
            <button
              onClick={() => setStep(0)}
              disabled={step === 0}
              style={{
                fontFamily: mono, fontSize: 11, fontWeight: 600,
                padding: '8px 14px', borderRadius: 8,
                background: C.surface2, color: step === 0 ? C.dim : C.text,
                border: `1px solid ${C.border}`, cursor: step === 0 ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >⏮ Reset</button>
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              style={{
                fontFamily: mono, fontSize: 12, fontWeight: 600,
                padding: '8px 20px', borderRadius: 8,
                background: step === 0 ? C.surface2 : C.accent + '20',
                color: step === 0 ? C.dim : C.accent,
                border: `1px solid ${step === 0 ? C.border : C.accent + '40'}`,
                cursor: step === 0 ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >← Prev</button>
            <button
              onClick={() => setStep(Math.min(total - 1, step + 1))}
              disabled={step === total - 1}
              style={{
                fontFamily: mono, fontSize: 12, fontWeight: 600,
                padding: '8px 20px', borderRadius: 8,
                background: step === total - 1 ? C.surface2 : C.accent,
                color: step === total - 1 ? C.dim : '#0a0e17',
                border: `1px solid ${step === total - 1 ? C.border : C.accent}`,
                cursor: step === total - 1 ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >Next →</button>
          </div>
        </div>

        <p style={{
          textAlign: 'center', fontSize: 11, color: C.border,
          marginTop: 16, fontFamily: mono,
        }}>← → arrow keys &nbsp;·&nbsp; spacebar = next</p>
      </div>
    </div>
  );
}
