"use client";

import confetti from "canvas-confetti";
import { UserData, UserProfile, SharedData, Priority } from "@/lib/types";
import { uid, daysUntil, pct, urgencyScore, urgencyLabel, getRecommendations } from "@/lib/utils";
import { Badge } from "./ui/Badge";
import { ProgressBar } from "./ui/ProgressBar";
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

const URG_VARIANT: Record<string, "red" | "amber" | "emerald" | "blue"> = {
  "PUSH NOW": "red",
  "NEEDS FOCUS": "amber",
  "ON PACE": "emerald",
  CRUISING: "blue",
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

export function TodayView({ data, user, update, setView, setExpRock, shared }: Props) {
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";
  const sorted = [...data.rocks].sort((a, b) => urgencyScore(b) - urgencyScore(a));
  const allIssues = shared ? [...shared.issuesMFS, ...shared.issuesMully] : [];
  const recommendations = getRecommendations(data, user.name, allIssues);

  return (
    <div className="animate-fadeIn">
      {/* Header row — greeting + recommendations inline */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Good {greeting},{" "}
          <span style={{ color: user.color }}>{user.name}</span>
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Here&apos;s what needs your attention.</p>
      </div>

      {/* Smart Recommendations — compact inline */}
      {recommendations.length > 0 && (
        <div
          className="rounded-xl border"
          style={{
            marginBottom: 20,
            padding: "12px 18px",
            background: "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 50%, #FEF2F2 100%)",
            borderColor: "rgba(251, 191, 36, 0.25)",
          }}
        >
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <div className="w-1 h-3.5 rounded-full" style={{ background: "linear-gradient(to bottom, #F59E0B, #EF4444)" }} />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggested Focus</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5"
                style={{
                  padding: "6px 0",
                  borderTop: i > 0 ? "1px solid rgba(251, 191, 36, 0.12)" : "none",
                }}
              >
                <div
                  className="flex-shrink-0 rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: rec.urgency === "high" ? "#DC2626" : "#D97706",
                  }}
                />
                <span className="text-[13px] text-gray-700 truncate flex-1 min-w-0">{rec.text}</span>
                <span className="text-[11px] text-gray-400 flex-shrink-0 hidden sm:block">{rec.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rocks — compact horizontal cards */}
      <div style={{ marginBottom: 20 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
          <div className="w-1 h-3.5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rocks</span>
          <span className="text-xs text-gray-300">{sorted.length}</span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4" style={{ gap: 10 }}>
          {sorted.map((rock) => {
            const p = pct(rock);
            const days = daysUntil(rock.due);
            const urg = urgencyLabel(urgencyScore(rock));

            return (
              <div
                key={rock.id}
                onClick={() => { setExpRock(rock.id); setView("rocks"); }}
                className="bg-white rounded-xl border border-gray-200/70 cursor-pointer transition-all duration-150 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 flex flex-col"
                style={{ padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase">{rock.biz}</span>
                  <Badge variant={URG_VARIANT[urg.text] || "gray"} size="sm">{urg.text}</Badge>
                </div>
                <div className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2 flex-1" style={{ minHeight: 36 }}>
                  {rock.name || "(unnamed)"}
                </div>
                <div style={{ marginTop: 10 }}>
                  <ProgressBar value={p} color={STATUS_COLOR[rock.status] || "#10B981"} size="sm" showLabel />
                </div>
                <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[rock.status] || "#10B981" }} />
                    <span className="text-[10px] font-medium text-gray-400">{rock.status}</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${days < 0 ? "text-red-500" : days <= 7 ? "text-amber-500" : "text-gray-400"}`}>
                    {days > 0 ? `${days}d` : days === 0 ? "Today" : `${Math.abs(days)}d over`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom row: Priorities + Todos side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
        {/* Top 3 Priorities */}
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
            <div className="w-1 h-3.5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top 3 Priorities</span>
          </div>
          <div
            className="rounded-xl border border-indigo-100/60 shadow-sm"
            style={{
              padding: "14px 20px",
              background: "linear-gradient(135deg, rgba(238,242,255,0.5) 0%, #FFFFFF 50%, rgba(245,243,255,0.3) 100%)",
            }}
          >
            {data.todayPriorities.map((p: Priority, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{
                  padding: "8px 0",
                  borderTop: i > 0 ? "1px solid rgba(99,102,241,0.08)" : "none",
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
                <span className="text-xs font-bold text-indigo-300 w-4 text-center select-none flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  value={p.text}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => { d.todayPriorities[i].text = v; });
                  }}
                  placeholder="What matters most?"
                  className={[
                    "flex-1 min-w-0 bg-transparent text-[14px] py-0.5",
                    "focus:outline-none placeholder:text-gray-300",
                    p.done ? "line-through text-gray-400" : "text-gray-800",
                  ].join(" ")}
                />
              </div>
            ))}
          </div>
        </div>

        {/* To-Do */}
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
            <div className="w-1 h-3.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To-Do</span>
            {data.todos.length > 0 && (
              <span className="text-[10px] text-gray-300">
                {data.todos.filter((t) => t.done).length}/{data.todos.length}
              </span>
            )}
            <div className="ml-auto">
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
          <div
            className="rounded-xl border border-amber-100/60 shadow-sm"
            style={{
              padding: "14px 20px",
              background: "linear-gradient(135deg, rgba(255,251,235,0.4) 0%, #FFFFFF 50%, rgba(255,247,237,0.3) 100%)",
            }}
          >
            {data.todos.length === 0 ? (
              <div className="text-center" style={{ padding: "16px 0" }}>
                <p className="text-xs text-gray-400">No to-dos yet.</p>
              </div>
            ) : (
              <div>
                {data.todos.map((todo, i) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 group"
                    style={{
                      padding: "6px 0",
                      opacity: todo.done ? 0.5 : 1,
                      borderTop: i > 0 ? "1px solid rgba(245,158,11,0.08)" : "none",
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
        </div>
      </div>
    </div>
  );
}
