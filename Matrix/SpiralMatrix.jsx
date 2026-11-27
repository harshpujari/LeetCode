import { useState, useEffect, useMemo } from "react";

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
//   Default: matrix = [[1, 2, 3, 4],
//                      [5, 6, 7, 8],
//                      [9,10,11,12]]
//            answer = [1,2,3,4,8,12,11,10,9,5,6,7]
//   Any custom matrix can be entered in the UI; steps are regenerated.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEFAULT_MATRIX = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
];
const MAX_DIM = 8;
const MAX_ABS = 999;

const PRESETS = [
  { label: '3 × 4',      m: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]] },
  { label: '3 × 3',      m: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
  { label: '4 × 4',      m: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]] },
  { label: 'single row', m: [[1, 2, 3, 4]] },
  { label: 'single col', m: [[1], [2], [3]] },
  { label: '4 × 2',      m: [[1, 2], [3, 4], [5, 6], [7, 8]] },
];

const toText = (m) => m.map((row) => row.join(', ')).join('; ');

function parseMatrix(text) {
  const t = text.trim();
  if (!t) return { error: 'Enter at least one row.' };
  let rows;
  if (t.startsWith('[')) {
    try { rows = JSON.parse(t); } catch { return { error: 'Could not parse that. Use [[1,2],[3,4]] or rows separated by ";" like 1,2; 3,4.' }; }
    if (!Array.isArray(rows) || !rows.every(Array.isArray)) return { error: 'Expected a list of rows, e.g. [[1,2],[3,4]].' };
    rows = rows.map((r) => r.map(String));
  } else {
    rows = t.split(/[;\n]+/).map((r) => r.trim()).filter(Boolean)
      .map((r) => r.split(/[\s,]+/).filter(Boolean));
  }
  if (rows.length === 0) return { error: 'Enter at least one row.' };
  if (rows.length > MAX_DIM) return { error: `At most ${MAX_DIM} rows, please (got ${rows.length}).` };
  const cols = rows[0].length;
  if (cols === 0) return { error: 'Rows must not be empty.' };
  if (cols > MAX_DIM) return { error: `At most ${MAX_DIM} columns, please (got ${cols}).` };
  const bad = rows.findIndex((r) => r.length !== cols);
  if (bad !== -1) return { error: `All rows must have the same length: row 1 has ${cols}, row ${bad + 1} has ${rows[bad].length}.` };
  const out = [];
  for (const r of rows) {
    const row = [];
    for (const v of r) {
      if (!/^-?\d+$/.test(v) || Math.abs(Number(v)) > MAX_ABS) return { error: `"${v}" is not an integer between -${MAX_ABS} and ${MAX_ABS}.` };
      row.push(Number(v));
    }
    out.push(row);
  }
  return { value: out };
}

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
// Steps — generated by running the exact algorithm on the input,
// one step per direction pass (→ ↓ ← ↑), including skipped / empty ones.
//
// Example trace for the default 3 × 4 input (bounds AFTER each pass):
//   R1 →  row 0, cols 0..3  → 1 2 3 4     top=1
//   R1 ↓  col 3, rows 1..2  → 8 12        right=2
//   R1 ←  row 2, cols 2..0  → 11 10 9     bottom=1
//   R1 ↑  col 0, rows 1..1  → 5           left=1
//   R2 →  row 1, cols 1..2  → 6 7         top=2
//   R2 ↓  range(2, 2) empty               right=1
//   R2 ←  guard 2 <= 1 False → skip
//   R2 ↑  guard 1 <= 1 True, range(1, 1, -1) empty   left=2
//   while 2 <= 1 False → return
//
// Returns { steps, order } — order[k] is the [row, col] appended as ans[k].
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildSteps(M) {
  const R = M.length, Cn = M[0].length;
  const order = [];
  const steps = [];
  let top = 0, bottom = R - 1, left = 0, right = Cn - 1;
  let round = 0;

  const vals = (cells) => cells.map(([r, c]) => M[r][c]).join(', ');
  const snap = (extra) => ({ top, bottom, left, right, ansLen: order.length, done: false, ...extra });

  steps.push(snap({
    title: "Initial Setup",
    desc: `matrix is ${R} × ${Cn}. Start with four inclusive boundaries: top = 0, bottom = ${R - 1} (last row index), left = 0, right = ${Cn - 1} (last column index). Every pass walks one edge of the remaining rectangle, then shrinks that edge inward by one. Because the bounds are inclusive, each one is always a valid index you can use directly as matrix[top][…] or matrix[…][right].`,
    dir: null, changed: [], check: null,
    codeHL: [0, 1, 2, 3],
  }));

  while (left <= right && top <= bottom) {
    round++;

    // ── → top row ─────────────────────────
    {
      const whileVal = `${left} <= ${right} and ${top} <= ${bottom} → True`;
      const t0 = top;
      const cells = [];
      for (let c = left; c <= right; c++) cells.push([top, c]);
      order.push(...cells);
      top += 1;
      steps.push(snap({
        title: `Round ${round} — → Top row (row ${t0})`,
        desc: `The while check passes (${whileVal.replace(' → True', '')}). Walk the top row from left to right, so col goes ${cells[0][1]} → ${cells[cells.length - 1][1]} and appends ${vals(cells)}. Row ${t0} is now used up, so top += 1 moves the top boundary down to ${top}.` +
          (top > bottom ? ` top is now greater than bottom (${bottom}), so no rows remain.` : ''),
        dir: '→', changed: ['top'],
        check: { label: 'while left <= right and top <= bottom', value: whileVal, note: `∴ enter loop · top → ${top}`, ok: true },
        codeHL: [5, 6, 7, 8],
      }));
    }

    // ── ↓ right column ────────────────────
    {
      const r0 = right;
      const cells = [];
      for (let r = top; r <= bottom; r++) cells.push([r, right]);
      order.push(...cells);
      right -= 1;
      const empty = cells.length === 0;
      steps.push(snap({
        title: `Round ${round} — ↓ Right column (${empty ? 'empty' : `col ${r0}`})`,
        desc: empty
          ? `The right-column loop runs as range(top, bottom + 1) = range(${top}, ${bottom + 1}), which is empty, so nothing is appended. No guard is needed here: when top > bottom the range is simply empty. right -= 1 still runs, so right = ${right}.`
          : `Walk down column ${r0}. The walk starts at the new top (row ${top}), not row ${top - 1}, because matrix[${top - 1}][${r0}] was already taken by the top row. row goes ${top} → ${bottom} and appends ${vals(cells)}. Column ${r0} is used up, so right -= 1 makes right = ${right}.`,
        dir: '↓', changed: ['right'],
        check: {
          label: 'range(top, bottom + 1)',
          value: empty ? `range(${top}, ${bottom + 1}) → empty` : `range(${top}, ${bottom + 1}) → rows ${top}..${bottom}`,
          note: empty ? `∴ nothing added · right → ${right}` : `∴ right → ${right}`,
          ok: empty ? null : true,
        },
        codeHL: empty ? [10, 12] : [10, 11, 12],
      }));
    }

    // ── ← bottom row (guarded) ────────────
    if (top <= bottom) {
      const b0 = bottom;
      const cells = [];
      for (let c = right; c >= left; c--) cells.push([bottom, c]);
      order.push(...cells);
      bottom -= 1;
      const empty = cells.length === 0;
      steps.push(snap({
        title: `Round ${round} — ← Bottom row (${empty ? 'empty' : `row ${b0}`})`,
        desc: empty
          ? `Guard: top ≤ bottom (${top} ≤ ${b0}) passes, but range(right, left - 1, -1) = range(${right}, ${left - 1}, -1) is empty because right < left. The right-column pass just consumed the last column. Nothing is appended, and bottom -= 1 makes bottom = ${bottom}.`
          : `Guard: top ≤ bottom (${top} ≤ ${b0}), so a bottom row still exists that the top pass hasn't consumed. Walk it right to left, from col ${right} down to col ${left}, appending ${vals(cells)}. The reverse range(right, left - 1, -1) stops before left - 1, so col ${left} is included. Then bottom -= 1 makes bottom = ${bottom}.`,
        dir: '←', changed: ['bottom'],
        check: { label: 'if top <= bottom', value: `${top} <= ${b0} → True`, note: empty ? `range empty · bottom → ${bottom}` : `∴ walk row ${b0} · bottom → ${bottom}`, ok: true },
        codeHL: empty ? [14, 15, 17] : [14, 15, 16, 17],
      }));
    } else {
      const dup = [];
      for (let c = right; c >= left; c--) dup.push([bottom, c]);
      steps.push(snap({
        title: `Round ${round} — ← Bottom row (skipped)`,
        desc: `This step shows why the guard exists. top ≤ bottom is ${top} ≤ ${bottom}, which is False, so the block is skipped. ` +
          (dup.length
            ? `Without the guard, the reverse loop range(${right}, ${left - 1}, -1) would walk row ${bottom} again and append ${vals(dup)} a second time. Those cells were already consumed as the top row. A reverse range doesn't go empty on its own here, so it needs the explicit check.`
            : `Here the range would be empty anyway (right < left), but in general it isn't: the guard is what prevents re-walking a row the top pass already consumed.`),
        dir: '←', changed: [],
        check: { label: 'if top <= bottom', value: `${top} <= ${bottom} → False`, note: `∴ skip — row already used`, ok: false },
        codeHL: [14],
      }));
    }

    // ── ↑ left column (guarded) ───────────
    if (left <= right) {
      const l0 = left;
      const cells = [];
      for (let r = bottom; r >= top; r--) cells.push([r, left]);
      order.push(...cells);
      left += 1;
      const empty = cells.length === 0;
      steps.push(snap({
        title: `Round ${round} — ↑ Left column (${empty ? 'empty' : `col ${l0}`})`,
        desc: empty
          ? `Guard: left ≤ right (${l0} ≤ ${right}), so it passes. The loop is range(bottom, top - 1, -1) = range(${bottom}, ${top - 1}, -1), which is empty because top already moved past bottom. Nothing is appended, and left += 1 makes left = ${left}.`
          : `Guard: left ≤ right (${l0} ≤ ${right}). Walk up column ${l0} from bottom (${bottom}) to top (${top}). range(${bottom}, ${top - 1}, -1) appends ${vals(cells)}. The corner cells of this column were already taken by the top and bottom passes. left += 1 finishes this ring, so left = ${left}.`,
        dir: '↑', changed: ['left'],
        check: { label: 'if left <= right', value: `${l0} <= ${right} → True`, note: empty ? `range(${bottom}, ${top - 1}, -1) → empty · left → ${left}` : `range(${bottom}, ${top - 1}, -1) · left → ${left}`, ok: empty ? null : true },
        codeHL: empty ? [19, 20, 22] : [19, 20, 21, 22],
      }));
    } else {
      const dup = [];
      for (let r = bottom; r >= top; r--) dup.push([r, left]);
      steps.push(snap({
        title: `Round ${round} — ↑ Left column (skipped)`,
        desc: `left ≤ right is ${left} ≤ ${right}, which is False, so the block is skipped. ` +
          (dup.length
            ? `Without the guard, the loop would walk column ${left} upward again and append ${vals(dup)} a second time. The right-column pass already consumed that column.`
            : `Here the range would be empty anyway (top > bottom), but in general the guard is what prevents re-walking a column the right pass already consumed.`),
        dir: '↑', changed: [],
        check: { label: 'if left <= right', value: `${left} <= ${right} → False`, note: '∴ skip — column already used', ok: false },
        codeHL: [19],
      }));
    }
  }

  const total = R * Cn;
  const answer = order.map(([r, c]) => M[r][c]);
  steps.push(snap({
    title: `Result: ${total} element${total === 1 ? '' : 's'} in spiral order ✓`,
    desc: `The while check fails (${left} <= ${right} and ${top} <= ${bottom} is False), so the loop exits and returns ans = [${answer.join(', ')}]. Every cell was visited exactly once, giving O(m·n) time and O(1) extra space apart from the output.`,
    dir: null, changed: [], done: true,
    check: { label: 'while left <= right and top <= bottom', value: `${left} <= ${right} and ${top} <= ${bottom} → False`, note: '∴ exit loop', ok: false },
    codeHL: [5, 24],
  }));

  return { steps, order };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PointerTag({ label, color, arrow }) {
  return (
    <div style={{ display: 'flex', flexDirection: arrow === '▼' ? 'column' : 'row', alignItems: 'center', gap: 3 }}>
      <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color, letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color }}>{arrow}</span>
    </div>
  );
}

function SpiralGrid({ M, orderIdx, s, prevLen }) {
  const { top, bottom, left, right, ansLen, done } = s;
  const R = M.length, Cn = M[0].length;
  const CELL = (R > 5 || Cn > 5) ? 38 : 46;
  const GAP = (R > 5 || Cn > 5) ? 6 : 8;
  const LABEL_W = 64, LABEL_H = 30;

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
          {Array.from({ length: Cn }, (_, c) => (
            <div key={c} style={{ width: CELL, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {colTag(c)}
            </div>
          ))}
        </div>

        {M.map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: GAP, marginBottom: GAP, alignItems: 'center' }}>
            {/* row pointer label */}
            <div style={{ width: LABEL_W, display: 'flex', justifyContent: 'flex-end' }}>
              {rowTag(r)}
            </div>

            {row.map((val, c) => {
              const k = orderIdx[`${r},${c}`];
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
                  fontFamily: mono, fontSize: String(val).length > 2 ? 12 : 15, fontWeight: 700,
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

function AnsStrip({ answer, ansLen, prevLen, done }) {
  return (
    <div style={{ padding: '4px 16px 10px' }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 1.5, marginBottom: 6, textAlign: 'center' }}>
        ANS ({ansLen} / {answer.length})
      </div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        {answer.map((v, k) => {
          const filled = k < ansLen;
          const isNew = !done && k >= prevLen && k < ansLen;
          const color = done ? C.green : isNew ? C.purple : filled ? C.green + 'cc' : C.dim + '50';
          return (
            <div key={k} style={{
              width: 30, height: 30, borderRadius: 6,
              border: `1px ${filled ? 'solid' : 'dashed'} ${done ? C.green : isNew ? C.purple : filled ? C.green + '55' : C.border + '60'}`,
              background: done ? C.greenGlow : isNew ? C.purpleGlow : filled ? 'rgba(74,222,128,0.07)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: mono, fontSize: String(v).length > 2 ? 9 : 11, fontWeight: 700, color,
              transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
            }}>{filled ? v : ''}</div>
          );
        })}
      </div>
    </div>
  );
}

function InputPanel({ text, setText, error, onRun, onPreset, current }) {
  const curKey = JSON.stringify(current);
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, overflow: 'hidden', marginBottom: 16,
    }}>
      <div style={{
        padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        fontFamily: mono, fontSize: 10, color: C.dim,
        letterSpacing: 2, textTransform: 'uppercase',
      }}>Input — matrix</div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onRun(); }}
            placeholder="1,2,3; 4,5,6; 7,8,9   or   [[1,2,3],[4,5,6],[7,8,9]]"
            spellCheck={false}
            style={{
              flex: 1, minWidth: 0,
              fontFamily: mono, fontSize: 13, color: C.text,
              background: C.surface2, border: `1px solid ${error ? C.red + '88' : C.border}`,
              borderRadius: 8, padding: '8px 12px', outline: 'none',
            }}
          />
          <button
            onClick={onRun}
            style={{
              fontFamily: mono, fontSize: 12, fontWeight: 600,
              padding: '8px 18px', borderRadius: 8,
              background: C.accent, color: '#0a0e17',
              border: `1px solid ${C.accent}`, cursor: 'pointer',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >Run</button>
        </div>

        {error && (
          <div style={{ fontFamily: mono, fontSize: 11, color: C.red }}>✗ {error}</div>
        )}

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginRight: 2 }}>presets:</span>
          {PRESETS.map(({ label, m }) => {
            const active = JSON.stringify(m) === curKey;
            return (
              <button
                key={label}
                onClick={() => onPreset(m)}
                title={JSON.stringify(m)}
                style={{
                  fontFamily: mono, fontSize: 10, fontWeight: 600,
                  padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                  background: active ? C.accentGlow : C.surface2,
                  color: active ? C.accent : C.dim,
                  border: `1px solid ${active ? C.accent + '55' : C.border}`,
                  transition: 'all 0.2s',
                }}
              >{label}</button>
            );
          })}
          <span style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginLeft: 'auto' }}>
            rows separated by ; · up to {MAX_DIM} × {MAX_DIM}
          </span>
        </div>
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

function StatePanel({ s, total }) {
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
              {total} ELEMENTS · SPIRAL ORDER
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
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX);
  const [text, setText] = useState(toText(DEFAULT_MATRIX));
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);

  const { steps: STEPS, order } = useMemo(() => buildSteps(matrix), [matrix]);
  const orderIdx = useMemo(() => {
    const m = {};
    order.forEach(([r, c], k) => { m[`${r},${c}`] = k; });
    return m;
  }, [order]);
  const answer = useMemo(() => order.map(([r, c]) => matrix[r][c]), [order, matrix]);

  const total = STEPS.length;
  const s = STEPS[Math.min(step, total - 1)];
  const prevLen = step > 0 ? STEPS[step - 1].ansLen : 0;

  const load = (m) => {
    setMatrix(m);
    setText(toText(m));
    setError(null);
    setStep(0);
  };

  const run = () => {
    const res = parseMatrix(text);
    if (res.error) { setError(res.error); return; }
    load(res.value);
  };

  useEffect(() => {
    const handle = (e) => {
      // don't hijack arrows / space while typing in the input box
      if (e.target instanceof HTMLInputElement && e.target.type === 'text') return;
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
  }, [total]);

  const LEGEND = [
    { color: C.purple, label: 'added this pass' },
    { color: C.green,  label: 'already in ans' },
    { color: C.text,   label: 'remaining region' },
    { color: C.accent, label: 'top / left' },
    { color: C.orange, label: 'bottom / right' },
  ];

  const DIR_NAME = { '→': 'top row', '↓': 'right column', '←': 'bottom row', '↑': 'left column' };
  const R = matrix.length, Cn = matrix[0].length;

  const atStart = step === 0;
  const atEnd = step >= total - 1;

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
        input[type=text]:focus { border-color: ${C.accent}88 !important; }
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            fontFamily: mono, fontSize: 17, fontWeight: 700,
            color: C.accent, letterSpacing: -0.3, marginBottom: 4,
          }}>Spiral Matrix</h1>
          <p style={{ fontSize: 13, color: C.dim, wordBreak: 'break-word' }}>
            matrix = {JSON.stringify(matrix)} &nbsp;&middot;&nbsp; Boundary Shrinking &nbsp;&middot;&nbsp; Use &larr; &rarr; keys or buttons
          </p>
        </div>

        {/* Custom input */}
        <InputPanel
          text={text} setText={setText} error={error}
          onRun={run} onPreset={load} current={matrix}
        />

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
              <span>Matrix {R} × {Cn}</span>
              {s.dir && (
                <span style={{ color: C.purple }}>{s.dir} {DIR_NAME[s.dir]}</span>
              )}
            </div>

            <SpiralGrid M={matrix} orderIdx={orderIdx} s={s} prevLen={prevLen} />

            <AnsStrip answer={answer} ansLen={s.ansLen} prevLen={prevLen} done={s.done} />

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
            <StatePanel s={s} total={R * Cn} />
          </div>
        </div>

        {/* Description */}
        <div style={{
          background: C.surface,
          borderTop: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
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
              type="range" min={0} max={Math.max(total - 1, 0)} value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14 }}>
            <button
              onClick={() => setStep(0)}
              disabled={atStart}
              style={{
                fontFamily: mono, fontSize: 11, fontWeight: 600,
                padding: '8px 14px', borderRadius: 8,
                background: C.surface2, color: atStart ? C.dim : C.text,
                border: `1px solid ${C.border}`, cursor: atStart ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >Reset</button>

            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={atStart}
              style={{
                fontFamily: mono, fontSize: 12, fontWeight: 600,
                padding: '8px 20px', borderRadius: 8,
                background: atStart ? C.surface2 : C.accent + '20',
                color: atStart ? C.dim : C.accent,
                border: `1px solid ${atStart ? C.border : C.accent + '40'}`,
                cursor: atStart ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >&larr; Prev</button>

            <button
              onClick={() => setStep(Math.min(total - 1, step + 1))}
              disabled={atEnd}
              style={{
                fontFamily: mono, fontSize: 12, fontWeight: 600,
                padding: '8px 20px', borderRadius: 8,
                background: atEnd ? C.surface2 : C.accent,
                color: atEnd ? C.dim : '#0a0e17',
                border: `1px solid ${atEnd ? C.border : C.accent}`,
                cursor: atEnd ? 'default' : 'pointer',
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
