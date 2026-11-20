import { useState, useEffect, useMemo, useRef } from "react";

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
//   Default: candidates = [2, 3, 6, 7], target = 7  (LeetCode example 1)
//            answer = [[2, 2, 3], [7]]   — 55 recursive calls
//   Any custom input can be entered in the UI; the tree is regenerated.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEFAULT_CANDS = [2, 3, 6, 7];
const DEFAULT_TARGET = 7;
const MAX_CANDS = 6;
const MAX_VAL = 40;
const MAX_CALLS = 200;

const PRESETS = [
  { label: 'example 1', cands: [2, 3, 6, 7], target: 7 },
  { label: 'example 2', cands: [2, 3, 5],    target: 8 },
  { label: 'example 3', cands: [2],          target: 1 },
  { label: 'small',     cands: [2, 3],       target: 6 },
  { label: 'one combo', cands: [3, 5],       target: 8 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: "def combinationSum(candidates: List[int], target: int) -> List[List[int]]:", ind: 0 }, // 0
  { t: "result = []",                                                  ind: 1 }, // 1
  { t: "",                                                             ind: 0 }, // 2
  { t: "def backtrack(index, current_combination, current_sum):",      ind: 1 }, // 3
  { t: "if current_sum == target:",                                    ind: 2 }, // 4
  { t: "result.append(current_combination.copy())",                    ind: 3 }, // 5
  { t: "return",                                                       ind: 3 }, // 6
  { t: "if index >= len(candidates) or current_sum > target:",         ind: 2 }, // 7
  { t: "return",                                                       ind: 3 }, // 8
  { t: "current_combination.append(candidates[index])   # include",   ind: 2 }, // 9
  { t: "backtrack(index, current_combination, current_sum + candidates[index])", ind: 2 }, // 10
  { t: "current_combination.pop()                       # undo",      ind: 2 }, // 11
  { t: "backtrack(index + 1, current_combination, current_sum)  # skip", ind: 2 }, // 12
  { t: "",                                                             ind: 0 }, // 13
  { t: "backtrack(0, [], 0)",                                          ind: 1 }, // 14
  { t: "return result",                                                ind: 1 }, // 15
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Recursion tree — built by running the exact algorithm.
//
// Every call becomes a node (ids are in call order = DFS preorder):
//   status  'found'  — current_sum == target          (green leaf)
//           'over'   — current_sum > target           (red leaf, pruned)
//           'oob'    — index == len(candidates)        (red leaf, dead end)
//           'branch' — recurse: left = include, right = skip
//   edge    'inc' (append candidates[parent.index], same index)
//           'skip' (pop, index + 1)
//   end     id of the last descendant → a is an ancestor of n iff a.id <= n.id <= a.end
//   x       tidy-tree layout: leaves get 0,1,2,… in DFS order, parents sit midway
//
// One step per call, plus a final "return result" step.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildTree(cands, target) {
  const nodes = [];
  let leafX = 0;
  const n = cands.length;

  function bt(index, path, sum, parent, edge, depth) {
    if (nodes.length >= MAX_CALLS) throw new Error('too many calls');
    const id = nodes.length;
    const node = { id, parent, index, path: [...path], sum, edge, depth, children: [], x: 0, end: id };
    nodes.push(node);
    if (parent !== null) nodes[parent].children.push(id);

    if (sum === target) node.status = 'found';
    else if (index >= n || sum > target) node.status = sum > target ? 'over' : 'oob';
    else node.status = 'branch';

    if (node.status === 'branch') {
      path.push(cands[index]);
      bt(index, path, sum + cands[index], id, 'inc', depth + 1);
      path.pop();
      bt(index + 1, path, sum, id, 'skip', depth + 1);
      const [a, b] = node.children;
      node.x = (nodes[a].x + nodes[b].x) / 2;
    } else {
      node.x = leafX++;
    }
    node.end = nodes.length - 1;
  }

  bt(0, [], 0, null, null, 0);
  const maxDepth = Math.max(...nodes.map((d) => d.depth));
  return { nodes, leaves: leafX, maxDepth };
}

const fmt = (arr) => `[${arr.join(', ')}]`;

function buildSteps(cands, target, nodes) {
  const n = cands.length;
  const steps = nodes.map((node) => {
    const { index, path, sum, status, edge } = node;
    const p = node.parent !== null ? nodes[node.parent] : null;
    const v = p ? cands[p.index] : null;

    let entry, entryHL;
    if (!p) {
      entry = `Call backtrack(0, [], 0) with target = ${target}. `;
      entryHL = [14];
    } else if (edge === 'inc') {
      entry = `Include candidates[${p.index}] = ${v}: append it, so current = ${fmt(path)} and sum = ${p.sum} + ${v} = ${sum}. Recurse with the same index ${index}, so ${v} can be picked again. `;
      entryHL = [9, 10];
    } else {
      entry = `The include branch of backtrack(${p.index}, ${fmt(p.path)}, ${p.sum}) has fully returned. pop() undoes the ${v}, so current = ${fmt(path)}. Now skip candidates[${p.index}] = ${v} for good and move to index ${index}. sum stays ${sum}. `;
      entryHL = [11, 12];
    }

    let what, title, calc, statusHL;
    if (status === 'found') {
      title = `Found ${fmt(path)} ✓`;
      what = `sum == target (${sum} == ${target}), so ${fmt(path)} is a valid combination. Save a copy and return. It has to be a copy, because current_combination keeps changing as the search continues.`;
      calc = { label: 'if current_sum == target', value: `${sum} == ${target} → True`, note: '∴ save copy · return', color: 'green' };
      statusHL = [4, 5, 6];
    } else if (status === 'over') {
      title = `sum ${sum} > ${target} — prune`;
      what = `sum ${sum} > target ${target}. Every candidate is positive, so adding more can never bring the sum back down. Prune this branch and return.`;
      calc = { label: 'current_sum > target', value: `${sum} > ${target} → True`, note: '∴ return (prune)', color: 'red' };
      statusHL = [4, 7, 8];
    } else if (status === 'oob') {
      title = `index ${index} = len — dead end`;
      what = `index ${index} == len(candidates), so there are no candidates left to try, and sum ${sum} ≠ ${target}. This path fails, so return.`;
      calc = { label: 'index >= len(candidates)', value: `${index} >= ${n} → True`, note: '∴ return (out of candidates)', color: 'red' };
      statusHL = [4, 7, 8];
    } else {
      title = `backtrack(${index}, ${fmt(path)}, ${sum})`;
      what = `Neither base case applies (sum ${sum} < ${target} and index ${index} is valid), so branch two ways. First include candidates[${index}] = ${cands[index]} (left child), then skip it (right child).`;
      calc = { label: 'base cases', value: `${sum} < ${target} · ${index} < ${n}`, note: `→ include ${cands[index]}, then skip`, color: 'accent' };
      statusHL = [4, 7];
    }

    return {
      cur: node.id, title, desc: entry + what, calc,
      codeHL: [...new Set([...entryHL, ...statusHL])],
      done: false,
    };
  });

  const found = nodes.filter((d) => d.status === 'found');
  steps.push({
    cur: -1,
    title: `Result: ${found.length} combination${found.length === 1 ? '' : 's'} ✓`,
    desc: `backtrack(0, [], 0) has returned after ${nodes.length} calls, so return result = [${found.map((d) => fmt(d.path)).join(', ')}]. ` +
      `There are no duplicates like [2,2,3] and [3,2,2] because every path picks candidates in index order. Once a candidate is skipped, the search never goes back to it. ` +
      `Pruning on sum > target keeps the tree finite. Without it, the include branch would recurse forever.`,
    calc: null, codeHL: [14, 15], done: true,
  });
  return steps;
}

function parseInput(candText, targetText) {
  const tokens = candText.split(/[\s,\[\]]+/).filter(Boolean);
  if (tokens.length === 0) return { error: 'Enter at least one candidate.' };
  if (tokens.length > MAX_CANDS) return { error: `At most ${MAX_CANDS} candidates, please (got ${tokens.length}).` };
  const cands = [];
  for (const t of tokens) {
    if (!/^\d+$/.test(t) || Number(t) < 1 || Number(t) > MAX_VAL) return { error: `"${t}" must be an integer from 1 to ${MAX_VAL}.` };
    cands.push(Number(t));
  }
  if (new Set(cands).size !== cands.length) return { error: 'Candidates must be distinct. With duplicates, this algorithm returns duplicate combinations.' };
  const tt = targetText.trim();
  if (!/^\d+$/.test(tt) || Number(tt) < 1 || Number(tt) > MAX_VAL) return { error: `target must be an integer from 1 to ${MAX_VAL}.` };
  const target = Number(tt);
  try { buildTree(cands, target); } catch {
    return { error: `This input needs more than ${MAX_CALLS} recursive calls, which is too big to draw readably. Try a smaller target or larger candidates.` };
  }
  return { value: { cands, target } };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GLOW = { green: C.greenGlow, red: C.redGlow, accent: C.accentGlow };
const COLOR = { green: C.green, red: C.red, accent: C.accent };

const XS = 38, YS = 58, R = 14, PAD_X = 20, PAD_Y = 24;
const posX = (node) => PAD_X + R + node.x * XS;
const posY = (node) => PAD_Y + R + node.depth * YS;

function RecursionTree({ tree, cur, done }) {
  const { nodes, leaves, maxDepth } = tree;
  const width = PAD_X * 2 + R * 2 + (leaves - 1) * XS;
  const height = PAD_Y * 2 + R * 2 + maxDepth * YS;
  const scrollRef = useRef(null);
  const curNode = cur >= 0 ? nodes[cur] : null;

  // keep the current call in view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !curNode) return;
    el.scrollTo({
      left: Math.max(0, posX(curNode) - el.clientWidth / 2),
      top: Math.max(0, posY(curNode) - el.clientHeight / 2),
      behavior: 'smooth',
    });
  }, [cur]); // eslint-disable-line react-hooks/exhaustive-deps

  const visited = (d) => done || d.id <= cur;
  const onStack = (d) => !done && curNode && d.id <= cur && cur <= d.end;   // ancestor-or-self of cur
  const leadsToFound = (d) => nodes.some((m) => m.status === 'found' && m.id >= d.id && m.id <= d.end);

  return (
    <div ref={scrollRef} style={{ overflow: 'auto', maxHeight: 440, padding: '4px 0' }}>
      <svg width={width} height={height} style={{ display: 'block', margin: '0 auto' }}>
        {/* edges */}
        {nodes.filter((d) => d.parent !== null).map((d) => {
          const p = nodes[d.parent];
          const vis = visited(d);
          let stroke = C.border + '30', w = 1;
          if (vis) {
            stroke = C.border; w = 1.5;
            if (done && leadsToFound(d)) { stroke = C.green; w = 2; }
            else if (onStack(d)) { stroke = C.accent; w = 2.5; }
          }
          const mx = (posX(p) + posX(d)) / 2, my = (posY(p) + posY(d)) / 2;
          return (
            <g key={`e${d.id}`}>
              <line
                x1={posX(p)} y1={posY(p) + R} x2={posX(d)} y2={posY(d) - R}
                stroke={stroke} strokeWidth={w}
                strokeDasharray={d.edge === 'skip' ? '4 3' : undefined}
                style={{ transition: 'all 0.4s' }}
              />
              {vis && d.edge === 'inc' && (
                <text x={mx - 6} y={my} textAnchor="end" dominantBaseline="middle"
                  style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, fill: onStack(d) ? C.accent : C.dim }}>
                  +{d.path[d.path.length - 1]}
                </text>
              )}
            </g>
          );
        })}

        {/* nodes */}
        {nodes.map((d) => {
          const vis = visited(d);
          const isCur = !done && d.id === cur;
          let stroke, fill, txt;
          if (!vis)                     { stroke = C.border + '40'; fill = 'transparent'; txt = 'transparent'; }
          else if (d.status === 'found'){ stroke = C.green;  fill = C.greenGlow;  txt = C.green; }
          else if (isCur)               { stroke = C.purple; fill = C.purpleGlow; txt = C.purple; }
          else if (d.status !== 'branch'){ stroke = C.red + '99'; fill = C.redGlow; txt = C.red; }
          else if (onStack(d))          { stroke = C.accent; fill = C.accentGlow; txt = C.accent; }
          else if (done && leadsToFound(d)) { stroke = C.green + 'aa'; fill = C.surface2; txt = C.green; }
          else                          { stroke = C.dim;    fill = C.surface2;   txt = C.dim; }
          if (isCur && d.status !== 'branch') { // current leaf keeps its outcome colour but glows purple
            stroke = C.purple;
          }

          return (
            <g key={`n${d.id}`} style={{ transition: 'all 0.4s' }}>
              {isCur && (
                <circle cx={posX(d)} cy={posY(d)} r={R + 6} fill={C.purpleGlow} stroke="none" />
              )}
              <circle cx={posX(d)} cy={posY(d)} r={R}
                fill={fill} stroke={stroke} strokeWidth={isCur ? 2.5 : 1.5}
                strokeDasharray={!vis ? '3 3' : undefined}
                style={{ transition: 'all 0.4s' }} />
              <text x={posX(d)} y={posY(d)} textAnchor="middle" dominantBaseline="central"
                style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, fill: txt, transition: 'fill 0.4s' }}>
                {d.sum}
              </text>
              {vis && d.status === 'found' && (
                <text x={posX(d)} y={posY(d) + R + 11} textAnchor="middle"
                  style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, fill: C.green }}>✓</text>
              )}
              {vis && (d.status === 'over' || d.status === 'oob') && (
                <text x={posX(d)} y={posY(d) + R + 11} textAnchor="middle"
                  style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, fill: C.red + 'bb' }}>
                  {d.status === 'over' ? '>' : 'end'}
                </text>
              )}
              {isCur && (
                <text x={posX(d)} y={posY(d) - R - 6} textAnchor="middle"
                  style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, fill: C.purple }}>
                  i={d.index}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function CandidatesBar({ cands, index }) {
  const BOX = 40;
  const showEnd = index === cands.length;
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '14px 16px 4px', flexWrap: 'wrap' }}>
      {cands.map((v, i) => {
        const isI = i === index;
        const used = index > i;   // skipped for good on this path
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginBottom: 4 }}>{i}</span>
            <div style={{
              width: BOX, height: BOX, borderRadius: 9,
              border: `2px solid ${isI ? C.purple : used ? C.border + '40' : C.border}`,
              background: isI ? C.purpleGlow : used ? 'transparent' : C.surface2,
              color: isI ? C.purple : used ? C.dim + '70' : C.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: mono, fontSize: 14, fontWeight: 700,
              filter: isI ? `drop-shadow(0 0 10px ${C.purpleGlow})` : 'none',
              transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
            }}>{v}</div>
            <span style={{ height: 14, marginTop: 3, fontFamily: mono, fontSize: 8, fontWeight: 700, color: C.purple }}>
              {isI ? '▲ index' : ''}
            </span>
          </div>
        );
      })}
      {showEnd && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginBottom: 4 }}>{cands.length}</span>
          <div style={{ width: BOX, height: BOX, borderRadius: 9, border: `2px dashed ${C.red}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: mono, fontSize: 10, color: C.red }}>end</div>
          <span style={{ height: 14, marginTop: 3, fontFamily: mono, fontSize: 8, fontWeight: 700, color: C.red }}>▲ index</span>
        </div>
      )}
    </div>
  );
}

function ResultsStrip({ found, newId, done }) {
  return (
    <div style={{ padding: '6px 16px 10px' }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 1.5, marginBottom: 6, textAlign: 'center' }}>
        RESULT ({found.length})
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', minHeight: 26 }}>
        {found.length === 0 && (
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim + '80' }}>— none yet —</span>
        )}
        {found.map((d) => {
          const isNew = !done && d.id === newId;
          return (
            <span key={d.id} style={{
              fontFamily: mono, fontSize: 12, fontWeight: 700,
              color: isNew ? C.purple : C.green,
              background: isNew ? C.purpleGlow : C.greenGlow,
              border: `1px solid ${isNew ? C.purple + '66' : C.green + '44'}`,
              borderRadius: 6, padding: '3px 9px',
              transition: 'all 0.4s',
            }}>[{d.path.join(',')}]</span>
          );
        })}
      </div>
    </div>
  );
}

const inputStyle = (error) => ({
  fontFamily: mono, fontSize: 13, color: C.text,
  background: C.surface2, border: `1px solid ${error ? C.red + '88' : C.border}`,
  borderRadius: 8, padding: '8px 12px', outline: 'none', minWidth: 0,
});

function InputPanel({ candText, setCandText, targetText, setTargetText, error, onRun, onPreset, current }) {
  const curKey = `${current.cands.join(',')}|${current.target}`;
  const onEnter = (e) => { if (e.key === 'Enter') onRun(); };
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, overflow: 'hidden', marginBottom: 16,
    }}>
      <div style={{
        padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        fontFamily: mono, fontSize: 10, color: C.dim,
        letterSpacing: 2, textTransform: 'uppercase',
      }}>Input — candidates, target</div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>candidates</span>
          <input
            type="text" value={candText} spellCheck={false}
            onChange={(e) => setCandText(e.target.value)} onKeyDown={onEnter}
            placeholder="e.g. 2, 3, 6, 7"
            style={{ ...inputStyle(error), flex: '1 1 180px' }}
          />
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>target</span>
          <input
            type="text" inputMode="numeric" value={targetText} spellCheck={false}
            onChange={(e) => setTargetText(e.target.value)} onKeyDown={onEnter}
            placeholder="7"
            style={{ ...inputStyle(error), width: 80, flex: '0 0 80px' }}
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
          {PRESETS.map((p) => {
            const active = `${p.cands.join(',')}|${p.target}` === curKey;
            return (
              <button
                key={p.label}
                onClick={() => onPreset(p)}
                title={`candidates = [${p.cands.join(', ')}], target = ${p.target}`}
                style={{
                  fontFamily: mono, fontSize: 10, fontWeight: 600,
                  padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                  background: active ? C.accentGlow : C.surface2,
                  color: active ? C.accent : C.dim,
                  border: `1px solid ${active ? C.accent + '55' : C.border}`,
                  transition: 'all 0.2s',
                }}
              >{p.label}</button>
            );
          })}
          <span style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginLeft: 'auto' }}>
            distinct · 1–{MAX_VAL} · ≤ {MAX_CALLS} calls
          </span>
        </div>
      </div>
    </div>
  );
}

function VarRow({ name, value, color, glow, active }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
      padding: '6px 10px', borderRadius: 6,
      background: active ? glow : C.surface2,
      border: `1px solid ${active ? color + '55' : C.border}`,
      transition: 'all 0.4s',
    }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: C.dim, flexShrink: 0 }}>{name}</span>
      <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: active ? color : C.dim, textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

function StatePanel({ s, node, cands, target, foundCount, calls }) {
  const calcColor = s.calc ? COLOR[s.calc.color] : C.dim;
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
        {node && (
          <>
            <VarRow name="index" value={node.index < cands.length ? `${node.index} (${cands[node.index]})` : `${node.index} (end)`}
              color={C.purple} glow={C.purpleGlow} active />
            <VarRow name="current" value={fmt(node.path)} color={C.accent} glow={C.accentGlow} active />
            <VarRow name="sum / target" value={`${node.sum} / ${target}`}
              color={node.sum === target ? C.green : node.sum > target ? C.red : C.accent}
              glow={node.sum === target ? C.greenGlow : node.sum > target ? C.redGlow : C.accentGlow} active />
            <VarRow name="stack depth" value={node.depth + 1} color={C.orange} glow={C.orangeGlow} active />
          </>
        )}
        <VarRow name="found" value={foundCount} color={C.green} glow={C.greenGlow} active={foundCount > 0} />
        <VarRow name="calls" value={node ? `${node.id + 1} / ${calls}` : `${calls} / ${calls}`} color={C.text} glow={C.surface2} active={false} />

        {s.calc && (
          <div style={{
            padding: '10px 10px', borderRadius: 6, marginTop: 4,
            background: GLOW[s.calc.color], border: `1px solid ${calcColor}44`,
            transition: 'all 0.4s',
          }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 0.5, marginBottom: 4 }}>{s.calc.label}</div>
            <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: calcColor }}>{s.calc.value}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginTop: 5 }}>{s.calc.note}</div>
          </div>
        )}

        {s.done && (
          <div style={{
            padding: '10px 10px', borderRadius: 6,
            background: C.greenGlow, border: `1px solid ${C.green}44`, textAlign: 'center',
          }}>
            <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.green }}>return result ✓</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 3, letterSpacing: 0.5 }}>
              {foundCount} COMBINATION{foundCount === 1 ? '' : 'S'}
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
      }}>Python Code — Backtracking (include / skip)</div>

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
  const [input, setInput] = useState({ cands: DEFAULT_CANDS, target: DEFAULT_TARGET });
  const [candText, setCandText] = useState(DEFAULT_CANDS.join(', '));
  const [targetText, setTargetText] = useState(String(DEFAULT_TARGET));
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);

  const { cands, target } = input;
  const tree = useMemo(() => buildTree(cands, target), [cands, target]);
  const STEPS = useMemo(() => buildSteps(cands, target, tree.nodes), [cands, target, tree]);
  const total = STEPS.length;
  const s = STEPS[Math.min(step, total - 1)];
  const node = s.cur >= 0 ? tree.nodes[s.cur] : null;
  const found = tree.nodes.filter((d) => d.status === 'found' && (s.done || d.id <= s.cur));

  const load = (p) => {
    setInput({ cands: p.cands, target: p.target });
    setCandText(p.cands.join(', '));
    setTargetText(String(p.target));
    setError(null);
    setStep(0);
  };

  const run = () => {
    const res = parseInput(candText, targetText);
    if (res.error) { setError(res.error); return; }
    load(res.value);
  };

  useEffect(() => {
    const handle = (e) => {
      // don't hijack arrows / space while typing in an input box
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
    { color: C.purple, label: 'current call' },
    { color: C.accent, label: 'on call stack' },
    { color: C.green,  label: 'sum == target' },
    { color: C.red,    label: 'pruned / dead end' },
    { color: C.dim,    label: 'returned' },
  ];

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
        ::-webkit-scrollbar { height: 6px; width: 6px; }
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
          }}>Combination Sum</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            candidates = [{cands.join(', ')}], target = {target} &nbsp;&middot;&nbsp; Backtracking &nbsp;&middot;&nbsp; Use &larr; &rarr; keys or buttons
          </p>
        </div>

        {/* Custom input */}
        <InputPanel
          candText={candText} setCandText={setCandText}
          targetText={targetText} setTargetText={setTargetText}
          error={error} onRun={run} onPreset={load} current={input}
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

        {/* Main: Tree | State Panel */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'stretch' }}>

          <div style={{
            flex: '1 1 480px', minWidth: 0,
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
              fontFamily: mono, fontSize: 10, color: C.dim,
              letterSpacing: 2, textTransform: 'uppercase',
              display: 'flex', justifyContent: 'space-between', gap: 8,
            }}>
              <span>Recursion Tree · node = current_sum</span>
              <span style={{ color: C.dim }}>solid ↙ include · dashed ↘ skip</span>
            </div>

            <CandidatesBar cands={cands} index={node ? node.index : -1} />

            <RecursionTree tree={tree} cur={s.cur} done={s.done} />

            <ResultsStrip found={found} newId={s.cur} done={s.done} />

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

          <div style={{ width: 220, flexShrink: 0, flexGrow: 1, maxWidth: '100%' }}>
            <StatePanel s={s} node={node} cands={cands} target={target}
              foundCount={found.length} calls={tree.nodes.length} />
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
