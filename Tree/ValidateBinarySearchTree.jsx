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
//        5          ← root
//       / \
//      1    4       ← 4 violates BST (must be > 5)
//          / \
//         3    6    ← never visited (early termination)

const TREE = [
  { id: 0, val: 5, left: 1, right: 2, cx: 280, cy: 50  },
  { id: 1, val: 1, left: null, right: null, cx: 140, cy: 150 },
  { id: 2, val: 4, left: 3, right: 4, cx: 420, cy: 150 },
  { id: 3, val: 3, left: null, right: null, cx: 350, cy: 250 },
  { id: 4, val: 6, left: null, right: null, cx: 490, cy: 250 },
];

const EDGES = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 2, to: 3 },
  { from: 2, to: 4 },
];

const NULL_POS = {
  '1-left':  { cx: 90,  cy: 250 },
  '1-right': { cx: 190, cy: 250 },
};

const PATH_TO = {
  0: [0],
  1: [0, 1],
  2: [0, 2],
  3: [0, 2, 3],
  4: [0, 2, 4],
};

const NODE_R = 26;
const SVG_W = 580;
const SVG_H = 300;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'def validate(node, low, high):', ind: 0 },
  { t: 'if not node:', ind: 1 },
  { t: 'return True', ind: 2 },
  { t: 'if not (low < node.val < high):', ind: 1 },
  { t: 'return False', ind: 2 },
  { t: 'left_ok = validate(node.left, low, val)', ind: 1 },
  { t: 'right_ok = validate(node.right, val, high)', ind: 1 },
  { t: 'return left_ok and right_ok', ind: 1 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Tree",
    desc: "Given binary tree [5, 1, 4, null, null, 3, 6]. Determine if it is a valid BST \u2014 for every node, all values in its left subtree must be less, and all values in its right subtree must be greater.",
    activeNode: null, nullVisit: null,
    stack: [],
    returnValues: {},
    localVars: null,
    skippedNodes: [],
    codeHL: [], result: false,
  },
  {
    title: "Call validate(5, \u2212\u221e, \u221e)",
    desc: "Start at root node 5 with initial bounds (\u2212\u221e, \u221e). Any value satisfies these bounds. Check: \u2212\u221e < 5 < \u221e \u2192 True. Bounds check passes, so we recurse into both subtrees.",
    activeNode: 0, nullVisit: null,
    stack: [{ label: "validate(5, \u2212\u221e, \u221e)", returning: false }],
    returnValues: {},
    localVars: { nodeId: 0, low: '\u2212\u221e', high: '\u221e', boundsPass: true, left_ok: null, right_ok: null },
    skippedNodes: [],
    codeHL: [0, 1, 3], result: false,
  },
  {
    title: "Recurse Left \u2192 validate(1, \u2212\u221e, 5)",
    desc: "From node 5, recurse left: validate(1, \u2212\u221e, 5). The upper bound narrows to 5 (parent\u2019s value). Node 1 must be < 5. Check: \u2212\u221e < 1 < 5 \u2192 True. Bounds check passes.",
    activeNode: 1, nullVisit: null,
    stack: [
      { label: "validate(5, \u2212\u221e, \u221e)", returning: false },
      { label: "validate(1, \u2212\u221e, 5)", returning: false },
    ],
    returnValues: {},
    localVars: { nodeId: 1, low: '\u2212\u221e', high: '5', boundsPass: true, left_ok: null, right_ok: null },
    skippedNodes: [],
    codeHL: [0, 1, 3, 5], result: false,
  },
  {
    title: "1\u2019s Left \u2192 validate(None)",
    desc: "Node 1 has no left child. Call validate(None, \u2212\u221e, 1). Base case: node is None \u2192 return True. An empty subtree is always valid. Now left_ok = True for node 1.",
    activeNode: 1, nullVisit: { parentId: 1, side: 'left' },
    stack: [
      { label: "validate(5, \u2212\u221e, \u221e)", returning: false },
      { label: "validate(1, \u2212\u221e, 5)", returning: false },
      { label: "validate(None) \u2192 True", returning: true },
    ],
    returnValues: {},
    localVars: { nodeId: 1, low: '\u2212\u221e', high: '5', boundsPass: true, left_ok: 'True', right_ok: '?' },
    skippedNodes: [],
    codeHL: [1, 2, 5], result: false,
  },
  {
    title: "1\u2019s Right \u2192 validate(None)",
    desc: "Node 1 has no right child. Call validate(None, 1, 5). Base case \u2192 return True. Both subtrees of node 1 are valid. Now right_ok = True.",
    activeNode: 1, nullVisit: { parentId: 1, side: 'right' },
    stack: [
      { label: "validate(5, \u2212\u221e, \u221e)", returning: false },
      { label: "validate(1, \u2212\u221e, 5)", returning: false },
      { label: "validate(None) \u2192 True", returning: true },
    ],
    returnValues: {},
    localVars: { nodeId: 1, low: '\u2212\u221e', high: '5', boundsPass: true, left_ok: 'True', right_ok: 'True' },
    skippedNodes: [],
    codeHL: [1, 2, 6], result: false,
  },
  {
    title: "Node 1 Returns True",
    desc: "Back at node 1: bounds check passed, left_ok = True, right_ok = True. return True and True \u2192 True. The subtree rooted at 1 is a valid BST. Pop frame, back to node 5.",
    activeNode: 1, nullVisit: null,
    stack: [
      { label: "validate(5, \u2212\u221e, \u221e)", returning: false },
      { label: "validate(1, \u2212\u221e, 5) \u2192 True", returning: true },
    ],
    returnValues: { 1: true },
    localVars: { nodeId: 1, low: '\u2212\u221e', high: '5', boundsPass: true, left_ok: 'True', right_ok: 'True' },
    skippedNodes: [],
    codeHL: [7], result: false,
  },
  {
    title: "Back at 5 \u2014 Recurse Right \u2192 validate(4, 5, \u221e)",
    desc: "Back at node 5: left subtree valid (left_ok = True). Now recurse right: validate(4, 5, \u221e). The lower bound narrows to 5 (parent\u2019s value). Node 4 must be strictly greater than 5.",
    activeNode: 2, nullVisit: null,
    stack: [
      { label: "validate(5, \u2212\u221e, \u221e)", returning: false },
      { label: "validate(4, 5, \u221e)", returning: false },
    ],
    returnValues: { 1: true },
    localVars: { nodeId: 2, low: '5', high: '\u221e', boundsPass: null, left_ok: null, right_ok: null },
    skippedNodes: [],
    codeHL: [0, 1, 3, 6], result: false,
  },
  {
    title: "Bounds Check FAILS at Node 4!",
    desc: "Check: is 5 < 4 < \u221e? NO! 4 \u2264 5, so the condition fails. Node 4 is in the right subtree of 5, meaning it must be strictly greater than 5 \u2014 but 4 < 5. Return False immediately. Children 3 and 6 are never visited.",
    activeNode: 2, nullVisit: null,
    stack: [
      { label: "validate(5, \u2212\u221e, \u221e)", returning: false },
      { label: "validate(4, 5, \u221e) \u2192 False", returning: true },
    ],
    returnValues: { 1: true, 2: false },
    localVars: { nodeId: 2, low: '5', high: '\u221e', boundsPass: false, left_ok: null, right_ok: null },
    skippedNodes: [],
    codeHL: [3, 4], result: false,
  },
  {
    title: "Node 5 Returns False",
    desc: "Back at root node 5: left_ok = True (from node 1), but right_ok = False (from node 4). return True and False \u2192 False. The tree is NOT a valid BST.",
    activeNode: 0, nullVisit: null,
    stack: [
      { label: "validate(5, \u2212\u221e, \u221e) \u2192 False", returning: true },
    ],
    returnValues: { 0: false, 1: true, 2: false },
    localVars: { nodeId: 0, low: '\u2212\u221e', high: '\u221e', boundsPass: true, left_ok: 'True', right_ok: 'False' },
    skippedNodes: [],
    codeHL: [7], result: false,
  },
  {
    title: "Result: NOT a Valid BST",
    desc: "The tree is NOT a valid BST. Node 4 violates the BST property \u2014 as a right child of 5, it must be > 5, but 4 < 5. The recursive bounds-checking approach detected this by narrowing the valid range at each level. Nodes 3 and 6 were never visited due to early termination.",
    activeNode: null, nullVisit: null,
    stack: [],
    returnValues: { 0: false, 1: true, 2: false },
    localVars: null,
    skippedNodes: [3, 4],
    codeHL: [], result: true,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function TreeEdge({ from, to, active, completed, invalid }) {
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

  const color = invalid ? C.red : completed ? C.green : active ? C.accent : C.border;
  const width = active ? 2.5 : (completed || invalid) ? 2 : 1.5;

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

function BoundsLabel({ node, low, high, pass }) {
  if (!node) return null;
  const color = pass === true ? C.green : pass === false ? C.red : C.accent;
  const label = `${low} < ${node.val} < ${high}`;
  const labelW = label.length * 6.5 + 16;

  return (
    <g style={{ transition: 'opacity 0.4s' }}>
      <rect
        x={node.cx - labelW / 2} y={node.cy - NODE_R - 28}
        width={labelW} height={20} rx={4} ry={4}
        fill={C.surface} stroke={color} strokeWidth={1.2}
      />
      <text
        x={node.cx} y={node.cy - NODE_R - 14}
        textAnchor="middle" fontFamily={mono} fontSize={10}
        fontWeight={600} fill={color}
      >{label}</text>
      {pass === true && (
        <text
          x={node.cx + labelW / 2 + 8} y={node.cy - NODE_R - 13}
          textAnchor="middle" fontFamily={mono} fontSize={11}
          fontWeight={700} fill={C.green}
        >{"\u2713"}</text>
      )}
      {pass === false && (
        <text
          x={node.cx + labelW / 2 + 8} y={node.cy - NODE_R - 13}
          textAnchor="middle" fontFamily={mono} fontSize={11}
          fontWeight={700} fill={C.red}
        >{"\u2717"}</text>
      )}
    </g>
  );
}

function TreeNodeComp({ node, active, completed, invalid, returnVal, isResult, skipped }) {
  let stroke = C.border;
  let fill = C.surface2;
  let glow = 'none';

  if (skipped) {
    stroke = C.dim;
    fill = C.surface;
  } else if (isResult && invalid) {
    stroke = C.red;
    fill = C.surface2;
    glow = `0 0 18px ${C.redGlow}`;
  } else if (isResult && completed) {
    stroke = C.green;
    fill = C.surface2;
    glow = `0 0 18px ${C.greenGlow}`;
  } else if (invalid) {
    stroke = C.red;
    fill = C.surface2;
    glow = `0 0 14px ${C.redGlow}`;
  } else if (active) {
    stroke = C.accent;
    fill = C.surface2;
    glow = `0 0 18px ${C.accentGlow}`;
  } else if (completed) {
    stroke = C.green;
    fill = C.surface;
    glow = `0 0 10px ${C.greenGlow}`;
  }

  const badgeColor = returnVal === true ? C.green : returnVal === false ? C.red : null;
  const badgeText = returnVal === true ? '\u2713' : returnVal === false ? '\u2717' : null;

  return (
    <g>
      {(active || completed || invalid) && !skipped && (
        <circle
          cx={node.cx} cy={node.cy} r={NODE_R + 4}
          fill="none" stroke={invalid ? C.red : active ? C.accent : C.green}
          strokeWidth={1} opacity={0.25}
          style={{ transition: 'all 0.4s' }}
        />
      )}
      <circle
        cx={node.cx} cy={node.cy} r={NODE_R}
        fill={fill} stroke={stroke} strokeWidth={skipped ? 1.5 : 2.5}
        strokeDasharray={skipped ? '4,3' : 'none'}
        style={{ transition: 'fill 0.4s, stroke 0.4s', filter: glow !== 'none' ? `drop-shadow(${glow})` : 'none' }}
      />
      <text
        x={node.cx} y={node.cy + 5}
        textAnchor="middle" fontFamily={mono} fontSize={16}
        fontWeight={700}
        fill={skipped ? C.dim : invalid ? C.red : active ? C.accent : completed ? C.green : C.text}
        style={{ transition: 'fill 0.4s' }}
      >{node.val}</text>
      {badgeColor && (
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
      {skipped && (
        <text
          x={node.cx} y={node.cy + NODE_R + 16}
          textAnchor="middle" fontFamily={mono} fontSize={9}
          fontWeight={600} fill={C.dim} fontStyle="italic"
        >skipped</text>
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
          const isFalse = frame.label.includes('False');
          const isTrue = frame.label.includes('True') || frame.label.includes('\u2192 True');
          const isNone = frame.label.includes('None');

          let bgColor, borderColor, textColor;
          if (frame.returning) {
            if (isFalse) {
              bgColor = C.red + '18';
              borderColor = C.red;
              textColor = C.red;
            } else if (isNone || isTrue) {
              bgColor = C.green + '18';
              borderColor = C.green;
              textColor = C.green;
            } else {
              bgColor = C.green + '18';
              borderColor = C.green;
              textColor = C.green;
            }
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
                background: frame.returning ? (isFalse ? C.red : C.green) : isTop ? C.accent : C.border,
                flexShrink: 0,
              }} />
              {frame.label}
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
          depth: {stack.filter(f => !f.returning).length}
        </div>
      )}
    </div>
  );
}

function BoundsPanel({ localVars }) {
  if (!localVars) return null;
  const node = TREE[localVars.nodeId];
  const boundsColor = localVars.boundsPass === true ? C.green
    : localVars.boundsPass === false ? C.red : C.accent;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '10px 14px', marginTop: 8,
    }}>
      <div style={{
        fontFamily: mono, fontSize: 10, color: C.dim,
        letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
      }}>Bounds &mdash; node {node.val}</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <div style={{
          flex: 1, padding: '6px 10px',
          background: C.surface2, borderRadius: 6,
          border: `1px solid ${C.border}`,
          fontFamily: mono, fontSize: 13, fontWeight: 600,
          textAlign: 'center',
        }}>
          <span style={{ color: C.dim }}>low = </span>
          <span style={{ color: C.orange }}>{localVars.low}</span>
        </div>
        <div style={{
          flex: 1, padding: '6px 10px',
          background: C.surface2, borderRadius: 6,
          border: `1px solid ${C.border}`,
          fontFamily: mono, fontSize: 13, fontWeight: 600,
          textAlign: 'center',
        }}>
          <span style={{ color: C.dim }}>high = </span>
          <span style={{ color: C.purple }}>{localVars.high}</span>
        </div>
      </div>
      {localVars.boundsPass !== null && localVars.boundsPass !== undefined && (
        <div style={{
          padding: '5px 10px',
          background: localVars.boundsPass ? C.greenGlow : C.redGlow,
          borderRadius: 6,
          border: `1px solid ${boundsColor}40`,
          fontFamily: mono, fontSize: 11, fontWeight: 600,
          color: boundsColor, textAlign: 'center', marginBottom: 8,
        }}>
          {localVars.low} &lt; {node.val} &lt; {localVars.high} → {localVars.boundsPass ? 'Pass \u2713' : 'FAIL \u2717'}
        </div>
      )}
      {(localVars.left_ok !== null || localVars.right_ok !== null) && (
        <div style={{ display: 'flex', gap: 12 }}>
          {localVars.left_ok !== null && (
            <div style={{
              flex: 1, padding: '6px 10px',
              background: C.surface2, borderRadius: 6,
              border: `1px solid ${C.border}`,
              fontFamily: mono, fontSize: 12, fontWeight: 600,
              textAlign: 'center',
            }}>
              <span style={{ color: C.dim }}>left = </span>
              <span style={{
                color: localVars.left_ok === '?' ? C.dim
                  : localVars.left_ok === 'True' ? C.green
                  : localVars.left_ok === 'False' ? C.red : C.text
              }}>{localVars.left_ok}</span>
            </div>
          )}
          {localVars.right_ok !== null && (
            <div style={{
              flex: 1, padding: '6px 10px',
              background: C.surface2, borderRadius: 6,
              border: `1px solid ${C.border}`,
              fontFamily: mono, fontSize: 12, fontWeight: 600,
              textAlign: 'center',
            }}>
              <span style={{ color: C.dim }}>right = </span>
              <span style={{
                color: localVars.right_ok === '?' ? C.dim
                  : localVars.right_ok === 'True' ? C.green
                  : localVars.right_ok === 'False' ? C.red : C.text
              }}>{localVars.right_ok}</span>
            </div>
          )}
        </div>
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
      }}>Python Code &mdash; Recursive Bounds Check</div>
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
          }}>Validate Binary Search Tree</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            Tree: [5, 1, 4, null, null, 3, 6] &nbsp;&middot;&nbsp; Recursive Bounds Check &nbsp;&middot;&nbsp; Use &larr; &rarr; keys or buttons
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
                  const childRV = s.returnValues[edge.to];
                  const childCompleted = childRV !== undefined;
                  const childInvalid = childRV === false;
                  const onPath = activePath.includes(edge.from) && activePath.includes(edge.to);
                  return (
                    <TreeEdge
                      key={i}
                      from={edge.from}
                      to={edge.to}
                      active={onPath}
                      completed={childCompleted && !childInvalid}
                      invalid={childInvalid}
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
                {TREE.map((node) => {
                  const rv = s.returnValues[node.id];
                  const isSkipped = s.skippedNodes && s.skippedNodes.includes(node.id);
                  return (
                    <TreeNodeComp
                      key={node.id}
                      node={node}
                      active={s.activeNode === node.id}
                      completed={rv === true}
                      invalid={rv === false}
                      returnVal={rv}
                      isResult={s.result}
                      skipped={isSkipped}
                    />
                  );
                })}

                {/* Bounds label above active node */}
                {s.localVars && s.localVars.boundsPass !== null && s.localVars.boundsPass !== undefined && s.activeNode !== null && (
                  <BoundsLabel
                    node={TREE[s.activeNode]}
                    low={s.localVars.low}
                    high={s.localVars.high}
                    pass={s.localVars.boundsPass}
                  />
                )}

                {/* Result overlay */}
                {s.result && (
                  <g>
                    <text
                      x={SVG_W / 2} y={SVG_H - 15}
                      textAnchor="middle" fontFamily={mono} fontSize={16}
                      fontWeight={700} fill={C.red}
                    >NOT a Valid BST</text>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Right Panel: Call Stack + Bounds */}
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
              <CallStack stack={s.stack} />
            </div>
            <BoundsPanel localVars={s.localVars} />
          </div>
        </div>

        {/* Description */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${s.result ? C.red : C.accent}`,
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
