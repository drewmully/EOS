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
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Good {greeting}, {user.name}
        </h1>
        <p className="text-sm text-gray-400 mt-1">Here&apos;s what needs your attention.</p>
      </div>

      {/* Rock Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((rock) => {
            const p = pct(rock);
            const days = daysUntil(rock.due);
            const urg = urgencyLabel(urgencyScore(rock));

            return (
              <Card
                key={rock.id}
                hoverable
                onClick={() => { setExpRock(rock.id); setView("rocks"); }}
                padding="md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-medium text-gray-400">{rock.biz}</span>
                  <Badge variant={URG_VARIANT[urg.text] || "gray"} size="sm">{urg.text}</Badge>
                </div>

                <h3 className="text-sm font-medium text-gray-900 leading-snug mb-3 min-h-[36px] line-clamp-2">
                  {rock.name || "(unnamed)"}
                </h3>

                <ProgressBar value={p} color={STATUS_COLOR[rock.status] || "#10B981"} size="sm" showLabel />

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: STATUS_COLOR[rock.status] || "#10B981" }}
                    />
                    <span className="text-[11px] text-gray-400">{rock.status}</span>
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
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

      {/* Priorities + To-dos side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Top 3 Priorities */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top 3 Priorities</h3>
          <div className="space-y-0">
            {data.todayPriorities.map((p: Priority, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2.5"
                style={{ borderTop: i > 0 ? "1px solid #F3F4F6" : "none" }}
              >
                <Checkbox
                  checked={p.done}
                  onChange={() => {
                    const wasDone = p.done;
                    update((d) => { d.todayPriorities[i].done = !wasDone; });
                    if (!wasDone && p.text) fireMini();
                  }}
                />
                <span className="text-xs font-semibold text-gray-300 w-4 text-center select-none flex-shrink-0">
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
                    "flex-1 min-w-0 bg-transparent text-sm py-0.5",
                    "focus:outline-none placeholder:text-gray-300",
                    p.done ? "line-through text-gray-400" : "text-gray-700",
                  ].join(" ")}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* To-Do List */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">To-Do</h3>
              {data.todos.length > 0 && (
                <span className="text-xs text-gray-400">
                  {data.todos.filter((t) => t.done).length}/{data.todos.length}
                </span>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => update((d) => { d.todos.push({ id: uid(), text: "", due: "", done: false }); })}
              icon={<IconPlus className="w-3 h-3" />}
            >
              Add
            </Button>
          </div>

          {data.todos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No to-dos yet.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {data.todos.map((todo, i) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-2.5 py-2 group"
                  style={{ opacity: todo.done ? 0.5 : 1 }}
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
                      "flex-1 min-w-0 bg-transparent text-sm py-0.5 focus:outline-none",
                      "placeholder:text-gray-300",
                      todo.done ? "line-through text-gray-400" : "text-gray-700",
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
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-100 cursor-pointer flex-shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
