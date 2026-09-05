"use client";

import { useEffect, useMemo, useState } from "react";
import { createQuest } from "@/lib/agent";
import type { Quest, Subtask } from "@/lib/types";
import { AsciiMonster } from "./components/AsciiMonster";
import { CalendarView } from "./components/CalendarView";
import { CompleteResult } from "./components/CompleteResult";
import { FocusSession } from "./components/FocusSession";
import type { FocusMode } from "./components/FocusSession";
import { PlanPreview } from "./components/PlanPreview";
import { QuestDetail } from "./components/QuestDetail";
import { QuestsView } from "./components/QuestsView";
import { SessionReport } from "./components/SessionReport";
import { SessionOutcomeResult } from "./components/SessionOutcomeResult";
import type { Outcome } from "./components/SessionOutcomeResult";
import { Card } from "./components/ui";
import "./today.css";
import "./today-polish.css";
import "./navigation.css";
import "./ascii-monster.css";

type MainView = "today" | "quests" | "calendar";
type ActiveSession = { quest: Quest; subtask: Subtask; minutes: number; mode?: FocusMode };

const time = (value: string) =>
  new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

const statusLabel = (status: Quest["status"]) =>
  status === "SAFE" || status === "PERFECT" ? "安全" : status === "DANGER" ? "注意" : "危險";

export default function Home() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [goal, setGoal] = useState("");
  const [isComposerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState<Quest | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [focusSession, setFocusSession] = useState<ActiveSession | null>(null);
  const [reportSession, setReportSession] = useState<ActiveSession | null>(null);
  const [completeResult, setCompleteResult] = useState<ActiveSession | null>(null);
  const [outcomeResult, setOutcomeResult] = useState<(ActiveSession & { outcome: Outcome }) | null>(null);
  const [view, setView] = useState<MainView>("today");

  useEffect(() => {
    const saved = localStorage.getItem("quest-agent-state");
    if (!saved) return;
    const parsed = JSON.parse(saved);
    setQuests(Array.isArray(parsed) ? parsed : [parsed]);
  }, []);

  useEffect(() => {
    if (quests.length) localStorage.setItem("quest-agent-state", JSON.stringify(quests));
  }, [quests]);

  const scheduled = useMemo(
    () =>
      quests
        .flatMap((quest) =>
          quest.subtasks
            .filter((subtask) => subtask.status !== "complete")
            .map((subtask) => ({ quest, subtask })),
        )
        .sort((a, b) => +new Date(a.subtask.scheduledAt) - +new Date(b.subtask.scheduledAt)),
    [quests],
  );
  const next = scheduled[0];
  const todayItems = scheduled.filter(
    ({ subtask }) => new Date(subtask.scheduledAt).toDateString() === new Date().toDateString(),
  );

  const createDraft = () => {
    if (!goal.trim()) return;
    setDraft(createQuest(goal));
    setGoal("");
    setComposerOpen(false);
  };
  const openFocus = (quest: Quest, subtask: Subtask, minutes: number) => setFocusSession({ quest, subtask, minutes });
  const openReport = (quest: Quest, subtask: Subtask) => setReportSession({ quest, subtask, minutes: subtask.minutes });

  if (draft) {
    return <PlanPreview quest={draft} onBack={() => { setDraft(null); setView("today"); }} onConfirm={() => { setQuests((current) => [...current, draft]); setDraft(null); setView("today"); }} />;
  }

  if (focusSession) {
    return <FocusSession quest={focusSession.quest} subtask={focusSession.subtask} initialMinutes={focusSession.minutes} onBack={() => setFocusSession(null)} onReport={(mode) => { setFocusSession(null); setReportSession({ ...focusSession, mode }); }} onComplete={() => { setFocusSession(null); setCompleteResult(focusSession); }} onRescueComplete={() => { setFocusSession(null); setOutcomeResult({ ...focusSession, outcome: "rescue" }); }} />;
  }

  if (completeResult) {
    return <CompleteResult quest={completeResult.quest} subtask={completeResult.subtask} onToday={() => { setCompleteResult(null); setSelectedQuest(null); setView("today"); }} onQuest={() => { setSelectedQuest(completeResult.quest); setCompleteResult(null); setView("quests"); }} />;
  }

  if (outcomeResult) {
    return <SessionOutcomeResult quest={outcomeResult.quest} subtask={outcomeResult.subtask} outcome={outcomeResult.outcome} damage={outcomeResult.outcome === "partial" && outcomeResult.mode === "quick" ? 3 : undefined} onBack={() => { setSelectedQuest(outcomeResult.quest); setOutcomeResult(null); setView("quests"); }} />;
  }

  if (reportSession) {
    return <SessionReport quest={reportSession.quest} subtask={reportSession.subtask} onBack={() => setReportSession(null)} onComplete={() => { setCompleteResult(reportSession); setReportSession(null); }} onPartial={() => { setOutcomeResult({ ...reportSession, outcome: "partial" }); setReportSession(null); }} onStuck={() => { setOutcomeResult({ ...reportSession, outcome: "stuck" }); setReportSession(null); }} />;
  }

  if (selectedQuest) {
    return <QuestDetail quest={selectedQuest} onBack={() => { setSelectedQuest(null); setView("quests"); }} onStart={(subtask) => openFocus(selectedQuest, subtask, subtask.minutes)} onQuickStart={(subtask) => openFocus(selectedQuest, subtask, 3)} onReport={(subtask) => openReport(selectedQuest, subtask)} />;
  }

  return (
    <main className="today-shell">
      <nav className="top-nav" aria-label="主要導覽">
        <b>Quest Agent</b>
        <div className="nav-tabs">
          <button className={view === "today" ? "nav-active" : ""} onClick={() => setView("today")}>今天</button>
          <button className={view === "quests" ? "nav-active" : ""} onClick={() => setView("quests")}>任務</button>
          <button className={view === "calendar" ? "nav-active" : ""} onClick={() => setView("calendar")}>行事曆</button>
        </div>
        <span>Lv. 3<strong>420 / 600 XP</strong></span>
      </nav>

      {view === "today" && (
        <section className="today-page">
          <header>
            <p>早安 ☀️</p>
            <h1>今天先完成眼前這一關。</h1>
            <small>還有 {scheduled.length} 個安排，Agent 會幫你顧著。</small>
          </header>

          {next ? (
            <Card className="next-quest compact">
              <div className="next-copy">
                <p className="eyebrow">下一關</p>
                <h2>{next.quest.title}</h2>
                <span className={`quest-status ${next.quest.status.toLowerCase()}`}>{statusLabel(next.quest.status)}</span>
                <div className="hp"><i style={{ width: `${next.quest.bossHp}%` }} /></div>
                <b>{next.quest.bossHp} / 100 HP</b>
                <h3>{next.subtask.title}</h3>
                <p>今天 {time(next.subtask.scheduledAt)} · {next.subtask.minutes} 分鐘 · {next.subtask.damage} DMG</p>
                <div className="actions"><button onClick={() => openFocus(next.quest, next.subtask, next.subtask.minutes)}>開始這一關</button><button className="soft" onClick={() => openFocus(next.quest, next.subtask, 3)}>先做 3 分鐘</button><button className="text" onClick={() => openReport(next.quest, next.subtask)}>直接回報進度</button></div>
              </div>
              <div className="monster-wrap"><AsciiMonster variant="boss" /><small>CV BOSS</small></div>
            </Card>
          ) : (
            <Card className="next-quest empty-next"><AsciiMonster variant="small" /><div><p className="eyebrow">下一關</p><h2>今天還沒有安排任務</h2><p>告訴 Agent 你想完成什麼，我們一起找出第一步。</p></div></Card>
          )}

          <section className="add-task">
            <button onClick={() => setComposerOpen((open) => !open)}>＋ 告訴 Agent 你想完成什麼</button>
            {isComposerOpen && <div><textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="例如：9/10 前完成統計報告，我星期三晚上沒空。" /><button onClick={createDraft}>交給 Agent →</button></div>}
          </section>

          <section className="today-grid">
            <Card className="calendar-grid">
              <p className="eyebrow">今天的行事曆</p>
              {todayItems.length ? todayItems.map(({ quest, subtask }) => <p className="event agent" key={subtask.id}><time>{time(subtask.scheduledAt)}</time><span><b>{subtask.title}</b><small>{quest.title} · {subtask.minutes} 分鐘</small></span></p>) : <p className="calendar-empty">今天暫時沒有 Agent 安排的工作階段。</p>}
            </Card>
            <section className="quest-side">
              <p className="eyebrow">目前 Quest 摘要</p>
              {quests.slice(0, 2).map((quest) => <Card className="compact-quest" key={quest.id}><AsciiMonster variant="boss" /><div><b>{quest.title}</b><div className="hp"><i style={{ width: `${quest.bossHp}%` }} /></div><small>{quest.bossHp} / 100 HP · {statusLabel(quest.status)}</small></div></Card>)}
              <button className="view-all" onClick={() => setView("quests")}>查看所有任務 →</button>
            </section>
          </section>
        </section>
      )}

      {view === "quests" && <QuestsView quests={quests} onSelect={setSelectedQuest} onCreate={() => { setView("today"); setComposerOpen(true); }} />}
      {view === "calendar" && <CalendarView quests={quests} onSelect={setSelectedQuest} />}
    </main>
  );
}
