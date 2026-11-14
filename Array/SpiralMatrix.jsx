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
};

const mono = "'Menlo','Monaco','Cascadia Code','Consolas','JetBrains Mono',monospace";
const sans = "system-ui,-apple-system,'Segoe UI',sans-serif";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Problem Setup
//   matrix = [[1, 2, 3, 4],
//             [5, 6, 7, 8],
//             [9,10,11,12]]
//   answer = [1,2,3,4,8,12,11,10,9,5,6,7]
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MATRIX = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
];
const ROWS = MATRIX.length;
const COLS = MATRIX[0].length;

// Spiral visiting order as [row, col] — ORDER[k] is the cell appended as ans[k]
const ORDER = [
  [0, 0], [0, 1], [0, 2], [0, 3],   // → top row
  [1, 3], [2, 3],                   // ↓ right col
  [2, 2], [2, 1], [2, 0],           // ← bottom row
  [1, 0],                           // ↑ left col
  [1, 1], [1, 2],                   // → top row (round 2)
];
const ANSWER = ORDER.map(([r, c]) => MATRIX[r][c]);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: "def spiralOrder(matrix: list[list[int]]) -> list[int]:", ind: 0 }, // 0
  { t: "ans = []",                                     ind: 1 }, // 1
  { t: "left, right = 0, len(matrix[0]) - 1",          ind: 1 }, // 2
  { t: "top, bottom = 0, len(matrix) - 1",             ind: 1 }, // 3
  { t: "",                                             ind: 0 }, // 4
  { t: "while left <= right and top <= bottom:",       ind: 1 }, // 5
  { t: "for col in range(left, right + 1):  # →",     ind: 2 }, // 6
  { t: "ans.append(matrix[top][col])",                 ind: 3 }, // 7
  { t: "top += 1",                                     ind: 2 }, // 8
  { t: "",                                             ind: 0 }, // 9
  { t: "for row in range(top, bottom + 1):  # ↓",     ind: 2 }, // 10
  { t: "ans.append(matrix[row][right])",               ind: 3 }, // 11
  { t: "right -= 1",                                   ind: 2 }, // 12
  { t: "",                                             ind: 0 }, // 13
  { t: "if top <= bottom:",                            ind: 2 }, // 14
  { t: "for col in range(right, left - 1, -1):  # ←", ind: 3 }, // 15
  { t: "ans.append(matrix[bottom][col])",              ind: 4 }, // 16
  { t: "bottom -= 1",                                  ind: 3 }, // 17
  { t: "",                                             ind: 0 }, // 18
  { t: "if left <= right:",                            ind: 2 }, // 19
  { t: "for row in range(bottom, top - 1, -1):  # ↑", ind: 3 }, // 20
  { t: "ans.append(matrix[row][left])",                ind: 4 }, // 21
  { t: "left += 1",                                    ind: 3 }, // 22
  { t: "",                                             ind: 0 }, // 23
  { t: "return ans",                                   ind: 1 }, // 24
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps — one per direction pass
//
// Trace (bounds shown AFTER each pass):
//   R1 →  row 0, cols 0..3  → 1 2 3 4     top=1
//   R1 ↓  col 3, rows 1..2  → 8 12        right=2
//   R1 ←  row 2, cols 2..0  → 11 10 9     bottom=1
//   R1 ↑  col 0, rows 1..1  → 5           left=1
//   R2 →  row 1, cols 1..2  → 6 7         top=2
//   R2 ↓  range(2, 2) empty               right=1
//   R2 ←  guard 2 <= 1 False → skip
//   R2 ↑  guard 1 <= 1 True, range(1, 1, -1) empty   left=2
//   while 2 <= 1 False → return
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Setup",
    desc: "matrix is 3 × 4. Start with four inclusive boundaries: top = 0, bottom = 2 (last row index), left = 0, right = 3 (last column index). Every pass walks one edge of the remaining rectangle, then shrinks that edge inward by one. Because the bounds are inclusive, each one is always a valid index you can use directly as matrix[top][…] or matrix[…][right].",
    top: 0, bottom: 2, left: 0, right: 3, ansLen: 0, dir: null,
    changed: [], check: null, done: false,
    codeHL: [0, 1, 2, 3],
  },
  {
    title: "Round 1 — → Top row (row 0)",
    desc: "The while check passes (0 ≤ 3 and 0 ≤ 2). Walk the top row from left to right, so col goes 0 → 3 and appends 1, 2, 3, 4. Row 0 is now used up, so top += 1 moves the top boundary down to row 1.",
    top: 1, bottom: 2, left: 0, right: 3, ansLen: 4, dir: '→',
    changed: ['top'],
    check: { label: 'while left <= right and top <= bottom', value: '0 <= 3 and 0 <= 2 → True', note: '∴ enter loop · top → 1', ok: true },
    done: false,
    codeHL: [5, 6, 7, 8],
  },
  {
    title: "Round 1 — ↓ Right column (col 3)",
    desc: "Walk down the right column. The walk starts at the new top (row 1), not row 0, because matrix[0][3] = 4 was already taken by the top row. row goes 1 → 2 and appends 8, 12. Column 3 is used up, so right -= 1.",
    top: 1, bottom: 2, left: 0, right: 2, ansLen: 6, dir: '↓',
    changed: ['right'],
    check: { label: 'range(top, bottom + 1)', value: 'range(1, 3) → rows 1, 2', note: '∴ right → 2', ok: true },
    done: false,
    codeHL: [10, 11, 12],
  },
  {
    title: "Round 1 — ← Bottom row (row 2)",
    desc: "Guard: top ≤ bottom (1 ≤ 2), so a bottom row still exists that the top pass hasn't consumed. Walk it right to left from col 2 down to col 0, appending 11, 10, 9. The reverse range(right, left - 1, -1) stops before left - 1, so col 0 is included. Then bottom -= 1.",
    top: 1, bottom: 1, left: 0, right: 2, ansLen: 9, dir: '←',
    changed: ['bottom'],
    check: { label: 'if top <= bottom', value: '1 <= 2 → True', note: '∴ walk row 2 · bottom → 1', ok: true },
    done: false,
    codeHL: [14, 15, 16, 17],
  },
  {
    title: "Round 1 — ↑ Left column (col 0)",
    desc: "Guard: left ≤ right (0 ≤ 2). Walk up the left column from bottom (1) to top (1). range(1, 0, -1) yields only row 1 and appends 5. Rows 0 and 2 of this column were already taken by the top and bottom passes. left += 1 finishes the outer ring.",
    top: 1, bottom: 1, left: 1, right: 2, ansLen: 10, dir: '↑',
    changed: ['left'],
    check: { label: 'if left <= right', value: '0 <= 2 → True', note: 'range(1, 0, -1) → row 1 · left → 1', ok: true },
    done: false,
    codeHL: [19, 20, 21, 22],
  },
  {
    title: "Round 2 — → Top row (row 1)",
    desc: "The while check passes again (1 ≤ 2 and 1 ≤ 1). Only a single row is left: row 1, cols 1..2. Walk it left to right and append 6, 7. top += 1 makes top = 2, which is now greater than bottom = 1, so no rows remain.",
    top: 2, bottom: 1, left: 1, right: 2, ansLen: 12, dir: '→',
    changed: ['top'],
    check: { label: 'while left <= right and top <= bottom', value: '1 <= 2 and 1 <= 1 → True', note: '∴ enter loop · top → 2', ok: true },
    done: false,
    codeHL: [5, 6, 7, 8],
  },
  {
    title: "Round 2 — ↓ Right column (empty)",
    desc: "The right-column loop runs as range(top, bottom + 1) = range(2, 2), which is empty, so nothing is appended. No guard is needed here: when top > bottom the range is simply empty. right -= 1 still runs, so right = 1.",
    top: 2, bottom: 1, left: 1, right: 1, ansLen: 12, dir: '↓',
    changed: ['right'],
    check: { label: 'range(top, bottom + 1)', value: 'range(2, 2) → empty', note: '∴ nothing added · right → 1', ok: null },
    done: false,
    codeHL: [10, 12],
  },
  {
    title: "Round 2 — ← Bottom row (skipped)",
    desc: "This step shows why the guard exists. top ≤ bottom is 2 ≤ 1, which is False, so the block is skipped. Without the guard, the reverse loop range(1, 0, -1) would walk row 1 again and append 7, 6 a second time. The single remaining row was already consumed as the top row. A reverse range doesn't go empty on its own here, so it needs the explicit check.",
    top: 2, bottom: 1, left: 1, right: 1, ansLen: 12, dir: '←',
    changed: [],
    check: { label: 'if top <= bottom', value: '2 <= 1 → False', note: '∴ skip — row 1 already used', ok: false },
    done: false,
    codeHL: [14],
  },
  {
    title: "Round 2 — ↑ Left column (empty)",
    desc: "Guard: left ≤ right (1 ≤ 1), so it passes. The loop is range(bottom, top - 1, -1) = range(1, 1, -1), which is empty because top already moved past bottom. Nothing is appended, and left += 1 makes left = 2.",
    top: 2, bottom: 1, left: 2, right: 1, ansLen: 12, dir: '↑',
    changed: ['left'],
    check: { label: 'if left <= right', value: '1 <= 1 → True', note: 'range(1, 1, -1) → empty · left → 2', ok: null },
    done: false,
    codeHL: [19, 20, 22],
  },
  {
    title: "Result: 12 elements in spiral order ✓",
    desc: "The while check fails (left 2 > right 1, and top 2 > bottom 1), so the loop exits and returns ans = [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]. Every cell was visited exactly once, giving O(m·n) time and O(1) extra space apart from the output.",
    top: 2, bottom: 1, left: 2, right: 1, ansLen: 12, dir: null,
    changed: [],
    check: { label: 'while left <= right and top <= bottom', value: '2 <= 1 and 2 <= 1 → False', note: '∴ exit loop', ok: false },
    done: true,
    codeHL: [5, 24],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// order index lookup: "r,c" → k
const ORDER_IDX = {};
ORDER.forEach(([r, c], k) => { ORDER_IDX[`${r},${c}`] = k; });

function PointerTag({ label, color, arrow }) {
  return (
    <div style={{ display: 'flex', flexDirection: arrow === '▼' ? 'column' : 'row', alignItems: 'center', gap: 3 }}>
      {arrow === '▼' ? (
        <>
          <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color, letterSpacing: 0.5 }}>{label}</span>
          <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color }}>▼</span>
        </>
      ) : (
        <>
          <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color, letterSpacing: 0.5 }}>{label}</span>
          <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color }}>▶</span>
        </>
      )}
    </div>
  );
}

function SpiralGrid({ top, bottom, left, right, ansLen, prevLen, done }) {
  const CELL = 46, GAP = 8, LABEL_W = 64, LABEL_H = 30;

  const colTag = (c) => {
    if (done) return null;
    const isL = c === left, isR = c === right;
    if (isL && isR) return <PointerTag label="L = R" color={C.green} arrow="▼" />;
    if (isL) return <PointerTag label="left" color={C.accent} arrow="▼" />;
    if (isR) return <PointerTag label="right" color={C.orange} arrow="▼" />;
    return null;
  };
  const rowTag = (r) => {
    if (done) return null;
    const isT = r === top, isB = r === bottom;
    if (isT && isB) return <PointerTag label="T = B" color={C.green} arrow="▶" />;
    if (isT) return <PointerTag label="top" color={C.accent} arrow="▶" />;
    if (isB) return <PointerTag label="bottom" color={C.orange} arrow="▶" />;
    return null;
  };

  return (
    <div style={{ overflowX: 'auto', padding: '18px 16px 8px' }}>
      <div style={{ minWidth: 'max-content', margin: '0 auto', width: 'max-content' }}>
        {/* column pointer labels */}
        <div style={{ display: 'flex', gap: GAP, marginLeft: LABEL_W + GAP, height: LABEL_H, marginBottom: 4 }}>
          {Array.from({ length: COLS }, (_, c) => (
            <div key={c} style={{ width: CELL, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {colTag(c)}
            </div>
          ))}
        </div>

        {MATRIX.map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: GAP, marginBottom: GAP, alignItems: 'center' }}>
            {/* row pointer label */}
            <div style={{ width: LABEL_W, display: 'flex', justifyContent: 'flex-end' }}>
              {rowTag(r)}
            </div>

            {row.map((val, c) => {
              const k = ORDER_IDX[`${r},${c}`];
              const isNew     = !done && k >= prevLen && k < ansLen;
              const isVisited = k < ansLen && !isNew;
              const inRegion  = r >= top && r <= bottom && c >= left && c <= right;

              let boxBorder, boxBg, boxText, glowStr;
              if (done) {
                boxBorder = C.green;      boxBg = C.greenGlow;          boxText = C.green;
                glowStr = `0 0 10px ${C.greenGlow}`;
              } else if (isNew) {
                boxBorder = C.purple;     boxBg = C.purpleGlow;         boxText = C.purple;
                glowStr = `0 0 14px ${C.purpleGlow}`;
              } else if (isVisited) {
                boxBorder = C.green + '55'; boxBg = 'rgba(74,222,128,0.07)'; boxText = C.green + 'cc';
                glowStr = 'none';
              } else if (inRegion) {
                boxBorder = C.border;     boxBg = C.surface2;           boxText = C.text;
                glowStr = 'none';
              } else {
                boxBorder = C.border + '30'; boxBg = 'transparent';     boxText = C.dim + '60';
                glowStr = 'none';
              }

              return (
                <div key={c} style={{
                  width: CELL, height: CELL,
                  border: `2px solid ${boxBorder}`,
                  borderRadius: 9,
                  background: boxBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: mono, fontSize: 15, fontWeight: 700,
                  color: boxText,
                  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                  filter: glowStr !== 'none' ? `drop-shadow(${glowStr})` : 'none',
                  position: 'relative',
                }}>
                  {val}
                  {(isVisited || isNew || done) && (
                    <span style={{
                      position: 'absolute', top: -9, right: -3,
                      fontFamily: mono, fontSize: 9, fontWeight: 700,
                      color: isNew ? C.purple : C.green + 'aa',
                      background: C.surface, padding: '0 2px', borderRadius: 3,
                    }}>#{k}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnsStrip({ ansLen, prevLen, done }) {
  return (
    <div style={{ padding: '4px 16px 10px', overflowX: 'auto' }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 1.5, marginBottom: 6, textAlign: 'center' }}>
        ANS ({ansLen})
      </div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', minWidth: 'max-content', margin: '0 auto' }}>
        {ANSWER.map((v, k) => {
          const filled = k < ansLen;
          const isNew = !done && k >= prevLen && k < ansLen;
          const color = done ? C.green : isNew ? C.purple : filled ? C.green + 'cc' : C.dim + '50';
          return (
            <div key={k} style={{
              width: 30, height: 30, borderRadius: 6,
              border: `1px ${filled ? 'solid' : 'dashed'} ${done ? C.green : isNew ? C.purple : filled ? C.green + '55' : C.border + '60'}`,
              background: done ? C.greenGlow : isNew ? C.purpleGlow : filled ? 'rgba(74,222,128,0.07)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: mono, fontSize: 11, fontWeight: 700, color,
              transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
            }}>{filled ? v : ''}</div>
          );
        })}
      </div>
    </div>
  );
}

function VarRow({ name, value, color, active, crossed }) {
  const col = crossed ? C.red : color;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 10px', borderRadius: 6,
      background: active ? (crossed ? C.redGlow : color === C.accent ? C.accentGlow : C.orangeGlow) : C.surface2,
      border: `1px solid ${active ? col + '55' : C.border}`,
      transition: 'all 0.4s',
    }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>{name}</span>
      <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: active ? col : C.text }}>{value}</span>
    </div>
  );
}

function StatePanel({ s }) {
  const rowsCrossed = s.top > s.bottom;
  const colsCrossed = s.left > s.right;
  const ck = s.check;
  const ckColor = ck ? (ck.ok === true ? C.green : ck.ok === false ? C.red : C.dim) : C.dim;
  const ckGlow  = ck ? (ck.ok === true ? C.greenGlow : ck.ok === false ? C.redGlow : C.surface2) : C.surface2;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{
        padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        fontFamily: mono, fontSize: 10, color: C.dim,
        letterSpacing: 2, textTransform: 'uppercase', flexShrink: 0,
      }}>Algo State</div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <VarRow name="top"    value={s.top}    color={C.accent} active={s.changed.includes('top')}    crossed={rowsCrossed} />
        <VarRow name="bottom" value={s.bottom} color={C.orange} active={s.changed.includes('bottom')} crossed={rowsCrossed} />
        <VarRow name="left"   value={s.left}   color={C.accent} active={s.changed.includes('left')}   crossed={colsCrossed} />
        <VarRow name="right"  value={s.right}  color={C.orange} active={s.changed.includes('right')}  crossed={colsCrossed} />

        {ck && (
          <div style={{
            padding: '10px 10px', borderRadius: 6, marginTop: 4,
            background: ckGlow, border: `1px solid ${ck.ok === null ? C.border : ckColor + '44'}`,
            transition: 'all 0.4s',
          }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 0.5, marginBottom: 4 }}>
              {ck.label}
            </div>
            <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: ck.ok === null ? C.text : ckColor }}>
              {ck.value}
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginTop: 5 }}>
              {ck.note}
            </div>
          </div>
        )}

        {s.done && (
          <div style={{
            padding: '10px 10px', borderRadius: 6,
            background: C.greenGlow, border: `1px solid ${C.green}44`, textAlign: 'center',
          }}>
            <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.green }}>
              return ans ✓
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 3, letterSpacing: 0.5 }}>
              12 ELEMENTS · SPIRAL ORDER
            </div>
          </div>
        )}
      </div>
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
        fontFamily: mono, fontSize: 10, color: C.dim,
        letterSpacing: 2, textTransform: 'uppercase',
      }}>Python Code — Boundary Shrinking</div>

      <div style={{ padding: '6px 0', overflowX: 'auto' }}>
        {CODE.map((line, i) => {
          const hl = highlighted.includes(i);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              padding: '3px 14px 3px 0',
              background: hl ? C.accentGlow : 'transparent',
              borderLeft: `3px solid ${hl ? C.accent : 'transparent'}`,
              transition: 'background 0.3s, border-color 0.3s',
            }}>
              <span style={{
                fontFamily: mono, fontSize: 10, color: C.dim,
                width: 32, textAlign: 'right', marginRight: 14,
                userSelect: 'none', flexShrink: 0,
              }}>{i + 1}</span>
              <span style={{
                fontFamily: mono, fontSize: 13,
                color: hl ? C.text : C.dim,
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
  const prevLen = step > 0 ? STEPS[step - 1].ansLen : 0;

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

  const LEGEND = [
    { color: C.purple, label: 'added this pass' },
    { color: C.green,  label: 'already in ans' },
    { color: C.text,   label: 'remaining region' },
    { color: C.accent, label: 'top / left' },
    { color: C.orange, label: 'bottom / right' },
  ];

  const DIR_NAME = { '→': 'top row', '↓': 'right column', '←': 'bottom row', '↑': 'left column' };

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

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            fontFamily: mono, fontSize: 17, fontWeight: 700,
            color: C.accent, letterSpacing: -0.3, marginBottom: 4,
          }}>Spiral Matrix</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]] &nbsp;&middot;&nbsp; Boundary Shrinking &nbsp;&middot;&nbsp; Use &larr; &rarr; keys or buttons
          </p>
        </div>

        {/* Step title + counter */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14, gap: 12,
        }}>
          <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.text }}>
            {s.title}
          </div>
          <div style={{
            fontFamily: mono, fontSize: 11, color: C.dim, flexShrink: 0,
            background: C.surface, padding: '3px 10px', borderRadius: 6,
          }}>Step {step + 1} / {total}</div>
        </div>

        {/* Main: Grid | State Panel */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'stretch' }}>

          <div style={{
            flex: '1 1 420px', minWidth: 0,
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
              fontFamily: mono, fontSize: 10, color: C.dim,
              letterSpacing: 2, textTransform: 'uppercase',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span>Matrix {ROWS} × {COLS}</span>
              {s.dir && (
                <span style={{ color: C.purple }}>{s.dir} {DIR_NAME[s.dir]}</span>
              )}
            </div>

            <SpiralGrid
              top={s.top} bottom={s.bottom} left={s.left} right={s.right}
              ansLen={s.ansLen} prevLen={prevLen} done={s.done}
            />

            <AnsStrip ansLen={s.ansLen} prevLen={prevLen} done={s.done} />

            {/* Legend */}
            <div style={{
              display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
              padding: '6px 12px 16px',
              fontFamily: mono, fontSize: 10,
            }}>
              {LEGEND.map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                  <span style={{ color: C.dim }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: 210, flexShrink: 0, flexGrow: 1, maxWidth: '100%' }}>
            <StatePanel s={s} />
          </div>
        </div>

        {/* Description */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${s.done ? C.green : C.accent}`,
          borderRadius: '0 10px 10px 0',
          padding: '14px 18px', marginBottom: 16,
        }}>
          <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, fontFamily: sans }}>
            {s.desc}
          </p>
        </div>

        {/* Code Panel */}
        <div style={{ marginBottom: 20 }}>
          <CodePanel highlighted={s.codeHL} />
        </div>

        {/* Controls */}
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

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14 }}>
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
            >Reset</button>

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
            >&larr; Prev</button>

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
            >Next &rarr;</button>
          </div>
        </div>

        <p style={{
          textAlign: 'center', fontSize: 11, color: C.border,
          marginTop: 16, fontFamily: mono,
        }}>&larr; &rarr; arrow keys &nbsp;&middot;&nbsp; spacebar = next</p>
      </div>
    </div>
  );
}
