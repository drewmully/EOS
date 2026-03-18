"use client";

import { UserProfile } from "@/lib/types";
import {
  IconToday,
  IconRocks,
  IconInbox,
  IconSeats,
  IconGrowth,
  IconVTO,
  IconIDS,
  IconScorecard,
  IconLinks,
  IconMarketing,
  IconPipeline,
} from "./ui/Icons";

export type View = "today" | "rocks" | "inbox" | "seats" | "growth" | "vto" | "ids" | "scorecard" | "marketing" | "pipeline" | "links";

const NAV: { key: View; label: string; Icon: React.FC<{ className?: string }>; divider?: boolean }[] = [
  { key: "today", label: "Today", Icon: IconToday },
  { key: "rocks", label: "Rocks", Icon: IconRocks },
  { key: "inbox", label: "Inbox", Icon: IconInbox },
  { key: "seats", label: "Seats", Icon: IconSeats },
  { key: "growth", label: "Growth", Icon: IconGrowth },
  { key: "vto", label: "V/TO", Icon: IconVTO },
  { key: "ids", label: "IDS", Icon: IconIDS, divider: true },
  { key: "scorecard", label: "Scorecard", Icon: IconScorecard },
  { key: "marketing", label: "Marketing", Icon: IconMarketing },
  { key: "pipeline", label: "Pipeline", Icon: IconPipeline },
  { key: "links", label: "Links", Icon: IconLinks },
];

interface SidebarProps {
  view: View;
  setView: (v: View) => void;
  users: UserProfile[];
  activeUser: string;
  setActiveUser: (id: string) => void;
  inboxCount: number;
  syncStatus: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({
  view,
  setView,
  users,
  activeUser,
  setActiveUser,
  inboxCount,
  syncStatus,
  collapsed,
  onToggle,
}: SidebarProps) {
  const syncDot =
    syncStatus === "synced" ? "bg-emerald-400"
    : syncStatus === "syncing" ? "bg-amber-400 animate-pulse"
    : syncStatus === "error" ? "bg-red-400"
    : "bg-gray-400";

  return (
    <aside
      className="hidden md:flex flex-col bg-white border-r border-gray-200 flex-shrink-0 select-none"
      style={{
        width: collapsed ? 60 : 240,
        transition: "width 200ms ease",
      }}
    >
      {/* Person Switcher */}
      <div style={{ padding: collapsed ? "48px 8px 24px" : "48px 20px 24px" }}>
        <div className="flex justify-center" style={{ gap: collapsed ? 12 : 20, flexDirection: collapsed ? "column" : "row", alignItems: collapsed ? "center" : undefined }}>
          {users.map((u) => {
            const active = u.id === activeUser;
            return (
              <button
                key={u.id}
                onClick={() => setActiveUser(u.id)}
                className="flex flex-col items-center cursor-pointer transition-all duration-150"
                title={u.name}
              >
                <div
                  className="rounded-full flex items-center justify-center text-white font-semibold transition-all duration-150"
                  style={{
                    width: collapsed ? 36 : 42,
                    height: collapsed ? 36 : 42,
                    fontSize: 13,
                    background: u.color,
                    opacity: active ? 1 : 0.35,
                    boxShadow: active ? `0 0 0 2px white, 0 0 0 3.5px ${u.color}` : "none",
                  }}
                >
                  {u.initials}
                </div>
                {!collapsed && (
                  <span
                    className="text-xs font-medium mt-1.5 whitespace-nowrap"
                    style={{ color: active ? u.color : "#9CA3AF" }}
                  >
                    {u.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-gray-100" />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "20px 16px", overflowY: "auto" }}>
        {NAV.map(({ key, label, Icon, divider }) => {
          const active = view === key;
          return (
            <div key={key}>
            {divider && <div className="mx-1 my-2 h-px bg-gray-100" />}
            <button
              onClick={() => setView(key)}
              title={collapsed ? label : undefined}
              style={{
                padding: collapsed ? "14px 12px" : "14px 16px",
                marginBottom: 8,
                gap: 14,
              }}
              className={[
                "w-full flex items-center rounded-xl",
                collapsed ? "justify-center" : "",
                "cursor-pointer transition-all duration-150 relative",
                active
                  ? "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              <Icon
                className={[
                  "w-[22px] h-[22px] flex-shrink-0",
                  active ? "text-gray-900" : "",
                ].join(" ")}
              />
              {!collapsed && (
                <span className={`text-[16px] whitespace-nowrap ${active ? "font-semibold" : "font-medium"}`}>
                  {label}
                </span>
              )}
              {key === "inbox" && inboxCount > 0 && (
                <span
                  className={[
                    "bg-gray-900 text-white text-[11px] font-semibold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1",
                    collapsed ? "absolute -top-0.5 -right-0.5" : "ml-auto",
                  ].join(" ")}
                >
                  {inboxCount}
                </span>
              )}
            </button>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle — double chevron with label */}
      <div style={{ padding: "4px 12px 8px" }}>
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors duration-100"
          style={{ padding: "10px 12px" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            {collapsed ? (
              <>
                <path d="M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : (
              <>
                <path d="M11 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
          </svg>
          {!collapsed && (
            <span className="text-xs font-medium">Collapse</span>
          )}
        </button>
      </div>

      {/* Sync */}
      <div className={`py-3 border-t border-gray-100 ${collapsed ? "px-3" : "px-5"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${syncDot}`} />
          {!collapsed && (
            <span className="text-xs text-gray-400 font-medium">
              {syncStatus === "synced" ? "Synced" : syncStatus === "syncing" ? "Syncing..." : syncStatus === "error" ? "Error" : "Local"}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ── Mobile Header ── */
export function MobileHeader({
  users,
  activeUser,
  setActiveUser,
  syncStatus,
  onMenuToggle,
}: {
  users: UserProfile[];
  activeUser: string;
  setActiveUser: (id: string) => void;
  syncStatus: string;
  onMenuToggle: () => void;
}) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-1.5">
        {users.map((u) => {
          const active = u.id === activeUser;
          return (
            <button
              key={u.id}
              onClick={() => setActiveUser(u.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-semibold cursor-pointer transition-all duration-150 flex-shrink-0"
              style={{
                background: u.color,
                opacity: active ? 1 : 0.3,
                boxShadow: active ? `0 0 0 1.5px white, 0 0 0 2.5px ${u.color}` : "none",
              }}
            >
              {u.initials}
            </button>
          );
        })}
      </div>
      <button onClick={onMenuToggle} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>
    </header>
  );
}

/* ── Mobile Bottom Nav ── */
export function MobileBottomNav({ view, setView, inboxCount }: { view: View; setView: (v: View) => void; inboxCount: number }) {
  const mobileNav = NAV.slice(0, 6); // Core 6 views only; shared views via hamburger menu
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-around z-50 px-1 pb-safe">
      {mobileNav.map(({ key, label, Icon }) => {
        const active = view === key;
        return (
          <button
            key={key}
            onClick={() => setView(key)}
            className="flex flex-col items-center gap-0.5 cursor-pointer relative min-w-[44px] py-1 transition-colors duration-100"
          >
            <div className="relative">
              <Icon
                className={`w-[18px] h-[18px] ${active ? "text-gray-900" : "text-gray-400"}`}
              />
              {key === "inbox" && inboxCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-gray-900 text-white text-[7px] font-semibold rounded-full w-3 h-3 flex items-center justify-center">
                  {inboxCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] ${active ? "font-semibold text-gray-900" : "font-medium text-gray-400"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
