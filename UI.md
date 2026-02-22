UI Description (for future regeneration)
Theme: Dark terminal / IDE aesthetic. Not a generic dashboard — feels like a live debugger.
Background: #0a0e17 — deep navy-black, not pure black. Creates depth without harshness.
Surface hierarchy (3 levels):

#111827 — card/panel backgrounds
#1a2340 — input fields, inner boxes, secondary surfaces
#2a3555 — borders everywhere

Typography: Monospace (Menlo, Monaco, Cascadia Code, Consolas, JetBrains Mono) for all code, labels, numbers, and UI chrome. System sans-serif only for description/prose text. This split is intentional — makes code feel native.
Color system (semantic, not decorative):

#38bdf8 (sky blue) — primary accent, left pointer, active states, primary buttons
#fb923c (orange) — right pointer, DB/cron layer
#a78bfa (purple) — mid pointer, secondary elements
#4ade80 (green) — confirmed good, success states, final result
#f87171 (red) — errors, bad states, eliminated elements
#64748b — dimmed/inactive text

Each color has a matching glow: rgba(r,g,b,0.15) as background fill and rgba(r,g,b,0.18) as box-shadow.
Component anatomy:

Boxes: border: 2px solid {color}, borderRadius: 10px, glow background, boxShadow: 0 0 18px rgba(color, 0.18)
Panel headers: fontSize: 10, letterSpacing: 2, textTransform: uppercase, color: #64748b — always separated by a 1px border-bottom
Left accent border on description panel: 3px solid {activeColor}, borderRadius: 0 10px 10px 0
Buttons: active = filled accent bg with dark text; inactive = surface2 bg with dim text; no border-radius above 8px
Slider: custom thumb 18px circle, accent fill, glow shadow on thumb

Navigation pattern: Scrubber slider + Prev/Next/Reset buttons + keyboard (←→ Space) + clickable progress dots (active dot widens to 24px, transitions smoothly).
Step counter badge: fontSize: 11, surface background, dim text, padding: 3px 10px, borderRadius: 6.
