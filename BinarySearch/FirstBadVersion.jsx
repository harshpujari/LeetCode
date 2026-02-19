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
// Problem Setup
//   n = 10  |  first bad version = 6
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const N = 10;
const FIRST_BAD = 6;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'def firstBadVersion(n: int) -> int:', ind: 0 },
  { t: 'left = 1', ind: 1 },
  { t: 'right = n', ind: 1 },
  { t: 'while left < right:', ind: 1 },
  { t: 'mid = left + (right - left) // 2', ind: 2 },
  { t: 'if isBadVersion(mid):', ind: 2 },
  { t: 'right = mid   # mid might be the first bad', ind: 3 },
  { t: 'else:', ind: 2 },
  { t: 'left = mid + 1', ind: 3 },
  { t: 'return left', ind: 1 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps  (n=10, firstBad=6)
//
// Trace:
//   left=1,  right=10 → mid=5  → isBad(5)=F → left=6
//   left=6,  right=10 → mid=8  → isBad(8)=T → right=8
//   left=6,  right=8  → mid=7  → isBad(7)=T → right=7
//   left=6,  right=7  → mid=6  → isBad(6)=T → right=6
//   left=6,  right=6  → exit loop → return 6
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Setup",
    desc: "n = 10 versions total. Somewhere starting from version 6, every subsequent version is bad. We can only probe via isBadVersion(). Binary search finds the first bad version in O(log n) calls instead of O(n) — just 4 API calls here versus up to 6 for linear scan.",
    left: 1, right: 10, mid: null,
    isBadResult: null,
    done: false,
    codeHL: [0, 1, 2],
  },
  {
    title: "Iteration 1 — isBadVersion(5) → False",
    desc: "left=1, right=10. mid = 1 + (10−1)//2 = 5. Call isBadVersion(5). Version 5 is GOOD (5 < 6), so it returns False. The first bad version must lie strictly to the RIGHT of mid — set left = mid + 1 = 6. Versions 1–5 are now confirmed good.",
    left: 1, right: 10, mid: 5,
    isBadResult: false,
    done: false,
    codeHL: [3, 4, 5, 7, 8],
  },
  {
    title: "Iteration 2 — isBadVersion(8) → True",
    desc: "left=6, right=10. mid = 6 + (10−6)//2 = 8. Call isBadVersion(8). Version 8 is BAD (8 ≥ 6), so it returns True. The first bad could be 8 or anything earlier — set right = mid = 8. We keep mid as a valid candidate. Versions 9–10 are now eliminated.",
    left: 6, right: 10, mid: 8,
    isBadResult: true,
    done: false,
    codeHL: [3, 4, 5, 6],
  },
  {
    title: "Iteration 3 — isBadVersion(7) → True",
    desc: "left=6, right=8. mid = 6 + (8−6)//2 = 7. Call isBadVersion(7). Version 7 is BAD (7 ≥ 6), so it returns True. Set right = mid = 7. The search range narrows to [6, 7]. Version 8 is eliminated — it's bad but not the first.",
    left: 6, right: 8, mid: 7,
    isBadResult: true,
    done: false,
    codeHL: [3, 4, 5, 6],
  },
  {
    title: "Iteration 4 — isBadVersion(6) → True",
    desc: "left=6, right=7. mid = 6 + (7−6)//2 = 6. Call isBadVersion(6). Version 6 IS the first bad — returns True. Set right = mid = 6. The range collapses to [6, 6]. Version 7 is eliminated.",
    left: 6, right: 7, mid: 6,
    isBadResult: true,
    done: false,
    codeHL: [3, 4, 5, 6],
  },
  {
    title: "Result: First Bad Version = 6 ✓",
    desc: "left=6, right=6. The condition left < right → 6 < 6 = False. Loop exits. Return left = 6. This is the first bad version: everything to its left (1–5) is good, and it itself (and everything after) is bad. Only 4 isBadVersion() calls were needed.",
    left: 6, right: 6, mid: null,
    isBadResult: null,
    done: true,
    codeHL: [3, 9],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function VersionBar({ left, right, mid, done }) {
  return (
    <div style={{ overflowX: 'auto', padding: '20px 16px 8px' }}>
      <div style={{
        display: 'flex', gap: 8,
        justifyContent: 'center',
        minWidth: 'max-content', margin: '0 auto',
      }}>
        {Array.from({ length: N }, (_, i) => {
          const v = i + 1;
          const isGood    = v < left;           // confirmed good — squeezed out left
          const isBadElim = v > right;           // confirmed bad — squeezed out right
          const isInRange = v >= left && v <= right;
          const isMidV    = v === mid;
          const isLeft    = v === left;
          const isRight   = v === right;
          const isAnswer  = done && v === FIRST_BAD;

          // ── box styling ──────────────────────────
          let boxBorder, boxBg, boxText, glowStr;

          if (isAnswer) {
            boxBorder = C.green;
            boxBg     = C.greenGlow;
            boxText   = C.green;
            glowStr   = `0 0 18px ${C.greenGlow}`;
          } else if (isMidV) {
            boxBorder = C.purple;
            boxBg     = C.purpleGlow;
            boxText   = C.purple;
            glowStr   = `0 0 14px ${C.purpleGlow}`;
          } else if (isGood) {
            boxBorder = C.green + '55';
            boxBg     = 'rgba(74,222,128,0.07)';
            boxText   = C.green + 'cc';
            glowStr   = 'none';
          } else if (isBadElim) {
            boxBorder = C.red + '55';
            boxBg     = 'rgba(248,113,113,0.07)';
            boxText   = C.red + 'bb';
            glowStr   = 'none';
          } else if (isInRange) {
            boxBorder = C.border;
            boxBg     = C.surface2;
            boxText   = C.text;
            glowStr   = 'none';
          } else {
            boxBorder = C.border + '30';
            boxBg     = 'transparent';
            boxText   = C.dim + '60';
            glowStr   = 'none';
          }

          return (
            <div key={v} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

              {/* "mid" label above the box */}
              <div style={{
                height: 18, marginBottom: 6,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              }}>
                {isMidV && (
                  <span style={{
                    fontFamily: mono, fontSize: 9, fontWeight: 700,
                    color: C.purple, letterSpacing: 0.5,
                  }}>mid</span>
                )}
              </div>

              {/* Version box */}
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
                {v}

                {/* Badge icons */}
                {isGood && (
                  <span style={{
                    position: 'absolute', top: -9, right: -3,
                    fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.green,
                  }}>✓</span>
                )}
                {isBadElim && !done && (
                  <span style={{
                    position: 'absolute', top: -9, right: -3,
                    fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.red + 'bb',
                  }}>✗</span>
                )}
                {isAnswer && (
                  <span style={{
                    position: 'absolute', top: -10, right: -6,
                    fontFamily: mono, fontSize: 8, fontWeight: 700, color: C.green,
                    whiteSpace: 'nowrap',
                  }}>1st!</span>
                )}
              </div>

              {/* Pointer labels below */}
              <div style={{
                height: 38, marginTop: 6,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2,
              }}>
                {isLeft && isRight ? (
                  <>
                    <span style={{
                      fontFamily: mono, fontSize: 8, fontWeight: 700,
                      color: C.green, letterSpacing: 0.5,
                    }}>L = R</span>
                    <span style={{
                      fontFamily: mono, fontSize: 8, fontWeight: 700, color: C.green,
                    }}>▲</span>
                  </>
                ) : (
                  <>
                    {isLeft && (
                      <>
                        <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.accent }}>▲</span>
                        <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color: C.accent, letterSpacing: 0.5 }}>left</span>
                      </>
                    )}
                    {isRight && (
                      <>
                        <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.orange }}>▲</span>
                        <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color: C.orange, letterSpacing: 0.5 }}>right</span>
                      </>
                    )}
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

function StatePanel({ left, right, mid, isBadResult, done }) {
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
      }}>Search State</div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>

        {/* left */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', borderRadius: 6,
          background: C.surface2, border: `1px solid ${C.border}`,
        }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>left</span>
          <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.accent }}>{left}</span>
        </div>

        {/* right */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', borderRadius: 6,
          background: C.surface2, border: `1px solid ${C.border}`,
        }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>right</span>
          <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.orange }}>{right}</span>
        </div>

        {/* mid */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', borderRadius: 6,
          background: mid !== null ? C.purpleGlow : C.surface2,
          border: `1px solid ${mid !== null ? C.purple + '55' : C.border}`,
          transition: 'all 0.4s',
        }}>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>mid</span>
          <span style={{
            fontFamily: mono, fontSize: 14, fontWeight: 700,
            color: mid !== null ? C.purple : C.dim,
          }}>{mid !== null ? mid : '—'}</span>
        </div>

        {/* isBadVersion result card */}
        {isBadResult !== null && (
          <div style={{
            padding: '10px 10px',
            borderRadius: 6,
            background: isBadResult ? C.redGlow : C.greenGlow,
            border: `1px solid ${isBadResult ? C.red + '44' : C.green + '44'}`,
            marginTop: 4,
            transition: 'all 0.4s',
          }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginBottom: 4, letterSpacing: 0.5 }}>
              isBadVersion({mid})
            </div>
            <div style={{
              fontFamily: mono, fontSize: 14, fontWeight: 700,
              color: isBadResult ? C.red : C.green,
            }}>
              → {isBadResult ? 'True' : 'False'}
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.dim, marginTop: 5 }}>
              {isBadResult
                ? `∴ right = ${mid}`
                : `∴ left = ${mid + 1}`
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
              return {left} ✓
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 3, letterSpacing: 0.5 }}>
              FIRST BAD VERSION
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
      }}>Python Code — Binary Search</div>

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
    { color: C.accent,  label: 'left pointer' },
    { color: C.orange,  label: 'right pointer' },
    { color: C.purple,  label: 'mid (checking)' },
    { color: C.green,   label: 'confirmed good' },
    { color: C.red,     label: 'confirmed bad' },
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
          }}>First Bad Version</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            n = 10, firstBad = 6 &nbsp;&middot;&nbsp; Binary Search &nbsp;&middot;&nbsp; Use &larr; &rarr; keys or buttons
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

        {/* Main: Version Bar | State Panel */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'stretch' }}>

          {/* Version bar panel */}
          <div style={{
            flex: '1 1 auto',
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
              fontFamily: mono, fontSize: 10, color: C.dim,
              letterSpacing: 2, textTransform: 'uppercase',
            }}>Versions 1 → {N}</div>

            <VersionBar left={s.left} right={s.right} mid={s.mid} done={s.done} />

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
              left={s.left} right={s.right} mid={s.mid}
              isBadResult={s.isBadResult} done={s.done}
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
