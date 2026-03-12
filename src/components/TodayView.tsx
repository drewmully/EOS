"use client";

import confetti from "canvas-confetti";
import { UserData, UserProfile, Priority } from "@/lib/types";
import { uid, daysUntil, pct, urgencyScore, urgencyLabel } from "@/lib/utils";
import { Card } from "./ui/Card";
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
}

export function TodayView({ data, user, update, setView, setExpRock }: Props) {
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";
  const sorted = [...data.rocks].sort((a, b) => urgencyScore(b) - urgencyScore(a));

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Good {greeting},{" "}
          <span style={{ color: user.color }}>{user.name}</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Here&apos;s what needs your attention.</p>
      </div>

      {/* Rock Cards */}
      <section className="mb-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Rocks</h2>
          <span className="text-xs text-gray-300">{sorted.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {sorted.map((rock) => {
            const p = pct(rock);
            const days = daysUntil(rock.due);
            const urg = urgencyLabel(urgencyScore(rock));

            return (
              <Card
                key={rock.id}
                hoverable
                onClick={() => { setExpRock(rock.id); setView("rocks"); }}
                padding="lg"
                className="flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{rock.biz}</span>
                  <Badge variant={URG_VARIANT[urg.text] || "gray"} size="sm">{urg.text}</Badge>
                </div>

                <h3 className="text-[15px] font-semibold text-gray-900 leading-snug mb-auto min-h-[44px] line-clamp-2">
                  {rock.name || "(unnamed)"}
                </h3>

                <div className="mt-5">
                  <ProgressBar value={p} color={STATUS_COLOR[rock.status] || "#10B981"} size="sm" showLabel />
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: STATUS_COLOR[rock.status] || "#10B981" }}
                    />
                    <span className="text-xs font-medium text-gray-500">{rock.status}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      days < 0 ? "text-red-500" : days <= 7 ? "text-amber-500" : "text-gray-400"
                    }`}
                  >
                    {days > 0 ? `${days}d left` : days === 0 ? "Due today" : `${Math.abs(days)}d over`}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Top 3 Priorities — full width, distinct */}
      <section className="mb-8">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Top 3 Priorities</h2>
        </div>
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 rounded-2xl border border-indigo-100/60 shadow-sm px-8 py-6">
          <div className="space-y-0">
            {data.todayPriorities.map((p: Priority, i: number) => (
              <div
                key={i}
                className="flex items-center gap-4 py-3.5"
                style={{ borderTop: i > 0 ? "1px solid rgba(99,102,241,0.1)" : "none" }}
              >
                <Checkbox
                  checked={p.done}
                  onChange={() => {
                    const wasDone = p.done;
                    update((d) => { d.todayPriorities[i].done = !wasDone; });
                    if (!wasDone && p.text) fireMini();
                  }}
                />
                <span className="text-sm font-bold text-indigo-300 w-5 text-center select-none flex-shrink-0">
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
                    "flex-1 min-w-0 bg-transparent text-[15px] py-0.5",
                    "focus:outline-none placeholder:text-gray-300",
                    p.done ? "line-through text-gray-400" : "text-gray-800",
                  ].join(" ")}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* To-Do — full width, distinct */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">To-Do</h2>
          {data.todos.length > 0 && (
            <span className="text-xs text-gray-300">
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
        <div className="bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 rounded-2xl border border-amber-100/60 shadow-sm px-8 py-6">
          {data.todos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No to-dos yet.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {data.todos.map((todo, i) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-4 py-3 group"
                  style={{ opacity: todo.done ? 0.5 : 1, borderTop: i > 0 ? "1px solid rgba(245,158,11,0.1)" : "none" }}
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
                      "flex-1 min-w-0 bg-transparent text-[15px] py-0.5 focus:outline-none",
                      "placeholder:text-gray-300",
                      todo.done ? "line-through text-gray-400" : "text-gray-800",
                    ].join(" ")}
                  />
                  <input
                    type="date"
                    value={todo.due}
                    onChange={(e) => { const v = e.target.value; update((d) => { d.todos[i].due = v; }); }}
                    className="hidden sm:block w-28 bg-transparent text-xs text-gray-400 focus:outline-none cursor-pointer"
                  />
                  <button
                    onClick={() => update((d) => { d.todos.splice(i, 1); })}
                    className="w-7 h-7 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-100 cursor-pointer flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
