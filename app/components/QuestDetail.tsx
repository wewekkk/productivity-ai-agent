import type { Quest, Subtask } from "@/lib/types";
import type { ActivityEntry } from "../history-presentation";
import { activityCopy } from "../history-presentation";
import { AsciiMonster } from "./AsciiMonster";
import { Card } from "./ui";
import "../preview.css";

const time = (value?: string) => value ? new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)) : "待安排";
const status = (value: Quest["status"]) => value === "SAFE" ? "安全" : value === "DANGER" ? "注意" : value === "CRITICAL" ? "危險" : "完美";
const stageLabel = (index: number) => ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"][index] ?? `${index + 1}.`;

export function QuestDetail({ quest, history = [], isCompleted = false, onBack, onStart, onQuickStart, onReport }: { quest: Quest; history?: ActivityEntry[]; isCompleted?: boolean; onBack: () => void; onStart: (subtask: Subtask) => void; onQuickStart: (subtask: Subtask) => void; onReport: (subtask: Subtask) => void }) {
  const next = isCompleted ? undefined : quest.subtasks.find((subtask) => subtask.status !== "complete");
  const nextStageNumber = next ? quest.subtasks.findIndex((subtask) => subtask.id === next.id) + 1 : 0;
  const rest = quest.subtasks.filter((subtask) => subtask.id !== next?.id);
  const questHistory = history.filter((entry) => entry.questId === quest.id);
  const completedAt = questHistory.find((entry) => entry.kind === "boss_defeated")?.at;
  const completedCount = quest.subtasks.filter((subtask) => subtask.status === "complete").length;
  return <main className="today-shell"><section className="preview-page">
    <button className="text" onClick={onBack}>← 返回任務</button>
    <Card className="detail-boss"><div><h1>{quest.title}</h1><p>{isCompleted ? "Quest Completed · Boss Defeated" : "Boss Quest"}</p><b>{isCompleted ? "已完成" : status(quest.status)}</b><div className="hp"><i style={{ width: `${isCompleted ? 0 : quest.bossHp}%` }} /></div><strong>{isCompleted ? 0 : quest.bossHp}/100 HP</strong><p>{isCompleted ? `完成日期 ${time(completedAt)}　獲得 XP ${quest.xp}　${quest.subtasks.length} 個工作階段` : `理想完成 ${time(quest.safeFinish)}　截止時間 ${time(quest.deadline)}　緩衝 ${quest.bufferHours} 小時`}</p></div><div><AsciiMonster state={isCompleted ? "defeated" : "normal"} /><small>{isCompleted ? "BOSS DEFEATED" : "BOSS"}</small></div></Card>
    {isCompleted ? <section className="proposal"><article><Card className="next-session"><p className="eyebrow">Quest Completed</p><h2>這場 Quest 已完成</h2><p>所有工作階段都已完成。你可以在下方查看這場戰鬥的紀錄。</p></Card></article><aside><Card className="plan-summary"><h2>完成摘要</h2><p>{quest.subtasks.length} 個工作階段</p><p>完成日期 {time(completedAt)}</p><p>XP {quest.xp}</p></Card></aside></section> : <div className="proposal"><article>{next && <Card className="next-session"><p className="eyebrow">下一關</p><h2>{stageLabel(nextStageNumber - 1)} {next.title}</h2><p>{time(next.scheduledAt)} · {next.minutes} 分鐘 · ⚔ {next.damage} DMG</p><h3>本回合目標</h3><p>先完成這一小段工作即可，不要求一次做到完美。</p><h3>最低勝利條件</h3><p>只要完成最小可行的一步，就算是有效進度。</p><div className="actions"><button onClick={() => onStart(next)}>開始這一關</button><button className="soft" onClick={() => onQuickStart(next)}>先做 3 分鐘</button><button className="text" onClick={() => onReport(next)}>直接回報進度</button></div></Card>}<h2>後續安排</h2>{rest.map((subtask) => <p className="step" key={subtask.id}><b>{subtask.status === "complete" ? "✓" : stageLabel(quest.subtasks.findIndex((item) => item.id === subtask.id))} {subtask.title}</b><span>{time(subtask.scheduledAt)} · {subtask.minutes} 分鐘 · {subtask.damage} DMG</span></p>)}</article><aside><Card><h2>Agent 為什麼這樣安排？</h2><p>{quest.constraints[0] ?? "我會先安排最需要專注力的一步，同時保留緩衝時間。"}</p><p>如果前面的 Session 延誤，Agent 會重新計算後續安排。</p></Card><Card className="plan-summary"><h2>目前計畫</h2><p>{quest.subtasks.length} 個工作階段</p><p>已完成 {completedCount} 個</p><p>理想完成 {time(quest.safeFinish)}</p></Card></aside></div>}
    {isCompleted && <section className="quest-history"><h2>戰鬥紀錄</h2>{questHistory.length ? questHistory.slice().reverse().map((entry) => <p className="step" key={entry.id}><b>{activityCopy[entry.kind]}</b><span>{time(entry.at)}{entry.sessionTitle ? ` · ${entry.sessionTitle}` : ""}{entry.damage !== undefined ? ` · ${entry.damage} DMG` : ""}</span></p>) : <p>尚未有這場 Quest 的歷程紀錄。</p>}</section>}
  </section></main>;
}
