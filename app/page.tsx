"use client";
import { useEffect, useState } from "react";
import { createQuest, resolveTask, routeGoal } from "@/lib/agent";
import type { Quest } from "@/lib/types";

const fmt = (value?: string) => value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
export default function Home() {
  const [goal, setGoal] = useState("Finish my exchange CV before September 7. I'm tired today, so don't schedule more than 30 minutes tonight.");
  const [quest, setQuest] = useState<Quest | null>(null);
  useEffect(() => { const saved = localStorage.getItem("quest-agent-state"); if (saved) setQuest(JSON.parse(saved)); }, []);
  useEffect(() => { if (quest) localStorage.setItem("quest-agent-state", JSON.stringify(quest)); }, [quest]);
  const start = () => setQuest(createQuest(goal));
  const update = (id: string, result: "complete" | "missed") => setQuest((current) => current ? resolveTask(current, id, result) : current);
  const decision = routeGoal(goal);
  return <main>
    <section className="hero"><div><p className="eyebrow">QUEST AGENT · DEMO CALENDAR</p><h1>Your goal. The Agent manages the quest.</h1><p className="intro">An adaptive productivity agent that plans, acts, observes progress, and recovers when plans break.</p></div><div className="level">LEVEL {quest?.level ?? 3}<strong>{quest?.xp ?? 0} XP</strong></div></section>
    <section className="composer"><label htmlFor="goal">Give the Agent a real-world goal</label><textarea id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} /><div className="decision"><span>Preview: <b>{decision.type.replace("_", " ")}</b></span><span>{decision.reason}</span></div><button onClick={start}>Start agent loop →</button></section>
    {!quest ? <section className="empty"><span>⚔️</span><h2>Your next quest starts here</h2><p>Try the prepared CV scenario, or enter a fixed event such as “Lunch tomorrow at 12:00.”</p></section> : <div className="dashboard">
      <section className="panel boss"><div className="panel-head"><div><p className="eyebrow">{quest.type === "complex_quest" ? "ACTIVE BOSS" : quest.type === "simple_task" ? "SMALL MONSTER" : "CALENDAR EVENT"}</p><h2>{quest.type === "complex_quest" ? "📜 " : "📅 "}{quest.title}</h2></div><span className={`status ${quest.status.toLowerCase()}`}>{quest.status}</span></div>{quest.type !== "fixed_event" && <><div className="hp"><div style={{ width: `${quest.bossHp}%` }} /></div><div className="hp-label"><b>{quest.bossHp} / 100 HP</b><span>{quest.bossHp === 0 ? "Defeated" : "Boss vitality"}</span></div></>}<div className="metrics"><div><small>DEADLINE</small><b>{fmt(quest.deadline)}</b></div><div><small>SAFE FINISH</small><b>{fmt(quest.safeFinish)}</b></div><div><small>BUFFER</small><b>{quest.bufferHours} hours</b></div></div>{quest.lastSignal && <p className="signal">{quest.lastSignal}</p>}{quest.reward && <p className="reward">🎁 Rare Chest: <b>{quest.reward}</b></p>}</section>
      <section className="panel tasks"><p className="eyebrow">TODAY'S QUESTS</p><h2>Agent schedule</h2>{quest.events.map((event) => { const task = quest.subtasks.find((item) => event.title.includes(item.title) || item.title.includes(event.title.replace("Recovery: ", ""))); return <article className="task" key={event.id}><div><b>{event.title}</b><span>{fmt(event.start)} · {task?.minutes ?? 60} min {task && `· ${task.damage} damage`}</span></div>{task?.status === "planned" ? <div className="actions"><button className="complete" onClick={() => update(task.id, "complete")}>✓ Complete</button><button className="miss" onClick={() => update(task.id, "missed")}>✕ Didn't finish</button></div> : <span className={`tag ${task?.status}`}>{task?.status === "complete" ? "✓ defeated" : "↻ recovered"}</span>}</article>; })}</section>
      <section className="panel activity"><p className="eyebrow">AGENT ACTIVITY</p><h2>Decision transparency</h2><p className="reason"><b>Why this route:</b> {routeGoal(quest.source).reason}</p><ol>{quest.activity.slice(-7).reverse().map((item, i) => <li key={`${item}-${i}`}>✓ {item}</li>)}</ol><div className="calendar"><b>▣ {quest.events[0]?.provider === "google" ? "Google Calendar" : "Demo Calendar"}</b><span>{quest.events[0]?.provider === "google" ? "Events synced" : "Mock adapter active — no Google event was claimed."}</span></div></section>
    </div>}
  </main>;
}
