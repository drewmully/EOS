"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { UserData, UserProfile, GrowthAction } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Card } from "./ui/Card";
import { Checkbox } from "./ui/Checkbox";
import { Button } from "./ui/Button";
import { IconPlus, IconChevron } from "./ui/Icons";

function fireMini() {
  confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, startVelocity: 20, colors: ["#10B981", "#6366F1"] });
}

interface Props {
  data: UserData;
  update: (fn: (d: UserData) => void) => void;
  user: UserProfile;
}

const CV_KEYS: { key: "serveFirst" | "moveTheMission" | "winTogether" | "liveTheStandard" | "tellTheTruth" | "choosePositive"; label: string; description: string }[] = [
  { key: "serveFirst", label: "Serve First", description: "Put others' needs before your own. Lead with generosity and a servant's heart." },
  { key: "moveTheMission", label: "Move the Mission", description: "Stay focused on the bigger picture. Every action should advance the company forward." },
  { key: "winTogether", label: "Win Together", description: "Collaborate, support, and celebrate each other. We succeed as a team." },
  { key: "liveTheStandard", label: "Live the Standard", description: "Hold yourself to the highest bar. Be the example others aspire to follow." },
  { key: "tellTheTruth", label: "Tell the Truth", description: "Be radically transparent. Honest communication builds trust and drives growth." },
  { key: "choosePositive", label: "Choose Positive", description: "Bring energy and optimism. Attitude is a choice — choose to lift others up." },
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
  const [expandedCV, setExpandedCV] = useState<string | null>(null);

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 32 }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          <span style={{ color: user.color }}>{user.name}&apos;s</span> Growth
        </h1>
        <p className="text-sm text-gray-400 mt-1">Core values, GWC, and action plans</p>
      </div>

      {/* Core Values — Interactive */}
      <div style={{ marginBottom: 20 }}>
      <Card padding="lg">
        <div className="flex items-center gap-2.5" style={{ marginBottom: 16 }}>
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
          <h3 className="text-[15px] font-semibold text-gray-900">Core Values</h3>
          <span className="text-xs text-gray-300 ml-auto">Click to expand</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CV_KEYS.map(({ key, label, description }) => {
            const isExpanded = expandedCV === key;
            return (
              <div
                key={key}
                className="rounded-xl border border-gray-100 transition-all duration-150"
                style={{
                  background: isExpanded ? "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 50%, #FFFFFF 100%)" : "#FAFAFA",
                  overflow: "hidden",
                }}
              >
                <div
                  className="flex items-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                  style={{ padding: "12px 16px", gap: 12 }}
                  onClick={() => setExpandedCV(isExpanded ? null : key)}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-[14px] font-medium text-gray-700 flex-1">{label}</span>
                  <select
                    value={cv[key]}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const v = e.target.value;
                      update((d) => { d.growth.coreValues[key] = v; });
                    }}
                    className={`text-center text-sm font-semibold rounded-lg border cursor-pointer transition-colors focus:outline-none ${ratingColor(cv[key])}`}
                    style={{ width: 56, padding: "4px 0" }}
                  >
                    <option>+</option>
                    <option>+/-</option>
                    <option>-</option>
                  </select>
                  <div className={`text-gray-300 transition-transform duration-150 flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}>
                    <IconChevron className="w-3.5 h-3.5" />
                  </div>
                </div>
                {isExpanded && (
                  <div className="animate-fadeIn" style={{ padding: "0 16px 14px 30px" }}>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      </div>

      {/* GWC */}
      <div style={{ marginBottom: 20 }}>
      <Card padding="lg">
        <div className="flex items-center gap-2.5" style={{ marginBottom: 16 }}>
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
          <h3 className="text-[15px] font-semibold text-gray-900">GWC</h3>
        </div>
        <div className="grid grid-cols-3" style={{ gap: 12, maxWidth: 320 }}>
          {(["g", "w", "c"] as const).map((key) => {
            const labels = { g: "Get It", w: "Want It", c: "Capacity" };
            return (
              <div key={key} className="text-center">
                <div className="text-xs font-medium text-gray-400" style={{ marginBottom: 6 }}>{labels[key]}</div>
                <select
                  value={gwc[key]}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => { d.growth.gwc[key] = v; });
                  }}
                  className={`w-full text-center text-sm font-semibold rounded-lg border cursor-pointer transition-colors focus:outline-none ${gwcColor(gwc[key])}`}
                  style={{ padding: "10px 0" }}
                >
                  <option>Y</option>
                  <option>N</option>
                </select>
              </div>
            );
          })}
        </div>
      </Card>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16, marginBottom: 20 }}>
        <Card padding="lg">
          <div className="flex items-center gap-2.5" style={{ marginBottom: 12 }}>
            <div className="w-1 h-4 rounded-full bg-emerald-400" />
            <h3 className="text-[15px] font-semibold text-gray-900">Strengths</h3>
          </div>
          {data.growth.strengths.map((s, i) => (
            <div key={i} className="flex items-center gap-2 group" style={{ marginBottom: 6 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <input
                value={s}
                onChange={(e) => { const v = e.target.value; update((d) => { d.growth.strengths[i] = v; }); }}
                className="flex-1 min-w-0 text-[14px] bg-transparent focus:outline-none text-gray-700 py-0.5"
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
            className="text-xs text-gray-400 hover:text-gray-600 font-medium cursor-pointer transition-colors"
            style={{ marginTop: 4 }}
          >
            + Add
          </button>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-2.5" style={{ marginBottom: 12 }}>
            <div className="w-1 h-4 rounded-full bg-red-400" />
            <h3 className="text-[15px] font-semibold text-gray-900">Areas to Improve</h3>
          </div>
          {data.growth.weaknesses.map((w, i) => (
            <div key={i} className="flex items-center gap-2 group" style={{ marginBottom: 6 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <input
                value={w}
                onChange={(e) => { const v = e.target.value; update((d) => { d.growth.weaknesses[i] = v; }); }}
                className="flex-1 min-w-0 text-[14px] bg-transparent focus:outline-none text-gray-700 py-0.5"
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
            className="text-xs text-gray-400 hover:text-gray-600 font-medium cursor-pointer transition-colors"
            style={{ marginTop: 4 }}
          >
            + Add
          </button>
        </Card>
      </div>

      {/* Growth Actions — Fixed text clipping */}
      <Card padding="lg">
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
            <h3 className="text-[15px] font-semibold text-gray-900">Growth Actions</h3>
          </div>
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
          <div className="text-center" style={{ padding: "32px 0" }}>
            <p className="text-[14px] text-gray-400">No action plans yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {data.growth.actions.map((action: GrowthAction, i: number) => (
              <div
                key={action.id}
                className="flex items-start gap-3 group"
                style={{
                  padding: "14px 0",
                  borderTop: i > 0 ? "1px solid #F3F4F6" : "none",
                }}
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
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 6 }}>
                    <input
                      value={action.area}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].area = v; }); }}
                      placeholder="Area"
                      className="text-xs font-medium bg-gray-50 text-gray-600 rounded-md border border-gray-200 hover:border-gray-300 focus:outline-none focus:border-gray-400 transition-colors"
                      style={{ width: "auto", minWidth: 80, maxWidth: 200, padding: "5px 10px" }}
                    />
                    <input
                      type="date"
                      value={action.due}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].due = v; }); }}
                      className="text-xs text-gray-400 bg-transparent focus:outline-none cursor-pointer"
                    />
                  </div>
                  <input
                    value={action.action}
                    onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].action = v; }); }}
                    placeholder="What's the action?"
                    className={[
                      "w-full text-[14px] bg-transparent focus:outline-none py-0.5",
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
