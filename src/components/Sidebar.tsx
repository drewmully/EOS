"use client";

import { UserProfile } from "@/lib/types";
import {
  IconToday,
  IconRocks,
  IconInbox,
  IconSeats,
  IconGrowth,
  IconVTO,
  IconChevron,
  IconX,
} from "./ui/Icons";

export type View = "today" | "rocks" | "inbox" | "seats" | "growth" | "vto";

const NAV: { key: View; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: "today", label: "Today", Icon: IconToday },
  { key: "rocks", label: "Rocks", Icon: IconRocks },
  { key: "inbox", label: "Inbox", Icon: IconInbox },
  { key: "seats", label: "Seats", Icon: IconSeats },
  { key: "growth", label: "Growth", Icon: IconGrowth },
  { key: "vto", label: "V/TO", Icon: IconVTO },
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
    syncStatus === "synced"
      ? "bg-emerald-400"
      : syncStatus === "syncing"
      ? "bg-amber-400 animate-pulse"
      : syncStatus === "error"
      ? "bg-red-400"
      : "bg-gray-500";

  const syncLabel =
    syncStatus === "synced"
      ? "Synced"
      : syncStatus === "syncing"
      ? "Syncing..."
      : syncStatus === "error"
      ? "Sync error"
      : "Local only";

  const activeUserObj = users.find((u) => u.id === activeUser);

  return (
    <aside
      className="hidden md:flex flex-col bg-[#0F172A] flex-shrink-0 select-none overflow-hidden"
      style={{
        width: collapsed ? 72 : 260,
        transition: "width 250ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Logo / Header */}
      <div className="px-5 pt-6 pb-4" style={{ minHeight: 64 }}>
        {collapsed ? (
          <div className="flex justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)] flex-shrink-0" />
              <span className="text-[14px] font-bold text-white tracking-wide whitespace-nowrap overflow-hidden">
                {activeUserObj ? `${activeUserObj.name.toUpperCase()}'S FOCUS` : "EOS FOCUS"}
              </span>
            </div>
            <div className="text-[12px] text-gray-500 mt-1 font-medium pl-5 whitespace-nowrap overflow-hidden">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
          </>
        )}
      </div>

      {/* Person Switcher */}
      <div className={collapsed ? "px-2 pb-4" : "px-4 pb-4"}>
        <div className={`flex ${collapsed ? "flex-col items-center gap-3" : "gap-2 justify-center"}`}>
          {users.map((u) => {
            const active = u.id === activeUser;
            return (
              <button
                key={u.id}
                onClick={() => setActiveUser(u.id)}
                className="flex flex-col items-center cursor-pointer transition-all duration-200"
                title={collapsed ? u.name : undefined}
              >
                <div
                  className="rounded-full flex items-center justify-center text-white font-bold transition-all duration-200"
                  style={{
                    width: collapsed ? 36 : 40,
                    height: collapsed ? 36 : 40,
                    fontSize: collapsed ? 11 : 12,
                    background: u.color,
                    opacity: active ? 1 : 0.45,
                    boxShadow: active
                      ? `0 0 0 2px #0F172A, 0 0 0 4px ${u.color}`
                      : "none",
                  }}
                >
                  {u.initials}
                </div>
                {!collapsed && (
                  <span
                    className="text-[10px] font-semibold mt-1.5 whitespace-nowrap transition-colors duration-200"
                    style={{ color: active ? u.color : "#6B7280" }}
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
      <div className="mx-4 h-px bg-white/[0.06] mb-2" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-1">
        {NAV.map(({ key, label, Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              title={collapsed ? label : undefined}
              className={[
                "w-full flex items-center gap-3 rounded-xl mb-0.5",
                collapsed ? "justify-center px-2 py-3" : "px-3.5 py-3",
                "cursor-pointer transition-all duration-150 group relative",
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]",
              ].join(" ")}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              )}
              <Icon
                className={[
                  "w-[18px] h-[18px] transition-colors duration-150 flex-shrink-0",
                  active ? "text-emerald-400" : "text-gray-600 group-hover:text-gray-400",
                ].join(" ")}
              />
              {!collapsed && (
                <span className={`text-[14px] whitespace-nowrap ${active ? "font-semibold" : "font-medium"}`}>
                  {label}
                </span>
              )}
              {key === "inbox" && inboxCount > 0 && (
                <span
                  className={[
                    "bg-indigo-500/90 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
                    collapsed ? "absolute -top-0.5 -right-0.5" : "ml-auto",
                  ].join(" ")}
                >
                  {inboxCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-gray-600 hover:text-gray-300 hover:bg-white/[0.04] cursor-pointer transition-all duration-150"
        >
          <div
            className="transition-transform duration-250"
            style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(90deg)" }}
          >
            <IconChevron className="w-4 h-4" />
          </div>
          {!collapsed && <span className="text-[12px] font-medium whitespace-nowrap">Collapse</span>}
        </button>
      </div>

      {/* Sync Status */}
      <div className={`py-4 border-t border-white/[0.06] ${collapsed ? "px-3" : "px-5"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${syncDot}`} />
          {!collapsed && (
            <span className="text-[12px] text-gray-600 font-medium whitespace-nowrap">{syncLabel}</span>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ── Mobile Top Bar ── */
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
  const syncDot =
    syncStatus === "synced"
      ? "bg-emerald-400"
      : syncStatus === "syncing"
      ? "bg-amber-400 animate-pulse"
      : syncStatus === "error"
      ? "bg-red-400"
      : "bg-gray-500";

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[56px] z-50 flex items-center justify-between px-4 bg-[#0F172A]">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 mr-1 flex-shrink-0" />
        {users.map((u) => {
          const active = u.id === activeUser;
          return (
            <button
              key={u.id}
              onClick={() => setActiveUser(u.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-all duration-200 flex-shrink-0"
              style={{
                background: u.color,
                opacity: active ? 1 : 0.35,
                boxShadow: active ? `0 0 0 2px #0F172A, 0 0 0 3px ${u.color}` : "none",
              }}
            >
              {u.initials}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${syncDot}`} />
        <button onClick={onMenuToggle} className="text-gray-400 hover:text-white cursor-pointer p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}

/* ── Mobile Bottom Nav ── */
export function MobileBottomNav({ view, setView, inboxCount }: { view: View; setView: (v: View) => void; inboxCount: number }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white/95 backdrop-blur-lg border-t border-gray-200/80 flex items-center justify-around z-50 px-1 pb-safe">
      {NAV.map(({ key, label, Icon }) => {
        const active = view === key;
        return (
          <button
            key={key}
            onClick={() => setView(key)}
            className="flex flex-col items-center gap-0.5 cursor-pointer relative min-w-[48px] py-1.5 transition-all duration-150"
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-colors duration-150 ${
                  active ? "text-emerald-600" : "text-gray-400"
                }`}
              />
              {key === "inbox" && inboxCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-indigo-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {inboxCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-semibold transition-colors duration-150 ${
                active ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {active && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-emerald-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
