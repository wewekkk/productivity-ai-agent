"use client";

import { useState } from "react";
import type { Quest, Subtask } from "@/lib/types";
import { AsciiMonster } from "./AsciiMonster";
import { rescueFallbackPresentation } from "../rescue-presentation";
import type { RescuePresentation, RescueRecommendedAction } from "../rescue-presentation";
import { noStartFallbackPresentation } from "../no-start-presentation";
import type { NoStartPresentation, NoStartAction } from "../no-start-presentation";
import "../complete-result.css";
import "../outcome-result.css";

export type Outcome = "partial" | "stuck" | "rescue" | "missed";

const copy = {
  partial: { heading: "部分完成", damage: 8, encouragement: "你還是有推進這一關。", assessment: "你已經完成前半段，但還有部分內容需要補完。", suggestion: "先安排一個較短的 Session 完成剩餘內容。", primary: "接受建議", secondary: "我想調整" },
  stuck: { heading: "有開始，但卡住了", damage: 4, encouragement: "至少你已經開始了。", assessment: "目前的工作單位可能太大。", suggestion: "先把下一步縮成一個 5 分鐘可完成的小動作。", primary: "先做這 5 分鐘", secondary: "調整後續排程" },
  rescue: { heading: "救援小步驟完成", damage: 5, encouragement: "你完成了一個小而具體的推進。", assessment: "Agent 已重新整理這個原本 Session 的剩餘工作。", suggestion: "接下來可以依新的工作單位繼續。", primary: "繼續下一步", secondary: "調整安排" },
  missed: { heading: "這一回合沒有開始", damage: 0, encouragement: "沒關係，這不是失敗；我們可以重新找一個比較容易開始的方法。", assessment: "看起來這個 Session 沒有成功啟動。", suggestion: "下一步會由 Agent 根據任務、deadline、calendar、buffer 與你的狀況決定。", primary: "先做 3 分鐘", secondary: "調整後續排程" },
} as const;

export function SessionOutcomeResult({ quest, subtask, outcome, damage, rescuePresentation, noStartPresentation, onBack, onRecovery, onRescue, onRecommendedAction, onNoStartAction }: { quest: Quest; subtask: Subtask; outcome: Outcome; damage?: number; rescuePresentation?: RescuePresentation; noStartPresentation?: NoStartPresentation; onBack: () => void; onRecovery?: () => void; onRescue?: () => void; onRecommendedAction?: (action: RescueRecommendedAction) => void; onNoStartAction?: (action: NoStartAction) => void }) {
  const [feedback, setFeedback] = useState("");
  const content = copy[outcome];
  const shownDamage = damage ?? content.damage;
  const shownHp = Math.max(0, quest.bossHp - shownDamage);
  const useRescue = outcome === "stuck" && onRescue;
  const rescue = rescuePresentation ?? rescueFallbackPresentation;
  const noStart = noStartPresentation ?? noStartFallbackPresentation;
  const isNoStart = outcome === "missed";
  const primaryAction = () => {
    if (outcome === "rescue") return onRecommendedAction?.(rescue.recommendedAction);
    if (isNoStart) return onNoStartAction?.(noStart.primaryAction);
    if (useRescue) return onRescue?.();
    if (onRecovery) return onRecovery();
    setFeedback("已記下這個建議；目前尚待 Agent 串接後更新後續安排。");
  };
  return <main className="focus-shell complete-shell"><section className="complete-content">
    <p className="eyebrow">{content.heading}</p><p className="complete-damage">⚔ {shownDamage} DAMAGE</p>
    <div className="complete-monster"><AsciiMonster state={isNoStart ? "normal" : "hurt"} /></div>
    {!isNoStart && <section className="hp-result"><p>Boss HP</p><strong>{quest.bossHp} <span>→</span> {shownHp}</strong></section>}
    <p className="outcome-encouragement">{outcome === "rescue" ? `你剛完成：${rescue.completedStep}` : content.encouragement}</p>
    <section className="outcome-advice"><h2>Agent 判斷</h2><p>{outcome === "rescue" ? rescue.agentAssessment : isNoStart ? noStart.agentAssessment : content.assessment}</p>{outcome === "rescue" ? <><h2>接下來</h2>{rescue.remainingSteps.map((step) => <p key={step.title}>{step.title} · 約 {step.estimatedMinutes} 分鐘</p>)}<p className="remaining-time">預估剩餘：約 {rescue.estimatedRemainingMinutes} 分鐘</p><p className="schedule-impact">{rescue.scheduleImpact}</p></> : <><h2>Agent 建議</h2><p>{isNoStart ? noStart.recommendation : content.suggestion}</p></>}</section>
    <div className="focus-actions"><button onClick={primaryAction}>{outcome === "rescue" ? rescue.recommendedAction.label : isNoStart ? noStart.primaryAction.label : content.primary}</button><button className="soft" onClick={() => onRecovery ? onRecovery() : setFeedback("已開啟調整意圖；目前不會自動修改原本排程。")} >{isNoStart ? noStart.secondaryActionLabel : content.secondary}</button></div>
    {feedback && <p className="outcome-feedback" role="status">{feedback}</p>}<button className="text outcome-back" onClick={onBack}>返回任務</button><small className="outcome-demo">這是前端展示的暫時結果；實際進度與傷害將由 Agent 評估。</small>
  </section></main>;
}
