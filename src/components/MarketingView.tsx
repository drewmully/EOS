"use client";

import { useState, useRef, useCallback } from "react";
import {
  SharedData,
  MarketingStage,
  MarketingChannel,
  ContentItem,
  MarketingTask,
  Campaign,
  Learning,
  StageStatus,
  ContentStatus,
  USERS,
} from "@/lib/types";
import { uid } from "@/lib/utils";
import { IconPlus } from "./ui/Icons";

/* ══════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ══════════════════════════════════════════════════ */

const STAGE_COLORS = [
  { accent: "#0D9488", bg: "#F0FDFA", ring: "#99F6E4", gradient: "from-teal-500 to-emerald-500" },
  { accent: "#3B82F6", bg: "#EFF6FF", ring: "#BFDBFE", gradient: "from-blue-500 to-indigo-500" },
  { accent: "#8B5CF6", bg: "#F5F3FF", ring: "#DDD6FE", gradient: "from-violet-500 to-purple-500" },
  { accent: "#F59E0B", bg: "#FFFBEB", ring: "#FDE68A", gradient: "from-amber-500 to-orange-500" },
];

const STATUS_CFG: Record<ContentStatus, { label: string; color: string; bg: string; dot: string }> = {
  idea:      { label: "Idea",      color: "#6B7280", bg: "#F3F4F6", dot: "#9CA3AF" },
  draft:     { label: "Draft",     color: "#3B82F6", bg: "#DBEAFE", dot: "#60A5FA" },
  review:    { label: "Review",    color: "#D97706", bg: "#FEF3C7", dot: "#FBBF24" },
  scheduled: { label: "Scheduled", color: "#7C3AED", bg: "#EDE9FE", dot: "#A78BFA" },
  live:      { label: "Live",      color: "#059669", bg: "#D1FAE5", dot: "#34D399" },
};

const STAGE_STATUS_CFG: Record<StageStatus, { label: string; color: string; bg: string }> = {
  locked:   { label: "Locked",   color: "#9CA3AF", bg: "#F3F4F6" },
  planning: { label: "Planning", color: "#3B82F6", bg: "#DBEAFE" },
  active:   { label: "Active",   color: "#059669", bg: "#D1FAE5" },
  review:   { label: "Review",   color: "#D97706", bg: "#FEF3C7" },
  complete: { label: "Done",     color: "#7C3AED", bg: "#EDE9FE" },
};

const CONTENT_STATUSES: ContentStatus[] = ["idea", "draft", "review", "scheduled", "live"];

const CHANNEL_ICONS: Record<string, string> = {
  "Email": "\u2709\uFE0F", "SMS": "\uD83D\uDCF1", "In-App": "\uD83D\uDD14", "On-Site": "\uD83C\uDF10",
  "Direct Mail": "\uD83D\uDCEC", "Instagram": "\uD83D\uDCF8", "Facebook": "\uD83D\uDC4D",
  "Meta Ads": "\uD83C\uDFAF", "Google Ads": "\uD83D\uDD0D", "Influencer": "\u2B50", "Social": "\uD83D\uDCE3",
};

function getChannelIcon(ch: MarketingChannel): string {
  return ch.icon || CHANNEL_ICONS[ch.name] || "\uD83D\uDCE2";
}

type SubView = "pipeline" | "calendar" | "learnings";

function todayISO() { return new Date().toISOString().slice(0, 10); }

function fmtDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function newContent(order: number): ContentItem {
  return { id: uid(), title: "", type: "", status: "idea", body: "", assignee: "", scheduledDate: "", order, tags: [] };
}

/* ══════════════════════════════════════════════════
   FIBONACCI SPIRAL
   ══════════════════════════════════════════════════ */

function FibSpiral({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" strokeWidth={2.5} strokeLinecap="round">
      <defs>
        <linearGradient id="spiralG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D9488" />
          <stop offset="33%" stopColor="#3B82F6" />
          <stop offset="66%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <path d="M50 50 A8 8 0 0 1 42 50 A13 13 0 0 1 55 37 A21 21 0 0 1 71 58 A34 34 0 0 1 37 79" stroke="url(#spiralG)" />
      <circle cx="50" cy="50" r="2.5" fill="#0D9488" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   CONTENT CARD — the core draggable unit
   ══════════════════════════════════════════════════ */

function ContentCard({
  item,
  channelColor,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
  expanded,
  onToggle,
}: {
  item: ContentItem;
  channelColor: string;
  onUpdate: (patch: Partial<ContentItem>) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const st = STATUS_CFG[item.status] || STATUS_CFG.idea;

  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }}
      onDragEnd={onDragEnd}
      className="rounded-lg border bg-white shadow-sm hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing group"
      style={{ borderColor: expanded ? channelColor + "60" : "#E5E7EB", borderLeftWidth: 3, borderLeftColor: channelColor }}
    >
      {/* Card header — always visible */}
      <div className="flex items-start gap-2" style={{ padding: "10px 12px 8px" }} onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.dot }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: st.color }}>{st.label}</span>
            {item.scheduledDate && (
              <span className="text-[10px] text-gray-400 ml-auto">{fmtDate(item.scheduledDate)}</span>
            )}
          </div>
          {expanded ? (
            <input
              value={item.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="text-[13px] font-semibold text-gray-900 bg-transparent focus:outline-none w-full border-b border-transparent focus:border-gray-200"
              placeholder="Content title..."
            />
          ) : (
            <p className="text-[13px] font-semibold text-gray-900 truncate">{item.title || "Untitled"}</p>
          )}
          {!expanded && item.body && (
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.body.slice(0, 60)}</p>
          )}
        </div>
        {/* Assignee avatar */}
        {item.assignee && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
            style={{ background: USERS.find((u) => u.name === item.assignee)?.color || "#9CA3AF" }}
            title={item.assignee}
          >
            {item.assignee.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Tags row */}
      {!expanded && (item.type || (item.tags && item.tags.length > 0)) && (
        <div className="flex items-center gap-1 flex-wrap" style={{ padding: "0 12px 8px" }}>
          {item.type && (
            <span className="text-[9px] font-medium bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{item.type}</span>
          )}
          {(item.tags || []).map((t, i) => (
            <span key={i} className="text-[9px] font-medium bg-gray-50 text-gray-400 rounded px-1.5 py-0.5">{t}</span>
          ))}
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 12px 12px" }} onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Type</label>
              <input
                value={item.type}
                onChange={(e) => onUpdate({ type: e.target.value })}
                className="w-full text-[12px] text-gray-700 bg-gray-50 rounded-md border border-gray-200 focus:outline-none focus:border-gray-300 px-2.5 py-1.5"
                placeholder="Email, Ad, Social..."
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Assignee</label>
              <select
                value={item.assignee}
                onChange={(e) => onUpdate({ assignee: e.target.value })}
                className="w-full text-[12px] text-gray-700 bg-gray-50 rounded-md border border-gray-200 focus:outline-none px-2.5 py-1.5 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {USERS.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Status</label>
              <select
                value={item.status}
                onChange={(e) => onUpdate({ status: e.target.value as ContentStatus })}
                className="w-full text-[12px] text-gray-700 bg-gray-50 rounded-md border border-gray-200 focus:outline-none px-2.5 py-1.5 cursor-pointer"
              >
                {CONTENT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-medium">Send Date</label>
              <input
                type="date"
                value={item.scheduledDate}
                onChange={(e) => onUpdate({ scheduledDate: e.target.value })}
                className="w-full text-[12px] text-gray-700 bg-gray-50 rounded-md border border-gray-200 focus:outline-none px-2.5 py-1.5 cursor-pointer"
              />
            </div>
          </div>

          <label className="text-[10px] text-gray-400 font-medium">Tags</label>
          <input
            value={(item.tags || []).join(", ")}
            onChange={(e) => onUpdate({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
            className="w-full text-[12px] text-gray-700 bg-gray-50 rounded-md border border-gray-200 focus:outline-none px-2.5 py-1.5 mb-2"
            placeholder="promo, urgency, educational..."
          />

          <label className="text-[10px] text-gray-400 font-medium">Body / Brief</label>
          <textarea
            value={item.body}
            onChange={(e) => onUpdate({ body: e.target.value })}
            className="w-full text-[12px] text-gray-700 bg-gray-50 rounded-md border border-gray-200 focus:outline-none resize-none px-2.5 py-1.5"
            rows={4}
            placeholder="Draft copy, creative brief, or notes..."
          />

          <div className="flex justify-end mt-2">
            <button onClick={onDelete} className="text-[11px] text-red-400 hover:text-red-600 cursor-pointer">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   KANBAN BOARD — content pipeline per campaign
   ══════════════════════════════════════════════════ */

function CampaignKanban({
  campaign,
  channelColor,
  stageIdx,
  channelIdx,
  campaignIdx,
  updateShared,
}: {
  campaign: Campaign;
  channelColor: string;
  stageIdx: number;
  channelIdx: number;
  campaignIdx: number;
  updateShared: (fn: (d: SharedData) => void) => void;
}) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const dragItem = useRef<{ id: string; fromStatus: ContentStatus } | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<ContentStatus | null>(null);

  function updateContent(contentIdx: number, patch: Partial<ContentItem>) {
    updateShared((d) => {
      const item = d.marketing.stages[stageIdx].channels[channelIdx].campaigns[campaignIdx].content[contentIdx];
      Object.assign(item, patch);
    });
  }

  function deleteContent(contentIdx: number) {
    updateShared((d) => {
      d.marketing.stages[stageIdx].channels[channelIdx].campaigns[campaignIdx].content.splice(contentIdx, 1);
    });
    setExpandedCard(null);
  }

  function addContent(status: ContentStatus) {
    const maxOrder = campaign.content.reduce((m, c) => Math.max(m, c.order || 0), 0);
    updateShared((d) => {
      d.marketing.stages[stageIdx].channels[channelIdx].campaigns[campaignIdx].content.push({ ...newContent(maxOrder + 1), status });
    });
  }

  function handleDrop(targetStatus: ContentStatus) {
    if (!dragItem.current) return;
    const { id } = dragItem.current;
    updateShared((d) => {
      const item = d.marketing.stages[stageIdx].channels[channelIdx].campaigns[campaignIdx].content.find((c) => c.id === id);
      if (item) item.status = targetStatus;
    });
    dragItem.current = null;
    setDragOverStatus(null);
  }

  const contentByStatus = (status: ContentStatus) =>
    campaign.content
      .map((c, i) => ({ ...c, _idx: i }))
      .filter((c) => c.status === status)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="flex gap-2 overflow-x-auto pb-2" style={{ minHeight: 100 }}>
      {CONTENT_STATUSES.map((status) => {
        const items = contentByStatus(status);
        const cfg = STATUS_CFG[status];
        const isOver = dragOverStatus === status;

        return (
          <div
            key={status}
            className="flex-1 min-w-[140px] rounded-lg transition-colors duration-150"
            style={{ background: isOver ? cfg.bg : "#FAFBFC", padding: 6 }}
            onDragOver={(e) => { e.preventDefault(); setDragOverStatus(status); }}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={(e) => { e.preventDefault(); handleDrop(status); }}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                {items.length > 0 && (
                  <span className="text-[9px] text-gray-400 font-medium">{items.length}</span>
                )}
              </div>
              <button
                onClick={() => addContent(status)}
                className="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-white cursor-pointer transition-colors"
              >
                <IconPlus className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-1.5">
              {items.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  channelColor={channelColor}
                  onUpdate={(patch) => updateContent(item._idx, patch)}
                  onDelete={() => deleteContent(item._idx)}
                  onDragStart={() => { dragItem.current = { id: item.id, fromStatus: item.status }; }}
                  onDragEnd={() => { dragItem.current = null; setDragOverStatus(null); }}
                  expanded={expandedCard === item.id}
                  onToggle={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
                />
              ))}
            </div>

            {items.length === 0 && !isOver && (
              <div className="text-center py-3">
                <p className="text-[9px] text-gray-300">Drop here</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CAMPAIGN SECTION — collapsible campaign within a channel
   ══════════════════════════════════════════════════ */

function CampaignSection({
  campaign,
  channelColor,
  stageIdx,
  channelIdx,
  campaignIdx,
  updateShared,
}: {
  campaign: Campaign;
  channelColor: string;
  stageIdx: number;
  channelIdx: number;
  campaignIdx: number;
  updateShared: (fn: (d: SharedData) => void) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalItems = campaign.content.length;
  const liveItems = campaign.content.filter((c) => c.status === "live" || c.status === "scheduled").length;

  return (
    <div
      className="rounded-lg border overflow-hidden transition-all"
      style={{ borderColor: expanded ? channelColor + "30" : "#F3F4F6", background: expanded ? "#FEFEFE" : "#FAFBFC" }}
    >
      <div
        className="flex items-center gap-2.5 cursor-pointer select-none"
        style={{ padding: "8px 12px" }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-1.5 h-5 rounded-full" style={{ background: channelColor + "60" }} />
        {expanded ? (
          <input
            value={campaign.name}
            onChange={(e) => updateShared((d) => { d.marketing.stages[stageIdx].channels[channelIdx].campaigns[campaignIdx].name = e.target.value; })}
            onClick={(e) => e.stopPropagation()}
            className="text-[13px] font-semibold text-gray-800 bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300 flex-1"
            placeholder="Campaign name..."
          />
        ) : (
          <span className="text-[13px] font-semibold text-gray-800 flex-1">{campaign.name || "Untitled Campaign"}</span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] text-gray-400">{totalItems} items</span>
          {liveItems > 0 && (
            <span className="text-[9px] font-semibold rounded-full px-1.5 py-0.5" style={{ background: STATUS_CFG.live.bg, color: STATUS_CFG.live.color }}>
              {liveItems} live
            </span>
          )}
          <svg
            className="w-3 h-3 text-gray-400 transition-transform duration-200"
            style={{ transform: expanded ? "rotate(180deg)" : "none" }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
          >
            <path strokeLinecap="round" d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "4px 10px 10px" }}>
          <CampaignKanban
            campaign={campaign}
            channelColor={channelColor}
            stageIdx={stageIdx}
            channelIdx={channelIdx}
            campaignIdx={campaignIdx}
            updateShared={updateShared}
          />
          <div className="flex justify-end mt-1">
            <button
              onClick={() => {
                if (confirm(`Delete "${campaign.name}" campaign?`)) {
                  updateShared((d) => { d.marketing.stages[stageIdx].channels[channelIdx].campaigns.splice(campaignIdx, 1); });
                }
              }}
              className="text-[10px] text-gray-300 hover:text-red-500 cursor-pointer"
            >
              Remove campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PIPELINE VIEW — stages with channel kanban boards
   ══════════════════════════════════════════════════ */

function PipelineView({ shared, updateShared }: Props) {
  const [expandedStage, setExpandedStage] = useState<string | null>(
    shared.marketing.stages.find((s) => s.status === "active")?.id || null
  );
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const stages = shared.marketing.stages;

  function updateStage(idx: number, fn: (s: MarketingStage) => void) {
    updateShared((d) => { fn(d.marketing.stages[idx]); });
  }

  function canUnlock(idx: number) {
    if (idx === 0) return true;
    const prev = stages[idx - 1];
    return prev.status === "complete" || prev.status === "review";
  }

  function channelContentCount(ch: MarketingChannel) {
    const campaignContent = (ch.campaigns || []).reduce((n, camp) => n + camp.content.length, 0);
    return ch.content.length + campaignContent;
  }

  function channelLiveCount(ch: MarketingChannel) {
    const fromContent = ch.content.filter((c) => c.status === "live" || c.status === "scheduled").length;
    const fromCampaigns = (ch.campaigns || []).reduce((n, camp) =>
      n + camp.content.filter((c) => c.status === "live" || c.status === "scheduled").length, 0);
    return fromContent + fromCampaigns;
  }

  function channelCampaignCount(ch: MarketingChannel) {
    return (ch.campaigns || []).length;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {stages.map((stage, idx) => {
        const sc = STAGE_COLORS[idx] || STAGE_COLORS[0];
        const badge = STAGE_STATUS_CFG[stage.status];
        const expanded = expandedStage === stage.id;
        const isLocked = false; // No locked rings — all stages accessible
        const totalContent = stage.channels.reduce((n, ch) => n + channelContentCount(ch), 0);
        const totalTasks = stage.tasks.length;
        const doneTasks = stage.tasks.filter((t) => t.done).length;

        return (
          <div
            key={stage.id}
            className="rounded-2xl border overflow-hidden transition-all duration-200"
            style={{
              borderColor: expanded ? sc.ring : "#E5E7EB",
              background: "#FFFFFF",
              opacity: isLocked ? 0.55 : 1,
            }}
          >
            {/* Stage header bar */}
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              style={{ padding: "16px 20px" }}
              onClick={() => setExpandedStage(expanded ? null : stage.id)}
            >
              {/* Stage number with gradient */}
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${sc.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm`}
              >
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {expanded ? (
                    <input
                      value={stage.name}
                      onChange={(e) => updateStage(idx, (s) => { s.name = e.target.value; })}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[16px] font-bold text-gray-900 bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300"
                    />
                  ) : (
                    <span className="text-[16px] font-bold text-gray-900">{stage.name}</span>
                  )}
                  {expanded ? (
                    <input
                      value={stage.subtitle}
                      onChange={(e) => updateStage(idx, (s) => { s.subtitle = e.target.value; })}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[13px] text-gray-400 bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300"
                    />
                  ) : (
                    <span className="text-[13px] text-gray-400">{stage.subtitle}</span>
                  )}
                </div>
                {/* Mini stats */}
                {!expanded && (
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-gray-400">{stage.channels.length} channels</span>
                    <span className="text-[11px] text-gray-400">{totalContent} content</span>
                    {totalTasks > 0 && <span className="text-[11px] text-gray-400">{doneTasks}/{totalTasks} tasks</span>}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {expanded && stage.status !== "locked" ? (
                  <select
                    value={stage.status}
                    onChange={(e) => { e.stopPropagation(); updateStage(idx, (s) => { s.status = e.target.value as StageStatus; }); }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] font-semibold rounded-full px-3 py-1 cursor-pointer border-none focus:outline-none"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="review">Review</option>
                    <option value="complete">Done</option>
                  </select>
                ) : (
                  <span className="text-[11px] font-semibold rounded-full px-3 py-1" style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                )}

                {isLocked && canUnlock(idx) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); updateStage(idx, (s) => { s.status = "planning"; }); }}
                    className={`text-[11px] font-semibold px-3 py-1 rounded-full cursor-pointer text-white bg-gradient-to-r ${sc.gradient}`}
                  >
                    Unlock
                  </button>
                )}

                {!isLocked && (
                  <svg
                    className="w-4 h-4 text-gray-400 transition-transform duration-200"
                    style={{ transform: expanded ? "rotate(180deg)" : "none" }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                  >
                    <path strokeLinecap="round" d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </div>
            </div>

            {/* Expanded stage body */}
            {expanded && !isLocked && (
              <div style={{ padding: "0 20px 20px" }}>
                {/* Segment */}
                <div className="mb-4">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Target Segment</label>
                  <textarea
                    value={stage.segment}
                    onChange={(e) => updateStage(idx, (s) => { s.segment = e.target.value; })}
                    className="w-full mt-1 text-[13px] text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:border-gray-300 focus:outline-none resize-none"
                    style={{ padding: "10px 12px" }}
                    rows={2}
                  />
                </div>

                {/* Channels — each with its own Kanban */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Channels</span>
                    <button
                      onClick={() => updateStage(idx, (s) => {
                        s.channels.push({ id: uid(), name: "", icon: "", color: "#6B7280", content: [], campaigns: [] });
                      })}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <IconPlus className="w-3 h-3" /> Add Channel
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {stage.channels.map((ch, ci) => {
                      const chExpanded = expandedChannel === ch.id;
                      const campaigns = ch.campaigns || [];
                      return (
                        <div
                          key={ch.id}
                          className="rounded-xl border overflow-hidden transition-all"
                          style={{ borderColor: chExpanded ? ch.color + "40" : "#E5E7EB" }}
                        >
                          {/* Channel header */}
                          <div
                            className="flex items-center gap-2.5 cursor-pointer select-none"
                            style={{ padding: "10px 14px", background: chExpanded ? ch.color + "08" : "#FAFBFC" }}
                            onClick={() => setExpandedChannel(chExpanded ? null : ch.id)}
                          >
                            {chExpanded ? (
                              <>
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: ch.color + "15" }}
                                >
                                  <span className="text-[16px]">{getChannelIcon(ch)}</span>
                                </div>
                                <input
                                  value={ch.name}
                                  onChange={(e) => updateStage(idx, (s) => { s.channels[ci].name = e.target.value; })}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[14px] font-semibold text-gray-900 bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300 flex-1"
                                />
                                <input
                                  type="color"
                                  value={ch.color}
                                  onChange={(e) => updateStage(idx, (s) => { s.channels[ci].color = e.target.value; })}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-5 h-5 rounded cursor-pointer"
                                  title="Channel color"
                                />
                              </>
                            ) : (
                              <>
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: ch.color + "15" }}
                                >
                                  <span className="text-[16px]">{getChannelIcon(ch)}</span>
                                </div>
                                <span className="text-[14px] font-semibold text-gray-900">{ch.name || "Unnamed"}</span>
                              </>
                            )}
                            <div className="ml-auto flex items-center gap-3">
                              <span className="text-[11px] text-gray-400">{channelCampaignCount(ch)} campaigns</span>
                              <span className="text-[11px] text-gray-400">{channelContentCount(ch)} items</span>
                              {channelLiveCount(ch) > 0 && (
                                <span className="text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ background: STATUS_CFG.live.bg, color: STATUS_CFG.live.color }}>
                                  {channelLiveCount(ch)} live
                                </span>
                              )}
                              <svg
                                className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
                                style={{ transform: chExpanded ? "rotate(180deg)" : "none" }}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                              >
                                <path strokeLinecap="round" d="M6 9l6 6 6-6" />
                              </svg>
                            </div>
                          </div>

                          {/* Expanded channel — campaigns */}
                          {chExpanded && (
                            <div style={{ padding: "8px 14px 14px" }}>
                              {campaigns.length === 0 && (
                                <div className="text-center py-6 rounded-lg border border-dashed border-gray-200">
                                  <p className="text-[12px] text-gray-400">No campaigns yet</p>
                                  <p className="text-[10px] text-gray-300 mt-0.5">Add a campaign to start planning content</p>
                                </div>
                              )}
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {campaigns.map((camp, cmpIdx) => (
                                  <CampaignSection
                                    key={camp.id}
                                    campaign={camp}
                                    channelColor={ch.color}
                                    stageIdx={idx}
                                    channelIdx={ci}
                                    campaignIdx={cmpIdx}
                                    updateShared={updateShared}
                                  />
                                ))}
                              </div>

                              {/* Add campaign + delete channel */}
                              <div className="flex items-center justify-between mt-3">
                                <button
                                  onClick={() => updateStage(idx, (s) => {
                                    if (!s.channels[ci].campaigns) s.channels[ci].campaigns = [];
                                    s.channels[ci].campaigns.push({ id: uid(), name: "", content: [] });
                                  })}
                                  className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                  <IconPlus className="w-3 h-3" /> Add Campaign
                                </button>
                                <button
                                  onClick={() => { if (confirm(`Delete "${ch.name}" channel?`)) updateStage(idx, (s) => { s.channels.splice(ci, 1); }); }}
                                  className="text-[11px] text-gray-300 hover:text-red-500 cursor-pointer"
                                >
                                  Remove channel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tasks */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tasks</span>
                    <button
                      onClick={() => updateStage(idx, (s) => { s.tasks.push({ id: uid(), text: "", assignee: "", due: "", done: false }); })}
                      className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <IconPlus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  {stage.tasks.map((task, ti) => (
                    <div key={task.id} className="flex items-center gap-2 group mb-1">
                      <button
                        onClick={() => updateStage(idx, (s) => { s.tasks[ti].done = !s.tasks[ti].done; })}
                        className="w-4.5 h-4.5 rounded-md border-2 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all"
                        style={{
                          borderColor: task.done ? sc.accent : "#D1D5DB",
                          background: task.done ? sc.accent : "transparent",
                        }}
                      >
                        {task.done && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" d="M5 13l4 4L19 7" /></svg>}
                      </button>
                      <input
                        value={task.text}
                        onChange={(e) => updateStage(idx, (s) => { s.tasks[ti].text = e.target.value; })}
                        className="flex-1 text-[13px] bg-transparent focus:outline-none"
                        style={{ color: task.done ? "#9CA3AF" : "#374151", textDecoration: task.done ? "line-through" : "none" }}
                        placeholder="Task..."
                      />
                      <select
                        value={task.assignee}
                        onChange={(e) => updateStage(idx, (s) => { s.tasks[ti].assignee = e.target.value; })}
                        className="text-[11px] text-gray-500 bg-transparent focus:outline-none cursor-pointer"
                      >
                        <option value="">—</option>
                        {USERS.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
                      </select>
                      <input
                        type="date"
                        value={task.due}
                        onChange={(e) => updateStage(idx, (s) => { s.tasks[ti].due = e.target.value; })}
                        className="text-[11px] text-gray-500 bg-transparent focus:outline-none cursor-pointer"
                      />
                      <button
                        onClick={() => updateStage(idx, (s) => { s.tasks.splice(ti, 1); })}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Feedback */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Stage Feedback</label>
                  <p className="text-[10px] text-gray-400 mb-1">What worked? Key metrics? Capture before expanding to the next ring.</p>
                  <textarea
                    value={stage.feedback}
                    onChange={(e) => updateStage(idx, (s) => { s.feedback = e.target.value; })}
                    className="w-full text-[13px] text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:border-gray-300 focus:outline-none resize-none"
                    style={{ padding: "10px 12px" }}
                    rows={3}
                    placeholder="What worked? What didn't? Key numbers..."
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add stage */}
      <button
        onClick={() => updateShared((d) => {
          d.marketing.stages.push({
            id: uid(), name: `Level ${d.marketing.stages.length + 1}`, subtitle: "Custom Segment",
            status: "locked", segment: "", channels: [], tasks: [], feedback: "",
          });
        })}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-2xl border border-dashed border-gray-200 cursor-pointer transition-colors"
        style={{ padding: "14px 0" }}
      >
        <IconPlus className="w-3 h-3" /> Add Stage
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CALENDAR VIEW — shows when content goes out
   ══════════════════════════════════════════════════ */

function CalendarView({ shared }: Props) {
  const [monthOffset, setMonthOffset] = useState(0);
  const stages = shared.marketing.stages;

  const now = new Date();
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const monthName = viewMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function dateISO(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // Collect all scheduled/live content across all stages, channels, and campaigns
  type ScheduledItem = { content: ContentItem; stage: MarketingStage; channel: MarketingChannel; stageIdx: number };
  const allScheduled: ScheduledItem[] = [];
  for (const [si, stage] of stages.entries()) {
    for (const ch of stage.channels) {
      for (const c of ch.content) {
        if (c.scheduledDate) {
          allScheduled.push({ content: c, stage, channel: ch, stageIdx: si });
        }
      }
      for (const camp of (ch.campaigns || [])) {
        for (const c of camp.content) {
          if (c.scheduledDate) {
            allScheduled.push({ content: c, stage, channel: ch, stageIdx: si });
          }
        }
      }
    }
  }

  function itemsForDay(day: number): ScheduledItem[] {
    const iso = dateISO(day);
    return allScheduled.filter((s) => s.content.scheduledDate === iso);
  }

  // This week's upcoming
  const today = todayISO();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekISO = nextWeek.toISOString().slice(0, 10);
  const upcoming = allScheduled
    .filter((s) => s.content.scheduledDate >= today && s.content.scheduledDate <= nextWeekISO)
    .sort((a, b) => a.content.scheduledDate.localeCompare(b.content.scheduledDate));

  return (
    <div>
      {/* Upcoming strip */}
      {upcoming.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 mb-4" style={{ padding: "12px 16px" }}>
          <span className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">Next 7 Days</span>
          <div className="flex gap-3 mt-2 overflow-x-auto pb-1">
            {upcoming.map((s) => (
              <div key={s.content.id} className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 flex-shrink-0">
                <span className="text-[13px]">{getChannelIcon(s.channel)}</span>
                <div>
                  <p className="text-[12px] font-semibold text-gray-900">{s.content.title || "Untitled"}</p>
                  <p className="text-[10px] text-gray-400">{fmtDate(s.content.scheduledDate)} &middot; {s.channel.name} &middot; {s.stage.name}</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_CFG[s.content.status]?.dot || "#9CA3AF" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setMonthOffset((o) => o - 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-[15px] font-bold text-gray-900 min-w-[170px] text-center">{monthName}</span>
          <button onClick={() => setMonthOffset((o) => o + 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          <button onClick={() => setMonthOffset(0)} className="px-3 h-8 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">This Month</button>
        </div>

        {/* Channel legend */}
        <div className="hidden md:flex items-center gap-3 flex-wrap">
          {stages.flatMap((s) => s.channels).filter((ch, i, arr) => arr.findIndex((c) => c.name === ch.name) === i).map((ch) => (
            <div key={ch.id} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded" style={{ background: ch.color }} />
              <span className="text-[10px] text-gray-500 font-medium">{ch.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center" style={{ padding: "10px 4px" }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = day ? dateISO(day) === today : false;
            const items = day ? itemsForDay(day) : [];
            return (
              <div
                key={i}
                className="border-t border-gray-100 min-h-[85px] relative"
                style={{ padding: "4px 5px", background: isToday ? "#F0FDFA" : day ? "white" : "#FAFBFC" }}
              >
                {day && (
                  <>
                    <span className={`text-[12px] ${isToday ? "font-bold text-teal-600 bg-teal-100 rounded-full w-6 h-6 flex items-center justify-center" : "text-gray-500"}`}>{day}</span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {items.slice(0, 3).map((s) => (
                        <div
                          key={s.content.id}
                          className="rounded px-1.5 py-0.5 truncate flex items-center gap-1"
                          style={{ background: s.channel.color + "15", fontSize: 10, fontWeight: 600, color: s.channel.color }}
                        >
                          <span>{getChannelIcon(s.channel)}</span>
                          <span className="truncate">{s.content.title || s.content.type || "Content"}</span>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <span className="text-[9px] text-gray-400 font-medium px-1.5">+{items.length - 3} more</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats footer */}
      <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400">
        <span>{allScheduled.filter((s) => s.content.status === "scheduled").length} scheduled</span>
        <span>{allScheduled.filter((s) => s.content.status === "live").length} live</span>
        <span>{allScheduled.filter((s) => s.content.scheduledDate >= today).length} upcoming</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   LEARNINGS VIEW
   ══════════════════════════════════════════════════ */

function LearningsView({ shared, updateShared }: Props) {
  const [stageFilter, setStageFilter] = useState<string>("all");
  const stages = shared.marketing.stages;
  const learnings = shared.marketing.learnings;

  const filtered = stageFilter === "all" ? learnings : learnings.filter((l) => l.stageId === stageFilter);
  const sorted = [...filtered].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  function addLearning() {
    updateShared((d) => {
      d.marketing.learnings.unshift({
        id: uid(), date: todayISO(), stageId: stages.find((s) => s.status === "active")?.id || stages[0]?.id || "",
        text: "", metric: "", insight: "",
      });
    });
  }

  function updateLearning(id: string, patch: Partial<Learning>) {
    updateShared((d) => {
      const l = d.marketing.learnings.find((x) => x.id === id);
      if (l) Object.assign(l, patch);
    });
  }

  function deleteLearning(id: string) {
    updateShared((d) => {
      const idx = d.marketing.learnings.findIndex((x) => x.id === id);
      if (idx >= 0) d.marketing.learnings.splice(idx, 1);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-[12px] text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none px-3 py-1.5 cursor-pointer"
          >
            <option value="all">All Stages</option>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button
          onClick={addLearning}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-white cursor-pointer bg-gradient-to-r from-teal-500 to-emerald-500 shadow-sm"
        >
          <IconPlus className="w-3 h-3" /> Add Learning
        </button>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-400 font-medium">No learnings yet</p>
          <p className="text-xs text-gray-300 mt-1">Capture insights as you go — each stage gets smarter.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((learning) => {
          const stageIdx = stages.findIndex((s) => s.id === learning.stageId);
          const sc = STAGE_COLORS[stageIdx] || STAGE_COLORS[0];
          const stageName = stages[stageIdx]?.name || "—";

          return (
            <div key={learning.id} className="rounded-xl border border-gray-200 bg-white group hover:border-gray-300 transition-colors" style={{ padding: 16 }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <select
                    value={learning.stageId}
                    onChange={(e) => updateLearning(learning.id, { stageId: e.target.value })}
                    className="text-[11px] font-semibold rounded-full px-2.5 py-0.5 border-none focus:outline-none cursor-pointer"
                    style={{ background: sc.bg, color: sc.accent }}
                  >
                    {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input
                    type="date"
                    value={learning.date}
                    onChange={(e) => updateLearning(learning.id, { date: e.target.value })}
                    className="text-[11px] text-gray-400 bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>
                <button
                  onClick={() => { if (confirm("Delete?")) deleteLearning(learning.id); }}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <textarea
                value={learning.text}
                onChange={(e) => updateLearning(learning.id, { text: e.target.value })}
                className="w-full text-[13px] text-gray-700 bg-transparent focus:outline-none resize-none mb-2"
                rows={2}
                placeholder="What did we learn?"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 font-medium">Metric / Data</label>
                  <input
                    value={learning.metric}
                    onChange={(e) => updateLearning(learning.id, { metric: e.target.value })}
                    className="w-full text-[12px] text-gray-600 bg-gray-50 rounded-md border border-gray-200 focus:outline-none px-2.5 py-1.5"
                    placeholder="e.g. 23% open rate, 4.2% CTR..."
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-medium">Insight / So What</label>
                  <input
                    value={learning.insight}
                    onChange={(e) => updateLearning(learning.id, { insight: e.target.value })}
                    className="w-full text-[12px] text-gray-600 bg-gray-50 rounded-md border border-gray-200 focus:outline-none px-2.5 py-1.5"
                    placeholder="e.g. Subject lines with urgency perform 2x..."
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   AI PANEL
   ══════════════════════════════════════════════════ */

function AIPanel({ shared, onClose }: { shared: SharedData; onClose: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  function buildContext() {
    const m = shared.marketing;
    const parts: string[] = ["# Fibonacci Marketing Plan\n"];
    for (const [i, stage] of m.stages.entries()) {
      parts.push(`## Stage ${i + 1}: ${stage.name} (${stage.subtitle}) — ${stage.status}`);
      parts.push(`Segment: ${stage.segment}`);
      for (const ch of stage.channels) {
        const campCount = (ch.campaigns || []).length;
        parts.push(`Channel: ${ch.name} — ${campCount} campaigns, ${ch.content.length} legacy items`);
        for (const camp of (ch.campaigns || [])) {
          parts.push(`  Campaign: ${camp.name} — ${camp.content.length} items`);
          for (const c of camp.content) {
            parts.push(`    - ${c.title || "untitled"} [${c.status}]${c.scheduledDate ? " scheduled " + c.scheduledDate : ""}`);
          }
        }
      }
      if (stage.feedback) parts.push(`Feedback: ${stage.feedback}`);
    }
    if (m.learnings.length) {
      parts.push("\n## Learnings");
      for (const l of m.learnings.slice(0, 10)) {
        parts.push(`- ${l.text}${l.metric ? ` (${l.metric})` : ""}${l.insight ? ` → ${l.insight}` : ""}`);
      }
    }
    return parts.join("\n");
  }

  async function send() {
    if (!prompt.trim()) return;
    const userMsg = prompt.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setPrompt("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a marketing strategy assistant for Mully, a DTC subscription brand. Help with content creation, campaign planning, and optimization. Be concise and actionable.\n\n${buildContext()}`,
          message: userMsg,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.response || "No response" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Could not reach AI. Ensure ANTHROPIC_API_KEY is set." }]);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white border-l border-gray-200 z-[100] flex flex-col shadow-2xl animate-slideIn">
      <div className="flex items-center justify-between border-b border-gray-100" style={{ padding: "14px 18px" }}>
        <div className="flex items-center gap-2.5">
          <FibSpiral size={22} />
          <span className="text-[14px] font-bold text-gray-900">Ask Claude</span>
          <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">AI</span>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: 18 }}>
        {messages.length === 0 && (
          <div className="text-center py-10">
            <FibSpiral size={48} />
            <p className="text-[14px] text-gray-600 mt-4 font-semibold">Marketing AI</p>
            <p className="text-[12px] text-gray-400 mt-1">Draft content, plan campaigns, or analyze learnings.</p>
            <div className="mt-5 flex flex-col gap-2">
              {[
                "Draft a re-launch email for active subscribers",
                "What should Stage 2 strategy look like?",
                "Suggest 3 SMS messages for our rollout",
                "Summarize our learnings so far",
              ].map((q) => (
                <button key={q} onClick={() => setPrompt(q)} className="text-[12px] text-left text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 hover:border-gray-300 hover:bg-gray-100 cursor-pointer transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`mb-3 ${msg.role === "user" ? "flex justify-end" : ""}`}>
            <div
              className={`inline-block text-[13px] rounded-2xl max-w-[90%] ${
                msg.role === "user" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-700 border border-gray-200"
              }`}
              style={{ padding: "10px 14px", whiteSpace: "pre-wrap" }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
            Thinking...
          </div>
        )}
      </div>

      <div className="border-t border-gray-100" style={{ padding: "14px 18px" }}>
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            className="flex-1 text-[13px] text-gray-700 bg-gray-50 rounded-xl border border-gray-200 focus:border-gray-300 focus:outline-none px-4 py-2.5"
            placeholder="Ask about your marketing plan..."
          />
          <button
            onClick={send}
            disabled={loading || !prompt.trim()}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white cursor-pointer disabled:opacity-40 bg-gradient-to-r from-teal-500 to-emerald-500 shadow-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════ */

interface Props {
  shared: SharedData;
  updateShared: (fn: (d: SharedData) => void) => void;
}

export function MarketingView({ shared, updateShared }: Props) {
  const [subView, setSubView] = useState<SubView>("pipeline");
  const [showAI, setShowAI] = useState(false);
  const stages = shared.marketing.stages;

  const activeStage = stages.find((s) => s.status === "active" || s.status === "review");
  function allContent(ch: MarketingChannel): ContentItem[] {
    const fromCampaigns = (ch.campaigns || []).flatMap((camp) => camp.content);
    return [...ch.content, ...fromCampaigns];
  }
  const totalContent = stages.reduce((n, s) => s.channels.reduce((m, ch) => m + allContent(ch).length, n), 0);
  const totalScheduled = stages.reduce((n, s) => s.channels.reduce((m, ch) => m + allContent(ch).filter((c) => c.scheduledDate).length, n), 0);
  const totalLive = stages.reduce((n, s) => s.channels.reduce((m, ch) => m + allContent(ch).filter((c) => c.status === "live").length, n), 0);
  const totalCampaigns = stages.reduce((n, s) => s.channels.reduce((m, ch) => m + (ch.campaigns || []).length, n), 0);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-3.5">
          <FibSpiral size={48} />
          <div>
            <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Fibonacci Marketing</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">Start tight, learn fast, expand with precision</p>
          </div>
        </div>

        <button
          onClick={() => setShowAI(!showAI)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all shadow-sm"
          style={{
            background: showAI ? "linear-gradient(135deg, #0D9488, #059669)" : "#F0FDFA",
            color: showAI ? "white" : "#0D9488",
            border: "1px solid",
            borderColor: showAI ? "transparent" : "#99F6E4",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Ask Claude
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Active Stage", value: activeStage?.name || "—", sub: activeStage?.subtitle || "", color: "#0D9488" },
          { label: "Campaigns", value: String(totalCampaigns), sub: `${totalContent} content`, color: "#3B82F6" },
          { label: "Scheduled", value: String(totalScheduled), sub: `${totalLive} live`, color: "#7C3AED" },
          { label: "Stages Done", value: `${stages.filter((s) => s.status === "complete").length}/${stages.length}`, sub: "completed", color: "#F59E0B" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white border border-gray-200 overflow-hidden" style={{ padding: "14px 16px" }}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-[20px] font-bold mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[11px] text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Sub-view tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-gray-100/80 p-1 mb-5" style={{ width: "fit-content" }}>
        {([
          { key: "pipeline" as SubView, label: "Pipeline", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
          { key: "calendar" as SubView, label: "Calendar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
          { key: "learnings" as SubView, label: "Learnings", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
        ]).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setSubView(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all ${
              subView === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
            {label}
          </button>
        ))}
      </div>

      {subView === "pipeline" && <PipelineView shared={shared} updateShared={updateShared} />}
      {subView === "calendar" && <CalendarView shared={shared} updateShared={updateShared} />}
      {subView === "learnings" && <LearningsView shared={shared} updateShared={updateShared} />}

      {showAI && <AIPanel shared={shared} onClose={() => setShowAI(false)} />}
    </div>
  );
}
