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
  nullC: '#475569', slowC: '#4ade80', fastC: '#fb923c', meetC: '#f87171',
  cycleC: '#a78bfa',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Node Data
// List: 1 → 2 → 3 → 4 → 5 → (back to 3)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NODES = [
  { data: 1, addr: '0x1F' },
  { data: 2, addr: '0x2A' },
  { data: 3, addr: '0x47' },
  { data: 4, addr: '0x83' },
  { data: 5, addr: '0xB1' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Layout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NW = 112, NH = 48, STRIDE = 152;
const BOX_Y = 72;
const ARROW_Y = BOX_Y + NH / 2;
const VIS_H = 220;

const nX = (i) => 60 + i * STRIDE;
const nCX = (i) => nX(i) + NW / 2;
const nRX = (i) => nX(i) + NW;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'slow = fast = head', ind: 0 },
  { t: '', ind: 0 },
  { t: 'while fast and fast.next:', ind: 0 },
  { t: 'slow = slow.next', ind: 1 },
  { t: 'fast = fast.next.next', ind: 1 },
  { t: 'if slow == fast:', ind: 1 },
  { t: 'return True', ind: 2 },
  { t: '', ind: 0 },
  { t: 'return False', ind: 0 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// Each step tracks:
//   arrows: array of [fromIdx, toIdx]
//   slow, fast: node index
//   cycleArrow: whether to show the cycle arrow (5 → 3)
//   met: whether slow and fast have met
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Linked List with Cycle",
    desc: "This list has a cycle: 1 → 2 → 3 → 4 → 5 → 3 (node 5 points back to node 3). We'll use Floyd's Tortoise and Hare algorithm to detect this cycle.",
    slow: null, fast: null,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [], met: false, result: null,
  },
  {
    title: "Initialize slow & fast",
    desc: "slow = fast = head — Both pointers start at the head (node 1). slow moves 1 step at a time, fast moves 2 steps at a time.",
    slow: 0, fast: 0,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [0], met: false, result: null,
  },
  // ── Iteration 1 ──
  {
    title: "Iter 1 — Check loop condition",
    desc: "while fast and fast.next — fast is at node 1, fast.next exists (node 2). Condition is True, enter the loop.",
    slow: 0, fast: 0,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [2], met: false, result: null,
  },
  {
    title: "Iter 1 — Move pointers",
    desc: "slow = slow.next (1 → 2), fast = fast.next.next (1 → 3). slow moves to node 2, fast jumps to node 3.",
    slow: 1, fast: 2,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [3, 4], met: false, result: null,
  },
  {
    title: "Iter 1 — Check if met",
    desc: "if slow == fast — slow is at node 2, fast is at node 3. They haven't met yet. Continue the loop.",
    slow: 1, fast: 2,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [5], met: false, result: null,
  },
  // ── Iteration 2 ──
  {
    title: "Iter 2 — Check loop condition",
    desc: "while fast and fast.next — fast is at node 3, fast.next exists (node 4). Condition is True.",
    slow: 1, fast: 2,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [2], met: false, result: null,
  },
  {
    title: "Iter 2 — Move pointers",
    desc: "slow = slow.next (2 → 3), fast = fast.next.next (3 → 5). slow moves to node 3, fast jumps to node 5.",
    slow: 2, fast: 4,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [3, 4], met: false, result: null,
  },
  {
    title: "Iter 2 — Check if met",
    desc: "if slow == fast — slow is at node 3, fast is at node 5. They haven't met yet. Continue the loop.",
    slow: 2, fast: 4,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [5], met: false, result: null,
  },
  // ── Iteration 3 ──
  {
    title: "Iter 3 — Check loop condition",
    desc: "while fast and fast.next — fast is at node 5, fast.next is node 3 (cycle!). Condition is True.",
    slow: 2, fast: 4,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [2], met: false, result: null,
  },
  {
    title: "Iter 3 — Move pointers",
    desc: "slow = slow.next (3 → 4), fast = fast.next.next (5 → 3 → 4). slow moves to node 4, fast goes through cycle to node 4!",
    slow: 3, fast: 3,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [3, 4], met: true, result: null,
  },
  {
    title: "Iter 3 — CYCLE DETECTED!",
    desc: "if slow == fast — Both pointers are now at node 4! They've met inside the cycle. This proves a cycle exists!",
    slow: 3, fast: 3,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [5, 6], met: true, result: null,
  },
  {
    title: "Return True",
    desc: "return True — We've detected a cycle! The fast pointer caught up with the slow pointer inside the cycle, confirming the list is cyclic.",
    slow: 3, fast: 3,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    cycleArrow: true,
    nextAddrs: ['0x2A','0x47','0x83','0xB1','0x47'],
    codeHL: [6], met: true, result: true,
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
        border: `2px solid ${highlight ? C.meetC : C.accent}`,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: highlight ? `0 0 20px rgba(248,113,113,0.4)` : `0 0 14px ${C.accentGlow}`,
        transition: T,
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
            fontFamily: mono, fontSize: 9.5,
            fontWeight: 600, color: C.orange,
            lineHeight: '18px',
          }}>{nextAddr}</div>
          <div style={{ fontFamily: mono, fontSize: 6.5, color: C.dim, letterSpacing: 1.5, marginTop: 1 }}>NEXT</div>
        </div>
      </div>
    </div>
  );
}

function Arrow({ x1, x2, visible, color = C.orange }) {
  const left = Math.min(x1, x2);
  const w = Math.abs(x2 - x1);
  return (
    <div style={{
      position: 'absolute', left, top: ARROW_Y - 1,
      width: w, height: 2, transition: T,
      opacity: visible ? 0.75 : 0, zIndex: 1,
      background: color,
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

function CycleArrow({ visible }) {
  // Curved arrow from node 5 back to node 3
  const startX = nRX(4); // Right edge of node 5
  const endX = nCX(2);   // Center of node 3
  const startY = ARROW_Y;
  const endY = BOX_Y - 8;

  return (
    <svg style={{
      position: 'absolute', left: 0, top: 0,
      width: '100%', height: VIS_H,
      pointerEvents: 'none', transition: T,
      opacity: visible ? 1 : 0,
    }}>
      <defs>
        <marker
          id="cycleArrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 8 4, 0 8" fill={C.cycleC} />
        </marker>
      </defs>
      <path
        d={`M ${startX} ${startY}
            Q ${startX + 40} ${startY - 80}, ${(startX + endX) / 2} ${endY - 20}
            Q ${endX - 20} ${endY - 20}, ${endX} ${endY}`}
        stroke={C.cycleC}
        strokeWidth="2"
        fill="none"
        strokeDasharray="6 4"
        markerEnd="url(#cycleArrowhead)"
        opacity="0.8"
      />
      <text
        x={(startX + endX) / 2 + 20}
        y={endY - 35}
        fontFamily={mono}
        fontSize="10"
        fontWeight="700"
        fill={C.cycleC}
        opacity="0.9"
      >CYCLE</text>
    </svg>
  );
}

function PointerTag({ x, label, color, below, visible }) {
  const top = below ? BOX_Y + NH + 10 : BOX_Y - 36;
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

  const slowX = s.slow !== null ? nCX(s.slow) : -100;
  const fastX = s.fast !== null ? nCX(s.fast) : -100;
  const slowVis = s.slow !== null;
  const fastVis = s.fast !== null;

  const headX = nCX(0);

  // Check if slow and fast are at the same position
  const samePosition = s.slow !== null && s.fast !== null && s.slow === s.fast;

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
          }}>Linked List Cycle Detection</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            List: [1, 2, 3, 4, 5] with cycle at node 3 &nbsp;·&nbsp; Floyd's Tortoise and Hare &nbsp;·&nbsp; Use ← → keys or buttons
          </p>
        </div>

        {/* ── Step Title ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div style={{
            fontFamily: mono, fontSize: 14, fontWeight: 700,
            color: s.met ? C.meetC : C.text,
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
                  nextAddr={s.nextAddrs[i]}
                  visible={true}
                  highlight={s.met && i === s.slow}
                />
              ))}

              {/* Regular arrows between nodes */}
              {s.arrows.map(([from, to], idx) => {
                const x1 = nRX(from);
                const x2 = nX(to);
                return <Arrow key={idx} x1={x1} x2={x2} visible={true} />;
              })}

              {/* Cycle arrow (curved, from node 5 back to node 3) */}
              <CycleArrow visible={s.cycleArrow} />

              {/* Pointer tags */}
              {samePosition ? (
                // Both pointers at same position - show combined tag
                <div style={{
                  position: 'absolute', left: slowX, top: BOX_Y + NH + 10,
                  transform: 'translateX(-50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  transition: T, opacity: 1, zIndex: 5,
                }}>
                  <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent', borderBottom: `6px solid ${s.met ? C.meetC : C.dim}`,
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
                  {s.met && (
                    <div style={{
                      fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.meetC,
                      background: C.meetC + '18', padding: '2px 8px', borderRadius: 4,
                      marginTop: 4, letterSpacing: 1,
                    }}>MET!</div>
                  )}
                </div>
              ) : (
                <>
                  <PointerTag x={slowX} label="slow" color={C.slowC} below={true} visible={slowVis} />
                  <PointerTag x={fastX} label="fast" color={C.fastC} below={true} visible={fastVis} />
                </>
              )}

              {/* Result highlight */}
              {s.result === true && (
                <div style={{
                  position: 'absolute', left: nX(2) - 6, top: BOX_Y - 22,
                  width: nRX(4) - nX(2) + 12, height: NH + 40,
                  border: `2px solid ${C.meetC}`, borderRadius: 14,
                  opacity: 0.35, pointerEvents: 'none',
                  boxShadow: `0 0 20px rgba(248,113,113,0.2)`,
                  transition: T,
                }} />
              )}
            </div>
          </div>
        </div>

        {/* ── Description ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${s.met ? C.meetC : C.accent}`,
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

        {/* ── Legend ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '12px 18px', marginBottom: 16,
          display: 'flex', gap: 24, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.slowC }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>slow (1 step)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.fastC }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>fast (2 steps)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.cycleC }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>cycle link</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.meetC }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>meeting point</span>
          </div>
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
