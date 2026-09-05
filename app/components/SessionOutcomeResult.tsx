"use client";

import { useState } from "react";
import type { Quest, Subtask } from "@/lib/types";
import { AsciiMonster } from "./AsciiMonster";
import "../complete-result.css";
import "../outcome-result.css";

export type Outcome = "partial" | "stuck" | "rescue";

const copy = {
  partial: {
    heading: "部分完成",
    damage: 8,
    encouragement: "你還是有推進這一關。",
    assessment: "你已經完成前半段，但還有部分內容需要補完。",
    suggestion: "先安排一個較短的 Session 完成剩餘內容。",
    primary: "接受建議",
    secondary: "我想調整",
  },
  stuck: {
    heading: "有開始，但卡住了",
    damage: 4,
    encouragement: "至少你已經開始了。",
    assessment: "目前的工作單位可能太大。",
    suggestion: "先把下一步縮成一個 5 分鐘可完成的小動作。",
    primary: "就照這樣做",
    secondary: "重新安排",
  },
  rescue: {
    heading: "救援小步驟完成",
    damage: 5,
    encouragement: "你完成了一個很小、但真實的推進。",
    assessment: "這個工作單位縮小後，已經更容易開始。",
    suggestion: "先保留這個小進度，下一次再接回原本的工作階段。",
    primary: "就照這樣做",
    secondary: "我想調整",
  },
} as const;

export function SessionOutcomeResult({ quest, subtask, outcome, damage, onBack }: { quest: Quest; subtask: Subtask; outcome: Outcome; damage?: number; onBack: () => void }) {
  const [feedback, setFeedback] = useState("");
  const content = copy[outcome];
  const shownDamage = damage ?? content.damage;
  const shownHp = Math.max(0, quest.bossHp - shownDamage);
  return <main className="focus-shell complete-shell"><section className="complete-content"><p className="eyebrow">{content.heading}</p><p className="complete-damage">⚔ {shownDamage} DAMAGE</p><div className="complete-monster"><AsciiMonster variant="hurt" /></div><section className="hp-result"><p>Boss HP</p><strong>{quest.bossHp} <span>→</span> {shownHp}</strong></section><p className="outcome-encouragement">{content.encouragement}</p><section className="outcome-advice"><h2>Agent 判斷</h2><p>{content.assessment}</p><h2>建議下一步</h2><p>{content.suggestion}</p></section><div className="focus-actions"><button onClick={() => setFeedback("已記下這個建議；目前尚待 Agent 串接後更新後續安排。")}>{content.primary}</button><button className="soft" onClick={() => setFeedback("已開啟調整意圖；目前不會自動修改原本排程。")}>{content.secondary}</button></div>{feedback && <p className="outcome-feedback" role="status">{feedback}</p>}<button className="text outcome-back" onClick={onBack}>返回任務</button><small className="outcome-demo">這是前端展示的暫時結果；實際進度與傷害將由 Agent 評估。</small></section></main>;
}
