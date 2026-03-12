"use client";

import { useState } from "react";
import { UserData } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

const TRIAGE_VARIANT: Record<string, "indigo" | "emerald" | "amber" | "gray" | "red"> = {
  "To-Do": "indigo",
  Rock: "emerald",
  "Team Issue": "amber",
  Parked: "gray",
  Drop: "red",
};

const BIZ_VARIANT: Record<string, "teal" | "orange" | "blue"> = {
  MFS: "teal",
  Mully: "orange",
  Both: "blue",
};

const TRIAGE_COLOR: Record<string, string> = {
  "To-Do": "#6366F1",
  Rock: "#10B981",
  "Team Issue": "#F59E0B",
  Parked: "#D1D5DB",
  Drop: "#EF4444",
};

interface Props {
  data: UserData;
  update: (fn: (d: UserData) => void) => void;
}

export function InboxView({ data, update }: Props) {
  const [input, setInput] = useState("");
  const untriaged = data.inbox.filter((item) => !item.triage).length;

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 32 }}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inbox</h1>
          {untriaged > 0 && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/50 rounded-full" style={{ padding: "2px 10px" }}>
              {untriaged} untriaged
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">Capture first, triage later.</p>
      </div>

      {/* Quick capture */}
      <div style={{ marginBottom: 28 }}>
        <div className="relative">
          <div className="absolute top-1/2 -translate-y-1/2 text-gray-300" style={{ left: 20 }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M12 5v14m-7-7h14" />
            </svg>
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                update((d) => {
                  d.inbox.unshift({
                    id: uid(),
                    text: input.trim(),
                    date: new Date().toLocaleDateString(),
                    biz: "",
                    triage: "",
                  });
                });
                setInput("");
              }
            }}
            placeholder="What's on your mind? Press Enter to capture..."
            className="w-full bg-white border border-gray-200/70 rounded-2xl text-[15px] text-gray-800 placeholder:text-gray-400 transition-all duration-150 hover:border-gray-300 focus:outline-none focus:border-indigo-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]"
            style={{ padding: "16px 24px 16px 52px" }}
          />
        </div>
      </div>

      {data.inbox.length === 0 ? (
        <div className="text-center" style={{ padding: "64px 0" }}>
          <svg className="w-12 h-12 mx-auto text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1} style={{ marginBottom: 12 }}>
            <rect x="2" y="3" width="20" height="18" rx="3" />
            <path d="M2 12h6l2 3h4l2-3h6" />
          </svg>
          <p className="text-sm font-medium text-gray-400">Inbox zero. Nice work.</p>
          <p className="text-xs text-gray-300 mt-1">New ideas will show up here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.inbox.map((item, i) => (
            <Card key={item.id} padding="md">
              <div className="flex items-start gap-4">
                <div
                  className="w-1 rounded-full flex-shrink-0 self-stretch"
                  style={{
                    minHeight: 24,
                    background: item.triage ? (TRIAGE_COLOR[item.triage] || "#D1D5DB") : "#E5E7EB",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-gray-800 leading-relaxed" style={{ marginBottom: 10 }}>{item.text}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400">{item.date}</span>
                    {item.biz && (
                      <Badge variant={BIZ_VARIANT[item.biz] || "gray"} size="sm">{item.biz}</Badge>
                    )}
                    {item.triage && (
                      <Badge variant={TRIAGE_VARIANT[item.triage] || "gray"} size="sm">{item.triage}</Badge>
                    )}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <select
                        value={item.biz}
                        onChange={(e) => {
                          const v = e.target.value;
                          update((d) => { d.inbox[i].biz = v; });
                        }}
                        className="text-xs font-medium border border-gray-200 rounded-md px-2.5 py-1 text-gray-500 bg-white cursor-pointer hover:border-gray-300 focus:outline-none transition-colors"
                      >
                        <option value="">Biz?</option>
                        <option>MFS</option>
                        <option>Mully</option>
                        <option>Both</option>
                      </select>
                      <select
                        value={item.triage}
                        onChange={(e) => {
                          const v = e.target.value;
                          update((d) => { d.inbox[i].triage = v; });
                        }}
                        className={`text-xs font-medium border rounded-md px-2.5 py-1 bg-white cursor-pointer transition-colors focus:outline-none ${
                          item.triage
                            ? "border-gray-300 text-gray-700 font-semibold"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <option value="">Triage...</option>
                        <option>To-Do</option>
                        <option>Rock</option>
                        <option>Team Issue</option>
                        <option>Parked</option>
                        <option>Drop</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => update((d) => { d.inbox.splice(i, 1); })}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors duration-100 cursor-pointer flex-shrink-0 mt-0.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
