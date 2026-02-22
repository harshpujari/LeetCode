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
//   prices = [7, 1, 5, 3, 6, 4]
//   buy at index 1 (price 1), sell at index 4 (price 6)
//   max_profit = 5
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PRICES = [7, 1, 5, 3, 6, 4];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: "def maxProfit(prices: List[int]) -> int:", ind: 0 },
  { t: "min_price = float('inf')",                 ind: 1 },
  { t: "max_profit = 0",                           ind: 1 },
  { t: "for price in prices:",                     ind: 1 },
  { t: "min_price = min(min_price, price)",        ind: 2 },
  { t: "max_profit = max(max_profit, price - min_price)", ind: 2 },
  { t: "return max_profit",                        ind: 1 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps  (prices = [7, 1, 5, 3, 6, 4])
//
// Trace:
//   price=7: min=7,  profit=7−7=0  → max_profit=0
//   price=1: min=1,  profit=1−1=0  → max_profit=0
//   price=5: min=1,  profit=5−1=4  → max_profit=4  ★ new best
//   price=3: min=1,  profit=3−1=2  → max_profit=4
//   price=6: min=1,  profit=6−1=5  → max_profit=5  ★ new best
//   price=4: min=1,  profit=4−1=3  → max_profit=5
//   return 5
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Setup",
    desc: "prices = [7, 1, 5, 3, 6, 4]. Initialize min_price = ∞ and max_profit = 0. We scan each price once, tracking the lowest price seen so far (best buy day) and the maximum profit achievable by selling at the current price. This greedy single-pass approach runs in O(n) time with O(1) space — no nested loops needed.",
    cur_idx: -1, min_price: null, max_profit: 0, buy_idx: -1, sell_idx: -1,
    done: false, calc: null,
    codeHL: [0, 1, 2],
  },
  {
    title: "Day 0 — price = 7",
    desc: "price = 7. Update min_price = min(∞, 7) = 7. Candidate profit = 7 − 7 = 0. max_profit = max(0, 0) = 0 (unchanged). Day 0 is the cheapest price seen so far — it becomes our tentative buy day. No profitable trade yet.",
    cur_idx: 0, min_price: 7, max_profit: 0, buy_idx: 0, sell_idx: -1,
    done: false,
    calc: { price: 7, min_p: 7, profit: 0, updated_min: true, updated_profit: false, max_p: 0 },
    codeHL: [3, 4, 5],
  },
  {
    title: "Day 1 — price = 1",
    desc: "price = 1. Update min_price = min(7, 1) = 1. Candidate profit = 1 − 1 = 0. max_profit = max(0, 0) = 0 (unchanged). Price 1 is a new all-time low — day 1 becomes the new best buy day. Still no profitable trade.",
    cur_idx: 1, min_price: 1, max_profit: 0, buy_idx: 1, sell_idx: -1,
    done: false,
    calc: { price: 1, min_p: 1, profit: 0, updated_min: true, updated_profit: false, max_p: 0 },
    codeHL: [3, 4, 5],
  },
  {
    title: "Day 2 — price = 5",
    desc: "price = 5. min_price stays 1 (5 > 1). Candidate profit = 5 − 1 = 4. max_profit = max(0, 4) = 4 — new best profit! Buying at day 1 (price 1) and selling today (price 5) yields a profit of 4. Day 2 becomes the best sell candidate.",
    cur_idx: 2, min_price: 1, max_profit: 4, buy_idx: 1, sell_idx: 2,
    done: false,
    calc: { price: 5, min_p: 1, profit: 4, updated_min: false, updated_profit: true, max_p: 4 },
    codeHL: [3, 4, 5],
  },
  {
    title: "Day 3 — price = 3",
    desc: "price = 3. min_price stays 1 (3 > 1). Candidate profit = 3 − 1 = 2. max_profit = max(4, 2) = 4 (unchanged — 2 < 4). Today's price yields a worse profit than day 2. Best trade remains: buy day 1 (price 1), sell day 2 (price 5) for profit 4.",
    cur_idx: 3, min_price: 1, max_profit: 4, buy_idx: 1, sell_idx: 2,
    done: false,
    calc: { price: 3, min_p: 1, profit: 2, updated_min: false, updated_profit: false, max_p: 4 },
    codeHL: [3, 4, 5],
  },
  {
    title: "Day 4 — price = 6",
    desc: "price = 6. min_price stays 1 (6 > 1). Candidate profit = 6 − 1 = 5. max_profit = max(4, 5) = 5 — new best profit! Buying at day 1 (price 1) and selling today (price 6) yields profit 5. Day 4 becomes the new best sell day.",
    cur_idx: 4, min_price: 1, max_profit: 5, buy_idx: 1, sell_idx: 4,
    done: false,
    calc: { price: 6, min_p: 1, profit: 5, updated_min: false, updated_profit: true, max_p: 5 },
    codeHL: [3, 4, 5],
  },
  {
    title: "Day 5 — price = 4",
    desc: "price = 4. min_price stays 1 (4 > 1). Candidate profit = 4 − 1 = 3. max_profit = max(5, 3) = 5 (unchanged). Today's price yields less profit than day 4. The best trade is finalized: buy day 1 at price 1, sell day 4 at price 6 for profit 5.",
    cur_idx: 5, min_price: 1, max_profit: 5, buy_idx: 1, sell_idx: 4,
    done: false,
    calc: { price: 4, min_p: 1, profit: 3, updated_min: false, updated_profit: false, max_p: 5 },
    codeHL: [3, 4, 5],
  },
  {
    title: "Result: Max Profit = 5 ✓",
    desc: "Loop ends — all 6 days visited. Return max_profit = 5. Optimal trade: buy at day 1 (price 1), sell at day 4 (price 6), profit = 5. The greedy insight: always track the cheapest price seen so far, and check if selling today beats the current best profit. Only one O(n) pass needed.",
    cur_idx: -1, min_price: 1, max_profit: 5, buy_idx: 1, sell_idx: 4,
    done: true, calc: null,
    codeHL: [3, 6],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function PriceBar({ cur_idx, buy_idx, sell_idx, done }) {
  return (
    <div style={{ overflowX: 'auto', padding: '20px 16px 8px' }}>
      <div style={{
        display: 'flex', gap: 8,
        justifyContent: 'center',
        minWidth: 'max-content', margin: '0 auto',
      }}>
        {PRICES.map((price, i) => {
          const isCurrent = !done && i === cur_idx;
          const isBuy     = buy_idx >= 0 && i === buy_idx;
          const isSell    = sell_idx >= 0 && i === sell_idx;
          const isPast    = !done && cur_idx >= 0 && i < cur_idx && !isBuy && !isSell;
          const isFuture  = !done && cur_idx >= 0 && i > cur_idx;

          // ── box styling ──────────────────────────
          let boxBorder, boxBg, boxText, glowStr;

          if (done && isBuy) {
            boxBorder = C.green;
            boxBg     = C.greenGlow;
            boxText   = C.green;
            glowStr   = `0 0 18px ${C.greenGlow}`;
          } else if (done && isSell) {
            boxBorder = C.orange;
            boxBg     = C.orangeGlow;
            boxText   = C.orange;
            glowStr   = `0 0 18px ${C.orangeGlow}`;
          } else if (done) {
            boxBorder = C.border + '55';
            boxBg     = C.surface2;
            boxText   = C.dim;
            glowStr   = 'none';
          } else if (isBuy) {
            // buy takes priority over "just current" for coloring
            boxBorder = C.green;
            boxBg     = C.greenGlow;
            boxText   = C.green;
            glowStr   = `0 0 12px ${C.greenGlow}`;
          } else if (isSell) {
            boxBorder = C.orange;
            boxBg     = C.orangeGlow;
            boxText   = C.orange;
            glowStr   = `0 0 12px ${C.orangeGlow}`;
          } else if (isCurrent) {
            boxBorder = C.purple;
            boxBg     = C.purpleGlow;
            boxText   = C.purple;
            glowStr   = `0 0 14px ${C.purpleGlow}`;
          } else if (isPast) {
            boxBorder = C.border + '55';
            boxBg     = 'rgba(74,222,128,0.05)';
            boxText   = C.dim;
            glowStr   = 'none';
          } else if (isFuture) {
            boxBorder = C.border + '30';
            boxBg     = 'transparent';
            boxText   = C.dim + '60';
            glowStr   = 'none';
          } else {
            // initial neutral
            boxBorder = C.border;
            boxBg     = C.surface2;
            boxText   = C.text;
            glowStr   = 'none';
          }

          // color of the "cur" label above
          const curLabelColor = isBuy ? C.green : isSell ? C.orange : C.purple;

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

              {/* "cur" label above the box (like "mid" in FirstBadVersion) */}
              <div style={{
                height: 18, marginBottom: 6,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              }}>
                {isCurrent && (
                  <span style={{
                    fontFamily: mono, fontSize: 9, fontWeight: 700,
                    color: curLabelColor, letterSpacing: 0.5,
                  }}>cur</span>
                )}
              </div>

              {/* Price box */}
              <div style={{
                width: 46, height: 46,
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
                {price}

                {/* Badge icons */}
                {isPast && (
                  <span style={{
                    position: 'absolute', top: -9, right: -3,
                    fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.dim,
                  }}>✓</span>
                )}
                {done && isBuy && (
                  <span style={{
                    position: 'absolute', top: -10, right: -10,
                    fontFamily: mono, fontSize: 7, fontWeight: 700, color: C.green,
                    whiteSpace: 'nowrap',
                  }}>BUY!</span>
                )}
                {done && isSell && (
                  <span style={{
                    position: 'absolute', top: -10, right: -10,
                    fontFamily: mono, fontSize: 7, fontWeight: 700, color: C.orange,
                    whiteSpace: 'nowrap',
                  }}>SELL!</span>
                )}
              </div>

              {/* Pointer labels below */}
              <div style={{
                height: 38, marginTop: 6,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2,
              }}>
                {isBuy && (
                  <>
                    <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.green }}>▲</span>
                    <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color: C.green, letterSpacing: 0.5 }}>buy</span>
                  </>
                )}
                {isSell && (
                  <>
                    <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.orange }}>▲</span>
                    <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color: C.orange, letterSpacing: 0.5 }}>sell</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatePanel({ cur_idx, min_price, max_profit, done, calc }) {
  const currentPrice = cur_idx >= 0 ? PRICES[cur_idx] : null;

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

        {/* current price */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', borderRadius: 6,
          background: currentPrice !== null ? C.purpleGlow : C.surface2,
          border: `1px solid ${currentPrice !== null ? C.purple + '55' : C.border}`,
          transition: 'all 0.4s',
        }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>price</span>
          <span style={{
            fontFamily: mono, fontSize: 14, fontWeight: 700,
            color: currentPrice !== null ? C.purple : C.dim,
          }}>{currentPrice !== null ? currentPrice : '—'}</span>
        </div>

        {/* min_price */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', borderRadius: 6,
          background: min_price !== null ? C.greenGlow : C.surface2,
          border: `1px solid ${min_price !== null ? C.green + '55' : C.border}`,
          transition: 'all 0.4s',
        }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>min_price</span>
          <span style={{
            fontFamily: mono, fontSize: 14, fontWeight: 700,
            color: min_price !== null ? C.green : C.dim,
          }}>{min_price !== null ? min_price : '∞'}</span>
        </div>

        {/* max_profit */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', borderRadius: 6,
          background: max_profit > 0 ? C.orangeGlow : C.surface2,
          border: `1px solid ${max_profit > 0 ? C.orange + '55' : C.border}`,
          transition: 'all 0.4s',
        }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>max_profit</span>
          <span style={{
            fontFamily: mono, fontSize: 14, fontWeight: 700,
            color: max_profit > 0 ? C.orange : C.dim,
          }}>{max_profit}</span>
        </div>

        {/* Calculation card */}
        {calc !== null && (
          <div style={{
            padding: '10px 10px', borderRadius: 6,
            background: calc.updated_profit ? C.orangeGlow : calc.updated_min ? C.greenGlow : C.surface2,
            border: `1px solid ${calc.updated_profit ? C.orange + '44' : calc.updated_min ? C.green + '44' : C.border}`,
            marginTop: 4, transition: 'all 0.4s',
          }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginBottom: 4, letterSpacing: 0.5 }}>
              profit = {calc.price} − {calc.min_p}
            </div>
            <div style={{
              fontFamily: mono, fontSize: 14, fontWeight: 700,
              color: calc.updated_profit ? C.orange : calc.profit > 0 ? C.text : C.dim,
            }}>
              → {calc.profit}
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginTop: 5 }}>
              {calc.updated_min
                ? `∴ min_price → ${calc.min_p}`
                : calc.updated_profit
                  ? `∴ max_profit → ${calc.profit}`
                  : `∴ no update (max stays ${calc.max_p})`
              }
            </div>
          </div>
        )}

        {/* Done badge */}
        {done && (
          <div style={{
            padding: '10px 10px', borderRadius: 6,
            background: C.greenGlow,
            border: `1px solid ${C.green}44`,
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.green }}>
              return 5 ✓
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 3, letterSpacing: 0.5 }}>
              MAX PROFIT
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
      }}>Python Code — Greedy / Single Pass</div>

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

  const LEGEND = [
    { color: C.purple, label: 'current price' },
    { color: C.green,  label: 'best buy (min price)' },
    { color: C.orange, label: 'best sell day' },
    { color: C.dim,    label: 'visited' },
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
          }}>Best Time to Buy and Sell Stock</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            prices = [7, 1, 5, 3, 6, 4] &nbsp;&middot;&nbsp; Greedy / Single Pass &nbsp;&middot;&nbsp; Use &larr; &rarr; keys or buttons
          </p>
        </div>

        {/* Step title + counter */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 14,
        }}>
          <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.text }}>
            {s.title}
          </div>
          <div style={{
            fontFamily: mono, fontSize: 11, color: C.dim,
            background: C.surface, padding: '3px 10px', borderRadius: 6,
          }}>Step {step + 1} / {total}</div>
        </div>

        {/* Main: Price Bar | State Panel */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'stretch' }}>

          {/* Price bar panel */}
          <div style={{
            flex: '1 1 auto',
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
              fontFamily: mono, fontSize: 10, color: C.dim,
              letterSpacing: 2, textTransform: 'uppercase',
            }}>Prices [7, 1, 5, 3, 6, 4]</div>

            <PriceBar
              cur_idx={s.cur_idx}
              buy_idx={s.buy_idx}
              sell_idx={s.sell_idx}
              done={s.done}
            />

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

          {/* State panel */}
          <div style={{ width: 210, flexShrink: 0 }}>
            <StatePanel
              cur_idx={s.cur_idx}
              min_price={s.min_price}
              max_profit={s.max_profit}
              done={s.done}
              calc={s.calc}
            />
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
