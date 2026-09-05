import type { Quest, Subtask } from "@/lib/types";
import { AsciiMonster } from "./AsciiMonster";
import { Card } from "./ui";
import "../preview.css";

const time = (value?: string) => value ? new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)) : "—";
const status = (value: string) => value === "SAFE" ? "安全" : value === "DANGER" ? "注意" : value === "CRITICAL" ? "危險" : "完美";

export function QuestDetail({ quest, onBack, onStart, onQuickStart, onReport }: { quest: Quest; onBack: () => void; onStart: (subtask: Subtask) => void; onQuickStart: (subtask: Subtask) => void; onReport: (subtask: Subtask) => void }) {
  const next = quest.subtasks.find((subtask) => subtask.status !== "complete");
  const rest = quest.subtasks.filter((subtask) => subtask.id !== next?.id);
  return <main className="today-shell"><section className="preview-page">
    <button className="text" onClick={onBack}>← 返回任務</button>
    <Card className="detail-boss"><div><h1>{quest.title}</h1><p>Boss Quest</p><b>{status(quest.status)}</b><div className="hp"><i style={{ width: `${quest.bossHp}%` }} /></div><strong>{quest.bossHp}/100 HP</strong><p>理想完成 {time(quest.safeFinish)}　截止時間 {time(quest.deadline)}　緩衝 {quest.bufferHours} 小時</p></div><div><AsciiMonster variant="boss" /><small>CV BOSS</small></div></Card>
    <div className="proposal"><article>{next && <Card className="next-session"><p className="eyebrow">下一關</p><h2>① {next.title}</h2><p>{time(next.scheduledAt)} · {next.minutes} 分鐘 · ⚔ {next.damage} DMG</p><h3>最低勝利條件</h3><p>先完成一個可繼續的核心段落，也算有效進度。</p><div className="actions"><button onClick={() => onStart(next)}>開始這一關</button><button className="soft" onClick={() => onQuickStart(next)}>先做 3 分鐘</button><button className="text" onClick={() => onReport(next)}>直接回報進度</button></div></Card>}<h2>後續安排</h2>{rest.map((subtask, index) => <p className="step" key={subtask.id}><b>{subtask.status === "complete" ? "✓" : `${index + 2}.`} {subtask.title}</b><span>{time(subtask.scheduledAt)} · {subtask.minutes} 分鐘 · {subtask.damage} DMG</span></p>)}</article><aside><Card><h2>Agent 為什麼這樣安排？</h2><p>{quest.constraints[0] ?? "我把需要較高專注力的工作安排在可專心的時段，並保留緩衝。"}</p><p>如果前面的 Session 延誤，我會重新計算後續安排。</p></Card><Card className="plan-summary"><h2>目前計畫</h2><p>{quest.subtasks.length} 個工作階段</p><p>已完成 {quest.subtasks.filter((subtask) => subtask.status === "complete").length} 個</p><p>理想完成 {time(quest.safeFinish)}</p></Card></aside></div>
  </section></main>;
}
