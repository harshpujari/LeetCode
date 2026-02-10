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
  dummyC: '#64748b',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Node Data: dummy → 1 → 2 → 3 → 4 → 5 → NULL, n=2 (remove 4)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NODES = [
  { data: 'D', addr: '0x00', isDummy: true },
  { data: 1, addr: '0x1A' },
  { data: 2, addr: '0x2B' },
  { data: 3, addr: '0x3C' },
  { data: 4, addr: '0x4D' },
  { data: 5, addr: '0x5E' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Layout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NW = 100, NH = 48, STRIDE = 132, NULL_W = 52;
const BOX_Y = 52;
const ARROW_Y = BOX_Y + NH / 2;
const VIS_H = 195;

const nX = (i) => 30 + i * STRIDE;
const nCX = (i) => nX(i) + NW / 2;
const nRX = (i) => nX(i) + NW;
const nlX = () => nX(6);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'dummy = ListNode(0)', ind: 0 },
  { t: 'dummy.next = head', ind: 0 },
  { t: 'fast = dummy', ind: 0 },
  { t: 'slow = dummy', ind: 0 },
  { t: '', ind: 0 },
  { t: '# Move fast n+1 steps ahead', ind: 0 },
  { t: 'for i in range(n + 1):', ind: 0 },
  { t: 'fast = fast.next', ind: 1 },
  { t: '', ind: 0 },
  { t: '# Move both until fast hits null', ind: 0 },
  { t: 'while fast:', ind: 0 },
  { t: 'fast = fast.next', ind: 1 },
  { t: 'slow = slow.next', ind: 1 },
  { t: '', ind: 0 },
  { t: '# Skip the target node', ind: 0 },
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
    desc: "head → 1 → 2 → 3 → 4 → 5 → NULL. Goal: remove the 2nd node from the end (node with value 4), resulting in 1 → 2 → 3 → 5 → NULL.",
    slow: null, fast: null,
    arrows: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,'rn']],
    nextAddrs: ['0x1A','0x2B','0x3C','0x4D','0x5E','NULL'],
    removed: null,
    codeHL: [], result: false,
  },
  {
    title: "Create dummy node",
    desc: "Create a dummy node (D) before head. Set dummy.next = head. fast = dummy, slow = dummy. The dummy simplifies edge cases (like removing the first node).",
    slow: 0, fast: 0,
    arrows: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,'rn']],
    nextAddrs: ['0x1A','0x2B','0x3C','0x4D','0x5E','NULL'],
    removed: null,
    codeHL: [0, 1, 2, 3], result: false,
  },
  {
    title: "Advance fast — Step 1 of 3",
    desc: "n = 2, so we move fast n+1 = 3 steps ahead. Step 1: fast moves from dummy to node 1. This creates a gap so that when both reach the end, slow is right before the target.",
    slow: 0, fast: 1,
    arrows: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,'rn']],
    nextAddrs: ['0x1A','0x2B','0x3C','0x4D','0x5E','NULL'],
    removed: null,
    codeHL: [5, 6, 7], result: false,
  },
  {
    title: "Advance fast — Step 2 of 3",
    desc: "Step 2: fast moves from node 1 to node 2.",
    slow: 0, fast: 2,
    arrows: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,'rn']],
    nextAddrs: ['0x1A','0x2B','0x3C','0x4D','0x5E','NULL'],
    removed: null,
    codeHL: [6, 7], result: false,
  },
  {
    title: "Advance fast — Step 3 of 3",
    desc: "Step 3: fast moves from node 2 to node 3. Now fast is 3 steps ahead of slow. The gap of n+1 = 3 is established.",
    slow: 0, fast: 3,
    arrows: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,'rn']],
    nextAddrs: ['0x1A','0x2B','0x3C','0x4D','0x5E','NULL'],
    removed: null,
    codeHL: [6, 7], result: false,
  },
  {
    title: "Move both — Iter 1",
    desc: "while fast is not None: move both pointers. fast → node 4, slow → node 1. They maintain the gap of 3.",
    slow: 1, fast: 4,
    arrows: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,'rn']],
    nextAddrs: ['0x1A','0x2B','0x3C','0x4D','0x5E','NULL'],
    removed: null,
    codeHL: [9, 10, 11, 12], result: false,
  },
  {
    title: "Move both — Iter 2",
    desc: "fast → node 5, slow → node 2. fast is getting close to the end.",
    slow: 2, fast: 5,
    arrows: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,'rn']],
    nextAddrs: ['0x1A','0x2B','0x3C','0x4D','0x5E','NULL'],
    removed: null,
    codeHL: [10, 11, 12], result: false,
  },
  {
    title: "Move both — Iter 3",
    desc: "fast → NULL (past end), slow → node 3. Loop exits because fast is None. slow is now right BEFORE the node to remove (node 4).",
    slow: 3, fast: null,
    arrows: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,'rn']],
    nextAddrs: ['0x1A','0x2B','0x3C','0x4D','0x5E','NULL'],
    removed: null,
    codeHL: [10, 11, 12], result: false,
  },
  {
    title: "Remove target node",
    desc: "slow.next = slow.next.next — Node 3's next pointer skips node 4 (0x4D → 0x5E). Node 4 (value 4) is now removed from the list!",
    slow: 3, fast: null,
    arrows: [[0,1],[1,2],[2,3],[3,5],[5,'rn']],
    nextAddrs: ['0x1A','0x2B','0x3C','0x5E','—','NULL'],
    removed: 4,
    codeHL: [14, 15], result: false,
  },
  {
    title: "Return Result ✅",
    desc: "return dummy.next — The result list is 1 → 2 → 3 → 5 → NULL. We successfully removed node 4 (the 2nd from the end). Done!",
    slow: null, fast: null,
    arrows: [[0,1],[1,2],[2,3],[3,5],[5,'rn']],
    nextAddrs: ['0x1A','0x2B','0x3C','0x5E','—','NULL'],
    removed: 4,
    codeHL: [17], result: true,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const mono = "'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', 'JetBrains Mono', monospace";
const sans = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const T = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

function NodeBox({ x, node, nextAddr, visible, removed }) {
  const isDummy = node.isDummy;
  return (
    <div style={{
      position: 'absolute', left: x, top: BOX_Y,
      width: NW, opacity: visible ? (removed ? 0.25 : 1) : 0,
      transition: T, pointerEvents: visible ? 'auto' : 'none', zIndex: 2,
    }}>
      <div style={{
        textAlign: 'center', fontFamily: mono, fontSize: 10, fontWeight: 700,
        color: isDummy ? C.dummyC : C.purple, marginBottom: 4, letterSpacing: 1,
      }}>{node.addr}</div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        border: `2px ${isDummy ? 'dashed' : 'solid'} ${removed ? C.red : (isDummy ? C.dummyC : C.accent)}`,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: removed ? `0 0 14px rgba(248,113,113,0.15)` : `0 0 14px ${C.accentGlow}`,
      }}>
        <div style={{
          padding: '7px 6px 5px', textAlign: 'center',
          background: C.surface2, borderRight: `1px solid ${C.border}`,
        }}>
          <div style={{
            fontFamily: mono, fontSize: isDummy ? 12 : 16, fontWeight: 700,
            color: isDummy ? C.dummyC : (removed ? C.red : C.green),
            textDecoration: removed ? 'line-through' : 'none',
          }}>
            {node.data}
          </div>
          <div style={{ fontFamily: mono, fontSize: 6.5, color: C.dim, letterSpacing: 1.5, marginTop: 1 }}>
            {isDummy ? 'DUMMY' : 'DATA'}
          </div>
        </div>
        <div style={{ padding: '7px 6px 5px', textAlign: 'center', background: C.surface }}>
          <div style={{
            fontFamily: mono, fontSize: nextAddr === 'NULL' || nextAddr === '—' ? 10 : 9.5,
            fontWeight: 600, color: nextAddr === 'NULL' ? C.nullC : (nextAddr === '—' ? C.red : C.orange),
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

function Arrow({ x1, x2, visible, skipOver }) {
  if (skipOver) {
    // Draw a curved arrow that skips over a node
    const left = Math.min(x1, x2);
    const w = Math.abs(x2 - x1);
    return (
      <div style={{
        position: 'absolute', left, top: ARROW_Y + 14,
        width: w, height: 2, transition: T,
        opacity: visible ? 0.75 : 0, zIndex: 1,
        background: C.green,
      }}>
        {/* Vertical connectors */}
        <div style={{
          position: 'absolute', left: 0, top: -16,
          width: 2, height: 16, background: C.green,
        }} />
        <div style={{
          position: 'absolute', right: 0, top: -16,
          width: 2, height: 16, background: C.green,
        }} />
        {/* Arrowhead */}
        <div style={{
          position: 'absolute', right: -2, top: -20,
          width: 0, height: 0,
          borderBottom: `7px solid ${C.green}`,
          borderLeft: '4.5px solid transparent',
          borderRight: '4.5px solid transparent',
          opacity: visible ? 1 : 0, transition: 'opacity 0.3s',
        }} />
      </div>
    );
  }
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

  const headX = nCX(1); // HEAD points to node 1 (after dummy)

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
          }}>Remove Nth Node From End of List</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            List: [1, 2, 3, 4, 5] &nbsp;·&nbsp; n = 2 &nbsp;·&nbsp; Two-pointer technique &nbsp;·&nbsp; Use ← → keys or buttons
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              fontFamily: mono, fontSize: 11, fontWeight: 700,
              color: C.red, background: C.red + '18',
              padding: '3px 10px', borderRadius: 6,
              border: `1px solid ${C.red}30`,
            }}>n = 2</div>
            <div style={{
              fontFamily: mono, fontSize: 11, color: C.dim,
              background: C.surface, padding: '3px 10px', borderRadius: 6,
            }}>Step {step + 1} / {total}</div>
          </div>
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
                  nextAddr={s.nextAddrs[i]}
                  visible={true}
                  removed={s.removed === i}
                />
              ))}

              {/* Right NULL */}
              <NullMarker x={nlX()} visible={true} />

              {/* Arrows */}
              {s.arrows.map(([from, to], idx) => {
                if (to === 'rn') {
                  return <Arrow key={idx} x1={nRX(from)} x2={nlX()} visible={true} />;
                }
                const skip = to - from > 1;
                return <Arrow key={idx} x1={nRX(from)} x2={nX(to)} visible={true} skipOver={skip} />;
              })}

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

              {/* Removed node X marker */}
              {s.removed !== null && (
                <div style={{
                  position: 'absolute', left: nX(s.removed) + NW / 2 - 14, top: BOX_Y + 8,
                  fontFamily: mono, fontSize: 28, fontWeight: 700,
                  color: C.red, opacity: 0.6, zIndex: 10,
                  transition: T, pointerEvents: 'none',
                }}>✕</div>
              )}

              {/* Result highlight */}
              {s.result && (
                <div style={{
                  position: 'absolute', left: nX(1) - 6, top: BOX_Y - 22,
                  width: nRX(5) - nX(1) + 12, height: NH + 40,
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
