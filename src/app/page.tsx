"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import {
  UserData,
  UserProfile,
  USERS,
  Rock,
  Priority,
  GrowthAction,
} from "@/lib/types";
import { SEED_DATA } from "@/lib/seed";
import { loadUserData, saveUserData, getSupabase } from "@/lib/supabase";
import { uid, daysUntil, pct, fmtDate, urgencyScore, urgencyLabel } from "@/lib/utils";

type View = "today" | "rocks" | "inbox" | "seats" | "growth" | "vto";

const STATUS_COLORS: Record<string, { bg: string; tx: string; ring: string }> = {
  "On Track": { bg: "#DCFCE7", tx: "#16A34A", ring: "#22C55E" },
  "At Risk": { bg: "#FEF3C7", tx: "#D97706", ring: "#F59E0B" },
  "Off Track": { bg: "#FEE2E2", tx: "#DC2626", ring: "#EF4444" },
  Done: { bg: "#E0E7FF", tx: "#4F46E5", ring: "#6366F1" },
};

const BIZ_COLORS: Record<string, { bg: string; tx: string; bd: string }> = {
  MFS: { bg: "#E6F7F5", tx: "#0D9488", bd: "#0D9488" },
  Mully: { bg: "#FEF3C7", tx: "#B45309", bd: "#F59E0B" },
};

const NAV_ITEMS: { key: View; label: string; icon: string }[] = [
  { key: "today", label: "Today", icon: "◉" },
  { key: "rocks", label: "Rocks", icon: "⛰" },
  { key: "inbox", label: "Inbox", icon: "📥" },
  { key: "seats", label: "Seats", icon: "🚪" },
  { key: "growth", label: "Growth", icon: "📈" },
  { key: "vto", label: "V/TO", icon: "🧭" },
];

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#0D9488", "#6366F1", "#F59E0B", "#22C55E"],
  });
}

function fireMiniConfetti() {
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.8 },
    startVelocity: 20,
    colors: ["#0D9488", "#22C55E"],
  });
}

export default function Page() {
  const [activeUser, setActiveUser] = useState<string>("drew");
  const [allData, setAllData] = useState<Record<string, UserData>>({});
  const [view, setView] = useState<View>("today");
  const [expRock, setExpRock] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [inboxInput, setInboxInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error" | "local">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = allData[activeUser] || null;
  const user = USERS.find((u) => u.id === activeUser)!;

  // Load data for all users
  useEffect(() => {
    async function init() {
      const sb = getSupabase();
      const loaded: Record<string, UserData> = {};
      if (sb) {
        try {
          setSyncStatus("syncing");
          for (const u of USERS) {
            const cloud = await loadUserData(u.id);
            if (cloud) {
              loaded[u.id] = cloud as UserData;
            } else {
              loaded[u.id] = SEED_DATA[u.id];
              await saveUserData(u.id, SEED_DATA[u.id]);
            }
          }
          setSyncStatus("synced");
        } catch {
          setSyncStatus("error");
          for (const u of USERS) loaded[u.id] = SEED_DATA[u.id];
        }
      } else {
        // No Supabase — use localStorage
        setSyncStatus("local");
        for (const u of USERS) {
          try {
            const local = localStorage.getItem(`eos-focus-${u.id}`);
            loaded[u.id] = local ? JSON.parse(local) : SEED_DATA[u.id];
          } catch {
            loaded[u.id] = SEED_DATA[u.id];
          }
        }
      }
      // Ensure growth + todayPriorities format
      for (const u of USERS) {
        const d = loaded[u.id];
        if (!d.growth) d.growth = SEED_DATA[u.id].growth;
        if (!d.todayPriorities || typeof d.todayPriorities[0] === "string") {
          d.todayPriorities = (d.todayPriorities as unknown as string[]).map(
            (t: string) => ({ text: t || "", done: false })
          );
        }
        if (d.streakDays === undefined) d.streakDays = 0;
        if (!d.lastActiveDate) d.lastActiveDate = "";
      }
      setAllData(loaded);
      setLoading(false);
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update streak
  useEffect(() => {
    if (!data) return;
    const today = new Date().toISOString().slice(0, 10);
    if (data.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      update((d) => {
        if (d.lastActiveDate === yesterday) {
          d.streakDays = (d.streakDays || 0) + 1;
        } else if (d.lastActiveDate !== today) {
          d.streakDays = 1;
        }
        d.lastActiveDate = today;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUser, data?.lastActiveDate]);

  const cloudSave = useCallback(
    (userId: string, userData: UserData) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const sb = getSupabase();
        if (sb) {
          try {
            setSyncStatus("syncing");
            await saveUserData(userId, userData);
            setSyncStatus("synced");
          } catch {
            setSyncStatus("error");
          }
        } else {
          try {
            localStorage.setItem(`eos-focus-${userId}`, JSON.stringify(userData));
          } catch { /* ignore */ }
        }
      }, 600);
    },
    []
  );

  const update = useCallback(
    (fn: (d: UserData) => void) => {
      setAllData((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        fn(next[activeUser]);
        cloudSave(activeUser, next[activeUser]);
        return next;
      });
    },
    [activeUser, cloudSave]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading your focus system...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const syncDot =
    syncStatus === "synced"
      ? "bg-green-500"
      : syncStatus === "syncing"
      ? "bg-yellow-500 animate-pulse"
      : syncStatus === "error"
      ? "bg-red-500"
      : "bg-slate-400";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-navy flex-shrink-0" style={{ background: "#1B2A4A" }}>
        <div className="p-4 pb-3 border-b border-white/10">
          <div className="text-teal-400 text-xs font-extrabold tracking-widest">EOS FOCUS</div>
          <div className="text-white/40 text-xs mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </div>
        </div>

        {/* Person Switcher */}
        <div className="px-3 pt-3 pb-1">
          <div className="text-white/30 text-[10px] font-bold tracking-wider mb-2 px-1">TEAM</div>
          <div className="flex gap-1.5 mb-2">
            {USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => setActiveUser(u.id)}
                className="flex-1 flex flex-col items-center py-1.5 rounded-lg transition-all"
                style={{
                  background: activeUser === u.id ? u.color + "22" : "transparent",
                  border: activeUser === u.id ? `2px solid ${u.color}` : "2px solid transparent",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold mb-0.5"
                  style={{ background: u.color }}
                >
                  {u.initials}
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: activeUser === u.id ? u.color : "rgba(255,255,255,0.5)" }}
                >
                  {u.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="px-2 flex-1">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.key}
              onClick={() => setView(n.key)}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 mb-0.5 rounded-lg text-[13px] transition-all"
              style={{
                background: view === n.key ? "rgba(13,148,136,0.15)" : "transparent",
                color: view === n.key ? "#14B8A6" : "rgba(255,255,255,0.55)",
                fontWeight: view === n.key ? 600 : 400,
              }}
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
              {n.key === "inbox" && data.inbox.length > 0 && (
                <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {data.inbox.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sync Status */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/40 text-[10px]">
            <div className={`w-2 h-2 rounded-full ${syncDot}`} />
            {syncStatus === "synced" && "Synced"}
            {syncStatus === "syncing" && "Syncing..."}
            {syncStatus === "error" && "Sync error"}
            {syncStatus === "local" && "Local only"}
            {syncStatus === "idle" && ""}
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4" style={{ background: "#1B2A4A" }}>
        <div className="flex items-center gap-3">
          {USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => setActiveUser(u.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all"
              style={{
                background: u.color,
                opacity: activeUser === u.id ? 1 : 0.4,
                transform: activeUser === u.id ? "scale(1.15)" : "scale(1)",
                boxShadow: activeUser === u.id ? `0 0 0 2px white` : "none",
              }}
            >
              {u.initials}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${syncDot}`} />
          <button
            onClick={() => setMobileNav(!mobileNav)}
            className="text-white text-xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileNav && (
        <div className="fixed inset-0 z-[200] flex md:hidden">
          <div className="w-60 bg-[#1B2A4A] p-4">
            <div className="text-teal-400 text-xs font-extrabold tracking-widest mb-4">EOS FOCUS</div>
            {NAV_ITEMS.map((n) => (
              <button
                key={n.key}
                onClick={() => { setView(n.key); setMobileNav(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-3 rounded-lg text-sm mb-1"
                style={{
                  background: view === n.key ? "rgba(13,148,136,0.15)" : "transparent",
                  color: view === n.key ? "#14B8A6" : "rgba(255,255,255,0.55)",
                  fontWeight: view === n.key ? 600 : 400,
                }}
              >
                <span className="text-lg">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileNav(false)} />
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50 px-1">
        {NAV_ITEMS.map((n) => (
          <button
            key={n.key}
            onClick={() => setView(n.key)}
            className="flex flex-col items-center gap-0.5 relative px-2 py-1"
          >
            <span className={`text-lg ${view === n.key ? "" : "opacity-40"}`}>{n.icon}</span>
            <span
              className="text-[9px] font-semibold"
              style={{ color: view === n.key ? "#0D9488" : "#94A3B8" }}
            >
              {n.label}
            </span>
            {view === n.key && (
              <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-teal-500" />
            )}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 pb-20 md:pt-0 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 md:px-7 py-6">
          {view === "today" && (
            <TodayView data={data} user={user} update={update} setView={setView} setExpRock={setExpRock} />
          )}
          {view === "rocks" && (
            <RocksView data={data} update={update} expRock={expRock} setExpRock={setExpRock} user={user} />
          )}
          {view === "inbox" && (
            <InboxView data={data} update={update} input={inboxInput} setInput={setInboxInput} />
          )}
          {view === "seats" && <SeatsView data={data} update={update} />}
          {view === "growth" && <GrowthView data={data} update={update} user={user} />}
          {view === "vto" && <VTOView />}
        </div>
      </main>
    </div>
  );
}

/* ── Today View ───────────────────────────────────────────── */
function TodayView({
  data, user, update, setView, setExpRock,
}: {
  data: UserData; user: UserProfile; update: (fn: (d: UserData) => void) => void;
  setView: (v: View) => void; setExpRock: (id: string) => void;
}) {
  const hr = new Date().getHours();
  const greeting = hr < 12 ? "morning" : hr < 17 ? "afternoon" : "evening";

  // Sort rocks by urgency
  const sortedRocks = [...data.rocks].sort((a, b) => urgencyScore(b) - urgencyScore(a));

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-extrabold text-slate-800">
            Good {greeting}, {user.name}
          </h1>
          {data.streakDays > 1 && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">
              🔥 {data.streakDays} day streak
            </span>
          )}
        </div>
        <p className="text-slate-400 text-sm">Here&apos;s what matters today.</p>
      </div>

      {/* Rock Cards with Urgency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {sortedRocks.map((rock) => {
          const p = pct(rock);
          const days = daysUntil(rock.due);
          const sc = STATUS_COLORS[rock.status] || STATUS_COLORS["On Track"];
          const bc = BIZ_COLORS[rock.biz] || BIZ_COLORS.MFS;
          const urg = urgencyLabel(urgencyScore(rock));

          return (
            <div
              key={rock.id}
              onClick={() => { setExpRock(rock.id); setView("rocks"); }}
              className="bg-white rounded-xl p-4 cursor-pointer card-hover border border-slate-100"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: bc.tx, background: bc.bg }}>
                  {rock.biz}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: urg.color, background: urg.bg }}>
                  {urg.text}
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-800 mb-3 leading-snug min-h-[36px]">
                {rock.name || "(unnamed)"}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${p}%`, background: `linear-gradient(90deg, ${sc.ring}, ${sc.ring}dd)` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-500">{p}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: sc.tx, background: sc.bg }}>
                  {rock.status}
                </span>
                <span className={`text-[10px] font-medium ${days < 0 ? "text-red-500 font-bold" : days <= 7 ? "text-amber-500" : "text-slate-400"}`}>
                  {days > 0 ? `${days}d left` : days === 0 ? "Due today!" : `${Math.abs(days)}d overdue`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top 3 Priorities - NOW WITH CHECKBOXES */}
      <div className="bg-white rounded-xl p-5 mb-4 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
          <span className="text-base">⭐</span> Top 3 Priorities Today
        </h3>
        {data.todayPriorities.map((p: Priority, i: number) => (
          <div key={i} className="flex items-center gap-3 mb-2 group">
            <button
              onClick={() => {
                const wasDone = p.done;
                update((d) => { d.todayPriorities[i].done = !wasDone; });
                if (!wasDone && p.text) fireMiniConfetti();
              }}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                borderColor: p.done ? "#0D9488" : "#D1D5DB",
                background: p.done ? "#0D9488" : "transparent",
              }}
            >
              {p.done && (
                <svg className="w-3.5 h-3.5 text-white animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className="text-sm font-bold text-slate-300 w-4">{i + 1}</span>
            <input
              value={p.text}
              onChange={(e) => {
                const v = e.target.value;
                update((d) => { d.todayPriorities[i].text = v; });
              }}
              placeholder="What's most important?"
              className={`flex-1 bg-transparent border border-transparent hover:border-slate-200 focus:border-teal-500 rounded-lg px-3 py-2 text-sm transition-all ${p.done ? "line-through text-slate-400" : "text-slate-700"}`}
            />
          </div>
        ))}
      </div>

      {/* To-Do List */}
      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-teal-700 flex items-center gap-2">
            <span className="text-base">✓</span> To-Do List
          </h3>
          <button
            onClick={() => update((d) => { d.todos.push({ id: uid(), text: "", due: "", done: false }); })}
            className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            + Add
          </button>
        </div>
        {data.todos.length === 0 && (
          <p className="text-slate-400 text-xs py-4 text-center">No to-dos yet. Add one above.</p>
        )}
        {data.todos.map((todo, i) => (
          <div key={todo.id} className="flex items-center gap-2 mb-1.5 group" style={{ opacity: todo.done ? 0.45 : 1 }}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => {
                const wasDone = todo.done;
                update((d) => { d.todos[i].done = !wasDone; });
                if (!wasDone && todo.text) fireMiniConfetti();
              }}
              className="w-4 h-4 flex-shrink-0"
            />
            <input
              value={todo.text}
              onChange={(e) => { const v = e.target.value; update((d) => { d.todos[i].text = v; }); }}
              placeholder="To-do..."
              className={`flex-1 bg-transparent border-b border-slate-100 py-1.5 text-xs focus:border-teal-500 transition-colors ${todo.done ? "line-through" : ""}`}
            />
            <input
              type="date"
              value={todo.due}
              onChange={(e) => { const v = e.target.value; update((d) => { d.todos[i].due = v; }); }}
              className="w-[110px] bg-transparent border-b border-slate-100 py-1.5 text-[10px] text-slate-400"
            />
            <button
              onClick={() => update((d) => { d.todos.splice(i, 1); })}
              className="text-slate-300 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Rocks View ───────────────────────────────────────────── */
function RocksView({
  data, update, expRock, setExpRock, user,
}: {
  data: UserData; update: (fn: (d: UserData) => void) => void;
  expRock: string | null; setExpRock: (id: string | null) => void; user: UserProfile;
}) {
  return (
    <div className="animate-slide-up">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-800">{user.name}&apos;s Rocks — Q2 2026</h1>
        <p className="text-slate-400 text-sm mt-0.5">Click to expand. Edit anything inline.</p>
      </div>
      {data.rocks.map((rock, ri) => {
        const open = expRock === rock.id;
        const p = pct(rock);
        const sc = STATUS_COLORS[rock.status] || STATUS_COLORS["On Track"];
        const bc = BIZ_COLORS[rock.biz] || BIZ_COLORS.MFS;
        const days = daysUntil(rock.due);
        const urg = urgencyLabel(urgencyScore(rock));

        return (
          <div
            key={rock.id}
            className={`bg-white rounded-xl mb-3 overflow-hidden transition-all border ${open ? "border-slate-300 shadow-md" : "border-slate-100"}`}
          >
            {/* Header */}
            <div
              onClick={() => setExpRock(open ? null : rock.id)}
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {/* Progress Ring */}
              <div className="relative w-11 h-11 flex-shrink-0">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                  <circle
                    cx="22" cy="22" r="18" fill="none" stroke={sc.ring} strokeWidth="4"
                    strokeDasharray={`${(p / 100) * 113} 113`}
                    strokeLinecap="round"
                    className="progress-ring"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: sc.tx }}>
                  {p}%
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{rock.name || "(click to name)"}</div>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: bc.tx, background: bc.bg }}>{rock.biz}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: urg.color, background: urg.bg }}>{urg.text}</span>
                  <span className={`text-[10px] ${days < 0 ? "text-red-500 font-bold" : "text-slate-400"}`}>
                    Due {fmtDate(rock.due)} · {days > 0 ? `${days}d` : days === 0 ? "Today" : "Overdue"}
                  </span>
                </div>
              </div>

              <select
                value={rock.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const v = e.target.value;
                  update((d) => { d.rocks[ri].status = v as Rock["status"]; });
                  if (v === "Done") fireConfetti();
                }}
                className="text-[10px] font-bold rounded-lg px-2 py-1 border border-slate-200"
                style={{ color: sc.tx, background: sc.bg }}
              >
                {["On Track", "At Risk", "Off Track", "Done"].map((s) => <option key={s}>{s}</option>)}
              </select>

              <button
                onClick={(e) => { e.stopPropagation(); if (confirm("Delete this rock?")) update((d) => { d.rocks.splice(ri, 1); }); }}
                className="text-slate-300 hover:text-red-500 transition-colors text-sm opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                🗑
              </button>

              <span className={`text-slate-300 transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
            </div>

            {/* Expanded */}
            {open && (
              <div className="border-t border-slate-100 px-4 py-4 animate-slide-up">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rock Name</label>
                    <input
                      value={rock.name}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.rocks[ri].name = v; }); }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={rock.due}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.rocks[ri].due = v; }); }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Business</label>
                    <select
                      value={rock.biz}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.rocks[ri].biz = v as Rock["biz"]; }); }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm cursor-pointer"
                    >
                      <option>MFS</option>
                      <option>Mully</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-500 mb-2">
                  Subtasks ({rock.subtasks.filter((s) => s.done).length}/{rock.subtasks.length})
                </div>
                {rock.subtasks.map((st, si) => (
                  <div key={st.id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0 group">
                    <input
                      type="checkbox"
                      checked={st.done}
                      onChange={() => {
                        const wasDone = st.done;
                        update((d) => { d.rocks[ri].subtasks[si].done = !wasDone; });
                        if (!wasDone) fireMiniConfetti();
                        // Check if all done
                        const allDone = data.rocks[ri].subtasks.every((s, idx) => idx === si ? !wasDone : s.done);
                        if (allDone && !wasDone) {
                          setTimeout(fireConfetti, 300);
                        }
                      }}
                      className="w-4 h-4 flex-shrink-0"
                    />
                    <input
                      value={st.text}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.rocks[ri].subtasks[si].text = v; }); }}
                      placeholder="Subtask..."
                      className={`flex-1 bg-transparent text-xs py-1 ${st.done ? "line-through text-slate-400" : "text-slate-700"}`}
                      style={{ border: "none" }}
                    />
                    <input
                      type="date"
                      value={st.due}
                      onChange={(e) => { const v = e.target.value; update((d) => { d.rocks[ri].subtasks[si].due = v; }); }}
                      className="w-[110px] bg-transparent text-[10px] text-slate-400"
                      style={{ border: "none" }}
                    />
                    <button
                      onClick={() => update((d) => { d.rocks[ri].subtasks.splice(si, 1); })}
                      className="text-slate-300 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => update((d) => { d.rocks[ri].subtasks.push({ id: uid(), text: "", due: "", done: false }); })}
                  className="w-full mt-2 border border-dashed border-slate-300 rounded-lg py-2 text-xs text-slate-400 hover:text-teal-500 hover:border-teal-300 transition-colors"
                >
                  + Add subtask
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={() => {
          const id = uid();
          update((d) => { d.rocks.push({ id, name: "", biz: "MFS", due: "2026-06-30", status: "On Track", subtasks: [] }); });
          setExpRock(id);
        }}
        className="w-full mt-3 border-2 border-dashed border-slate-300 rounded-xl py-3 text-sm text-slate-400 font-semibold hover:text-teal-500 hover:border-teal-300 transition-colors"
      >
        + Add New Rock
      </button>
    </div>
  );
}

/* ── Inbox View ───────────────────────────────────────────── */
function InboxView({
  data, update, input, setInput,
}: {
  data: UserData; update: (fn: (d: UserData) => void) => void;
  input: string; setInput: (v: string) => void;
}) {
  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-0.5">Inbox</h1>
      <p className="text-slate-400 text-sm mb-4">Capture first, triage later. Press Enter.</p>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) {
            update((d) => { d.inbox.unshift({ id: uid(), text: input.trim(), date: new Date().toLocaleDateString(), biz: "", triage: "" }); });
            setInput("");
          }
        }}
        placeholder="What's on your mind? (Enter)"
        className="w-full border-2 border-indigo-400 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm mb-5"
      />
      {data.inbox.length === 0 ? (
        <div className="text-center py-16 text-slate-300">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-sm">Inbox zero. Nice.</p>
        </div>
      ) : (
        data.inbox.map((item, i) => (
          <div key={item.id} className="bg-white rounded-xl p-4 mb-2 border border-slate-100 flex items-start gap-3 card-hover">
            <div className="flex-1">
              <div className="text-xs font-medium text-slate-700 mb-1.5">{item.text}</div>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-[10px] text-slate-400">{item.date}</span>
                <select
                  value={item.biz}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.inbox[i].biz = v; }); }}
                  className="text-[10px] border border-slate-200 rounded px-1 py-0.5 text-slate-500"
                >
                  <option value="">Biz?</option>
                  <option>MFS</option>
                  <option>Mully</option>
                  <option>Both</option>
                </select>
                <select
                  value={item.triage}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.inbox[i].triage = v; }); }}
                  className="text-[10px] border border-slate-200 rounded px-1 py-0.5"
                  style={{ color: item.triage ? "#4F46E5" : "#94A3B8", fontWeight: item.triage ? 600 : 400 }}
                >
                  <option value="">Triage →</option>
                  <option>→ To-Do</option>
                  <option>→ Rock</option>
                  <option>→ Team Issue</option>
                  <option>→ Parked</option>
                  <option>→ Drop</option>
                </select>
              </div>
            </div>
            <button onClick={() => update((d) => { d.inbox.splice(i, 1); })} className="text-slate-300 hover:text-red-400 text-lg transition-colors">×</button>
          </div>
        ))
      )}
    </div>
  );
}

/* ── Seats View ───────────────────────────────────────────── */
function SeatsView({ data, update }: { data: UserData; update: (fn: (d: UserData) => void) => void }) {
  const stc: Record<string, string> = { "Not started": "#94A3B8", "In progress": "#F59E0B", Delegated: "#22C55E", Hired: "#6366F1" };

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-0.5">Seat Exit Plan</h1>
      <p className="text-slate-400 text-sm mb-2">Too many seats = no leverage. Get out.</p>
      <div className="bg-red-50 rounded-lg px-4 py-2.5 mb-5 text-xs text-red-700 font-medium">
        🔴 What did you do THIS week to exit a seat?
      </div>
      {data.seats.map((seat, i) => (
        <div key={seat.id} className="bg-white rounded-xl border border-slate-100 mb-3 p-4">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <input
              value={seat.name}
              onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].name = v; }); }}
              className="text-sm font-bold text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-teal-500 rounded-lg px-2 py-1 flex-1 min-w-[150px]"
            />
            <div className="flex gap-2 items-center">
              <input
                value={seat.hours}
                onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].hours = v; }); }}
                className="w-24 text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-transparent hover:border-slate-200 text-center"
              />
              <select
                value={seat.status}
                onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].status = v; }); }}
                className="text-[10px] font-bold border border-slate-200 rounded-md px-1.5 py-1"
                style={{ color: stc[seat.status] || "#64748B" }}
              >
                {Object.keys(stc).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-50 rounded-lg p-2.5">
              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Exit Path</div>
              <input
                value={seat.exit}
                onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].exit = v; }); }}
                className="w-full text-xs text-slate-700 bg-transparent border border-transparent hover:border-slate-200 rounded px-1 py-0.5"
              />
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5">
              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Timeline</div>
              <input
                value={seat.timeline}
                onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].timeline = v; }); }}
                className="w-full text-xs text-slate-700 bg-transparent border border-transparent hover:border-slate-200 rounded px-1 py-0.5"
              />
            </div>
          </div>
          <textarea
            value={seat.notes}
            onChange={(e) => { const v = e.target.value; update((d) => { d.seats[i].notes = v; }); }}
            placeholder="What did you do this week to exit this seat?"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs resize-y min-h-[44px]"
          />
        </div>
      ))}
      <button
        onClick={() => update((d) => { d.seats.push({ id: uid(), name: "New Seat", hours: "? hrs/wk", exit: "", timeline: "", status: "Not started", notes: "" }); })}
        className="w-full mt-2 border border-dashed border-slate-300 rounded-xl py-2.5 text-xs text-slate-400 hover:text-teal-500 hover:border-teal-300 transition-colors"
      >
        + Add Seat
      </button>
    </div>
  );
}

/* ── Growth View ──────────────────────────────────────────── */
function GrowthView({ data, update, user }: { data: UserData; update: (fn: (d: UserData) => void) => void; user: UserProfile }) {
  const cv = data.growth.coreValues;
  const gwc = data.growth.gwc;

  const coreValueKeys: { key: keyof typeof cv; label: string }[] = [
    { key: "serveFirst", label: "Serve First" },
    { key: "moveTheMission", label: "Move the Mission" },
    { key: "winTogether", label: "Win Together" },
    { key: "liveTheStandard", label: "Live the Standard" },
    { key: "tellTheTruth", label: "Tell the Truth" },
    { key: "choosePositive", label: "Choose Positive" },
  ];

  const ratingColor = (v: string) => {
    if (v === "+") return { bg: "#DCFCE7", tx: "#16A34A" };
    if (v === "+/-") return { bg: "#FEF3C7", tx: "#D97706" };
    if (v === "-") return { bg: "#FEE2E2", tx: "#DC2626" };
    return { bg: "#F1F5F9", tx: "#64748B" };
  };

  const gwcColor = (v: string) => {
    if (v === "Y") return { bg: "#DCFCE7", tx: "#16A34A" };
    if (v === "N") return { bg: "#FEE2E2", tx: "#DC2626" };
    return { bg: "#F1F5F9", tx: "#64748B" };
  };

  const weakValueCount = Object.values(cv).filter((v) => v !== "+").length;
  const gwcIssues = Object.values(gwc).filter((v) => v === "N").length;

  return (
    <div className="animate-slide-up">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-800">{user.name}&apos;s Growth Plan</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Personal development tied to EOS core values, GWC, and seat capacity.
        </p>
      </div>

      {/* Capacity Alert */}
      {(data.seats.length >= 2 || weakValueCount >= 3 || gwcIssues >= 1) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
          <div className="text-xs font-bold text-amber-700 mb-1">⚡ Areas Needing Attention</div>
          <div className="text-xs text-amber-600 space-y-0.5">
            {data.seats.length >= 2 && <div>• In {data.seats.length} seats — capacity is stretched</div>}
            {weakValueCount >= 3 && <div>• {weakValueCount} of 6 core values below &quot;+&quot; — focus on improvement</div>}
            {gwcIssues >= 1 && <div>• {gwcIssues} GWC area(s) at &quot;N&quot; — critical gap</div>}
          </div>
        </div>
      )}

      {/* People Analyzer Card */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 mb-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-3">People Analyzer — Core Values</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {coreValueKeys.map(({ key, label }) => {
            const rc = ratingColor(cv[key]);
            return (
              <div key={key} className="text-center">
                <div className="text-[9px] font-bold text-slate-400 mb-1.5 leading-tight">{label}</div>
                <select
                  value={cv[key]}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => { d.growth.coreValues[key] = v; });
                  }}
                  className="w-full text-center text-sm font-bold rounded-lg py-2 border-0 cursor-pointer"
                  style={{ background: rc.bg, color: rc.tx }}
                >
                  <option>+</option>
                  <option>+/-</option>
                  <option>-</option>
                </select>
              </div>
            );
          })}
        </div>

        <h3 className="text-sm font-bold text-slate-700 mb-3">GWC — Get It, Want It, Capacity</h3>
        <div className="grid grid-cols-3 gap-2">
          {(["g", "w", "c"] as const).map((key) => {
            const labels = { g: "Get It", w: "Want It", c: "Capacity" };
            const gc = gwcColor(gwc[key]);
            return (
              <div key={key} className="text-center">
                <div className="text-[9px] font-bold text-slate-400 mb-1.5">{labels[key]}</div>
                <select
                  value={gwc[key]}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => { d.growth.gwc[key] = v; });
                  }}
                  className="w-full text-center text-sm font-bold rounded-lg py-2 border-0 cursor-pointer"
                  style={{ background: gc.bg, color: gc.tx }}
                >
                  <option>Y</option>
                  <option>N</option>
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-green-600 mb-2">✦ Strengths</h3>
          {data.growth.strengths.map((s, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5 group">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              <input
                value={s}
                onChange={(e) => { const v = e.target.value; update((d) => { d.growth.strengths[i] = v; }); }}
                className="flex-1 text-xs bg-transparent border border-transparent hover:border-slate-200 focus:border-teal-500 rounded px-1 py-0.5"
              />
              <button
                onClick={() => update((d) => { d.growth.strengths.splice(i, 1); })}
                className="text-slate-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => update((d) => { d.growth.strengths.push(""); })}
            className="text-[10px] text-slate-400 hover:text-teal-500 mt-1"
          >
            + Add
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-red-500 mb-2">△ Areas to Improve</h3>
          {data.growth.weaknesses.map((w, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5 group">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <input
                value={w}
                onChange={(e) => { const v = e.target.value; update((d) => { d.growth.weaknesses[i] = v; }); }}
                className="flex-1 text-xs bg-transparent border border-transparent hover:border-slate-200 focus:border-teal-500 rounded px-1 py-0.5"
              />
              <button
                onClick={() => update((d) => { d.growth.weaknesses.splice(i, 1); })}
                className="text-slate-300 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => update((d) => { d.growth.weaknesses.push(""); })}
            className="text-[10px] text-slate-400 hover:text-teal-500 mt-1"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Action Plans */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-indigo-600">🎯 Growth Action Plans</h3>
          <button
            onClick={() =>
              update((d) => {
                d.growth.actions.push({ id: uid(), area: "", action: "", due: "", done: false });
              })
            }
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            + Add
          </button>
        </div>
        {data.growth.actions.length === 0 && (
          <p className="text-slate-400 text-xs py-4 text-center">No action plans yet.</p>
        )}
        {data.growth.actions.map((action: GrowthAction, i: number) => (
          <div key={action.id} className="flex items-start gap-2 mb-2 py-2 border-b border-slate-50 last:border-0 group">
            <input
              type="checkbox"
              checked={action.done}
              onChange={() => {
                const wasDone = action.done;
                update((d) => { d.growth.actions[i].done = !wasDone; });
                if (!wasDone) fireMiniConfetti();
              }}
              className="w-4 h-4 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 mb-1">
                <input
                  value={action.area}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].area = v; }); }}
                  placeholder="Area (e.g. GWC, Core Value)"
                  className="w-32 text-[10px] font-bold bg-indigo-50 text-indigo-600 rounded px-2 py-0.5 border-0"
                />
                <input
                  type="date"
                  value={action.due}
                  onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].due = v; }); }}
                  className="text-[10px] text-slate-400 bg-transparent border-0"
                />
              </div>
              <input
                value={action.action}
                onChange={(e) => { const v = e.target.value; update((d) => { d.growth.actions[i].action = v; }); }}
                placeholder="What's the action?"
                className={`w-full text-xs bg-transparent border border-transparent hover:border-slate-200 rounded px-1 py-0.5 ${action.done ? "line-through text-slate-400" : "text-slate-700"}`}
              />
            </div>
            <button
              onClick={() => update((d) => { d.growth.actions.splice(i, 1); })}
              className="text-slate-300 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── V/TO View ────────────────────────────────────────────── */
function VTOView() {
  const Section = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
    <div className="mb-4">
      <div className="text-[10px] font-bold tracking-wider uppercase text-white px-3 py-2 rounded-t-lg" style={{ background: color }}>
        {title}
      </div>
      <div className="bg-white border border-slate-100 border-t-0 rounded-b-lg p-4">{children}</div>
    </div>
  );

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex gap-2 mb-1.5 text-xs leading-snug">
      <span className="font-bold text-slate-500 min-w-[70px] flex-shrink-0">{label}</span>
      <span className="text-slate-700">{value}</span>
    </div>
  );

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-0.5">V/TO Reference</h1>
      <p className="text-slate-400 text-sm mb-5">Your north star.</p>

      <Section title="Core Values (Shared)" color="#0D9488">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
          {["Serve First", "Move the Mission", "Win Together", "Live the Standard", "Tell the Truth", "Choose Positive"].map((v) => (
            <div key={v} className="py-1">✦ {v}</div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Section title="MFS (3PL)" color="#0D9488">
          <Row label="Purpose:" value="Making it simple for entrepreneurs to realize their dream, worry-free." />
          <Row label="Niche:" value="Solopreneurs & small teams, post-revenue eComm." />
          <Row label="10-Year:" value="5M orders/month" />
          <Row label="3-Year:" value="$4M rev / $1M profit / 100 clients" />
          <Row label="1-Year:" value="$600K rev / $120K profit" />
          <Row label="Uniques:" value="Ships in 1 day + Open-book + Real human" />
          <Row label="Guarantee:" value="Order free if SLA missed" />
        </Section>

        <Section title="Mully (eComm)" color="#F59E0B">
          <Row label="Purpose:" value="Helping people feel comfortable, included, access a gated community." />
          <Row label="Niche:" value="Driven adults seeking golf community access." />
          <Row label="10-Year:" value="$250M revenue" />
          <Row label="3-Year:" value="$10M rev / $2M profit / 10K subs" />
          <Row label="1-Year:" value="$2.5M rev / $500K profit" />
          <Row label="Uniques:" value="Insider culture + White-glove + Superior tech" />
          <Row label="Guarantee:" value="Swap anything, update your profile." />
        </Section>
      </div>
    </div>
  );
}
