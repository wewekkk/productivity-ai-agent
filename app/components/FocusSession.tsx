"use client";

import { useEffect, useMemo, useState } from "react";
import type { Quest, Subtask } from "@/lib/types";
import { AsciiMonster } from "./AsciiMonster";
import "../focus-session.css";
import "../focus-modes.css";

export type FocusMode = "normal" | "quick" | "rescue";
const format = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export function FocusSession({ quest, subtask, initialMinutes, onBack, onReport, onComplete, onRescueComplete }: { quest: Quest; subtask: Subtask; initialMinutes: number; onBack: () => void; onReport: (mode: FocusMode) => void; onComplete: () => void; onRescueComplete: () => void }) {
  const initialMode: FocusMode = initialMinutes === 3 ? "quick" : "normal";
  const [mode, setMode] = useState<FocusMode>(initialMode);
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isRunning, setRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [rescueOpen, setRescueOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const currentStep = useMemo(() => Math.max(1, quest.subtasks.findIndex((item) => item.id === subtask.id) + 1), [quest.subtasks, subtask.id]);

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, seconds]);

  useEffect(() => {
    if (hasStarted && seconds === 0) {
      setRunning(false);
      setTimeUp(true);
    }
  }, [hasStarted, seconds]);

  const leave = () => hasStarted ? setExitOpen(true) : onBack();
  const start = () => { setHasStarted(true); setRunning(true); };
  const beginRescue = () => { setMode("rescue"); setSeconds(5 * 60); setTimeUp(false); start(); setRescueOpen(false); };
  const continueFromQuick = () => { setMode("normal"); setSeconds(Math.max(0, subtask.minutes * 60 - 3 * 60)); setTimeUp(false); setRunning(true); };
  const stateLabel = mode === "rescue" ? "救援模式" : isRunning ? "專注中" : hasStarted ? "已暫停" : "準備開始";

  const normalControls = <div className="focus-actions">{isRunning ? <button className="soft" onClick={() => setRunning(false)}>暫停</button> : <button onClick={() => setRunning(true)} disabled={seconds === 0}>繼續專注</button>}<button className="text" onClick={() => setRescueOpen(true)}>我卡住了</button><button className="text" onClick={onComplete}>我做完了！</button></div>;
  const quickControls = <div className="focus-actions">{isRunning ? <button className="soft" onClick={() => setRunning(false)}>暫停</button> : <button onClick={() => setRunning(true)} disabled={seconds === 0}>繼續專注</button>}<button className="text" onClick={onComplete}>我做完了！</button></div>;
  const rescueControls = <div className="focus-actions"><button onClick={onRescueComplete}>完成這一步</button><button className="soft" onClick={() => onReport("rescue")}>還是卡住</button></div>;

  return <main className="focus-shell"><header className="focus-header"><button className="text" onClick={leave}>← 返回任務</button><button className="text" onClick={leave}>✕ 離開</button></header><section className="focus-content"><p className="focus-quest">{mode === "rescue" ? "救援模式" : `${quest.title} · 第 ${currentStep} / ${quest.subtasks.length} 關`}</p><div className="focus-monster"><AsciiMonster variant={mode === "rescue" ? "warning" : "boss"} /></div><h1>{mode === "rescue" ? "現在只做這一步" : subtask.title}</h1>{mode === "rescue" && <p className="rescue-task">找出 3 個可以保留的 Experience bullet</p>}<div className="focus-timer" aria-label="剩餘時間">{format(seconds)}</div><p className="focus-state">{stateLabel}</p>
    {!hasStarted ? <><section className="focus-goal"><h2>本回合目標</h2><ul><li>打開與「{subtask.title}」相關的資料</li><li>完成一個可以繼續往下做的核心段落</li></ul><h2>最低勝利條件</h2><p>先整理出 3 個可以保留的重點，也算這一關有有效進度。</p></section><div className="focus-actions"><button onClick={start}>開始 {initialMinutes} 分鐘</button>{initialMode === "normal" && <button className="soft" onClick={() => { setMode("quick"); setSeconds(3 * 60); start(); }}>先做 3 分鐘</button>}</div></> : mode === "rescue" ? rescueControls : <>{mode === "quick" ? quickControls : normalControls}<p className="focus-hint">不用一次做到完美，先把注意力放在這一小段。</p></>}
  </section>
  {rescueOpen && <div className="focus-backdrop"><section className="focus-modal" role="dialog" aria-modal="true"><button className="focus-modal-close" onClick={() => setRescueOpen(false)} aria-label="關閉">×</button><p className="eyebrow">先把這一關縮小</p><h2>你不需要一次完成全部。</h2><p>現在先做：找出 3 個可以保留的 Experience bullet。</p><p>預估 5 分鐘</p><div className="focus-actions"><button onClick={beginRescue}>就做這 5 分鐘</button><button className="soft" onClick={() => onReport(mode)}>結束並回報</button></div></section></div>}
  {exitOpen && <div className="focus-backdrop"><section className="focus-modal" role="dialog" aria-modal="true"><h2>要離開這一回合嗎？</h2><p>離開不等於失敗。你可以保留這次的前端專注狀態，之後再繼續。</p><div className="focus-actions"><button className="soft" onClick={onBack}>暫停並離開</button><button onClick={() => onReport(mode)}>結束並回報</button><button className="text" onClick={() => setExitOpen(false)}>繼續工作</button></div></section></div>}
  {timeUp && mode === "normal" && <div className="focus-backdrop"><section className="focus-modal" role="dialog" aria-modal="true"><p className="eyebrow">這一回合時間到了！</p><h2>辛苦了，回報一下這一關的進度吧。</h2><div className="focus-actions"><button onClick={() => onReport("normal")}>回報進度</button></div></section></div>}
  {timeUp && mode === "quick" && <div className="focus-backdrop"><section className="focus-modal" role="dialog" aria-modal="true"><p className="eyebrow">你已經開始 3 分鐘了！</p><h2>要繼續嗎？</h2><div className="focus-actions"><button onClick={continueFromQuick}>繼續這一關</button><button className="soft" onClick={() => onReport("quick")}>先回報進度</button></div></section></div>}
  {timeUp && mode === "rescue" && <div className="focus-backdrop"><section className="focus-modal" role="dialog" aria-modal="true"><p className="eyebrow">這 5 分鐘到了</p><h2>這個小步驟進行得怎麼樣？</h2><div className="focus-actions"><button onClick={onRescueComplete}>完成這一步</button><button className="soft" onClick={() => onReport("rescue")}>還是卡住</button><button className="text" onClick={() => onReport("rescue")}>結束並回報</button></div></section></div>}
  </main>;
}
