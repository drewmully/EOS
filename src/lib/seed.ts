import { UserData, SharedData, ContentItem, Deal } from "./types";

function uid() {
  return "id_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function ci(title: string, type: string, body: string, tags: string[], order: number): ContentItem {
  return { id: uid(), title, type, status: "idea", body, assignee: "", scheduledDate: "", order, tags };
}

export const DREW_DATA: UserData = {
  rocks: [
    {
      id: uid(), name: 'Warehouse gets first "15" 5S Score', biz: "MFS", due: "2026-04-15", status: "On Track",
      subtasks: [
        { id: uid(), text: "Baseline current 5S score across all zones", due: "2026-03-20", done: false },
        { id: uid(), text: "Create zone-by-zone improvement plan with Jack", due: "2026-03-24", done: false },
        { id: uid(), text: "Implement Sort & Set in Zone 1 (receiving)", due: "2026-03-31", done: false },
        { id: uid(), text: "Implement Sort & Set in Zone 2 (pick/pack)", due: "2026-04-04", done: false },
        { id: uid(), text: "Shine — deep clean and labeling", due: "2026-04-08", done: false },
        { id: uid(), text: "Standardize — visual management boards live", due: "2026-04-12", done: false },
        { id: uid(), text: "Full audit — score against 5S rubric", due: "2026-04-15", done: false },
      ],
    },
    {
      id: uid(), name: "Existing Customer Migration > X%", biz: "Mully", due: "2026-06-30", status: "On Track",
      subtasks: [
        { id: uid(), text: "Define migration target % and communicate", due: "2026-03-20", done: false },
        { id: uid(), text: "Build migration landing page / flow", due: "2026-03-31", done: false },
        { id: uid(), text: "Email campaign #1 — announce new model", due: "2026-04-10", done: false },
        { id: uid(), text: "Personal outreach to top 50 legacy subs", due: "2026-04-18", done: false },
        { id: uid(), text: "Email campaign #2 — urgency / incentive", due: "2026-05-01", done: false },
        { id: uid(), text: "Analyze conversion, adjust if <30%", due: "2026-05-15", done: false },
        { id: uid(), text: "Final push + deadline for legacy pricing", due: "2026-06-15", done: false },
      ],
    },
    {
      id: uid(), name: "New Customers net 300", biz: "Mully", due: "2026-06-30", status: "On Track",
      subtasks: [
        { id: uid(), text: "Define acquisition funnel with Jack (CPA <$150)", due: "2026-03-20", done: false },
        { id: uid(), text: "Launch first paid campaign (Meta/IG)", due: "2026-03-27", done: false },
        { id: uid(), text: "Week 2 checkpoint — CPA + creative review", due: "2026-04-10", done: false },
        { id: uid(), text: "Iterate creative and targeting", due: "2026-04-18", done: false },
        { id: uid(), text: "Month 1 checkpoint — on pace for 75/mo?", due: "2026-04-30", done: false },
        { id: uid(), text: "Scale spend on winning channels", due: "2026-05-15", done: false },
        { id: uid(), text: "Month 2 — cumulative vs 300 target", due: "2026-05-31", done: false },
      ],
    },
    {
      id: uid(), name: "Cash Flow Positive (Mully)", biz: "Mully", due: "2026-06-30", status: "On Track",
      subtasks: [
        { id: uid(), text: "Build 13-week cash flow forecast", due: "2026-03-20", done: false },
        { id: uid(), text: "Identify top 3 cash drains — cut/reduce", due: "2026-03-27", done: false },
        { id: uid(), text: "Set weekly cash review cadence", due: "2026-03-31", done: false },
        { id: uid(), text: "Renegotiate vendor terms", due: "2026-04-18", done: false },
        { id: uid(), text: "Month 1 — trending positive?", due: "2026-04-30", done: false },
        { id: uid(), text: "Adjust pricing/margins if off track", due: "2026-05-15", done: false },
        { id: uid(), text: "Month 2 — trajectory check", due: "2026-05-31", done: false },
      ],
    },
  ],
  todos: [],
  inbox: [],
  seats: [
    { id: uid(), name: "MFS Finance / Admin", hours: "8–12 hrs/wk", exit: "Hire Controller / fractional CFO", timeline: "Q4 2026", status: "Not started", notes: "" },
    { id: uid(), name: "MFS Sales / Marketing", hours: "5–8 hrs/wk", exit: "Separate tasks; delegate creative", timeline: "Q3 2026", status: "Not started", notes: "" },
    { id: uid(), name: "Mully Process Load", hours: "20+ hrs/wk", exit: "Content hire → Software → CFO", timeline: "Q3–Q4 2026", status: "Not started", notes: "" },
  ],
  todayPriorities: [
    { text: "", done: false },
    { text: "", done: false },
    { text: "", done: false },
  ],
  growth: {
    coreValues: { serveFirst: "+/-", moveTheMission: "+", winTogether: "+/-", liveTheStandard: "+/-", tellTheTruth: "+", choosePositive: "+/-" },
    gwc: { g: "Y", w: "Y", c: "N" },
    strengths: ["Vision & strategy", "Relationship building", "Creative problem solving"],
    weaknesses: ["Letting go of operational seats", "Cash flow discipline", "Capacity management"],
    actions: [
      { id: uid(), area: "Capacity", action: "Delegate MFS finance tasks to fractional CFO by Q4", due: "2026-10-01", done: false },
      { id: uid(), area: "Core Value: Win Together", action: "Weekly 1:1s with Jack and Joe — build feedback loops", due: "2026-04-01", done: false },
      { id: uid(), area: "GWC: Capacity", action: "Offload Mully process work — hire content person", due: "2026-07-01", done: false },
    ],
  },
  streakDays: 0,
  lastActiveDate: "",
};

export const JACK_DATA: UserData = {
  rocks: [
    {
      id: uid(), name: "Real Time, Accurate Reporting", biz: "Mully", due: "2026-04-30", status: "On Track",
      subtasks: [
        { id: uid(), text: "Audit current reporting — identify gaps and delays", due: "2026-03-20", done: false },
        { id: uid(), text: "Select dashboarding tool (Looker, Metabase, etc.)", due: "2026-03-27", done: false },
        { id: uid(), text: "Build core KPI dashboard — revenue, subs, churn", due: "2026-04-07", done: false },
        { id: uid(), text: "Integrate live data feeds from Shopify/Stripe", due: "2026-04-14", done: false },
        { id: uid(), text: "QA data accuracy against manual reports", due: "2026-04-21", done: false },
        { id: uid(), text: "Team training + go-live", due: "2026-04-28", done: false },
      ],
    },
    {
      id: uid(), name: "Repeatable, Proven Customer Acquisition Funnel (CPA <$150)", biz: "Mully", due: "2026-06-30", status: "On Track",
      subtasks: [
        { id: uid(), text: "Map current funnel end-to-end with Drew", due: "2026-03-20", done: false },
        { id: uid(), text: "Set up attribution tracking (UTMs, pixel, GA4)", due: "2026-03-27", done: false },
        { id: uid(), text: "Launch test campaigns on Meta — 3 creative variants", due: "2026-04-03", done: false },
        { id: uid(), text: "Week 2 — kill losers, scale winners", due: "2026-04-17", done: false },
        { id: uid(), text: "Add email nurture sequence for non-converters", due: "2026-05-01", done: false },
        { id: uid(), text: "Month 2 — is CPA consistently <$150?", due: "2026-05-31", done: false },
        { id: uid(), text: "Document the playbook — repeatable process", due: "2026-06-15", done: false },
      ],
    },
    {
      id: uid(), name: "4.5+ First Box Rating", biz: "Mully", due: "2026-06-30", status: "On Track",
      subtasks: [
        { id: uid(), text: "Set up post-delivery survey (NPS / 5-star)", due: "2026-03-20", done: false },
        { id: uid(), text: "Analyze first 50 ratings — top complaints", due: "2026-04-03", done: false },
        { id: uid(), text: "Fix top 3 unboxing/quality issues", due: "2026-04-17", done: false },
        { id: uid(), text: "A/B test packaging improvements", due: "2026-05-01", done: false },
        { id: uid(), text: "Rolling 4-week average — tracking toward 4.5?", due: "2026-05-15", done: false },
        { id: uid(), text: "Iterate on product mix based on feedback", due: "2026-06-01", done: false },
        { id: uid(), text: "Final check — sustained 4.5+ rating", due: "2026-06-25", done: false },
      ],
    },
    {
      id: uid(), name: "ShipHero is Live and Using Full Potential", biz: "MFS", due: "2026-04-30", status: "On Track",
      subtasks: [
        { id: uid(), text: "Complete ShipHero data migration plan", due: "2026-03-18", done: false },
        { id: uid(), text: "Migrate inventory data — validate counts", due: "2026-03-25", done: false },
        { id: uid(), text: "Configure automations (pick/pack/ship rules)", due: "2026-04-01", done: false },
        { id: uid(), text: "Train warehouse team on new workflows", due: "2026-04-08", done: false },
        { id: uid(), text: "Parallel run — old + new system for 1 week", due: "2026-04-15", done: false },
        { id: uid(), text: "Cut over to ShipHero as primary WMS", due: "2026-04-22", done: false },
        { id: uid(), text: "Post-launch — resolve edge cases, full adoption", due: "2026-04-30", done: false },
      ],
    },
    {
      id: uid(), name: "Key SOPs Documented and Adhered To (Simple Version)", biz: "MFS", due: "2026-03-31", status: "At Risk",
      subtasks: [
        { id: uid(), text: "List top 10 critical processes (receiving, pick, pack, ship)", due: "2026-03-14", done: false },
        { id: uid(), text: "Draft SOPs for top 5 — keep to 1-page each", due: "2026-03-20", done: false },
        { id: uid(), text: "Review SOPs with warehouse team — get feedback", due: "2026-03-24", done: false },
        { id: uid(), text: "Print and post at each station", due: "2026-03-26", done: false },
        { id: uid(), text: "Train team on SOPs — walkthroughs", due: "2026-03-28", done: false },
        { id: uid(), text: "Spot-check adherence for 1 week", due: "2026-03-31", done: false },
      ],
    },
    {
      id: uid(), name: "Accessible Real-Time Reporting (Internal & Outward Facing)", biz: "MFS", due: "2026-05-15", status: "On Track",
      subtasks: [
        { id: uid(), text: "Define key metrics for internal vs client dashboards", due: "2026-03-25", done: false },
        { id: uid(), text: "Build internal ops dashboard (orders, errors, SLA)", due: "2026-04-07", done: false },
        { id: uid(), text: "Build client-facing portal (their orders, tracking)", due: "2026-04-21", done: false },
        { id: uid(), text: "Integrate with ShipHero API for live data", due: "2026-05-01", done: false },
        { id: uid(), text: "Beta test with 3 clients — get feedback", due: "2026-05-08", done: false },
        { id: uid(), text: "Launch to all clients", due: "2026-05-15", done: false },
      ],
    },
  ],
  todos: [],
  inbox: [],
  seats: [
    { id: uid(), name: "MFS Warehouse Ops Lead", hours: "15–20 hrs/wk", exit: "Hire warehouse manager", timeline: "Q3 2026", status: "Not started", notes: "" },
    { id: uid(), name: "Mully Tech / Analytics", hours: "10–15 hrs/wk", exit: "Systematize dashboards, hire data analyst", timeline: "Q4 2026", status: "Not started", notes: "" },
  ],
  todayPriorities: [
    { text: "", done: false },
    { text: "", done: false },
    { text: "", done: false },
  ],
  growth: {
    coreValues: { serveFirst: "+", moveTheMission: "+/-", winTogether: "+", liveTheStandard: "+/-", tellTheTruth: "+", choosePositive: "+/-" },
    gwc: { g: "N", w: "Y", c: "N" },
    strengths: ["Execution speed", "Technical problem solving", "Process improvement"],
    weaknesses: ["Getting it (big picture vision)", "Capacity — spread across too many seats", "Delegation"],
    actions: [
      { id: uid(), area: "GWC: Get It", action: "Monthly strategy session with Drew — understand the why behind rocks", due: "2026-04-15", done: false },
      { id: uid(), area: "Capacity", action: "Document SOPs so tasks can be handed off to new hires", due: "2026-03-31", done: false },
      { id: uid(), area: "Core Value: Move the Mission", action: "Set weekly priority — tie every task to a rock or V/TO goal", due: "2026-04-01", done: false },
    ],
  },
  streakDays: 0,
  lastActiveDate: "",
};

export const JOE_DATA: UserData = {
  rocks: [
    {
      id: uid(), name: "10 Outings Sold", biz: "Mully", due: "2026-06-30", status: "On Track",
      subtasks: [
        { id: uid(), text: "Define outing packages and pricing tiers", due: "2026-03-20", done: false },
        { id: uid(), text: "Build outing landing page with booking flow", due: "2026-03-31", done: false },
        { id: uid(), text: "Outreach to 20 target companies / groups", due: "2026-04-10", done: false },
        { id: uid(), text: "Close first 3 outings — refine pitch", due: "2026-04-30", done: false },
        { id: uid(), text: "Post-outing survey — iterate on experience", due: "2026-05-10", done: false },
        { id: uid(), text: "Ramp outreach — aim for 2/month pace", due: "2026-05-20", done: false },
        { id: uid(), text: "Hit 10 total — document repeatable sales process", due: "2026-06-25", done: false },
      ],
    },
    {
      id: uid(), name: "5 New Clients", biz: "MFS", due: "2026-06-30", status: "On Track",
      subtasks: [
        { id: uid(), text: "Build ideal client profile (ICP) for MFS", due: "2026-03-20", done: false },
        { id: uid(), text: "Create outbound prospecting list — 50 targets", due: "2026-03-27", done: false },
        { id: uid(), text: "Launch cold email + LinkedIn outreach campaign", due: "2026-04-03", done: false },
        { id: uid(), text: "First discovery calls — refine pitch deck", due: "2026-04-15", done: false },
        { id: uid(), text: "Close client #1 — learn from onboarding", due: "2026-04-30", done: false },
        { id: uid(), text: "Pipeline review — enough leads for 5?", due: "2026-05-15", done: false },
        { id: uid(), text: "Close clients #2–5, optimize sales cycle", due: "2026-06-20", done: false },
      ],
    },
    {
      id: uid(), name: "Cash Flow Positive (MFS)", biz: "MFS", due: "2026-06-30", status: "On Track",
      subtasks: [
        { id: uid(), text: "Build P&L model — current vs target margins", due: "2026-03-20", done: false },
        { id: uid(), text: "Identify top cost reduction opportunities", due: "2026-03-31", done: false },
        { id: uid(), text: "Renegotiate shipping carrier rates", due: "2026-04-15", done: false },
        { id: uid(), text: "Set up weekly cash position review", due: "2026-04-01", done: false },
        { id: uid(), text: "New client revenue kicking in — tracking?", due: "2026-05-01", done: false },
        { id: uid(), text: "Month 2 margin check — on track?", due: "2026-05-31", done: false },
        { id: uid(), text: "Cash flow positive sustained for 4+ weeks", due: "2026-06-25", done: false },
      ],
    },
  ],
  todos: [],
  inbox: [],
  seats: [
    { id: uid(), name: "MFS Biz Dev / Sales", hours: "15–20 hrs/wk", exit: "Hire sales rep once pipeline proven", timeline: "Q4 2026", status: "Not started", notes: "" },
    { id: uid(), name: "Mully Events / Outings", hours: "10–12 hrs/wk", exit: "Hire events coordinator", timeline: "Q3 2026", status: "Not started", notes: "" },
  ],
  todayPriorities: [
    { text: "", done: false },
    { text: "", done: false },
    { text: "", done: false },
  ],
  growth: {
    coreValues: { serveFirst: "+/-", moveTheMission: "+/-", winTogether: "+/-", liveTheStandard: "+/-", tellTheTruth: "+/-", choosePositive: "+/-" },
    gwc: { g: "Y", w: "Y", c: "N" },
    strengths: ["Sales & relationship building", "High energy / hustle", "Creative ideas"],
    weaknesses: ["Follow-through on details", "All core values at +/- (none at +)", "Capacity concerns"],
    actions: [
      { id: uid(), area: "Core Values", action: "Pick 2 core values to focus on this quarter — get to + on both", due: "2026-04-15", done: false },
      { id: uid(), area: "GWC: Capacity", action: "Time audit — where are the 30+ hrs/wk going? Cut low-value work", due: "2026-03-31", done: false },
      { id: uid(), area: "Follow-through", action: "Use daily Big 3 every single day — build the habit", due: "2026-04-01", done: false },
    ],
  },
  streakDays: 0,
  lastActiveDate: "",
};

export const SEED_DATA: Record<string, UserData> = {
  drew: DREW_DATA,
  jack: JACK_DATA,
  joe: JOE_DATA,
};

export const SEED_SHARED: SharedData = {
  issuesMFS: [
    { id: uid(), title: "Shiphero (WMS) Integration", priority: 0, owner: "Jack", todo: "Integrate it and go live with first client (3/20)", starred: true },
    { id: uid(), title: "Error Rate", priority: 1, owner: "", todo: "", starred: true },
    { id: uid(), title: "Fulfillment Time", priority: 1, owner: "", todo: "", starred: true },
    { id: uid(), title: "Label Printing", priority: 1, owner: "", todo: "", starred: false },
    { id: uid(), title: "Safety", priority: 2, owner: "", todo: "", starred: false },
    { id: uid(), title: "Organization", priority: 0, owner: "Drew", todo: "Clean up / throw out waste (3/20)", starred: false },
    { id: uid(), title: "Time Management", priority: 1, owner: "", todo: "", starred: false },
    { id: uid(), title: "Sales Process kinda unproven", priority: 1, owner: "", todo: "", starred: false },
    { id: uid(), title: "Cash Flow", priority: 0, owner: "Joe", todo: "Model + Accounting System in place (3/20)", starred: false },
    { id: uid(), title: "Lack of Standardization", priority: 0, owner: "", todo: "", starred: false },
    { id: uid(), title: "Smart Layout", priority: 1, owner: "", todo: "", starred: false },
    { id: uid(), title: "Account Management", priority: 1, owner: "", todo: "", starred: false },
  ],
  issuesMully: [
    { id: uid(), title: "Finances / Capital", priority: 0, owner: "Drew", todo: "Restructure operating model/expenses and debt stack (3/20)", starred: true },
    { id: uid(), title: "Quality", priority: 1, owner: "", todo: "", starred: true },
    { id: uid(), title: "Inventory Management", priority: 0, owner: "Jack", todo: "A baseline system for inventory tracking (kinda manual 3/20)", starred: true },
    { id: uid(), title: "Customer Service", priority: 1, owner: "", todo: "", starred: false },
    { id: uid(), title: "Repeatable Marketing Strategy", priority: 1, owner: "", todo: "", starred: false },
    { id: uid(), title: "Brand Equity", priority: 2, owner: "", todo: "", starred: false },
    { id: uid(), title: "GTM Strategy", priority: 1, owner: "", todo: "", starred: false },
    { id: uid(), title: "Retention", priority: 1, owner: "", todo: "", starred: false },
    { id: uid(), title: "Upselling / diverse revenue", priority: 1, owner: "", todo: "", starred: false },
    { id: uid(), title: "Buggy Customer Flow", priority: 0, owner: "Drew", todo: "Harmonize SKUS then update return portal", starred: false },
  ],
  scorecard: {
    mfs: [
      { id: uid(), measurable: "Fulfillment Orders", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Special Project Hours", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Net Total Sales", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Fulfillment Labor Cost", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Cash Change", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "New Accounts Landed", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "5S Score for the Week", owner: "", goal: "", weekData: {} },
    ],
    mully: [
      { id: uid(), measurable: "Active Subscribers (new)", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Active Subscribers (legacy)", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Net Cash change (Cash Change - Debt Increase/+Debt Decrease)", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Marketing Spend", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Order to Ship Time", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "New Subscribers Gained (% of total active)", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Subscribers Lost (% of total active)", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Customer Service Volume", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Average Junip Rating for Week", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Legacy Subscribers Converted (% of Total)", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Visitors on Site", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Site convert to account", owner: "", goal: "", weekData: {} },
      { id: uid(), measurable: "Account to purchase", owner: "", goal: "", weekData: {} },
    ],
  },
  links: [],
  marketing: {
    stages: [
      /* ── Phase 1: Active Subscribers (1,400) ── */
      {
        id: uid(), name: "Rollout", subtitle: "Active Subscribers",
        status: "planning",
        segment: "Current active subscribers (~1,400)",
        channels: [
          { id: uid(), name: "Email", icon: "\u2709\uFE0F", color: "#3B82F6", content: [], campaigns: [
            { id: uid(), name: "Membership Launch Sequence", content: [
              ci("Teaser \u2014 Something new is coming", "email", "Countdown GIF, sneak-peek of member dashboard", ["Open Rate \u2265 40%"], 1),
              ci("Launch Announcement", "email", "Hero image of membership tiers, CTA button to join", ["Click Rate \u2265 12%"], 2),
              ci("Membership Benefit Spotlight", "email", "Carousel of exclusive perks: discounts, early access, rewards", ["Conversions \u2265 3%"], 3),
            ] },
          ] },
          { id: uid(), name: "SMS", icon: "\uD83D\uDCF1", color: "#10B981", content: [], campaigns: [
            { id: uid(), name: "Launch SMS Series", content: [
              ci("Teaser \u2014 short & punchy", "sms", "Big news dropping soon from MyMully \uD83D\uDC40", ["Open Rate \u2265 55%"], 1),
              ci("Launch Day Alert", "sms", "Membership is LIVE! Tap to claim your spot \u2192", ["Click Rate \u2265 8%"], 2),
              ci("Exclusive Member Deal", "sms", "Members save 20% this week only \u2014 don't miss out", ["Conversions \u2265 2%"], 3),
            ] },
          ] },
          { id: uid(), name: "Physical Letter", icon: "\uD83D\uDCE8", color: "#8B5CF6", content: [], campaigns: [
            { id: uid(), name: "Welcome Mailer", content: [
              ci("Welcome Notice + QR Code", "physical letter", "Branded postcard with QR to signup page, limited-time offer", ["QR Scans \u2265 5%"], 1),
            ] },
          ] },
          { id: uid(), name: "Social Media", icon: "\uD83D\uDCF1", color: "#E1306C", content: [], campaigns: [
            { id: uid(), name: "Launch Social", content: [
              ci("Launch Announcement Post", "social post", "High-energy video reel: unboxing membership perks", ["Views \u2265 50K"], 1),
            ] },
          ] },
        ],
        tasks: [], feedback: "",
      },
      /* ── Phase 2: Cancelled / One-Time Buyers (3,200) ── */
      {
        id: uid(), name: "Level 2", subtitle: "Cancelled / One-Time Buyers",
        status: "planning",
        segment: "Cancelled subscribers, one-time purchasers (~3,200)",
        channels: [
          { id: uid(), name: "Email", icon: "\u2709\uFE0F", color: "#3B82F6", content: [], campaigns: [
            { id: uid(), name: "Win-Back Sequence", content: [
              ci("We miss you \u2014 Win-Back", "email", "Personalized copy referencing last purchase, re-engage CTA", ["Open Rate \u2265 30%"], 1),
              ci("What's New at MyMully", "email", "New products + membership value prop side-by-side", ["Click Rate \u2265 8%"], 2),
              ci("Limited-Time Comeback Offer", "email", "Exclusive 30-day free trial or discount on first membership month", ["Conversions \u2265 2%"], 3),
            ] },
          ] },
          { id: uid(), name: "SMS", icon: "\uD83D\uDCF1", color: "#10B981", content: [], campaigns: [
            { id: uid(), name: "Win-Back SMS", content: [
              ci("Win-Back Nudge", "sms", "Come back & try MyMully Membership free for 30 days", ["Click Rate \u2265 6%"], 1),
              ci("Urgency Reminder", "sms", "Last chance \u2014 your free trial offer expires tomorrow", ["Click Rate \u2265 5%"], 2),
            ] },
          ] },
          { id: uid(), name: "Retargeting Ads", icon: "\uD83C\uDFAF", color: "#F97316", content: [], campaigns: [
            { id: uid(), name: "Retargeting", content: [
              ci("Display & Social Retargeting", "ad creative", "Dynamic product ads paired with membership benefits callout", ["CTR \u2265 1.5%"], 1),
            ] },
          ] },
          { id: uid(), name: "Social Media", icon: "\uD83D\uDCF1", color: "#E1306C", content: [], campaigns: [
            { id: uid(), name: "UGC & Testimonials", content: [
              ci("Testimonial / UGC Post", "social post", "Real member stories: savings, exclusive access, community", ["Engagement \u2265 4%"], 1),
            ] },
          ] },
          { id: uid(), name: "Direct Mail", icon: "\uD83D\uDCEC", color: "#F59E0B", content: [], campaigns: [
            { id: uid(), name: "Comeback Mailer", content: [
              ci("Comeback Postcard", "direct mail", "\"Your membership is waiting\" postcard with personalized QR code", ["QR Scans \u2265 3%"], 1),
            ] },
          ] },
        ],
        tasks: [], feedback: "",
      },
      /* ── Phase 3: Email List / Non-Purchasers (12,000+) ── */
      {
        id: uid(), name: "Level 3", subtitle: "Email List (Non-Purchasers)",
        status: "planning",
        segment: "Broader email list, non-purchasers (~12,000+)",
        channels: [
          { id: uid(), name: "Email", icon: "\u2709\uFE0F", color: "#3B82F6", content: [], campaigns: [
            { id: uid(), name: "Nurture Sequence", content: [
              ci("Introduction to MyMully Membership", "email", "Clean infographic: what membership includes, pricing tiers", ["Open Rate \u2265 25%"], 1),
              ci("Social Proof & Reviews", "email", "Star ratings, member quotes, trust badges", ["Click Rate \u2265 6%"], 2),
              ci("Free Trial / Intro Offer", "email", "Try membership free for 14 days \u2014 no commitment", ["Conversions \u2265 1.5%"], 3),
            ] },
          ] },
          { id: uid(), name: "SMS", icon: "\uD83D\uDCF1", color: "#10B981", content: [], campaigns: [
            { id: uid(), name: "Brand Intro SMS", content: [
              ci("Brand Intro + Membership CTA", "sms", "Discover why 1,400+ members love MyMully \u2192", ["Click Rate \u2265 4%"], 1),
            ] },
          ] },
          { id: uid(), name: "Social Media", icon: "\uD83D\uDCF1", color: "#E1306C", content: [], campaigns: [
            { id: uid(), name: "Organic Social", content: [
              ci("Educational Carousel", "social post", "\"5 reasons MyMully members save more\" carousel post", ["Saves \u2265 2%"], 1),
              ci("Influencer Collaboration", "influencer", "Influencer unboxing/walkthrough of member experience", ["Views \u2265 75K"], 2),
            ] },
          ] },
          { id: uid(), name: "Blog / SEO", icon: "\uD83D\uDCDD", color: "#6366F1", content: [], campaigns: [
            { id: uid(), name: "Content Marketing", content: [
              ci("Is a Membership Worth It? \u2014 Article", "blog post", "Long-form comparison: membership vs. one-time buying", ["Page Views \u2265 2K"], 1),
            ] },
          ] },
          { id: uid(), name: "Referral Program", icon: "\uD83E\uDD1D", color: "#0D9488", content: [], campaigns: [
            { id: uid(), name: "Member-Get-Member", content: [
              ci("Member-Get-Member Launch", "referral", "Share your link, earn $10 credit per signup", ["Referrals \u2265 100"], 1),
            ] },
          ] },
        ],
        tasks: [], feedback: "",
      },
      /* ── Phase 4: Broader Audience Acquisition ── */
      {
        id: uid(), name: "Level 4", subtitle: "Broader Audience",
        status: "planning",
        segment: "Cold audiences, lookalikes, paid channels",
        channels: [
          { id: uid(), name: "Paid Social", icon: "\uD83D\uDCB0", color: "#1877F2", content: [], campaigns: [
            { id: uid(), name: "Prospecting Campaigns", content: [
              ci("Meta Prospecting (LAL 1-3%)", "paid social", "Video ads showcasing membership value + savings calculator", ["CPA \u2264 $18"], 1),
              ci("TikTok Prospecting", "paid social", "Trend-driven short-form: POV you just joined MyMully", ["CPA \u2264 $22"], 2),
            ] },
          ] },
          { id: uid(), name: "Google Ads", icon: "\uD83D\uDD0D", color: "#EA4335", content: [], campaigns: [
            { id: uid(), name: "Search & PMax", content: [
              ci("Search \u2014 Brand + Category", "search ad", "MyMully Membership + category keywords with offer extensions", ["CPA \u2264 $15"], 1),
              ci("Performance Max", "pmax", "Asset group with membership visuals, reviews, pricing", ["ROAS \u2265 3.5x"], 2),
            ] },
          ] },
          { id: uid(), name: "YouTube", icon: "\u25B6\uFE0F", color: "#FF0000", content: [], campaigns: [
            { id: uid(), name: "Video Ads", content: [
              ci("Pre-Roll / In-Stream Ad", "video ad", "30-sec explainer: what members get, how to join", ["VTR \u2265 25%"], 1),
            ] },
          ] },
          { id: uid(), name: "Podcast / Audio", icon: "\uD83C\uDFA7", color: "#9333EA", content: [], campaigns: [
            { id: uid(), name: "Sponsored Segments", content: [
              ci("Sponsored Segment", "audio ad", "Host-read ad with unique promo code \"MYMULLY\"", ["Promo Code Use \u2265 50"], 1),
            ] },
          ] },
          { id: uid(), name: "PR / Media", icon: "\uD83D\uDCF0", color: "#0EA5E9", content: [], campaigns: [
            { id: uid(), name: "Launch PR", content: [
              ci("Launch Press Release", "press release", "Newsworthy angle: community-first membership model", ["Placements \u2265 5"], 1),
            ] },
          ] },
          { id: uid(), name: "Partnerships", icon: "\uD83E\uDD1D", color: "#0D9488", content: [], campaigns: [
            { id: uid(), name: "Co-Branded Campaign", content: [
              ci("Co-Branded Campaign", "partnership", "Bundle deal or cross-promo with complementary brand", ["Signups \u2265 200"], 1),
            ] },
          ] },
        ],
        tasks: [], feedback: "",
      },
    ],
    learnings: [],
  },

  pipeline: {
    mully: [
      {
        id: uid(), pipeline: "mully", company: "Titleist Corporate Events", stage: "Meeting Scheduled", starred: true, value: 45000,
        contact: { name: "Brian Hastings", title: "VP Corporate Partnerships", email: "bhastings@titleist.com", phone: "508-555-0142" },
        dealOwner: "Drew", accountOwner: "Drew",
        notes: [
          { id: uid(), date: "2026-03-10", author: "drew", text: "Great intro call — they host 6 corp outings/yr and want a premium partner. Sending capabilities deck." },
          { id: uid(), date: "2026-03-15", author: "drew", text: "Meeting set for 3/22 at their HQ. Bringing sample event package." },
        ],
        links: [{ id: uid(), label: "Capabilities Deck", url: "https://drive.google.com/deck" }],
        createdDate: "2026-03-05", lastActivity: "2026-03-15", tags: ["premium"],
      },
      {
        id: uid(), pipeline: "mully", company: "TaylorMade Partnerships", stage: "Following Up", starred: false, value: 30000,
        contact: { name: "Sarah Chen", title: "Events Director", email: "schen@taylormade.com", phone: "760-555-0188" },
        dealOwner: "Drew", accountOwner: "Drew",
        notes: [{ id: uid(), date: "2026-03-12", author: "drew", text: "Sent intro email with event photos. Following up Friday." }],
        links: [], createdDate: "2026-03-08", lastActivity: "2026-03-12", tags: [],
      },
      {
        id: uid(), pipeline: "mully", company: "Callaway Golf Days", stage: "Cold Outreach", starred: false, value: 25000,
        contact: { name: "Mike Torres", title: "Brand Activations Mgr", email: "mtorres@callaway.com", phone: "760-555-0234" },
        dealOwner: "Drew", accountOwner: "Joe",
        notes: [{ id: uid(), date: "2026-03-16", author: "drew", text: "Found contact on LinkedIn. Sent connection request + cold email." }],
        links: [], createdDate: "2026-03-16", lastActivity: "2026-03-16", tags: [],
      },
      {
        id: uid(), pipeline: "mully", company: "Topgolf Corporate", stage: "Proposal Sent", starred: true, value: 60000,
        contact: { name: "Jessica Wright", title: "Sr. Partnerships Manager", email: "jwright@topgolf.com", phone: "214-555-0177" },
        dealOwner: "Drew", accountOwner: "Drew",
        notes: [
          { id: uid(), date: "2026-02-28", author: "drew", text: "Met at industry event. Huge opportunity — they want to add premium golf outings to their corporate menu." },
          { id: uid(), date: "2026-03-08", author: "drew", text: "Discovery call went great. Sending proposal for 4-event pilot." },
          { id: uid(), date: "2026-03-14", author: "drew", text: "Proposal sent. $60K for 4-event pilot. Waiting on their procurement team." },
        ],
        links: [{ id: uid(), label: "Proposal PDF", url: "https://drive.google.com/proposal-topgolf" }],
        createdDate: "2026-02-28", lastActivity: "2026-03-14", tags: ["pilot", "high-value"],
      },
      {
        id: uid(), pipeline: "mully", company: "PGA Tour Experiences", stage: "Responded", starred: false, value: 75000,
        contact: { name: "David Park", title: "Director of Experiences", email: "dpark@pgatour.com", phone: "904-555-0199" },
        dealOwner: "Drew", accountOwner: "Joe",
        notes: [{ id: uid(), date: "2026-03-13", author: "drew", text: "They replied! Interested in exploring co-branded golf experiences. Want to set up a call next week." }],
        links: [], createdDate: "2026-03-01", lastActivity: "2026-03-13", tags: ["co-brand"],
      },
      {
        id: uid(), pipeline: "mully", company: "ClubCorp Events", stage: "Signed", starred: false, value: 35000,
        contact: { name: "Amanda Liu", title: "Events Coordinator", email: "aliu@clubcorp.com", phone: "972-555-0166" },
        dealOwner: "Drew", accountOwner: "Drew",
        notes: [
          { id: uid(), date: "2026-02-15", author: "drew", text: "Signed 3-event package! First outing scheduled for April 12." },
        ],
        links: [{ id: uid(), label: "Signed Contract", url: "https://drive.google.com/clubcorp-contract" }],
        createdDate: "2026-01-20", lastActivity: "2026-02-15", tags: [],
      },
      {
        id: uid(), pipeline: "mully", company: "Pebble Beach Resorts", stage: "Parking Lot", starred: false, value: 100000,
        contact: { name: "Robert Kim", title: "Corporate Sales Director", email: "rkim@pebblebeach.com", phone: "831-555-0211" },
        dealOwner: "Drew", accountOwner: "Drew",
        notes: [{ id: uid(), date: "2026-02-20", author: "drew", text: "Interested but their 2026 calendar is full. Revisit in Q4 for 2027 planning." }],
        links: [], createdDate: "2026-02-10", lastActivity: "2026-02-20", tags: ["whale"],
      },
    ] as Deal[],
    mfs: [
      {
        id: uid(), pipeline: "mfs", company: "FreshDirect", stage: "Meeting Scheduled", starred: true, value: 120000,
        contact: { name: "Karen Patel", title: "VP Supply Chain", email: "kpatel@freshdirect.com", phone: "718-555-0133" },
        dealOwner: "Drew", accountOwner: "Joe",
        notes: [
          { id: uid(), date: "2026-03-10", author: "drew", text: "Intro from networking event. They're looking to switch 3PL providers. Meeting scheduled for 3/20." },
          { id: uid(), date: "2026-03-14", author: "joe", text: "Prepped capabilities doc with cold chain specs. Drew presenting Thursday." },
        ],
        links: [{ id: uid(), label: "Capabilities Doc", url: "https://drive.google.com/mfs-capabilities" }],
        createdDate: "2026-03-05", lastActivity: "2026-03-14", tags: ["cold-chain"],
      },
      {
        id: uid(), pipeline: "mfs", company: "Bloom & Wild", stage: "Proposal Sent", starred: false, value: 85000,
        contact: { name: "Tom Sanders", title: "Head of Logistics", email: "tsanders@bloomandwild.com", phone: "212-555-0178" },
        dealOwner: "Drew", accountOwner: "Joe",
        notes: [
          { id: uid(), date: "2026-03-01", author: "drew", text: "Great discovery call. They need temp-controlled fulfillment for perishable flower kits." },
          { id: uid(), date: "2026-03-11", author: "drew", text: "Proposal sent — $85K annual for fulfillment + kitting." },
        ],
        links: [{ id: uid(), label: "Proposal", url: "https://drive.google.com/bloom-proposal" }],
        createdDate: "2026-02-20", lastActivity: "2026-03-11", tags: ["perishable"],
      },
      {
        id: uid(), pipeline: "mfs", company: "Dollar Shave Club", stage: "Following Up", starred: false, value: 200000,
        contact: { name: "Nina Vasquez", title: "Fulfillment Manager", email: "nvasquez@dollarshaveclub.com", phone: "310-555-0199" },
        dealOwner: "Drew", accountOwner: "Drew",
        notes: [{ id: uid(), date: "2026-03-08", author: "drew", text: "Cold email got a response — they're exploring regional 3PL partners. Sent follow-up with case studies." }],
        links: [], createdDate: "2026-03-03", lastActivity: "2026-03-08", tags: ["subscription"],
      },
      {
        id: uid(), pipeline: "mfs", company: "Warby Parker", stage: "Cold Outreach", starred: false, value: 150000,
        contact: { name: "Raj Mehta", title: "Director of Operations", email: "rmehta@warbyparker.com", phone: "646-555-0222" },
        dealOwner: "Drew", accountOwner: "Joe",
        notes: [{ id: uid(), date: "2026-03-17", author: "drew", text: "Identified as ideal ICP match. LinkedIn DM + email sent today." }],
        links: [], createdDate: "2026-03-17", lastActivity: "2026-03-17", tags: ["dtc"],
      },
      {
        id: uid(), pipeline: "mfs", company: "Glossier", stage: "Responded", starred: true, value: 175000,
        contact: { name: "Amy Chen", title: "Sr. Operations Manager", email: "achen@glossier.com", phone: "646-555-0188" },
        dealOwner: "Drew", accountOwner: "Joe",
        notes: [
          { id: uid(), date: "2026-03-06", author: "drew", text: "Cold outreach via LinkedIn. She replied — wants to learn more about our DTC fulfillment capabilities." },
          { id: uid(), date: "2026-03-13", author: "drew", text: "Sent detailed overview. She's sharing with their ops team. Following up next week." },
        ],
        links: [], createdDate: "2026-03-01", lastActivity: "2026-03-13", tags: ["beauty", "dtc"],
      },
      {
        id: uid(), pipeline: "mfs", company: "Casper Logistics", stage: "Signed", starred: false, value: 95000,
        contact: { name: "Mark Sullivan", title: "Logistics Coordinator", email: "msullivan@casper.com", phone: "646-555-0155" },
        dealOwner: "Drew", accountOwner: "Joe",
        notes: [
          { id: uid(), date: "2026-02-10", author: "drew", text: "Signed! Starting with mattress accessory fulfillment. Onboarding kicked off." },
        ],
        links: [{ id: uid(), label: "MSA", url: "https://drive.google.com/casper-msa" }],
        createdDate: "2026-01-15", lastActivity: "2026-02-10", tags: [],
      },
      {
        id: uid(), pipeline: "mfs", company: "Allbirds", stage: "Onboarding", starred: false, value: 110000,
        contact: { name: "Lisa Tran", title: "Fulfillment Director", email: "ltran@allbirds.com", phone: "415-555-0177" },
        dealOwner: "Joe", accountOwner: "Joe",
        notes: [
          { id: uid(), date: "2026-01-28", author: "joe", text: "Contract signed. Setting up warehouse integration and inventory receiving." },
          { id: uid(), date: "2026-02-15", author: "jack", text: "Shiphero integration live. First test shipment successful." },
          { id: uid(), date: "2026-03-01", author: "joe", text: "Onboarding 80% complete. Full go-live targeted for 3/20." },
        ],
        links: [
          { id: uid(), label: "Onboarding Checklist", url: "https://drive.google.com/allbirds-onboard" },
          { id: uid(), label: "Integration Spec", url: "https://drive.google.com/allbirds-spec" },
        ],
        createdDate: "2026-01-10", lastActivity: "2026-03-01", tags: ["dtc", "apparel"],
      },
    ] as Deal[],
  },
};
