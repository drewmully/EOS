export type RockStatus = "On Track" | "At Risk" | "Off Track" | "Done";
export type Business = "MFS" | "Mully";

export interface Subtask {
  id: string;
  text: string;
  due: string;
  done: boolean;
}

export interface Rock {
  id: string;
  name: string;
  biz: Business;
  due: string;
  status: RockStatus;
  subtasks: Subtask[];
}

export interface Todo {
  id: string;
  text: string;
  due: string;
  done: boolean;
}

export interface InboxItem {
  id: string;
  text: string;
  date: string;
  biz: string;
  triage: string;
}

export interface Seat {
  id: string;
  name: string;
  hours: string;
  exit: string;
  timeline: string;
  status: string;
  notes: string;
}

export interface CoreValueRating {
  serveFirst: string;
  moveTheMission: string;
  winTogether: string;
  liveTheStandard: string;
  tellTheTruth: string;
  choosePositive: string;
}

export interface GWC {
  g: string;
  w: string;
  c: string;
}

export interface GrowthAction {
  id: string;
  area: string;
  action: string;
  due: string;
  done: boolean;
}

export interface GrowthData {
  coreValues: CoreValueRating;
  gwc: GWC;
  strengths: string[];
  weaknesses: string[];
  actions: GrowthAction[];
}

export interface Priority {
  text: string;
  done: boolean;
}

export interface UserData {
  rocks: Rock[];
  todos: Todo[];
  inbox: InboxItem[];
  seats: Seat[];
  todayPriorities: Priority[];
  growth: GrowthData;
  streakDays: number;
  lastActiveDate: string;
}

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export const USERS: UserProfile[] = [
  { id: "drew", name: "Drew", initials: "DM", color: "#0D9488" },
  { id: "jack", name: "Jack", initials: "JK", color: "#6366F1" },
  { id: "joe", name: "Joe", initials: "JO", color: "#F59E0B" },
];

/* ── Shared data (not per-user) ── */

export interface Issue {
  id: string;
  title: string;
  priority: number; // 0 = highest, 3 = lowest
  owner: string;    // user name or empty
  todo: string;     // agreed resolution / to-do
  starred: boolean; // top-3 for IDS today
}

export interface ScorecardRow {
  id: string;
  measurable: string;
  owner: string;
  goal: string;
  weekData: Record<string, string>; // key = "YYYY-MM-DD" (Friday date), value = entered data
}

export interface Scorecard {
  mfs: ScorecardRow[];
  mully: ScorecardRow[];
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  category: string; // e.g. "SOP", "Artifact", etc.
}

/* ── Fibonacci Marketing Planner ── */

export type StageStatus = "locked" | "planning" | "active" | "review" | "complete";
export type ContentStatus = "idea" | "draft" | "review" | "scheduled" | "live";

export interface ContentItem {
  id: string;
  title: string;
  type: string;            // email blast, social post, ad creative, landing page, etc.
  status: ContentStatus;
  body: string;            // the actual copy / brief
  assignee: string;
  scheduledDate: string;   // YYYY-MM-DD — when it goes out (populates calendar)
  order: number;           // sort order within channel for drag-reorder
  tags: string[];          // flexible labels: "urgency", "promo", "educational", etc.
}

export interface MarketingTask {
  id: string;
  text: string;
  assignee: string;
  due: string;
  done: boolean;
}

export interface Campaign {
  id: string;
  name: string;            // "Welcome Series", "Monthly Newsletter", etc.
  content: ContentItem[];
}

export interface MarketingChannel {
  id: string;
  name: string;            // Email, SMS, Instagram, Facebook Ads, etc.
  icon: string;            // emoji or short label for visual
  color: string;           // hex accent color
  content: ContentItem[];  // legacy flat content (migrated to campaigns)
  campaigns: Campaign[];   // named campaigns within this channel
}

export interface MarketingStage {
  id: string;
  name: string;            // editable: "Rollout", "Level 2", etc.
  subtitle: string;        // editable: "Active Subscribers", etc.
  status: StageStatus;
  segment: string;         // editable: who we're targeting
  channels: MarketingChannel[];
  tasks: MarketingTask[];
  feedback: string;        // quick feedback before unlocking next stage
}

export interface Learning {
  id: string;
  date: string;
  stageId: string;
  text: string;
  metric: string;
  insight: string;
}

export interface MarketingData {
  stages: MarketingStage[];
  learnings: Learning[];
}

export interface SharedData {
  issuesMFS: Issue[];
  issuesMully: Issue[];
  scorecard: Scorecard;
  links: LinkItem[];
  marketing: MarketingData;
}
