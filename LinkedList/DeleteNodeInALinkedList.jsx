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
  nullC: '#475569', slowC: '#38bdf8', fastC: '#fb7185',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Node Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NODES = [
  { data: 0, addr: '0xD0', isDummy: true },
  { data: 1, addr: '0x1F' },
  { data: 2, addr: '0x2A' },
  { data: 3, addr: '0x47' },
  { data: 4, addr: '0x83' },
  { data: 5, addr: '0xB1' },
];

const DEFAULT_NEXT = ['0x1F', '0x2A', '0x47', '0x83', '0xB1', 'NULL'];

function getNextAddr(idx, s) {
  if (idx === 0 && !s.dummyConnected) return 'NULL';
  if (idx === 0) return '0x1F';
  if (idx === 3 && s.deleted) return '0xB1';
  return DEFAULT_NEXT[idx];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Layout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NW = 112, NH = 48, STRIDE = 142, NULL_W = 52;
const BOX_Y = 52;
const ARROW_Y = BOX_Y + NH / 2;
const VIS_H = 195;

const nX = (i, d) => 12 + (d ? i : i - 1) * STRIDE;
const nCX = (i, d) => nX(i, d) + NW / 2;
const nRX = (i, d) => nX(i, d) + NW;
const nlX = (d) => nX(6, d);
const nlCX = (d) => nlX(d) + NULL_W / 2;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'dummy = ListNode(0)', ind: 0 },
  { t: 'dummy.next = head', ind: 0 },
  { t: 'fast = dummy', ind: 0 },
  { t: 'slow = dummy', ind: 0 },
  { t: '', ind: 0 },
  { t: 'for i in range(n + 1):   # n=2', ind: 0 },
  { t: 'fast = fast.next', ind: 1 },
  { t: '', ind: 0 },
  { t: 'while fast:', ind: 0 },
  { t: 'fast = fast.next', ind: 1 },
  { t: 'slow = slow.next', ind: 1 },
  { t: '', ind: 0 },
  { t: 'slow.next = slow.next.next', ind: 0 },
  { t: '', ind: 0 },
  { t: 'return dummy.next', ind: 0 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Linked List",
    desc: "head → 1 → 2 → 3 → 4 → 5 → NULL. Goal: remove the 2nd node from end (value 4).",
    showDummy: false, dummyConnected: false,
    slow: null, fast: null,
    deleted: false, result: false, codeHL: [],
  },
  {
    title: "Create Dummy Node",
    desc: "dummy = ListNode(0) — A new node is allocated at 0xD0 with value 0. Its next pointer is NULL — not connected to anything yet.",
    showDummy: true, dummyConnected: false,
    slow: null, fast: null,
    deleted: false, result: false, codeHL: [0],
  },
  {
    title: "Connect Dummy → Head",
    desc: "dummy.next = head — Dummy's next pointer now stores 0x1F (the address of node 1). The chain is linked: D → 1 → 2 → 3 → 4 → 5.",
    showDummy: true, dummyConnected: true,
    slow: null, fast: null,
    deleted: false, result: false, codeHL: [1],
  },
  {
    title: "Initialize fast & slow",
    desc: "fast = dummy, slow = dummy — Both variables now reference the dummy node at 0xD0. No new nodes created — just two pointers to the same address.",
    showDummy: true, dummyConnected: true,
    slow: 0, fast: 0,
    deleted: false, result: false, codeHL: [2, 3],
  },
  {
    title: "Loop i=0 → fast moves",
    desc: "fast = fast.next — fast reads dummy's next pointer (0x1F) and moves there. fast is now at node 1.",
    showDummy: true, dummyConnected: true,
    slow: 0, fast: 1,
    deleted: false, result: false, codeHL: [5, 6],
  },
  {
    title: "Loop i=1 → fast moves",
    desc: "fast = fast.next — fast reads node 1's next (0x2A) and follows it. fast is now at node 2.",
    showDummy: true, dummyConnected: true,
    slow: 0, fast: 2,
    deleted: false, result: false, codeHL: [5, 6],
  },
  {
    title: "Loop i=2 → fast moves (loop done)",
    desc: "fast = fast.next — fast moves to node 3 (0x47). for loop complete. The gap between slow and fast is now 3 nodes (n+1).",
    showDummy: true, dummyConnected: true,
    slow: 0, fast: 3,
    deleted: false, result: false, codeHL: [5, 6],
  },
  {
    title: "While Round 1 → both move",
    desc: "fast is at 0x47 (not NULL) → enter loop. fast → node 4 (0x83), slow → node 1 (0x1F). The gap stays constant at 3.",
    showDummy: true, dummyConnected: true,
    slow: 1, fast: 4,
    deleted: false, result: false, codeHL: [8, 9, 10],
  },
  {
    title: "While Round 2 → both move",
    desc: "fast is at 0x83 (not NULL) → continue. fast → node 5 (0xB1), slow → node 2 (0x2A). Gap still 3.",
    showDummy: true, dummyConnected: true,
    slow: 2, fast: 5,
    deleted: false, result: false, codeHL: [8, 9, 10],
  },
  {
    title: "While Round 3 → fast hits NULL!",
    desc: "Both move: fast reads node 5's next = NULL → fast is now NULL. slow → node 3 (0x47). fast is NULL → EXIT loop. slow is exactly one node before the target!",
    showDummy: true, dummyConnected: true,
    slow: 3, fast: 'null',
    deleted: false, result: false, codeHL: [8, 9, 10],
  },
  {
    title: "Delete! ✂️  Rewire the pointer",
    desc: "slow.next = slow.next.next — Node 3's next pointer changes from 0x83 (node 4) to 0xB1 (node 5). Node 4 is now orphaned — nobody points to it. GC will reclaim it.",
    showDummy: true, dummyConnected: true,
    slow: 3, fast: 'null',
    deleted: true, result: false, codeHL: [12],
  },
  {
    title: "Return Result ✅",
    desc: "return dummy.next → returns node at 0x1F (node 1). Final list: 1 → 2 → 3 → 5. Done!",
    showDummy: true, dummyConnected: true,
    slow: null, fast: null,
    deleted: true, result: true, codeHL: [14],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Arrow Definitions (always in DOM for transitions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ARROW_DEFS = [
  { key: 'D1', from: 0, to: 1, vis: s => s.showDummy && s.dummyConnected },
  { key: '12', from: 1, to: 2, vis: () => true },
  { key: '23', from: 2, to: 3, vis: () => true },
  { key: '34', from: 3, to: 4, vis: s => !s.deleted },
  { key: '35', from: 3, to: 5, vis: s => s.deleted },
  { key: '45', from: 4, to: 5, vis: s => !s.deleted },
  { key: '5N', from: 5, to: -1, vis: () => true },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const mono = "'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', 'JetBrains Mono', monospace";
const sans = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const T = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

function NodeBox({ x, node, nextAddr, isDel, visible }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: BOX_Y + (isDel ? 55 : 0),
      width: NW, opacity: visible ? (isDel ? 0.2 : 1) : 0,
      transition: T, pointerEvents: visible ? 'auto' : 'none', zIndex: 2,
    }}>
      <div style={{
        textAlign: 'center', fontFamily: mono, fontSize: 10, fontWeight: 700,
        color: C.purple, marginBottom: 4, letterSpacing: 1,
      }}>{node.addr}</div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        border: `2px solid ${isDel ? C.red : C.accent}`,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: isDel ? '0 0 12px rgba(248,113,113,0.15)' : `0 0 14px ${C.accentGlow}`,
      }}>
        <div style={{
          padding: '7px 6px 5px', textAlign: 'center',
          background: C.surface2, borderRight: `1px solid ${C.border}`,
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
      {isDel && (
        <div style={{
          position: 'absolute', top: 14, left: 0, right: 0,
          textAlign: 'center', fontSize: 28, color: C.red, fontWeight: 700,
          opacity: 0.7, pointerEvents: 'none',
        }}>✕</div>
      )}
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

function Arrow({ x1, x2, visible, dashed }) {
  const w = Math.max(0, x2 - x1);
  const color = dashed ? C.nullC : C.orange;
  return (
    <div style={{
      position: 'absolute', left: x1, top: ARROW_Y - 1,
      width: w, height: 2, transition: T,
      opacity: visible ? 0.75 : 0, zIndex: 1,
      background: dashed ? 'none' : color,
      borderTop: dashed ? `2px dashed ${color}` : 'none',
    }}>
      <div style={{
        position: 'absolute', right: -6, top: -4,
        width: 0, height: 0,
        borderLeft: `7px solid ${color}`,
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

function ProgressDots({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? 18 : 7, height: 7, borderRadius: 4,
          background: i <= current ? C.accent : C.border,
          transition: 'all 0.3s ease',
        }} />
      ))}
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
  const d = s.showDummy;

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

  // ── Pointer label positions ──
  const slowX = s.slow !== null ? nCX(s.slow, d) : -100;
  const fastIdx = s.fast;
  const fastX = fastIdx === 'null' ? nlCX(d) : (fastIdx !== null ? nCX(fastIdx, d) : -100);
  const slowVis = s.slow !== null;
  const fastVis = s.fast !== null;

  // Handle overlap: when slow & fast at same node
  const sameNode = slowVis && fastVis && s.slow === s.fast;

  const headX = nCX(1, d);

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
          }}>Remove Nth Node from End</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            List: [1, 2, 3, 4, 5] &nbsp;·&nbsp; n = 2 &nbsp;·&nbsp; Use ← → keys or buttons to step through
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

              {/* DUMMY label */}
              <PointerTag x={nCX(0, d)} label="DUMMY" color={C.purple} below={false}
                visible={d} />

              {/* Nodes */}
              {NODES.map((node, i) => (
                <NodeBox
                  key={i}
                  x={nX(i, d)}
                  node={node}
                  nextAddr={getNextAddr(i, s)}
                  isDel={s.deleted && i === 4}
                  visible={i === 0 ? d : true}
                />
              ))}

              {/* NULL marker */}
              <NullMarker x={nlX(d)} visible={true} />

              {/* Arrows */}
              {ARROW_DEFS.map(({ key, from, to, vis }) => {
                const show = vis(s);
                const x1 = nRX(from, d);
                const x2 = to === -1 ? nlX(d) : nX(to, d);
                const dashed = to === -1;
                return <Arrow key={key} x1={x1} x2={x2} visible={show} dashed={dashed} />;
              })}

              {/* slow & fast pointers */}
              {sameNode ? (
                <div style={{
                  position: 'absolute', left: slowX, top: BOX_Y + NH + 10,
                  transform: 'translateX(-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  transition: T, opacity: 1, zIndex: 5,
                }}>
                  <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent', borderBottom: `6px solid ${C.dim}`,
                    marginBottom: 3,
                  }} />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{
                      fontFamily: mono, fontSize: 10, fontWeight: 700, color: C.slowC,
                      background: C.slowC + '18', padding: '2px 8px', borderRadius: 4,
                      letterSpacing: 1.5,
                    }}>slow</div>
                    <div style={{
                      fontFamily: mono, fontSize: 10, fontWeight: 700, color: C.fastC,
                      background: C.fastC + '18', padding: '2px 8px', borderRadius: 4,
                      letterSpacing: 1.5,
                    }}>fast</div>
                  </div>
                </div>
              ) : (
                <>
                  <PointerTag x={slowX} label="slow" color={C.slowC} below={true} visible={slowVis} />
                  <PointerTag x={fastX} label="fast" color={C.fastC} below={true} visible={fastVis} />
                </>
              )}

              {/* Result highlight */}
              {s.result && (
                <div style={{
                  position: 'absolute', left: nX(0, d) - 6, top: BOX_Y - 22,
                  width: nRX(5, d) - nX(0, d) + 12, height: NH + 40,
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