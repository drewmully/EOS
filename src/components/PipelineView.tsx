"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  SharedData,
  Deal,
  DealStage,
  DealNote,
  PipelineType,
  DEAL_STAGES,
  DEAL_EXIT_STAGES,
  STAGE_COLORS,
  USERS,
} from "@/lib/types";
import { uid } from "@/lib/utils";
import { Badge } from "./ui/Badge";
import { IconPlus, IconX } from "./ui/Icons";

/* ── Constants ── */

const ALL_STAGES: DealStage[] = [...DEAL_STAGES, ...DEAL_EXIT_STAGES];

function fmtMoney(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function daysSince(iso: string): number {
  if (!iso) return 999;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function emptyDeal(pipeline: PipelineType): Deal {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: uid(),
    pipeline,
    company: "",
    contact: { name: "", title: "", email: "", phone: "" },
    stage: "Cold Outreach",
    dealOwner: "",
    accountOwner: "",
    starred: false,
    value: 0,
    notes: [],
    links: [],
    createdDate: today,
    lastActivity: today,
    tags: [],
  };
}

/* ── Props ── */

interface Props {
  shared: SharedData;
  updateShared: (fn: (d: SharedData) => void) => void;
  activeUser: string;
}

/* ═══════════════════════════════════════════════════════
   PIPELINE VIEW
   ═══════════════════════════════════════════════════════ */

export function PipelineView({ shared, updateShared, activeUser }: Props) {
  const [activePipeline, setActivePipeline] = useState<PipelineType>("mully");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [hotOnly, setHotOnly] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [showNewDeal, setShowNewDeal] = useState(false);

  // AI Advisor state
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const deals = shared.pipeline?.[activePipeline] || [];

  // Filter deals
  const filtered = useMemo(() => {
    let list = deals;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.company.toLowerCase().includes(s) ||
          d.contact.name.toLowerCase().includes(s) ||
          d.notes.some((n) => n.text.toLowerCase().includes(s))
      );
    }
    if (stageFilter !== "all") list = list.filter((d) => d.stage === stageFilter);
    if (ownerFilter !== "all") list = list.filter((d) => d.dealOwner === ownerFilter || d.accountOwner === ownerFilter);
    if (hotOnly) list = list.filter((d) => d.starred);
    return list;
  }, [deals, search, stageFilter, ownerFilter, hotOnly]);

  // KPI calculations
  const kpis = useMemo(() => {
    const active = deals.filter((d) => d.stage !== "Parking Lot" && d.stage !== "Not Interested");
    const hot = deals.filter((d) => d.starred);
    const qualified = deals.filter((d) => {
      const idx = DEAL_STAGES.indexOf(d.stage);
      return idx >= 3; // Meeting Scheduled or later
    });
    const closed = deals.filter((d) => d.stage === "Signed" || d.stage === "Paid" || d.stage === "Onboarding");
    const pipelineValue = active.reduce((sum, d) => sum + (d.value || 0), 0);
    return { active: active.length, hot: hot.length, qualified: qualified.length, closed: closed.length, value: pipelineValue };
  }, [deals]);

  // Update a deal
  const updateDeal = useCallback(
    (dealId: string, fn: (d: Deal) => void) => {
      updateShared((s) => {
        const list = s.pipeline[activePipeline];
        const deal = list.find((d) => d.id === dealId);
        if (deal) {
          fn(deal);
          deal.lastActivity = new Date().toISOString().slice(0, 10);
        }
      });
    },
    [updateShared, activePipeline]
  );

  const addDeal = useCallback(() => {
    const d = emptyDeal(activePipeline);
    updateShared((s) => {
      if (!s.pipeline) s.pipeline = { mully: [], mfs: [] };
      s.pipeline[activePipeline].push(d);
    });
    setSelectedDeal(d.id);
    setShowNewDeal(false);
  }, [updateShared, activePipeline]);

  const deleteDeal = useCallback(
    (dealId: string) => {
      updateShared((s) => {
        s.pipeline[activePipeline] = s.pipeline[activePipeline].filter((d) => d.id !== dealId);
      });
      if (selectedDeal === dealId) setSelectedDeal(null);
    },
    [updateShared, activePipeline, selectedDeal]
  );

  // AI Advisor
  const fetchAdvice = useCallback(async () => {
    setAiLoading(true);
    const allDeals = [...(shared.pipeline?.mully || []), ...(shared.pipeline?.mfs || [])];
    const summary = allDeals.map((d) => {
      const lastNote = d.notes[d.notes.length - 1];
      return `${d.company} (${d.pipeline === "mully" ? "Mully Golf" : "MFS 3PL"}) — Stage: ${d.stage}, Value: $${d.value}, Deal Owner: ${d.dealOwner || "unassigned"}, Days since activity: ${daysSince(d.lastActivity)}, Hot: ${d.starred ? "YES" : "no"}${lastNote ? `, Last note: "${lastNote.text}"` : ""}`;
    }).join("\n");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a sharp, concise sales strategist advising a small business with two sales initiatives:
1. Mully Golf Outings — premium corporate golf experience events
2. MFS — new 3PL (third-party logistics) client acquisition

Analyze the pipeline data and give ONE high-impact, specific recommendation. Reference actual company names and stages. 2-3 sentences max. Be motivating and actionable. No fluff.`,
          message: `Here is our current pipeline:\n\n${summary}\n\nWhat's the single most impactful thing we should do today?`,
        }),
      });
      const data = await res.json();
      setAiAdvice(data.response || "Unable to get advice right now.");
      try { localStorage.setItem("pipeline-advice-date", new Date().toISOString().slice(0, 10)); localStorage.setItem("pipeline-advice", data.response); } catch { /* */ }
    } catch {
      setAiAdvice("Could not connect to AI advisor. Check your API key.");
    }
    setAiLoading(false);
  }, [shared.pipeline]);

  // Load cached advice or fetch daily
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cached = localStorage.getItem("pipeline-advice");
    const cachedDate = localStorage.getItem("pipeline-advice-date");
    if (cached && cachedDate === today) {
      setAiAdvice(cached);
    } else if (deals.length > 0) {
      fetchAdvice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chat with Claude
  const sendChat = useCallback(async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: msg }]);
    setChatLoading(true);

    const allDeals = [...(shared.pipeline?.mully || []), ...(shared.pipeline?.mfs || [])];
    const summary = allDeals.map((d) => {
      const notes = d.notes.map((n) => `  [${n.date}] ${n.author}: ${n.text}`).join("\n");
      return `${d.company} (${d.pipeline === "mully" ? "Mully Golf" : "MFS 3PL"}) — Stage: ${d.stage}, Value: $${d.value}, Owner: ${d.dealOwner}, Account: ${d.accountOwner}, Hot: ${d.starred}, Last activity: ${d.lastActivity}\n  Contact: ${d.contact.name} (${d.contact.title}) — ${d.contact.email}\n${notes ? "  Notes:\n" + notes : ""}`;
    }).join("\n\n");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a sharp sales strategist. You have full context on the user's pipeline. Be specific, reference companies by name, and give actionable advice. Keep responses concise (3-5 sentences max).

PIPELINE DATA:
${summary}`,
          message: msg,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "assistant", text: data.response }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", text: "Error connecting to AI." }]);
    }
    setChatLoading(false);
  }, [chatInput, shared.pipeline]);

  // Drag and drop
  const dragDeal = useRef<string | null>(null);

  const handleDragStart = (dealId: string) => {
    dragDeal.current = dealId;
  };

  const handleDrop = (stage: DealStage) => {
    if (!dragDeal.current) return;
    const id = dragDeal.current;
    dragDeal.current = null;
    updateDeal(id, (d) => { d.stage = stage; });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const selectedDealObj = deals.find((d) => d.id === selectedDeal) || null;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pipeline</h1>
        <p className="text-sm text-gray-400 mt-0.5">CRM &middot; Track deals from outreach to onboarding</p>
      </div>

      {/* AI Advisor Bar */}
      <AiAdvisorBar
        advice={aiAdvice}
        loading={aiLoading}
        onRefresh={fetchAdvice}
        onChat={() => setShowAiChat(true)}
      />

      {/* Pipeline Toggle + View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-2">
          <PipelineToggle active={activePipeline} onChange={setActivePipeline} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addDeal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 cursor-pointer transition-colors"
          >
            <IconPlus className="w-3 h-3" /> Add Deal
          </button>
          <ViewToggle active={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* KPI Strip */}
      <KpiStrip kpis={kpis} />

      {/* Search + Filters */}
      <SearchFilterBar
        search={search}
        setSearch={setSearch}
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        ownerFilter={ownerFilter}
        setOwnerFilter={setOwnerFilter}
        hotOnly={hotOnly}
        setHotOnly={setHotOnly}
      />

      {/* Main content */}
      {viewMode === "kanban" ? (
        <KanbanBoard
          deals={filtered}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onSelect={setSelectedDeal}
          onToggleStar={(id) => updateDeal(id, (d) => { d.starred = !d.starred; })}
        />
      ) : (
        <TableView
          deals={filtered}
          onSelect={setSelectedDeal}
          onUpdate={updateDeal}
          onDelete={deleteDeal}
        />
      )}

      {/* Deal Detail Slide-Over */}
      {selectedDealObj && (
        <DealDetailPanel
          deal={selectedDealObj}
          onUpdate={(fn) => updateDeal(selectedDealObj.id, fn)}
          onDelete={() => deleteDeal(selectedDealObj.id)}
          onClose={() => setSelectedDeal(null)}
          activeUser={activeUser}
        />
      )}

      {/* AI Chat Slide-Over */}
      {showAiChat && (
        <AiChatPanel
          messages={chatMessages}
          input={chatInput}
          setInput={setChatInput}
          onSend={sendChat}
          loading={chatLoading}
          onClose={() => setShowAiChat(false)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════ */

/* ── AI Advisor Bar ── */
function AiAdvisorBar({ advice, loading, onRefresh, onChat }: { advice: string; loading: boolean; onRefresh: () => void; onChat: () => void }) {
  return (
    <div
      className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-violet-50/40"
      style={{ padding: "16px 20px", marginBottom: 16 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">AI Sales Advisor</span>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
              Analyzing pipeline...
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">{advice || "Add some deals to get AI-powered sales recommendations."}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 cursor-pointer transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={onChat}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition-colors"
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Pipeline Toggle ── */
function PipelineToggle({ active, onChange }: { active: PipelineType; onChange: (p: PipelineType) => void }) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-0.5">
      {([["mully", "Mully Golf"], ["mfs", "MFS 3PL"]] as [PipelineType, string][]).map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={[
            "px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all duration-150",
            active === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ── View Toggle ── */
function ViewToggle({ active, onChange }: { active: "kanban" | "table"; onChange: (v: "kanban" | "table") => void }) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-0.5">
      <button
        onClick={() => onChange("kanban")}
        className={[
          "px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all",
          active === "kanban" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400",
        ].join(" ")}
        title="Kanban"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </button>
      <button
        onClick={() => onChange("table")}
        className={[
          "px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all",
          active === "table" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400",
        ].join(" ")}
        title="Table"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-12.75m0 0A1.125 1.125 0 014.5 4.5h15a1.125 1.125 0 011.125 1.125m-17.25 0h7.5m0 0v12.75m0-12.75h9.75m-9.75 0v12.75m9.75-12.75v12.75m0 0h-9.75m9.75 0a1.125 1.125 0 01-1.125 1.125" />
        </svg>
      </button>
    </div>
  );
}

/* ── KPI Strip ── */
function KpiStrip({ kpis }: { kpis: { active: number; hot: number; qualified: number; closed: number; value: number } }) {
  const items = [
    { label: "Active Deals", value: String(kpis.active), color: "#3B82F6" },
    { label: "Hot List", value: String(kpis.hot), color: "#F59E0B", icon: "\u2605" },
    { label: "Qualified", value: String(kpis.qualified), color: "#8B5CF6" },
    { label: "Closed", value: String(kpis.closed), color: "#10B981" },
    { label: "Pipeline Value", value: fmtMoney(kpis.value), color: "#059669" },
  ];
  return (
    <div className="grid grid-cols-5 gap-3" style={{ marginBottom: 16 }}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl bg-white border border-gray-100 text-center"
          style={{ padding: "14px 8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="text-xl font-bold" style={{ color: item.color }}>
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.value}
          </div>
          <div className="text-[11px] text-gray-400 font-medium mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Search + Filters ── */
function SearchFilterBar({
  search, setSearch, stageFilter, setStageFilter, ownerFilter, setOwnerFilter, hotOnly, setHotOnly,
}: {
  search: string; setSearch: (s: string) => void;
  stageFilter: DealStage | "all"; setStageFilter: (s: DealStage | "all") => void;
  ownerFilter: string; setOwnerFilter: (s: string) => void;
  hotOnly: boolean; setHotOnly: (b: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 16 }}>
      <div className="relative flex-1 min-w-[200px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies, contacts, notes..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-gray-400 bg-white"
        />
      </div>
      <select
        value={stageFilter}
        onChange={(e) => setStageFilter(e.target.value as DealStage | "all")}
        className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white cursor-pointer focus:outline-none"
      >
        <option value="all">All Stages</option>
        {ALL_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select
        value={ownerFilter}
        onChange={(e) => setOwnerFilter(e.target.value)}
        className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white cursor-pointer focus:outline-none"
      >
        <option value="all">All Owners</option>
        {USERS.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
      </select>
      <button
        onClick={() => setHotOnly(!hotOnly)}
        className={[
          "px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all",
          hotOnly ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-gray-200 text-gray-500 hover:border-amber-300",
        ].join(" ")}
      >
        {"\u2605"} Hot
      </button>
    </div>
  );
}

/* ── Kanban Board ── */
function KanbanBoard({
  deals, onDragStart, onDrop, onDragOver, onSelect, onToggleStar,
}: {
  deals: Deal[];
  onDragStart: (id: string) => void;
  onDrop: (stage: DealStage) => void;
  onDragOver: (e: React.DragEvent) => void;
  onSelect: (id: string) => void;
  onToggleStar: (id: string) => void;
}) {
  const stages = [...DEAL_STAGES, ...DEAL_EXIT_STAGES];

  return (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
      {stages.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        const isExit = DEAL_EXIT_STAGES.includes(stage);
        const color = STAGE_COLORS[stage];

        return (
          <div
            key={stage}
            onDragOver={onDragOver}
            onDrop={() => onDrop(stage)}
            className={[
              "flex-shrink-0 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col",
              isExit ? "opacity-70" : "",
            ].join(" ")}
            style={{ width: isExit ? 160 : 180, minHeight: 300 }}
          >
            {/* Column header */}
            <div className="rounded-t-xl px-3 py-2.5" style={{ borderBottom: `3px solid ${color}` }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600" style={{ lineHeight: "1.2" }}>
                  {stage}
                </span>
                <span
                  className="text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center text-white"
                  style={{ background: color }}
                >
                  {stageDeals.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 flex flex-col gap-2">
              {stageDeals.map((deal) => {
                const days = daysSince(deal.lastActivity);
                const staleClass = days >= 14 ? "text-red-500" : days >= 7 ? "text-amber-500" : "text-gray-400";
                const ownerUser = USERS.find((u) => u.name === deal.dealOwner);

                return (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => onDragStart(deal.id)}
                    onClick={() => onSelect(deal.id)}
                    className="bg-white rounded-lg border border-gray-100 p-2.5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 group"
                    style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
                  >
                    {/* Top row: star + company */}
                    <div className="flex items-start gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleStar(deal.id); }}
                        className="cursor-pointer text-sm mt-0.5 flex-shrink-0"
                        style={{ color: deal.starred ? "#F59E0B" : "#E5E7EB" }}
                      >
                        {deal.starred ? "\u2605" : "\u2606"}
                      </button>
                      <span className="text-[13px] font-semibold text-gray-900 leading-tight line-clamp-2">{deal.company || "Untitled"}</span>
                    </div>
                    {/* Contact */}
                    {deal.contact.name && (
                      <div className="text-[11px] text-gray-400 mt-1 truncate pl-5">{deal.contact.name}</div>
                    )}
                    {/* Bottom: owner + days */}
                    <div className="flex items-center justify-between mt-2 pl-5">
                      {ownerUser ? (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                          style={{ background: ownerUser.color }}
                          title={ownerUser.name}
                        >
                          {ownerUser.initials}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
                      <span className={`text-[10px] font-medium ${staleClass}`}>{days}d ago</span>
                    </div>
                    {/* Value */}
                    {deal.value > 0 && (
                      <div className="text-[10px] font-semibold text-emerald-600 mt-1 pl-5">{fmtMoney(deal.value)}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Table View ── */
function TableView({
  deals, onSelect, onUpdate, onDelete,
}: {
  deals: Deal[];
  onSelect: (id: string) => void;
  onUpdate: (id: string, fn: (d: Deal) => void) => void;
  onDelete: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<"company" | "stage" | "value" | "lastActivity">("lastActivity");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const list = [...deals];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "company") cmp = a.company.localeCompare(b.company);
      else if (sortKey === "stage") cmp = ALL_STAGES.indexOf(a.stage) - ALL_STAGES.indexOf(b.stage);
      else if (sortKey === "value") cmp = a.value - b.value;
      else if (sortKey === "lastActivity") cmp = a.lastActivity.localeCompare(b.lastActivity);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [deals, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortHeader = ({ label, k }: { label: string; k: typeof sortKey }) => (
    <button onClick={() => toggleSort(k)} className="cursor-pointer hover:text-gray-600 transition-colors flex items-center gap-1">
      {label}
      {sortKey === k && <span className="text-[9px]">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>}
    </button>
  );

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div
        className="grid text-[11px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-50"
        style={{ gridTemplateColumns: "36px 1fr 120px 140px 100px 90px 80px 40px", padding: "10px 12px" }}
      >
        <span>{"\u2605"}</span>
        <SortHeader label="Company" k="company" />
        <span>Contact</span>
        <SortHeader label="Stage" k="stage" />
        <span>Owner</span>
        <SortHeader label="Value" k="value" />
        <SortHeader label="Activity" k="lastActivity" />
        <span />
      </div>

      {sorted.map((deal, i) => {
        const days = daysSince(deal.lastActivity);
        const staleClass = days >= 14 ? "text-red-500" : days >= 7 ? "text-amber-500" : "text-gray-400";

        return (
          <div
            key={deal.id}
            className="grid items-center group hover:bg-gray-50 cursor-pointer transition-colors"
            style={{
              gridTemplateColumns: "36px 1fr 120px 140px 100px 90px 80px 40px",
              padding: "8px 12px",
              borderTop: i > 0 ? "1px solid #F3F4F6" : "none",
              background: deal.starred ? "rgba(254,249,195,0.25)" : undefined,
            }}
            onClick={() => onSelect(deal.id)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onUpdate(deal.id, (d) => { d.starred = !d.starred; }); }}
              className="cursor-pointer text-sm"
              style={{ color: deal.starred ? "#F59E0B" : "#D1D5DB" }}
            >
              {deal.starred ? "\u2605" : "\u2606"}
            </button>
            <span className="text-[13px] font-medium text-gray-900 truncate">{deal.company || "Untitled"}</span>
            <span className="text-[12px] text-gray-500 truncate">{deal.contact.name}</span>
            <div>
              <Badge variant={deal.stage === "Signed" || deal.stage === "Paid" || deal.stage === "Onboarding" ? "emerald" : deal.stage === "Not Interested" ? "red" : deal.stage === "Parking Lot" ? "gray" : "blue"}>
                {deal.stage}
              </Badge>
            </div>
            <span className="text-[12px] text-gray-600 truncate">{deal.dealOwner || "—"}</span>
            <span className="text-[12px] font-medium text-gray-700">{deal.value > 0 ? fmtMoney(deal.value) : "—"}</span>
            <span className={`text-[11px] font-medium ${staleClass}`}>{days}d</span>
            <button
              onClick={(e) => { e.stopPropagation(); if (confirm("Delete this deal?")) onDelete(deal.id); }}
              className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}

      {sorted.length === 0 && (
        <div className="text-center text-sm text-gray-400 py-12">No deals found</div>
      )}
    </div>
  );
}

/* ── Deal Detail Panel (Slide-Over) ── */
function DealDetailPanel({
  deal, onUpdate, onDelete, onClose, activeUser,
}: {
  deal: Deal;
  onUpdate: (fn: (d: Deal) => void) => void;
  onDelete: () => void;
  onClose: () => void;
  activeUser: string;
}) {
  const [newNote, setNewNote] = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const addNote = () => {
    if (!newNote.trim()) return;
    onUpdate((d) => {
      d.notes.unshift({
        id: uid(),
        date: new Date().toISOString().slice(0, 10),
        author: activeUser,
        text: newNote.trim(),
      });
    });
    setNewNote("");
  };

  const addLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    onUpdate((d) => {
      d.links.push({ id: uid(), label: newLinkLabel.trim(), url: newLinkUrl.trim() });
    });
    setNewLinkLabel("");
    setNewLinkUrl("");
  };

  const stageColor = STAGE_COLORS[deal.stage];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[100] animate-fadeIn" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full bg-white border-l border-gray-200 z-[101] overflow-y-auto animate-slideIn"
        style={{ width: 420, maxWidth: "90vw" }}
      >
        <div style={{ padding: "24px 20px" }}>
          {/* Close + delete */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <IconX className="w-5 h-5" />
            </button>
            <button
              onClick={() => { if (confirm("Delete this deal?")) { onDelete(); onClose(); } }}
              className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
            >
              Delete Deal
            </button>
          </div>

          {/* Company name + star */}
          <div className="flex items-start gap-2 mb-4">
            <button
              onClick={() => onUpdate((d) => { d.starred = !d.starred; })}
              className="cursor-pointer text-xl mt-1"
              style={{ color: deal.starred ? "#F59E0B" : "#D1D5DB" }}
            >
              {deal.starred ? "\u2605" : "\u2606"}
            </button>
            <input
              value={deal.company}
              onChange={(e) => onUpdate((d) => { d.company = e.target.value; })}
              className="text-xl font-bold text-gray-900 bg-transparent focus:outline-none flex-1 min-w-0"
              placeholder="Company name..."
            />
          </div>

          {/* Stage */}
          <div className="mb-5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Stage</label>
            <select
              value={deal.stage}
              onChange={(e) => onUpdate((d) => { d.stage = e.target.value as DealStage; })}
              className="w-full px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer focus:outline-none"
              style={{ borderColor: stageColor, color: stageColor }}
            >
              {ALL_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Quick stage actions */}
            <div className="flex gap-2 mt-2">
              {deal.stage !== "Not Interested" && deal.stage !== "Parking Lot" && (
                <>
                  {DEAL_STAGES.indexOf(deal.stage) < DEAL_STAGES.length - 1 && (
                    <button
                      onClick={() => {
                        const idx = DEAL_STAGES.indexOf(deal.stage);
                        if (idx >= 0 && idx < DEAL_STAGES.length - 1) onUpdate((d) => { d.stage = DEAL_STAGES[idx + 1]; });
                      }}
                      className="text-[11px] px-2 py-1 rounded bg-emerald-50 text-emerald-600 font-medium cursor-pointer hover:bg-emerald-100 transition-colors"
                    >
                      Advance Stage &rarr;
                    </button>
                  )}
                  <button
                    onClick={() => onUpdate((d) => { d.stage = "Parking Lot"; })}
                    className="text-[11px] px-2 py-1 rounded bg-gray-100 text-gray-500 font-medium cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    Park
                  </button>
                  <button
                    onClick={() => onUpdate((d) => { d.stage = "Not Interested"; })}
                    className="text-[11px] px-2 py-1 rounded bg-red-50 text-red-500 font-medium cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    Lost
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">Contact</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={deal.contact.name}
                onChange={(e) => onUpdate((d) => { d.contact.name = e.target.value; })}
                placeholder="Name"
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              />
              <input
                value={deal.contact.title}
                onChange={(e) => onUpdate((d) => { d.contact.title = e.target.value; })}
                placeholder="Title"
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              />
              <input
                value={deal.contact.email}
                onChange={(e) => onUpdate((d) => { d.contact.email = e.target.value; })}
                placeholder="Email"
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              />
              <input
                value={deal.contact.phone}
                onChange={(e) => onUpdate((d) => { d.contact.phone = e.target.value; })}
                placeholder="Phone"
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {/* Details row */}
          <div className="mb-5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">Details</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-gray-400 mb-0.5 block">Deal Owner</span>
                <select
                  value={deal.dealOwner}
                  onChange={(e) => onUpdate((d) => { d.dealOwner = e.target.value; })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm cursor-pointer focus:outline-none"
                >
                  <option value="">—</option>
                  {USERS.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 mb-0.5 block">Account Owner</span>
                <select
                  value={deal.accountOwner}
                  onChange={(e) => onUpdate((d) => { d.accountOwner = e.target.value; })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm cursor-pointer focus:outline-none"
                >
                  <option value="">—</option>
                  {USERS.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 mb-0.5 block">Value ($)</span>
                <input
                  type="number"
                  value={deal.value || ""}
                  onChange={(e) => onUpdate((d) => { d.value = Number(e.target.value) || 0; })}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 mb-0.5 block">Created</span>
                <div className="px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-500">{deal.createdDate}</div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="mb-5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">Links</label>
            {deal.links.map((link) => (
              <div key={link.id} className="flex items-center gap-2 mb-1.5 group">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate flex-1"
                >
                  {link.label}
                </a>
                <button
                  onClick={() => onUpdate((d) => { d.links = d.links.filter((l) => l.id !== link.id); })}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                >
                  <IconX className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                placeholder="Label"
                className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-xs focus:outline-none"
              />
              <input
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="URL"
                className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-xs focus:outline-none"
              />
              <button
                onClick={addLink}
                className="px-2 py-1.5 rounded bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes Timeline */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">Notes</label>
            {/* Add note */}
            <div className="mb-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 resize-none"
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="mt-1 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 cursor-pointer transition-colors disabled:opacity-40"
              >
                Add Note
              </button>
            </div>

            {/* Notes list */}
            {deal.notes.map((note) => {
              const authorUser = USERS.find((u) => u.id === note.author);
              return (
                <div key={note.id} className="flex gap-2.5 mb-3 group">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0 mt-0.5"
                    style={{ background: authorUser?.color || "#9CA3AF" }}
                  >
                    {authorUser?.initials || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-gray-700">{authorUser?.name || note.author}</span>
                      <span className="text-[10px] text-gray-400">{note.date}</span>
                      <button
                        onClick={() => onUpdate((d) => { d.notes = d.notes.filter((n) => n.id !== note.id); })}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity ml-auto"
                      >
                        <IconX className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{note.text}</p>
                  </div>
                </div>
              );
            })}

            {deal.notes.length === 0 && (
              <p className="text-xs text-gray-400 italic">No notes yet</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── AI Chat Panel ── */
function AiChatPanel({
  messages, input, setInput, onSend, loading, onClose,
}: {
  messages: { role: "user" | "assistant"; text: string }[];
  input: string;
  setInput: (s: string) => void;
  onSend: () => void;
  loading: boolean;
  onClose: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[100] animate-fadeIn" onClick={onClose} />
      <div
        className="fixed top-0 right-0 h-full bg-white border-l border-gray-200 z-[101] flex flex-col animate-slideIn"
        style={{ width: 380, maxWidth: "90vw" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <span className="text-sm font-semibold text-gray-900">Chat with Sales Advisor</span>
            <p className="text-[11px] text-gray-400">Ask about your pipeline, strategy, next steps</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {messages.length === 0 && (
            <div className="text-center text-sm text-gray-400 mt-8">
              <p className="mb-2">Ask me anything about your pipeline.</p>
              <p className="text-xs text-gray-300">e.g. &ldquo;What should I prioritize this week?&rdquo;</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-3 ${msg.role === "user" ? "text-right" : ""}`}
            >
              <div
                className={[
                  "inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700",
                ].join(" ")}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder="Ask about your pipeline..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
            />
            <button
              onClick={onSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 cursor-pointer disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
