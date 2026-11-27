import { useState, useEffect } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Theme
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const C = {
  bg: '#0a0e17', surface: '#111827', surface2: '#1a2340',
  border: '#2a3555', text: '#e2e8f0', dim: '#64748b',
  accent: '#38bdf8', accentGlow: 'rgba(56,189,248,0.15)',
  green: '#4ade80', greenGlow: 'rgba(74,222,128,0.15)',
  orange: '#fb923c', orangeGlow: 'rgba(251,146,60,0.15)',
  red: '#f87171', redGlow: 'rgba(248,113,113,0.15)',
  purple: '#a78bfa', purpleGlow: 'rgba(167,139,250,0.15)',
  nullC: '#475569',
};

const mono = "'Menlo','Monaco','Cascadia Code','Consolas','JetBrains Mono',monospace";
const sans = "system-ui,-apple-system,'Segoe UI',sans-serif";
const T = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Problem Data
// listA = [4, 1, 8, 4, 5]
// listB = [5, 6, 1, 8, 4, 5]
// Lists share the tail starting at node 8 (same object, not just same value)
//
//   A:      4 → 1 ↘
//                   8 → 4 → 5 → NULL
//   B:  5 → 6 → 1 ↗
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NODES = {
  A0: { val: 4, addr: '0x1A', row: 'top', col: 1, next: 'A1', list: 'A', head: 'headA' },
  A1: { val: 1, addr: '0x2B', row: 'top', col: 2, next: 'C0', list: 'A' },
  B0: { val: 5, addr: '0x5E', row: 'bot', col: 0, next: 'B1', list: 'B', head: 'headB' },
  B1: { val: 6, addr: '0x6F', row: 'bot', col: 1, next: 'B2', list: 'B' },
  B2: { val: 1, addr: '0x7A', row: 'bot', col: 2, next: 'C0', list: 'B' },
  C0: { val: 8, addr: '0x8C', row: 'mid', col: 3, next: 'C1', list: 'C' },
  C1: { val: 4, addr: '0x9D', row: 'mid', col: 4, next: 'C2', list: 'C' },
  C2: { val: 5, addr: '0xA4', row: 'mid', col: 5, next: null, list: 'C' },
};
const NODE_IDS = Object.keys(NODES);
const NULL_COL = 6;

// Pointer paths (index = number of moves made). null = None.
const PATH_A = ['A0', 'A1', 'C0', 'C1', 'C2', null, 'B0', 'B1', 'B2', 'C0'];
const PATH_B = ['B0', 'B1', 'B2', 'C0', 'C1', 'C2', null, 'A0', 'A1', 'C0'];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Layout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NW = 88, STRIDE = 106, ADDR_H = 16, BH = 46, NULL_W = 56;
const ROW_Y = { top: 40, mid: 150, bot: 260 };
const VIS_W = 716, VIS_H = 370;

const colX = (col) => 14 + col * STRIDE;
const boxTop = (row) => ROW_Y[row] + ADDR_H;
const boxCY = (row) => boxTop(row) + BH / 2;
const posOf = (id) => id === null
  ? { x: colX(NULL_COL), cx: colX(NULL_COL) + NULL_W / 2, row: 'mid' }
  : { x: colX(NODES[id].col), cx: colX(NODES[id].col) + NW / 2, row: NODES[id].row };

const nodeName = (id) => id === null ? 'None' : `${NODES[id].val} @${NODES[id].addr}`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'if not headA or not headB:', ind: 0 },
  { t: 'return None', ind: 1 },
  { t: '', ind: 0 },
  { t: 'ptrA = headA', ind: 0 },
  { t: 'ptrB = headB', ind: 0 },
  { t: '', ind: 0 },
  { t: 'while ptrA != ptrB:', ind: 0 },
  { t: 'ptrA = ptrA.next if ptrA else headB', ind: 1 },
  { t: 'ptrB = ptrB.next if ptrB else headA', ind: 1 },
  { t: '', ind: 0 },
  { t: 'return ptrA', ind: 0 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// Each step tracks:
//   pA, pB: node id or null (None); undefined = not yet assigned
//   moves: number of moves each pointer has made
//   calc:  { label, result, note, color } for the StatePanel card
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function describeMove(name, prev, next, otherHead) {
  if (prev === null) return `${name} was None → jumps to ${otherHead} (${nodeName(next)}).`;
  if (next === null) return `${name} moves ${NODES[prev].val} → None (end of its list).`;
  return `${name} moves ${nodeName(prev)} → ${nodeName(next)}.`;
}

function buildSteps() {
  const steps = [
    {
      title: 'Initial Lists',
      desc: 'listA = [4, 1, 8, 4, 5] and listB = [5, 6, 1, 8, 4, 5]. Both lists merge into the same tail starting at node 8 @0x8C. Note: the two nodes with value 1 are different objects (0x2B vs 0x7A) — intersection is by reference, not by value. Lengths differ (5 vs 6), so walking both in lockstep would never line up… unless each pointer also walks the other list.',
      pA: undefined, pB: undefined, moves: 0,
      codeHL: [], done: false, calc: null,
    },
    {
      title: 'Guard — empty lists?',
      desc: 'if not headA or not headB — neither list is empty, so an intersection is possible. Continue.',
      pA: undefined, pB: undefined, moves: 0,
      codeHL: [0], done: false,
      calc: { label: 'not headA or not headB', result: 'False', note: '→ continue', color: C.green },
    },
    {
      title: 'Initialize ptrA & ptrB',
      desc: 'ptrA = headA (node 4 @0x1A), ptrB = headB (node 5 @0x5E). Each pointer will walk its own list, then switch to the head of the other list when it falls off the end.',
      pA: PATH_A[0], pB: PATH_B[0], moves: 0,
      codeHL: [3, 4], done: false, calc: null,
    },
  ];

  for (let k = 1; k < PATH_A.length; k++) {
    const pa0 = PATH_A[k - 1], pb0 = PATH_B[k - 1];
    const pa = PATH_A[k], pb = PATH_B[k];
    let extra = '';
    if (pa0 === null) extra = ' ptrA has now covered list A (a + c = 5 nodes) plus the None hop, and starts on list B.';
    if (pb0 === null) extra = ' ptrB has now covered list B (b + c = 6 nodes) plus the None hop, and starts on list A. The 1-node head start of list B has been cancelled out.';
    if (pa === pb) extra = ` Both pointers land on the same node! Each has travelled a + c + 1 + b = 2 + 3 + 1 + 3 = 9 moves.`;
    const switched = pa0 === null || pb0 === null;
    steps.push({
      title: `Iter ${k} — ${pa === pb ? 'Pointers meet!' : switched ? 'Switch lists' : 'Advance both'}`,
      desc: `while ptrA != ptrB — ${nodeName(pa0)} ≠ ${nodeName(pb0)}, so enter the loop. ${describeMove('ptrA', pa0, pa, 'headB')} ${describeMove('ptrB', pb0, pb, 'headA')}${extra}`,
      pA: pa, pB: pb, moves: k,
      switchA: pa0 === null, switchB: pb0 === null,
      codeHL: [6, 7, 8], done: false,
      calc: {
        label: 'ptrA == ptrB ?',
        result: pa === pb ? 'True' : 'False',
        note: pa === pb ? '→ loop will exit' : '→ keep looping',
        color: pa === pb ? C.green : C.purple,
      },
    });
  }

  const last = PATH_A[PATH_A.length - 1];
  steps.push({
    title: 'Loop check — exit',
    desc: `while ptrA != ptrB — both are ${nodeName(last)}. Condition is False, so the loop exits. Had the lists not intersected, both pointers would have reached None at the same time (after a + b + 2 moves) and the loop would exit with None.`,
    pA: last, pB: last, moves: PATH_A.length - 1,
    codeHL: [6], done: false,
    calc: { label: 'ptrA != ptrB', result: 'False', note: '→ exit loop', color: C.green },
  });
  steps.push({
    title: 'Return intersection ✅',
    desc: `return ptrA — the intersection node is ${nodeName(last)}. Time O(m + n), extra space O(1): no hash set and no length counting needed, because switching lists equalizes the distance both pointers travel.`,
    pA: last, pB: last, moves: PATH_A.length - 1,
    codeHL: [10], done: true, calc: null,
  });
  return steps;
}

const STEPS = buildSteps();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Sub-components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const LIST_COLOR = { A: C.accent, B: C.orange, C: C.purple };

function NodeBox({ id, isAnswer }) {
  const n = NODES[id];
  const color = isAnswer ? C.green : LIST_COLOR[n.list];
  const nextAddr = n.next ? NODES[n.next].addr : 'NULL';
  return (
    <div style={{
      position: 'absolute', left: colX(n.col), top: ROW_Y[n.row],
      width: NW, transition: T, zIndex: 2,
    }}>
      <div style={{
        height: ADDR_H, textAlign: 'center', fontFamily: mono, fontSize: 10, fontWeight: 700,
        color: C.purple, letterSpacing: 1, whiteSpace: 'nowrap',
      }}>
        {n.head && <span style={{ color: LIST_COLOR[n.list] }}>{n.head} · </span>}
        {n.addr}
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', height: BH,
        border: `2px solid ${color}`, borderRadius: 8, overflow: 'hidden',
        boxShadow: isAnswer ? `0 0 18px ${C.greenGlow}` : `0 0 14px ${color}26`,
        transition: T,
      }}>
        <div style={{
          padding: '7px 6px 5px', textAlign: 'center',
          background: isAnswer ? C.greenGlow : C.surface2,
          borderRight: `1px solid ${C.border}`, transition: T,
        }}>
          <div style={{ fontFamily: mono, fontSize: 16, fontWeight: 700, color: C.green }}>{n.val}</div>
          <div style={{ fontFamily: mono, fontSize: 6.5, color: C.dim, letterSpacing: 1.5, marginTop: 1 }}>DATA</div>
        </div>
        <div style={{ padding: '7px 6px 5px', textAlign: 'center', background: C.surface }}>
          <div style={{
            fontFamily: mono, fontSize: 10, fontWeight: 600, lineHeight: '18px',
            color: n.next ? C.orange : C.nullC,
          }}>{nextAddr}</div>
          <div style={{ fontFamily: mono, fontSize: 6.5, color: C.dim, letterSpacing: 1.5, marginTop: 1 }}>NEXT</div>
        </div>
      </div>
    </div>
  );
}

function NullBox() {
  return (
    <div style={{
      position: 'absolute', left: colX(NULL_COL), top: boxTop('mid') + 6,
      width: NULL_W, height: BH - 12,
      border: `2px dashed ${C.nullC}`, borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.nullC, zIndex: 2,
    }}>NULL</div>
  );
}

function Arrows() {
  const lines = [];
  NODE_IDS.forEach((id) => {
    const n = NODES[id];
    const x1 = colX(n.col) + NW;
    const y1 = boxCY(n.row);
    let x2, y2;
    if (n.next === null) {
      x2 = colX(NULL_COL); y2 = boxCY('mid');
    } else {
      const m = NODES[n.next];
      x2 = colX(m.col);
      y2 = boxCY(m.row) + (n.row === 'top' && m.row === 'mid' ? -9 : n.row === 'bot' && m.row === 'mid' ? 9 : 0);
    }
    lines.push({ key: id, x1, y1, x2: x2 - 3, y2, color: LIST_COLOR[n.list] });
  });
  return (
    <svg width={VIS_W} height={VIS_H} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 1 }}>
      <defs>
        {Object.entries(LIST_COLOR).map(([k, col]) => (
          <marker key={k} id={`arr${k}`} markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
            <polygon points="0 0, 9 4.5, 0 9" fill={col} />
          </marker>
        ))}
      </defs>
      {lines.map((l) => {
        const listKey = Object.keys(LIST_COLOR).find(k => LIST_COLOR[k] === l.color);
        return (
          <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={l.color} strokeWidth="2" opacity="0.75"
            markerEnd={`url(#arr${listKey})`} />
        );
      })}
    </svg>
  );
}

function PointerTag({ id, label, color, above, visible, flash }) {
  const p = id === undefined ? { cx: -100, row: 'mid' } : posOf(id);
  const top = above ? ROW_Y[p.row] - 30 : boxTop(p.row) + BH + 6;
  const chip = (
    <div style={{
      fontFamily: mono, fontSize: 10, fontWeight: 700, color,
      background: color + '18', padding: '2px 8px', borderRadius: 4,
      letterSpacing: 1.5, whiteSpace: 'nowrap',
      boxShadow: flash ? `0 0 10px ${color}66` : 'none',
    }}>{label}</div>
  );
  const tri = (
    <div style={{
      width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
      [above ? 'borderTop' : 'borderBottom']: `6px solid ${color}`,
      [above ? 'marginTop' : 'marginBottom']: 2,
    }} />
  );
  return (
    <div style={{
      position: 'absolute', left: p.cx, top, transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      transition: T, opacity: visible ? 1 : 0, zIndex: 5,
    }}>
      {above ? <>{chip}{tri}</> : <>{tri}{chip}</>}
    </div>
  );
}

function Legend() {
  const items = [
    [C.accent, 'list A only'], [C.orange, 'list B only'],
    [C.purple, 'shared tail'], [C.green, 'intersection'],
  ];
  return (
    <div style={{
      display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
      padding: '6px 12px 16px', fontFamily: mono, fontSize: 10,
    }}>
      {items.map(([col, label]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: col }} />
          <span style={{ color: C.dim }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CodePanel({ highlighted }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{
        padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        fontFamily: mono, fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: 'uppercase',
      }}>Python Code — Two Pointers (Switch Heads)</div>
      <div style={{ padding: '6px 0', overflowX: 'auto' }}>
        {CODE.map((line, i) => {
          const hl = highlighted.includes(i);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '3px 14px 3px 0',
              background: hl ? C.accentGlow : 'transparent',
              borderLeft: `3px solid ${hl ? C.accent : 'transparent'}`,
              transition: 'background 0.3s, border-color 0.3s',
            }}>
              <span style={{
                fontFamily: mono, fontSize: 10, color: C.dim, width: 32, textAlign: 'right',
                marginRight: 14, userSelect: 'none', flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{
                fontFamily: mono, fontSize: 13, color: hl ? C.text : C.dim,
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
// State Panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function VarRow({ k, v, color, active }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 10px', borderRadius: 6,
      background: active ? color + '26' : C.surface2,
      border: `1px solid ${active ? color + '55' : C.border}`,
      transition: 'all 0.4s',
    }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>{k}</span>
      <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: active ? color : C.dim }}>{v}</span>
    </div>
  );
}

function StatePanel({ s }) {
  const fmt = (id) => id === undefined ? '—' : id === null ? 'None' : `${NODES[id].val} ${NODES[id].addr}`;
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{
        padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        fontFamily: mono, fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: 'uppercase',
      }}>Algo State</div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <VarRow k="ptrA" v={fmt(s.pA)} color={C.accent} active={s.pA !== undefined} />
        <VarRow k="ptrB" v={fmt(s.pB)} color={C.orange} active={s.pB !== undefined} />
        <VarRow k="moves" v={s.moves} color={C.purple} active={s.moves > 0} />
        <VarRow k="a / b / c" v="2 / 3 / 3" color={C.purple} active={false} />

        {(s.switchA || s.switchB) && (
          <div style={{
            padding: '8px 10px', borderRadius: 6, background: C.purpleGlow,
            border: `1px solid ${C.purple}44`, fontFamily: mono, fontSize: 10, color: C.purple,
          }}>
            ↺ {s.switchA ? 'ptrA → headB' : 'ptrB → headA'}
          </div>
        )}

        {s.calc && (
          <div style={{
            padding: '10px 10px', borderRadius: 6, marginTop: 4,
            background: s.calc.color + '26', border: `1px solid ${s.calc.color}44`, transition: 'all 0.4s',
          }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 0.5, marginBottom: 4 }}>{s.calc.label}</div>
            <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: s.calc.color }}>{s.calc.result}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginTop: 5 }}>{s.calc.note}</div>
          </div>
        )}

        {s.done && (
          <div style={{
            padding: '10px 10px', borderRadius: 6, background: C.greenGlow,
            border: `1px solid ${C.green}44`, textAlign: 'center',
          }}>
            <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.green }}>
              return {NODES[s.pA].val} ✓
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 3, letterSpacing: 0.5 }}>
              INTERSECTION @{NODES[s.pA].addr}
            </div>
          </div>
        )}
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

  const met = s.pA !== undefined && s.pA === s.pB;
  const answerId = s.done ? s.pA : null;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: sans, padding: '20px 12px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        input[type=range] {
          -webkit-appearance: none; width: 100%; height: 6px;
          background: ${C.border}; border-radius: 3px; outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
          background: ${C.accent}; cursor: pointer; box-shadow: 0 0 8px ${C.accentGlow};
        }
        input[type=range]::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: ${C.accent}; cursor: pointer;
          border: none; box-shadow: 0 0 8px ${C.accentGlow};
        }
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: mono, fontSize: 17, fontWeight: 700, color: C.accent, letterSpacing: -0.3, marginBottom: 4 }}>
            Intersection of Two Linked Lists
          </h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            A = [4, 1, 8, 4, 5] · B = [5, 6, 1, 8, 4, 5] · Two Pointers (switch heads) · Use ← → keys or buttons
          </p>
        </div>

        {/* ── Step Title ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: s.done || met ? C.green : C.text }}>{s.title}</div>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.dim, background: C.surface, padding: '3px 10px', borderRadius: 6 }}>
            Step {step + 1} / {total}
          </div>
        </div>

        {/* ── Visualization + State ── */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{
            flex: '1 1 500px', minWidth: 0, background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
              fontFamily: mono, fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: 'uppercase',
            }}>Lists A & B — shared tail</div>
            <div style={{ overflowX: 'auto', padding: '0 4px' }}>
              <div style={{ position: 'relative', width: VIS_W, height: VIS_H, margin: '0 auto' }}>
                <Arrows />
                {NODE_IDS.map((id) => <NodeBox key={id} id={id} isAnswer={id === answerId} />)}
                <NullBox />

                {/* Meeting halo */}
                {met && (
                  <div style={{
                    position: 'absolute', left: posOf(s.pA).x - 6, top: boxTop('mid') - 6,
                    width: NW + 12, height: BH + 12, borderRadius: 12,
                    border: `2px solid ${C.green}`, opacity: 0.5,
                    boxShadow: `0 0 20px ${C.greenGlow}`, pointerEvents: 'none', zIndex: 3,
                  }} />
                )}

                <PointerTag id={s.pA} label="ptrA" color={C.accent} above visible={s.pA !== undefined} flash={s.switchA} />
                <PointerTag id={s.pB} label="ptrB" color={C.orange} above={false} visible={s.pB !== undefined} flash={s.switchB} />
              </div>
            </div>
            <Legend />
          </div>

          <div style={{ width: 210, flexShrink: 0, flexGrow: 0 }}>
            <StatePanel s={s} />
          </div>
        </div>

        {/* ── Description ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${s.done ? C.green : C.accent}`,
          borderRadius: '0 10px 10px 0', padding: '14px 18px', marginBottom: 16,
        }}>
          <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, fontFamily: sans }}>{s.desc}</p>
        </div>

        {/* ── Code Panel ── */}
        <div style={{ marginBottom: 20 }}>
          <CodePanel highlighted={s.codeHL} />
        </div>

        {/* ── Controls ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
          <input
            type="range" min={0} max={total - 1} value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14 }}>
            <button
              onClick={() => setStep(0)}
              disabled={step === 0}
              style={{
                fontFamily: mono, fontSize: 11, fontWeight: 600, padding: '8px 14px', borderRadius: 8,
                background: C.surface2, color: step === 0 ? C.dim : C.text,
                border: `1px solid ${C.border}`, cursor: step === 0 ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >⏮ Reset</button>
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              style={{
                fontFamily: mono, fontSize: 12, fontWeight: 600, padding: '8px 20px', borderRadius: 8,
                background: step === 0 ? C.surface2 : C.accent + '20',
                color: step === 0 ? C.dim : C.accent,
                border: `1px solid ${step === 0 ? C.border : C.accent + '40'}`,
                cursor: step === 0 ? 'default' : 'pointer', transition: 'all 0.2s',
              }}
            >← Prev</button>
            <button
              onClick={() => setStep(Math.min(total - 1, step + 1))}
              disabled={step === total - 1}
              style={{
                fontFamily: mono, fontSize: 12, fontWeight: 600, padding: '8px 20px', borderRadius: 8,
                background: step === total - 1 ? C.surface2 : C.accent,
                color: step === total - 1 ? C.dim : '#0a0e17',
                border: `1px solid ${step === total - 1 ? C.border : C.accent}`,
                cursor: step === total - 1 ? 'default' : 'pointer', transition: 'all 0.2s',
              }}
            >Next →</button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: C.border, marginTop: 16, fontFamily: mono }}>
          ← → arrow keys · spacebar = next
        </p>
      </div>
    </div>
  );
}
