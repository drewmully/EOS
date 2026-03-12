"use client";

import confetti from "canvas-confetti";
import { UserData, UserProfile, Rock } from "@/lib/types";
import { uid, daysUntil, pct, fmtDate, urgencyScore, urgencyLabel } from "@/lib/utils";
import { Badge } from "./ui/Badge";
import { ProgressRing } from "./ui/ProgressRing";
import { Checkbox } from "./ui/Checkbox";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { IconPlus, IconChevron } from "./ui/Icons";

const STATUS_RING: Record<string, string> = {
  "On Track": "#22C55E",
  "At Risk": "#F59E0B",
  "Off Track": "#EF4444",
  Done: "#6366F1",
};

const BIZ_VARIANT: Record<string, "teal" | "orange"> = { MFS: "teal", Mully: "orange" };
const URG_MAP: Record<string, "red" | "amber" | "emerald" | "blue"> = {
  "PUSH NOW": "red",
  "NEEDS FOCUS": "amber",
  "ON PACE": "emerald",
  CRUISING: "blue",
};

function fireBig() {
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ["#10B981", "#6366F1", "#F59E0B", "#22C55E"] });
}
function fireMini() {
  confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, startVelocity: 20, colors: ["#10B981", "#22C55E"] });
}

interface Props {
  data: UserData;
  update: (fn: (d: UserData) => void) => void;
  expRock: string | null;
  setExpRock: (id: string | null) => void;
  user: UserProfile;
}

export function RocksView({ data, update, expRock, setExpRock, user }: Props) {
  return (
    <div className="animate-fadeSlideUp">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">
          {user.name}&apos;s Rocks
        </h1>
        <p className="text-[15px] text-gray-400 mt-1.5">Q2 2026 &middot; Click to expand and edit</p>
      </div>

      <div className="space-y-4">
        {data.rocks.map((rock, ri) => {
          const open = expRock === rock.id;
          const p = pct(rock);
          const days = daysUntil(rock.due);
          const urg = urgencyLabel(urgencyScore(rock));
          const ringColor = STATUS_RING[rock.status] || "#22C55E";

          return (
            <div
              key={rock.id}
              className={[
                "bg-white rounded-2xl overflow-hidden transition-all duration-200 border",
                open
                  ? "border-gray-300 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
                  : "border-gray-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 hover:border-gray-300",
              ].join(" ")}
            >
              {/* Collapsed Header */}
              <div
                onClick={() => setExpRock(open ? null : rock.id)}
                className="flex items-center gap-4 px-5 sm:px-6 py-4 cursor-pointer transition-colors duration-150 hover:bg-gray-50/50"
              >
                <ProgressRing value={p} color={ringColor} size={48} strokeWidth={4.5} />

                <div className="flex-1 min-w-0">
                  <div className="text-[15px] sm:text-[16px] font-semibold text-gray-900 truncate leading-snug">
                    {rock.name || "(click to name)"}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant={BIZ_VARIANT[rock.biz] || "gray"} size="sm">{rock.biz}</Badge>
                    <Badge variant={URG_MAP[urg.text] || "gray"} size="sm">{urg.text}</Badge>
                    <span
                      className={`text-[12px] font-medium ${
                        days < 0 ? "text-red-500" : "text-gray-400"
                      }`}
                    >
                      Due {fmtDate(rock.due)} &middot;{" "}
                      {days > 0 ? `${days}d` : days === 0 ? "Today" : `${Math.abs(days)}d overdue`}
                    </span>
                  </div>
                </div>

                {/* Status dropdown */}
                <select
                  value={rock.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => { d.rocks[ri].status = v as Rock["status"]; });
                    if (v === "Done") fireBig();
                  }}
                  className="hidden sm:block text-[12px] font-semibold rounded-xl px-3 py-2 border border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {["On Track", "At Risk", "Off Track", "Done"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>

                {/* Chevron */}
                <div
                  className={`text-gray-300 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
                >
                  <IconChevron className="w-5 h-5" />
                </div>
              </div>

              {/* Expanded Panel */}
              {open && (
                <div className="border-t border-gray-100 px-5 sm:px-6 py-6 animate-fadeSlideUp">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <Input
                      label="Rock Name"
                      value={rock.name}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.rocks[ri].name = v; }); }}
                    />
                    <Input
                      label="Due Date"
                      type="date"
                      value={rock.due}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.rocks[ri].due = v; }); }}
                    />
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Business
                      </label>
                      <select
                        value={rock.biz}
                        onChange={(e) => { const v = e.target.value; update((d) => { d.rocks[ri].biz = v as Rock["biz"]; }); }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-800 cursor-pointer hover:border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                      >
                        <option>MFS</option>
                        <option>Mully</option>
                      </select>
                    </div>
                  </div>

                  {/* Subtasks */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Subtasks &middot; {rock.subtasks.filter((s) => s.done).length}/{rock.subtasks.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {rock.subtasks.map((st, si) => (
                      <div
                        key={st.id}
                        className="flex items-center gap-3.5 py-3 px-3 -mx-3 rounded-xl group hover:bg-gray-50 transition-colors duration-150"
                      >
                        <Checkbox
                          size="sm"
                          checked={st.done}
                          onChange={() => {
                            const wasDone = st.done;
                            update((d) => { d.rocks[ri].subtasks[si].done = !wasDone; });
                            if (!wasDone) fireMini();
                            const allDone = data.rocks[ri].subtasks.every(
                              (s, idx) => (idx === si ? !wasDone : s.done)
                            );
                            if (allDone && !wasDone) setTimeout(fireBig, 300);
                          }}
                        />
                        <input
                          value={st.text}
                          onChange={(e) => {
                            const v = e.target.value;
                            update((d) => { d.rocks[ri].subtasks[si].text = v; });
                          }}
                          placeholder="Subtask..."
                          className={[
                            "flex-1 bg-transparent text-[15px] py-0.5 focus:outline-none placeholder:text-gray-300",
                            st.done ? "line-through text-gray-400" : "text-gray-700",
                          ].join(" ")}
                        />
                        <input
                          type="date"
                          value={st.due}
                          onChange={(e) => {
                            const v = e.target.value;
                            update((d) => { d.rocks[ri].subtasks[si].due = v; });
                          }}
                          className="w-32 bg-transparent text-[13px] text-gray-400 py-0.5 focus:outline-none cursor-pointer"
                        />
                        <button
                          onClick={() => update((d) => { d.rocks[ri].subtasks.splice(si, 1); })}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      update((d) => {
                        d.rocks[ri].subtasks.push({ id: uid(), text: "", due: "", done: false });
                      })
                    }
                    className="w-full mt-4 border-2 border-dashed border-gray-200 rounded-xl py-3.5 text-sm text-gray-400 font-medium hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-150 cursor-pointer"
                  >
                    + Add subtask
                  </button>

                  {/* Delete Rock */}
                  <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this rock and all its subtasks?")) {
                          update((d) => { d.rocks.splice(ri, 1); });
                          setExpRock(null);
                        }
                      }}
                    >
                      Delete Rock
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Rock */}
      <button
        onClick={() => {
          const id = uid();
          update((d) => {
            d.rocks.push({ id, name: "", biz: "MFS", due: "2026-06-30", status: "On Track", subtasks: [] });
          });
          setExpRock(id);
        }}
        className="w-full mt-5 border-2 border-dashed border-gray-200 rounded-2xl py-5 text-[15px] text-gray-400 font-semibold hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
      >
        <IconPlus className="w-5 h-5" />
        Add New Rock
      </button>
    </div>
  );
}
