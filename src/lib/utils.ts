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
