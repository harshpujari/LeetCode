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
  prevC: '#fb923c', leftC: '#38bdf8', rightC: '#a78bfa',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Node Data: [1, 2, 2, 1] — a palindrome
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NODES = [
  { data: 1, addr: '0x1A' },
  { data: 2, addr: '0x2B' },
  { data: 2, addr: '0x3C' },
  { data: 1, addr: '0x4D' },
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
const nlX = () => nX(4);
const lnlX = () => 0;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: '# 1. Find middle using slow/fast', ind: 0 },
  { t: 'slow = fast = head', ind: 0 },
  { t: 'while fast and fast.next:', ind: 0 },
  { t: 'slow = slow.next', ind: 1 },
  { t: 'fast = fast.next.next', ind: 1 },
  { t: '', ind: 0 },
  { t: '# 2. Reverse second half', ind: 0 },
  { t: 'prev = None', ind: 0 },
  { t: 'while slow:', ind: 0 },
  { t: 'slow.next, prev, slow = prev, slow, slow.next', ind: 1 },
  { t: '', ind: 0 },
  { t: '# 3. Compare first and reversed second half', ind: 0 },
  { t: 'left, right = head, prev', ind: 0 },
  { t: 'while right:', ind: 0 },
  { t: 'if left.val != right.val:', ind: 1 },
  { t: 'return False', ind: 2 },
  { t: 'left = left.next', ind: 1 },
  { t: 'right = right.next', ind: 1 },
  { t: 'return True', ind: 0 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// Each step: phase, pointers, arrows (direction info), nextAddrs, code highlights
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Linked List",
    desc: "head → 1 → 2 → 2 → 1 → NULL. Goal: determine if this is a palindrome (reads the same forwards and backwards). Three phases: find middle, reverse second half, compare.",
    phase: 1,
    arrows: [[0,1],[1,2],[2,3],[3,'rn']],
    nextAddrs: ['0x2B','0x3C','0x4D','NULL'],
    ptrs: [],
    showLeftNull: false, showRightNull: true,
    codeHL: [], result: null,
  },
  // ── Phase 1: Find middle ──
  {
    title: "Phase 1 — Initialize slow & fast",
    desc: "slow = fast = head — Both start at node 1. We'll use slow/fast pointers to find the middle of the list.",
    phase: 1,
    arrows: [[0,1],[1,2],[2,3],[3,'rn']],
    nextAddrs: ['0x2B','0x3C','0x4D','NULL'],
    ptrs: [
      { label: 'slow', color: C.slowC, idx: 0 },
      { label: 'fast', color: C.fastC, idx: 0 },
    ],
    showLeftNull: false, showRightNull: true,
    codeHL: [0, 1], result: null,
  },
  {
    title: "Phase 1 — Iter 1: Move pointers",
    desc: "fast (node 1) and fast.next (node 2) both exist → enter loop. slow moves to node 2, fast jumps to node 3 (value 2).",
    phase: 1,
    arrows: [[0,1],[1,2],[2,3],[3,'rn']],
    nextAddrs: ['0x2B','0x3C','0x4D','NULL'],
    ptrs: [
      { label: 'slow', color: C.slowC, idx: 1 },
      { label: 'fast', color: C.fastC, idx: 2 },
    ],
    showLeftNull: false, showRightNull: true,
    codeHL: [2, 3, 4], result: null,
  },
  {
    title: "Phase 1 — Iter 2: Check condition",
    desc: "fast is at node 3 (value 2) and fast.next is node 4 (value 1) — both exist. Enter loop. slow moves to node 3, fast jumps to NULL (past end).",
    phase: 1,
    arrows: [[0,1],[1,2],[2,3],[3,'rn']],
    nextAddrs: ['0x2B','0x3C','0x4D','NULL'],
    ptrs: [
      { label: 'slow', color: C.slowC, idx: 2 },
    ],
    showLeftNull: false, showRightNull: true,
    codeHL: [2, 3, 4], result: null,
  },
  {
    title: "Phase 1 — Loop exits",
    desc: "fast is None → while condition fails. slow is at node 3 (index 2, value 2). This is the start of the second half. Now we reverse from slow onward.",
    phase: 1,
    arrows: [[0,1],[1,2],[2,3],[3,'rn']],
    nextAddrs: ['0x2B','0x3C','0x4D','NULL'],
    ptrs: [
      { label: 'slow', color: C.slowC, idx: 2 },
    ],
    showLeftNull: false, showRightNull: true,
    codeHL: [2], result: null,
  },
  // ── Phase 2: Reverse second half ──
  {
    title: "Phase 2 — Init prev = None",
    desc: "prev = None. We'll reverse the second half (nodes 3 and 4) in place. slow is at node 3 (value 2).",
    phase: 2,
    arrows: [[0,1],[1,2],[2,3],[3,'rn']],
    nextAddrs: ['0x2B','0x3C','0x4D','NULL'],
    ptrs: [
      { label: 'slow', color: C.slowC, idx: 2 },
      { label: 'prev', color: C.prevC, idx: 'rnull' },
    ],
    showLeftNull: false, showRightNull: true,
    codeHL: [6, 7], result: null,
  },
  {
    title: "Phase 2 — Reverse node 3",
    desc: "slow.next, prev, slow = prev, slow, slow.next — Node 3's next changes from 0x4D to NULL (prev). prev moves to node 3, slow moves to node 4.",
    phase: 2,
    arrows: [[0,1],[1,2],[2,'rn'],[3,'rn']],
    nextAddrs: ['0x2B','0x3C','NULL','NULL'],
    ptrs: [
      { label: 'slow', color: C.slowC, idx: 3 },
      { label: 'prev', color: C.prevC, idx: 2 },
    ],
    showLeftNull: false, showRightNull: true,
    codeHL: [8, 9], result: null,
  },
  {
    title: "Phase 2 — Reverse node 4",
    desc: "Node 4's next changes from NULL to 0x3C (node 3). prev moves to node 4, slow becomes None. Second half reversed: 1 → 2 → NULL.",
    phase: 2,
    arrows: [[0,1],[1,2],[2,'rn'],[3,2]],
    nextAddrs: ['0x2B','0x3C','NULL','0x3C'],
    ptrs: [
      { label: 'prev', color: C.prevC, idx: 3 },
    ],
    showLeftNull: false, showRightNull: true,
    codeHL: [8, 9], result: null,
  },
  {
    title: "Phase 2 — Reverse complete",
    desc: "slow is None → loop exits. prev points to node 4 (new head of reversed second half). Reversed second half: 1(node4) → 2(node3) → NULL.",
    phase: 2,
    arrows: [[0,1],[1,2],[2,'rn'],[3,2]],
    nextAddrs: ['0x2B','0x3C','NULL','0x3C'],
    ptrs: [
      { label: 'prev', color: C.prevC, idx: 3 },
    ],
    showLeftNull: false, showRightNull: true,
    codeHL: [8], result: null,
  },
  // ── Phase 3: Compare ──
  {
    title: "Phase 3 — Init left & right",
    desc: "left = head (node 1, value 1), right = prev (node 4, value 1). We compare values from each half walking inward.",
    phase: 3,
    arrows: [[0,1],[1,2],[2,'rn'],[3,2]],
    nextAddrs: ['0x2B','0x3C','NULL','0x3C'],
    ptrs: [
      { label: 'left', color: C.leftC, idx: 0 },
      { label: 'right', color: C.rightC, idx: 3 },
    ],
    showLeftNull: false, showRightNull: true,
    codeHL: [11, 12], result: null,
  },
  {
    title: "Phase 3 — Compare #1",
    desc: "left.val (1) == right.val (1) ✓ — Values match! Move left to node 2, right to node 3. Both have value 2.",
    phase: 3,
    arrows: [[0,1],[1,2],[2,'rn'],[3,2]],
    nextAddrs: ['0x2B','0x3C','NULL','0x3C'],
    ptrs: [
      { label: 'left', color: C.leftC, idx: 1 },
      { label: 'right', color: C.rightC, idx: 2 },
    ],
    showLeftNull: false, showRightNull: true,
    codeHL: [13, 14, 16, 17], result: null,
  },
  {
    title: "Phase 3 — Compare #2",
    desc: "left.val (2) == right.val (2) ✓ — Values match! Move right to right.next which is NULL. Loop exits.",
    phase: 3,
    arrows: [[0,1],[1,2],[2,'rn'],[3,2]],
    nextAddrs: ['0x2B','0x3C','NULL','0x3C'],
    ptrs: [
      { label: 'left', color: C.leftC, idx: 2 },
    ],
    showLeftNull: false, showRightNull: true,
    codeHL: [13, 14, 16, 17], result: null,
  },
  {
    title: "Return True ✅",
    desc: "All comparisons matched! return True — The list [1, 2, 2, 1] is a palindrome. Done!",
    phase: 3,
    arrows: [[0,1],[1,2],[2,'rn'],[3,2]],
    nextAddrs: ['0x2B','0x3C','NULL','0x3C'],
    ptrs: [],
    showLeftNull: false, showRightNull: true,
    codeHL: [18], result: true,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const mono = "'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', 'JetBrains Mono', monospace";
const sans = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const T = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

function NodeBox({ x, node, nextAddr, visible }) {
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
        border: `2px solid ${C.accent}`,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: `0 0 14px ${C.accentGlow}`,
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

function Arrow({ x1, x2, visible, dashed, reversed }) {
  const left = Math.min(x1, x2);
  const w = Math.abs(x2 - x1);
  const color = reversed ? C.purple : C.orange;
  const goingLeft = x2 < x1;
  return (
    <div style={{
      position: 'absolute', left, top: ARROW_Y - 1,
      width: w, height: 2, transition: T,
      opacity: visible ? 0.75 : 0, zIndex: 1,
      background: dashed ? 'none' : color,
      borderTop: dashed ? `2px dashed ${color}` : 'none',
    }}>
      {goingLeft ? (
        <div style={{
          position: 'absolute', left: -6, top: -4,
          width: 0, height: 0,
          borderRight: `7px solid ${color}`,
          borderTop: '4.5px solid transparent',
          borderBottom: '4.5px solid transparent',
          opacity: visible && w > 10 ? 1 : 0, transition: 'opacity 0.3s',
        }} />
      ) : (
        <div style={{
          position: 'absolute', right: -6, top: -4,
          width: 0, height: 0,
          borderLeft: `7px solid ${color}`,
          borderTop: '4.5px solid transparent',
          borderBottom: '4.5px solid transparent',
          opacity: visible && w > 10 ? 1 : 0, transition: 'opacity 0.3s',
        }} />
      )}
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

function PhaseBadge({ phase }) {
  const labels = { 1: 'Find Middle', 2: 'Reverse 2nd Half', 3: 'Compare Halves' };
  const colors = { 1: C.slowC, 2: C.prevC, 3: C.leftC };
  return (
    <div style={{
      fontFamily: mono, fontSize: 10, fontWeight: 700,
      color: colors[phase], background: colors[phase] + '18',
      padding: '3px 10px', borderRadius: 6,
      border: `1px solid ${colors[phase]}30`,
      letterSpacing: 1,
    }}>Phase {phase}: {labels[phase]}</div>
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

  const headX = nCX(0);

  // Pointer positions
  const ptrX = (val) => {
    if (val === 'rnull') return nlX() + NULL_W / 2;
    if (val === 'lnull') return lnlX() + NULL_W / 2;
    return nCX(val);
  };

  // Group overlapping pointers
  const groups = {};
  s.ptrs.forEach(p => {
    const x = typeof p.idx === 'number' ? nCX(p.idx) : ptrX(p.idx);
    const k = Math.round(x);
    if (!groups[k]) groups[k] = [];
    groups[k].push({ ...p, x });
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
          }}>Palindrome Linked List</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            List: [1, 2, 2, 1] &nbsp;·&nbsp; Find middle → Reverse 2nd half → Compare &nbsp;·&nbsp; Use ← → keys or buttons
          </p>
        </div>

        {/* ── Step Title ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.text,
            }}>{s.title}</div>
            <PhaseBadge phase={s.phase} />
          </div>
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
            <div style={{ position: 'relative', width: 780, height: VIS_H, margin: '0 auto' }}>

              {/* HEAD label */}
              <PointerTag x={headX} label="HEAD" color={C.accent} below={false} visible={true} />

              {/* Nodes */}
              {NODES.map((node, i) => (
                <NodeBox key={i} x={nX(i)} node={node} nextAddr={s.nextAddrs[i]} visible={true} />
              ))}

              {/* Right NULL */}
              <NullMarker x={nlX()} visible={s.showRightNull} />

              {/* Arrows */}
              {s.arrows.map(([from, to], idx) => {
                let x1, x2, reversed = false, dashed = false;
                if (to === 'rn') {
                  x1 = nRX(from);
                  x2 = nlX();
                  dashed = true;
                } else if (to < from) {
                  x1 = nX(from);
                  x2 = nRX(to);
                  reversed = true;
                } else {
                  x1 = nRX(from);
                  x2 = nX(to);
                }
                return <Arrow key={idx} x1={x1} x2={x2} visible={true} dashed={dashed} reversed={reversed} />;
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

              {/* Result highlight */}
              {s.result === true && (
                <div style={{
                  position: 'absolute', left: nX(0) - 6, top: BOX_Y - 22,
                  width: nRX(3) - nX(0) + 12, height: NH + 40,
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
