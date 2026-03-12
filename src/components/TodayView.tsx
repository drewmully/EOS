"use client";

import confetti from "canvas-confetti";
import { UserData, UserProfile, Priority } from "@/lib/types";
import { uid, daysUntil, pct, urgencyScore, urgencyLabel, getRecommendations } from "@/lib/utils";
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
  const recommendations = getRecommendations(data);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Good {greeting},{" "}
          <span style={{ color: user.color }}>{user.name}</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Here&apos;s what needs your attention.</p>
      </div>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div className="flex items-center gap-2.5" style={{ marginBottom: 16 }}>
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #F59E0B, #EF4444)" }} />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Suggested Focus</h2>
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200/50 rounded-full" style={{ padding: "2px 10px" }}>
              Smart
            </span>
          </div>
          <div
            className="rounded-2xl border shadow-sm"
            style={{
              padding: "20px 28px",
              background: "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 50%, #FEF2F2 100%)",
              borderColor: "rgba(251, 191, 36, 0.3)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3"
                  style={{
                    padding: "12px 0",
                    borderTop: i > 0 ? "1px solid rgba(251, 191, 36, 0.15)" : "none",
                  }}
                >
                  <div
                    className="flex-shrink-0 rounded-full flex items-center justify-center"
                    style={{
                      width: 24,
                      height: 24,
                      marginTop: 1,
                      background:
                        rec.urgency === "high" ? "#FEE2E2"
                        : rec.urgency === "medium" ? "#FEF3C7"
                        : "#DCFCE7",
                    }}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke={
                        rec.urgency === "high" ? "#DC2626"
                        : rec.urgency === "medium" ? "#D97706"
                        : "#16A34A"
                      }
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      {rec.urgency === "high" ? (
                        <path strokeLinecap="round" d="M12 9v4m0 4h.01M12 3l9.5 16.5H2.5L12 3z" />
                      ) : (
                        <path strokeLinecap="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-gray-800 leading-snug">{rec.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{rec.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rock Cards */}
      <section style={{ marginBottom: 40 }}>
        <div className="flex items-center gap-2.5" style={{ marginBottom: 16 }}>
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Rocks</h2>
          <span className="text-xs text-gray-300">{sorted.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ gap: 20 }}>
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
                <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{rock.biz}</span>
                  <Badge variant={URG_VARIANT[urg.text] || "gray"} size="sm">{urg.text}</Badge>
                </div>

                <h3 className="text-[15px] font-semibold text-gray-900 leading-snug mb-auto line-clamp-2" style={{ minHeight: 44 }}>
                  {rock.name || "(unnamed)"}
                </h3>

                <div style={{ marginTop: 18 }}>
                  <ProgressBar value={p} color={STATUS_COLOR[rock.status] || "#10B981"} size="sm" showLabel />
                </div>

                <div className="flex items-center justify-between" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #F3F4F6" }}>
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

      {/* Top 3 Priorities */}
      <section style={{ marginBottom: 36 }}>
        <div className="flex items-center gap-2.5" style={{ marginBottom: 16 }}>
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Top 3 Priorities</h2>
        </div>
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 rounded-2xl border border-indigo-100/60 shadow-sm" style={{ padding: "24px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {data.todayPriorities.map((p: Priority, i: number) => (
              <div
                key={i}
                className="flex items-center gap-4"
                style={{
                  padding: "14px 0",
                  borderTop: i > 0 ? "1px solid rgba(99,102,241,0.1)" : "none",
                }}
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

      {/* To-Do */}
      <section>
        <div className="flex items-center gap-2.5" style={{ marginBottom: 16 }}>
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
        <div className="bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 rounded-2xl border border-amber-100/60 shadow-sm" style={{ padding: "24px 32px" }}>
          {data.todos.length === 0 ? (
            <div className="text-center" style={{ padding: "32px 0" }}>
              <p className="text-sm text-gray-400">No to-dos yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {data.todos.map((todo, i) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-4 group"
                  style={{
                    padding: "12px 0",
                    opacity: todo.done ? 0.5 : 1,
                    borderTop: i > 0 ? "1px solid rgba(245,158,11,0.1)" : "none",
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
