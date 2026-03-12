"use client";

import confetti from "canvas-confetti";
import { UserData, UserProfile, GrowthAction } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Card } from "./ui/Card";
import { Checkbox } from "./ui/Checkbox";
import { Button } from "./ui/Button";
import { IconPlus } from "./ui/Icons";

function fireMini() {
  confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, startVelocity: 20, colors: ["#10B981", "#6366F1"] });
}

interface Props {
  data: UserData;
  update: (fn: (d: UserData) => void) => void;
  user: UserProfile;
}

const CV_KEYS: { key: "serveFirst" | "moveTheMission" | "winTogether" | "liveTheStandard" | "tellTheTruth" | "choosePositive"; label: string }[] = [
  { key: "serveFirst", label: "Serve First" },
  { key: "moveTheMission", label: "Move Mission" },
  { key: "winTogether", label: "Win Together" },
  { key: "liveTheStandard", label: "Live Standard" },
  { key: "tellTheTruth", label: "Tell Truth" },
  { key: "choosePositive", label: "Choose Positive" },
];

function ratingColor(v: string): string {
  if (v === "+") return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (v === "+/-") return "text-amber-600 bg-amber-50 border-amber-200";
  if (v === "-") return "text-red-600 bg-red-50 border-red-200";
  return "text-gray-500 bg-gray-50 border-gray-200";
}

function gwcColor(v: string): string {
  if (v === "Y") return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (v === "N") return "text-red-600 bg-red-50 border-red-200";
  return "text-gray-500 bg-gray-50 border-gray-200";
}

export function GrowthView({ data, update, user }: Props) {
  const cv = data.growth.coreValues;
  const gwc = data.growth.gwc;

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{user.name}&apos;s Growth</h1>
        <p className="text-sm text-gray-400 mt-1">Core values, GWC, and action plans</p>
      </div>

      {/* Core Values */}
      <Card className="mb-3" padding="lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Core Values</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CV_KEYS.map(({ key, label }) => (
            <div key={key} className="text-center">
              <div className="text-[10px] font-medium text-gray-400 mb-1.5 leading-tight h-6 flex items-end justify-center">
                {label}
              </div>
              <select
                value={cv[key]}
                onChange={(e) => {
                  const v = e.target.value;
                  update((d) => { d.growth.coreValues[key] = v; });
                }}
                className={`w-full text-center text-sm font-semibold rounded-lg py-2 border cursor-pointer transition-colors focus:outline-none ${ratingColor(cv[key])}`}
              >
                <option>+</option>
                <option>+/-</option>
                <option>-</option>
              </select>
            </div>
          ))}
        </div>
      </Card>

      {/* GWC */}
      <Card className="mb-3" padding="lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">GWC</h3>
        <div className="grid grid-cols-3 gap-3 max-w-xs">
          {(["g", "w", "c"] as const).map((key) => {
            const labels = { g: "Get It", w: "Want It", c: "Capacity" };
            return (
              <div key={key} className="text-center">
                <div className="text-[10px] font-medium text-gray-400 mb-1.5">{labels[key]}</div>
                <select
                  value={gwc[key]}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => { d.growth.gwc[key] = v; });
                  }}
                  className={`w-full text-center text-sm font-semibold rounded-lg py-2 border cursor-pointer transition-colors focus:outline-none ${gwcColor(gwc[key])}`}
                >
                  <option>Y</option>
                  <option>N</option>
                </select>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Strengths</h3>
          {data.growth.strengths.map((s, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5 group">
              <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
              <input
                value={s}
                onChange={(e) => { const v = e.target.value; update((d) => { d.growth.strengths[i] = v; }); }}
                className="flex-1 min-w-0 text-sm bg-transparent focus:outline-none text-gray-700 py-0.5"
              />
              <button
                onClick={() => update((d) => { d.growth.strengths.splice(i, 1); })}
                className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs flex-shrink-0"
              >
                x
              </button>
            </div>
          ))}
          <button
            onClick={() => update((d) => { d.growth.strengths.push(""); })}
            className="text-xs text-gray-400 hover:text-gray-600 font-medium mt-1 cursor-pointer transition-colors"
          >
            + Add
          </button>
        </Card>

        <Card padding="lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Areas to Improve</h3>
          {data.growth.weaknesses.map((w, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5 group">
              <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
              <input
                value={w}
                onChange={(e) => { const v = e.target.value; update((d) => { d.growth.weaknesses[i] = v; }); }}
                className="flex-1 min-w-0 text-sm bg-transparent focus:outline-none text-gray-700 py-0.5"
              />
              <button
                onClick={() => update((d) => { d.growth.weaknesses.splice(i, 1); })}
                className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs flex-shrink-0"
              >
                x
              </button>
            </div>
          ))}
          <button
            onClick={() => update((d) => { d.growth.weaknesses.push(""); })}
            className="text-xs text-gray-400 hover:text-gray-600 font-medium mt-1 cursor-pointer transition-colors"
          >
            + Add
          </button>
        </Card>
      </div>

      {/* Action Plans */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Growth Actions</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              update((d) => {
                d.growth.actions.push({ id: uid(), area: "", action: "", due: "", done: false });
              })
            }
            icon={<IconPlus className="w-3 h-3" />}
          >
            Add
          </Button>
        </div>

        {data.growth.actions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No action plans yet.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {data.growth.actions.map((action: GrowthAction, i: number) => (
              <div key={action.id} className="flex items-start gap-2.5 py-2.5 group" style={{ borderTop: i > 0 ? "1px solid #F3F4F6" : "none" }}>
                <Checkbox
                  size="sm"
                  checked={action.done}
                  onChange={() => {
                    const wasDone = action.done;
                    update((d) => { d.growth.actions[i].done = !wasDone; });
                    if (!wasDone) fireMini();
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      value={action.area}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].area = v; }); }}
                      placeholder="Area"
                      className="w-28 text-[11px] font-medium bg-gray-50 text-gray-600 rounded-md px-2 py-1 border border-gray-200 hover:border-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
                    />
                    <input
                      type="date"
                      value={action.due}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].due = v; }); }}
                      className="text-[11px] text-gray-400 bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>
                  <input
                    value={action.action}
                    onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].action = v; }); }}
                    placeholder="What's the action?"
                    className={[
                      "w-full text-sm bg-transparent focus:outline-none py-0.5",
                      action.done ? "line-through text-gray-400" : "text-gray-700",
                    ].join(" ")}
                  />
                </div>
                <button
                  onClick={() => update((d) => { d.growth.actions.splice(i, 1); })}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-100 cursor-pointer mt-0.5 flex-shrink-0"
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
  );
}
