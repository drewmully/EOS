"use client";

import { useState } from "react";
import { SharedData, ScorecardRow } from "@/lib/types";
import { uid } from "@/lib/utils";
import { IconPlus } from "./ui/Icons";

/* ── Friday date helpers ── */

/** Get the next Friday on or after a given date */
function nextFriday(from: Date): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 5=Fri
  const diff = (5 - day + 7) % 7 || 7; // days until next Friday (if today is Fri, go to next Fri)
  d.setDate(d.getDate() + diff);
  return d;
}

/** Format "YYYY-MM-DD" */
function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Format for display: "3/20" */
function fmtWeek(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** Get 4 consecutive Friday ISO dates starting from a given Friday */
function getFridays(startFriday: Date): string[] {
  const out: string[] = [];
  const d = new Date(startFriday);
  for (let i = 0; i < 4; i++) {
    out.push(toISO(d));
    d.setDate(d.getDate() + 7);
  }
  return out;
}

/**
 * Compute the smart default start Friday:
 * - If no data exists yet: start at the next upcoming Friday (shows 4 future weeks)
 * - If data exists: find the latest filled week, then show trailing 3 + 1 upcoming
 *   so the rightmost column is always the next week to fill in
 */
function computeDefaultStart(rows: ScorecardRow[]): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = nextFriday(today);

  // Find the latest Friday that has any data
  let latestFilledISO: string | null = null;
  for (const row of rows) {
    for (const key of Object.keys(row.weekData || {})) {
      if (row.weekData[key] && (!latestFilledISO || key > latestFilledISO)) {
        latestFilledISO = key;
      }
    }
  }

  if (!latestFilledISO) {
    // No data yet — start with next 4 Fridays
    return upcoming;
  }

  // Data exists: put the latest filled week as column 3 (0-indexed),
  // so column 4 is the next empty week to fill
  const latestDate = new Date(latestFilledISO + "T00:00:00");
  const startDate = new Date(latestDate);
  startDate.setDate(startDate.getDate() - 14); // go back 2 weeks so latest is in col 3
  return startDate;
}

/* ── Component ── */

interface Props {
  shared: SharedData;
  updateShared: (fn: (d: SharedData) => void) => void;
}

function ScorecardTable({
  title,
  subtitle,
  accent,
  rows,
  fridays,
  onUpdate,
  onWeekUpdate,
  onAdd,
  onDelete,
}: {
  title: string;
  subtitle: string;
  accent: string;
  rows: ScorecardRow[];
  fridays: string[];
  onUpdate: (idx: number, patch: Partial<ScorecardRow>) => void;
  onWeekUpdate: (idx: number, fridayISO: string, value: string) => void;
  onAdd: () => void;
  onDelete: (idx: number) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISO(today);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {/* Header */}
        <div
          className="grid text-[11px] font-semibold uppercase tracking-wider text-white"
          style={{
            gridTemplateColumns: "1fr 90px 80px repeat(4, 72px) 32px",
            background: accent,
            padding: "8px 12px",
          }}
        >
          <span>Measurable</span>
          <span>Owner</span>
          <span>Goal</span>
          {fridays.map((f) => {
            const isPast = f < todayISO;
            return (
              <span key={f} className="text-center" style={{ opacity: isPast ? 0.7 : 1 }}>
                {fmtWeek(f)}
              </span>
            );
          })}
          <span />
        </div>

        {rows.map((row, i) => (
          <div
            key={row.id}
            className="grid items-center group"
            style={{
              gridTemplateColumns: "1fr 90px 80px repeat(4, 72px) 32px",
              padding: "6px 12px",
              borderTop: i > 0 ? "1px solid #F3F4F6" : "none",
              background: i % 2 === 0 ? "#FFFFFF" : "#FAFBFC",
            }}
          >
            <input
              value={row.measurable}
              onChange={(e) => onUpdate(i, { measurable: e.target.value })}
              className="bg-transparent text-[13px] text-gray-800 focus:outline-none min-w-0 truncate"
              placeholder="Measurable..."
            />
            <select
              value={row.owner}
              onChange={(e) => onUpdate(i, { owner: e.target.value })}
              className="bg-transparent text-[12px] text-gray-600 cursor-pointer focus:outline-none"
            >
              <option value="">—</option>
              <option>Drew</option>
              <option>Jack</option>
              <option>Joe</option>
            </select>
            <input
              value={row.goal}
              onChange={(e) => onUpdate(i, { goal: e.target.value })}
              className="bg-transparent text-[12px] text-gray-600 focus:outline-none min-w-0 text-center"
              placeholder="—"
            />
            {fridays.map((f) => {
              const val = (row.weekData || {})[f] || "";
              const isFuture = f > todayISO;
              return (
                <input
                  key={f}
                  value={val}
                  onChange={(e) => onWeekUpdate(i, f, e.target.value)}
                  className="bg-transparent text-[12px] text-gray-600 focus:outline-none min-w-0 text-center"
                  placeholder="—"
                  style={{
                    background: isFuture ? "rgba(249,250,251,0.6)" : "transparent",
                    borderRadius: 4,
                  }}
                />
              );
            })}
            <button
              onClick={() => { if (confirm("Delete this row?")) onDelete(i); }}
              className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ padding: "8px 0", borderTop: "1px solid #F3F4F6" }}
        >
          <IconPlus className="w-3 h-3" />
          Add Row
        </button>
      </div>
    </div>
  );
}

export function ScorecardView({ shared, updateShared }: Props) {
  // Compute smart default start from data
  const allRows = [...shared.scorecard.mfs, ...shared.scorecard.mully];
  const defaultStart = computeDefaultStart(allRows);

  // Week offset state: 0 = default view, -1 = one week earlier, +1 = one week later
  const [weekOffset, setWeekOffset] = useState(0);

  const startFriday = new Date(defaultStart);
  startFriday.setDate(startFriday.getDate() + weekOffset * 7);
  const fridays = getFridays(startFriday);

  function handleWeekUpdate(biz: "mfs" | "mully", idx: number, fridayISO: string, value: string) {
    updateShared((d) => {
      const row = d.scorecard[biz][idx];
      if (!row.weekData) row.weekData = {};
      row.weekData[fridayISO] = value;
    });
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Scorecard</h1>
          <p className="text-sm text-gray-400 mt-0.5">5-15 weekly numbers &middot; each has an owner and a goal</p>
        </div>

        {/* Week navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((o) => o - 4)}
            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 cursor-pointer transition-colors"
            title="Back 4 weeks"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 cursor-pointer transition-colors"
            title="Back 1 week"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-2.5 h-7 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer transition-colors"
            title="Jump to current weeks"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 cursor-pointer transition-colors"
            title="Forward 1 week"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 4)}
            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 cursor-pointer transition-colors"
            title="Forward 4 weeks"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Date range indicator */}
      <div className="text-xs text-gray-400 font-medium" style={{ marginBottom: 16 }}>
        Weeks ending: {fridays.map(fmtWeek).join("  ·  ")}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ScorecardTable
          title="MFS (3PL)"
          subtitle={`${shared.scorecard.mfs.length} measurables`}
          accent="#3E8A8A"
          rows={shared.scorecard.mfs}
          fridays={fridays}
          onUpdate={(idx, patch) => updateShared((d) => { Object.assign(d.scorecard.mfs[idx], patch); })}
          onWeekUpdate={(idx, f, v) => handleWeekUpdate("mfs", idx, f, v)}
          onAdd={() => updateShared((d) => {
            d.scorecard.mfs.push({ id: uid(), measurable: "", owner: "", goal: "", weekData: {} });
          })}
          onDelete={(idx) => updateShared((d) => { d.scorecard.mfs.splice(idx, 1); })}
        />

        <ScorecardTable
          title="Mully (eCommerce)"
          subtitle={`${shared.scorecard.mully.length} measurables`}
          accent="#D4883E"
          rows={shared.scorecard.mully}
          fridays={fridays}
          onUpdate={(idx, patch) => updateShared((d) => { Object.assign(d.scorecard.mully[idx], patch); })}
          onWeekUpdate={(idx, f, v) => handleWeekUpdate("mully", idx, f, v)}
          onAdd={() => updateShared((d) => {
            d.scorecard.mully.push({ id: uid(), measurable: "", owner: "", goal: "", weekData: {} });
          })}
          onDelete={(idx) => updateShared((d) => { d.scorecard.mully.splice(idx, 1); })}
        />
      </div>
    </div>
  );
}
