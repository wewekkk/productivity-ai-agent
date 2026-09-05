"use client";

import { useMemo, useState } from "react";
import type { Quest, Subtask } from "@/lib/types";
import { AsciiMonster } from "./AsciiMonster";
import "../recovery-plan.css";

export type RecoveryTrigger = "partial" | "stuck" | "missed";
const time = (value?: string) => value ? new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)) : "待安排";
const triggerCopy = {
  partial: { progress: "約 50%", remaining: "剩餘內容與後續 2 個工作階段", before: "安全", after: "注意", bufferBefore: "3 小時", bufferAfter: "1.5 小時", reason: "這次只完成部分工作，因此我保留已完成進度，將剩餘內容拆小並使用部分緩衝。" },
  stuck: { progress: "約 20%", remaining: "目前階段的核心內容與後續工作", before: "安全", after: "注意", bufferBefore: "3 小時", bufferAfter: "1.5 小時", reason: "這一關的工作單位可能太大，我先把剩餘內容縮小成較容易開始的短回合。" },
  missed: { progress: "尚未開始", remaining: "目前階段與後續 3 個工作階段", before: "安全", after: "注意", bufferBefore: "3 小時", bufferAfter: "1 小時", reason: "這個時段沒有開始，因此我重新保留可用時間，並將後面的工作拆成更短的回合。" },
} as const;

export function RecoveryPlan({ quest, subtask, trigger, onAccept, onBack }: { quest: Quest; subtask: Subtask; trigger: RecoveryTrigger; onAccept: () => void; onBack: () => void }) {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [limits, setLimits] = useState({ maxMinutes: "", avoidAfter: "", unavailable: "" });
  const copy = triggerCopy[trigger];
  const original = useMemo(() => quest.subtasks.filter((item) => item.status !== "complete").slice(0, 3), [quest.subtasks]);
  const proposal = original.map((item, index) => ({
    title: index === 0 ? `剩餘：${item.title}` : item.title,
    time: index === 0 ? "下一個可用時段 · 15 分鐘" : time(item.scheduledAt),
    change: index === 0 ? "縮短" : index === 1 ? "延後" : "保留",
  }));
  proposal.push({ title: "5 分鐘回顧與重新開始", time: "下一個可用時段 · 5 分鐘", change: "新增" });

  return <main className="focus-shell recovery-shell"><section className="recovery-content"><button className="text recovery-back" onClick={onBack}>← 返回任務</button><header className="recovery-header"><div><p className="eyebrow">重新整理戰術</p><h1>重新整理戰術</h1><p>原本的安排已經不太適合了，Agent 幫你重新計算剩餘工作與時間。</p></div><div className="recovery-monster"><AsciiMonster state="hurt" /></div></header>
    <section className="recovery-status"><div><small>完成度</small><b>{copy.progress}</b></div><div><small>剩餘工作</small><b>{copy.remaining}</b></div><div><small>Deadline</small><b>{time(quest.deadline)}</b></div><div><small>Buffer</small><b>{copy.bufferBefore} <span>→</span> {copy.bufferAfter}</b></div><div><small>風險</small><b>{copy.before} <span>→</span> {copy.after}</b></div></section>
    <section className="recovery-comparison"><article><h2>原本安排</h2>{original.map((item) => <div className="schedule-row" key={item.id}><b>{item.title}</b><small>{time(item.scheduledAt)} · {item.minutes} 分鐘</small></div>)}</article><article className="new-plan"><h2>Agent 新建議</h2>{proposal.map((item, index) => <div className="schedule-row" key={`${item.title}-${index}`}><span className={`plan-change ${item.change}`}>{item.change}</span><b>{item.title}</b><small>{item.time}</small></div>)}</article></section>
    <section className="recovery-explanation"><h2>Agent 為什麼這樣調整？</h2><p>{copy.reason}</p><p>Deadline 目前仍然可以守住，但需要使用一部分緩衝。</p></section>
    <div className="focus-actions"><button onClick={onAccept}>接受新安排</button><button className="soft" onClick={() => setAdjustOpen(true)}>我想再調整</button></div><small className="recovery-rule">這只是 Agent 的提案。確認接受後，未來才會由 Calendar 串接更新行事曆。</small>
    {feedback && <p className="outcome-feedback" role="status">{feedback}</p>}
    {adjustOpen && <div className="focus-backdrop"><section className="focus-modal recovery-adjustment" role="dialog" aria-modal="true"><button className="focus-modal-close" onClick={() => setAdjustOpen(false)} aria-label="關閉">×</button><p className="eyebrow">調整限制</p><h2>這次想怎麼安排？</h2><label>今天最多工作多久<input value={limits.maxMinutes} placeholder="例如：30 分鐘" onChange={(event) => setLimits((current) => ({ ...current, maxMinutes: event.target.value }))} /></label><label>不要排在幾點之後<input type="time" value={limits.avoidAfter} onChange={(event) => setLimits((current) => ({ ...current, avoidAfter: event.target.value }))} /></label><label>不可用時段<textarea value={limits.unavailable} placeholder="例如：週三 18:00–21:00" onChange={(event) => setLimits((current) => ({ ...current, unavailable: event.target.value }))} /></label><div className="focus-actions"><button className="soft" onClick={() => setAdjustOpen(false)}>取消</button><button onClick={() => { setAdjustOpen(false); setFeedback("已記下你的限制；目前尚待 Agent 重新規劃串接，原行事曆不會自動變更。"); }}>儲存偏好</button></div></section></div>}
  </section></main>;
}
