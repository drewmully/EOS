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
  { key: "moveTheMission", label: "Move the Mission" },
  { key: "winTogether", label: "Win Together" },
  { key: "liveTheStandard", label: "Live the Standard" },
  { key: "tellTheTruth", label: "Tell the Truth" },
  { key: "choosePositive", label: "Choose Positive" },
];

function ratingStyle(v: string): string {
  if (v === "+") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (v === "+/-") return "bg-amber-50 text-amber-700 border-amber-200";
  if (v === "-") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function gwcStyle(v: string): string {
  if (v === "Y") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (v === "N") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

export function GrowthView({ data, update, user }: Props) {
  const cv = data.growth.coreValues;
  const gwc = data.growth.gwc;

  const weakCount = Object.values(cv).filter((v) => v !== "+").length;
  const gwcIssues = Object.values(gwc).filter((v) => v === "N").length;

  return (
    <div className="animate-fadeSlideUp">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">{user.name}&apos;s Growth</h1>
        <p className="text-[16px] text-gray-400 mt-2">Core values, GWC, strengths, and action plans</p>
      </div>

      {/* Alert */}
      {(data.seats.length >= 2 || weakCount >= 3 || gwcIssues >= 1) && (
        <Card className="mb-6 !bg-amber-50 !border-amber-200/60" padding="md">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-amber-800">Areas Needing Attention</p>
              <div className="text-[14px] text-amber-700/80 mt-1.5 space-y-1">
                {data.seats.length >= 2 && <p>In {data.seats.length} seats — capacity is stretched</p>}
                {weakCount >= 3 && <p>{weakCount} of 6 core values below &quot;+&quot;</p>}
                {gwcIssues >= 1 && <p>{gwcIssues} GWC area(s) at &quot;N&quot; — critical gap</p>}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* People Analyzer — Core Values */}
      <Card className="mb-5" padding="lg">
        <h3 className="text-[17px] font-bold text-gray-800 mb-6">People Analyzer — Core Values</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {CV_KEYS.map(({ key, label }) => (
            <div key={key} className="text-center">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 leading-tight min-h-[28px] flex items-end justify-center">
                {label}
              </div>
              <select
                value={cv[key]}
                onChange={(e) => {
                  const v = e.target.value;
                  update((d) => { d.growth.coreValues[key] = v; });
                }}
                className={`w-full text-center text-[15px] font-bold rounded-xl py-3.5 border cursor-pointer transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${ratingStyle(cv[key])}`}
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
      <Card className="mb-5" padding="lg">
        <h3 className="text-[17px] font-bold text-gray-800 mb-6">GWC — Get It, Want It, Capacity</h3>
        <div className="grid grid-cols-3 gap-5 max-w-md">
          {(["g", "w", "c"] as const).map((key) => {
            const labels = { g: "Get It", w: "Want It", c: "Capacity" };
            return (
              <div key={key} className="text-center">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {labels[key]}
                </div>
                <select
                  value={gwc[key]}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => { d.growth.gwc[key] = v; });
                  }}
                  className={`w-full text-center text-[15px] font-bold rounded-xl py-3.5 border cursor-pointer transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${gwcStyle(gwc[key])}`}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <Card padding="lg">
          <h3 className="text-[14px] font-bold text-emerald-600 mb-4 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            Strengths
          </h3>
          {data.growth.strengths.map((s, i) => (
            <div key={i} className="flex items-center gap-3 mb-3 group">
              <span className="w-2 h-2 rounded-full bg-emerald-300 flex-shrink-0" />
              <input
                value={s}
                onChange={(e) => { const v = e.target.value; update((d) => { d.growth.strengths[i] = v; }); }}
                className="flex-1 text-[15px] bg-transparent border-b border-transparent hover:border-gray-200 focus:border-emerald-500 focus:outline-none py-1 text-gray-700 transition-colors"
              />
              <button
                onClick={() => update((d) => { d.growth.strengths.splice(i, 1); })}
                className="w-7 h-7 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-sm"
              >
                x
              </button>
            </div>
          ))}
          <button
            onClick={() => update((d) => { d.growth.strengths.push(""); })}
            className="text-[13px] text-gray-400 hover:text-emerald-600 font-medium mt-2 cursor-pointer transition-colors"
          >
            + Add
          </button>
        </Card>

        <Card padding="lg">
          <h3 className="text-[14px] font-bold text-red-500 mb-4 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            Areas to Improve
          </h3>
          {data.growth.weaknesses.map((w, i) => (
            <div key={i} className="flex items-center gap-3 mb-3 group">
              <span className="w-2 h-2 rounded-full bg-red-300 flex-shrink-0" />
              <input
                value={w}
                onChange={(e) => { const v = e.target.value; update((d) => { d.growth.weaknesses[i] = v; }); }}
                className="flex-1 text-[15px] bg-transparent border-b border-transparent hover:border-gray-200 focus:border-red-500 focus:outline-none py-1 text-gray-700 transition-colors"
              />
              <button
                onClick={() => update((d) => { d.growth.weaknesses.splice(i, 1); })}
                className="w-7 h-7 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-sm"
              >
                x
              </button>
            </div>
          ))}
          <button
            onClick={() => update((d) => { d.growth.weaknesses.push(""); })}
            className="text-[13px] text-gray-400 hover:text-red-500 font-medium mt-2 cursor-pointer transition-colors"
          >
            + Add
          </button>
        </Card>
      </div>

      {/* Action Plans */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l2.5 2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-[17px] font-bold text-gray-800">Growth Action Plans</h3>
          </div>
          <Button
            size="sm"
            onClick={() =>
              update((d) => {
                d.growth.actions.push({ id: uid(), area: "", action: "", due: "", done: false });
              })
            }
            icon={<IconPlus className="w-4 h-4" />}
          >
            Add
          </Button>
        </div>

        {data.growth.actions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[15px] text-gray-400">No action plans yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {data.growth.actions.map((action: GrowthAction, i: number) => (
              <div
                key={action.id}
                className="flex items-start gap-3.5 py-3.5 px-3 -mx-3 rounded-xl group hover:bg-gray-50 transition-colors duration-150"
              >
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
                  <div className="flex items-center gap-2.5 mb-2">
                    <input
                      value={action.area}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].area = v; }); }}
                      placeholder="Area"
                      className="w-40 text-[13px] font-semibold bg-indigo-50 text-indigo-600 rounded-lg px-3 py-1.5 border border-transparent hover:border-indigo-200 focus:border-indigo-400 focus:outline-none transition-colors"
                    />
                    <input
                      type="date"
                      value={action.due}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].due = v; }); }}
                      className="text-[13px] text-gray-400 bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>
                  <input
                    value={action.action}
                    onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].action = v; }); }}
                    placeholder="What's the action?"
                    className={[
                      "w-full text-[15px] bg-transparent border-b border-transparent hover:border-gray-200 focus:border-emerald-500 focus:outline-none py-1 transition-colors",
                      action.done ? "line-through text-gray-400" : "text-gray-700",
                    ].join(" ")}
                  />
                </div>
                <button
                  onClick={() => update((d) => { d.growth.actions.splice(i, 1); })}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer mt-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
