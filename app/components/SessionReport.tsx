"use client";

import { useState } from "react";
import type { Quest, Subtask } from "@/lib/types";
import "../focus-session.css";

const choices = [
  { id: "complete", icon: "✅", title: "完成", detail: "我完成了這個階段" },
  { id: "partial", icon: "◐", title: "部分完成", detail: "我做了一部分，但還沒完成" },
  { id: "stuck", icon: "△", title: "有開始但卡住", detail: "我有開始，但遇到困難" },
  { id: "missed", icon: "○", title: "沒有開始", detail: "我沒有開始這個階段" },
] as const;

export function SessionReport({ quest, subtask, onBack, onComplete, onPartial, onStuck, onMissed }: { quest: Quest; subtask: Subtask; onBack: () => void; onComplete: () => void; onPartial: () => void; onStuck: () => void; onMissed: () => void }) {
  const [choice, setChoice] = useState<string | null>(null);
  const choose = (id: string) => {
    setChoice(id);
    if (id === "complete") onComplete();
    if (id === "partial") onPartial();
    if (id === "stuck") onStuck();
    if (id === "missed") onMissed();
  };
  return <main className="focus-shell"><header className="focus-header"><button className="text" onClick={onBack}>← 返回任務</button></header><section className="report-content"><p className="eyebrow">{quest.title}</p><h1>這一關進行得怎麼樣？</h1><p>你的回饋會幫助 Agent 決定後面的安排。</p><section className="report-session"><b>{subtask.title}</b><span>{subtask.minutes} 分鐘 · {subtask.damage} DMG</span></section><div className="report-options">{choices.map((item) => <button className={choice === item.id ? "selected" : ""} key={item.id} onClick={() => choose(item.id)}><span>{item.icon}</span><b>{item.title}</b><small>{item.detail}</small></button>)}</div>{choice && <p className="report-pending" role="status">已選擇回饋。這一輪只完成回報介面，下一輪會接上進度更新與 Agent 後續安排。</p>}</section></main>;
}
