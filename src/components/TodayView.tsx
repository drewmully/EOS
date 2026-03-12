"use client";

import confetti from "canvas-confetti";
import { UserData, UserProfile, Priority } from "@/lib/types";
import { uid, daysUntil, pct, fmtDate, urgencyScore, urgencyLabel } from "@/lib/utils";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { ProgressBar } from "./ui/ProgressBar";
import { Checkbox } from "./ui/Checkbox";
import { Button } from "./ui/Button";
import { IconPlus } from "./ui/Icons";
import { View } from "./Sidebar";

const STATUS_RING: Record<string, string> = {
  "On Track": "#22C55E",
  "At Risk": "#F59E0B",
  "Off Track": "#EF4444",
  Done: "#6366F1",
};

const BIZ_VARIANT: Record<string, "teal" | "orange"> = {
  MFS: "teal",
  Mully: "orange",
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
    <div className="animate-fadeSlideUp">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
            style={{ background: user.color }}
          >
            {user.initials}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Good {greeting}, {user.name}
              </h1>
              {data.streakDays > 1 && (
                <Badge variant="amber" size="md" dot>
                  {data.streakDays} day streak
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-0.5">Here&apos;s what needs your attention.</p>
          </div>
        </div>
      </div>

      {/* Rock Urgency Cards */}
      <div className="mb-8">
        <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-3">
          Your Rocks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sorted.map((rock) => {
            const p = pct(rock);
            const days = daysUntil(rock.due);
            const urg = urgencyLabel(urgencyScore(rock));

            return (
              <Card
                key={rock.id}
                hoverable
                onClick={() => {
                  setExpRock(rock.id);
                  setView("rocks");
                }}
                padding="md"
              >
                {/* Top badges */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={BIZ_VARIANT[rock.biz] || "gray"}>{rock.biz}</Badge>
                  <Badge variant={URG_VARIANT[urg.text] || "gray"}>{urg.text}</Badge>
                </div>

                {/* Name */}
                <h3 className="text-[15px] font-semibold text-gray-900 leading-snug mb-4 min-h-[40px] line-clamp-2">
                  {rock.name || "(unnamed)"}
                </h3>

                {/* Progress */}
                <ProgressBar
                  value={p}
                  color={STATUS_RING[rock.status] || "#22C55E"}
                  size="md"
                  showLabel
                />

                {/* Footer */}
                <div className="flex items-center justify-between mt-3">
                  <Badge
                    variant={
                      rock.status === "On Track"
                        ? "emerald"
                        : rock.status === "At Risk"
                        ? "amber"
                        : rock.status === "Off Track"
                        ? "red"
                        : "indigo"
                    }
                    size="sm"
                    dot
                  >
                    {rock.status}
                  </Badge>
                  <span
                    className={`text-[11px] font-semibold ${
                      days < 0
                        ? "text-red-500"
                        : days <= 7
                        ? "text-amber-500"
                        : "text-gray-400"
                    }`}
                  >
                    {days > 0
                      ? `${days}d left`
                      : days === 0
                      ? "Due today"
                      : `${Math.abs(days)}d overdue`}{" "}
                    &middot; {fmtDate(rock.due)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Top 3 Priorities */}
      <Card className="mb-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-800">Top 3 Priorities</h3>
        </div>
        {data.todayPriorities.map((p: Priority, i: number) => (
          <div
            key={i}
            className="flex items-center gap-4 py-3 group"
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
            <span className="text-sm font-bold text-gray-300 w-5 text-center select-none">
              {i + 1}
            </span>
            <input
              value={p.text}
              onChange={(e) => {
                const v = e.target.value;
                update((d) => { d.todayPriorities[i].text = v; });
              }}
              placeholder="What's most important?"
              className={[
                "flex-1 bg-transparent text-sm py-1 transition-all duration-150",
                "border-b-2 border-transparent focus:border-emerald-500 focus:outline-none",
                "placeholder:text-gray-300",
                p.done ? "line-through text-gray-400" : "text-gray-800",
              ].join(" ")}
            />
          </div>
        ))}
      </Card>

      {/* To-Do List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                <rect x="3" y="3" width="18" height="18" rx="4" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-800">To-Do List</h3>
            {data.todos.length > 0 && (
              <span className="text-[11px] text-gray-400 font-medium">
                {data.todos.filter((t) => t.done).length}/{data.todos.length}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => update((d) => { d.todos.push({ id: uid(), text: "", due: "", done: false }); })}
            icon={<IconPlus className="w-3.5 h-3.5" />}
          >
            Add
          </Button>
        </div>

        {data.todos.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">All clear. Add a to-do above.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {data.todos.map((todo, i) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg group hover:bg-gray-50 transition-colors duration-150"
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
                    "flex-1 bg-transparent text-sm py-0.5 focus:outline-none",
                    "placeholder:text-gray-300",
                    todo.done ? "line-through text-gray-400" : "text-gray-700",
                  ].join(" ")}
                />
                <input
                  type="date"
                  value={todo.due}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.todos[i].due = v; }); }}
                  className="w-28 bg-transparent text-[11px] text-gray-400 py-0.5 focus:outline-none cursor-pointer"
                />
                <button
                  onClick={() => update((d) => { d.todos.splice(i, 1); })}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
