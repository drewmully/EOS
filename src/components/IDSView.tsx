"use client";

import { Issue, SharedData } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Badge } from "./ui/Badge";
import { IconPlus } from "./ui/Icons";

const PRIORITY_LABELS: Record<number, string> = { 0: "P0", 1: "P1", 2: "P2", 3: "P3" };
const PRIORITY_VARIANT: Record<number, "red" | "amber" | "orange" | "gray"> = {
  0: "red", 1: "amber", 2: "orange", 3: "gray",
};

interface Props {
  shared: SharedData;
  updateShared: (fn: (d: SharedData) => void) => void;
}

function IssuesTable({
  title,
  subtitle,
  accent,
  issues,
  onUpdate,
  onAdd,
  onDelete,
}: {
  title: string;
  subtitle: string;
  accent: string;
  issues: Issue[];
  onUpdate: (idx: number, patch: Partial<Issue>) => void;
  onAdd: () => void;
  onDelete: (idx: number) => void;
}) {
  const sorted = [...issues]
    .map((iss, idx) => ({ iss, idx }))
    .sort((a, b) => a.iss.priority - b.iss.priority);

  const starredCount = issues.filter((i) => i.starred).length;

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{starredCount}/3 starred for IDS</span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {/* Header row */}
        <div
          className="grid text-[11px] font-semibold uppercase tracking-wider text-white"
          style={{
            gridTemplateColumns: "36px 1fr 64px 80px 1fr 40px",
            background: accent,
            padding: "8px 12px",
          }}
        >
          <span>#</span>
          <span>Issue</span>
          <span>Priority</span>
          <span>Owner</span>
          <span>To-Do / Resolution</span>
          <span />
        </div>

        {sorted.map(({ iss, idx }, sortIdx) => (
          <div
            key={iss.id}
            className="grid items-center group"
            style={{
              gridTemplateColumns: "36px 1fr 64px 80px 1fr 40px",
              padding: "7px 12px",
              borderTop: sortIdx > 0 ? "1px solid #F3F4F6" : "none",
              background: iss.starred ? "rgba(254,249,195,0.35)" : (sortIdx % 2 === 0 ? "#FFFFFF" : "#FAFBFC"),
            }}
          >
            {/* Row number + star */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (iss.starred) {
                    onUpdate(idx, { starred: false });
                  } else if (starredCount < 3) {
                    onUpdate(idx, { starred: true });
                  }
                }}
                className="cursor-pointer text-sm transition-colors"
                title={iss.starred ? "Unstar" : starredCount >= 3 ? "3 max starred" : "Star for IDS"}
                style={{ color: iss.starred ? "#F59E0B" : "#D1D5DB" }}
              >
                {iss.starred ? "\u2605" : "\u2606"}
              </button>
              <span className="text-[11px] text-gray-400">{sortIdx + 1}</span>
            </div>

            {/* Issue title */}
            <input
              value={iss.title}
              onChange={(e) => onUpdate(idx, { title: e.target.value })}
              className="bg-transparent text-[13px] text-gray-800 focus:outline-none min-w-0 truncate"
              placeholder="Issue..."
            />

            {/* Priority */}
            <select
              value={iss.priority}
              onChange={(e) => onUpdate(idx, { priority: Number(e.target.value) })}
              className="bg-transparent text-[12px] font-medium text-gray-600 cursor-pointer focus:outline-none w-14"
            >
              {[0, 1, 2, 3].map((p) => (
                <option key={p} value={p}>P{p}</option>
              ))}
            </select>

            {/* Owner */}
            <select
              value={iss.owner}
              onChange={(e) => onUpdate(idx, { owner: e.target.value })}
              className="bg-transparent text-[12px] text-gray-600 cursor-pointer focus:outline-none"
            >
              <option value="">—</option>
              <option>Drew</option>
              <option>Jack</option>
              <option>Joe</option>
            </select>

            {/* To-Do */}
            <input
              value={iss.todo}
              onChange={(e) => onUpdate(idx, { todo: e.target.value })}
              className="bg-transparent text-[12px] text-gray-600 focus:outline-none min-w-0 truncate"
              placeholder="Resolution..."
            />

            {/* Delete */}
            <button
              onClick={() => { if (confirm("Delete this issue?")) onDelete(idx); }}
              className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add row */}
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ padding: "8px 0", borderTop: "1px solid #F3F4F6" }}
        >
          <IconPlus className="w-3 h-3" />
          Add Issue
        </button>
      </div>
    </div>
  );
}

export function IDSView({ shared, updateShared }: Props) {
  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 16 }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">IDS</h1>
        <p className="text-sm text-gray-400 mt-0.5">Identify, Discuss, Solve &middot; Star the top 3 to IDS today</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <IssuesTable
          title="MFS (3PL)"
          subtitle={`${shared.issuesMFS.length} issues`}
          accent="#3E8A8A"
          issues={shared.issuesMFS}
          onUpdate={(idx, patch) => updateShared((d) => { Object.assign(d.issuesMFS[idx], patch); })}
          onAdd={() => updateShared((d) => {
            d.issuesMFS.push({ id: uid(), title: "", priority: 1, owner: "", todo: "", starred: false });
          })}
          onDelete={(idx) => updateShared((d) => { d.issuesMFS.splice(idx, 1); })}
        />

        <IssuesTable
          title="Mully (eCommerce)"
          subtitle={`${shared.issuesMully.length} issues`}
          accent="#D4883E"
          issues={shared.issuesMully}
          onUpdate={(idx, patch) => updateShared((d) => { Object.assign(d.issuesMully[idx], patch); })}
          onAdd={() => updateShared((d) => {
            d.issuesMully.push({ id: uid(), title: "", priority: 1, owner: "", todo: "", starred: false });
          })}
          onDelete={(idx) => updateShared((d) => { d.issuesMully.splice(idx, 1); })}
        />
      </div>
    </div>
  );
}
