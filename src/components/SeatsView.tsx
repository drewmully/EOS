"use client";

import { UserData } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Input";
import { IconPlus } from "./ui/Icons";

const STATUS_VARIANT: Record<string, "gray" | "amber" | "emerald" | "indigo"> = {
  "Not started": "gray",
  "In progress": "amber",
  Delegated: "emerald",
  Hired: "indigo",
};

interface Props {
  data: UserData;
  update: (fn: (d: UserData) => void) => void;
}

export function SeatsView({ data, update }: Props) {
  return (
    <div className="animate-fadeSlideUp">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Seat Exit Plan</h1>
        <p className="text-sm text-gray-400 mt-1">Too many seats = no leverage. Plan your exit.</p>
      </div>

      {/* Weekly prompt */}
      <Card className="mb-6 !bg-red-50 !border-red-200/60">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700">Weekly check-in</p>
            <p className="text-xs text-red-600/80 mt-0.5">What did you do THIS week to exit a seat?</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {data.seats.map((seat, i) => (
          <Card key={seat.id}>
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <input
                value={seat.name}
                onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].name = v; }); }}
                className="text-[15px] font-semibold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-emerald-500 focus:outline-none px-0.5 py-1 flex-1 min-w-[200px] transition-colors"
              />
              <div className="flex items-center gap-3">
                <input
                  value={seat.hours}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].hours = v; }); }}
                  className="w-28 text-[11px] text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200 focus:border-emerald-500 focus:outline-none text-center transition-colors"
                />
                <select
                  value={seat.status}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].status = v; }); }}
                  className="text-[11px] font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white cursor-pointer hover:border-gray-300 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {Object.keys(STATUS_VARIANT).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <Badge variant={STATUS_VARIANT[seat.status] || "gray"} dot>
                  {seat.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Exit Path</div>
                <input
                  value={seat.exit}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].exit = v; }); }}
                  className="w-full text-sm text-gray-700 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-emerald-500 focus:outline-none py-0.5 transition-colors"
                />
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Timeline</div>
                <input
                  value={seat.timeline}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].timeline = v; }); }}
                  className="w-full text-sm text-gray-700 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-emerald-500 focus:outline-none py-0.5 transition-colors"
                />
              </div>
            </div>

            <Textarea
              value={seat.notes}
              onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].notes = v; }); }}
              placeholder="What did you do this week to exit this seat?"
            />
          </Card>
        ))}
      </div>

      <button
        onClick={() =>
          update((d) => {
            d.seats.push({
              id: uid(),
              name: "New Seat",
              hours: "? hrs/wk",
              exit: "",
              timeline: "",
              status: "Not started",
              notes: "",
            });
          })
        }
        className="w-full mt-4 border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm text-gray-400 font-semibold hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
      >
        <IconPlus className="w-4 h-4" />
        Add Seat
      </button>
    </div>
  );
}
