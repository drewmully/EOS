"use client";

import { UserData } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
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
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Seat Exit Plan</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Too many seats = no leverage. Plan your exit.</p>
      </div>

      {/* Weekly prompt */}
      <div className="mb-6 bg-amber-50 border border-amber-200/60 rounded-xl px-5 py-3.5">
        <p className="text-[14px] font-medium text-amber-800">What did you do this week to exit a seat?</p>
      </div>

      <div className="space-y-4">
        {data.seats.map((seat, i) => (
          <Card key={seat.id} padding="lg">
            <div className="mb-4">
              <input
                value={seat.name}
                onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].name = v; }); }}
                className="text-[15px] font-semibold text-gray-900 bg-transparent focus:outline-none w-full mb-2"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  value={seat.hours}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].hours = v; }); }}
                  className="w-28 text-xs text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 hover:border-gray-300 focus:outline-none focus:border-gray-400 text-center transition-colors"
                />
                <select
                  value={seat.status}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].status = v; }); }}
                  className="text-xs font-medium border border-gray-200 rounded-md px-2.5 py-1 bg-white cursor-pointer hover:border-gray-300 focus:outline-none transition-colors"
                >
                  {Object.keys(STATUS_VARIANT).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <Badge variant={STATUS_VARIANT[seat.status] || "gray"} dot size="sm">
                  {seat.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3.5">
                <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Exit Path</div>
                <input
                  value={seat.exit}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].exit = v; }); }}
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none py-0.5"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-3.5">
                <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Timeline</div>
                <input
                  value={seat.timeline}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].timeline = v; }); }}
                  className="w-full text-sm text-gray-700 bg-transparent focus:outline-none py-0.5"
                />
              </div>
            </div>

            <Textarea
              value={seat.notes}
              onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].notes = v; }); }}
              placeholder="Notes on progress this week..."
            />
          </Card>
        ))}
      </div>

      <button
        onClick={() =>
          update((d) => {
            d.seats.push({ id: uid(), name: "New Seat", hours: "? hrs/wk", exit: "", timeline: "", status: "Not started", notes: "" });
          })
        }
        className="w-full mt-3 border border-dashed border-gray-200 rounded-xl py-3.5 text-sm text-gray-400 font-medium hover:text-gray-600 hover:border-gray-300 transition-colors duration-100 cursor-pointer flex items-center justify-center gap-1.5"
      >
        <IconPlus className="w-4 h-4" />
        Add Seat
      </button>
    </div>
  );
}
