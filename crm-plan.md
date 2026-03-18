# CRM Pipeline Tab — Implementation Plan

## Overview

Add a new **"Pipeline"** tab to the EOS app — a shared CRM for tracking two sales initiatives:
- **Mully Golf Outings** (Drew's initiative)
- **MFS New 3PL Clients** (MFS new business)

Both pipelines share the same stage flow. The tab is **shared data** (visible to all 3 profiles), stored in `SharedData` alongside IDS/Scorecard/etc., synced to Supabase via the existing `__shared__` mechanism.

---

## 1. Data Model (`src/lib/types.ts`)

### New Types

```typescript
export type PipelineType = "mully" | "mfs";

export type DealStage =
  | "Cold Outreach"
  | "Following Up"
  | "Responded"
  | "Meeting Scheduled"
  | "Proposal Sent"
  | "Signed"
  | "Paid"
  | "Onboarding"
  | "Parking Lot"
  | "Not Interested";

export interface DealContact {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface DealNote {
  id: string;
  date: string;       // ISO date
  author: string;     // user id (drew/jack/joe)
  text: string;
}

export interface DealLink {
  id: string;
  label: string;
  url: string;
}

export interface Deal {
  id: string;
  pipeline: PipelineType;
  company: string;
  contact: DealContact;
  stage: DealStage;
  accountLead: string;   // user name (Drew/Jack/Joe)
  starred: boolean;      // "hot list" flag
  value: string;         // estimated deal value (free-form, e.g. "$50K/yr")
  notes: DealNote[];
  links: DealLink[];
  createdDate: string;   // ISO date
  lastActivity: string;  // ISO date — auto-updated on any edit
  tags: string[];        // flexible labels
}

export interface PipelineData {
  mully: Deal[];
  mfs: Deal[];
}
```

### Extend SharedData

```typescript
export interface SharedData {
  // ... existing fields ...
  pipeline: PipelineData;
}
```

---

## 2. Stage Flow & Visual Design

The 10 stages map to a visual pipeline. Active stages (Cold Outreach → Onboarding) flow left-to-right. "Parking Lot" and "Not Interested" are separate exit lanes at the bottom.

| Stage | Color | Visual Cue |
|-------|-------|------------|
| Cold Outreach | `#6366F1` indigo | outbound vibe |
| Following Up | `#8B5CF6` violet | persistence |
| Responded | `#3B82F6` blue | engagement |
| Meeting Scheduled | `#0EA5E9` sky | calendar energy |
| Proposal Sent | `#F59E0B` amber | action pending |
| Signed | `#10B981` emerald | victory |
| Paid | `#059669` deep green | money in |
| Onboarding | `#0D9488` teal | building |
| Parking Lot | `#9CA3AF` gray | paused |
| Not Interested | `#EF4444` red | closed-lost |

---

## 3. View Layout — `PipelineView.tsx`

### A. AI Advisor Bar (Top)

A light card at the very top with a subtle left-border accent.

- Shows Claude's daily sales recommendation (2-3 sentences) based on ALL pipeline data
- Specific — references actual company names, stages, and days-since-activity
- **"Refresh Advice"** button → re-calls Claude with current data
- **"Chat with Claude"** button → opens a slide-over chat panel for deeper strategy discussion
- Calls existing `/api/ai` route with a sales-strategist system prompt
- Auto-fetches once per day (cached in localStorage with date key), lazy — doesn't block render

**System prompt concept:**
> "You are a sharp, concise sales strategist for a small business. Analyze the pipeline data and give ONE high-impact, specific recommendation. Reference actual company names and stages. 2-3 sentences max. Be motivating and actionable."

**Chat mode:**
- Small slide-over panel (separate from deal detail)
- User types a question, Claude responds with full pipeline context
- Simple message history in component state (not persisted)
- Great for "What should I prioritize this week?" or "How should I approach [Company]?"

### B. Pipeline Switcher + KPI Strip

**Pipeline Toggle**: Pill-style toggle between "Mully Golf" and "MFS 3PL" (similar to how IDS splits MFS/Mully)

**KPI Cards** (4-5 small metric cards in a row):
| Metric | What Management Cares About |
|--------|---------------------------|
| Active Deals | Total excluding Parking Lot & Not Interested |
| Hot List | Count of starred deals |
| Qualified | Deals at "Meeting Scheduled" or later |
| Closed This Quarter | Deals in "Signed" or later, created this quarter |
| Pipeline Value | Sum of estimated values for active deals |

These give management an instant health check without clicking anything.

### C. Search & Filter Bar

- **Search**: Filters instantly by company name, contact name, or notes content
- **Filter chips**: By stage, by account lead, hot list only
- Minimal, clean — sits between KPI strip and the main board/table

### D. Main Area: Kanban Board (Default View)

- Horizontal scrollable columns for each active stage (Cold Outreach → Onboarding)
- Each deal = a compact card showing:
  - Company name (bold)
  - Contact name (smaller)
  - Account Lead avatar circle
  - Gold star if hot-listed
  - "X days" since last activity (subtle, turns red if stale)
- **Drag-and-drop** between columns (vanilla HTML5 drag API — no library needed)
- Parking Lot and Not Interested as smaller, visually muted columns at the far right
- Click any card → opens **Deal Detail Panel**

### E. Table View (Toggle)

- Spreadsheet-style rows matching the IDS pattern users already know
- Columns: Star | Company | Contact | Stage (dropdown) | Account Lead | Value | Last Activity | Actions
- Inline-editable fields
- Sortable by any column header click
- Great for bulk management and data entry

### F. Deal Detail Panel (Slide-Over)

Opens from right side (~420px wide) when clicking a deal card.

**Sections:**
1. **Header**: Company name (large, editable), hot star toggle, stage dropdown with colored indicator
2. **Contact Info**: Name, title, email (clickable mailto), phone (clickable tel) — simple form fields
3. **Details**: Account Lead (dropdown: Drew/Jack/Joe), Value (input), Tags (inline add/remove)
4. **Links**: Add/remove links (label + URL pairs) — for contracts, proposals, websites
5. **Notes Timeline**: Chronological notes with author avatar + date stamp. Add new note at top with a text area. Each note shows who wrote it.
6. **Quick Actions**: "Move to next stage" button, "Mark as Not Interested", "Move to Parking Lot"

Close with X button or click outside.

---

## 4. File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/components/PipelineView.tsx` | Main CRM view component (~600-800 lines) |

### Modified Files
| File | Change |
|------|--------|
| `src/lib/types.ts` | Add `Deal`, `DealContact`, `DealNote`, `DealLink`, `PipelineData`, `DealStage`, `PipelineType`. Add `pipeline` field to `SharedData`. |
| `src/components/Sidebar.tsx` | Add `"pipeline"` to `View` type union. Add nav entry with new icon. Position after Marketing, before Links. |
| `src/components/ui/Icons.tsx` | Add `IconPipeline` SVG icon for navigation |
| `src/components/AppShell.tsx` | Import `PipelineView`. Add `"pipeline"` case in view router. Add migration safety: `if (!sh.pipeline) sh.pipeline = { mully: [], mfs: [] }` |
| `src/lib/seed.ts` | Add `SEED_SHARED.pipeline` with ~6-8 sample deals per pipeline |
| `src/app/api/ai/route.ts` | No changes needed — already generic. PipelineView will call it with a sales-specific system prompt. |

### Zero New Dependencies
- Drag-and-drop: vanilla HTML5 drag API (`onDragStart`, `onDragOver`, `onDrop`)
- Everything hand-built to match existing patterns
- No external CRM library

---

## 5. Seed Data Plan (`src/lib/seed.ts`)

### Mully Golf Outings (~7 sample deals)
Realistic mix across stages:
- "Titleist Corporate Events" — Meeting Scheduled (hot)
- "TaylorMade Partnerships" — Following Up
- "Callaway Golf Days" — Cold Outreach
- "Topgolf Corporate" — Proposal Sent (hot)
- "PGA Tour Experiences" — Responded
- "ClubCorp Events" — Signed
- "Pebble Beach Resorts" — Parking Lot

### MFS New 3PL Clients (~7 sample deals)
- "FreshDirect" — Meeting Scheduled (hot)
- "Bloom & Wild" — Proposal Sent
- "Dollar Shave Club" — Following Up
- "Warby Parker" — Cold Outreach
- "Glossier Fulfillment" — Responded (hot)
- "Casper Logistics" — Signed
- "Allbirds Distribution" — Onboarding

Each deal comes with 1-2 sample notes, a contact, and realistic values so the board feels alive from first load.

---

## 6. Design Principles

1. **Stupid Simple**: No visual clutter. Generous whitespace. One thing at a time.
2. **Spacious**: Cards breathe. Columns aren't cramped. Touch-friendly on mobile.
3. **Color = Meaning**: Stage colors are consistent everywhere (column headers, badges, detail panel).
4. **Hot Stars Pop**: Gold stars are prominent — hot deals are immediately obvious.
5. **Stale = Red**: Days-since-activity counter turns amber at 7 days, red at 14. Motivates follow-up.
6. **Search-First**: Search bar is prominent. Finding the right person is instant.
7. **Inspiring**: Clean design, smooth animations, AI advisor — makes you WANT to open it and crush your pipeline.
8. **Consistent**: Same design tokens, card styles, shadows, fonts, and animation patterns as every other tab.

---

## 7. Management vs. Sales Rep Experience

The same view serves both audiences:

**For Management (quick glance):**
- KPI strip = instant pipeline health check
- Kanban board = visual overview of where every deal sits
- AI advisor = strategic direction without digging into details
- Hot list stars = instantly see what's most important

**For Sales Reps (daily driver):**
- Table view for bulk data entry and stage updates
- Deal detail panel for deep note-taking and contact management
- Drag-and-drop to move deals through stages quickly
- Search/filter to find their assigned accounts fast
- Notes timeline keeps full conversation history
- Links section keeps proposals/contracts organized

---

## 8. Implementation Order

| Step | What | Est. Complexity |
|------|------|----------------|
| 1 | Types + SharedData update + migration safety in AppShell | Light |
| 2 | Navigation: View type, Sidebar entry, Pipeline icon | Light |
| 3 | Seed data: realistic sample deals for both pipelines | Medium |
| 4 | PipelineView scaffold: layout, pipeline toggle, KPI strip | Medium |
| 5 | Kanban board: stage columns, deal cards, drag-and-drop | Heavy |
| 6 | Deal detail panel: slide-over with all fields, notes, links | Heavy |
| 7 | Table view: alternate spreadsheet view with inline editing | Medium |
| 8 | Search & filter bar | Medium |
| 9 | AI advisor: daily advice bar, refresh, chat panel | Medium |
| 10 | Polish: animations, mobile responsive, edge cases | Medium |

---

## 9. Questions for You

1. **Nav position**: Placing Pipeline after Marketing, before Links (in the "shared" section). Good, or would you prefer it higher?
2. **Deal value format**: Free-form text (e.g. "$50K/yr", "TBD") — simpler and more flexible than a strict number. Sound right?
3. **Any additional fields** on a deal beyond: company, contact info, stage, account lead, value, notes, links, tags?
4. **Mobile priority**: Should the Pipeline tab be in the mobile bottom nav (replacing one of the current 6), or accessible only via hamburger menu like the other shared views?
