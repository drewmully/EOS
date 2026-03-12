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

const STATUS_ACCENT: Record<string, string> = {
  "Not started": "#D1D5DB",
  "In progress": "#F59E0B",
  Delegated: "#10B981",
  Hired: "#6366F1",
};

interface Props {
  data: UserData;
  update: (fn: (d: UserData) => void) => void;
}

export function SeatsView({ data, update }: Props) {
  const totalSeats = data.seats.length;
  const activeSeats = data.seats.filter((s) => s.status !== "Hired" && s.status !== "Delegated").length;

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 16 }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Seat Exit Plan</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Too many seats = no leverage.{totalSeats > 0 ? ` ${activeSeats} active / ${totalSeats} total.` : ""}
        </p>
      </div>

      {/* Weekly prompt — compact */}
      <div
        className="rounded-xl border"
        style={{
          marginBottom: 16,
          padding: "12px 18px",
          background: "linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)",
          borderColor: "rgba(245, 158, 11, 0.2)",
        }}
      >
        <p className="text-[13px] font-semibold text-amber-800">What did you do this week to exit a seat?</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {data.seats.map((seat, i) => (
          <Card key={seat.id} padding="md">
            <div className="flex items-start gap-4">
              {/* Status accent */}
              <div
                className="w-1 rounded-full flex-shrink-0 self-stretch"
                style={{ minHeight: 40, background: STATUS_ACCENT[seat.status] || "#D1D5DB" }}
              />
              <div className="flex-1 min-w-0">
                <div style={{ marginBottom: 14 }}>
                  <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 8 }}>
                    <input
                      value={seat.name}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].name = v; }); }}
                      className="text-[15px] font-semibold text-gray-900 bg-transparent focus:outline-none flex-1 min-w-0"
                    />
                    <Badge variant={STATUS_VARIANT[seat.status] || "gray"} dot size="sm">
                      {seat.status}
                    </Badge>
                  </div>
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
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 12, marginBottom: 14 }}>
                  <div className="bg-gray-50 rounded-xl" style={{ padding: "14px 16px" }}>
                    <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider" style={{ marginBottom: 4 }}>Exit Path</div>
                    <input
                      value={seat.exit}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].exit = v; }); }}
                      placeholder="How will you exit?"
                      className="w-full text-sm text-gray-700 bg-transparent focus:outline-none py-0.5 placeholder:text-gray-300"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-xl" style={{ padding: "14px 16px" }}>
                    <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider" style={{ marginBottom: 4 }}>Timeline</div>
                    <input
                      value={seat.timeline}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].timeline = v; }); }}
                      placeholder="When?"
                      className="w-full text-sm text-gray-700 bg-transparent focus:outline-none py-0.5 placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <Textarea
                  value={seat.notes}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].notes = v; }); }}
                  placeholder="Notes on progress this week..."
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <button
        onClick={() =>
          update((d) => {
            d.seats.push({ id: uid(), name: "New Seat", hours: "? hrs/wk", exit: "", timeline: "", status: "Not started", notes: "" });
          })
        }
        className="w-full border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 font-semibold hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5"
        style={{ marginTop: 12, padding: "14px 0" }}
      >
        <IconPlus className="w-4 h-4" />
        Add Seat
      </button>
    </div>
  );
}
