"use client";
import { useEffect, useState } from "react";
import { createQuest, resolveTask, routeGoal } from "@/lib/agent";
import type { Quest } from "@/lib/types";

const fmt = (value?: string) => value ? new Intl.DateTimeFormat("zh-TW", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
export default function Home() {
  const [goal, setGoal] = useState("在 9 月 7 日前完成交換履歷。我今天很累，今晚請不要安排超過 30 分鐘。");
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => { const saved = localStorage.getItem("quest-agent-state"); if (!saved) return; const parsed = JSON.parse(saved) as Quest | Quest[]; const restored = Array.isArray(parsed) ? parsed : [parsed]; setQuests(restored); setActiveId(restored[0]?.id ?? null); }, []);
  useEffect(() => { if (quests.length) localStorage.setItem("quest-agent-state", JSON.stringify(quests)); }, [quests]);
  const start = () => { const next = createQuest(goal); setQuests((current) => [...current, next]); setActiveId(next.id); };
  const update = (id: string, result: "complete" | "missed") => setQuests((current) => current.map((item) => item.id === activeId ? resolveTask(item, id, result) : item));
  const quest = quests.find((item) => item.id === activeId) ?? null;
  const decision = routeGoal(goal);
  return <main>
    <section className="hero"><div><p className="eyebrow">QUEST AGENT · DEMO CALENDAR</p><h1>你定目標，Agent 管理整場任務。</h1><p className="intro">會規劃、行動、觀察進度，並在計畫失敗時自動恢復的適應型生產力 Agent。</p></div><div className="level">等級 {quest?.level ?? 3}<strong>{quest?.xp ?? 0} XP</strong></div></section>
    <section className="composer"><label htmlFor="goal">交給 Agent 一個真實世界目標</label><textarea id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} /><div className="decision"><span>預覽：<b>{decision.type === "fixed_event" ? "固定事件" : decision.type === "simple_task" ? "簡單任務" : "複雜 Quest"}</b></span><span>{decision.reason}</span></div><button onClick={start}>新增並啟動 Agent →</button>{quests.length > 0 && <div className="quest-switcher"><b>我的 Quest（{quests.length}）</b><div>{quests.map((item) => <button className={item.id === activeId ? "selected" : ""} onClick={() => setActiveId(item.id)} key={item.id}>{item.type === "complex_quest" ? "⚔️" : "📅"} {item.title}</button>)}</div></div>}</section>
    {!quest ? <section className="empty"><span>⚔️</span><h2>你的下一場 Quest 從這裡開始</h2><p>可使用預設的履歷情境，或輸入「明天中午 12 點吃午餐」這類固定事件。</p></section> : <div className="dashboard">
      <section className="panel boss"><div className="panel-head"><div><p className="eyebrow">{quest.type === "complex_quest" ? "進行中的 BOSS" : quest.type === "simple_task" ? "小怪物" : "行事曆事件"}</p><h2>{quest.type === "complex_quest" ? "📜 " : "📅 "}{quest.title}</h2></div><span className={`status ${quest.status.toLowerCase()}`}>{quest.status}</span></div>{quest.type !== "fixed_event" && <><div className="hp"><div style={{ width: `${quest.bossHp}%` }} /></div><div className="hp-label"><b>{quest.bossHp} / 100 HP</b><span>{quest.bossHp === 0 ? "已擊敗" : "Boss 生命值"}</span></div></>}<div className="metrics"><div><small>截止時間</small><b>{fmt(quest.deadline)}</b></div><div><small>安全完成</small><b>{fmt(quest.safeFinish)}</b></div><div><small>緩衝時間</small><b>{quest.bufferHours} 小時</b></div></div>{quest.lastSignal && <p className="signal">{quest.lastSignal}</p>}{quest.reward && <p className="reward">🎁 稀有寶箱：<b>{quest.reward}</b></p>}</section>
      <section className="panel tasks"><p className="eyebrow">今日 QUEST</p><h2>Agent 排程</h2>{quest.events.map((event) => { const task = quest.subtasks.find((item) => event.title.includes(item.title) || item.title.includes(event.title.replace("Recovery: ", ""))); return <article className="task" key={event.id}><div><b>{event.title}</b><span>{fmt(event.start)} · {task?.minutes ?? 60} 分鐘 {task && `· ${task.damage} 傷害`}</span></div>{task?.status === "planned" ? <div className="actions"><button className="complete" onClick={() => update(task.id, "complete")}>✓ 完成</button><button className="miss" onClick={() => update(task.id, "missed")}>✕ 未完成</button></div> : <span className={`tag ${task?.status}`}>{task?.status === "complete" ? "✓ 已擊敗" : "↻ 已恢復"}</span>}</article>; })}</section>
      <section className="panel activity"><p className="eyebrow">AGENT 動態</p><h2>決策透明度</h2><p className="reason"><b>採取這條路線的原因：</b>{routeGoal(quest.source).reason}</p><ol>{quest.activity.slice(-7).reverse().map((item, i) => <li key={`${item}-${i}`}>✓ {item}</li>)}</ol><div className="calendar"><b>▣ {quest.events[0]?.provider === "google" ? "Google Calendar" : "Demo Calendar"}</b><span>{quest.events[0]?.provider === "google" ? "事件已同步" : "目前使用模擬 adapter，並未宣稱事件已建立在 Google。"}</span></div></section>
    </div>}
  </main>;
}
