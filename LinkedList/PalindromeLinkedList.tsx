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
  nullC: '#475569', slowC: '#4ade80', fastC: '#fb923c',
  p1C: '#38bdf8', p2C: '#f472b6', matchC: '#4ade80', mismatchC: '#f87171',
  reversedC: '#a78bfa',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface NodeData {
  data: number;
  addr: string;
}

interface Step {
  title: string;
  desc: string;
  slow: number | null;
  fast: number | null;
  p1: number | null;
  p2: number | null;
  arrows: [number, number][];
  reversedArrows: [number, number][];
  nextAddrs: string[];
  codeHL: number[];
  phase: 'init' | 'findMid' | 'reverse' | 'compare' | 'result';
  comparing: boolean;
  compareResult: 'match' | 'mismatch' | null;
  result: boolean | null;
  midFound: number | null;
  reversedStart: number | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Node Data
// List: 1 → 2 → 3 → 2 → 1 (palindrome)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NODES: NodeData[] = [
  { data: 1, addr: '0x1F' },
  { data: 2, addr: '0x2A' },
  { data: 3, addr: '0x47' },
  { data: 2, addr: '0x83' },
  { data: 1, addr: '0xB1' },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Layout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NW = 112, NH = 48, STRIDE = 152;
const BOX_Y = 72;
const ARROW_Y = BOX_Y + NH / 2;
const VIS_H = 220;

const nX = (i: number): number => 60 + i * STRIDE;
const nCX = (i: number): number => nX(i) + NW / 2;
const nRX = (i: number): number => nX(i) + NW;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: '# Find middle with slow/fast pointers', ind: 0 },
  { t: 'slow = fast = head', ind: 0 },
  { t: 'while fast and fast.next:', ind: 0 },
  { t: 'slow = slow.next', ind: 1 },
  { t: 'fast = fast.next.next', ind: 1 },
  { t: '', ind: 0 },
  { t: '# Reverse second half', ind: 0 },
  { t: 'prev = None', ind: 0 },
  { t: 'while slow:', ind: 0 },
  { t: 'tmp = slow.next', ind: 1 },
  { t: 'slow.next = prev', ind: 1 },
  { t: 'prev = slow', ind: 1 },
  { t: 'slow = tmp', ind: 1 },
  { t: '', ind: 0 },
  { t: '# Compare both halves', ind: 0 },
  { t: 'p1, p2 = head, prev', ind: 0 },
  { t: 'while p2:', ind: 0 },
  { t: 'if p1.val != p2.val:', ind: 1 },
  { t: 'return False', ind: 2 },
  { t: 'p1, p2 = p1.next, p2.next', ind: 1 },
  { t: 'return True', ind: 0 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS: Step[] = [
  // ── Initial ──
  {
    title: "Initial Linked List",
    desc: "We have a linked list: 1 → 2 → 3 → 2 → 1. We need to check if it's a palindrome (reads same forwards and backwards). We'll use the three-step approach: find middle, reverse second half, compare.",
    slow: null, fast: null, p1: null, p2: null,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    reversedArrows: [],
    nextAddrs: ['0x2A','0x47','0x83','0xB1','null'],
    codeHL: [], phase: 'init', comparing: false, compareResult: null,
    result: null, midFound: null, reversedStart: null,
  },
  // ── Phase 1: Find Middle ──
  {
    title: "Initialize slow & fast pointers",
    desc: "slow = fast = head — Both pointers start at head. slow moves 1 step, fast moves 2 steps. When fast reaches the end, slow will be at the middle.",
    slow: 0, fast: 0, p1: null, p2: null,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    reversedArrows: [],
    nextAddrs: ['0x2A','0x47','0x83','0xB1','null'],
    codeHL: [1], phase: 'findMid', comparing: false, compareResult: null,
    result: null, midFound: null, reversedStart: null,
  },
  {
    title: "Iter 1 — Check loop condition",
    desc: "while fast and fast.next — fast is at node 1, fast.next exists (node 2). Condition is True.",
    slow: 0, fast: 0, p1: null, p2: null,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    reversedArrows: [],
    nextAddrs: ['0x2A','0x47','0x83','0xB1','null'],
    codeHL: [2], phase: 'findMid', comparing: false, compareResult: null,
    result: null, midFound: null, reversedStart: null,
  },
  {
    title: "Iter 1 — Move pointers",
    desc: "slow = slow.next (1 → 2), fast = fast.next.next (1 → 3). slow at node 2, fast at node 3.",
    slow: 1, fast: 2, p1: null, p2: null,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    reversedArrows: [],
    nextAddrs: ['0x2A','0x47','0x83','0xB1','null'],
    codeHL: [3, 4], phase: 'findMid', comparing: false, compareResult: null,
    result: null, midFound: null, reversedStart: null,
  },
  {
    title: "Iter 2 — Check loop condition",
    desc: "while fast and fast.next — fast is at node 3, fast.next exists (node 2). Condition is True.",
    slow: 1, fast: 2, p1: null, p2: null,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    reversedArrows: [],
    nextAddrs: ['0x2A','0x47','0x83','0xB1','null'],
    codeHL: [2], phase: 'findMid', comparing: false, compareResult: null,
    result: null, midFound: null, reversedStart: null,
  },
  {
    title: "Iter 2 — Move pointers",
    desc: "slow = slow.next (2 → 3), fast = fast.next.next (3 → 1). slow at node 3 (middle!), fast at node 1 (last).",
    slow: 2, fast: 4, p1: null, p2: null,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    reversedArrows: [],
    nextAddrs: ['0x2A','0x47','0x83','0xB1','null'],
    codeHL: [3, 4], phase: 'findMid', comparing: false, compareResult: null,
    result: null, midFound: null, reversedStart: null,
  },
  {
    title: "Iter 3 — Check loop condition",
    desc: "while fast and fast.next — fast is at node 1 (last), fast.next is null. Condition is False. Exit loop.",
    slow: 2, fast: 4, p1: null, p2: null,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    reversedArrows: [],
    nextAddrs: ['0x2A','0x47','0x83','0xB1','null'],
    codeHL: [2], phase: 'findMid', comparing: false, compareResult: null,
    result: null, midFound: 2, reversedStart: null,
  },
  // ── Phase 2: Reverse Second Half ──
  {
    title: "Middle found! Start reversing",
    desc: "slow is at node 3 (middle). Now we reverse the second half starting from slow. Initialize prev = None.",
    slow: 2, fast: null, p1: null, p2: null,
    arrows: [[0,1],[1,2],[2,3],[3,4]],
    reversedArrows: [],
    nextAddrs: ['0x2A','0x47','0x83','0xB1','null'],
    codeHL: [6, 7], phase: 'reverse', comparing: false, compareResult: null,
    result: null, midFound: 2, reversedStart: null,
  },
  {
    title: "Reverse — Iter 1",
    desc: "Process node 3: tmp = slow.next (node 2), slow.next = prev (null), prev = slow (node 3), slow = tmp (node 2). Node 3 now points to null.",
    slow: 3, fast: null, p1: null, p2: null,
    arrows: [[0,1],[1,2],[3,4]],
    reversedArrows: [],
    nextAddrs: ['0x2A','0x47','null','0xB1','null'],
    codeHL: [9, 10, 11, 12], phase: 'reverse', comparing: false, compareResult: null,
    result: null, midFound: 2, reversedStart: 2,
  },
  {
    title: "Reverse — Iter 2",
    desc: "Process node 2 (4th): tmp = slow.next (node 1), slow.next = prev (node 3), prev = slow (node 2), slow = tmp (node 1). Node 2 now points back to node 3.",
    slow: 4, fast: null, p1: null, p2: null,
    arrows: [[0,1],[1,2]],
    reversedArrows: [[3, 2]],
    nextAddrs: ['0x2A','0x47','null','0x47','null'],
    codeHL: [9, 10, 11, 12], phase: 'reverse', comparing: false, compareResult: null,
    result: null, midFound: 2, reversedStart: 3,
  },
  {
    title: "Reverse — Iter 3",
    desc: "Process node 1 (5th): tmp = slow.next (null), slow.next = prev (node 2), prev = slow (node 1), slow = tmp (null). Node 1 now points back to node 2.",
    slow: null, fast: null, p1: null, p2: null,
    arrows: [[0,1],[1,2]],
    reversedArrows: [[4, 3], [3, 2]],
    nextAddrs: ['0x2A','0x47','null','0x47','0x83'],
    codeHL: [9, 10, 11, 12], phase: 'reverse', comparing: false, compareResult: null,
    result: null, midFound: 2, reversedStart: 4,
  },
  {
    title: "Reverse complete!",
    desc: "slow is null, exit loop. Second half is now reversed: 1(5th) → 2(4th) → 3(middle). prev points to the head of reversed half (node 1, 5th position).",
    slow: null, fast: null, p1: null, p2: null,
    arrows: [[0,1],[1,2]],
    reversedArrows: [[4, 3], [3, 2]],
    nextAddrs: ['0x2A','0x47','null','0x47','0x83'],
    codeHL: [8], phase: 'reverse', comparing: false, compareResult: null,
    result: null, midFound: 2, reversedStart: 4,
  },
  // ── Phase 3: Compare ──
  {
    title: "Initialize comparison pointers",
    desc: "p1 = head (node 1, first), p2 = prev (node 1, last). We'll compare values moving inward from both ends.",
    slow: null, fast: null, p1: 0, p2: 4,
    arrows: [[0,1],[1,2]],
    reversedArrows: [[4, 3], [3, 2]],
    nextAddrs: ['0x2A','0x47','null','0x47','0x83'],
    codeHL: [14, 15], phase: 'compare', comparing: false, compareResult: null,
    result: null, midFound: 2, reversedStart: 4,
  },
  {
    title: "Compare 1 — Check values",
    desc: "p1.val = 1, p2.val = 1. They match! Continue comparison.",
    slow: null, fast: null, p1: 0, p2: 4,
    arrows: [[0,1],[1,2]],
    reversedArrows: [[4, 3], [3, 2]],
    nextAddrs: ['0x2A','0x47','null','0x47','0x83'],
    codeHL: [16, 17], phase: 'compare', comparing: true, compareResult: 'match',
    result: null, midFound: 2, reversedStart: 4,
  },
  {
    title: "Compare 1 — Move pointers",
    desc: "p1 = p1.next (node 2, second), p2 = p2.next (node 2, fourth). Moving to next pair.",
    slow: null, fast: null, p1: 1, p2: 3,
    arrows: [[0,1],[1,2]],
    reversedArrows: [[4, 3], [3, 2]],
    nextAddrs: ['0x2A','0x47','null','0x47','0x83'],
    codeHL: [19], phase: 'compare', comparing: false, compareResult: null,
    result: null, midFound: 2, reversedStart: 4,
  },
  {
    title: "Compare 2 — Check values",
    desc: "p1.val = 2, p2.val = 2. They match! Continue comparison.",
    slow: null, fast: null, p1: 1, p2: 3,
    arrows: [[0,1],[1,2]],
    reversedArrows: [[4, 3], [3, 2]],
    nextAddrs: ['0x2A','0x47','null','0x47','0x83'],
    codeHL: [16, 17], phase: 'compare', comparing: true, compareResult: 'match',
    result: null, midFound: 2, reversedStart: 4,
  },
  {
    title: "Compare 2 — Move pointers",
    desc: "p1 = p1.next (node 3, middle), p2 = p2.next (node 3, middle). Both reach the middle!",
    slow: null, fast: null, p1: 2, p2: 2,
    arrows: [[0,1],[1,2]],
    reversedArrows: [[4, 3], [3, 2]],
    nextAddrs: ['0x2A','0x47','null','0x47','0x83'],
    codeHL: [19], phase: 'compare', comparing: false, compareResult: null,
    result: null, midFound: 2, reversedStart: 4,
  },
  {
    title: "Compare 3 — Check loop condition",
    desc: "while p2 — p2 is at node 3, p2.next is null in the reversed list. After this comparison, p2 will be null.",
    slow: null, fast: null, p1: 2, p2: 2,
    arrows: [[0,1],[1,2]],
    reversedArrows: [[4, 3], [3, 2]],
    nextAddrs: ['0x2A','0x47','null','0x47','0x83'],
    codeHL: [16], phase: 'compare', comparing: true, compareResult: 'match',
    result: null, midFound: 2, reversedStart: 4,
  },
  {
    title: "Comparison complete!",
    desc: "p2 becomes null after following the reversed chain. All pairs matched! The linked list is a palindrome.",
    slow: null, fast: null, p1: null, p2: null,
    arrows: [[0,1],[1,2]],
    reversedArrows: [[4, 3], [3, 2]],
    nextAddrs: ['0x2A','0x47','null','0x47','0x83'],
    codeHL: [16], phase: 'result', comparing: false, compareResult: null,
    result: null, midFound: 2, reversedStart: 4,
  },
  {
    title: "Return True",
    desc: "return True — All values matched when comparing from both ends. The list [1, 2, 3, 2, 1] is confirmed to be a palindrome!",
    slow: null, fast: null, p1: null, p2: null,
    arrows: [[0,1],[1,2]],
    reversedArrows: [[4, 3], [3, 2]],
    nextAddrs: ['0x2A','0x47','null','0x47','0x83'],
    codeHL: [20], phase: 'result', comparing: false, compareResult: null,
    result: true, midFound: 2, reversedStart: 4,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const mono = "'Menlo', 'Monaco', 'Cascadia Code', 'Consolas', 'JetBrains Mono', monospace";
const sans = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const T = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

interface NodeBoxProps {
  x: number;
  node: NodeData;
  nextAddr: string;
  visible: boolean;
  highlight: 'match' | 'mismatch' | 'p1' | 'p2' | 'both' | 'mid' | 'reversed' | null;
}

function NodeBox({ x, node, nextAddr, visible, highlight }: NodeBoxProps) {
  const getBorderColor = () => {
    if (highlight === 'match') return C.matchC;
    if (highlight === 'mismatch') return C.mismatchC;
    if (highlight === 'p1') return C.p1C;
    if (highlight === 'p2') return C.p2C;
    if (highlight === 'both') return C.purple;
    if (highlight === 'mid') return C.orange;
    if (highlight === 'reversed') return C.reversedC;
    return C.accent;
  };

  const getGlow = () => {
    if (highlight === 'match') return `0 0 20px rgba(74,222,128,0.4)`;
    if (highlight === 'mismatch') return `0 0 20px rgba(248,113,113,0.4)`;
    if (highlight === 'both') return `0 0 20px ${C.purpleGlow}`;
    return `0 0 14px ${C.accentGlow}`;
  };

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
        border: `2px solid ${getBorderColor()}`,
        borderRadius: 8, overflow: 'hidden',
        boxShadow: getGlow(),
        transition: T,
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
            fontFamily: mono, fontSize: 9.5,
            fontWeight: 600, color: nextAddr === 'null' ? C.nullC : C.orange,
            lineHeight: '18px',
          }}>{nextAddr}</div>
          <div style={{ fontFamily: mono, fontSize: 6.5, color: C.dim, letterSpacing: 1.5, marginTop: 1 }}>NEXT</div>
        </div>
      </div>
    </div>
  );
}

interface ArrowProps {
  x1: number;
  x2: number;
  visible: boolean;
  color?: string;
  reversed?: boolean;
}

function Arrow({ x1, x2, visible, color = C.orange, reversed = false }: ArrowProps) {
  const left = Math.min(x1, x2);
  const w = Math.abs(x2 - x1);
  const isReversed = x1 > x2;

  return (
    <div style={{
      position: 'absolute', left, top: ARROW_Y - 1 + (reversed ? 12 : 0),
      width: w, height: 2, transition: T,
      opacity: visible ? 0.75 : 0, zIndex: 1,
      background: color,
    }}>
      <div style={{
        position: 'absolute',
        ...(isReversed ? { left: -6 } : { right: -6 }),
        top: -4,
        width: 0, height: 0,
        ...(isReversed
          ? { borderRight: `7px solid ${color}`, borderLeft: 'none' }
          : { borderLeft: `7px solid ${color}`, borderRight: 'none' }
        ),
        borderTop: '4.5px solid transparent',
        borderBottom: '4.5px solid transparent',
        opacity: visible && w > 10 ? 1 : 0, transition: 'opacity 0.3s',
      }} />
    </div>
  );
}

interface PointerTagProps {
  x: number;
  label: string;
  color: string;
  below: boolean;
  visible: boolean;
  secondary?: string;
}

function PointerTag({ x, label, color, below, visible, secondary }: PointerTagProps) {
  const top = below ? BOX_Y + NH + 10 : BOX_Y - 36;
  return (
    <div style={{
      position: 'absolute', left: x, top,
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      transition: T, opacity: visible ? 1 : 0, zIndex: 5,
    }}>
      {!below && (
        <>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{
              fontFamily: mono, fontSize: 10, fontWeight: 700, color,
              background: color + '18', padding: '2px 8px', borderRadius: 4,
              letterSpacing: 1.5, whiteSpace: 'nowrap',
            }}>{label}</div>
            {secondary && (
              <div style={{
                fontFamily: mono, fontSize: 10, fontWeight: 700, color: C.fastC,
                background: C.fastC + '18', padding: '2px 8px', borderRadius: 4,
                letterSpacing: 1.5, whiteSpace: 'nowrap',
              }}>{secondary}</div>
            )}
          </div>
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
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{
              fontFamily: mono, fontSize: 10, fontWeight: 700, color,
              background: color + '18', padding: '2px 8px', borderRadius: 4,
              letterSpacing: 1.5, whiteSpace: 'nowrap',
            }}>{label}</div>
            {secondary && (
              <div style={{
                fontFamily: mono, fontSize: 10, fontWeight: 700, color: C.fastC,
                background: C.fastC + '18', padding: '2px 8px', borderRadius: 4,
                letterSpacing: 1.5, whiteSpace: 'nowrap',
              }}>{secondary}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface CodePanelProps {
  highlighted: number[];
}

function CodePanel({ highlighted }: CodePanelProps) {
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
                color: hl ? C.text : (line.t ? (line.t.startsWith('#') ? C.dim : C.dim) : 'transparent'),
                whiteSpace: 'pre', transition: 'color 0.3s',
                fontStyle: line.t.startsWith('#') ? 'italic' : 'normal',
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
    const handle = (e: KeyboardEvent) => {
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

  const getNodeHighlight = (i: number): NodeBoxProps['highlight'] => {
    if (s.comparing && s.compareResult && (i === s.p1 || i === s.p2)) {
      return s.compareResult;
    }
    if (s.p1 !== null && s.p2 !== null && s.p1 === s.p2 && i === s.p1) {
      return 'both';
    }
    if (s.midFound === i && s.phase === 'findMid') {
      return 'mid';
    }
    if (s.phase === 'reverse' && i >= (s.midFound ?? 99)) {
      return 'reversed';
    }
    return null;
  };

  const headX = nCX(0);

  // Determine which pointers to show
  const showSlow = s.slow !== null && s.phase === 'findMid';
  const showFast = s.fast !== null && s.phase === 'findMid';
  const showP1 = s.p1 !== null;
  const showP2 = s.p2 !== null;
  const sameSlowFast = s.slow !== null && s.fast !== null && s.slow === s.fast;
  const sameP1P2 = s.p1 !== null && s.p2 !== null && s.p1 === s.p2;

  const getPhaseColor = () => {
    if (s.phase === 'findMid') return C.orange;
    if (s.phase === 'reverse') return C.purple;
    if (s.phase === 'compare') return C.p1C;
    if (s.result === true) return C.matchC;
    if (s.result === false) return C.mismatchC;
    return C.accent;
  };

  const getPhaseBadge = () => {
    if (s.phase === 'init') return null;
    if (s.phase === 'findMid') return { text: 'PHASE 1: FIND MIDDLE', color: C.orange };
    if (s.phase === 'reverse') return { text: 'PHASE 2: REVERSE', color: C.purple };
    if (s.phase === 'compare') return { text: 'PHASE 3: COMPARE', color: C.p1C };
    if (s.phase === 'result') return { text: 'RESULT', color: s.result ? C.matchC : C.mismatchC };
    return null;
  };

  const badge = getPhaseBadge();

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
            List: [1, 2, 3, 2, 1] &nbsp;·&nbsp; Three-phase approach: Find middle, Reverse, Compare &nbsp;·&nbsp; Use ← → keys or buttons
          </p>
        </div>

        {/* ── Phase Badge ── */}
        {badge && (
          <div style={{
            display: 'inline-block',
            fontFamily: mono, fontSize: 10, fontWeight: 700,
            color: badge.color, background: badge.color + '18',
            padding: '4px 12px', borderRadius: 6, marginBottom: 12,
            letterSpacing: 1.5,
          }}>{badge.text}</div>
        )}

        {/* ── Step Title ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div style={{
            fontFamily: mono, fontSize: 14, fontWeight: 700,
            color: getPhaseColor(),
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
                  highlight={getNodeHighlight(i)}
                />
              ))}

              {/* Regular arrows */}
              {s.arrows.map(([from, to], idx) => {
                const x1 = nRX(from);
                const x2 = nX(to);
                return <Arrow key={`arr-${idx}`} x1={x1} x2={x2} visible={true} />;
              })}

              {/* Reversed arrows */}
              {s.reversedArrows.map(([from, to], idx) => {
                const x1 = nRX(from);
                const x2 = nX(to);
                return <Arrow key={`rev-${idx}`} x1={x1} x2={x2} visible={true} color={C.reversedC} reversed={true} />;
              })}

              {/* Slow/Fast pointers (Phase 1) */}
              {sameSlowFast && showSlow ? (
                <PointerTag
                  x={nCX(s.slow!)}
                  label="slow"
                  color={C.slowC}
                  below={true}
                  visible={true}
                  secondary="fast"
                />
              ) : (
                <>
                  {showSlow && (
                    <PointerTag x={nCX(s.slow!)} label="slow" color={C.slowC} below={true} visible={true} />
                  )}
                  {showFast && (
                    <PointerTag x={nCX(s.fast!)} label="fast" color={C.fastC} below={true} visible={true} />
                  )}
                </>
              )}

              {/* slow pointer during reverse phase */}
              {s.phase === 'reverse' && s.slow !== null && (
                <PointerTag x={nCX(s.slow)} label="slow" color={C.slowC} below={true} visible={true} />
              )}

              {/* P1/P2 pointers (Phase 3) */}
              {sameP1P2 && showP1 ? (
                <PointerTag
                  x={nCX(s.p1!)}
                  label="p1"
                  color={C.p1C}
                  below={true}
                  visible={true}
                  secondary="p2"
                />
              ) : (
                <>
                  {showP1 && (
                    <PointerTag x={nCX(s.p1!)} label="p1" color={C.p1C} below={true} visible={true} />
                  )}
                  {showP2 && (
                    <PointerTag x={nCX(s.p2!)} label="p2" color={C.p2C} below={true} visible={true} />
                  )}
                </>
              )}

              {/* Result highlight */}
              {s.result === true && (
                <div style={{
                  position: 'absolute', left: nX(0) - 6, top: BOX_Y - 22,
                  width: nRX(4) - nX(0) + 12, height: NH + 40,
                  border: `2px solid ${C.matchC}`, borderRadius: 14,
                  opacity: 0.35, pointerEvents: 'none',
                  boxShadow: `0 0 20px rgba(74,222,128,0.2)`,
                  transition: T,
                }} />
              )}
            </div>
          </div>
        </div>

        {/* ── Description ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${getPhaseColor()}`,
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

        {/* ── Legend ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: '12px 18px', marginBottom: 16,
          display: 'flex', gap: 24, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.slowC }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>slow (1 step)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.fastC }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>fast (2 steps)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.p1C }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>p1 (left half)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.p2C }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>p2 (reversed)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.reversedC }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>reversed links</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: C.matchC }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>match</span>
          </div>
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
            >Prev</button>
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
            >Next</button>
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
