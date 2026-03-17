"use client";

import { useState } from "react";
import {
  SharedData,
  MarketingStage,
  ContentItem,
  MarketingTask,
  CalendarEvent,
  Learning,
  StageStatus,
  ContentStatus,
  USERS,
} from "@/lib/types";
import { uid } from "@/lib/utils";
import { IconPlus } from "./ui/Icons";

/* ── Constants ── */

const STAGE_COLORS: Record<string, { accent: string; bg: string; ring: string }> = {
  "0": { accent: "#0D9488", bg: "#F0FDFA", ring: "#99F6E4" },
  "1": { accent: "#3B82F6", bg: "#EFF6FF", ring: "#BFDBFE" },
  "2": { accent: "#8B5CF6", bg: "#F5F3FF", ring: "#DDD6FE" },
  "3": { accent: "#F59E0B", bg: "#FFFBEB", ring: "#FDE68A" },
};

const STATUS_BADGES: Record<StageStatus, { label: string; color: string; bg: string }> = {
  locked: { label: "Locked", color: "#9CA3AF", bg: "#F3F4F6" },
  planning: { label: "Planning", color: "#3B82F6", bg: "#DBEAFE" },
  active: { label: "Active", color: "#059669", bg: "#D1FAE5" },
  review: { label: "Feedback", color: "#D97706", bg: "#FEF3C7" },
  complete: { label: "Complete", color: "#7C3AED", bg: "#EDE9FE" },
};

const CONTENT_STATUS: Record<ContentStatus, { label: string; color: string }> = {
  idea: { label: "Idea", color: "#9CA3AF" },
  draft: { label: "Draft", color: "#3B82F6" },
  review: { label: "Review", color: "#D97706" },
  live: { label: "Live", color: "#059669" },
};

type SubView = "pipeline" | "calendar" | "learnings";

/* ── Helpers ── */

function fmtShort(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ── Fibonacci Spiral SVG ── */

function FibSpiral({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" strokeWidth={2.5} strokeLinecap="round">
      <defs>
        <linearGradient id="spiralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D9488" />
          <stop offset="33%" stopColor="#3B82F6" />
          <stop offset="66%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path
        d="M50 50 A8 8 0 0 1 42 50 A13 13 0 0 1 55 37 A21 21 0 0 1 71 58 A34 34 0 0 1 37 79"
        stroke="url(#spiralGrad)"
      />
      <circle cx="50" cy="50" r="2.5" fill="#0D9488" />
    </svg>
  );
}

/* ── Props ── */

interface Props {
  shared: SharedData;
  updateShared: (fn: (d: SharedData) => void) => void;
}

/* ═══════════════════════════════════════════
   PIPELINE SUB-VIEW
   ═══════════════════════════════════════════ */

function PipelineView({ shared, updateShared }: Props) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const stages = shared.marketing.stages;

  function updateStage(stageIdx: number, fn: (s: MarketingStage) => void) {
    updateShared((d) => { fn(d.marketing.stages[stageIdx]); });
  }

  function canUnlock(idx: number): boolean {
    if (idx === 0) return true;
    const prev = stages[idx - 1];
    return prev.status === "complete" || prev.status === "review";
  }

  function unlockStage(idx: number) {
    updateShared((d) => {
      d.marketing.stages[idx].status = "planning";
    });
  }

  function taskProgress(stage: MarketingStage) {
    if (!stage.tasks.length) return null;
    const done = stage.tasks.filter((t) => t.done).length;
    return { done, total: stage.tasks.length, pct: Math.round((done / stage.tasks.length) * 100) };
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {stages.map((stage, idx) => {
        const colors = STAGE_COLORS[String(idx)] || STAGE_COLORS["0"];
        const badge = STATUS_BADGES[stage.status];
        const expanded = expandedStage === stage.id;
        const progress = taskProgress(stage);
        const isLocked = stage.status === "locked";

        return (
          <div
            key={stage.id}
            className="rounded-xl border overflow-hidden transition-all duration-200"
            style={{
              borderColor: expanded ? colors.ring : "#E5E7EB",
              background: expanded ? colors.bg : "#FFFFFF",
              opacity: isLocked ? 0.6 : 1,
            }}
          >
            {/* Stage header */}
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              style={{ padding: "14px 16px" }}
              onClick={() => !isLocked && setExpandedStage(expanded ? null : stage.id)}
            >
              {/* Stage number circle */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: colors.accent }}
              >
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {expanded ? (
                    <input
                      value={stage.name}
                      onChange={(e) => updateStage(idx, (s) => { s.name = e.target.value; })}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[15px] font-bold text-gray-900 bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300 min-w-0"
                    />
                  ) : (
                    <span className="text-[15px] font-bold text-gray-900">{stage.name}</span>
                  )}
                  <span className="text-xs text-gray-400">&middot;</span>
                  {expanded ? (
                    <input
                      value={stage.subtitle}
                      onChange={(e) => updateStage(idx, (s) => { s.subtitle = e.target.value; })}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-gray-500 bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300 min-w-0 flex-1"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">{stage.subtitle}</span>
                  )}
                </div>
                {!expanded && progress && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 rounded-full bg-gray-100 flex-1" style={{ maxWidth: 120 }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress.pct}%`, background: colors.accent }} />
                    </div>
                    <span className="text-[11px] text-gray-400">{progress.done}/{progress.total}</span>
                  </div>
                )}
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                {expanded && stage.status !== "locked" ? (
                  <select
                    value={stage.status}
                    onChange={(e) => { e.stopPropagation(); updateStage(idx, (s) => { s.status = e.target.value as StageStatus; }); }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-semibold rounded-full px-2.5 py-1 cursor-pointer border-none focus:outline-none"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="review">Feedback</option>
                    <option value="complete">Complete</option>
                  </select>
                ) : (
                  <span
                    className="text-[11px] font-semibold rounded-full px-2.5 py-1"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {badge.label}
                  </span>
                )}

                {!isLocked && (
                  <svg
                    className="w-4 h-4 text-gray-400 transition-transform"
                    style={{ transform: expanded ? "rotate(180deg)" : "none" }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                  >
                    <path strokeLinecap="round" d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </div>

              {/* Unlock button for locked stages */}
              {isLocked && canUnlock(idx) && (
                <button
                  onClick={(e) => { e.stopPropagation(); unlockStage(idx); }}
                  className="text-[11px] font-semibold px-3 py-1 rounded-full cursor-pointer transition-colors"
                  style={{ background: colors.accent, color: "white" }}
                >
                  Unlock
                </button>
              )}
            </div>

            {/* Expanded stage detail */}
            {expanded && !isLocked && (
              <div style={{ padding: "0 16px 16px" }}>
                {/* Segment + Channels row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Segment (Who)</label>
                    <textarea
                      value={stage.segment}
                      onChange={(e) => updateStage(idx, (s) => { s.segment = e.target.value; })}
                      className="w-full mt-1 text-[13px] text-gray-700 bg-white/70 rounded-lg border border-gray-200 focus:border-gray-300 focus:outline-none resize-none"
                      style={{ padding: "8px 10px" }}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Channels (Where)</label>
                    <input
                      value={stage.channels.join(", ")}
                      onChange={(e) => updateStage(idx, (s) => { s.channels = e.target.value.split(",").map((c) => c.trim()).filter(Boolean); })}
                      className="w-full mt-1 text-[13px] text-gray-700 bg-white/70 rounded-lg border border-gray-200 focus:border-gray-300 focus:outline-none"
                      style={{ padding: "8px 10px" }}
                      placeholder="Email, SMS, Social..."
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">Comma separated</p>
                  </div>
                </div>

                {/* Content section */}
                <div style={{ marginBottom: 16 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Content (What)</span>
                    <button
                      onClick={() => updateStage(idx, (s) => {
                        s.content.push({ id: uid(), title: "", type: "Email", channel: stage.channels[0] || "", status: "idea", body: "", assignee: "" });
                      })}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <IconPlus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  {stage.content.length === 0 && (
                    <p className="text-[12px] text-gray-400 italic">No content yet — click Add to create your first piece.</p>
                  )}

                  {stage.content.map((item, ci) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-200 bg-white mb-2 overflow-hidden"
                    >
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        style={{ padding: "8px 12px" }}
                        onClick={() => setEditingContent(editingContent === item.id ? null : item.id)}
                      >
                        <span
                          className="text-[10px] font-semibold rounded px-1.5 py-0.5"
                          style={{ background: CONTENT_STATUS[item.status]?.color + "18", color: CONTENT_STATUS[item.status]?.color }}
                        >
                          {CONTENT_STATUS[item.status]?.label || item.status}
                        </span>
                        <input
                          value={item.title}
                          onChange={(e) => updateStage(idx, (s) => { s.content[ci].title = e.target.value; })}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 text-[13px] text-gray-800 bg-transparent focus:outline-none min-w-0"
                          placeholder="Content title..."
                        />
                        <input
                          value={item.type}
                          onChange={(e) => updateStage(idx, (s) => { s.content[ci].type = e.target.value; })}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-gray-500 bg-transparent focus:outline-none w-20 text-right"
                          placeholder="Type"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); if (confirm("Delete?")) updateStage(idx, (s) => { s.content.splice(ci, 1); }); }}
                          className="text-gray-300 hover:text-red-500 cursor-pointer"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>

                      {editingContent === item.id && (
                        <div style={{ padding: "0 12px 10px" }}>
                          <div className="grid grid-cols-3 gap-2" style={{ marginBottom: 6 }}>
                            <div>
                              <label className="text-[10px] text-gray-400">Channel</label>
                              <input
                                value={item.channel}
                                onChange={(e) => updateStage(idx, (s) => { s.content[ci].channel = e.target.value; })}
                                className="w-full text-[12px] text-gray-700 bg-gray-50 rounded border border-gray-200 focus:outline-none px-2 py-1"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400">Status</label>
                              <select
                                value={item.status}
                                onChange={(e) => updateStage(idx, (s) => { s.content[ci].status = e.target.value as ContentStatus; })}
                                className="w-full text-[12px] text-gray-700 bg-gray-50 rounded border border-gray-200 focus:outline-none px-2 py-1 cursor-pointer"
                              >
                                <option value="idea">Idea</option>
                                <option value="draft">Draft</option>
                                <option value="review">Review</option>
                                <option value="live">Live</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400">Assignee</label>
                              <select
                                value={item.assignee}
                                onChange={(e) => updateStage(idx, (s) => { s.content[ci].assignee = e.target.value; })}
                                className="w-full text-[12px] text-gray-700 bg-gray-50 rounded border border-gray-200 focus:outline-none px-2 py-1 cursor-pointer"
                              >
                                <option value="">—</option>
                                {USERS.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
                              </select>
                            </div>
                          </div>
                          <label className="text-[10px] text-gray-400">Body / Brief</label>
                          <textarea
                            value={item.body}
                            onChange={(e) => updateStage(idx, (s) => { s.content[ci].body = e.target.value; })}
                            className="w-full text-[12px] text-gray-700 bg-gray-50 rounded border border-gray-200 focus:outline-none resize-none"
                            style={{ padding: "6px 8px" }}
                            rows={4}
                            placeholder="Draft copy, brief, or notes..."
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tasks section */}
                <div style={{ marginBottom: 16 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tasks</span>
                    <button
                      onClick={() => updateStage(idx, (s) => {
                        s.tasks.push({ id: uid(), text: "", assignee: "", due: "", done: false });
                      })}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <IconPlus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  {stage.tasks.map((task, ti) => (
                    <div key={task.id} className="flex items-center gap-2 group" style={{ marginBottom: 4 }}>
                      <button
                        onClick={() => updateStage(idx, (s) => { s.tasks[ti].done = !s.tasks[ti].done; })}
                        className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors"
                        style={{
                          borderColor: task.done ? colors.accent : "#D1D5DB",
                          background: task.done ? colors.accent : "transparent",
                        }}
                      >
                        {task.done && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <input
                        value={task.text}
                        onChange={(e) => updateStage(idx, (s) => { s.tasks[ti].text = e.target.value; })}
                        className="flex-1 text-[13px] bg-transparent focus:outline-none min-w-0"
                        style={{ color: task.done ? "#9CA3AF" : "#374151", textDecoration: task.done ? "line-through" : "none" }}
                        placeholder="Task..."
                      />
                      <select
                        value={task.assignee}
                        onChange={(e) => updateStage(idx, (s) => { s.tasks[ti].assignee = e.target.value; })}
                        className="text-[11px] text-gray-500 bg-transparent focus:outline-none cursor-pointer"
                      >
                        <option value="">—</option>
                        {USERS.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
                      </select>
                      <input
                        type="date"
                        value={task.due}
                        onChange={(e) => updateStage(idx, (s) => { s.tasks[ti].due = e.target.value; })}
                        className="text-[11px] text-gray-500 bg-transparent focus:outline-none cursor-pointer"
                      />
                      <button
                        onClick={() => updateStage(idx, (s) => { s.tasks.splice(ti, 1); })}
                        className="w-4 h-4 flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}

                  {progress && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1.5 rounded-full bg-gray-100 flex-1">
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress.pct}%`, background: colors.accent }} />
                      </div>
                      <span className="text-[11px] text-gray-400">{progress.pct}%</span>
                    </div>
                  )}
                </div>

                {/* Feedback / Quick Feedback */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Quick Feedback</label>
                  <p className="text-[10px] text-gray-400 mb-1">Capture what worked, what didn&apos;t, and key metrics before moving to the next stage.</p>
                  <textarea
                    value={stage.feedback}
                    onChange={(e) => updateStage(idx, (s) => { s.feedback = e.target.value; })}
                    className="w-full text-[13px] text-gray-700 bg-white/70 rounded-lg border border-gray-200 focus:border-gray-300 focus:outline-none resize-none"
                    style={{ padding: "8px 10px" }}
                    rows={3}
                    placeholder="What worked? What didn't? Key numbers..."
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add custom stage */}
      <button
        onClick={() => updateShared((d) => {
          d.marketing.stages.push({
            id: uid(), name: `Level ${d.marketing.stages.length + 1}`, subtitle: "Custom Segment",
            status: "locked", segment: "", channels: [], content: [], tasks: [], feedback: "",
          });
        })}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl border border-dashed border-gray-200 cursor-pointer transition-colors"
        style={{ padding: "12px 0" }}
      >
        <IconPlus className="w-3 h-3" /> Add Stage
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CALENDAR SUB-VIEW
   ═══════════════════════════════════════════ */

function CalendarView({ shared, updateShared }: Props) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const events = shared.marketing.calendar;
  const stages = shared.marketing.stages;

  const now = new Date();
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const monthName = viewMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function dateISO(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function eventsForDay(day: number) {
    const iso = dateISO(day);
    return events.filter((e) => e.date === iso);
  }

  function stageColor(stageId: string) {
    const idx = stages.findIndex((s) => s.id === stageId);
    return STAGE_COLORS[String(idx)] || STAGE_COLORS["0"];
  }

  function addEvent(day: number) {
    const iso = dateISO(day);
    const newId = uid();
    updateShared((d) => {
      d.marketing.calendar.push({
        id: newId, date: iso, title: "", stageId: stages[0]?.id || "", type: "content",
      });
    });
    setEditingEvent(newId);
  }

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonthOffset((o) => o - 1)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-sm font-semibold text-gray-900 min-w-[160px] text-center">{monthName}</span>
          <button onClick={() => setMonthOffset((o) => o + 1)} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          <button onClick={() => setMonthOffset(0)} className="px-2.5 h-7 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-500 hover:text-gray-700 cursor-pointer">Today</button>
        </div>

        {/* Stage legend */}
        <div className="flex items-center gap-3">
          {stages.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: (STAGE_COLORS[String(i)] || STAGE_COLORS["0"]).accent }} />
              <span className="text-[10px] text-gray-500">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center" style={{ padding: "8px 4px" }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = day && dateISO(day) === todayISO();
            const dayEvents = day ? eventsForDay(day) : [];
            return (
              <div
                key={i}
                className="border-t border-gray-100 min-h-[80px] relative group"
                style={{ padding: "4px 6px", background: isToday ? "#F0FDFA" : day ? "white" : "#FAFBFC" }}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] ${isToday ? "font-bold text-teal-600" : "text-gray-500"}`}>{day}</span>
                      <button
                        onClick={() => addEvent(day)}
                        className="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <IconPlus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div style={{ marginTop: 2 }}>
                      {dayEvents.map((ev) => {
                        const c = stageColor(ev.stageId);
                        return (
                          <div
                            key={ev.id}
                            className="rounded px-1.5 py-0.5 mb-0.5 cursor-pointer truncate"
                            style={{ background: c.accent + "18", color: c.accent, fontSize: 10, fontWeight: 600 }}
                            onClick={() => setEditingEvent(editingEvent === ev.id ? null : ev.id)}
                          >
                            {ev.title || ev.type || "Event"}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event editor */}
      {editingEvent && (() => {
        const evIdx = events.findIndex((e) => e.id === editingEvent);
        if (evIdx < 0) return null;
        const ev = events[evIdx];
        return (
          <div className="mt-3 rounded-xl border border-gray-200 bg-white" style={{ padding: 16 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span className="text-[13px] font-semibold text-gray-900">Edit Event</span>
              <button onClick={() => setEditingEvent(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-gray-400">Title</label>
                <input
                  value={ev.title}
                  onChange={(e) => updateShared((d) => { d.marketing.calendar[evIdx].title = e.target.value; })}
                  className="w-full text-[12px] text-gray-700 bg-gray-50 rounded border border-gray-200 focus:outline-none px-2 py-1.5"
                  placeholder="Event title..."
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Date</label>
                <input
                  type="date"
                  value={ev.date}
                  onChange={(e) => updateShared((d) => { d.marketing.calendar[evIdx].date = e.target.value; })}
                  className="w-full text-[12px] text-gray-700 bg-gray-50 rounded border border-gray-200 focus:outline-none px-2 py-1.5 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Stage</label>
                <select
                  value={ev.stageId}
                  onChange={(e) => updateShared((d) => { d.marketing.calendar[evIdx].stageId = e.target.value; })}
                  className="w-full text-[12px] text-gray-700 bg-gray-50 rounded border border-gray-200 focus:outline-none px-2 py-1.5 cursor-pointer"
                >
                  {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Type</label>
                <input
                  value={ev.type}
                  onChange={(e) => updateShared((d) => { d.marketing.calendar[evIdx].type = e.target.value; })}
                  className="w-full text-[12px] text-gray-700 bg-gray-50 rounded border border-gray-200 focus:outline-none px-2 py-1.5"
                  placeholder="launch, content, feedback..."
                />
              </div>
            </div>
            <button
              onClick={() => { updateShared((d) => { d.marketing.calendar.splice(evIdx, 1); }); setEditingEvent(null); }}
              className="mt-3 text-[11px] text-red-400 hover:text-red-600 cursor-pointer"
            >
              Delete event
            </button>
          </div>
        );
      })()}
    </div>
  );
}

/* ═══════════════════════════════════════════
   LEARNINGS SUB-VIEW
   ═══════════════════════════════════════════ */

function LearningsView({ shared, updateShared }: Props) {
  const [stageFilter, setStageFilter] = useState<string>("all");
  const stages = shared.marketing.stages;
  const learnings = shared.marketing.learnings;

  const filtered = stageFilter === "all" ? learnings : learnings.filter((l) => l.stageId === stageFilter);
  const sorted = [...filtered].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  function addLearning() {
    updateShared((d) => {
      d.marketing.learnings.unshift({
        id: uid(), date: todayISO(), stageId: stages.find((s) => s.status === "active")?.id || stages[0]?.id || "",
        text: "", metric: "", insight: "",
      });
    });
  }

  function updateLearning(id: string, patch: Partial<Learning>) {
    updateShared((d) => {
      const l = d.marketing.learnings.find((x) => x.id === id);
      if (l) Object.assign(l, patch);
    });
  }

  function deleteLearning(id: string) {
    updateShared((d) => {
      const idx = d.marketing.learnings.findIndex((x) => x.id === id);
      if (idx >= 0) d.marketing.learnings.splice(idx, 1);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Filter by stage</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-[12px] text-gray-700 bg-gray-50 rounded border border-gray-200 focus:outline-none px-2 py-1 cursor-pointer"
          >
            <option value="all">All Stages</option>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button
          onClick={addLearning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white cursor-pointer"
          style={{ background: "#0D9488" }}
        >
          <IconPlus className="w-3 h-3" /> Add Learning
        </button>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">No learnings yet.</p>
          <p className="text-xs text-gray-300 mt-1">Capture insights as you go so each stage gets smarter.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((learning) => {
          const stageIdx = stages.findIndex((s) => s.id === learning.stageId);
          const colors = STAGE_COLORS[String(stageIdx)] || STAGE_COLORS["0"];
          const stageName = stages[stageIdx]?.name || "—";

          return (
            <div key={learning.id} className="rounded-xl border border-gray-200 bg-white group" style={{ padding: 14 }}>
              <div className="flex items-start justify-between" style={{ marginBottom: 8 }}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ background: colors.bg, color: colors.accent }}>
                    {stageName}
                  </span>
                  <input
                    type="date"
                    value={learning.date}
                    onChange={(e) => updateLearning(learning.id, { date: e.target.value })}
                    className="text-[11px] text-gray-400 bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>
                <button
                  onClick={() => { if (confirm("Delete this learning?")) deleteLearning(learning.id); }}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <label className="text-[10px] text-gray-400">Stage</label>
                <select
                  value={learning.stageId}
                  onChange={(e) => updateLearning(learning.id, { stageId: e.target.value })}
                  className="text-[11px] text-gray-600 bg-transparent focus:outline-none cursor-pointer"
                >
                  {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <textarea
                value={learning.text}
                onChange={(e) => updateLearning(learning.id, { text: e.target.value })}
                className="w-full text-[13px] text-gray-700 bg-transparent focus:outline-none resize-none mb-2"
                rows={2}
                placeholder="What did we learn?"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400">Metric / Data</label>
                  <input
                    value={learning.metric}
                    onChange={(e) => updateLearning(learning.id, { metric: e.target.value })}
                    className="w-full text-[12px] text-gray-600 bg-gray-50 rounded border border-gray-200 focus:outline-none px-2 py-1"
                    placeholder="e.g. 23% open rate, 4.2% CTR..."
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400">Insight / So What</label>
                  <input
                    value={learning.insight}
                    onChange={(e) => updateLearning(learning.id, { insight: e.target.value })}
                    className="w-full text-[12px] text-gray-600 bg-gray-50 rounded border border-gray-200 focus:outline-none px-2 py-1"
                    placeholder="e.g. Subject lines with urgency perform 2x..."
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   AI PANEL
   ═══════════════════════════════════════════ */

function AIPanel({ shared, onClose }: { shared: SharedData; onClose: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Build context from marketing data
  function buildContext() {
    const m = shared.marketing;
    const parts: string[] = ["# Fibonacci Marketing Plan Context\n"];
    for (const [i, stage] of m.stages.entries()) {
      parts.push(`## Stage ${i + 1}: ${stage.name} (${stage.subtitle}) — Status: ${stage.status}`);
      parts.push(`Segment: ${stage.segment}`);
      parts.push(`Channels: ${stage.channels.join(", ")}`);
      if (stage.content.length) {
        parts.push(`Content: ${stage.content.map((c) => `${c.title || "untitled"} [${c.status}]`).join(", ")}`);
      }
      if (stage.feedback) parts.push(`Feedback: ${stage.feedback}`);
      parts.push("");
    }
    if (m.learnings.length) {
      parts.push("## Learnings");
      for (const l of m.learnings.slice(0, 10)) {
        parts.push(`- ${l.text}${l.metric ? ` (${l.metric})` : ""}${l.insight ? ` → ${l.insight}` : ""}`);
      }
    }
    return parts.join("\n");
  }

  async function send() {
    if (!prompt.trim()) return;
    const userMsg = prompt.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setPrompt("");
    setLoading(true);

    try {
      const context = buildContext();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a marketing strategy assistant for a DTC subscription brand called Mully. You help with content creation, campaign planning, and marketing optimization. Be concise and actionable. Here is the current marketing plan context:\n\n${context}`,
          message: userMsg,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.response || "No response" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Could not reach AI. Make sure ANTHROPIC_API_KEY is set in your environment." }]);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white border-l border-gray-200 z-[100] flex flex-col shadow-xl animate-slideIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100" style={{ padding: "12px 16px" }}>
        <div className="flex items-center gap-2">
          <FibSpiral size={24} />
          <span className="text-[14px] font-bold text-gray-900">Ask Claude</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 16 }}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <FibSpiral size={40} />
            <p className="text-sm text-gray-500 mt-3 font-medium">Marketing AI Assistant</p>
            <p className="text-xs text-gray-400 mt-1">Ask me to draft content, suggest strategy, or analyze your learnings.</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                "Draft an email for Stage 1",
                "Suggest 3 subject lines",
                "What should we focus on next?",
                "Summarize our learnings",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => { setPrompt(q); }}
                  className="text-[11px] text-gray-500 border border-gray-200 rounded-full px-3 py-1 hover:border-gray-300 hover:text-gray-700 cursor-pointer transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : ""}`}>
            <div
              className={`inline-block text-[13px] rounded-xl max-w-[90%] text-left ${
                msg.role === "user"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-gray-700 border border-gray-200"
              }`}
              style={{ padding: "8px 12px", whiteSpace: "pre-wrap" }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100" style={{ padding: "12px 16px" }}>
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            className="flex-1 text-[13px] text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:border-gray-300 focus:outline-none px-3 py-2"
            placeholder="Ask about your marketing plan..."
          />
          <button
            onClick={send}
            disabled={loading || !prompt.trim()}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-white cursor-pointer disabled:opacity-40"
            style={{ background: "#0D9488" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN MARKETING VIEW
   ═══════════════════════════════════════════ */

export function MarketingView({ shared, updateShared }: Props) {
  const [subView, setSubView] = useState<SubView>("pipeline");
  const [showAI, setShowAI] = useState(false);
  const stages = shared.marketing.stages;

  // Quick stats
  const activeStage = stages.find((s) => s.status === "active" || s.status === "review");
  const totalContent = stages.reduce((n, s) => n + s.content.length, 0);
  const totalTasks = stages.reduce((n, s) => n + s.tasks.length, 0);
  const doneTasks = stages.reduce((n, s) => n + s.tasks.filter((t) => t.done).length, 0);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 20 }}>
        <div className="flex items-center gap-3">
          <FibSpiral size={44} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fibonacci Marketing</h1>
            <p className="text-sm text-gray-400 mt-0.5">Start tight, learn fast, expand with precision</p>
          </div>
        </div>

        <button
          onClick={() => setShowAI(!showAI)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium cursor-pointer transition-all"
          style={{
            background: showAI ? "#0D9488" : "#F0FDFA",
            color: showAI ? "white" : "#0D9488",
            border: "1px solid",
            borderColor: showAI ? "#0D9488" : "#99F6E4",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            <path strokeLinecap="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
          Ask Claude
        </button>
      </div>

      {/* Quick stats bar */}
      <div className="flex items-center gap-4 rounded-xl bg-gray-50 border border-gray-100" style={{ padding: "10px 16px", marginBottom: 16 }}>
        {activeStage && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] text-gray-600"><span className="font-semibold">{activeStage.name}</span> active</span>
          </div>
        )}
        <span className="text-[12px] text-gray-400">{stages.filter((s) => s.status === "complete").length}/{stages.length} stages complete</span>
        <span className="text-[12px] text-gray-400">{totalContent} content pieces</span>
        <span className="text-[12px] text-gray-400">{doneTasks}/{totalTasks} tasks done</span>
      </div>

      {/* Sub-view tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1" style={{ marginBottom: 20, width: "fit-content" }}>
        {([
          { key: "pipeline" as SubView, label: "Pipeline" },
          { key: "calendar" as SubView, label: "Calendar" },
          { key: "learnings" as SubView, label: "Learnings" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSubView(key)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium cursor-pointer transition-all ${
              subView === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            {key === "learnings" && shared.marketing.learnings.length > 0 && (
              <span className="ml-1.5 text-[10px] text-gray-400">{shared.marketing.learnings.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-view content */}
      {subView === "pipeline" && <PipelineView shared={shared} updateShared={updateShared} />}
      {subView === "calendar" && <CalendarView shared={shared} updateShared={updateShared} />}
      {subView === "learnings" && <LearningsView shared={shared} updateShared={updateShared} />}

      {/* AI Panel */}
      {showAI && <AIPanel shared={shared} onClose={() => setShowAI(false)} />}
    </div>
  );
}
