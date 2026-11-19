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
//   nums = [10, 5, 2, 6], k = 100
//   valid subarrays: [10] [5] [10,5] [2] [5,2] [6] [2,6] [5,2,6]
//   answer = 8
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const NUMS = [10, 5, 2, 6];
const K = 100;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: "def numSubarrayProductLessThanK(nums: List[int], k: int) -> int:", ind: 0 }, // 0
  { t: "if k <= 1:",                                   ind: 1 }, // 1
  { t: "return 0          # products are ≥ 1",         ind: 2 }, // 2
  { t: "product = 1",                                  ind: 1 }, // 3
  { t: "l = 0",                                        ind: 1 }, // 4
  { t: "count = 0",                                    ind: 1 }, // 5
  { t: "for r in range(len(nums)):",                   ind: 1 }, // 6
  { t: "product *= nums[r]        # grow right",       ind: 2 }, // 7
  { t: "while product >= k:",                          ind: 2 }, // 8
  { t: "product //= nums[l]   # shrink left",          ind: 3 }, // 9
  { t: "l += 1",                                       ind: 3 }, // 10
  { t: "count += r - l + 1        # subarrays ending at r", ind: 2 }, // 11
  { t: "return count",                                 ind: 1 }, // 12
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps  (nums = [10, 5, 2, 6], k = 100)
//
// Trace:
//   r=0: product=10            window [10]       count += 1 → 1
//   r=1: product=50            window [10,5]     count += 2 → 3
//   r=2: product=100 ≥ 100 ✗   shrink: //10 → 10, l=1
//                              window [5,2]      count += 2 → 5
//   r=3: product=60            window [5,2,6]    count += 3 → 8
//   return 8
//
// groups: cumulative list of [l, r] windows whose "ending at r"
//         subarrays have been counted.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Setup",
    desc: "nums = [10, 5, 2, 6], k = 100. k > 1, so the early return is skipped. Every number is ≥ 1, which means multiplying in a new element can only keep the product the same or make it larger. That monotonic property is what makes a sliding window work: grow the window on the right, and whenever the product reaches k, shrink it from the left until it's valid again.",
    l: 0, r: -1, product: 1, count: 0, phase: 'init',
    groups: [], calc: null, evicted: -1, done: false,
    codeHL: [0, 1, 3, 4, 5],
  },
  {
    title: "r = 0 — extend with 10",
    desc: "product = 1 × 10 = 10. 10 < 100, so the while loop doesn't run. The window is [10] (l = 0, r = 0). Every subarray that ends at r and starts anywhere in [l, r] is valid, and there are r − l + 1 = 1 of them: [10]. count = 1.",
    l: 0, r: 0, product: 10, count: 1, phase: 'count',
    groups: [[0, 0]], evicted: -1, done: false,
    calc: { label: 'count += r - l + 1', value: '0 − 0 + 1 = 1', note: '∴ count → 1', color: 'green' },
    codeHL: [6, 7, 8, 11],
  },
  {
    title: "r = 1 — extend with 5",
    desc: "product = 10 × 5 = 50. 50 < 100, so the window stays [10, 5]. The new subarrays ending at r = 1 are [5] and [10, 5], so r − l + 1 = 2. Each start position from l to r gives exactly one new subarray, which is why we add the window length rather than 1. count = 3.",
    l: 0, r: 1, product: 50, count: 3, phase: 'count',
    groups: [[0, 0], [0, 1]], evicted: -1, done: false,
    calc: { label: 'count += r - l + 1', value: '1 − 0 + 1 = 2', note: '∴ count → 3', color: 'green' },
    codeHL: [6, 7, 8, 11],
  },
  {
    title: "r = 2 — extend with 2 → too big",
    desc: "product = 50 × 2 = 100. The problem asks for product strictly less than k, and 100 is not < 100, so the window [10, 5, 2] is invalid. Because every number is ≥ 1, any wider window that still starts at index 0 would also be ≥ 100. We have to move l to the right.",
    l: 0, r: 2, product: 100, count: 3, phase: 'invalid',
    groups: [[0, 0], [0, 1]], evicted: -1, done: false,
    calc: { label: 'while product >= k', value: '100 >= 100 → True', note: '∴ shrink from the left', color: 'red' },
    codeHL: [7, 8],
  },
  {
    title: "r = 2 — shrink: drop 10",
    desc: "Divide out the leftmost element: product //= nums[0] → 100 // 10 = 10, then l = 1. The window is now [5, 2] with product 10. The while loop re-checks 10 >= 100, which is False, so shrinking stops. Integer division is exact here because nums[l] is always a factor of the current product.",
    l: 1, r: 2, product: 10, count: 3, phase: 'shrink',
    groups: [[0, 0], [0, 1]], evicted: 0, done: false,
    calc: { label: 'product //= nums[l]', value: '100 // 10 = 10', note: '∴ l → 1 · 10 < 100, stop', color: 'accent' },
    codeHL: [8, 9, 10],
  },
  {
    title: "r = 2 — count subarrays ending at 2",
    desc: "The window [5, 2] is valid. The subarrays ending at r = 2 are [2] and [5, 2], so r − l + 1 = 2 − 1 + 1 = 2. [10, 5, 2] is not counted because 10 has left the window. count = 5.",
    l: 1, r: 2, product: 10, count: 5, phase: 'count',
    groups: [[0, 0], [0, 1], [1, 2]], evicted: 0, done: false,
    calc: { label: 'count += r - l + 1', value: '2 − 1 + 1 = 2', note: '∴ count → 5', color: 'green' },
    codeHL: [11],
  },
  {
    title: "r = 3 — extend with 6",
    desc: "product = 10 × 6 = 60. 60 < 100, so no shrinking is needed. The window is [5, 2, 6], and the subarrays ending at r = 3 are [6], [2, 6] and [5, 2, 6], so r − l + 1 = 3. count = 8. l never moves backward, so each index enters and leaves the window at most once.",
    l: 1, r: 3, product: 60, count: 8, phase: 'count',
    groups: [[0, 0], [0, 1], [1, 2], [1, 3]], evicted: 0, done: false,
    calc: { label: 'count += r - l + 1', value: '3 − 1 + 1 = 3', note: '∴ count → 8', color: 'green' },
    codeHL: [6, 7, 8, 11],
  },
  {
    title: "Result: 8 subarrays ✓",
    desc: "The loop has finished, so we return count = 8. The valid subarrays are [10], [5], [10,5], [2], [5,2], [6], [2,6] and [5,2,6]. Both r and l only move forward, so this runs in O(n) time with O(1) space. The brute force tries every start index and runs in O(n²).",
    l: 1, r: 3, product: 60, count: 8, phase: 'done',
    groups: [[0, 0], [0, 1], [1, 2], [1, 3]], evicted: 0, done: true,
    calc: null,
    codeHL: [12],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const GLOW = { green: C.greenGlow, red: C.redGlow, accent: C.accentGlow, orange: C.orangeGlow, purple: C.purpleGlow };

function WindowBar({ l, r, product, phase, evicted, done }) {
  const invalid = phase === 'invalid';
  const winColor = done ? C.green : invalid ? C.red : C.accent;

  return (
    <div style={{ overflowX: 'auto', padding: '16px 16px 8px' }}>
      <div style={{ minWidth: 'max-content', width: 'max-content', margin: '0 auto' }}>

        {/* product badge above the window */}
        <div style={{ height: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
          {r >= 0 && (
            <div style={{
              fontFamily: mono, fontSize: 12, fontWeight: 700,
              color: winColor, background: GLOW[done ? 'green' : invalid ? 'red' : 'accent'],
              border: `1px solid ${winColor}55`, borderRadius: 6, padding: '4px 10px',
              transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
            }}>
              product = {product} {invalid ? '≥' : '<'} {K}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {NUMS.map((v, i) => {
            const inWin = r >= 0 && i >= l && i <= r;
            const isR = i === r && !done;
            const isEvicted = i < l && i <= evicted;
            const isFuture = i > r;

            let boxBorder, boxBg, boxText, glowStr;
            if (inWin && done) {
              boxBorder = C.green;  boxBg = C.greenGlow;  boxText = C.green;
              glowStr = `0 0 14px ${C.greenGlow}`;
            } else if (inWin && invalid) {
              boxBorder = C.red;    boxBg = C.redGlow;    boxText = C.red;
              glowStr = `0 0 14px ${C.redGlow}`;
            } else if (isR) {
              boxBorder = C.purple; boxBg = C.purpleGlow; boxText = C.purple;
              glowStr = `0 0 14px ${C.purpleGlow}`;
            } else if (inWin) {
              boxBorder = C.accent; boxBg = C.accentGlow; boxText = C.accent;
              glowStr = `0 0 10px ${C.accentGlow}`;
            } else if (isEvicted) {
              boxBorder = C.red + '55'; boxBg = 'rgba(248,113,113,0.07)'; boxText = C.red + 'bb';
              glowStr = 'none';
            } else if (isFuture && r >= 0) {
              boxBorder = C.border + '30'; boxBg = 'transparent'; boxText = C.dim + '60';
              glowStr = 'none';
            } else {
              boxBorder = C.border; boxBg = C.surface2; boxText = C.text;
              glowStr = 'none';
            }

            const showL = r >= 0 && i === l;
            const showR = r >= 0 && i === r;

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginBottom: 4 }}>{i}</span>
                <div style={{
                  width: 46, height: 46,
                  border: `2px solid ${boxBorder}`, borderRadius: 9, background: boxBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: mono, fontSize: 15, fontWeight: 700, color: boxText,
                  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                  filter: glowStr !== 'none' ? `drop-shadow(${glowStr})` : 'none',
                  position: 'relative',
                }}>
                  {v}
                  {isEvicted && (
                    <span style={{ position: 'absolute', top: -9, right: -3, fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.red }}>✗</span>
                  )}
                </div>
                <div style={{ height: 38, marginTop: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {showL && showR ? (
                    <>
                      <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.green }}>▲</span>
                      <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color: C.green, letterSpacing: 0.5 }}>L = R</span>
                    </>
                  ) : showL ? (
                    <>
                      <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.accent }}>▲</span>
                      <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color: C.accent, letterSpacing: 0.5 }}>l</span>
                    </>
                  ) : showR ? (
                    <>
                      <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.orange }}>▲</span>
                      <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color: C.orange, letterSpacing: 0.5 }}>r</span>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SubarrayList({ groups, prevGroups, done }) {
  return (
    <div style={{ padding: '4px 16px 10px' }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 1.5, marginBottom: 8, textAlign: 'center' }}>
        COUNTED SUBARRAYS (grouped by end index r)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        {groups.length === 0 && (
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim + '80' }}>— none yet —</span>
        )}
        {groups.map(([gl, gr], gi) => {
          const isNew = !done && gi >= prevGroups;
          const chips = [];
          for (let s = gr; s >= gl; s--) chips.push(NUMS.slice(s, gr + 1));
          const color = done ? C.green : isNew ? C.purple : C.green + 'cc';
          return (
            <div key={gi} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: C.dim, width: 34, textAlign: 'right' }}>r={gr}</span>
              {chips.map((arr, ci) => (
                <span key={ci} style={{
                  fontFamily: mono, fontSize: 11, fontWeight: 700, color,
                  background: done ? C.greenGlow : isNew ? C.purpleGlow : 'rgba(74,222,128,0.07)',
                  border: `1px solid ${done ? C.green + '55' : isNew ? C.purple + '55' : C.green + '33'}`,
                  borderRadius: 6, padding: '3px 8px',
                  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                }}>[{arr.join(',')}]</span>
              ))}
              <span style={{ fontFamily: mono, fontSize: 10, color: C.dim }}>+{gr - gl + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VarRow({ name, value, color, glow, active }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 10px', borderRadius: 6,
      background: active ? glow : C.surface2,
      border: `1px solid ${active ? color + '55' : C.border}`,
      transition: 'all 0.4s',
    }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>{name}</span>
      <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: active ? color : C.dim }}>{value}</span>
    </div>
  );
}

function StatePanel({ s }) {
  const started = s.r >= 0;
  const invalid = s.phase === 'invalid';
  const calcColor = s.calc ? { green: C.green, red: C.red, accent: C.accent }[s.calc.color] : C.dim;

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
        <VarRow name="k" value={K} color={C.text} glow={C.surface2} active />
        <VarRow name="l" value={s.l} color={C.accent} glow={C.accentGlow} active={started} />
        <VarRow name="r" value={started ? s.r : '—'} color={C.orange} glow={C.orangeGlow} active={started} />
        <VarRow name="product" value={s.product}
          color={invalid ? C.red : C.purple} glow={invalid ? C.redGlow : C.purpleGlow} active={started} />
        <VarRow name="count" value={s.count} color={C.green} glow={C.greenGlow} active={s.count > 0} />

        {s.calc && (
          <div style={{
            padding: '10px 10px', borderRadius: 6, marginTop: 4,
            background: GLOW[s.calc.color], border: `1px solid ${calcColor}44`,
            transition: 'all 0.4s',
          }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 0.5, marginBottom: 4 }}>{s.calc.label}</div>
            <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: calcColor }}>{s.calc.value}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginTop: 5 }}>{s.calc.note}</div>
          </div>
        )}

        {s.done && (
          <div style={{
            padding: '10px 10px', borderRadius: 6,
            background: C.greenGlow, border: `1px solid ${C.green}44`, textAlign: 'center',
          }}>
            <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.green }}>return 8 ✓</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 3, letterSpacing: 0.5 }}>SUBARRAYS WITH PRODUCT &lt; K</div>
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
      }}>Python Code — Sliding Window</div>

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
  const prevGroups = step > 0 ? STEPS[step - 1].groups.length : 0;

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
    { color: C.accent, label: 'window [l, r]' },
    { color: C.purple, label: 'new element r' },
    { color: C.red,    label: 'invalid / evicted' },
    { color: C.green,  label: 'counted' },
  ];

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
          }}>Subarray Product Less Than K</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            nums = [10, 5, 2, 6], k = 100 &nbsp;&middot;&nbsp; Sliding Window &nbsp;&middot;&nbsp; Use &larr; &rarr; keys or buttons
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

        {/* Main: Window | State Panel */}
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
            }}>nums [10, 5, 2, 6] · k = {K}</div>

            <WindowBar l={s.l} r={s.r} product={s.product} phase={s.phase} evicted={s.evicted} done={s.done} />

            <SubarrayList groups={s.groups} prevGroups={prevGroups} done={s.done} />

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
