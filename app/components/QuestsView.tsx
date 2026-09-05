"use client";

import { useState } from "react";
import type { Quest } from "@/lib/types";
import { AsciiMonster } from "./AsciiMonster";
import { Card } from "./ui";
import "../tasks-polish.css";

const statusLabel = (status: Quest["status"]) => status === "SAFE" || status === "PERFECT" ? "安全" : status === "DANGER" ? "注意" : "危險";
const isCompleted = (quest: Quest) => quest.subtasks.length > 0 && quest.subtasks.every((task) => task.status === "complete");
const time = (value: string) => new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));

export function QuestsView({ quests, onSelect, onCreate, onViewHistory }: { quests: Quest[]; onSelect: (quest: Quest) => void; onCreate: () => void; onViewHistory: () => void }) {
  const [section, setSection] = useState<"not_started" | "active">("not_started");
  const manageable = quests.filter((quest) => quest.type !== "fixed_event");
  const unstarted = manageable.filter((quest) => !isCompleted(quest) && quest.subtasks.every((task) => task.status === "planned"));
  const active = manageable.filter((quest) => !isCompleted(quest) && !unstarted.some((item) => item.id === quest.id));
  const visible = section === "not_started" ? unstarted : active;
  const completedSessions = quests.flatMap((quest) => quest.subtasks).filter((task) => task.status === "complete").length;

  return <section className="today-page quests-page">
    <p className="eyebrow">任務</p><h1>我的任務</h1><p className="page-subtitle">看看目前正在進行的 Quest，以及已經完成的挑戰。</p>
    <p className="quest-overview">{unstarted.length} 個未開始 · {active.length} 個進行中 · 本週完成 {completedSessions} 個 Session</p>
    <div className="quest-view-header"><div className="section-tabs" role="tablist"><button className={section === "not_started" ? "selected" : ""} onClick={() => setSection("not_started")}>未開始 ({unstarted.length})</button><button className={section === "active" ? "selected" : ""} onClick={() => setSection("active")}>進行中 ({active.length})</button></div><button className="text completed-link" onClick={onViewHistory}>查看已完成 →</button></div>
    {visible.length ? <div className="quest-grid">{visible.map((quest) => {
      const next = quest.subtasks.find((task) => task.status !== "complete");
      const nextStage = next ? quest.subtasks.findIndex((task) => task.id === next.id) + 1 : 0;
      const completedCount = quest.subtasks.filter((task) => task.status === "complete").length;
      return <button className="quest-card" onClick={() => onSelect(quest)} key={quest.id}><div className="quest-card-monster"><AsciiMonster state="normal" /></div><div className="quest-card-copy"><h2>{quest.title}</h2><span className={`quest-status ${quest.status.toLowerCase()}`}>{statusLabel(quest.status)}</span><div className="hp"><i style={{ width: `${quest.bossHp}%` }} /></div><small>{quest.bossHp} / 100 HP · 已完成 {completedCount} / {quest.subtasks.length}</small><div className="quest-next"><b>下一關 · 第 {nextStage} / {quest.subtasks.length} 關</b><span>{next ? `${next.title} · ${time(next.scheduledAt)}` : "等待 Agent 安排"}</span><small>{quest.bufferHours} 小時緩衝</small></div><span className="quest-card-link">查看 Quest →</span></div></button>;
    })}</div> : <Card className="quest-empty"><AsciiMonster state="normal" /><div><h2>{section === "not_started" ? "目前沒有未開始的 Quest。" : "目前沒有進行中的 Quest。"}</h2><p>有什麼想完成的事嗎？Agent 可以幫你安排第一步。</p><button onClick={onCreate}>＋ 建立一個新任務</button></div></Card>}
  </section>;
}
