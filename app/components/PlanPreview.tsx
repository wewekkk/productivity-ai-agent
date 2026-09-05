"use client";

import { useState } from "react";
import type { Quest } from "@/lib/types";
import { AsciiMonster } from "./AsciiMonster";
import { Card } from "./ui";
import "../preview.css";
import "../plan-actions.css";

const stepNumbers = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];
const time = (value?: string) => value ? new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)) : "—";

export type PlanAdjustmentRequest = {
  maxMinutesToday: string;
  avoidAfter: string;
  unavailable: string;
  pace: "gentle" | "normal" | "focused";
};

export function PlanPreview({ quest, onBack, onConfirm, onAdjustment }: { quest: Quest; onBack: () => void; onConfirm: () => void; onAdjustment?: (request: PlanAdjustmentRequest) => void }) {
  const constraints = quest.constraints.length ? quest.constraints : ["這個任務適合拆成多個階段。", "Agent 已保留休息時間與緩衝。"];
  const [isAdjustmentOpen, setAdjustmentOpen] = useState(false);
  const [adjustment, setAdjustment] = useState<PlanAdjustmentRequest>({ maxMinutesToday: "", avoidAfter: "", unavailable: "", pace: "normal" });
  const [pendingMessage, setPendingMessage] = useState("");

  const requestReplan = (pace: "gentle" | "focused") => {
    setAdjustment((current) => ({ ...current, pace }));
    setPendingMessage(pace === "gentle" ? "已記下「再輕鬆一點」的偏好，等待 Agent 重新規劃串接。" : "已記下「再集中一點」的偏好，等待 Agent 重新規劃串接。");
  };
  const saveAdjustment = () => {
    onAdjustment?.(adjustment);
    setAdjustmentOpen(false);
    setPendingMessage("已儲存調整偏好；目前尚待 Agent 根據這些限制重新規劃。原排程尚未變更。");
  };

  return <main className="today-shell"><section className="preview-page">
    <button className="text" onClick={onBack}>← 返回今天</button>
    <h1>排程預覽</h1><p>Agent 已經替你整理好一條可行路線，確認後才會加入行事曆。</p>
    <div className="proposal"><article>
      <div className="preview-title"><div><h2>{quest.title}</h2><p>Boss Quest · 截止時間：{time(quest.deadline)}</p></div><AsciiMonster state="normal" /></div>
      <Card className="understanding"><b>Agent 理解到</b><ul>{constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul></Card>
      <h2>任務拆解</h2>{quest.subtasks.map((subtask, index) => <div className="step" key={subtask.id}><b>{stepNumbers[index] ?? `${index + 1}.`} {subtask.title}</b><span>{time(subtask.scheduledAt)} · {subtask.minutes} 分鐘 <small>{subtask.damage} DMG</small></span></div>)}
      <div className="route-cards"><Card className="ideal"><b>理想完成</b><strong>{time(quest.safeFinish)}</strong><p>這是 Agent 建議實際放入行事曆的安排。</p></Card><Card className="safe"><b>安全備用線</b><strong>{time(quest.criticalDeadline)}</strong><p>如果前面的 Session 延誤，Agent 還保留一條備用路線。</p></Card></div>
      <footer><button onClick={onConfirm}>確認這個排程</button><button className="soft" onClick={() => requestReplan("gentle")}>再輕鬆一點</button><button className="soft" onClick={() => requestReplan("focused")}>再集中一點</button><button className="text" onClick={() => setAdjustmentOpen(true)}>調整限制</button><small>確認後，Agent 才會將這些工作時段加入你的行事曆。</small>{pendingMessage && <p className="action-feedback" role="status">{pendingMessage}</p>}</footer>
    </article><aside><h2>行事曆預覽</h2><div className="week-preview"><div>時間　　提案工作階段</div>{quest.events.map((event) => <div className="preview-event" key={event.id}><time>{time(event.start)}</time><b>{event.title}</b><small>{Math.round((+new Date(event.end) - +new Date(event.start)) / 60000)} 分鐘</small></div>)}</div><Card className="plan-summary"><b>這個計畫</b><p>{quest.subtasks.length} 個工作階段</p><p>共 {quest.subtasks.reduce((total, subtask) => total + subtask.minutes, 0)} 分鐘</p><p>保留緩衝 {quest.bufferHours} 小時</p></Card></aside></div>
    {isAdjustmentOpen && <div className="adjustment-backdrop" role="presentation"><section className="adjustment-modal" role="dialog" aria-modal="true" aria-labelledby="adjustment-title"><button className="modal-close text" onClick={() => setAdjustmentOpen(false)} aria-label="關閉">×</button><p className="eyebrow">調整限制</p><h2 id="adjustment-title">這次想怎麼安排？</h2><p>這些偏好會整理成下一次交給 Agent 的調整請求；目前不會改動原排程。</p><label>今天最多工作多久<input inputMode="numeric" placeholder="例如：30 分鐘" value={adjustment.maxMinutesToday} onChange={(event) => setAdjustment((current) => ({ ...current, maxMinutesToday: event.target.value }))} /></label><label>不要排在幾點之後<input type="time" value={adjustment.avoidAfter} onChange={(event) => setAdjustment((current) => ({ ...current, avoidAfter: event.target.value }))} /></label><label>不可用時段<textarea placeholder="例如：週三 18:00–21:00" value={adjustment.unavailable} onChange={(event) => setAdjustment((current) => ({ ...current, unavailable: event.target.value }))} /></label><fieldset><legend>希望安排的節奏</legend>{([['gentle','較輕鬆'],['normal','一般'],['focused','集中']] as const).map(([value, label]) => <label className="pace-option" key={value}><input type="radio" checked={adjustment.pace === value} onChange={() => setAdjustment((current) => ({ ...current, pace: value }))} />{label}</label>)}</fieldset><div className="modal-actions"><button className="soft" onClick={() => setAdjustmentOpen(false)}>取消</button><button onClick={saveAdjustment}>儲存偏好</button></div></section></div>}
  </section></main>;
}
