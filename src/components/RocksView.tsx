"use client";

import confetti from "canvas-confetti";
import { UserData, UserProfile, Rock } from "@/lib/types";
import { uid, daysUntil, pct, urgencyScore, urgencyLabel } from "@/lib/utils";
import { Badge } from "./ui/Badge";
import { ProgressRing } from "./ui/ProgressRing";
import { Checkbox } from "./ui/Checkbox";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { IconPlus, IconChevron } from "./ui/Icons";

const STATUS_COLOR: Record<string, string> = {
  "On Track": "#10B981",
  "At Risk": "#F59E0B",
  "Off Track": "#EF4444",
  Done: "#6366F1",
};

const STATUS_BG: Record<string, string> = {
  "On Track": "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)",
  "At Risk": "linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)",
  "Off Track": "linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)",
  Done: "linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%)",
};

const URG_VARIANT: Record<string, "red" | "amber" | "emerald" | "blue"> = {
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
  const totalPct = data.rocks.length > 0
    ? Math.round(data.rocks.reduce((sum, r) => sum + pct(r), 0) / data.rocks.length)
    : 0;

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 32 }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          <span style={{ color: user.color }}>{user.name}&apos;s</span> Rocks
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-gray-400">Q2 2026</p>
          <span className="text-xs text-gray-300">|</span>
          <p className="text-sm text-gray-400">{data.rocks.length} rocks &middot; {totalPct}% avg completion</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.rocks.map((rock, ri) => {
          const open = expRock === rock.id;
          const p = pct(rock);
          const days = daysUntil(rock.due);
          const urg = urgencyLabel(urgencyScore(rock));
          const ringColor = STATUS_COLOR[rock.status] || "#10B981";

          return (
            <div
              key={rock.id}
              className="rounded-2xl overflow-hidden transition-all duration-200 border"
              style={{
                background: open ? (STATUS_BG[rock.status] || "#FFFFFF") : "#FFFFFF",
                borderColor: open ? (STATUS_COLOR[rock.status] || "#E5E7EB") + "40" : "rgba(229,231,235,0.7)",
                boxShadow: open
                  ? `0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px ${STATUS_COLOR[rock.status] || "#E5E7EB"}20`
                  : "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              {/* Header */}
              <div
                onClick={() => setExpRock(open ? null : rock.id)}
                className="flex items-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                style={{ gap: 16, padding: "18px 24px" }}
              >
                <ProgressRing value={p} color={ringColor} size={44} strokeWidth={3.5} />

                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold text-gray-900 truncate">
                    {rock.name || "(click to name)"}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant={rock.biz === "MFS" ? "teal" : "orange"} size="sm">{rock.biz}</Badge>
                    <Badge variant={URG_VARIANT[urg.text] || "gray"} size="sm">{urg.text}</Badge>
                    <span
                      className={`text-xs font-medium ${days < 0 ? "text-red-500" : days <= 7 ? "text-amber-500" : "text-gray-400"}`}
                    >
                      {days > 0 ? `${days}d left` : days === 0 ? "Due today" : `${Math.abs(days)}d over`}
                    </span>
                  </div>
                </div>

                <select
                  value={rock.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => { d.rocks[ri].status = v as Rock["status"]; });
                    if (v === "Done") fireBig();
                  }}
                  className="hidden sm:block text-xs font-medium rounded-lg px-3 py-1.5 border border-gray-200 bg-white cursor-pointer hover:border-gray-300 transition-colors focus:outline-none"
                >
                  {["On Track", "At Risk", "Off Track", "Done"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>

                <div className={`text-gray-300 transition-transform duration-150 flex-shrink-0 ${open ? "rotate-180" : ""}`}>
                  <IconChevron className="w-4 h-4" />
                </div>
              </div>

              {/* Expanded */}
              {open && (
                <div className="animate-fadeIn" style={{ borderTop: "1px solid #F3F4F6", padding: "24px 24px" }}>
                  <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 16, marginBottom: 24 }}>
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
                      <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                        Business
                      </label>
                      <select
                        value={rock.biz}
                        onChange={(e) => { const v = e.target.value; update((d) => { d.rocks[ri].biz = v as Rock["biz"]; }); }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 cursor-pointer hover:border-gray-300 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                      >
                        <option>MFS</option>
                        <option>Mully</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Subtasks &middot; {rock.subtasks.filter((s) => s.done).length}/{rock.subtasks.length}
                    </span>
                  </div>

                  <div
                    className="rounded-xl border border-gray-100"
                    style={{ background: "rgba(249,250,251,0.5)", padding: "4px 16px" }}
                  >
                    {rock.subtasks.map((st, si) => (
                      <div
                        key={st.id}
                        className="flex items-center gap-3 group"
                        style={{
                          padding: "10px 0",
                          borderTop: si > 0 ? "1px solid #F3F4F6" : "none",
                        }}
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
                            "flex-1 min-w-0 bg-transparent text-[14px] py-0.5 focus:outline-none placeholder:text-gray-300",
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
                          className="hidden sm:block w-28 bg-transparent text-xs text-gray-400 focus:outline-none cursor-pointer"
                        />
                        <button
                          onClick={() => update((d) => { d.rocks[ri].subtasks.splice(si, 1); })}
                          className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-100 cursor-pointer flex-shrink-0"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
                    className="w-full border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 font-medium hover:text-gray-600 hover:border-gray-300 transition-colors duration-100 cursor-pointer"
                    style={{ marginTop: 12, padding: "10px 0" }}
                  >
                    + Add subtask
                  </button>

                  <div className="flex justify-end" style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #F3F4F6" }}>
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

      <button
        onClick={() => {
          const id = uid();
          update((d) => {
            d.rocks.push({ id, name: "", biz: "MFS", due: "2026-06-30", status: "On Track", subtasks: [] });
          });
          setExpRock(id);
        }}
        className="w-full border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 font-semibold hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5"
        style={{ marginTop: 16, padding: "18px 0" }}
      >
        <IconPlus className="w-4 h-4" />
        Add Rock
      </button>
    </div>
  );
}
