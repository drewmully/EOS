import { Rock } from "./types";

export function uid(): string {
  return "id_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

export function daysUntil(ds: string): number {
  if (!ds) return 999;
  const d = new Date(ds + "T00:00:00");
  const n = new Date();
  n.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - n.getTime()) / 86400000);
}

export function pct(rock: Rock): number {
  if (!rock.subtasks.length) return 0;
  return Math.round(
    (rock.subtasks.filter((s) => s.done).length / rock.subtasks.length) * 100
  );
}

export function fmtDate(ds: string): string {
  if (!ds) return "";
  try {
    const d = new Date(ds + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return ds;
  }
}

/**
 * Calculate urgency score for a rock.
 * Higher = needs more attention.
 * Factors: deadline proximity, completion %, status, overdue subtasks
 */
export function urgencyScore(rock: Rock): number {
  const days = daysUntil(rock.due);
  const completion = pct(rock);
  let score = 0;

  // Deadline factor: closer = more urgent
  if (days < 0) score += 40 + Math.min(Math.abs(days), 30); // overdue
  else if (days <= 7) score += 35;
  else if (days <= 14) score += 25;
  else if (days <= 30) score += 15;
  else score += 5;

  // Low completion with near deadline
  const expectedCompletion = Math.max(0, Math.min(100, 100 - (days / 90) * 100));
  const completionGap = Math.max(0, expectedCompletion - completion);
  score += completionGap * 0.3;

  // Status penalty
  if (rock.status === "Off Track") score += 20;
  else if (rock.status === "At Risk") score += 10;
  else if (rock.status === "Done") score -= 100;

  // Overdue subtasks
  const overdueSubtasks = rock.subtasks.filter(
    (s) => !s.done && daysUntil(s.due) < 0
  ).length;
  score += overdueSubtasks * 5;

  return Math.round(score);
}

export function urgencyLabel(score: number): { text: string; color: string; bg: string } {
  if (score >= 40) return { text: "PUSH NOW", color: "#DC2626", bg: "#FEE2E2" };
  if (score >= 25) return { text: "NEEDS FOCUS", color: "#D97706", bg: "#FEF3C7" };
  if (score >= 10) return { text: "ON PACE", color: "#16A34A", bg: "#DCFCE7" };
  return { text: "CRUISING", color: "#6366F1", bg: "#E0E7FF" };
}

export interface Recommendation {
  text: string;
  reason: string;
  urgency: "high" | "medium" | "low";
  rockName?: string;
}

/**
 * Analyze rocks, subtasks, and deadlines to generate smart daily priority recommendations.
 */
export function getRecommendations(data: { rocks: Rock[]; todos: { text: string; due: string; done: boolean }[] }): Recommendation[] {
  const recs: Recommendation[] = [];

  // Analyze each rock
  for (const rock of data.rocks) {
    if (rock.status === "Done") continue;
    const score = urgencyScore(rock);
    const days = daysUntil(rock.due);
    const completion = pct(rock);

    // Overdue rock
    if (days < 0) {
      recs.push({
        text: `"${rock.name}" is ${Math.abs(days)}d overdue at ${completion}%`,
        reason: "Overdue rock needs immediate action",
        urgency: "high",
        rockName: rock.name,
      });
    }
    // Due this week with low completion
    else if (days <= 7 && completion < 80) {
      recs.push({
        text: `Push "${rock.name}" — due in ${days}d, only ${completion}% done`,
        reason: `${100 - completion}% remaining with ${days} days left`,
        urgency: "high",
        rockName: rock.name,
      });
    }
    // Off track
    else if (rock.status === "Off Track") {
      recs.push({
        text: `Get "${rock.name}" back on track`,
        reason: "Marked Off Track — needs attention",
        urgency: "high",
        rockName: rock.name,
      });
    }
    // At risk with near deadline
    else if (rock.status === "At Risk" && days <= 21) {
      recs.push({
        text: `Focus on "${rock.name}" — at risk, ${days}d left`,
        reason: "At risk with approaching deadline",
        urgency: "medium",
        rockName: rock.name,
      });
    }
    // Completion gap (behind where they should be)
    else if (score >= 25 && days > 7) {
      const expectedCompletion = Math.max(0, Math.min(100, 100 - (days / 90) * 100));
      if (completion < expectedCompletion - 15) {
        recs.push({
          text: `"${rock.name}" is behind pace — ${completion}% done, should be ~${Math.round(expectedCompletion)}%`,
          reason: "Falling behind expected progress",
          urgency: "medium",
          rockName: rock.name,
        });
      }
    }

    // Overdue subtasks
    const overdueSubs = rock.subtasks.filter((s) => !s.done && daysUntil(s.due) < 0);
    if (overdueSubs.length > 0) {
      recs.push({
        text: `${overdueSubs.length} overdue subtask${overdueSubs.length > 1 ? "s" : ""} on "${rock.name}"`,
        reason: overdueSubs.map((s) => s.text || "unnamed").join(", "),
        urgency: overdueSubs.length >= 2 ? "high" : "medium",
        rockName: rock.name,
      });
    }

    // Subtasks due today or tomorrow
    const urgentSubs = rock.subtasks.filter((s) => !s.done && daysUntil(s.due) >= 0 && daysUntil(s.due) <= 1);
    for (const sub of urgentSubs) {
      recs.push({
        text: `Complete "${sub.text || "subtask"}" on "${rock.name}" — due ${daysUntil(sub.due) === 0 ? "today" : "tomorrow"}`,
        reason: "Subtask deadline is imminent",
        urgency: "high",
        rockName: rock.name,
      });
    }
  }

  // Todos due today/tomorrow
  for (const todo of data.todos) {
    if (todo.done || !todo.due) continue;
    const days = daysUntil(todo.due);
    if (days < 0) {
      recs.push({
        text: `Overdue to-do: "${todo.text}"`,
        reason: `${Math.abs(days)}d overdue`,
        urgency: "medium",
      });
    } else if (days <= 1) {
      recs.push({
        text: `To-do due ${days === 0 ? "today" : "tomorrow"}: "${todo.text}"`,
        reason: "Deadline is imminent",
        urgency: "medium",
      });
    }
  }

  // Sort by urgency
  const urgOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => urgOrder[a.urgency] - urgOrder[b.urgency]);

  // Deduplicate by rockName (keep highest urgency per rock, but allow subtask-specific ones)
  const seen = new Set<string>();
  const deduped: Recommendation[] = [];
  for (const rec of recs) {
    const key = rec.text;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(rec);
    }
  }

  return deduped.slice(0, 5); // Top 5 recommendations
}
