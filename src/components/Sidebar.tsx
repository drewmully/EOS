"use client";

import { UserProfile } from "@/lib/types";
import {
  IconToday,
  IconRocks,
  IconInbox,
  IconSeats,
  IconGrowth,
  IconVTO,
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
}

export function Sidebar({
  view,
  setView,
  users,
  activeUser,
  setActiveUser,
  inboxCount,
  syncStatus,
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
    <aside className="hidden md:flex flex-col w-[272px] bg-[#0F172A] flex-shrink-0 select-none">
      {/* Logo / User header */}
      <div className="px-7 pt-7 pb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
          <span className="text-[15px] font-bold text-white tracking-wide">
            {activeUserObj ? `${activeUserObj.name.toUpperCase()}'S FOCUS` : "EOS FOCUS"}
          </span>
        </div>
        <div className="text-[13px] text-gray-500 mt-1 font-medium pl-5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Person Switcher */}
      <div className="px-5 pb-5">
        <div className="flex gap-3 justify-center">
          {users.map((u) => {
            const active = u.id === activeUser;
            return (
              <button
                key={u.id}
                onClick={() => setActiveUser(u.id)}
                className="flex flex-col items-center cursor-pointer transition-all duration-200"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold mb-1.5 transition-all duration-200"
                  style={{
                    background: u.color,
                    transform: active ? "scale(1.15)" : "scale(0.9)",
                    opacity: active ? 1 : 0.5,
                    boxShadow: active
                      ? `0 0 0 3px #0F172A, 0 0 0 5px ${u.color}, 0 6px 20px ${u.color}50`
                      : "none",
                  }}
                >
                  {u.initials}
                </div>
                <span
                  className="text-[11px] font-semibold transition-colors duration-200"
                  style={{ color: active ? u.color : "#6B7280" }}
                >
                  {u.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-white/[0.06] mb-3" />

      {/* Navigation */}
      <nav className="flex-1 px-4 py-1">
        {NAV.map(({ key, label, Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              className={[
                "w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl mb-1",
                "cursor-pointer transition-all duration-150 group relative",
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]",
              ].join(" ")}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              )}
              <Icon
                className={[
                  "w-5 h-5 transition-colors duration-150 flex-shrink-0",
                  active ? "text-emerald-400" : "text-gray-600 group-hover:text-gray-400",
                ].join(" ")}
              />
              <span className={`text-[15px] ${active ? "font-semibold" : "font-medium"}`}>
                {label}
              </span>
              {key === "inbox" && inboxCount > 0 && (
                <span className="ml-auto bg-indigo-500/90 text-white text-[11px] font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
                  {inboxCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sync Status */}
      <div className="px-7 py-5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${syncDot}`} />
          <span className="text-[13px] text-gray-600 font-medium">{syncLabel}</span>
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
    <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] z-50 flex items-center justify-between px-5 bg-[#0F172A] shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 mr-1" />
        {users.map((u) => {
          const active = u.id === activeUser;
          return (
            <button
              key={u.id}
              onClick={() => setActiveUser(u.id)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold cursor-pointer transition-all duration-200"
              style={{
                background: u.color,
                opacity: active ? 1 : 0.35,
                transform: active ? "scale(1.15)" : "scale(0.9)",
                boxShadow: active ? `0 0 0 2px #0F172A, 0 0 0 3.5px ${u.color}` : "none",
              }}
            >
              {u.initials}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${syncDot}`} />
        <button onClick={onMenuToggle} className="text-gray-400 hover:text-white cursor-pointer p-1.5">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[76px] bg-white/95 backdrop-blur-lg border-t border-gray-200/80 flex items-start justify-around z-50 px-2 pt-2.5 pb-safe">
      {NAV.map(({ key, label, Icon }) => {
        const active = view === key;
        return (
          <button
            key={key}
            onClick={() => setView(key)}
            className="flex flex-col items-center gap-1 cursor-pointer relative min-w-[52px] py-2 transition-all duration-150"
          >
            <div className="relative">
              <Icon
                className={`w-[22px] h-[22px] transition-colors duration-150 ${
                  active ? "text-emerald-600" : "text-gray-400"
                }`}
              />
              {key === "inbox" && inboxCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-indigo-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {inboxCount}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] font-semibold transition-colors duration-150 ${
                active ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {active && (
              <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-10 h-[3px] rounded-full bg-emerald-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
