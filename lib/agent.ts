import { z } from "zod";
import type { Quest, TaskType, Subtask } from "./types";

export const RouterSchema = z.object({ type: z.enum(["fixed_event", "simple_task", "complex_quest"]), planningRequired: z.boolean(), breakdownRequired: z.boolean(), gamify: z.boolean(), deadline: z.string().optional(), constraints: z.array(z.string()), reason: z.string() });
export type RouterDecision = z.infer<typeof RouterSchema>;

const iso = (date: Date) => date.toISOString();
// crypto.randomUUID is unavailable on some HTTP LAN origins; the demo must still work there.
const id = () => globalThis.crypto?.randomUUID?.() ?? `quest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const dateFromText = (input: string) => {
  const match = input.match(/(?:before|by|前|在)\s*(?:september|sep\.?|9月|9\/)\s*(\d{1,2})/i);
  const today = new Date();
  if (match) return new Date(today.getFullYear(), 8, Number(match[1]), 17, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1); tomorrow.setHours(17, 0, 0, 0); return tomorrow;
};
export function routeGoal(input: string): RouterDecision {
  const lower = input.toLowerCase(); const deadline = dateFromText(input).toISOString();
  const constraints: string[] = [];
  if (/tired|疲|30\s*minutes|30分鐘|sleep early|早點睡/i.test(lower)) constraints.push("今晚精力較低：最多安排 30 分鐘，並保留睡眠時間");
  if (/(lunch|meeting|appointment|午餐|會議).*(\d{1,2})\s*[:：]?\s*(\d{2})?/i.test(lower)) return RouterSchema.parse({ type: "fixed_event", planningRequired: false, breakdownRequired: false, gamify: false, deadline, constraints, reason: "已有明確時間，這是行事曆事件，不需要建立任務關卡。" });
  if (/(finish|complete|寫完|完成).*(cv|resume|履歷|report|proposal|專案)|before|by|截止/i.test(lower)) return RouterSchema.parse({ type: "complex_quest", planningRequired: true, breakdownRequired: true, gamify: true, deadline, constraints, reason: "這項目有截止時間，且需多個專注工作階段才能完成。" });
  return RouterSchema.parse({ type: "simple_task", planningRequired: true, breakdownRequired: false, gamify: true, deadline, constraints, reason: "這是可在單一工作階段完成的行動任務。" });
}
function makeTask(id: string, title: string, minutes: number, damage: number, at: Date): Subtask { return { id, title, minutes, damage, scheduledAt: iso(at), status: "planned" }; }
function slot(dayOffset: number, hour: number, minutes = 0) { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(hour, minutes, 0, 0); return d; }
export function createQuest(input: string): Quest {
  const decision = routeGoal(input); const questId = id();
  if (decision.type === "fixed_event") { const start = slot(1, 12); const end = new Date(start.getTime() + 60 * 60000); return { id: questId, title: input, source: input, type: decision.type, deadline: iso(start), bufferHours: 0, status: "SAFE", bossHp: 0, xp: 0, level: 1, constraints: decision.constraints, subtasks: [], events: [{ id: id(), title: input, start: iso(start), end: iso(end), provider: "demo" }], activity: ["已理解目標", "偵測為固定事件", "已建立 Demo Calendar 事件"], lastSignal: "不需要規劃，已直接加入你的行事曆。" }; }
  if (decision.type === "simple_task") { const at = slot(1, 10); const task = makeTask(id(), input, 30, 100, at); return { id: questId, title: input, source: input, type: decision.type, deadline: decision.deadline, bufferHours: 12, status: "SAFE", bossHp: 100, xp: 0, level: 1, constraints: decision.constraints, subtasks: [task], events: [eventFromTask(task)], activity: ["已理解目標", "偵測為簡單任務", "已選擇適合的專注時段", "已建立 Demo Calendar 事件"], lastSignal: "一隻小怪物正在等待你的一次專注衝刺。" }; }
  const tired = decision.constraints.length > 0; const tasks = [makeTask(id(), "整理經歷與成就", tired ? 30 : 40, 20, slot(0, tired ? 19 : 17)), makeTask(id(), "撰寫履歷初稿", 60, 40, slot(1, 10)), makeTask(id(), "潤飾結構與文字", 45, 25, slot(1, 15)), makeTask(id(), "最終檢查與匯出", 30, 15, slot(2, 10))]; const deadline = dateFromText(input); const safe = new Date(deadline.getTime() - 24 * 3600000); const buffer = Math.max(0, Math.round((deadline.getTime() - new Date(tasks.at(-1)!.scheduledAt).getTime()) / 3600000));
  return { id: questId, title: "完成交換履歷", source: input, type: decision.type, deadline: iso(deadline), safeFinish: iso(safe), criticalDeadline: iso(deadline), bufferHours: Number.isFinite(buffer) && buffer > 0 ? buffer : 24, status: "SAFE", bossHp: 100, xp: 0, level: 3, constraints: decision.constraints, subtasks: tasks, events: tasks.map(eventFromTask), activity: ["已理解目標", "偵測為複雜 Quest", "已生成 4 個子任務", "已依緩衝時間最佳化排程", "已建立 Demo Calendar 事件"], lastSignal: "Boss 已出現。安全路線保留了最後檢查的時間。" };
}
function eventFromTask(task: Subtask) { const start = new Date(task.scheduledAt); return { id: id(), title: task.title, start: iso(start), end: iso(new Date(start.getTime() + task.minutes * 60000)), provider: "demo" as const }; }
export function resolveTask(quest: Quest, taskId: string, outcome: "complete" | "missed"): Quest {
  const task = quest.subtasks.find((item) => item.id === taskId); if (!task || task.status !== "planned") return quest;
  const updated = structuredClone(quest); const selected = updated.subtasks.find((item) => item.id === taskId)!; selected.status = outcome;
  if (outcome === "complete") { const ahead = new Date() < new Date(selected.scheduledAt); const damage = selected.damage; updated.bossHp = Math.max(0, updated.bossHp - damage); updated.xp += ahead ? damage + 15 : damage; updated.status = updated.bossHp === 0 ? "PERFECT" : updated.bufferHours >= 18 ? "SAFE" : "DANGER"; updated.lastSignal = updated.bossHp === 0 ? "🏆 BOSS 擊敗！Quest 完成，已解鎖稀有寶箱。" : ahead ? `⚡ 暴擊！造成 ${damage} 點傷害，獲得額外 XP！` : `⚔️ 普通攻擊！造成 ${damage} 點傷害。`; if (updated.bossHp === 0) { const rewards = ["月光劍造型", "學者貓頭鷹寵物", "極光房間裝飾", "任務守護者卡牌"]; updated.reward = rewards[Math.floor(Math.random() * rewards.length)]; updated.activity = [...updated.activity, "已觀察到全部子任務完成", "已擊敗 Boss", "已生成寶箱獎勵"]; } else updated.activity = [...updated.activity, `已觀察到「${selected.title}」完成`, "已重新計算進度與風險"]; return updated; }
  const remaining = updated.subtasks.filter((item) => item.status === "planned"); const anchor = slot(1, 10); selected.status = "missed"; selected.scheduledAt = iso(anchor); const first = remaining[0]; if (first) { first.title = `Recovery: ${selected.title} + ${first.title}`; first.minutes += selected.minutes; first.damage += selected.damage; }
  updated.events = updated.events.filter((event) => event.title !== selected.title).map((event) => ({ ...event, start: event.start, end: event.end })); if (first) { const event = updated.events.find((item) => item.title.includes(first.title.replace("Recovery: ", ""))) ?? updated.events[0]; if (event) { event.title = first.title; event.start = first.scheduledAt; event.end = iso(new Date(new Date(first.scheduledAt).getTime() + first.minutes * 60000)); } }
  updated.bufferHours = Math.max(0, updated.bufferHours - 12); updated.status = updated.bufferHours <= 6 ? "CRITICAL" : "DANGER"; updated.lastSignal = `⚠️ BOSS 狂暴！已建立恢復 Quest；緩衝時間減少，明天的專注時段會合併今天未完成的工作。`; updated.activity = [...updated.activity, "偵測到未完成任務", "已評估剩餘時間", "已重新計算截止風險", "已生成恢復計畫", "已更新 Demo Calendar 排程"]; return updated;
}
