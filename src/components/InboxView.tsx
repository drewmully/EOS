"use client";

import { useState } from "react";
import { UserData } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Card } from "./ui/Card";

interface Props {
  data: UserData;
  update: (fn: (d: UserData) => void) => void;
}

export function InboxView({ data, update }: Props) {
  const [input, setInput] = useState("");

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inbox</h1>
        <p className="text-sm text-gray-400 mt-1">Capture first, triage later.</p>
      </div>

      <div className="mb-6">
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
          placeholder="What's on your mind? Press Enter to add."
          className="w-full bg-white border border-gray-200/70 rounded-2xl px-6 py-4 text-[15px] text-gray-800 placeholder:text-gray-400 transition-all duration-150 hover:border-gray-300 focus:outline-none focus:border-indigo-300 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]"
        />
      </div>

      {data.inbox.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">Inbox zero. Nice work.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.inbox.map((item, i) => (
            <Card key={item.id} padding="md">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-gray-800 mb-2.5 break-words">{item.text}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400">{item.date}</span>
                    <select
                      value={item.biz}
                      onChange={(e) => {
                        const v = e.target.value;
                        update((d) => { d.inbox[i].biz = v; });
                      }}
                      className="text-xs font-medium border border-gray-200 rounded-md px-2.5 py-1 text-gray-500 bg-white cursor-pointer hover:border-gray-300 focus:outline-none transition-colors"
                    >
                      <option value="">Business?</option>
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
