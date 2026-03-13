"use client";

import { SharedData } from "@/lib/types";
import { uid } from "@/lib/utils";
import { IconPlus } from "./ui/Icons";

interface Props {
  shared: SharedData;
  updateShared: (fn: (d: SharedData) => void) => void;
}

const CATEGORIES = ["SOP", "Artifact", "Template", "Dashboard", "Other"];

export function LinksView({ shared, updateShared }: Props) {
  const grouped: Record<string, typeof shared.links> = {};
  for (const link of shared.links) {
    const cat = link.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(link);
  }

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 16 }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Links</h1>
        <p className="text-sm text-gray-400 mt-0.5">SOPs, artifacts, docs &middot; one spot for everything</p>
      </div>

      {/* Add link */}
      <button
        onClick={() => updateShared((d) => {
          d.links.push({ id: uid(), label: "", url: "", category: "SOP" });
        })}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
        style={{ marginBottom: 16 }}
      >
        <IconPlus className="w-4 h-4" />
        Add Link
      </button>

      {shared.links.length === 0 ? (
        <div
          className="rounded-xl border-2 border-dashed border-gray-200 text-center"
          style={{ padding: "40px 20px" }}
        >
          <p className="text-sm text-gray-400">No links yet. Add Google Docs, SOPs, dashboards, and more.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          {/* Header */}
          <div
            className="grid text-[11px] font-semibold uppercase tracking-wider text-white"
            style={{
              gridTemplateColumns: "1fr 1fr 100px 32px",
              background: "#4B5563",
              padding: "8px 12px",
            }}
          >
            <span>Label</span>
            <span>URL</span>
            <span>Category</span>
            <span />
          </div>

          {shared.links.map((link, i) => (
            <div
              key={link.id}
              className="grid items-center group"
              style={{
                gridTemplateColumns: "1fr 1fr 100px 32px",
                padding: "7px 12px",
                borderTop: i > 0 ? "1px solid #F3F4F6" : "none",
                background: i % 2 === 0 ? "#FFFFFF" : "#FAFBFC",
              }}
            >
              <input
                value={link.label}
                onChange={(e) => { const v = e.target.value; updateShared((d) => { d.links[i].label = v; }); }}
                className="bg-transparent text-[13px] text-gray-800 focus:outline-none min-w-0 truncate"
                placeholder="Label..."
              />
              <div className="flex items-center gap-1 min-w-0">
                <input
                  value={link.url}
                  onChange={(e) => { const v = e.target.value; updateShared((d) => { d.links[i].url = v; }); }}
                  className="bg-transparent text-[12px] text-blue-600 focus:outline-none min-w-0 truncate flex-1"
                  placeholder="https://..."
                />
                {link.url && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-600 flex-shrink-0"
                    title="Open link"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H21m0 0v7.5m0-7.5l-10.5 10.5" />
                    </svg>
                  </a>
                )}
              </div>
              <select
                value={link.category}
                onChange={(e) => { const v = e.target.value; updateShared((d) => { d.links[i].category = v; }); }}
                className="bg-transparent text-[12px] text-gray-600 cursor-pointer focus:outline-none"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <button
                onClick={() => { if (confirm("Delete this link?")) updateShared((d) => { d.links.splice(i, 1); }); }}
                className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
