"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserData, USERS } from "@/lib/types";
import { SEED_DATA } from "@/lib/seed";
import { loadUserData, saveUserData, getSupabase } from "@/lib/supabase";
import { Sidebar, MobileHeader, MobileBottomNav, View } from "./Sidebar";
import { TodayView } from "./TodayView";
import { RocksView } from "./RocksView";
import { InboxView } from "./InboxView";
import { SeatsView } from "./SeatsView";
import { GrowthView } from "./GrowthView";
import { VTOView } from "./VTOView";
import { IconX } from "./ui/Icons";

export default function AppShell() {
  const [activeUser, setActiveUser] = useState("drew");
  const [allData, setAllData] = useState<Record<string, UserData>>({});
  const [view, setView] = useState<View>("today");
  const [expRock, setExpRock] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = allData[activeUser] || null;
  const user = USERS.find((u) => u.id === activeUser)!;

  useEffect(() => {
    async function init() {
      const sb = getSupabase();
      const loaded: Record<string, UserData> = {};
      if (sb) {
        try {
          setSyncStatus("syncing");
          for (const u of USERS) {
            const cloud = await loadUserData(u.id);
            if (cloud) loaded[u.id] = cloud as UserData;
            else {
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
  }, []);

  useEffect(() => {
    if (!data) return;
    const today = new Date().toISOString().slice(0, 10);
    if (data.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      update((d) => {
        d.streakDays = d.lastActiveDate === yesterday ? (d.streakDays || 0) + 1 : 1;
        d.lastActiveDate = today;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUser, data?.lastActiveDate]);

  const cloudSave = useCallback((userId: string, userData: UserData) => {
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
  }, []);

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
      <div className="flex items-center justify-center h-screen bg-[#FAFAFA]">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm font-medium">Loading your focus system...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <Sidebar
        view={view}
        setView={setView}
        users={USERS}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
        inboxCount={data.inbox.length}
        syncStatus={syncStatus}
      />

      {/* Mobile Header */}
      <MobileHeader
        users={USERS}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
        syncStatus={syncStatus}
        onMenuToggle={() => setMobileNav(!mobileNav)}
      />

      {/* Mobile Nav Overlay */}
      {mobileNav && (
        <div className="fixed inset-0 z-[200] flex md:hidden">
          <div className="w-[280px] bg-[#0F172A] p-5 shadow-2xl animate-slideIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-bold text-white">EOS Focus</span>
              </div>
              <button onClick={() => setMobileNav(false)} className="text-gray-500 hover:text-white cursor-pointer">
                <IconX className="w-5 h-5" />
              </button>
            </div>
            {(["today", "rocks", "inbox", "seats", "growth", "vto"] as View[]).map((k) => (
              <button
                key={k}
                onClick={() => { setView(k); setMobileNav(false); }}
                className={[
                  "w-full text-left px-4 py-3 rounded-xl text-sm mb-1 cursor-pointer transition-all duration-150",
                  view === k
                    ? "bg-white/[0.08] text-white font-semibold"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]",
                ].join(" ")}
              >
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <MobileBottomNav view={view} setView={setView} inboxCount={data.inbox.length} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-[60px] pb-[84px] md:pt-0 md:pb-0">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 lg:px-12 py-10">
          {view === "today" && (
            <TodayView data={data} user={user} update={update} setView={setView} setExpRock={setExpRock} />
          )}
          {view === "rocks" && (
            <RocksView data={data} update={update} expRock={expRock} setExpRock={setExpRock} user={user} />
          )}
          {view === "inbox" && <InboxView data={data} update={update} />}
          {view === "seats" && <SeatsView data={data} update={update} />}
          {view === "growth" && <GrowthView data={data} update={update} user={user} />}
          {view === "vto" && <VTOView />}
        </div>
      </main>
    </div>
  );
}
