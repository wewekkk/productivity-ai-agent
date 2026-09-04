import { z } from "zod";
import type { Quest, TaskType, Subtask } from "./types";

export const RouterSchema = z.object({ type: z.enum(["fixed_event", "simple_task", "complex_quest"]), planningRequired: z.boolean(), breakdownRequired: z.boolean(), gamify: z.boolean(), deadline: z.string().optional(), constraints: z.array(z.string()), reason: z.string() });
export type RouterDecision = z.infer<typeof RouterSchema>;

const iso = (date: Date) => date.toISOString();
const dateFromText = (input: string) => {
  const match = input.match(/(?:before|by|前|在)\s*(?:september|sep\.?|9月)\s*(\d{1,2})/i);
  const today = new Date();
  if (match) return new Date(today.getFullYear(), 8, Number(match[1]), 17, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1); tomorrow.setHours(17, 0, 0, 0); return tomorrow;
};
export function routeGoal(input: string): RouterDecision {
  const lower = input.toLowerCase(); const deadline = dateFromText(input).toISOString();
  const constraints: string[] = [];
  if (/tired|疲|30\s*minutes|30分鐘|sleep early|早點睡/i.test(lower)) constraints.push("Low energy tonight — cap work at 30 minutes and protect sleep");
  if (/(lunch|meeting|appointment|午餐|會議).*(\d{1,2})\s*[:：]?\s*(\d{2})?/i.test(lower)) return RouterSchema.parse({ type: "fixed_event", planningRequired: false, breakdownRequired: false, gamify: false, deadline, constraints, reason: "An explicit time makes this a calendar event, not a quest." });
  if (/(finish|complete|寫完|完成).*(cv|resume|履歷|report|proposal|專案)|before|by|截止/i.test(lower)) return RouterSchema.parse({ type: "complex_quest", planningRequired: true, breakdownRequired: true, gamify: true, deadline, constraints, reason: "This has a deadline and requires multiple focused work sessions." });
  return RouterSchema.parse({ type: "simple_task", planningRequired: true, breakdownRequired: false, gamify: true, deadline, constraints, reason: "This is one actionable item that fits in a single session." });
}
function makeTask(id: string, title: string, minutes: number, damage: number, at: Date): Subtask { return { id, title, minutes, damage, scheduledAt: iso(at), status: "planned" }; }
function slot(dayOffset: number, hour: number, minutes = 0) { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(hour, minutes, 0, 0); return d; }
export function createQuest(input: string): Quest {
  const decision = routeGoal(input); const now = new Date(); const id = crypto.randomUUID();
  if (decision.type === "fixed_event") { const start = slot(1, 12); const end = new Date(start.getTime() + 60 * 60000); return { id, title: input, source: input, type: decision.type, deadline: iso(start), bufferHours: 0, status: "SAFE", bossHp: 0, xp: 0, level: 1, constraints: decision.constraints, subtasks: [], events: [{ id: crypto.randomUUID(), title: input, start: iso(start), end: iso(end), provider: "demo" }], activity: ["Goal understood", "Fixed Event detected", "Demo Calendar event created"], lastSignal: "No planning required — added directly to your calendar." }; }
  if (decision.type === "simple_task") { const at = slot(1, 10); const task = makeTask(crypto.randomUUID(), input, 30, 100, at); return { id, title: input, source: input, type: decision.type, deadline: decision.deadline, bufferHours: 12, status: "SAFE", bossHp: 100, xp: 0, level: 1, constraints: decision.constraints, subtasks: [task], events: [eventFromTask(task)], activity: ["Goal understood", "Simple Task detected", "Suitable focus slot selected", "Demo Calendar event created"], lastSignal: "A small monster is waiting for one focused session." }; }
  const tired = decision.constraints.length > 0; const tasks = [makeTask(crypto.randomUUID(), "Collect experience & achievements", tired ? 30 : 40, 20, slot(0, tired ? 19 : 17)), makeTask(crypto.randomUUID(), "Write CV first draft", 60, 40, slot(1, 10)), makeTask(crypto.randomUUID(), "Polish structure and wording", 45, 25, slot(1, 15)), makeTask(crypto.randomUUID(), "Final check & export", 30, 15, slot(2, 10))]; const deadline = dateFromText(input); const safe = new Date(deadline.getTime() - 24 * 3600000); const buffer = Math.max(0, Math.round((deadline.getTime() - new Date(tasks.at(-1)!.scheduledAt).getTime()) / 3600000));
  return { id, title: "Finish Exchange CV", source: input, type: decision.type, deadline: iso(deadline), safeFinish: iso(safe), criticalDeadline: iso(deadline), bufferHours: Number.isFinite(buffer) && buffer > 0 ? buffer : 24, status: "SAFE", bossHp: 100, xp: 0, level: 3, constraints: decision.constraints, subtasks: tasks, events: tasks.map(eventFromTask), activity: ["Goal understood", "Complex Quest detected", "4 subtasks generated", "Schedule optimized with buffer", "Demo Calendar events created"], lastSignal: "Boss spawned. Your safe route preserves time for a final review." };
}
function eventFromTask(task: Subtask) { const start = new Date(task.scheduledAt); return { id: crypto.randomUUID(), title: task.title, start: iso(start), end: iso(new Date(start.getTime() + task.minutes * 60000)), provider: "demo" as const }; }
export function resolveTask(quest: Quest, taskId: string, outcome: "complete" | "missed"): Quest {
  const task = quest.subtasks.find((item) => item.id === taskId); if (!task || task.status !== "planned") return quest;
  const updated = structuredClone(quest); const selected = updated.subtasks.find((item) => item.id === taskId)!; selected.status = outcome;
  if (outcome === "complete") { const ahead = new Date() < new Date(selected.scheduledAt); const damage = selected.damage; updated.bossHp = Math.max(0, updated.bossHp - damage); updated.xp += ahead ? damage + 15 : damage; updated.status = updated.bossHp === 0 ? "PERFECT" : updated.bufferHours >= 18 ? "SAFE" : "DANGER"; updated.lastSignal = updated.bossHp === 0 ? "🏆 BOSS DEFEATED — Quest complete! Rare Chest unlocked." : ahead ? `⚡ CRITICAL HIT — ${damage} damage and bonus XP!` : `⚔️ NORMAL HIT — ${damage} damage dealt.`; if (updated.bossHp === 0) { const rewards = ["Moonlit Sword Skin", "Scholar Owl Pet", "Aurora Room Decoration", "Questkeeper Card"]; updated.reward = rewards[Math.floor(Math.random() * rewards.length)]; updated.activity = [...updated.activity, "All subtasks observed complete", "Boss defeated", "Chest reward generated"]; } else updated.activity = [...updated.activity, `${selected.title} observed complete`, "Progress and risk recalculated"]; return updated; }
  const remaining = updated.subtasks.filter((item) => item.status === "planned"); const anchor = slot(1, 10); selected.status = "missed"; selected.scheduledAt = iso(anchor); const first = remaining[0]; if (first) { first.title = `Recovery: ${selected.title} + ${first.title}`; first.minutes += selected.minutes; first.damage += selected.damage; }
  updated.events = updated.events.filter((event) => event.title !== selected.title).map((event) => ({ ...event, start: event.start, end: event.end })); if (first) { const event = updated.events.find((item) => item.title.includes(first.title.replace("Recovery: ", ""))) ?? updated.events[0]; if (event) { event.title = first.title; event.start = first.scheduledAt; event.end = iso(new Date(new Date(first.scheduledAt).getTime() + first.minutes * 60000)); } }
  updated.bufferHours = Math.max(0, updated.bufferHours - 12); updated.status = updated.bufferHours <= 6 ? "CRITICAL" : "DANGER"; updated.lastSignal = `⚠️ BOSS ENRAGED — Recovery Quest created. Buffer decreased; tomorrow's focus session now combines the missed work.`; updated.activity = [...updated.activity, "Missed task detected", "Remaining time evaluated", "Deadline risk recalculated", "Recovery plan generated", "Demo Calendar schedule updated"]; return updated;
}
