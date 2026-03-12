# Plan: Complete UI Rebuild — EOS Focus Tracker

## Problems with Current UI (from screenshot)
- Flat, no depth — looks like a wireframe, not a real app
- No hover/cursor feedback — impossible to tell what's clickable
- Everything bunched together — no breathing room or visual hierarchy
- Sidebar looks like plain text list — no affordance
- Rock cards are just text slapped on white — no borders, shadows, or structure
- Progress bars are invisible (0% with no container)
- Emoji icons feel cheap
- No visual separation between sections
- Inputs blend into background
- Overall: looks like a developer prototype, not a product

## Design Direction: "Linear meets Notion meets Vercel"
Clean, spacious, high-contrast, beautiful micro-interactions. Think: the apps you actually enjoy using.

## Architecture Decision
**Keep**: All files in `src/lib/` (types.ts, seed.ts, supabase.ts, utils.ts) — data/logic layer is solid
**Rewrite from scratch**: `src/app/page.tsx` and `src/app/globals.css`
**Split into components**: Break the monolithic page.tsx into proper component files for maintainability

## File Structure After Rebuild
```
src/
  app/
    globals.css          ← Full rewrite — design system tokens, animations
    layout.tsx           ← Minor update — add Inter font properly
    page.tsx             ← Thin shell — imports AppShell
  components/
    AppShell.tsx         ← Sidebar + main layout + person switcher + state management
    Sidebar.tsx          ← Redesigned sidebar with proper icons (SVG, not emoji)
    TodayView.tsx        ← Dashboard with proper card grid, urgency badges
    RocksView.tsx        ← Accordion rocks with beautiful expand/collapse
    InboxView.tsx        ← Clean capture UI
    SeatsView.tsx        ← Seat exit cards
    GrowthView.tsx       ← People Analyzer + action plans
    VTOView.tsx          ← Reference view
    ui/                  ← Reusable primitives
      Card.tsx           ← Base card with hover, shadow, variants
      Badge.tsx          ← Status/urgency/biz badges
      ProgressBar.tsx    ← Animated progress with glow
      ProgressRing.tsx   ← SVG ring with animation
      Checkbox.tsx       ← Custom checkbox with animation
      Button.tsx         ← Primary/secondary/ghost variants
      Input.tsx          ← Styled input with label support
```

## Design System Tokens (CSS Custom Properties)

### Colors
- Background: `#FAFAFA` (not pure white, warmer)
- Cards: `#FFFFFF` with `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)` shadow
- Card hover: `0 10px 40px rgba(0,0,0,0.08)` + subtle translateY(-2px)
- Sidebar: `#0F172A` (true dark navy, rich)
- Sidebar active: left accent bar + subtle bg highlight
- Primary accent: `#10B981` (emerald, more vibrant than old teal)
- Text primary: `#111827` (near-black, high contrast)
- Text secondary: `#6B7280`
- Text muted: `#9CA3AF`
- Borders: `#E5E7EB` (visible but soft)

### Typography
- Font: Inter (loaded via next/font for performance, not Google CDN)
- Page titles: 28px / 700 weight / tracking -0.02em
- Section headers: 14px / 600 / uppercase tracking
- Body: 14px / 400
- Small: 12px / 500
- Tiny labels: 11px / 600 / uppercase tracking

### Spacing
- Page padding: 32px desktop, 20px mobile
- Card padding: 24px
- Between cards: 16px gap
- Section spacing: 32px
- Inner element spacing: 12px

### Border Radius
- Cards: 16px (generous, modern)
- Buttons: 10px
- Badges: 8px
- Inputs: 10px
- Avatars: full circle

### Shadows (3-tier system)
- `--shadow-sm`: `0 1px 2px rgba(0,0,0,0.04)`
- `--shadow-md`: `0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)`
- `--shadow-lg`: `0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.04)`
- `--shadow-hover`: cards lift on hover with shadow-lg transition

### Transitions
- All interactive elements: `transition: all 180ms ease`
- Cursor: `pointer` on every clickable thing
- Hover states on EVERYTHING clickable (cards lift, buttons darken, nav items highlight)

## Component-by-Component Design

### Sidebar (desktop)
- Width: 260px (more spacious)
- Dark background `#0F172A` with subtle noise texture
- Logo area: "EOS Focus" in semibold with a small colored dot accent
- Person switcher: horizontal row of avatar circles with name below, selected one has a ring + scale(1.1) + glow
- Nav items: SVG icons (not emoji), 44px height, 12px rounded, left colored accent bar when active, text goes white+bold
- Bottom: sync status indicator with colored dot + label
- Hover: items get `rgba(255,255,255,0.06)` background

### Today View
- Greeting with user's colored avatar next to their name
- Streak badge next to greeting (pill shape, subtle)
- **Rock urgency cards**: 2-column grid with proper gap
  - Each card: white bg, 16px radius, `shadow-md`, `border: 1px solid #E5E7EB`
  - Hover: lift + shadow-lg + border-color changes to accent
  - Business badge (top-left): rounded pill with colored bg
  - Urgency badge (top-right): rounded pill, color-coded (red/amber/green/blue)
  - Rock name: 15px semibold, 2 lines max with ellipsis
  - Progress bar: 6px height, rounded, with a subtle inner glow on the fill, sitting in a visible track
  - Status + days remaining: bottom row, spaced apart
  - Cursor: pointer with visible hover effect
- **Top 3 Priorities**: Clean card with numbered circles (not plain text numbers)
  - Custom checkbox circles that animate on check (scale bounce + color fill)
  - Inputs have visible bottom border that highlights on focus
  - Completed items: smooth strikethrough animation + fade to 50% opacity
- **To-Do List**: Separate card below with proper spacing
  - Add button: prominent, not tiny
  - Each todo: clean row with checkbox, text, date, delete (visible on hover)

### Rocks View
- Title with avatar + quarter label
- Each rock: full-width card, subtle border
  - Collapsed: progress ring (left), name + badges (center), status dropdown (right), chevron
  - Hover: entire row highlights, cursor pointer
  - Expanded: slides open smoothly with subtask list
  - Subtasks: clean checklist with dates, hover reveals delete
  - "Add subtask" button: dashed border, centered
- "Add Rock" button at bottom: prominent dashed card

### Growth View
- Alert banner at top: amber bg with icon, clear text
- People Analyzer: proper table/grid layout with colored cells
  - Core values: each in its own cell with dropdown, color changes with value
  - GWC: same pattern, Y=green N=red
- Strengths/Weaknesses: side-by-side cards with colored dots
- Action Plans: table-like layout with checkboxes, area tags, descriptions, dates

### All Interactive Elements
- **Buttons**: All have `cursor: pointer`, hover darkens bg, active scales down slightly
- **Cards**: All clickable cards have hover lift + shadow change
- **Inputs**: Visible borders, focus ring, proper padding
- **Checkboxes**: Custom-styled, animated fill
- **Dropdowns**: Styled select with custom arrow
- **Delete buttons**: Visible on hover, red on hover

## Animations
- Page transitions: fade + slideUp (200ms)
- Card hover: translateY(-2px) + shadow (180ms ease)
- Checkbox: scale bounce (0 → 1.2 → 1) + color fill
- Progress bars: width transition (600ms ease-out) with subtle glow
- Confetti: keep canvas-confetti but trigger more selectively
- Expand/collapse: height animation with opacity

## Mobile Considerations
- Sidebar collapses to top bar with hamburger
- Bottom nav: 5 items max visible, proper touch targets (48px minimum)
- Cards stack to single column
- Person switcher in top bar
- Touch-friendly checkboxes (44px tap target)

## Implementation Order
1. Create all `src/components/ui/` primitives (Card, Badge, ProgressBar, etc.)
2. Create Sidebar.tsx with SVG icons
3. Create AppShell.tsx with layout + state management (extracted from current page.tsx)
4. Rebuild each view component (Today, Rocks, Inbox, Seats, Growth, V/TO)
5. Rewrite globals.css with design system
6. Update layout.tsx (use next/font)
7. Update page.tsx to thin shell
8. Build and verify
9. Commit and push
