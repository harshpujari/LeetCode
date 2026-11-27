import { useState, useEffect } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Theme
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const C = {
  bg:         '#0a0e17',
  surface:    '#111827',
  surface2:   '#1a2340',
  border:     '#2a3555',
  text:       '#e2e8f0',
  dim:        '#64748b',
  accent:     '#38bdf8',
  accentGlow: 'rgba(56,189,248,0.15)',
  green:      '#4ade80',
  greenGlow:  'rgba(74,222,128,0.15)',
  orange:     '#fb923c',
  orangeGlow: 'rgba(251,146,60,0.15)',
  red:        '#f87171',
  redGlow:    'rgba(248,113,113,0.15)',
  purple:     '#a78bfa',
  purpleGlow: 'rgba(167,139,250,0.15)',
  nullC:      '#475569',
};

const mono = "'Menlo','Monaco','Cascadia Code','Consolas','JetBrains Mono',monospace";
const sans = "system-ui,-apple-system,'Segoe UI',sans-serif";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Problem Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STR = ['t', 'm', 'm', 'z', 'u', 'x', 't'];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Code Lines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CODE = [
  { t: 'def lengthOfLongestSubstring(self, s: str) -> int:', ind: 0 },
  { t: 'char_index = {}', ind: 1 },
  { t: 'max_len = left = 0', ind: 1 },
  { t: '', ind: 0 },
  { t: 'for right, char in enumerate(s):', ind: 1 },
  { t: 'if char in char_index and char_index[char] >= left:', ind: 2 },
  { t: 'left = char_index[char] + 1', ind: 3 },
  { t: 'char_index[char] = right', ind: 2 },
  { t: 'max_len = max(max_len, right - left + 1)', ind: 2 },
  { t: '', ind: 0 },
  { t: 'return max_len', ind: 1 },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Steps
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [
  {
    title: "Initial Input",
    desc: 'Given s = "tmmzuxt". Goal: find the length of the longest substring with no repeating characters. We will slide a window [left, right] across the string, tracking each character\'s last-seen index in a hash map. This input was chosen because it exercises BOTH tricky cases: a duplicate inside the window AND a stale duplicate that lives before the window.',
    left: null, right: null, char: null,
    charIndex: {}, maxLen: 0,
    calc: null, done: false,
    codeHL: [],
  },
  {
    title: "Initialize Variables",
    desc: "char_index = {} (empty map), left = 0, max_len = 0. The window [left, right] starts empty. char_index will store the most recent index at which each character was seen.",
    left: 0, right: null, char: null,
    charIndex: {}, maxLen: 0,
    calc: null, done: false,
    codeHL: [1, 2],
  },
  {
    title: "right = 0 · char = 't' · NEW",
    desc: "Enter loop. char = 't'. Check: 't' not in char_index → skip the shrink branch. Record char_index['t'] = 0. Window size = 0 − 0 + 1 = 1, so max_len becomes 1. Remember this index 0 for 't' — it will become the 'stale' entry that matters at the very end.",
    left: 0, right: 0, char: 't',
    charIndex: { t: 0 }, maxLen: 1,
    calc: { label: "'t' in char_index?", result: 'NO', resultColor: C.green, conseq: 'just record & update max' },
    done: false,
    codeHL: [4, 5, 7, 8],
  },
  {
    title: "right = 1 · char = 'm' · NEW",
    desc: "char = 'm'. 'm' not in char_index → skip shrink. Record char_index['m'] = 1. Window size = 1 − 0 + 1 = 2, so max_len becomes 2. Window is currently \"tm\".",
    left: 0, right: 1, char: 'm',
    charIndex: { t: 0, m: 1 }, maxLen: 2,
    calc: { label: "'m' in char_index?", result: 'NO', resultColor: C.green, conseq: 'just record & update max' },
    done: false,
    codeHL: [4, 5, 7, 8],
  },
  {
    title: "right = 2 · char = 'm' · REPEAT",
    desc: "char = 'm'. 'm' IS in char_index at index 1. Is 1 ≥ left (0)? YES — the duplicate sits inside the current window. Shrink: left = 1 + 1 = 2. The window now restarts immediately after the previous 'm', dropping the leading \"tm\".",
    left: 2, right: 2, char: 'm',
    charIndex: { t: 0, m: 1 }, maxLen: 2,
    calc: { label: "char_index['m']=1 ≥ left=0 ?", result: 'YES · shrink', resultColor: C.orange, conseq: 'left = 1 + 1 = 2' },
    done: false,
    codeHL: [4, 5, 6],
  },
  {
    title: "right = 2 · record & update",
    desc: "Update char_index['m'] = 2 (overwriting the old value 1). Window size = 2 − 2 + 1 = 1. max_len stays at 2 since 1 < 2. Notice that char_index['t'] = 0 is still lingering even though 't' is no longer inside the window — this is exactly the stale entry we'll meet again later.",
    left: 2, right: 2, char: 'm',
    charIndex: { t: 0, m: 2 }, maxLen: 2,
    calc: null, done: false,
    codeHL: [7, 8],
  },
  {
    title: "right = 3 · char = 'z' · NEW",
    desc: "char = 'z'. 'z' not in char_index → skip shrink. Record char_index['z'] = 3. Window size = 3 − 2 + 1 = 2. max_len stays at 2. Window is now \"mz\".",
    left: 2, right: 3, char: 'z',
    charIndex: { t: 0, m: 2, z: 3 }, maxLen: 2,
    calc: { label: "'z' in char_index?", result: 'NO', resultColor: C.green, conseq: 'just record & update max' },
    done: false,
    codeHL: [4, 5, 7, 8],
  },
  {
    title: "right = 4 · char = 'u' · NEW",
    desc: "char = 'u'. 'u' not in char_index → skip shrink. Record char_index['u'] = 4. Window size = 4 − 2 + 1 = 3, so max_len becomes 3. Window is now \"mzu\".",
    left: 2, right: 4, char: 'u',
    charIndex: { t: 0, m: 2, z: 3, u: 4 }, maxLen: 3,
    calc: { label: "'u' in char_index?", result: 'NO', resultColor: C.green, conseq: 'just record & update max' },
    done: false,
    codeHL: [4, 5, 7, 8],
  },
  {
    title: "right = 5 · char = 'x' · NEW",
    desc: "char = 'x'. 'x' not in char_index → skip shrink. Record char_index['x'] = 5. Window size = 5 − 2 + 1 = 4, so max_len becomes 4. Window is now \"mzux\".",
    left: 2, right: 5, char: 'x',
    charIndex: { t: 0, m: 2, z: 3, u: 4, x: 5 }, maxLen: 4,
    calc: { label: "'x' in char_index?", result: 'NO', resultColor: C.green, conseq: 'just record & update max' },
    done: false,
    codeHL: [4, 5, 7, 8],
  },
  {
    title: "right = 6 · char = 't' · STALE",
    desc: "char = 't'. 't' IS in char_index at index 0. Is 0 ≥ left (2)? NO — that index is BEFORE the window, a stale leftover from the very first 't' we saw way back at step 3. Do NOT move left. This is the subtle case the '≥ left' guard exists for: a naïve implementation that forgot this guard would incorrectly jump left to 1 and miss the optimal answer.",
    left: 2, right: 6, char: 't',
    charIndex: { t: 0, m: 2, z: 3, u: 4, x: 5 }, maxLen: 4,
    calc: { label: "char_index['t']=0 ≥ left=2 ?", result: 'NO · stale', resultColor: C.red, conseq: 'keep left unchanged' },
    done: false,
    codeHL: [4, 5],
  },
  {
    title: "right = 6 · record & update",
    desc: "Update char_index['t'] = 6 (overwriting the stale 0). Window size = 6 − 2 + 1 = 5, so max_len becomes 5. Window is now \"mzuxt\". The loop ends — all characters processed.",
    left: 2, right: 6, char: 't',
    charIndex: { t: 6, m: 2, z: 3, u: 4, x: 5 }, maxLen: 5,
    calc: null, done: false,
    codeHL: [7, 8],
  },
  {
    title: "Return max_len ✓",
    desc: 'return max_len → 5. The longest substring without repeating characters is "mzuxt" (indices 2..6) with length 5. Note how a buggy "always shrink on duplicate" version would have returned 4 instead, missing the final character. Time O(n), space O(min(n, alphabet size)).',
    left: 2, right: 6, char: null,
    charIndex: { t: 6, m: 2, z: 3, u: 4, x: 5 }, maxLen: 5,
    calc: null, done: true,
    codeHL: [10],
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Layout
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CW = 58, CH = 58, GAP = 14;
const cellX = (i) => 20 + i * (CW + GAP);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CharBox({ ch, idx, s }) {
  const inWindow = s.left !== null && s.right !== null && idx >= s.left && idx <= s.right;
  const isCurrent = s.right === idx;
  const isLeft = s.left === idx;
  const wasSeen = Object.prototype.hasOwnProperty.call(s.charIndex, ch);

  let border = C.border + '80';
  let bg = C.surface2;
  let textColor = C.dim;
  let glow = 'none';

  if (s.done) {
    border = C.border + '80';
    bg = C.surface2;
    textColor = C.text;
  } else if (isCurrent) {
    border = C.purple;
    bg = C.purpleGlow;
    textColor = C.purple;
    glow = `0 0 12px ${C.purpleGlow}`;
  } else if (inWindow) {
    border = C.accent + '77';
    bg = C.accentGlow;
    textColor = C.text;
  } else if (wasSeen) {
    border = C.border;
    bg = C.surface2;
    textColor = C.dim;
  }

  return (
    <div style={{
      position: 'absolute', left: cellX(idx), top: 48,
      width: CW, height: CH,
      border: `2px solid ${border}`,
      borderRadius: 9,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: mono, fontSize: 22, fontWeight: 700,
      color: textColor,
      transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
      filter: glow !== 'none' ? `drop-shadow(${glow})` : 'none',
    }}>
      {ch}
      <div style={{
        position: 'absolute', top: -18, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: mono, fontSize: 10, fontWeight: 700,
        color: isCurrent ? C.purple : C.dim,
        letterSpacing: 0.5,
        transition: 'color 0.3s',
      }}>{idx}</div>
    </div>
  );
}

function Pointer({ idx, label, color, combined }) {
  if (idx === null) return null;
  const x = cellX(idx) + CW / 2;
  return (
    <div style={{
      position: 'absolute', left: x, top: 48 + CH + 10,
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
      zIndex: 5,
    }}>
      <span style={{
        fontFamily: mono, fontSize: 11, fontWeight: 700, color,
      }}>▲</span>
      <span style={{
        fontFamily: mono, fontSize: 9, fontWeight: 700, color,
        letterSpacing: 0.5, marginTop: 1,
        background: color + '18', padding: '2px 7px', borderRadius: 4,
        whiteSpace: 'nowrap',
      }}>{label}</span>
    </div>
  );
}

function WindowHighlight({ s }) {
  if (s.left === null || s.right === null) return null;
  const x = cellX(s.left) - 5;
  const w = cellX(s.right) + CW - cellX(s.left) + 10;
  return (
    <div style={{
      position: 'absolute',
      left: x, top: 40,
      width: w, height: CH + 16,
      border: `2px solid ${s.done ? C.green : C.accent}60`,
      borderRadius: 12,
      background: `${s.done ? C.greenGlow : C.accentGlow}`,
      opacity: 0.45,
      transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
      pointerEvents: 'none',
      zIndex: 0,
    }} />
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
              }}>{line.t ? i + 1 : ''}</span>
              <span style={{
                fontFamily: mono, fontSize: 12.5,
                color: hl ? C.text : (line.t ? C.dim : 'transparent'),
                whiteSpace: 'pre', transition: 'color 0.3s',
              }}>{'  '.repeat(line.ind)}{line.t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StateRow({ label, value, color, active }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 10px', borderRadius: 6,
      background: active ? color + '26' : C.surface2,
      border: `1px solid ${active ? color + '55' : C.border}`,
      transition: 'all 0.4s',
    }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>{label}</span>
      <span style={{
        fontFamily: mono, fontSize: 14, fontWeight: 700,
        color: active ? color : C.dim,
      }}>{value}</span>
    </div>
  );
}

function StatePanel({ s }) {
  const entries = Object.entries(s.charIndex);
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: 'hidden',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{
        padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        fontFamily: mono, fontSize: 10, color: C.dim, letterSpacing: 2,
        textTransform: 'uppercase',
      }}>Algo State</div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <StateRow label="left"   value={s.left === null ? '—' : s.left}   color={C.accent} active={s.left !== null} />
        <StateRow label="right"  value={s.right === null ? '—' : s.right} color={C.orange} active={s.right !== null} />
        <StateRow label="char"   value={s.char === null ? '—' : `'${s.char}'`} color={C.purple} active={s.char !== null} />
        <StateRow label="max_len" value={s.maxLen} color={C.green} active={s.maxLen > 0} />

        {/* char_index dict */}
        <div style={{
          marginTop: 2,
          padding: '8px 10px', borderRadius: 6,
          background: C.surface2,
          border: `1px solid ${C.border}`,
        }}>
          <div style={{
            fontFamily: mono, fontSize: 9, color: C.dim,
            letterSpacing: 0.5, marginBottom: 6,
          }}>CHAR_INDEX</div>
          {entries.length === 0 ? (
            <div style={{ fontFamily: mono, fontSize: 12, color: C.dim, fontStyle: 'italic' }}>
              {'{ }'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {entries.map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontFamily: mono, fontSize: 12,
                }}>
                  <span style={{ color: C.purple, fontWeight: 700 }}>'{k}'</span>
                  <span style={{ color: C.dim }}>→</span>
                  <span style={{ color: C.orange, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculation card */}
        {s.calc && (
          <div style={{
            padding: '10px 10px', borderRadius: 6, marginTop: 4,
            background: s.calc.resultColor === C.green ? C.greenGlow
                     : s.calc.resultColor === C.orange ? C.orangeGlow
                     : C.redGlow,
            border: `1px solid ${s.calc.resultColor}44`,
            transition: 'all 0.4s',
          }}>
            <div style={{
              fontFamily: mono, fontSize: 9, color: C.dim,
              letterSpacing: 0.5, marginBottom: 4,
            }}>{s.calc.label}</div>
            <div style={{
              fontFamily: mono, fontSize: 14, fontWeight: 700,
              color: s.calc.resultColor,
            }}>{s.calc.result}</div>
            {s.calc.conseq && (
              <div style={{
                fontFamily: mono, fontSize: 10, color: C.dim, marginTop: 5,
              }}>{s.calc.conseq}</div>
            )}
          </div>
        )}

        {/* Done badge */}
        {s.done && (
          <div style={{
            padding: '10px 10px', borderRadius: 6,
            background: C.greenGlow, border: `1px solid ${C.green}44`,
            textAlign: 'center', marginTop: 4,
          }}>
            <div style={{
              fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.green,
            }}>return {s.maxLen} ✓</div>
            <div style={{
              fontFamily: mono, fontSize: 9, color: C.dim,
              marginTop: 3, letterSpacing: 0.5,
            }}>LONGEST SUBSTRING LENGTH</div>
          </div>
        )}
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
  }, [total]);

  const sameIdx = s.left !== null && s.right !== null && s.left === s.right;
  const stripWidth = cellX(STR.length - 1) + CW + 20;

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
        input[type=range] {
          -webkit-appearance: none; width: 100%; height: 6px;
          background: ${C.border}; border-radius: 3px; outline: none;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
          background: ${C.accent}; cursor: pointer; box-shadow: 0 0 8px ${C.accentGlow};
        }
        input[type=range]::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: ${C.accent}; cursor: pointer;
          border: none; box-shadow: 0 0 8px ${C.accentGlow};
        }
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{
            fontFamily: mono, fontSize: 17, fontWeight: 700,
            color: C.accent, letterSpacing: -0.3, marginBottom: 4,
          }}>Longest Substring Without Repeating Characters</h1>
          <p style={{ fontSize: 13, color: C.dim }}>
            s = "tmmzuxt" &nbsp;·&nbsp; Sliding Window + Hash Map &nbsp;·&nbsp; Use ← → keys or buttons
          </p>
        </div>

        {/* ── Step Title ── */}
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

        {/* ── Visualization + State panel row ── */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'stretch', marginBottom: 16,
        }}>
          {/* Visualization */}
          <div style={{
            flex: '1 1 auto',
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
              fontFamily: mono, fontSize: 10, color: C.dim, letterSpacing: 2,
              textTransform: 'uppercase',
            }}>String s &nbsp;&nbsp;·&nbsp;&nbsp; Window [left, right]</div>

            <div style={{ overflowX: 'auto', flex: 1 }}>
              <div style={{
                position: 'relative',
                width: stripWidth, minWidth: '100%',
                height: 160, margin: '0 auto',
              }}>
                <WindowHighlight s={s} />
                {STR.map((ch, i) => (
                  <CharBox key={i} ch={ch} idx={i} s={s} />
                ))}
                {sameIdx ? (
                  <div style={{
                    position: 'absolute', left: cellX(s.left) + CW / 2, top: 48 + CH + 10,
                    transform: 'translateX(-50%)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                    zIndex: 5,
                  }}>
                    <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.dim }}>▲</span>
                    <div style={{ display: 'flex', gap: 4, marginTop: 1 }}>
                      <span style={{
                        fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.accent,
                        background: C.accent + '18', padding: '2px 7px', borderRadius: 4,
                        letterSpacing: 0.5,
                      }}>left</span>
                      <span style={{
                        fontFamily: mono, fontSize: 9, fontWeight: 700, color: C.orange,
                        background: C.orange + '18', padding: '2px 7px', borderRadius: 4,
                        letterSpacing: 0.5,
                      }}>right</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Pointer idx={s.left}  label="left"  color={C.accent} />
                    <Pointer idx={s.right} label="right" color={C.orange} />
                  </>
                )}
              </div>
            </div>

            {/* Legend */}
            <div style={{
              display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
              padding: '6px 12px 16px', fontFamily: mono, fontSize: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: C.accent }} />
                <span style={{ color: C.dim }}>window</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: C.purple }} />
                <span style={{ color: C.dim }}>current char</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: C.orange }} />
                <span style={{ color: C.dim }}>right pointer</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: C.green }} />
                <span style={{ color: C.dim }}>result</span>
              </div>
            </div>
          </div>

          {/* State panel */}
          <div style={{ width: 210, flexShrink: 0 }}>
            <StatePanel s={s} />
          </div>
        </div>

        {/* ── Description ── */}
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

        {/* ── Code Panel ── */}
        <div style={{ marginBottom: 20 }}>
          <CodePanel highlighted={s.codeHL} />
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
                border: `1px solid ${C.border}`,
                cursor: step === 0 ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >⏮ Reset</button>
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
            >← Prev</button>
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
            >Next →</button>
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
