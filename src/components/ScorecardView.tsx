"use client";

import { SharedData, ScorecardRow } from "@/lib/types";
import { uid } from "@/lib/utils";
import { IconPlus } from "./ui/Icons";

interface Props {
  shared: SharedData;
  updateShared: (fn: (d: SharedData) => void) => void;
}

function ScorecardTable({
  title,
  subtitle,
  accent,
  rows,
  onUpdate,
  onAdd,
  onDelete,
}: {
  title: string;
  subtitle: string;
  accent: string;
  rows: ScorecardRow[];
  onUpdate: (idx: number, patch: Partial<ScorecardRow> | { weekIdx: number; value: string }) => void;
  onAdd: () => void;
  onDelete: (idx: number) => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {/* Header */}
        <div
          className="grid text-[11px] font-semibold uppercase tracking-wider text-white"
          style={{
            gridTemplateColumns: "1fr 90px 80px repeat(4, 70px) 32px",
            background: accent,
            padding: "8px 12px",
          }}
        >
          <span>Measurable</span>
          <span>Owner</span>
          <span>Goal</span>
          <span>Wk 1</span>
          <span>Wk 2</span>
          <span>Wk 3</span>
          <span>Wk 4</span>
          <span />
        </div>

        {rows.map((row, i) => (
          <div
            key={row.id}
            className="grid items-center group"
            style={{
              gridTemplateColumns: "1fr 90px 80px repeat(4, 70px) 32px",
              padding: "6px 12px",
              borderTop: i > 0 ? "1px solid #F3F4F6" : "none",
              background: i % 2 === 0 ? "#FFFFFF" : "#FAFBFC",
            }}
          >
            <input
              value={row.measurable}
              onChange={(e) => onUpdate(i, { measurable: e.target.value })}
              className="bg-transparent text-[13px] text-gray-800 focus:outline-none min-w-0 truncate"
              placeholder="Measurable..."
            />
            <select
              value={row.owner}
              onChange={(e) => onUpdate(i, { owner: e.target.value })}
              className="bg-transparent text-[12px] text-gray-600 cursor-pointer focus:outline-none"
            >
              <option value="">—</option>
              <option>Drew</option>
              <option>Jack</option>
              <option>Joe</option>
            </select>
            <input
              value={row.goal}
              onChange={(e) => onUpdate(i, { goal: e.target.value })}
              className="bg-transparent text-[12px] text-gray-600 focus:outline-none min-w-0 text-center"
              placeholder="—"
            />
            {row.weeks.map((w, wi) => (
              <input
                key={wi}
                value={w}
                onChange={(e) => onUpdate(i, { weekIdx: wi, value: e.target.value })}
                className="bg-transparent text-[12px] text-gray-600 focus:outline-none min-w-0 text-center"
                placeholder="—"
              />
            ))}
            <button
              onClick={() => { if (confirm("Delete this row?")) onDelete(i); }}
              className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ padding: "8px 0", borderTop: "1px solid #F3F4F6" }}
        >
          <IconPlus className="w-3 h-3" />
          Add Row
        </button>
      </div>
    </div>
  );
}

export function ScorecardView({ shared, updateShared }: Props) {
  function handleUpdate(biz: "mfs" | "mully", idx: number, patch: Partial<ScorecardRow> | { weekIdx: number; value: string }) {
    updateShared((d) => {
      const row = d.scorecard[biz][idx];
      if ("weekIdx" in patch) {
        row.weeks[patch.weekIdx] = patch.value;
      } else {
        Object.assign(row, patch);
      }
    });
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 16 }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Scorecard</h1>
        <p className="text-sm text-gray-400 mt-0.5">5-15 weekly numbers &middot; each has an owner and a goal</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ScorecardTable
          title="MFS (3PL)"
          subtitle={`${shared.scorecard.mfs.length} measurables`}
          accent="#3E8A8A"
          rows={shared.scorecard.mfs}
          onUpdate={(idx, patch) => handleUpdate("mfs", idx, patch)}
          onAdd={() => updateShared((d) => {
            d.scorecard.mfs.push({ id: uid(), measurable: "", owner: "", goal: "", weeks: ["", "", "", ""] });
          })}
          onDelete={(idx) => updateShared((d) => { d.scorecard.mfs.splice(idx, 1); })}
        />

        <ScorecardTable
          title="Mully (eCommerce)"
          subtitle={`${shared.scorecard.mully.length} measurables`}
          accent="#D4883E"
          rows={shared.scorecard.mully}
          onUpdate={(idx, patch) => handleUpdate("mully", idx, patch)}
          onAdd={() => updateShared((d) => {
            d.scorecard.mully.push({ id: uid(), measurable: "", owner: "", goal: "", weeks: ["", "", "", ""] });
          })}
          onDelete={(idx) => updateShared((d) => { d.scorecard.mully.splice(idx, 1); })}
        />
      </div>
    </div>
  );
}
