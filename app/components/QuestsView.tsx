"use client";

import { useState } from "react";
import type { Quest } from "@/lib/types";
import { AsciiMonster } from "./AsciiMonster";
import { Card } from "./ui";

const statusLabel = (status: Quest["status"]) =>
  status === "SAFE" || status === "PERFECT" ? "安全" : status === "DANGER" ? "注意" : "危險";

export function QuestsView({ quests, onSelect, onCreate }: { quests: Quest[]; onSelect: (quest: Quest) => void; onCreate: () => void }) {
  const [section, setSection] = useState<"active" | "done">("active");
  const active = quests.filter((quest) => quest.bossHp > 0);
  const done = quests.filter((quest) => quest.bossHp <= 0);
  const visible = section === "active" ? active : done;
  const completedSessions = quests.flatMap((quest) => quest.subtasks).filter((task) => task.status === "complete").length;

  return (
    <section className="today-page quests-page">
      <p className="eyebrow">任務</p>
      <h1>我的任務</h1>
      <p className="page-subtitle">看看目前正在進行的 Quest，以及已經完成的挑戰。</p>
      <p className="quest-overview">{active.length} 個進行中　·　{done.length} 個已完成　·　本週完成 {completedSessions} 個 Session</p>

      <div className="section-tabs" role="tablist">
        <button className={section === "active" ? "selected" : ""} onClick={() => setSection("active")}>進行中 ({active.length})</button>
        <button className={section === "done" ? "selected" : ""} onClick={() => setSection("done")}>已完成 ({done.length})</button>
      </div>

      {visible.length ? (
        <div className="quest-grid">
          {visible.map((quest) => {
            const next = quest.subtasks.find((task) => task.status !== "complete");
            const complete = quest.bossHp <= 0;
            return (
              <button className={`quest-card ${complete ? "completed" : ""}`} onClick={() => onSelect(quest)} key={quest.id}>
                <div className="quest-card-monster"><AsciiMonster variant={complete ? "small" : "boss"} /></div>
                <div className="quest-card-copy">
                  <h2>{quest.title}</h2>
                  {complete ? <p className="defeated">✓ Boss Defeated</p> : <span className={`quest-status ${quest.status.toLowerCase()}`}>{statusLabel(quest.status)}</span>}
                  {!complete && <><div className="hp"><i style={{ width: `${quest.bossHp}%` }} /></div><small>{quest.bossHp} / 100 HP</small></>}
                  {complete ? <small>這個 Quest 已經完成。</small> : <div className="quest-next"><b>下一關</b><span>{next ? `${next.title} · ${new Intl.DateTimeFormat("zh-TW", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(next.scheduledAt))}` : "等待 Agent 安排"}</span><small>{quest.bufferHours} 小時緩衝</small></div>}
                  <span className="quest-card-link">查看 Quest →</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <Card className="quest-empty"><AsciiMonster variant="small" /><div><h2>{section === "active" ? "目前沒有進行中的 Quest。" : "還沒有完成的 Quest。"}</h2><p>有什麼想完成的事嗎？Agent 可以幫你安排第一步。</p><button onClick={onCreate}>＋ 建立一個新任務</button></div></Card>
      )}
    </section>
  );
}
