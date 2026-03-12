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
    <div className="animate-fadeSlideUp">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">Inbox</h1>
        <p className="text-[16px] text-gray-400 mt-2">Capture first, triage later. Press Enter to add.</p>
      </div>

      <div className="mb-8">
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
          placeholder="What's on your mind?"
          className="w-full bg-white border-2 border-indigo-200 focus:border-indigo-500 rounded-2xl px-6 py-5 text-[16px] text-gray-800 placeholder:text-gray-400 shadow-sm transition-all duration-200 hover:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        />
      </div>

      {data.inbox.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gray-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.3}>
              <rect x="2" y="3" width="20" height="18" rx="3" />
              <path d="M2 12h6l2 3h4l2-3h6" />
            </svg>
          </div>
          <p className="text-[17px] text-gray-400 font-medium">Inbox zero</p>
          <p className="text-[15px] text-gray-300 mt-1">Nice work. Nothing to triage.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.inbox.map((item, i) => (
            <Card key={item.id} padding="md" hoverable>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-gray-800 mb-2.5 break-words">{item.text}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] text-gray-400 font-medium">{item.date}</span>
                    <select
                      value={item.biz}
                      onChange={(e) => {
                        const v = e.target.value;
                        update((d) => { d.inbox[i].biz = v; });
                      }}
                      className="text-[12px] font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-500 bg-white cursor-pointer hover:border-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
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
                      className={`text-[12px] font-medium border rounded-lg px-2.5 py-1.5 bg-white cursor-pointer transition-colors focus:outline-none ${
                        item.triage
                          ? "border-indigo-200 text-indigo-600 font-semibold hover:border-indigo-300 focus:border-indigo-500"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 focus:border-indigo-500"
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
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150 cursor-pointer flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
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
