import { z } from "zod";
import type { Quest, Subtask } from "./types";

export const RouterSchema = z.object({ type: z.enum(["fixed_event", "simple_task", "complex_quest"]), planningRequired: z.boolean(), breakdownRequired: z.boolean(), gamify: z.boolean(), deadline: z.string().optional(), constraints: z.array(z.string()), reason: z.string() });
export type RouterDecision = z.infer<typeof RouterSchema>;
export type SessionReport = "start" | "partial" | "stuck" | "missed" | "complete";
const uid = () => globalThis.crypto?.randomUUID?.() ?? `quest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const iso = (date: Date) => date.toISOString();
const slot = (days: number, hour: number) => { const date = new Date(); date.setDate(date.getDate() + days); date.setHours(hour, 0, 0, 0); return date; };
const deadlineFrom = (input: string) => { const found = input.match(/(?:before|by|前|9月|9\/)(?:\s*月?\s*)?(\d{1,2})/i); const date = new Date(); if (found) return new Date(date.getFullYear(), 8, Number(found[1]), 18); date.setDate(date.getDate() + 3); date.setHours(18, 0, 0, 0); return date; };
const task = (title: string, minutes: number, damage: number, at: Date): Subtask => ({ id: uid(), title, minutes, damage, scheduledAt: iso(at), status: "planned" });
const eventFor = (item: Subtask) => ({ id: uid(), title: item.title, start: item.scheduledAt, end: iso(new Date(new Date(item.scheduledAt).getTime() + item.minutes * 60_000)), provider: "demo" as const });

export function routeGoal(input: string): RouterDecision {
  const constraints = /tired|疲|累|30\s*(minutes|分鐘)|sleep early|早點睡/i.test(input) ? ["今晚低能量：最多 30 分鐘，並保留睡眠時間"] : [];
  const deadline = iso(deadlineFrom(input));
  if (/(lunch|meeting|appointment|午餐|會議).*(\d{1,2})/i.test(input)) return RouterSchema.parse({ type: "fixed_event", planningRequired: false, breakdownRequired: false, gamify: false, deadline, constraints, reason: "這有明確時間，是固定事件。" });
  if (/(finish|complete|完成|寫完).*(cv|resume|履歷|report|proposal|專案)|before|by|前|截止/i.test(input)) return RouterSchema.parse({ type: "complex_quest", planningRequired: true, breakdownRequired: true, gamify: true, deadline, constraints, reason: "這有截止時間，並需要多個工作階段。" });
  return RouterSchema.parse({ type: "simple_task", planningRequired: true, breakdownRequired: false, gamify: true, deadline, constraints, reason: "這可在單一專注時段完成。" });
}

export function createQuest(input: string): Quest {
  const decision = routeGoal(input); const id = uid();
  if (decision.type === "fixed_event") { const start = slot(1, 12); return { id, title: input, source: input, type: decision.type, planState: "preview", deadline: iso(start), bufferHours: 0, status: "SAFE", bossHp: 0, xp: 0, level: 1, constraints: decision.constraints, subtasks: [], events: [{ id: uid(), title: input, start: iso(start), end: iso(new Date(start.getTime() + 3_600_000)), provider: "demo" }], activity: ["已理解目標", "偵測為固定事件", "已建立行事曆草案"], lastSignal: "請確認後才會寫入行事曆。" }; }
  if (decision.type === "simple_task") { const item = task(input, 30, 100, slot(1, 10)); return { id, title: input, source: input, type: decision.type, planState: "preview", deadline: decision.deadline, bufferHours: 12, status: "SAFE", bossHp: 100, xp: 0, level: 1, constraints: decision.constraints, subtasks: [item], events: [eventFor(item)], activity: ["已理解目標", "偵測為簡單任務", "已產生排程草案"], lastSignal: "先確認排程，再開始第一回合。" }; }
  const tired = decision.constraints.length > 0; const tasks = [task("整理經歷與成就", tired ? 30 : 40, 20, slot(0, tired ? 19 : 17)), task("撰寫履歷初稿", 60, 40, slot(1, 10)), task("潤飾結構與文字", 45, 25, slot(1, 15)), task("最終檢查與匯出", 30, 15, slot(2, 10))]; const deadline = deadlineFrom(input); const safe = new Date(deadline.getTime() - 86_400_000); const buffer = Math.max(0, Math.round((deadline.getTime() - new Date(tasks.at(-1)!.scheduledAt).getTime()) / 3_600_000));
  return { id, title: "完成交換履歷", source: input, type: decision.type, planState: "preview", deadline: iso(deadline), safeFinish: iso(safe), criticalDeadline: iso(deadline), bufferHours: buffer || 24, status: "SAFE", bossHp: 100, xp: 0, level: 3, constraints: decision.constraints, subtasks: tasks, events: tasks.map(eventFor), activity: ["已理解目標", "偵測為複雜 Quest", "已生成 4 個子任務", "已計算安全完成線與緩衝", "已建立排程預覽"], lastSignal: "先確認排程；確認前，Agent 不會對 Calendar 執行寫入。" };
}

export function confirmPlan(quest: Quest): Quest { return quest.planState === "confirmed" ? quest : { ...quest, planState: "confirmed", activity: [...quest.activity, "使用者確認排程", "已透過 Demo Calendar adapter 建立事件"], lastSignal: "排程已確認。任務開始時，按「開始」回報。" }; }

export function reportSession(quest: Quest, taskId: string, report: SessionReport): Quest {
  if (quest.planState !== "confirmed") return quest; const updated = structuredClone(quest); const item = updated.subtasks.find((entry) => entry.id === taskId); if (!item || item.status === "complete") return quest;
  if (report === "start") { item.status = "in_progress"; updated.activity.push(`已開始「${item.title}」`); updated.lastSignal = "不用一次做完，先專注這一小段即可。"; return updated; }
  if (report === "partial") { item.status = "partial"; updated.activity.push(`已記錄部分完成：${item.title}`); updated.lastSignal = "已有進度；下次會從剩餘部分繼續。"; return updated; }
  if (report === "complete") { item.status = "complete"; const early = new Date() < new Date(item.scheduledAt); updated.bossHp = Math.max(0, updated.bossHp - item.damage); updated.xp += item.damage + (early ? 15 : 0); updated.status = updated.bossHp === 0 ? "PERFECT" : updated.bufferHours >= 18 ? "SAFE" : "DANGER"; updated.activity.push(`已觀察到「${item.title}」完成`, "已重新計算進度與風險"); updated.lastSignal = updated.bossHp === 0 ? "🏆 文字怪獸安靜地消散了。Quest 完成。" : `⚔️ 完成回合，造成 ${item.damage} 點傷害。`; if (updated.bossHp === 0) updated.reward = "月光休息室造型"; return updated; }
  item.status = report === "stuck" ? "stuck" : "missed"; return rescueQuest(updated, item.id, report === "stuck" ? "卡住" : "未開始");
}

export function rescueQuest(quest: Quest, taskId: string, reason: string): Quest {
  const updated = structuredClone(quest); const missed = updated.subtasks.find((item) => item.id === taskId); if (!missed) return updated; const next = updated.subtasks.find((item) => item.status === "planned");
  if (next) { next.title = `恢復回合：${missed.title}＋${next.title}`; next.minutes += missed.minutes; next.damage += missed.damage; next.scheduledAt = iso(slot(1, 10)); const event = updated.events.find((item) => item.title === missed.title || item.title === next.title.replace("恢復回合：", "")); if (event) { event.title = next.title; event.start = next.scheduledAt; event.end = iso(new Date(new Date(next.scheduledAt).getTime() + next.minutes * 60_000)); } }
  updated.bufferHours = Math.max(0, updated.bufferHours - 12); updated.status = updated.bufferHours <= 6 ? "CRITICAL" : "DANGER"; updated.activity.push(`收到「${reason}」回報`, "已評估剩餘時間與緩衝", "已建立恢復回合", "已更新 Demo Calendar 排程"); updated.lastSignal = "🌿 不用補償自己。Agent 已將未完成工作移到下一個可用回合。"; return updated;
}
