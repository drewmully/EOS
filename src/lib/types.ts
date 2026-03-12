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
