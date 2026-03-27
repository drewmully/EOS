"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { UserData, UserProfile, SharedData, Priority, Rock } from "@/lib/types";
import { uid, daysUntil, pct, urgencyScore, urgencyLabel } from "@/lib/utils";
import { ProgressBar } from "./ui/ProgressBar";
import { ProgressRing } from "./ui/ProgressRing";
import { Checkbox } from "./ui/Checkbox";
import { Button } from "./ui/Button";
import { IconPlus } from "./ui/Icons";
import { View } from "./Sidebar";

const STATUS_COLOR: Record<string, string> = {
  "On Track": "#10B981",
  "At Risk": "#F59E0B",
  "Off Track": "#EF4444",
  Done: "#6366F1",
};

function fireMini() {
  confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, startVelocity: 20, colors: ["#10B981", "#22C55E"] });
}

interface Props {
  data: UserData;
  user: UserProfile;
  update: (fn: (d: UserData) => void) => void;
  setView: (v: View) => void;
  setExpRock: (id: string) => void;
  shared?: SharedData | null;
}

/* ── Section wrapper for the calm card style ── */
function Section({
  children,
  bg,
  border,
}: {
  children: React.ReactNode;
  bg: string;
  border: string;
}) {
  return (
    <div
      className="rounded-2xl border shadow-sm"
      style={{ background: bg, borderColor: border, padding: "20px 24px", marginBottom: 16 }}
    >
      {children}
    </div>
  );
}

/* ── Collapsible wrapper ── */
function Collapsible({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-2xl border shadow-sm"
      style={{ background: "#F9FAFB", borderColor: "#E5E7EB", marginBottom: 16 }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between cursor-pointer"
        style={{ padding: "16px 24px" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-gray-600">{title}</span>
          {count !== undefined && count > 0 && (
            <span
              className="text-[11px] font-medium rounded-full"
              style={{
                padding: "1px 8px",
                background: "#E5E7EB",
                color: "#6B7280",
              }}
            >
              {count}
            </span>
          )}
        </div>
        <svg
          className="w-4 h-4 text-gray-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="animate-fadeIn" style={{ padding: "0 24px 20px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function TodayView({ data, user, update, setView, setExpRock, shared }: Props) {
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";

  /* ── Categorize rocks ── */
  const activeRocks = data.rocks.filter((r) => r.status !== "Done");
  const doneRocks = data.rocks.filter((r) => r.status === "Done");
  const blockedRocks = activeRocks.filter(
    (r) => r.status === "Off Track" || r.status === "At Risk" || daysUntil(r.due) < 0
  );
  const onTrackRocks = activeRocks.filter(
    (r) => r.status === "On Track" && daysUntil(r.due) >= 0
  );

  /* ── Blocked subtasks (overdue or due today) ── */
  const blockedSubtasks: { rock: Rock; subtask: { id: string; text: string; due: string; done: boolean } }[] = [];
  for (const rock of activeRocks) {
    for (const st of rock.subtasks) {
      if (!st.done && st.due && daysUntil(st.due) < 0) {
        blockedSubtasks.push({ rock, subtask: st });
      }
    }
  }

  /* ── Overdue todos ── */
  const overdueTodos = data.todos.filter((t) => !t.done && t.due && daysUntil(t.due) < 0);
  const pendingTodos = data.todos.filter((t) => !t.done);
  const doneTodos = data.todos.filter((t) => t.done);

  /* ── IDS issues assigned to this user ── */
  const allIssues = shared ? [...shared.issuesMFS, ...shared.issuesMully] : [];
  const myIssues = allIssues.filter(
    (iss) => iss.owner.toLowerCase() === user.name.toLowerCase() && iss.todo
  );

  const hasBlockedItems = blockedRocks.length > 0 || blockedSubtasks.length > 0 || overdueTodos.length > 0 || myIssues.length > 0;

  /* ── Overall rock progress ── */
  const totalSubtasks = data.rocks.reduce((sum, r) => sum + r.subtasks.length, 0);
  const doneSubtasks = data.rocks.reduce((sum, r) => sum + r.subtasks.filter((s) => s.done).length, 0);
  const overallPct = totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <h1
          className="font-bold tracking-tight"
          style={{ fontSize: 28, color: "#1F2937", fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Daily Dashboard
        </h1>
        <p className="text-sm" style={{ color: "#9CA3AF", marginTop: 4 }}>
          Good {greeting}, <span style={{ color: user.color, fontWeight: 600 }}>{user.name}</span>.
          {" "}A calm view of what matters today.
        </p>
      </div>

      {/* ── Section 1: This Week's Wins ── */}
      <Section bg="linear-gradient(135deg, #D5E8D4 0%, #E8F0E6 40%, #F5F9F4 100%)" border="#C5D9C3">
        <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
          <span className="text-sm font-semibold" style={{ color: "#3D6B39" }}>
            This Week&apos;s Wins
          </span>
          <span className="text-[11px]" style={{ color: "#7DA578" }}>
            — what will move your rocks forward?
          </span>
        </div>
        {data.todayPriorities.map((p: Priority, i: number) => {
          const linkedRock = p.rockId ? data.rocks.find((r) => r.id === p.rockId) : undefined;
          return (
            <div
              key={i}
              className="flex items-start gap-3"
              style={{
                padding: "10px 0",
                borderTop: i > 0 ? "1px solid rgba(61,107,57,0.1)" : "none",
              }}
            >
              <Checkbox
                size="sm"
                checked={p.done}
                onChange={() => {
                  const wasDone = p.done;
                  update((d) => { d.todayPriorities[i].done = !wasDone; });
                  if (!wasDone && p.text) fireMini();
                }}
              />
              <div className="flex-1 min-w-0">
                <input
                  value={p.text}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => { d.todayPriorities[i].text = v; });
                  }}
                  placeholder="What's your win today?"
                  className={[
                    "w-full bg-transparent text-[14px] py-0.5",
                    "focus:outline-none placeholder:text-[#7DA578]",
                    p.done ? "line-through text-gray-400" : "text-gray-800",
                  ].join(" ")}
                />
                {/* Rock link selector */}
                <div className="flex items-center gap-1.5 mt-1">
                  <svg className="w-3 h-3 flex-shrink-0" style={{ color: "#9CB898" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                  </svg>
                  <select
                    value={p.rockId || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      update((d) => { d.todayPriorities[i].rockId = v || undefined; });
                    }}
                    className="bg-transparent text-[11px] font-medium focus:outline-none cursor-pointer"
                    style={{ color: linkedRock ? STATUS_COLOR[linkedRock.status] || "#6B7280" : "#9CB898", maxWidth: 220 }}
                  >
                    <option value="">Link to a rock...</option>
                    {activeRocks.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </Section>

      {/* ── Section 2: Rock Progress ── */}
      <Section bg="linear-gradient(135deg, #F5F0E6 0%, #FAF7F0 40%, #FDFCF9 100%)" border="#E8E0D0">
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <span className="text-sm font-semibold" style={{ color: "#6B5D3E" }}>
            Rock Progress
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium" style={{ color: "#A09070" }}>
              {doneRocks.length}/{data.rocks.length} complete
            </span>
            <ProgressRing
              value={overallPct}
              size={32}
              strokeWidth={3}
              color="#8B7D62"
            />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.rocks.map((rock) => {
            const p = pct(rock);
            const days = daysUntil(rock.due);
            const isDone = rock.status === "Done";

            return (
              <div
                key={rock.id}
                onClick={() => { setExpRock(rock.id); setView("rocks"); }}
                className="flex items-center gap-3 rounded-xl cursor-pointer transition-all duration-150 hover:shadow-sm"
                style={{
                  padding: "10px 14px",
                  background: isDone ? "rgba(99,102,241,0.04)" : "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  opacity: isDone ? 0.6 : 1,
                }}
              >
                <ProgressRing
                  value={p}
                  size={36}
                  strokeWidth={3}
                  color={STATUS_COLOR[rock.status] || "#10B981"}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-medium truncate"
                    style={{ color: isDone ? "#9CA3AF" : "#374151" }}
                  >
                    {rock.name || "(unnamed)"}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-medium uppercase" style={{ color: "#A09070" }}>
                      {rock.biz}
                    </span>
                    <span className="text-[10px]" style={{ color: "#C0B8A8" }}>·</span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: STATUS_COLOR[rock.status] || "#6B7280" }}
                    >
                      {rock.status}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span
                    className="text-[11px] font-semibold"
                    style={{
                      color: isDone ? "#6366F1" : days < 0 ? "#EF4444" : days <= 7 ? "#F59E0B" : "#9CA3AF",
                    }}
                  >
                    {isDone ? "Done" : days > 0 ? `${days}d left` : days === 0 ? "Due today" : `${Math.abs(days)}d over`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Section 3: Blocked / Needs Attention ── */}
      {hasBlockedItems && (
        <Section bg="linear-gradient(135deg, #F5F0E6 0%, #FAF6EE 40%, #FEFCF8 100%)" border="#E8DFD0">
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            <span className="text-sm font-semibold" style={{ color: "#92600A" }}>
              Blocked / Needs Attention
            </span>
            <span
              className="text-[11px] font-medium rounded-full"
              style={{ padding: "1px 8px", background: "#FEF3C7", color: "#92600A" }}
            >
              {blockedRocks.length + blockedSubtasks.length + overdueTodos.length + myIssues.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Off-track / at-risk / overdue rocks */}
            {blockedRocks.map((rock) => {
              const days = daysUntil(rock.due);
              return (
                <div
                  key={rock.id}
                  onClick={() => { setExpRock(rock.id); setView("rocks"); }}
                  className="flex items-center gap-3 rounded-lg cursor-pointer hover:bg-white/60 transition-colors"
                  style={{ padding: "8px 12px" }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: rock.status === "Off Track" ? "#EF4444" : days < 0 ? "#EF4444" : "#F59E0B" }}
                  />
                  <span className="text-[13px] text-gray-700 flex-1 min-w-0 truncate">
                    {rock.name}
                  </span>
                  <span className="text-[11px] font-medium flex-shrink-0" style={{ color: "#92600A" }}>
                    {rock.status === "Off Track"
                      ? "Off Track"
                      : rock.status === "At Risk"
                      ? "At Risk"
                      : `${Math.abs(days)}d overdue`}
                  </span>
                </div>
              );
            })}

            {/* Overdue subtasks */}
            {blockedSubtasks.map(({ rock, subtask }) => (
              <div
                key={subtask.id}
                onClick={() => { setExpRock(rock.id); setView("rocks"); }}
                className="flex items-center gap-3 rounded-lg cursor-pointer hover:bg-white/60 transition-colors"
                style={{ padding: "8px 12px" }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-red-400" />
                <span className="text-[13px] text-gray-700 flex-1 min-w-0 truncate">
                  {subtask.text || "Subtask"} <span className="text-gray-400">({rock.name})</span>
                </span>
                <span className="text-[11px] font-medium flex-shrink-0" style={{ color: "#DC2626" }}>
                  {Math.abs(daysUntil(subtask.due))}d overdue
                </span>
              </div>
            ))}

            {/* Overdue todos */}
            {overdueTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 rounded-lg hover:bg-white/60 transition-colors"
                style={{ padding: "8px 12px" }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-red-400" />
                <span className="text-[13px] text-gray-700 flex-1 min-w-0 truncate">
                  {todo.text || "To-do"}
                </span>
                <span className="text-[11px] font-medium flex-shrink-0" style={{ color: "#DC2626" }}>
                  {Math.abs(daysUntil(todo.due))}d overdue
                </span>
              </div>
            ))}

            {/* IDS issues */}
            {myIssues.map((iss) => (
              <div
                key={iss.id}
                onClick={() => setView("ids")}
                className="flex items-center gap-3 rounded-lg cursor-pointer hover:bg-white/60 transition-colors"
                style={{ padding: "8px 12px" }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F59E0B" }} />
                <span className="text-[13px] text-gray-700 flex-1 min-w-0 truncate">
                  IDS: {iss.title}
                </span>
                <span className="text-[11px] font-medium flex-shrink-0" style={{ color: "#92600A" }}>
                  P{iss.priority}{iss.starred ? " ★" : ""}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Section 4: Everything Else (collapsed) ── */}
      <Collapsible
        title="Everything Else"
        count={pendingTodos.length + data.inbox.filter((x) => !x.triage || x.triage === "").length}
      >
        {/* To-Dos */}
        <div style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              To-Dos
            </span>
            <div className="flex items-center gap-2">
              {data.todos.length > 0 && (
                <span className="text-[10px] text-gray-400">
                  {doneTodos.length}/{data.todos.length}
                </span>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => update((d) => { d.todos.push({ id: uid(), text: "", due: "", done: false }); })}
                icon={<IconPlus className="w-3 h-3" />}
              >
                Add
              </Button>
            </div>
          </div>
          {data.todos.length === 0 ? (
            <p className="text-xs text-gray-400" style={{ padding: "8px 0" }}>No to-dos yet.</p>
          ) : (
            <div
              className="rounded-xl border border-gray-200/60"
              style={{ padding: "8px 16px", background: "white" }}
            >
              {data.todos.map((todo, i) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 group"
                  style={{
                    padding: "6px 0",
                    opacity: todo.done ? 0.5 : 1,
                    borderTop: i > 0 ? "1px solid rgba(0,0,0,0.04)" : "none",
                  }}
                >
                  <Checkbox
                    size="sm"
                    checked={todo.done}
                    onChange={() => {
                      const wasDone = todo.done;
                      update((d) => { d.todos[i].done = !wasDone; });
                      if (!wasDone && todo.text) fireMini();
                    }}
                  />
                  <input
                    value={todo.text}
                    onChange={(e) => { const v = e.target.value; update((d) => { d.todos[i].text = v; }); }}
                    placeholder="To-do..."
                    className={[
                      "flex-1 min-w-0 bg-transparent text-[13px] py-0.5 focus:outline-none",
                      "placeholder:text-gray-300",
                      todo.done ? "line-through text-gray-400" : "text-gray-800",
                    ].join(" ")}
                  />
                  <input
                    type="date"
                    value={todo.due}
                    onChange={(e) => { const v = e.target.value; update((d) => { d.todos[i].due = v; }); }}
                    className="hidden sm:block w-24 bg-transparent text-[11px] text-gray-400 focus:outline-none cursor-pointer"
                  />
                  <button
                    onClick={() => update((d) => { d.todos.splice(i, 1); })}
                    className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-100 cursor-pointer flex-shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inbox summary */}
        {data.inbox.length > 0 && (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Inbox
              </span>
              <button
                onClick={() => setView("inbox")}
                className="text-[11px] font-medium cursor-pointer hover:underline"
                style={{ color: user.color }}
              >
                View all →
              </button>
            </div>
            <div
              className="rounded-xl border border-gray-200/60 flex items-center gap-3"
              style={{ padding: "12px 16px", background: "white" }}
            >
              <span className="text-[13px] text-gray-600">
                {data.inbox.filter((x) => !x.triage || x.triage === "").length} items to triage
              </span>
              <span className="text-[11px] text-gray-400">
                ({data.inbox.length} total)
              </span>
            </div>
          </div>
        )}

        {/* Streak — small motivational footer */}
        {data.streakDays > 0 && (
          <div className="flex items-center gap-2 mt-4" style={{ padding: "8px 0" }}>
            <span className="text-[11px] text-gray-400">
              🔥 {data.streakDays}-day streak
            </span>
          </div>
        )}
      </Collapsible>

      {/* ── Weekly Rhythm ── */}
      <Collapsible title="Weekly Rhythm" defaultOpen={false}>
        <p className="text-[12px] italic mb-4" style={{ color: "#7DA578" }}>
          Structure creates calm, not rigidity.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {([
            { day: "Monday", label: "Align + Plan", desc: "Set intentions, review Rocks, assign the week\u2019s priorities", active: new Date().getDay() === 1 },
            { day: "Tue \u2013 Thu", label: "Deep Execute", desc: "Heads-down work, deep blocks, minimal meetings", active: [2, 3, 4].includes(new Date().getDay()) },
            { day: "Friday", label: "Reflect + Recharge", desc: "Light work, weekly review, celebrate progress", active: new Date().getDay() === 5 },
          ] as const).map((block) => (
            <div
              key={block.day}
              className="flex items-stretch rounded-xl overflow-hidden"
              style={{
                border: block.active ? "2px solid #8BAF87" : "1px solid rgba(0,0,0,0.06)",
                background: "#F9FAFB",
              }}
            >
              {/* Green left bar */}
              <div
                style={{
                  width: 4,
                  background: block.active
                    ? "linear-gradient(to bottom, #6B9B67, #8BAF87)"
                    : "#D1D5DB",
                  flexShrink: 0,
                }}
              />
              <div className="flex items-center gap-4 flex-1" style={{ padding: "14px 18px" }}>
                {/* Day badge */}
                <div
                  className="rounded-lg flex items-center justify-center text-[12px] font-semibold text-white flex-shrink-0"
                  style={{
                    width: 90,
                    height: 44,
                    background: block.active
                      ? "linear-gradient(135deg, #6B9B67 0%, #8BAF87 100%)"
                      : "linear-gradient(135deg, #9CB898 0%, #B3C9AF 100%)",
                  }}
                >
                  {block.day}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-gray-800">{block.label}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{block.desc}</div>
                </div>
                {block.active && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: "#6B9B67" }}>
                    Today
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] italic mt-4" style={{ color: "#7DA578" }}>
          &ldquo;Creates rhythm and reduces decision fatigue.&rdquo;
        </p>
      </Collapsible>

      {/* ── Energy Management ── */}
      <Collapsible title="Energy Management" defaultOpen={false}>
        <p className="text-[12px] italic mb-4" style={{ color: "#7DA578" }}>
          Protect cognitive energy like a precious resource.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 12 }}>
          {([
            { number: "2", title: "Deep Work\nBlocks / Day", desc: "Protect your best hours for the work that matters most" },
            { number: "0", title: "Interruptions\nDuring Blocks", desc: "Create boundaries that let deep thinking happen" },
            { number: "1", title: "Batched\nReactive Window", desc: "Group emails, messages, and requests into one slot" },
          ] as const).map((card, i) => (
            <div
              key={i}
              className="rounded-xl flex flex-col justify-between"
              style={{
                background: "linear-gradient(160deg, #7A9F77 0%, #8BAF87 40%, #9CB898 100%)",
                padding: "24px 20px",
                minHeight: 180,
              }}
            >
              <div>
                <div
                  className="font-light"
                  style={{
                    fontSize: 48,
                    lineHeight: 1,
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  {card.number}
                </div>
                <div
                  className="font-bold text-[13px] mt-2"
                  style={{ color: "#FFFFFF", whiteSpace: "pre-line", lineHeight: 1.4 }}
                >
                  {card.title}
                </div>
              </div>
              <p className="text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </Collapsible>
    </div>
  );
}
