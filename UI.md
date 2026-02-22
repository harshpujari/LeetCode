# UI Specification — LeetCode Step Visualizer
## Purpose
Each JSX file is a self-contained React step-through visualizer for one LeetCode problem.
The aesthetic is a dark terminal / IDE debugger — not a generic dashboard.
No external UI libraries. All styling is inline React style objects.

---

## File Structure (every JSX follows this exact order)

```
1. imports          — { useState, useEffect } from "react"
2. Theme object C   — all color/glow tokens
3. Font constants   — mono, sans strings
4. Problem data     — const arrays (PRICES, NODES, etc.)
5. CODE array       — code lines with indentation level
6. STEPS array      — all animation steps
7. Sub-components   — visualization-specific components
8. CodePanel        — reusable code display
9. StatePanel       — reusable variable display
10. App (default export) — root component with all layout
```

---

## Theme Object

Every file declares an identical `C` object at the top:

```js
const C = {
  bg:          '#0a0e17',               // deep navy-black root background
  surface:     '#111827',               // card / panel backgrounds (level 1)
  surface2:    '#1a2340',               // input fields, inner boxes (level 2)
  border:      '#2a3555',               // all borders
  text:        '#e2e8f0',               // primary text (bright)
  dim:         '#64748b',               // secondary / inactive text

  accent:      '#38bdf8',               // sky blue — left pointer, primary buttons, active states
  accentGlow:  'rgba(56,189,248,0.15)', // accent fill for highlighted rows / glows

  green:       '#4ade80',               // confirmed good / success / result
  greenGlow:   'rgba(74,222,128,0.15)',

  orange:      '#fb923c',               // right pointer, sell side, secondary elements
  orangeGlow:  'rgba(251,146,60,0.15)',

  red:         '#f87171',               // errors, bad states, eliminated elements
  redGlow:     'rgba(248,113,113,0.15)',

  purple:      '#a78bfa',               // mid pointer, current element being examined
  purpleGlow:  'rgba(167,139,250,0.15)',

  nullC:       '#475569',               // NULL node markers in linked-list visualizations
};
```

**Glow rule:** every color has an accompanying `{color}Glow` at `rgba(r,g,b,0.15)`.
Use the glow value as `background` fill on highlighted elements.
Use `0 0 {8–18}px {colorGlow}` as `boxShadow` or inside `filter: drop-shadow(...)`.

---

## Font Constants

```js
const mono = "'Menlo','Monaco','Cascadia Code','Consolas','JetBrains Mono',monospace";
const sans = "system-ui,-apple-system,'Segoe UI',sans-serif";
```

**Rule:** `mono` for ALL code, labels, numbers, badges, and UI chrome.
`sans` only for prose description text (`s.desc` paragraphs).

---

## Global `<style>` Block

Injected as the first child inside the root `<div>` in every App:

```js
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
```

---

## Root Layout

```js
// Outer wrapper
{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: sans, padding: '20px 12px' }

// Inner content container
{ maxWidth: 960, margin: '0 auto' }
```

---

## Header (top of every visualizer)

```js
// Wrapper
{ marginBottom: 20 }

// h1 — problem title
{ fontFamily: mono, fontSize: 17, fontWeight: 700, color: C.accent, letterSpacing: -0.3, marginBottom: 4 }

// p — subtitle (algorithm type + keyboard hint)
{ fontSize: 13, color: C.dim }
// content example: "prices = [7, 1, 5, 3, 6, 4] · Greedy / Single Pass · Use ← → keys or buttons"
```

---

## Step Title Row

Sits between the header and the main visualization panel.

```js
// Row wrapper
{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }

// Step title (s.title)
{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: C.text }

// Step counter badge  e.g. "Step 3 / 8"
{ fontFamily: mono, fontSize: 11, color: C.dim, background: C.surface, padding: '3px 10px', borderRadius: 6 }
```

---

## Data Structures

### CODE array (one entry per line of algorithm code)
```js
const CODE = [
  { t: 'the code text', ind: 0 },  // ind = indentation level (0, 1, 2, 3)
  { t: '',              ind: 0 },  // blank lines use empty string
];
```
Rendered with `'  '.repeat(line.ind)` prepended and `whiteSpace: 'pre'`.

### STEPS array (one entry per animation frame)
Each step object always contains at minimum:
```js
{
  title:   string,    // shown in step title row
  desc:    string,    // shown in description panel (prose)
  codeHL:  number[],  // array of CODE line indices to highlight
  done:    boolean,   // true only on the final result step
  // ...plus problem-specific state fields (left, right, mid, cur_idx, etc.)
}
```

---

## Panel Container (generic reusable pattern)

```js
{
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 10,          // use 12 for larger outer panels
  overflow: 'hidden',
}
```

### Panel Header (inside every panel, at the top)
```js
{
  padding: '8px 14px',
  borderBottom: `1px solid ${C.border}`,
  fontFamily: mono,
  fontSize: 10,
  color: C.dim,
  letterSpacing: 2,
  textTransform: 'uppercase',
}
```
Example labels: `"Python Code — Binary Search"`, `"Search State"`, `"Versions 1 → N"`, `"Algo State"`.

---

## Code Panel Component

```jsx
function CodePanel({ highlighted }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
      {/* Panel header */}
      <div style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}`,
        fontFamily: mono, fontSize: 10, color: C.dim, letterSpacing: 2, textTransform: 'uppercase' }}>
        Python Code — {Algorithm Name}
      </div>

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
              {/* Line number */}
              <span style={{
                fontFamily: mono, fontSize: 10, color: C.dim,
                width: 32, textAlign: 'right', marginRight: 14,
                userSelect: 'none', flexShrink: 0,
              }}>{i + 1}</span>

              {/* Code text */}
              <span style={{
                fontFamily: mono, fontSize: 13,
                color: hl ? C.text : C.dim,
                whiteSpace: 'pre',
                transition: 'color 0.3s',
              }}>{'  '.repeat(line.ind)}{line.t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Highlighted line:** `background: accentGlow`, `borderLeft: 3px solid accent`, `color: C.text`.
**Inactive line:** `background: transparent`, `borderLeft: 3px solid transparent`, `color: C.dim`.

---

## State Panel Component

Shows algorithm variable values (left/right/mid, min_price, max_profit, etc.).
Width is fixed at `210px` and placed to the right of the main visualization.

```js
// Outer
{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden',
  display: 'flex', flexDirection: 'column', height: '100%' }

// Content area
{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }
```

### Variable Row (inside StatePanel)
Each tracked variable gets a row:
```js
{
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '6px 10px', borderRadius: 6,
  background: isActive ? colorGlow : C.surface2,
  border: `1px solid ${isActive ? color + '55' : C.border}`,
  transition: 'all 0.4s',
}
// Key label
{ fontFamily: mono, fontSize: 11, color: C.dim }
// Value
{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: isActive ? color : C.dim }
```
**Color assignment for variables:** `left` / `min_price` / `prev` → `C.accent` or `C.green`.
`right` / `max_profit` / `sell` → `C.orange`. `mid` / `current` → `C.purple`.

### Calculation Card (inside StatePanel, appears mid-step)
Shows the current operation result (e.g. `isBadVersion(mid)`, `profit = price − min_price`):
```js
{
  padding: '10px 10px', borderRadius: 6, marginTop: 4,
  background: resultColor + 'Glow',
  border: `1px solid ${resultColor}44`,
  transition: 'all 0.4s',
}
// label row: fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: 0.5, marginBottom: 4
// result row: fontFamily: mono, fontSize: 14, fontWeight: 700, color: resultColor
// consequence row: fontFamily: mono, fontSize: 10, color: C.dim, marginTop: 5
```

### Done / Result Badge (inside StatePanel, last step only)
```js
{
  padding: '10px 10px', borderRadius: 6,
  background: C.greenGlow, border: `1px solid ${C.green}44`, textAlign: 'center',
}
// "return X ✓"   → fontFamily: mono, fontSize: 13, fontWeight: 700, color: C.green
// "RESULT NAME"  → fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 3, letterSpacing: 0.5
```

---

## Description Panel

Sits between visualization and code panel. Contains prose explanation (`s.desc`).

```js
{
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderLeft: `3px solid ${s.done ? C.green : C.accent}`,  // accent color changes on final step
  borderRadius: '0 10px 10px 0',                            // left edge is square; right is rounded
  padding: '14px 18px',
  marginBottom: 16,
}
// Paragraph text
{ fontSize: 13, color: C.dim, lineHeight: 1.7, fontFamily: sans }
```

---

## Visualization Panel (main data structure display)

Outer wrapper — takes up `flex: '1 1 auto'`:
```js
{ flex: '1 1 auto', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }
```
Contains: panel header → scrollable visualization area → legend.

### Visualization Element Boxes (version cells, price cells, etc.)
```js
{
  width: 46, height: 46,
  border: `2px solid ${boxBorder}`,
  borderRadius: 9,
  background: boxBg,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: mono, fontSize: 15, fontWeight: 700,
  color: boxText,
  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
  filter: glowStr !== 'none' ? `drop-shadow(${glowStr})` : 'none',
  position: 'relative',   // for badge positioning
}
```

**Box state color mapping:**
| State          | border            | background      | text           |
|----------------|-------------------|-----------------|----------------|
| answer / done  | `C.green`         | `C.greenGlow`   | `C.green`      |
| current / mid  | `C.purple`        | `C.purpleGlow`  | `C.purple`     |
| confirmed good | `C.green + '55'`  | `rgba(74,222,128,0.07)` | `C.green + 'cc'` |
| confirmed bad  | `C.red + '55'`    | `rgba(248,113,113,0.07)` | `C.red + 'bb'` |
| in range       | `C.border`        | `C.surface2`    | `C.text`       |
| future / dim   | `C.border + '30'` | `transparent`   | `C.dim + '60'` |
| buy pointer    | `C.green`         | `C.greenGlow`   | `C.green`      |
| sell pointer   | `C.orange`        | `C.orangeGlow`  | `C.orange`     |

### Pointer Labels (above/below boxes)
Label above box (e.g. `mid`, `cur`): `fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.5` in pointer color.
Label below box (e.g. `left`, `right`, `buy`, `sell`):
```js
<span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: pointerColor }}>▲</span>
<span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, color: pointerColor, letterSpacing: 0.5 }}>label</span>
```
When `left === right` (converged), combine into a single `L = R` label in `C.green`.

### Badge Icons (absolute positioned inside box, top-right)
```js
{ position: 'absolute', top: -9, right: -3, fontFamily: mono, fontSize: 9, fontWeight: 700, color: ... }
// ✓ for confirmed good, ✗ for confirmed bad, "1st!" / "BUY!" / "SELL!" for final answer
```

### Legend
Sits at the bottom of the visualization panel:
```js
// wrapper
{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
  padding: '6px 12px 16px', fontFamily: mono, fontSize: 10 }
// each item
{ display: 'flex', alignItems: 'center', gap: 5 }
// color swatch
{ width: 8, height: 8, borderRadius: 2, background: color }
// label
{ color: C.dim }
```

---

## Controls Panel

```js
// wrapper
{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }
```

### Slider
```html
<input type="range" min={0} max={total - 1} value={step}
  onChange={(e) => setStep(Number(e.target.value))} style={{ width: '100%' }} />
```
Styled via the global `<style>` block (see above). Thumb: 18px circle, `C.accent` fill with glow.

### Buttons Row
```js
{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14 }
```

Three buttons: **Reset**, **← Prev**, **Next →**

**Reset button:**
```js
{ fontFamily: mono, fontSize: 11, fontWeight: 600, padding: '8px 14px', borderRadius: 8,
  background: C.surface2, color: step === 0 ? C.dim : C.text,
  border: `1px solid ${C.border}`, cursor: step === 0 ? 'default' : 'pointer',
  transition: 'all 0.2s' }
```

**← Prev button (inactive when step === 0):**
```js
// active
{ background: C.accent + '20', color: C.accent, border: `1px solid ${C.accent + '40'}` }
// inactive
{ background: C.surface2, color: C.dim, border: `1px solid ${C.border}` }
// shared: fontFamily: mono, fontSize: 12, fontWeight: 600, padding: '8px 20px', borderRadius: 8
```

**Next → button (primary, inactive when step === total - 1):**
```js
// active  — filled accent background, DARK text (C.bg color '#0a0e17')
{ background: C.accent, color: '#0a0e17', border: `1px solid ${C.accent}` }
// inactive
{ background: C.surface2, color: C.dim, border: `1px solid ${C.border}` }
// shared: fontFamily: mono, fontSize: 12, fontWeight: 600, padding: '8px 20px', borderRadius: 8
```

### Keyboard hint (below controls)
```js
{ textAlign: 'center', fontSize: 11, color: C.border, marginTop: 16, fontFamily: mono }
// text: "← → arrow keys · spacebar = next"
```

---

## Keyboard Handler (in every App)

```js
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
```

---

## Transition Values

| Use case                        | Value                                        |
|---------------------------------|----------------------------------------------|
| Visual elements (boxes, arrows) | `'all 0.4s cubic-bezier(0.4,0,0.2,1)'`      |
| Code line highlight             | `'background 0.3s, border-color 0.3s'`      |
| Code text color                 | `'color 0.3s'`                               |
| Buttons                         | `'all 0.2s'`                                 |
| SVG / linked list nodes         | `'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'`   |

---

## Linked List Specific: NodeBox

Used only in LinkedList visualizations. Rendered inside an SVG-like absolutely positioned div container.

```js
// Two-cell grid: DATA | NEXT
{ display: 'grid', gridTemplateColumns: '1fr 1fr',
  border: `2px solid ${C.accent}`, borderRadius: 8, overflow: 'hidden',
  boxShadow: `0 0 14px ${C.accentGlow}` }

// DATA cell
{ padding: '7px 6px 5px', textAlign: 'center', background: C.surface2, borderRight: `1px solid ${C.border}` }
// data value: fontFamily: mono, fontSize: 16, fontWeight: 700, color: C.green
// "DATA" label: fontFamily: mono, fontSize: 6.5, color: C.dim, letterSpacing: 1.5

// NEXT cell
{ padding: '7px 6px 5px', textAlign: 'center', background: C.surface }
// next addr: fontFamily: mono, fontSize: ~10, fontWeight: 600, color: C.orange (or C.nullC if "NULL")
// "NEXT" label: fontFamily: mono, fontSize: 6.5, color: C.dim, letterSpacing: 1.5

// Memory address label above box: fontFamily: mono, fontSize: 10, fontWeight: 700, color: C.purple
```

NULL markers: `border: 2px dashed ${C.nullC}`, `color: C.nullC`, `fontSize: 11, fontWeight: 700`.

---

## Section Separators in Code (comment style)

Use this divider comment style between logical sections:
```js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Section Name
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Layout Order in App return()

```
<style> block
<div maxWidth=960 container>
  Header (h1 + p)
  Step title row (title + badge)
  <div flex row gap=12 alignItems=stretch marginBottom=16>
    Visualization panel (flex: 1 1 auto)
    State panel (width: 210, flexShrink: 0)
  </div>
  Description panel
  Code panel wrapper (marginBottom: 20)
  Controls panel (slider + buttons)
  Keyboard hint (p)
</div>
```

---

## Notes for LLM Code Generation

1. **All styles are inline** — no CSS files, no Tailwind, no styled-components.
2. **No external component libraries** — no MUI, no Chakra, no Ant Design.
3. **Self-contained** — each JSX file is a complete standalone app with its own data.
4. **`done: true`** on the last STEPS entry triggers: green left-accent on description panel, green done badge in StatePanel, and any final-answer highlights in the visualization.
5. **`codeHL: []`** on setup/initial steps — no lines highlighted.
6. **Button disabled state**: use the `disabled` prop AND conditionally change styling (background/color/cursor) — do NOT rely solely on the `disabled` attribute for visual feedback.
7. **The active "Next" button uses `color: '#0a0e17'`** (the background color) as its text — dark text on the bright accent to ensure contrast.
8. **`C.dim` (`#64748b`) doubles as the inactive border color** in the keyboard hint (`color: C.border` is intentionally the same token used for borders, creating a very subtle footer).
9. **Problem-specific state panels** track whatever variables the algorithm uses. Always show them with semantic color coding matching the visualization (left=accent/green, right/sell=orange, mid/current=purple).
10. **Progress dot navigation** is NOT implemented in these files — navigation is slider + Prev/Next/Reset buttons + keyboard only.
