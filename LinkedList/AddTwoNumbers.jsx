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
  nullC: '#475569', l1C: '#38bdf8', l2C: '#fb923c', resC: '#4ade80',
  carryC: '#f87171',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Node Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// l1 = [2, 4, 3] represents 342
// l2 = [5, 6, 4] represents 465
// result = [7, 0, 8] represents 807
const L1 = [
  { data: 2, addr: '0x1A' },
  { data: 4, addr: '0x2B' },
  { data: 3, addr: '0x3C' },
];
const L2 = [
  { data: 5, addr: '0x4D' },
  { data: 6, addr: '0x5E' },
  { data: 4, addr: '0x6F' },
];
const RES = [
  { data: 7, addr: '0xA1' },
  { data: 0, addr: '0xB2' },
  { data: 8, addr: '0xC3' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Layout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NW = 100, NH = 48, STRIDE = 140, NULL_W = 52;
const ROW1_Y = 30;   // l1
const ROW2_Y = 110;  // l2
const ROW3_Y = 210;  // result
const VIS_H = 300;

const nX = (i) => 80 + i * STRIDE;
const nCX = (i) => nX(i) + NW / 2;
const nRX = (i) => nX(i) + NW;
const nlX = (count) => nX(count);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'dummy = ListNode()', ind: 0 },
  { t: 'current = dummy', ind: 0 },
  { t: 'carry = 0', ind: 0 },
  { t: '', ind: 0 },
  { t: 'while l1 or l2 or carry:', ind: 0 },
  { t: 'val1 = l1.val if l1 else 0', ind: 1 },
  { t: 'val2 = l2.val if l2 else 0', ind: 1 },
  { t: 'total = val1 + val2 + carry', ind: 1 },
  { t: 'carry = total // 10', ind: 1 },
  { t: 'current.next = ListNode(total % 10)', ind: 1 },
  { t: 'current = current.next', ind: 1 },
  { t: 'l1 = l1.next if l1 else None', ind: 1 },
  { t: 'l2 = l2.next if l2 else None', ind: 1 },
  { t: '', ind: 0 },
  { t: 'return dummy.next', ind: 0 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Setup",
    desc: "l1 = [2,4,3] represents 342. l2 = [5,6,4] represents 465. We need to add them digit by digit, producing the sum as a linked list.",
    l1Ptr: null, l2Ptr: null, carry: 0,
    resVisible: 0, computation: null,
    codeHL: [], result: false,
  },
  {
    title: "Initialize Variables",
    desc: "Create a dummy node as anchor for the result list. Set current = dummy and carry = 0. We'll build the result by appending nodes to current.",
    l1Ptr: 0, l2Ptr: 0, carry: 0,
    resVisible: 0, computation: null,
    codeHL: [0, 1, 2], result: false,
  },
  {
    title: "Iter 1 — Extract digits",
    desc: "val1 = l1.val = 2, val2 = l2.val = 5. Both pointers are at the first nodes of their respective lists.",
    l1Ptr: 0, l2Ptr: 0, carry: 0,
    resVisible: 0, computation: "val1=2, val2=5",
    codeHL: [4, 5, 6], result: false,
  },
  {
    title: "Iter 1 — Compute sum",
    desc: "total = 2 + 5 + 0 (carry) = 7. carry = 7 // 10 = 0. Create node with value 7 (total % 10 = 7). Append to result list.",
    l1Ptr: 0, l2Ptr: 0, carry: 0,
    resVisible: 1, computation: "2 + 5 + 0 = 7, carry = 0",
    codeHL: [7, 8, 9, 10], result: false,
  },
  {
    title: "Iter 1 — Advance pointers",
    desc: "Move l1 to node 2 (value 4), l2 to node 2 (value 6). Result so far: [7].",
    l1Ptr: 1, l2Ptr: 1, carry: 0,
    resVisible: 1, computation: null,
    codeHL: [11, 12], result: false,
  },
  {
    title: "Iter 2 — Extract digits",
    desc: "val1 = l1.val = 4, val2 = l2.val = 6. Processing the tens digit.",
    l1Ptr: 1, l2Ptr: 1, carry: 0,
    resVisible: 1, computation: "val1=4, val2=6",
    codeHL: [4, 5, 6], result: false,
  },
  {
    title: "Iter 2 — Compute sum",
    desc: "total = 4 + 6 + 0 (carry) = 10. carry = 10 // 10 = 1. Create node with value 0 (total % 10 = 0). Carry propagates!",
    l1Ptr: 1, l2Ptr: 1, carry: 1,
    resVisible: 2, computation: "4 + 6 + 0 = 10, carry = 1",
    codeHL: [7, 8, 9, 10], result: false,
  },
  {
    title: "Iter 2 — Advance pointers",
    desc: "Move l1 to node 3 (value 3), l2 to node 3 (value 4). Carry = 1 will be added next. Result so far: [7, 0].",
    l1Ptr: 2, l2Ptr: 2, carry: 1,
    resVisible: 2, computation: null,
    codeHL: [11, 12], result: false,
  },
  {
    title: "Iter 3 — Extract digits",
    desc: "val1 = l1.val = 3, val2 = l2.val = 4. Processing the hundreds digit with carry = 1.",
    l1Ptr: 2, l2Ptr: 2, carry: 1,
    resVisible: 2, computation: "val1=3, val2=4, carry=1",
    codeHL: [4, 5, 6], result: false,
  },
  {
    title: "Iter 3 — Compute sum",
    desc: "total = 3 + 4 + 1 (carry) = 8. carry = 8 // 10 = 0. Create node with value 8 (total % 10 = 8). No more carry.",
    l1Ptr: 2, l2Ptr: 2, carry: 0,
    resVisible: 3, computation: "3 + 4 + 1 = 8, carry = 0",
    codeHL: [7, 8, 9, 10], result: false,
  },
  {
    title: "Iter 3 — Advance pointers",
    desc: "l1.next and l2.next are both None. Both pointers become None. carry = 0. The while condition is now False — loop exits.",
    l1Ptr: null, l2Ptr: null, carry: 0,
    resVisible: 3, computation: null,
    codeHL: [11, 12], result: false,
  },
  {
    title: "Return Result ✅",
    desc: "return dummy.next — Result list: 7 → 0 → 8 → NULL, which represents 807. That's 342 + 465 = 807. Done!",
    l1Ptr: null, l2Ptr: null, carry: 0,
    resVisible: 3, computation: null,
    codeHL: [14], result: true,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const mono = "'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', 'JetBrains Mono', monospace";
const sans = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const T = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

function NodeBox({ x, y, node, nextAddr, visible, highlight, color }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: NW, opacity: visible ? 1 : 0,
      transition: T, pointerEvents: visible ? 'auto' : 'none', zIndex: 2,
    }}>
      <div style={{
        textAlign: 'center', fontFamily: mono, fontSize: 10, fontWeight: 700,
        color: C.purple, marginBottom: 4, letterSpacing: 1,
      }}>{node.addr}</div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        border: `2px solid ${highlight ? color : C.accent}`,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: highlight ? `0 0 14px ${color}30` : `0 0 14px ${C.accentGlow}`,
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

function NullMarker({ x, y, visible }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y + 12,
      width: NULL_W, height: 30,
      border: `2px dashed ${C.nullC}`, borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.nullC,
      transition: T, opacity: visible ? 1 : 0, zIndex: 1,
    }}>NULL</div>
  );
}

function Arrow({ x1, x2, y, visible }) {
  const left = Math.min(x1, x2);
  const w = Math.abs(x2 - x1);
  return (
    <div style={{
      position: 'absolute', left, top: y + NH / 2 - 1,
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

function PointerTag({ x, y, label, color, visible }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      transition: T, opacity: visible ? 1 : 0, zIndex: 5,
    }}>
      <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent', borderBottom: `6px solid ${color}`,
        marginBottom: 2,
      }} />
      <div style={{
        fontFamily: mono, fontSize: 10, fontWeight: 700, color,
        background: color + '18', padding: '2px 8px', borderRadius: 4,
        letterSpacing: 1.5, whiteSpace: 'nowrap',
      }}>{label}</div>
    </div>
  );
}

function RowLabel({ x, y, label, color }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y + 18,
      fontFamily: mono, fontSize: 12, fontWeight: 700, color,
      letterSpacing: 1, whiteSpace: 'nowrap',
    }}>{label}</div>
  );
}

function CarryBadge({ carry, visible }) {
  return (
    <div style={{
      position: 'absolute', right: 20, top: ROW2_Y + NH + 20,
      fontFamily: mono, fontSize: 13, fontWeight: 700,
      color: carry > 0 ? C.carryC : C.dim,
      background: carry > 0 ? C.carryC + '18' : C.surface2,
      padding: '4px 14px', borderRadius: 8,
      border: `1px solid ${carry > 0 ? C.carryC + '40' : C.border}`,
      transition: T, opacity: visible ? 1 : 0, zIndex: 5,
    }}>carry = {carry}</div>
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

  const l1NextAddrs = ['0x2B', '0x3C', 'NULL'];
  const l2NextAddrs = ['0x5E', '0x6F', 'NULL'];
  const resNextAddrs = ['0xB2', '0xC3', 'NULL'];

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
          }}>Add Two Numbers</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            l1 = [2,4,3] (342) &nbsp;·&nbsp; l2 = [5,6,4] (465) &nbsp;·&nbsp; Result = [7,0,8] (807)
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
            <div style={{ position: 'relative', width: 700, height: VIS_H, margin: '0 auto' }}>

              {/* Row labels */}
              <RowLabel x={8} y={ROW1_Y} label="l1:" color={C.l1C} />
              <RowLabel x={8} y={ROW2_Y} label="l2:" color={C.l2C} />
              <RowLabel x={8} y={ROW3_Y} label="res:" color={C.resC} />

              {/* L1 nodes */}
              {L1.map((node, i) => (
                <NodeBox
                  key={`l1-${i}`}
                  x={nX(i)} y={ROW1_Y}
                  node={node} nextAddr={l1NextAddrs[i]}
                  visible={true}
                  highlight={s.l1Ptr === i}
                  color={C.l1C}
                />
              ))}
              <NullMarker x={nlX(3)} y={ROW1_Y} visible={true} />

              {/* L1 arrows */}
              {L1.map((_, i) => i < L1.length - 1 ? (
                <Arrow key={`l1a-${i}`} x1={nRX(i)} x2={nX(i + 1)} y={ROW1_Y} visible={true} />
              ) : (
                <Arrow key={`l1a-${i}`} x1={nRX(i)} x2={nlX(3)} y={ROW1_Y} visible={true} />
              ))}

              {/* L2 nodes */}
              {L2.map((node, i) => (
                <NodeBox
                  key={`l2-${i}`}
                  x={nX(i)} y={ROW2_Y}
                  node={node} nextAddr={l2NextAddrs[i]}
                  visible={true}
                  highlight={s.l2Ptr === i}
                  color={C.l2C}
                />
              ))}
              <NullMarker x={nlX(3)} y={ROW2_Y} visible={true} />

              {/* L2 arrows */}
              {L2.map((_, i) => i < L2.length - 1 ? (
                <Arrow key={`l2a-${i}`} x1={nRX(i)} x2={nX(i + 1)} y={ROW2_Y} visible={true} />
              ) : (
                <Arrow key={`l2a-${i}`} x1={nRX(i)} x2={nlX(3)} y={ROW2_Y} visible={true} />
              ))}

              {/* Result nodes */}
              {RES.map((node, i) => (
                <NodeBox
                  key={`res-${i}`}
                  x={nX(i)} y={ROW3_Y}
                  node={node} nextAddr={resNextAddrs[i]}
                  visible={i < s.resVisible}
                  highlight={i === s.resVisible - 1}
                  color={C.resC}
                />
              ))}
              <NullMarker x={nlX(s.resVisible)} y={ROW3_Y} visible={s.resVisible > 0} />

              {/* Result arrows */}
              {RES.map((_, i) => i < s.resVisible - 1 ? (
                <Arrow key={`resa-${i}`} x1={nRX(i)} x2={nX(i + 1)} y={ROW3_Y} visible={true} />
              ) : i === s.resVisible - 1 ? (
                <Arrow key={`resa-${i}`} x1={nRX(i)} x2={nlX(s.resVisible)} y={ROW3_Y} visible={i < RES.length - 1 ? false : true} />
              ) : null)}

              {/* L1 pointer tag */}
              {s.l1Ptr !== null && (
                <PointerTag x={nCX(s.l1Ptr)} y={ROW1_Y + NH + 8} label="l1" color={C.l1C} visible={true} />
              )}

              {/* L2 pointer tag */}
              {s.l2Ptr !== null && (
                <PointerTag x={nCX(s.l2Ptr)} y={ROW2_Y + NH + 8} label="l2" color={C.l2C} visible={true} />
              )}

              {/* Carry badge */}
              <CarryBadge carry={s.carry} visible={step > 0} />

              {/* Computation display */}
              {s.computation && (
                <div style={{
                  position: 'absolute', left: nX(0), top: ROW2_Y + NH + 30,
                  fontFamily: mono, fontSize: 11, fontWeight: 600,
                  color: C.text, background: C.purple + '18',
                  padding: '4px 12px', borderRadius: 6,
                  border: `1px solid ${C.purple}30`,
                  transition: T, zIndex: 5,
                }}>{s.computation}</div>
              )}

              {/* Result highlight */}
              {s.result && (
                <div style={{
                  position: 'absolute', left: nX(0) - 6, top: ROW3_Y - 4,
                  width: nRX(2) - nX(0) + 12, height: NH + 26,
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
