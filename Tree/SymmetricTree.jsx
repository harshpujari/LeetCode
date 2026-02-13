import { useState, useEffect } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Theme
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const C = {
  bg: '#0a0e17', surface: '#111827', surface2: '#1a2340',
  border: '#2a3555', text: '#e2e8f0', dim: '#64748b',
  accent: '#38bdf8', accentGlow: 'rgba(56,189,248,0.15)',
  green: '#4ade80', greenGlow: 'rgba(74,222,128,0.15)',
  orange: '#fb923c', red: '#f87171', redGlow: 'rgba(248,113,113,0.15)',
  purple: '#a78bfa', purpleGlow: 'rgba(167,139,250,0.15)',
  nullC: '#475569',
};

const mono = "'Menlo','Monaco','Cascadia Code','Consolas','JetBrains Mono',monospace";
const sans = "system-ui,-apple-system,'Segoe UI',sans-serif";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tree Structure
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//          1            ← root
//         / \
//        2    2         ← mirror pair
//       / \  / \
//      3   4 4   3      ← leaf mirror pairs

const TREE = [
  { id: 0, val: 1, left: 1, right: 2, cx: 280, cy: 50 },
  { id: 1, val: 2, left: 3, right: 4, cx: 150, cy: 150 },
  { id: 2, val: 2, left: 5, right: 6, cx: 410, cy: 150 },
  { id: 3, val: 3, left: null, right: null, cx: 85, cy: 250 },
  { id: 4, val: 4, left: null, right: null, cx: 215, cy: 250 },
  { id: 5, val: 4, left: null, right: null, cx: 345, cy: 250 },
  { id: 6, val: 3, left: null, right: null, cx: 475, cy: 250 },
];

const EDGES = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
  { from: 1, to: 4 },
  { from: 2, to: 5 },
  { from: 2, to: 6 },
];

const PATH_TO = {
  0: [0],
  1: [0, 1],
  2: [0, 2],
  3: [0, 1, 3],
  4: [0, 1, 4],
  5: [0, 2, 5],
  6: [0, 2, 6],
};

const NODE_R = 26;
const SVG_W = 580;
const SVG_H = 310;
const MIRROR_X = 280;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'def isSymmetric(root):', ind: 0 },
  { t: 'if not root: return True', ind: 1 },
  { t: 'stack = [root.left, root.right]', ind: 1 },
  { t: 'while stack:', ind: 1 },
  { t: 'x, y = stack.pop(), stack.pop()', ind: 2 },
  { t: 'if not x and not y:', ind: 2 },
  { t: 'continue', ind: 3 },
  { t: 'if not x or not y or x.val != y.val:', ind: 2 },
  { t: 'return False', ind: 3 },
  { t: 'stack += [x.left, y.right]', ind: 2 },
  { t: 'stack += [x.right, y.left]', ind: 2 },
  { t: 'return True', ind: 1 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Tree",
    desc: "Given binary tree [1, 2, 2, 3, 4, 4, 3]. Determine if it is symmetric \u2014 a mirror image of itself around its center vertical axis.",
    activePair: null,
    activeRoot: false,
    matchedNodes: [],
    stack: [],
    comparison: null,
    codeHL: [],
    result: false,
  },
  {
    title: "Check Root & Initialize Stack",
    desc: "Root (1) exists, so we push its left child and right child onto the stack as the first mirror pair to compare. If these two subtrees are mirrors of each other, the entire tree is symmetric.",
    activePair: null,
    activeRoot: true,
    matchedNodes: [],
    stack: [{ label: "(2, 2)", type: 'pending' }],
    comparison: null,
    codeHL: [0, 1, 2],
    result: false,
  },
  {
    title: "Pop & Compare (2, 2)",
    desc: "Pop the pair (2, 2) from the stack. Both nodes exist and 2 == 2 \u2014 values match! Push their children as cross-pairs: (left.left, right.right) and (left.right, right.left). This cross-pairing is the key insight \u2014 mirror symmetry means outer matches outer, inner matches inner.",
    activePair: [1, 2],
    activeRoot: false,
    matchedNodes: [1, 2],
    stack: [
      { label: "(3, 3)", type: 'pending' },
      { label: "(4, 4)", type: 'pending' },
    ],
    comparison: { leftVal: 2, rightVal: 2, match: true, isNull: false },
    codeHL: [3, 4, 7, 9, 10],
    result: false,
  },
  {
    title: "Pop & Compare (3, 3) \u2014 Outer Pair",
    desc: "Pop the outermost leaf pair: node 3 (left-left) and node 3 (right-right). Both exist and 3 == 3 \u2014 match! These are leaves with no children, so we push two (None, None) pairs for their absent children.",
    activePair: [3, 6],
    activeRoot: false,
    matchedNodes: [1, 2, 3, 6],
    stack: [
      { label: "(4, 4)", type: 'pending' },
      { label: "(None, None)", type: 'null' },
      { label: "(None, None)", type: 'null' },
    ],
    comparison: { leftVal: 3, rightVal: 3, match: true, isNull: false },
    codeHL: [3, 4, 7, 9, 10],
    result: false,
  },
  {
    title: "Pop (None, None) \u2014 Leaf Boundaries",
    desc: "Pop two (None, None) pairs from the stack. Both elements are None each time, so we continue. Reaching None on both sides simultaneously confirms the subtrees have matching shape at these positions.",
    activePair: null,
    activeRoot: false,
    matchedNodes: [1, 2, 3, 6],
    stack: [
      { label: "(4, 4)", type: 'pending' },
    ],
    comparison: { leftVal: null, rightVal: null, match: null, isNull: true },
    codeHL: [3, 4, 5, 6],
    result: false,
  },
  {
    title: "Pop & Compare (4, 4) \u2014 Inner Pair",
    desc: "Pop the inner leaf pair: node 4 (left-right) and node 4 (right-left). Both exist and 4 == 4 \u2014 match! These are also leaves, so we push (None, None) pairs for their children.",
    activePair: [4, 5],
    activeRoot: false,
    matchedNodes: [1, 2, 3, 4, 5, 6],
    stack: [
      { label: "(None, None)", type: 'null' },
      { label: "(None, None)", type: 'null' },
    ],
    comparison: { leftVal: 4, rightVal: 4, match: true, isNull: false },
    codeHL: [3, 4, 7, 9, 10],
    result: false,
  },
  {
    title: "Pop (None, None) \u2014 Stack Empties",
    desc: "Pop the remaining (None, None) pairs. Both are None \u2192 continue. The stack is now empty, meaning every mirror pair has been checked and every comparison passed.",
    activePair: null,
    activeRoot: false,
    matchedNodes: [1, 2, 3, 4, 5, 6],
    stack: [],
    comparison: { leftVal: null, rightVal: null, match: null, isNull: true },
    codeHL: [3, 4, 5, 6],
    result: false,
  },
  {
    title: "Result: Symmetric Tree \u2713",
    desc: "The while loop ends because the stack is empty. Every mirror pair matched: (2,2), (3,3), and (4,4). All None boundaries aligned perfectly. The tree IS symmetric \u2014 it is a perfect mirror of itself. Return True.",
    activePair: null,
    activeRoot: false,
    matchedNodes: [0, 1, 2, 3, 4, 5, 6],
    stack: [],
    comparison: null,
    codeHL: [11],
    result: true,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function TreeEdge({ from, to, active, matched }) {
  const n1 = TREE[from];
  const n2 = TREE[to];
  const dx = n2.cx - n1.cx;
  const dy = n2.cy - n1.cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist, uy = dy / dist;
  const x1 = n1.cx + ux * NODE_R;
  const y1 = n1.cy + uy * NODE_R;
  const x2 = n2.cx - ux * NODE_R;
  const y2 = n2.cy - uy * NODE_R;

  const color = matched ? C.green : active ? C.accent : C.border;
  const width = active ? 2.5 : matched ? 2 : 1.5;

  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={width}
      style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
    />
  );
}

function MirrorArc({ nodeA, nodeB, color }) {
  if (!nodeA || !nodeB) return null;
  const midX = (nodeA.cx + nodeB.cx) / 2;
  const spread = Math.abs(nodeA.cx - nodeB.cx);
  const curveHeight = Math.min(spread * 0.25, 40);
  const controlY = Math.min(nodeA.cy, nodeB.cy) - NODE_R - curveHeight;

  return (
    <path
      d={`M ${nodeA.cx} ${nodeA.cy - NODE_R - 2} Q ${midX} ${controlY} ${nodeB.cx} ${nodeB.cy - NODE_R - 2}`}
      fill="none" stroke={color} strokeWidth={1.8} strokeDasharray="6,4"
      opacity={0.7}
      style={{ transition: 'opacity 0.4s' }}
    />
  );
}

function TreeNodeComp({ node, active, matched, isResult }) {
  let stroke = C.border;
  let fill = C.surface2;
  let glow = 'none';

  if (isResult && matched) {
    stroke = C.green;
    fill = C.surface2;
    glow = `0 0 18px ${C.greenGlow}`;
  } else if (active) {
    stroke = C.accent;
    fill = C.surface2;
    glow = `0 0 18px ${C.accentGlow}`;
  } else if (matched) {
    stroke = C.green;
    fill = C.surface;
    glow = `0 0 10px ${C.greenGlow}`;
  }

  const badgeColor = matched ? C.green : null;
  const badgeText = matched ? '\u2713' : null;

  return (
    <g>
      {(active || matched) && (
        <circle
          cx={node.cx} cy={node.cy} r={NODE_R + 4}
          fill="none" stroke={active ? C.accent : C.green}
          strokeWidth={1} opacity={0.25}
          style={{ transition: 'all 0.4s' }}
        />
      )}
      <circle
        cx={node.cx} cy={node.cy} r={NODE_R}
        fill={fill} stroke={stroke} strokeWidth={2.5}
        style={{ transition: 'fill 0.4s, stroke 0.4s', filter: glow !== 'none' ? `drop-shadow(${glow})` : 'none' }}
      />
      <text
        x={node.cx} y={node.cy + 5}
        textAnchor="middle" fontFamily={mono} fontSize={16}
        fontWeight={700}
        fill={active ? C.accent : matched ? C.green : C.text}
        style={{ transition: 'fill 0.4s' }}
      >{node.val}</text>
      {badgeColor && !active && (
        <g>
          <rect
            x={node.cx + NODE_R - 4} y={node.cy - NODE_R - 6}
            width={24} height={20} rx={6} ry={6}
            fill={badgeColor + '25'} stroke={badgeColor} strokeWidth={1.5}
          />
          <text
            x={node.cx + NODE_R + 8} y={node.cy - NODE_R + 8}
            textAnchor="middle" fontFamily={mono} fontSize={12}
            fontWeight={700} fill={badgeColor}
          >{badgeText}</text>
        </g>
      )}
    </g>
  );
}

function StackPanel({ stack }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: 'hidden', height: '100%',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        fontFamily: mono, fontSize: 10, color: C.dim, letterSpacing: 2,
        textTransform: 'uppercase', flexShrink: 0,
      }}>Stack (pairs)</div>
      <div style={{
        flex: 1, padding: '8px 10px',
        display: 'flex', flexDirection: 'column',
        justifyContent: stack.length > 0 ? 'flex-end' : 'center',
        minHeight: 60,
      }}>
        {stack.length === 0 && (
          <div style={{
            fontFamily: mono, fontSize: 11, color: C.dim,
            textAlign: 'center', fontStyle: 'italic',
          }}>empty</div>
        )}
        {stack.map((entry, i) => {
          const isTop = i === stack.length - 1;
          const isNull = entry.type === 'null';

          let bgColor, borderColor, textColor;
          if (isNull) {
            bgColor = 'transparent';
            borderColor = C.nullC;
            textColor = C.nullC;
          } else {
            bgColor = isTop ? C.accentGlow : 'transparent';
            borderColor = isTop ? C.accent : C.border;
            textColor = isTop ? C.accent : C.dim;
          }

          return (
            <div key={i} style={{
              padding: '6px 10px', marginBottom: i < stack.length - 1 ? 4 : 0,
              background: bgColor,
              border: `1px solid ${borderColor}`,
              borderRadius: 6,
              fontFamily: mono, fontSize: 11, fontWeight: 600,
              color: textColor,
              transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isNull ? C.nullC : isTop ? C.accent : C.border,
                flexShrink: 0,
              }} />
              {entry.label}
            </div>
          );
        })}
      </div>
      {stack.length > 0 && (
        <div style={{
          padding: '6px 14px', borderTop: `1px solid ${C.border}`,
          fontFamily: mono, fontSize: 10, color: C.dim,
          textAlign: 'center',
        }}>
          pairs: {stack.length}
        </div>
      )}
    </div>
  );
}

function ComparisonPanel({ comparison }) {
  if (!comparison) return null;

  if (comparison.isNull) {
    return (
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: '10px 14px', marginTop: 8,
      }}>
        <div style={{
          fontFamily: mono, fontSize: 10, color: C.dim,
          letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
        }}>Mirror Check</div>
        <div style={{
          padding: '6px 10px',
          background: C.purpleGlow,
          borderRadius: 6,
          border: `1px solid ${C.purple}40`,
          fontFamily: mono, fontSize: 11, fontWeight: 600,
          color: C.purple, textAlign: 'center',
        }}>
          Both None &rarr; continue
        </div>
      </div>
    );
  }

  const color = comparison.match ? C.green : C.red;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '10px 14px', marginTop: 8,
    }}>
      <div style={{
        fontFamily: mono, fontSize: 10, color: C.dim,
        letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
      }}>Mirror Check</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <div style={{
          flex: 1, padding: '6px 10px',
          background: C.surface2, borderRadius: 6,
          border: `1px solid ${C.border}`,
          fontFamily: mono, fontSize: 13, fontWeight: 600,
          textAlign: 'center',
        }}>
          <span style={{ color: C.dim }}>x = </span>
          <span style={{ color: C.accent }}>{comparison.leftVal}</span>
        </div>
        <div style={{
          flex: 1, padding: '6px 10px',
          background: C.surface2, borderRadius: 6,
          border: `1px solid ${C.border}`,
          fontFamily: mono, fontSize: 13, fontWeight: 600,
          textAlign: 'center',
        }}>
          <span style={{ color: C.dim }}>y = </span>
          <span style={{ color: C.accent }}>{comparison.rightVal}</span>
        </div>
      </div>
      <div style={{
        padding: '5px 10px',
        background: comparison.match ? C.greenGlow : C.redGlow,
        borderRadius: 6,
        border: `1px solid ${color}40`,
        fontFamily: mono, fontSize: 11, fontWeight: 600,
        color: color, textAlign: 'center',
      }}>
        {comparison.leftVal} == {comparison.rightVal} &rarr; {comparison.match ? 'Match \u2713' : 'MISMATCH \u2717'}
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
        fontFamily: mono, fontSize: 10, color: C.dim, letterSpacing: 2,
        textTransform: 'uppercase',
      }}>Python Code &mdash; Iterative Stack Mirror Check</div>
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

  // Compute active paths for highlighting edges
  let activeNodeIds = [];
  if (s.activePair) {
    activeNodeIds = [...PATH_TO[s.activePair[0]], ...PATH_TO[s.activePair[1]]];
  } else if (s.activeRoot) {
    activeNodeIds = [0];
  }

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
          }}>Symmetric Tree</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            Tree: [1, 2, 2, 3, 4, 4, 3] &nbsp;&middot;&nbsp; Iterative Stack Mirror Check &nbsp;&middot;&nbsp; Use &larr; &rarr; keys or buttons
          </p>
        </div>

        {/* Step Title */}
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

        {/* Main Visualization: Tree + Stack */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 16,
          alignItems: 'stretch',
        }}>
          {/* Tree SVG Panel */}
          <div style={{
            flex: '1 1 auto',
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto', padding: '4px' }}>
              <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                style={{ display: 'block', margin: '0 auto' }}>

                {/* Mirror axis */}
                <line
                  x1={MIRROR_X} y1={15} x2={MIRROR_X} y2={SVG_H - 20}
                  stroke={C.border} strokeWidth={1} strokeDasharray="4,6"
                  opacity={0.3}
                />
                <text
                  x={MIRROR_X} y={SVG_H - 6}
                  textAnchor="middle" fontFamily={mono} fontSize={8}
                  fill={C.dim} opacity={0.5}
                >mirror axis</text>

                {/* Edges */}
                {EDGES.map((edge, i) => {
                  const bothOnPath = activeNodeIds.includes(edge.from) && activeNodeIds.includes(edge.to);
                  const childMatched = s.matchedNodes.includes(edge.to);
                  return (
                    <TreeEdge
                      key={i}
                      from={edge.from}
                      to={edge.to}
                      active={bothOnPath && !childMatched}
                      matched={childMatched}
                    />
                  );
                })}

                {/* Mirror comparison arc */}
                {s.activePair && (
                  <MirrorArc
                    nodeA={TREE[s.activePair[0]]}
                    nodeB={TREE[s.activePair[1]]}
                    color={s.comparison && s.comparison.match ? C.green : C.accent}
                  />
                )}

                {/* Comparison label above the arc */}
                {s.activePair && s.comparison && !s.comparison.isNull && (() => {
                  const nA = TREE[s.activePair[0]];
                  const nB = TREE[s.activePair[1]];
                  const midX = (nA.cx + nB.cx) / 2;
                  const spread = Math.abs(nA.cx - nB.cx);
                  const curveHeight = Math.min(spread * 0.25, 40);
                  const labelY = Math.min(nA.cy, nB.cy) - NODE_R - curveHeight - 8;
                  const color = s.comparison.match ? C.green : C.red;
                  const label = `${s.comparison.leftVal} == ${s.comparison.rightVal}`;
                  const symbol = s.comparison.match ? ' \u2713' : ' \u2717';
                  const labelW = (label.length + 2) * 7 + 16;

                  return (
                    <g>
                      <rect
                        x={midX - labelW / 2} y={labelY - 12}
                        width={labelW} height={20} rx={4} ry={4}
                        fill={C.surface} stroke={color} strokeWidth={1.2}
                      />
                      <text
                        x={midX} y={labelY + 2}
                        textAnchor="middle" fontFamily={mono} fontSize={10}
                        fontWeight={600} fill={color}
                      >{label}{symbol}</text>
                    </g>
                  );
                })()}

                {/* Tree Nodes */}
                {TREE.map((node) => {
                  const isActive = s.activePair
                    ? s.activePair.includes(node.id)
                    : s.activeRoot && node.id === 0;
                  const isMatched = s.matchedNodes.includes(node.id);
                  return (
                    <TreeNodeComp
                      key={node.id}
                      node={node}
                      active={isActive}
                      matched={isMatched}
                      isResult={s.result}
                    />
                  );
                })}

                {/* Result overlay */}
                {s.result && (
                  <text
                    x={SVG_W / 2} y={SVG_H - 15}
                    textAnchor="middle" fontFamily={mono} fontSize={16}
                    fontWeight={700} fill={C.green}
                  >Symmetric Tree &#x2713;</text>
                )}
              </svg>
            </div>
          </div>

          {/* Right Panel: Stack + Comparison */}
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <StackPanel stack={s.stack} />
            </div>
            <ComparisonPanel comparison={s.comparison} />
          </div>
        </div>

        {/* Description */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${s.result ? C.green : C.accent}`,
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
              }}>&larr; Prev</button>
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
