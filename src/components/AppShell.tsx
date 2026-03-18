"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserData, SharedData, ContentItem, Campaign, USERS } from "@/lib/types";
import { SEED_DATA, SEED_SHARED } from "@/lib/seed";
import { loadUserData, saveUserData, getSupabase } from "@/lib/supabase";
import { Sidebar, MobileHeader, MobileBottomNav, View } from "./Sidebar";
import { TodayView } from "./TodayView";
import { RocksView } from "./RocksView";
import { InboxView } from "./InboxView";
import { SeatsView } from "./SeatsView";
import { GrowthView } from "./GrowthView";
import { VTOView } from "./VTOView";
import { IDSView } from "./IDSView";
import { ScorecardView } from "./ScorecardView";
import { LinksView } from "./LinksView";
import { MarketingView } from "./MarketingView";
import { PipelineView } from "./PipelineView";
import { IconX } from "./ui/Icons";

export default function AppShell() {
  const [activeUser, setActiveUser] = useState("drew");
  const [allData, setAllData] = useState<Record<string, UserData>>({});
  const [view, setView] = useState<View>("today");
  const [expRock, setExpRock] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string>("idle");
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingSaves = useRef<Record<string, () => Promise<void>>>({});
  const sharedSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSharedSave = useRef<(() => Promise<void>) | null>(null);

  const data = allData[activeUser] || null;
  const user = USERS.find((u) => u.id === activeUser)!;

  useEffect(() => {
    function loadLocal(userId: string): UserData | null {
      try {
        const raw = localStorage.getItem(`eos-focus-${userId}`);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    }
    function saveLocal(userId: string, d: UserData) {
      try { localStorage.setItem(`eos-focus-${userId}`, JSON.stringify(d)); } catch { /* */ }
    }

    // Check if data looks like it has real user edits (not just seed defaults)
    function hasUserEdits(d: UserData): boolean {
      const hasPriorities = d.todayPriorities?.some((p) =>
        (typeof p === "object" && p !== null && "text" in p) ? (p as { text: string }).text.length > 0 : false
      );
      const hasTodos = d.todos?.length > 0;
      const hasSubtaskProgress = d.rocks?.some((r) => r.subtasks?.some((s) => s.done));
      const hasStreak = (d.streakDays || 0) > 0;
      return !!(hasPriorities || hasTodos || hasSubtaskProgress || hasStreak);
    }

    async function init() {
      const sb = getSupabase();
      const loaded: Record<string, UserData> = {};
      if (sb) {
        try {
          setSyncStatus("syncing");
          for (const u of USERS) {
            const cloud = await loadUserData(u.id);
            const local = loadLocal(u.id);
            if (cloud) {
              // If cloud data looks like seed but localStorage has real edits, prefer local
              if (!hasUserEdits(cloud as UserData) && local && hasUserEdits(local)) {
                console.warn(`[EOS] Cloud data for ${u.id} appears stale — using localStorage and re-syncing`);
                loaded[u.id] = local;
                try { await saveUserData(u.id, local); } catch { /* will retry on next save */ }
              } else {
                loaded[u.id] = cloud as UserData;
                saveLocal(u.id, cloud as UserData);
              }
            } else if (local) {
              loaded[u.id] = local;
              try { await saveUserData(u.id, local); } catch { /* will retry on next save */ }
            } else {
              loaded[u.id] = SEED_DATA[u.id];
              try {
                await saveUserData(u.id, SEED_DATA[u.id]);
              } catch { /* will retry on next save */ }
              saveLocal(u.id, SEED_DATA[u.id]);
            }
          }
          setSyncStatus("synced");
        } catch {
          setSyncStatus("error");
          for (const u of USERS) {
            const local = loadLocal(u.id);
            loaded[u.id] = local || SEED_DATA[u.id];
          }
        }
      } else {
        setSyncStatus("local");
        for (const u of USERS) {
          const local = loadLocal(u.id);
          loaded[u.id] = local || SEED_DATA[u.id];
        }
      }
      for (const u of USERS) {
        const d = loaded[u.id];
        if (!d.growth) d.growth = SEED_DATA[u.id].growth;
        // Robust todayPriorities migration
        if (!d.todayPriorities || !Array.isArray(d.todayPriorities) || d.todayPriorities.length === 0) {
          d.todayPriorities = [
            { text: "", done: false },
            { text: "", done: false },
            { text: "", done: false },
          ];
        } else if (typeof d.todayPriorities[0] === "string") {
          d.todayPriorities = (d.todayPriorities as unknown as string[]).map(
            (t: string) => ({ text: t || "", done: false })
          );
        }
        // Ensure each priority has the correct shape
        d.todayPriorities = d.todayPriorities.map((p: unknown) => {
          if (p && typeof p === "object" && "text" in p) return p as { text: string; done: boolean };
          return { text: String(p || ""), done: false };
        });
        if (d.streakDays === undefined) d.streakDays = 0;
        if (!d.lastActiveDate) d.lastActiveDate = "";
        // Ensure todos array exists
        if (!d.todos) d.todos = [];
        if (!d.inbox) d.inbox = [];
        if (!d.seats) d.seats = [];
        if (!d.rocks) d.rocks = [];
      }
      setAllData(loaded);

      // Load shared data
      let sh: SharedData | null = null;
      try {
        const raw = localStorage.getItem("eos-focus-shared");
        sh = raw ? JSON.parse(raw) : null;
      } catch { /* */ }
      const sb2 = getSupabase();
      if (sb2) {
        try {
          const cloud = await loadUserData("__shared__");
          if (cloud) {
            sh = cloud as SharedData;
            try { localStorage.setItem("eos-focus-shared", JSON.stringify(sh)); } catch { /* */ }
          } else if (sh) {
            await saveUserData("__shared__", sh);
          }
        } catch { /* use local */ }
      }
      if (!sh) sh = SEED_SHARED;
      // Ensure all fields exist (migration safety)
      if (!sh.issuesMFS) sh.issuesMFS = SEED_SHARED.issuesMFS;
      if (!sh.issuesMully) sh.issuesMully = SEED_SHARED.issuesMully;
      if (!sh.scorecard) sh.scorecard = SEED_SHARED.scorecard;
      if (!sh.links) sh.links = [];
      if (!sh.marketing) sh.marketing = SEED_SHARED.marketing;
      if (!sh.pipeline) sh.pipeline = SEED_SHARED.pipeline || { mully: [], mfs: [] };
      // One-time migration: replace placeholder Mully pipeline with real outreach data
      const hasRealOutreachData = sh.pipeline.mully.some((d) =>
        ["Pro-Am Tour at Pebble Beach", "NECHV Chipping In", "MNTC Golf Sponsor", "ESPYS Celebrity Golf Classic"].includes(d.company)
      );
      if (!hasRealOutreachData) {
        console.log("[EOS] Seeding Mully pipeline with outreach data...");
        sh.pipeline.mully = SEED_SHARED.pipeline.mully;
      }
      // One-time migration: seed marketing data from spreadsheet if campaigns are empty
      const hasCampaignContent = sh.marketing.stages.some((s) =>
        s.channels.some((ch) => (ch.campaigns || []).some((camp) => camp.content.length > 0))
      );
      if (!hasCampaignContent) {
        console.log("[EOS] Seeding marketing data from spreadsheet...");
        sh.marketing = SEED_SHARED.marketing;
      }
      // Channel icon auto-detect map
      const CHANNEL_ICONS: Record<string, string> = {
        "Email": "\u2709\uFE0F", "SMS": "\uD83D\uDCF1", "In-App": "\uD83D\uDD14", "On-Site": "\uD83C\uDF10",
        "Direct Mail": "\uD83D\uDCEC", "Instagram": "\uD83D\uDCF8", "Facebook": "\uD83D\uDC4D",
        "Meta Ads": "\uD83C\uDFAF", "Google Ads": "\uD83D\uDD0D", "Influencer": "\u2B50", "Social": "\uD83D\uDCE3",
      };
      // Migrate old string[] channels to MarketingChannel[] objects
      for (const stage of sh.marketing.stages) {
        if (stage.channels?.length && typeof stage.channels[0] === "string") {
          const oldContent = (stage as unknown as Record<string, unknown>).content as ContentItem[] | undefined;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (stage as any).channels = (stage.channels as unknown as string[]).map((name: string) => ({
            id: "id_" + Math.random().toString(36).slice(2, 9),
            name,
            icon: CHANNEL_ICONS[name] || "",
            color: "#6B7280",
            content: oldContent || [],
            campaigns: [{ id: "id_" + Math.random().toString(36).slice(2, 9), name: "Default", content: oldContent || [] }] as Campaign[],
          }));
          delete (stage as unknown as Record<string, unknown>).content;
        }
        // Migrate: ensure all channels have campaigns array and icons
        for (const ch of stage.channels) {
          if (!ch.campaigns) ch.campaigns = [];
          // Auto-detect icon if empty
          if (!ch.icon && CHANNEL_ICONS[ch.name]) ch.icon = CHANNEL_ICONS[ch.name];
          // Migrate flat content into a campaign if campaigns is empty but content exists
          if (ch.campaigns.length === 0 && ch.content && ch.content.length > 0) {
            ch.campaigns = [{ id: "id_" + Math.random().toString(36).slice(2, 9), name: "Default", content: ch.content }];
          }
          // Ensure all content items have tags array
          for (const c of ch.content) { if (!c.tags) c.tags = []; }
          for (const camp of ch.campaigns) {
            for (const c of camp.content) { if (!c.tags) c.tags = []; }
          }
        }
        // Unlock all locked stages → planning
        if (stage.status === "locked") stage.status = "planning";
      }
      // Migrate old weeks[] format to weekData{}
      for (const biz of ["mfs", "mully"] as const) {
        for (const row of sh.scorecard[biz]) {
          if (!row.weekData) row.weekData = {};
        }
      }
      setSharedData(sh);

      // Persist migrated shared data back to cloud + localStorage
      try { localStorage.setItem("eos-focus-shared", JSON.stringify(sh)); } catch { /* */ }
      const sb3 = getSupabase();
      if (sb3) {
        try { await saveUserData("__shared__", sh); } catch { /* non-critical */ }
      }

      setLoading(false);
    }
    init();
  }, []);

  // Flush any pending cloud saves before the page unloads
  useEffect(() => {
    const flush = () => {
      for (const key of Object.keys(saveTimers.current)) {
        clearTimeout(saveTimers.current[key]);
      }
      if (sharedSaveTimer.current) clearTimeout(sharedSaveTimer.current);
      // Fire all pending saves synchronously via sendBeacon fallback
      for (const fn of Object.values(pendingSaves.current)) fn();
      if (pendingSharedSave.current) pendingSharedSave.current();
    };
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
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
    // Always persist to localStorage immediately for reliability
    try { localStorage.setItem(`eos-focus-${userId}`, JSON.stringify(userData)); } catch { /* */ }

    // Per-user debounce timer — editing one user never cancels another user's save
    if (saveTimers.current[userId]) clearTimeout(saveTimers.current[userId]);
    const doSave = async () => {
      const sb = getSupabase();
      if (sb) {
        try {
          setSyncStatus("syncing");
          await saveUserData(userId, userData);
          setSyncStatus("synced");
        } catch {
          setSyncStatus("error");
        }
      }
      delete pendingSaves.current[userId];
    };
    pendingSaves.current[userId] = doSave;
    saveTimers.current[userId] = setTimeout(doSave, 600);
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

  const updateShared = useCallback(
    (fn: (d: SharedData) => void) => {
      setSharedData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev)) as SharedData;
        fn(next);
        // Persist
        try { localStorage.setItem("eos-focus-shared", JSON.stringify(next)); } catch { /* */ }
        if (sharedSaveTimer.current) clearTimeout(sharedSaveTimer.current);
        const doSave = async () => {
          const sb = getSupabase();
          if (sb) {
            try { await saveUserData("__shared__", next); } catch { /* */ }
          }
          pendingSharedSave.current = null;
        };
        pendingSharedSave.current = doSave;
        sharedSaveTimer.current = setTimeout(doSave, 600);
        return next;
      });
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      {/* Desktop Sidebar */}
      <Sidebar
        view={view}
        setView={setView}
        users={USERS}
        activeUser={activeUser}
        setActiveUser={setActiveUser}
        inboxCount={data.inbox.length}
        syncStatus={syncStatus}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
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
          <div className="w-64 bg-white border-r border-gray-200 p-5 animate-slideIn">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[15px] font-semibold text-gray-900">Navigation</span>
              <button onClick={() => setMobileNav(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <IconX className="w-4 h-4" />
              </button>
            </div>
            {(["today", "rocks", "inbox", "seats", "growth", "vto", "ids", "scorecard", "marketing", "pipeline", "links"] as View[]).map((k) => (
              <button
                key={k}
                onClick={() => { setView(k); setMobileNav(false); }}
                className={[
                  "w-full text-left px-3 py-2.5 rounded-lg text-[15px] mb-0.5 cursor-pointer transition-colors duration-100",
                  view === k
                    ? "bg-gray-100 text-gray-900 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                {k === "vto" ? "V/TO" : k === "ids" ? "IDS" : k === "pipeline" ? "Pipeline" : k.charAt(0).toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-1 bg-black/20 animate-fadeOverlay" onClick={() => setMobileNav(false)} />
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <MobileBottomNav view={view} setView={setView} inboxCount={data.inbox.length} />

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto pt-12 pb-16 md:pt-0 md:pb-0">
        <div className="content-wrapper" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
          {view === "today" && (
            <TodayView data={data} user={user} update={update} setView={setView} setExpRock={setExpRock} shared={sharedData} />
          )}
          {view === "rocks" && (
            <RocksView data={data} update={update} expRock={expRock} setExpRock={setExpRock} user={user} />
          )}
          {view === "inbox" && <InboxView data={data} update={update} />}
          {view === "seats" && <SeatsView data={data} update={update} />}
          {view === "growth" && <GrowthView data={data} update={update} user={user} />}
          {view === "vto" && <VTOView />}
          {view === "ids" && sharedData && (
            <IDSView shared={sharedData} updateShared={updateShared} />
          )}
          {view === "scorecard" && sharedData && (
            <ScorecardView shared={sharedData} updateShared={updateShared} />
          )}
          {view === "marketing" && sharedData && (
            <MarketingView shared={sharedData} updateShared={updateShared} />
          )}
          {view === "pipeline" && sharedData && (
            <PipelineView shared={sharedData} updateShared={updateShared} activeUser={activeUser} />
          )}
          {view === "links" && sharedData && (
            <LinksView shared={sharedData} updateShared={updateShared} />
          )}
        </div>
      </main>
    </div>
  );
}
