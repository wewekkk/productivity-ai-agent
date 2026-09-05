"use client";

import { useEffect, useMemo, useState } from "react";
import { createQuest } from "@/lib/agent";
import type { Quest, Subtask } from "@/lib/types";
import { AsciiMonster } from "./components/AsciiMonster";
import { CalendarView } from "./components/CalendarView";
import { CompleteResult } from "./components/CompleteResult";
import { BossDefeated } from "./components/BossDefeated";
import type { QuestCompletionPresentation } from "./components/BossDefeated";
import { FocusSession } from "./components/FocusSession";
import type { FocusMode } from "./components/FocusSession";
import { PlanPreview } from "./components/PlanPreview";
import { QuestDetail } from "./components/QuestDetail";
import { RecoveryPlan } from "./components/RecoveryPlan";
import type { RecoveryTrigger } from "./components/RecoveryPlan";
import { QuestsView } from "./components/QuestsView";
import { HistoryView } from "./components/HistoryView";
import { SessionReport } from "./components/SessionReport";
import { SessionOutcomeResult } from "./components/SessionOutcomeResult";
import type { Outcome } from "./components/SessionOutcomeResult";
import { rescueFallbackPresentation } from "./rescue-presentation";
import { noStartFallbackPresentation } from "./no-start-presentation";
import { Card } from "./components/ui";
import type { ActivityEntry, ActivityKind } from "./history-presentation";
import "./today.css";
import "./today-polish.css";
import "./navigation.css";
import "./ascii-monster.css";

type MainView = "today" | "quests" | "calendar" | "history";
type ActiveSession = { quest: Quest; subtask: Subtask; minutes: number; mode?: FocusMode; initialMode?: FocusMode };

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
  const [bossDefeated, setBossDefeated] = useState<{ quest: Quest; completion: QuestCompletionPresentation } | null>(null);
  const [outcomeResult, setOutcomeResult] = useState<(ActiveSession & { outcome: Outcome }) | null>(null);
  const [recoveryPlan, setRecoveryPlan] = useState<(ActiveSession & { trigger: RecoveryTrigger }) | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityEntry[]>([]);
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
  const nextStageNumber = next ? next.quest.subtasks.findIndex((subtask) => subtask.id === next.subtask.id) + 1 : 0;
  const nextCompletedCount = next ? next.quest.subtasks.filter((subtask) => subtask.status === "complete").length : 0;
  const todayItems = scheduled.filter(
    ({ subtask }) => new Date(subtask.scheduledAt).toDateString() === new Date().toDateString(),
  );
  const defeatedBosses = useMemo(() => quests.filter((quest) => quest.subtasks.length > 0 && quest.subtasks.every((subtask) => subtask.status === "complete")).map((quest) => {
    const entries = activityHistory.filter((entry) => entry.questId === quest.id);
    const defeated = entries.find((entry) => entry.kind === "boss_defeated");
    return { questId: quest.id, title: quest.title, completedAt: defeated?.at, sessionCount: quest.subtasks.length, totalDamage: entries.reduce((total, entry) => total + (entry.damage ?? 0), 0), xpEarned: defeated?.xp ?? quest.xp };
  }), [activityHistory, quests]);

  const createDraft = () => {
    if (!goal.trim()) return;
    setDraft(createQuest(goal));
    setGoal("");
    setComposerOpen(false);
  };
  const openFocus = (quest: Quest, subtask: Subtask, minutes: number, initialMode?: FocusMode) => setFocusSession({ quest, subtask, minutes, initialMode });
  const openReport = (quest: Quest, subtask: Subtask) => setReportSession({ quest, subtask, minutes: subtask.minutes });
  const nextDemoSession = (session: ActiveSession) => session.quest.subtasks.find((subtask) => subtask.status !== "complete");
  const recordActivity = (session: ActiveSession, kind: ActivityKind, details: Pick<ActivityEntry, "damage" | "xp" | "agentAction"> = {}) => {
    setActivityHistory((current) => [...current, { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, at: new Date().toISOString(), questId: session.quest.id, questTitle: session.quest.title, sessionTitle: session.subtask.title, kind, ...details }]);
  };
  const finishDemoSession = (session: ActiveSession) => {
    const updatedQuest: Quest = {
      ...session.quest,
      bossHp: Math.max(0, session.quest.bossHp - session.subtask.damage),
      subtasks: session.quest.subtasks.map((subtask) => subtask.id === session.subtask.id ? { ...subtask, status: "complete" } : subtask),
    };
    const updatedSession: ActiveSession = { ...session, quest: updatedQuest, subtask: { ...session.subtask, status: "complete" } };
    setQuests((current) => current.map((quest) => quest.id === updatedQuest.id ? updatedQuest : quest));
    setSelectedQuest((current) => current?.id === updatedQuest.id ? updatedQuest : current);
    const hasNext = updatedQuest.subtasks.some((subtask) => subtask.status !== "complete");
    recordActivity(updatedSession, "completed", { damage: session.subtask.damage, xp: session.quest.xp || 30 });
    if (hasNext) setCompleteResult(updatedSession);
    else {
      recordActivity(updatedSession, "boss_defeated", { xp: session.quest.xp || 120, agentAction: "已完成所有工作階段" });
      setBossDefeated({ quest: updatedQuest, completion: { isQuestComplete: true, remainingHp: 0, xpEarned: session.quest.xp || 120 } });
    }
  };

  if (draft) {
    return <PlanPreview quest={draft} onBack={() => { setDraft(null); setView("today"); }} onConfirm={() => { setQuests((current) => [...current, draft]); setDraft(null); setView("today"); }} />;
  }

  if (focusSession) {
    return <FocusSession quest={focusSession.quest} subtask={focusSession.subtask} initialMinutes={focusSession.minutes} initialMode={focusSession.initialMode} onBack={() => setFocusSession(null)} onReport={(mode) => { setFocusSession(null); setReportSession({ ...focusSession, mode }); }} onComplete={() => { setFocusSession(null); finishDemoSession(focusSession); }} onRescueComplete={() => { recordActivity(focusSession, "rescue", { damage: 5, agentAction: "已重新整理剩餘工作" }); setFocusSession(null); setOutcomeResult({ ...focusSession, outcome: "rescue" }); }} />;
  }

  if (completeResult) {
    return <CompleteResult quest={completeResult.quest} subtask={completeResult.subtask} nextSession={nextDemoSession(completeResult)} onStartNext={() => { const next = nextDemoSession(completeResult); if (next) { setFocusSession({ quest: completeResult.quest, subtask: next, minutes: next.minutes }); setCompleteResult(null); } }} onToday={() => { setCompleteResult(null); setSelectedQuest(null); setView("today"); }} onQuest={() => { setSelectedQuest(completeResult.quest); setCompleteResult(null); setView("quests"); }} />;
  }

  if (bossDefeated) {
    return <BossDefeated quest={bossDefeated.quest} completion={bossDefeated.completion} onToday={() => { setBossDefeated(null); setSelectedQuest(null); setView("today"); }} onQuest={() => { setSelectedQuest(bossDefeated.quest); setBossDefeated(null); setView("quests"); }} />;
  }

  if (outcomeResult) {
    return <SessionOutcomeResult quest={outcomeResult.quest} subtask={outcomeResult.subtask} outcome={outcomeResult.outcome} damage={outcomeResult.outcome === "partial" && outcomeResult.mode === "quick" ? 3 : undefined} rescuePresentation={outcomeResult.outcome === "rescue" ? rescueFallbackPresentation : undefined} noStartPresentation={outcomeResult.outcome === "missed" ? noStartFallbackPresentation : undefined} onBack={() => { setSelectedQuest(outcomeResult.quest); setOutcomeResult(null); setView("quests"); }} onRecovery={() => { setRecoveryPlan({ ...outcomeResult, trigger: outcomeResult.outcome === "missed" ? "missed" : outcomeResult.outcome === "stuck" || outcomeResult.outcome === "rescue" ? "stuck" : "partial" }); setOutcomeResult(null); }} onRescue={() => { setFocusSession({ ...outcomeResult, minutes: 5, initialMode: "rescue" }); setOutcomeResult(null); }} onRecommendedAction={(action) => { setFocusSession({ ...outcomeResult, subtask: { ...outcomeResult.subtask, title: action.nextFocus.title, minutes: action.nextFocus.estimatedMinutes }, minutes: action.nextFocus.estimatedMinutes, initialMode: "normal" }); setOutcomeResult(null); }} onNoStartAction={(action) => { setFocusSession({ ...outcomeResult, minutes: action.focus.estimatedMinutes, initialMode: action.focus.mode }); setOutcomeResult(null); }} />;
  }

  if (recoveryPlan) {
    return <RecoveryPlan quest={recoveryPlan.quest} subtask={recoveryPlan.subtask} trigger={recoveryPlan.trigger} onBack={() => { setSelectedQuest(recoveryPlan.quest); setRecoveryPlan(null); setView("quests"); }} onAccept={() => { recordActivity(recoveryPlan, "replan", { agentAction: "使用者接受新的安排提案" }); setSelectedQuest(recoveryPlan.quest); setRecoveryPlan(null); setView("quests"); }} />;
  }

  if (reportSession) {
    return <SessionReport quest={reportSession.quest} subtask={reportSession.subtask} onBack={() => setReportSession(null)} onComplete={() => { finishDemoSession(reportSession); setReportSession(null); }} onPartial={() => { recordActivity(reportSession, "partial", { damage: reportSession.mode === "quick" ? 3 : 8 }); setOutcomeResult({ ...reportSession, outcome: "partial" }); setReportSession(null); }} onStuck={() => { recordActivity(reportSession, "stuck", { damage: 4 }); setOutcomeResult({ ...reportSession, outcome: "stuck" }); setReportSession(null); }} onMissed={() => { recordActivity(reportSession, "missed", { damage: 0 }); setOutcomeResult({ ...reportSession, outcome: "missed" }); setReportSession(null); }} />;
  }

  if (selectedQuest) {
    return <QuestDetail quest={selectedQuest} history={activityHistory} isCompleted={selectedQuest.subtasks.length > 0 && selectedQuest.subtasks.every((subtask) => subtask.status === "complete")} onBack={() => { setSelectedQuest(null); setView("quests"); }} onStart={(subtask) => openFocus(selectedQuest, subtask, subtask.minutes)} onQuickStart={(subtask) => openFocus(selectedQuest, subtask, 3)} onReport={(subtask) => openReport(selectedQuest, subtask)} />;
  }

  return (
    <main className="today-shell">
      <nav className="top-nav" aria-label="主要導覽">
        <b>Quest Agent</b>
        <div className="nav-tabs">
          <button className={view === "today" ? "nav-active" : ""} onClick={() => setView("today")}>今天</button>
          <button className={view === "quests" ? "nav-active" : ""} onClick={() => setView("quests")}>任務</button>
          <button className={view === "calendar" ? "nav-active" : ""} onClick={() => setView("calendar")}>行事曆</button>
          <button className={view === "history" ? "nav-active" : ""} onClick={() => setView("history")}>紀錄</button>
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
                <p className="eyebrow">下一關 · 第 {nextStageNumber} / {next.quest.subtasks.length} 關</p>
                <h2>{next.quest.title}</h2>
                <span className={`quest-status ${next.quest.status.toLowerCase()}`}>{statusLabel(next.quest.status)}</span>
                <div className="hp"><i style={{ width: `${next.quest.bossHp}%` }} /></div>
                <b>{next.quest.bossHp} / 100 HP · 已完成 {nextCompletedCount} / {next.quest.subtasks.length}</b>
                <h3>{next.subtask.title}</h3>
                <p>今天 {time(next.subtask.scheduledAt)} · {next.subtask.minutes} 分鐘 · {next.subtask.damage} DMG</p>
                <div className="actions"><button onClick={() => openFocus(next.quest, next.subtask, next.subtask.minutes)}>開始這一關</button><button className="soft" onClick={() => openFocus(next.quest, next.subtask, 3)}>先做 3 分鐘</button><button className="text" onClick={() => openReport(next.quest, next.subtask)}>直接回報進度</button></div>
              </div>
              <div className="monster-wrap"><AsciiMonster state="normal" /><small>CV BOSS</small></div>
            </Card>
          ) : (
            <Card className="next-quest empty-next"><AsciiMonster state="normal" /><div><p className="eyebrow">下一關</p><h2>今天還沒有安排任務</h2><p>告訴 Agent 你想完成什麼，我們一起找出第一步。</p></div></Card>
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
              {quests.slice(0, 2).map((quest) => <Card className="compact-quest" key={quest.id}><AsciiMonster state="normal" /><div><b>{quest.title}</b><div className="hp"><i style={{ width: `${quest.bossHp}%` }} /></div><small>{quest.bossHp} / 100 HP · 已完成 {quest.subtasks.filter((subtask) => subtask.status === "complete").length} / {quest.subtasks.length} · {statusLabel(quest.status)}</small></div></Card>)}
              <button className="view-all" onClick={() => setView("quests")}>查看所有任務 →</button>
            </section>
          </section>
        </section>
      )}

      {view === "quests" && <QuestsView quests={quests} onSelect={setSelectedQuest} onCreate={() => { setView("today"); setComposerOpen(true); }} onViewHistory={() => setView("history")} />}
      {view === "calendar" && <CalendarView quests={quests} onSelect={setSelectedQuest} />}
      {view === "history" && <HistoryView entries={activityHistory} defeatedBosses={defeatedBosses} onSelectBoss={(questId) => { const quest = quests.find((item) => item.id === questId); if (quest) setSelectedQuest(quest); }} />}
    </main>
  );
}
