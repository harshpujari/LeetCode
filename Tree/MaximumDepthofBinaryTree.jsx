import { useState, useEffect } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Theme
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const C = {
  bg: '#0a0e17', surface: '#111827', surface2: '#1a2340',
  border: '#2a3555', text: '#e2e8f0', dim: '#64748b',
  accent: '#38bdf8', accentGlow: 'rgba(56,189,248,0.15)',
  green: '#4ade80', greenGlow: 'rgba(74,222,128,0.15)',
  orange: '#fb923c', red: '#f87171',
  purple: '#a78bfa', purpleGlow: 'rgba(167,139,250,0.15)',
  nullC: '#475569',
};

const mono = "'Menlo','Monaco','Cascadia Code','Consolas','JetBrains Mono',monospace";
const sans = "system-ui,-apple-system,'Segoe UI',sans-serif";
const T = 'all 0.5s cubic-bezier(0.4,0,0.2,1)';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Tree Structure
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//        3
//       / \
//      9   20
//         / \
//       15    7

const TREE = [
  { id: 0, val: 3,  left: 1,    right: 2,    cx: 280, cy: 50  },
  { id: 1, val: 9,  left: null, right: null,  cx: 140, cy: 150 },
  { id: 2, val: 20, left: 3,    right: 4,    cx: 420, cy: 150 },
  { id: 3, val: 15, left: null, right: null,  cx: 350, cy: 250 },
  { id: 4, val: 7,  left: null, right: null,  cx: 490, cy: 250 },
];

const EDGES = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 2, to: 3 },
  { from: 2, to: 4 },
];

// Null child positions (where dashed "null" markers appear)
const NULL_POS = {
  '1-left':  { cx: 90,  cy: 250 },
  '1-right': { cx: 190, cy: 250 },
  '3-left':  { cx: 310, cy: 340 },
  '3-right': { cx: 390, cy: 340 },
  '4-left':  { cx: 450, cy: 340 },
  '4-right': { cx: 530, cy: 340 },
};

// Path from root to each node (for highlighting edges)
const PATH_TO = {
  0: [0],
  1: [0, 1],
  2: [0, 2],
  3: [0, 2, 3],
  4: [0, 2, 4],
};

const NODE_R = 26;
const SVG_W = 580;
const SVG_H = 370;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'def maxDepth(root):', ind: 0 },
  { t: 'if root == None:', ind: 1 },
  { t: 'return 0', ind: 2 },
  { t: 'l = maxDepth(root.left)', ind: 1 },
  { t: 'r = maxDepth(root.right)', ind: 1 },
  { t: 'return 1 + max(l, r)', ind: 1 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Tree",
    desc: "Given binary tree [3, 9, 20, null, null, 15, 7]. Find the maximum depth — the number of nodes along the longest path from the root down to the farthest leaf.",
    activeNode: null, nullVisit: null,
    stack: [],
    returnValues: {},
    localVars: null,
    codeHL: [], result: false,
  },
  {
    title: "Call maxDepth(3)",
    desc: "Start at root node 3. root is not None, so we skip the base case. We need l = maxDepth(root.left) and r = maxDepth(root.right).",
    activeNode: 0, nullVisit: null,
    stack: [{ label: "maxDepth(3)", returning: false }],
    returnValues: {},
    localVars: null,
    codeHL: [0, 1], result: false,
  },
  {
    title: "Recurse Left → maxDepth(9)",
    desc: "From node 3, recurse into the left subtree: l = maxDepth(9). Node 9 is not None, so we need its left and right subtree depths.",
    activeNode: 1, nullVisit: null,
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(9)", returning: false },
    ],
    returnValues: {},
    localVars: null,
    codeHL: [0, 1, 3], result: false,
  },
  {
    title: "9's Left → maxDepth(None)",
    desc: "Node 9 has no left child. Call maxDepth(None). Base case hit: root is None → return 0. This gives l = 0 for node 9.",
    activeNode: 1, nullVisit: { parentId: 1, side: 'left' },
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(9)", returning: false },
      { label: "maxDepth(None) → 0", returning: true },
    ],
    returnValues: {},
    localVars: { nodeId: 1, l: 0, r: '?' },
    codeHL: [1, 2, 3], result: false,
  },
  {
    title: "9's Right → maxDepth(None)",
    desc: "Node 9 has no right child. Call maxDepth(None). Base case → return 0. Now r = 0 for node 9. Both subtrees explored.",
    activeNode: 1, nullVisit: { parentId: 1, side: 'right' },
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(9)", returning: false },
      { label: "maxDepth(None) → 0", returning: true },
    ],
    returnValues: {},
    localVars: { nodeId: 1, l: 0, r: 0 },
    codeHL: [1, 2, 4], result: false,
  },
  {
    title: "Node 9 Returns 1",
    desc: "Back at node 9: l = 0, r = 0. return 1 + max(0, 0) = 1. The subtree rooted at 9 has depth 1 (just itself, no children). Pop frame, back to node 3.",
    activeNode: 1, nullVisit: null,
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(9) → 1", returning: true },
    ],
    returnValues: { 1: 1 },
    localVars: { nodeId: 1, l: 0, r: 0 },
    codeHL: [5], result: false,
  },
  {
    title: "Back at 3 — Recurse Right → maxDepth(20)",
    desc: "Back at node 3: l = 1 (from node 9). Now compute r = maxDepth(root.right). Call maxDepth(20). Node 20 is not None.",
    activeNode: 2, nullVisit: null,
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(20)", returning: false },
    ],
    returnValues: { 1: 1 },
    localVars: { nodeId: 0, l: 1, r: '?' },
    codeHL: [0, 1, 4], result: false,
  },
  {
    title: "20's Left → maxDepth(15)",
    desc: "From node 20, recurse left: l = maxDepth(15). Node 15 is not None, so we recurse into its children.",
    activeNode: 3, nullVisit: null,
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(20)", returning: false },
      { label: "maxDepth(15)", returning: false },
    ],
    returnValues: { 1: 1 },
    localVars: null,
    codeHL: [0, 1, 3], result: false,
  },
  {
    title: "15's Left → maxDepth(None)",
    desc: "Node 15 has no left child. maxDepth(None) → return 0. l = 0 for node 15.",
    activeNode: 3, nullVisit: { parentId: 3, side: 'left' },
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(20)", returning: false },
      { label: "maxDepth(15)", returning: false },
      { label: "maxDepth(None) → 0", returning: true },
    ],
    returnValues: { 1: 1 },
    localVars: { nodeId: 3, l: 0, r: '?' },
    codeHL: [1, 2, 3], result: false,
  },
  {
    title: "15's Right → maxDepth(None)",
    desc: "Node 15 has no right child. maxDepth(None) → return 0. r = 0 for node 15.",
    activeNode: 3, nullVisit: { parentId: 3, side: 'right' },
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(20)", returning: false },
      { label: "maxDepth(15)", returning: false },
      { label: "maxDepth(None) → 0", returning: true },
    ],
    returnValues: { 1: 1 },
    localVars: { nodeId: 3, l: 0, r: 0 },
    codeHL: [1, 2, 4], result: false,
  },
  {
    title: "Node 15 Returns 1",
    desc: "Back at node 15: l = 0, r = 0. return 1 + max(0, 0) = 1. Pop frame, back to node 20 with l = 1.",
    activeNode: 3, nullVisit: null,
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(20)", returning: false },
      { label: "maxDepth(15) → 1", returning: true },
    ],
    returnValues: { 1: 1, 3: 1 },
    localVars: { nodeId: 3, l: 0, r: 0 },
    codeHL: [5], result: false,
  },
  {
    title: "20's Right → maxDepth(7)",
    desc: "Back at node 20: l = 1 (from 15). Now compute r = maxDepth(root.right). Call maxDepth(7). Node 7 is not None.",
    activeNode: 4, nullVisit: null,
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(20)", returning: false },
      { label: "maxDepth(7)", returning: false },
    ],
    returnValues: { 1: 1, 3: 1 },
    localVars: { nodeId: 2, l: 1, r: '?' },
    codeHL: [0, 1, 4], result: false,
  },
  {
    title: "7's Left → maxDepth(None)",
    desc: "Node 7 has no left child. maxDepth(None) → return 0. l = 0 for node 7.",
    activeNode: 4, nullVisit: { parentId: 4, side: 'left' },
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(20)", returning: false },
      { label: "maxDepth(7)", returning: false },
      { label: "maxDepth(None) → 0", returning: true },
    ],
    returnValues: { 1: 1, 3: 1 },
    localVars: { nodeId: 4, l: 0, r: '?' },
    codeHL: [1, 2, 3], result: false,
  },
  {
    title: "7's Right → maxDepth(None)",
    desc: "Node 7 has no right child. maxDepth(None) → return 0. r = 0 for node 7.",
    activeNode: 4, nullVisit: { parentId: 4, side: 'right' },
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(20)", returning: false },
      { label: "maxDepth(7)", returning: false },
      { label: "maxDepth(None) → 0", returning: true },
    ],
    returnValues: { 1: 1, 3: 1 },
    localVars: { nodeId: 4, l: 0, r: 0 },
    codeHL: [1, 2, 4], result: false,
  },
  {
    title: "Node 7 Returns 1",
    desc: "Back at node 7: l = 0, r = 0. return 1 + max(0, 0) = 1. Pop frame, back to node 20 with r = 1.",
    activeNode: 4, nullVisit: null,
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(20)", returning: false },
      { label: "maxDepth(7) → 1", returning: true },
    ],
    returnValues: { 1: 1, 3: 1, 4: 1 },
    localVars: { nodeId: 4, l: 0, r: 0 },
    codeHL: [5], result: false,
  },
  {
    title: "Node 20 Returns 2",
    desc: "Back at node 20: l = 1 (from 15), r = 1 (from 7). return 1 + max(1, 1) = 2. The subtree rooted at 20 has depth 2. Pop frame, back to node 3.",
    activeNode: 2, nullVisit: null,
    stack: [
      { label: "maxDepth(3)", returning: false },
      { label: "maxDepth(20) → 2", returning: true },
    ],
    returnValues: { 1: 1, 2: 2, 3: 1, 4: 1 },
    localVars: { nodeId: 2, l: 1, r: 1 },
    codeHL: [5], result: false,
  },
  {
    title: "Node 3 Returns 3",
    desc: "Back at root node 3: l = 1 (from 9), r = 2 (from 20). return 1 + max(1, 2) = 3. The entire tree has maximum depth 3.",
    activeNode: 0, nullVisit: null,
    stack: [
      { label: "maxDepth(3) → 3", returning: true },
    ],
    returnValues: { 0: 3, 1: 1, 2: 2, 3: 1, 4: 1 },
    localVars: { nodeId: 0, l: 1, r: 2 },
    codeHL: [5], result: false,
  },
  {
    title: "Result: Maximum Depth = 3",
    desc: "The maximum depth is 3 — paths: root(3) → 20 → 15 or root(3) → 20 → 7. The recursion computed bottom-up: leaf nodes return 1, their parents add 1 + max(children), bubbling up to the root.",
    activeNode: null, nullVisit: null,
    stack: [],
    returnValues: { 0: 3, 1: 1, 2: 2, 3: 1, 4: 1 },
    localVars: null,
    codeHL: [5], result: true,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function TreeEdge({ from, to, active, completed }) {
  const n1 = TREE[from];
  const n2 = TREE[to];
  // Draw from bottom of parent to top of child
  const dx = n2.cx - n1.cx;
  const dy = n2.cy - n1.cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist, uy = dy / dist;
  const x1 = n1.cx + ux * NODE_R;
  const y1 = n1.cy + uy * NODE_R;
  const x2 = n2.cx - ux * NODE_R;
  const y2 = n2.cy - uy * NODE_R;

  const color = completed ? C.green : active ? C.accent : C.border;
  const width = active ? 2.5 : completed ? 2 : 1.5;

  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color} strokeWidth={width}
      style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
    />
  );
}

function NullEdge({ parentId, side, visible }) {
  const parent = TREE[parentId];
  const key = `${parentId}-${side}`;
  const pos = NULL_POS[key];
  if (!pos || !visible) return null;

  const dx = pos.cx - parent.cx;
  const dy = pos.cy - parent.cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist, uy = dy / dist;
  const x1 = parent.cx + ux * NODE_R;
  const y1 = parent.cy + uy * NODE_R;

  return (
    <line
      x1={x1} y1={y1} x2={pos.cx} y2={pos.cy - 12}
      stroke={C.nullC} strokeWidth={1.5} strokeDasharray="4,4"
      style={{ transition: 'opacity 0.4s', opacity: visible ? 0.7 : 0 }}
    />
  );
}

function NullMarker({ parentId, side, visible }) {
  const key = `${parentId}-${side}`;
  const pos = NULL_POS[key];
  if (!pos) return null;

  return (
    <g style={{ transition: 'opacity 0.4s', opacity: visible ? 1 : 0 }}>
      <rect
        x={pos.cx - 22} y={pos.cy - 12} width={44} height={24}
        rx={6} ry={6}
        fill="none" stroke={C.nullC} strokeWidth={1.5} strokeDasharray="4,3"
      />
      <text
        x={pos.cx} y={pos.cy + 4}
        textAnchor="middle" fontFamily={mono} fontSize={10}
        fontWeight={700} fill={C.nullC}
      >None</text>
    </g>
  );
}

function TreeNode({ node, active, completed, returnVal, isResult }) {
  let stroke = C.border;
  let fill = C.surface2;
  let glow = 'none';

  if (isResult) {
    stroke = C.green;
    fill = C.surface2;
    glow = `0 0 18px ${C.greenGlow}`;
  } else if (active) {
    stroke = C.accent;
    fill = C.surface2;
    glow = `0 0 18px ${C.accentGlow}`;
  } else if (completed) {
    stroke = C.green;
    fill = C.surface;
    glow = `0 0 10px ${C.greenGlow}`;
  }

  return (
    <g>
      {/* Glow circle (behind) */}
      {(active || completed || isResult) && (
        <circle
          cx={node.cx} cy={node.cy} r={NODE_R + 4}
          fill="none" stroke={active ? C.accent : C.green}
          strokeWidth={1} opacity={0.25}
          style={{ transition: 'all 0.4s' }}
        />
      )}
      {/* Main circle */}
      <circle
        cx={node.cx} cy={node.cy} r={NODE_R}
        fill={fill} stroke={stroke} strokeWidth={2.5}
        style={{ transition: 'fill 0.4s, stroke 0.4s', filter: glow !== 'none' ? `drop-shadow(${glow})` : 'none' }}
      />
      {/* Value */}
      <text
        x={node.cx} y={node.cy + 5}
        textAnchor="middle" fontFamily={mono} fontSize={16}
        fontWeight={700} fill={active ? C.accent : completed ? C.green : C.text}
        style={{ transition: 'fill 0.4s' }}
      >{node.val}</text>
      {/* Return value badge */}
      {returnVal !== undefined && (
        <g>
          <rect
            x={node.cx + NODE_R - 4} y={node.cy - NODE_R - 6}
            width={32} height={20} rx={6} ry={6}
            fill={C.green + '25'} stroke={C.green} strokeWidth={1.5}
          />
          <text
            x={node.cx + NODE_R + 12} y={node.cy - NODE_R + 8}
            textAnchor="middle" fontFamily={mono} fontSize={11}
            fontWeight={700} fill={C.green}
          >={returnVal}</text>
        </g>
      )}
    </g>
  );
}

function CallStack({ stack }) {
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
      }}>Call Stack</div>
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
        {stack.map((frame, i) => {
          const isTop = i === stack.length - 1;
          const bgColor = frame.returning
            ? (frame.label.includes('None') ? C.nullC + '18' : C.green + '18')
            : isTop ? C.accentGlow : 'transparent';
          const borderColor = frame.returning
            ? (frame.label.includes('None') ? C.nullC : C.green)
            : isTop ? C.accent : C.border;
          const textColor = frame.returning
            ? (frame.label.includes('None') ? C.nullC : C.green)
            : isTop ? C.accent : C.dim;

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
                background: frame.returning ? (frame.label.includes('None') ? C.nullC : C.green) : isTop ? C.accent : C.border,
                flexShrink: 0,
              }} />
              {frame.label}
            </div>
          );
        })}
      </div>
      {/* Depth indicator */}
      {stack.length > 0 && (
        <div style={{
          padding: '6px 14px', borderTop: `1px solid ${C.border}`,
          fontFamily: mono, fontSize: 10, color: C.dim,
          textAlign: 'center',
        }}>
          depth: {stack.filter(f => !f.returning).length}
        </div>
      )}
    </div>
  );
}

function LocalVarsPanel({ localVars }) {
  if (!localVars) return null;
  const node = TREE[localVars.nodeId];
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '10px 14px', marginTop: 8,
    }}>
      <div style={{
        fontFamily: mono, fontSize: 10, color: C.dim,
        letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
      }}>Local Variables — node {node.val}</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          flex: 1, padding: '6px 10px',
          background: C.surface2, borderRadius: 6,
          border: `1px solid ${C.border}`,
          fontFamily: mono, fontSize: 13, fontWeight: 600,
          textAlign: 'center',
        }}>
          <span style={{ color: C.dim }}>l = </span>
          <span style={{ color: localVars.l === '?' ? C.dim : C.orange }}>{localVars.l}</span>
        </div>
        <div style={{
          flex: 1, padding: '6px 10px',
          background: C.surface2, borderRadius: 6,
          border: `1px solid ${C.border}`,
          fontFamily: mono, fontSize: 13, fontWeight: 600,
          textAlign: 'center',
        }}>
          <span style={{ color: C.dim }}>r = </span>
          <span style={{ color: localVars.r === '?' ? C.dim : C.purple }}>{localVars.r}</span>
        </div>
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
      }}>Python Code — Recursive DFS</div>
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

  // Compute active path for edge highlighting
  const activePath = s.activeNode !== null ? PATH_TO[s.activeNode] : [];

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
          }}>Maximum Depth of Binary Tree</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            Tree: [3, 9, 20, null, null, 15, 7] &nbsp;&middot;&nbsp; Recursive DFS &nbsp;&middot;&nbsp; Use &larr; &rarr; keys or buttons
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

        {/* Main Visualization: Tree + Call Stack */}
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

                {/* Edges */}
                {EDGES.map((edge, i) => {
                  const onPath = activePath.includes(edge.from) && activePath.includes(edge.to);
                  const bothCompleted = s.returnValues[edge.from] !== undefined && s.returnValues[edge.to] !== undefined;
                  const childCompleted = s.returnValues[edge.to] !== undefined;
                  return (
                    <TreeEdge
                      key={i}
                      from={edge.from}
                      to={edge.to}
                      active={onPath}
                      completed={childCompleted || bothCompleted}
                    />
                  );
                })}

                {/* Null edges */}
                {s.nullVisit && (
                  <NullEdge
                    parentId={s.nullVisit.parentId}
                    side={s.nullVisit.side}
                    visible={true}
                  />
                )}

                {/* Null markers */}
                {s.nullVisit && (
                  <NullMarker
                    parentId={s.nullVisit.parentId}
                    side={s.nullVisit.side}
                    visible={true}
                  />
                )}

                {/* Tree Nodes */}
                {TREE.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    active={s.activeNode === node.id}
                    completed={s.returnValues[node.id] !== undefined}
                    returnVal={s.returnValues[node.id]}
                    isResult={s.result}
                  />
                ))}

                {/* Result overlay */}
                {s.result && (
                  <g>
                    <text
                      x={SVG_W / 2} y={SVG_H - 15}
                      textAnchor="middle" fontFamily={mono} fontSize={16}
                      fontWeight={700} fill={C.green}
                    >Maximum Depth = 3</text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Right Panel: Call Stack + Local Vars */}
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <CallStack stack={s.stack} />
            </div>
            <LocalVarsPanel localVars={s.localVars} />
          </div>
        </div>

        {/* Description */}
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
