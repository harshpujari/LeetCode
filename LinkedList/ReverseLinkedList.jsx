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
  nullC: '#475569', prevC: '#fb923c', currC: '#38bdf8', nxtC: '#4ade80',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Node Data
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
const NW = 112, NH = 48, STRIDE = 152, NULL_W = 52;
const BOX_Y = 52;
const ARROW_Y = BOX_Y + NH / 2;
const VIS_H = 195;

const nX = (i) => 60 + i * STRIDE;
const nCX = (i) => nX(i) + NW / 2;
const nRX = (i) => nX(i) + NW;
const nlX = () => nX(5);
const nlCX = () => nlX() + NULL_W / 2;
// Left null (for reversed arrows pointing to prev=None)
const lnlX = () => 0;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'prev = None', ind: 0 },
  { t: 'curr = head', ind: 0 },
  { t: '', ind: 0 },
  { t: 'while curr:', ind: 0 },
  { t: 'nxt = curr.next', ind: 1 },
  { t: 'curr.next = prev', ind: 1 },
  { t: 'prev = curr', ind: 1 },
  { t: 'curr = nxt', ind: 1 },
  { t: '', ind: 0 },
  { t: 'return prev', ind: 0 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// Each step tracks:
//   arrows: array of [fromIdx, toIdx] where -1 = left NULL, 5 = right NULL
//   prev, curr, nxt: node index or null or 'lnull'(left null) or 'rnull'(right null)
//   nextAddrs: what each node's NEXT field displays
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Linked List",
    desc: "head → 1 → 2 → 3 → 4 → 5 → NULL. Goal: reverse the entire list so it becomes 5 → 4 → 3 → 2 → 1 → NULL.",
    prev: null, curr: null, nxt: null,
    arrows: [[0,1],[1,2],[2,3],[3,4],[4,'rn']],
    nextAddrs: ['0x2A','0x47','0x83','0xB1','NULL'],
    codeHL: [], result: false,
  },
  {
    title: "Initialize prev & curr",
    desc: "prev = None, curr = head — prev starts as None (nothing behind us yet). curr points to the first node (0x1F, value 1).",
    prev: 'lnull', curr: 0, nxt: null,
    arrows: [[0,1],[1,2],[2,3],[3,4],[4,'rn']],
    nextAddrs: ['0x2A','0x47','0x83','0xB1','NULL'],
    codeHL: [0, 1], result: false,
  },
  // ── Iteration 1: curr=node0 (value 1) ──
  {
    title: "Iter 1 — Save next pointer",
    desc: "nxt = curr.next — Save reference to node 2 (0x2A) before we break the link. nxt now points to node 2.",
    prev: 'lnull', curr: 0, nxt: 1,
    arrows: [[0,1],[1,2],[2,3],[3,4],[4,'rn']],
    nextAddrs: ['0x2A','0x47','0x83','0xB1','NULL'],
    codeHL: [3, 4], result: false,
  },
  {
    title: "Iter 1 — Reverse the link",
    desc: "curr.next = prev — Node 1's next pointer changes from 0x2A to NULL (prev is None). The link 1→2 is broken; node 1 now points backward to nothing.",
    prev: 'lnull', curr: 0, nxt: 1,
    arrows: [[0,'ln'],[1,2],[2,3],[3,4],[4,'rn']],
    nextAddrs: ['NULL','0x47','0x83','0xB1','NULL'],
    codeHL: [3, 5], result: false,
  },
  {
    title: "Iter 1 — Advance prev & curr",
    desc: "prev = curr (prev → node 1), curr = nxt (curr → node 2). We've successfully reversed node 1. Move on to node 2.",
    prev: 0, curr: 1, nxt: null,
    arrows: [[0,'ln'],[1,2],[2,3],[3,4],[4,'rn']],
    nextAddrs: ['NULL','0x47','0x83','0xB1','NULL'],
    codeHL: [6, 7], result: false,
  },
  // ── Iteration 2: curr=node1 (value 2) ──
  {
    title: "Iter 2 — Save next pointer",
    desc: "nxt = curr.next — Save reference to node 3 (0x47). nxt now points to node 3.",
    prev: 0, curr: 1, nxt: 2,
    arrows: [[0,'ln'],[1,2],[2,3],[3,4],[4,'rn']],
    nextAddrs: ['NULL','0x47','0x83','0xB1','NULL'],
    codeHL: [3, 4], result: false,
  },
  {
    title: "Iter 2 — Reverse the link",
    desc: "curr.next = prev — Node 2's next pointer changes from 0x47 to 0x1F (node 1). Now 2 → 1 → NULL. The forward link 2→3 is broken.",
    prev: 0, curr: 1, nxt: 2,
    arrows: [[0,'ln'],[1,0],[2,3],[3,4],[4,'rn']],
    nextAddrs: ['NULL','0x1F','0x83','0xB1','NULL'],
    codeHL: [3, 5], result: false,
  },
  {
    title: "Iter 2 — Advance prev & curr",
    desc: "prev = curr (prev → node 2), curr = nxt (curr → node 3). Reversed portion: 2 → 1 → NULL.",
    prev: 1, curr: 2, nxt: null,
    arrows: [[0,'ln'],[1,0],[2,3],[3,4],[4,'rn']],
    nextAddrs: ['NULL','0x1F','0x83','0xB1','NULL'],
    codeHL: [6, 7], result: false,
  },
  // ── Iteration 3: curr=node2 (value 3) ──
  {
    title: "Iter 3 — Save next pointer",
    desc: "nxt = curr.next — Save reference to node 4 (0x83).",
    prev: 1, curr: 2, nxt: 3,
    arrows: [[0,'ln'],[1,0],[2,3],[3,4],[4,'rn']],
    nextAddrs: ['NULL','0x1F','0x83','0xB1','NULL'],
    codeHL: [3, 4], result: false,
  },
  {
    title: "Iter 3 — Reverse the link",
    desc: "curr.next = prev — Node 3's next pointer changes from 0x83 to 0x2A (node 2). Now 3 → 2 → 1 → NULL.",
    prev: 1, curr: 2, nxt: 3,
    arrows: [[0,'ln'],[1,0],[2,1],[3,4],[4,'rn']],
    nextAddrs: ['NULL','0x1F','0x2A','0xB1','NULL'],
    codeHL: [3, 5], result: false,
  },
  {
    title: "Iter 3 — Advance prev & curr",
    desc: "prev = curr (prev → node 3), curr = nxt (curr → node 4). Reversed: 3 → 2 → 1 → NULL.",
    prev: 2, curr: 3, nxt: null,
    arrows: [[0,'ln'],[1,0],[2,1],[3,4],[4,'rn']],
    nextAddrs: ['NULL','0x1F','0x2A','0xB1','NULL'],
    codeHL: [6, 7], result: false,
  },
  // ── Iteration 4: curr=node3 (value 4) ──
  {
    title: "Iter 4 — Save next pointer",
    desc: "nxt = curr.next — Save reference to node 5 (0xB1).",
    prev: 2, curr: 3, nxt: 4,
    arrows: [[0,'ln'],[1,0],[2,1],[3,4],[4,'rn']],
    nextAddrs: ['NULL','0x1F','0x2A','0xB1','NULL'],
    codeHL: [3, 4], result: false,
  },
  {
    title: "Iter 4 — Reverse the link",
    desc: "curr.next = prev — Node 4's next pointer changes from 0xB1 to 0x47 (node 3). Now 4 → 3 → 2 → 1 → NULL.",
    prev: 2, curr: 3, nxt: 4,
    arrows: [[0,'ln'],[1,0],[2,1],[3,2],[4,'rn']],
    nextAddrs: ['NULL','0x1F','0x2A','0x47','NULL'],
    codeHL: [3, 5], result: false,
  },
  {
    title: "Iter 4 — Advance prev & curr",
    desc: "prev = curr (prev → node 4), curr = nxt (curr → node 5). Reversed: 4 → 3 → 2 → 1 → NULL.",
    prev: 3, curr: 4, nxt: null,
    arrows: [[0,'ln'],[1,0],[2,1],[3,2],[4,'rn']],
    nextAddrs: ['NULL','0x1F','0x2A','0x47','NULL'],
    codeHL: [6, 7], result: false,
  },
  // ── Iteration 5: curr=node4 (value 5) ──
  {
    title: "Iter 5 — Save next pointer",
    desc: "nxt = curr.next — Node 5's next is NULL. nxt = None.",
    prev: 3, curr: 4, nxt: 'rnull',
    arrows: [[0,'ln'],[1,0],[2,1],[3,2],[4,'rn']],
    nextAddrs: ['NULL','0x1F','0x2A','0x47','NULL'],
    codeHL: [3, 4], result: false,
  },
  {
    title: "Iter 5 — Reverse the link",
    desc: "curr.next = prev — Node 5's next pointer changes from NULL to 0x83 (node 4). Now 5 → 4 → 3 → 2 → 1 → NULL. All links reversed!",
    prev: 3, curr: 4, nxt: 'rnull',
    arrows: [[0,'ln'],[1,0],[2,1],[3,2],[4,3]],
    nextAddrs: ['NULL','0x1F','0x2A','0x47','0x83'],
    codeHL: [3, 5], result: false,
  },
  {
    title: "Iter 5 — Advance prev & curr",
    desc: "prev = curr (prev → node 5), curr = nxt (curr = None). curr is None → while loop exits.",
    prev: 4, curr: 'rnull', nxt: null,
    arrows: [[0,'ln'],[1,0],[2,1],[3,2],[4,3]],
    nextAddrs: ['NULL','0x1F','0x2A','0x47','0x83'],
    codeHL: [6, 7], result: false,
  },
  {
    title: "Return Result ✅",
    desc: "return prev — prev points to node 5 (0xB1), which is the new head. Final list: 5 → 4 → 3 → 2 → 1 → NULL. Done!",
    prev: 4, curr: null, nxt: null,
    arrows: [[0,'ln'],[1,0],[2,1],[3,2],[4,3]],
    nextAddrs: ['NULL','0x1F','0x2A','0x47','0x83'],
    codeHL: [9], result: true,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const mono = "'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', 'JetBrains Mono', monospace";
const sans = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const T = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

function NodeBox({ x, node, nextAddr, visible }) {
  const reversed = nextAddr !== 'NULL' && nextAddr !== node.addr;
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

function NullMarker({ x, visible, side }) {
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
      {/* Arrowhead */}
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

  // ── Pointer positions ──
  const ptrX = (val) => {
    if (val === null) return -100;
    if (val === 'lnull') return lnlX() + NULL_W / 2;
    if (val === 'rnull') return nlCX();
    return nCX(val);
  };

  const prevX = ptrX(s.prev);
  const currX = ptrX(s.curr);
  const nxtX = ptrX(s.nxt);
  const prevVis = s.prev !== null;
  const currVis = s.curr !== null;
  const nxtVis = s.nxt !== null;

  // Show left NULL when prev=None is visible
  const showLeftNull = s.prev === 'lnull' || s.arrows.some(([f, t]) => t === 'ln');
  // Show right NULL always (original end or nxt=None)
  const showRightNull = s.arrows.some(([f, t]) => t === 'rn') || s.nxt === 'rnull';

  const headX = nCX(0);

  // Check overlap of pointers for combined display
  const ptrs = [];
  if (prevVis) ptrs.push({ label: 'prev', color: C.prevC, x: prevX });
  if (currVis) ptrs.push({ label: 'curr', color: C.currC, x: currX });
  if (nxtVis) ptrs.push({ label: 'nxt', color: C.nxtC, x: nxtX });

  // Group by position
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
          }}>Reverse Linked List</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            List: [1, 2, 3, 4, 5] &nbsp;·&nbsp; Iterative approach &nbsp;·&nbsp; Use ← → keys or buttons to step through
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
                  nextAddr={s.nextAddrs[i]}
                  visible={true}
                />
              ))}

              {/* Left NULL marker (for prev=None) */}
              <NullMarker x={lnlX()} visible={showLeftNull} side="left" />

              {/* Right NULL marker */}
              <NullMarker x={nlX()} visible={showRightNull} side="right" />

              {/* Arrows */}
              {s.arrows.map(([from, to], idx) => {
                let x1, x2, reversed = false, dashed = false;
                if (to === 'rn') {
                  // Forward to right NULL
                  x1 = nRX(from);
                  x2 = nlX();
                  dashed = true;
                } else if (to === 'ln') {
                  // Reversed to left NULL
                  x1 = nX(from);
                  x2 = lnlX() + NULL_W;
                  reversed = true;
                  dashed = true;
                } else if (to < from) {
                  // Reversed arrow
                  x1 = nX(from);
                  x2 = nRX(to);
                  reversed = true;
                } else {
                  // Forward arrow
                  x1 = nRX(from);
                  x2 = nX(to);
                }
                return <Arrow key={idx} x1={x1} x2={x2} visible={true} dashed={dashed} reversed={reversed} />;
              })}

              {/* Pointer tags (below nodes) */}
              {Object.values(groups).map((group, gi) => {
                const x = group[0].x;
                if (group.length === 1) {
                  return <PointerTag key={gi} x={x} label={group[0].label} color={group[0].color} below={true} visible={true} />;
                }
                // Multiple pointers at same position
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
              {s.result && (
                <div style={{
                  position: 'absolute', left: nX(0) - 6, top: BOX_Y - 22,
                  width: nRX(4) - nX(0) + 12, height: NH + 40,
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
