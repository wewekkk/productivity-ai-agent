import type { Quest, Subtask } from "@/lib/types";
import { AsciiMonster } from "./AsciiMonster";
import "../complete-result.css";

const time = (value?: string) => value ? new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)) : "待 Agent 安排";

export function CompleteResult({ quest, subtask, nextSession, onStartNext, onToday, onQuest }: { quest: Quest; subtask: Subtask; nextSession?: Subtask; onStartNext?: () => void; onToday: () => void; onQuest: () => void }) {
  const previousHp = quest.bossHp;
  const displayedHp = Math.max(0, previousHp - subtask.damage);
  const next = nextSession;
  const nextStage = next ? quest.subtasks.findIndex((item) => item.id === next.id) + 1 : 0;
  const displayedXp = quest.xp || 30;

  return <main className="focus-shell complete-shell"><section className="complete-content"><p className="complete-hit">⚔ HIT!</p><p className="complete-damage">{subtask.damage} DAMAGE</p><div className="complete-monster"><AsciiMonster state="hurt" /></div><section className="hp-result"><p>Boss HP</p><strong>{previousHp} <span>→</span> {displayedHp}</strong></section><p className="complete-xp">+{displayedXp} XP</p>{next && <section className="next-up"><p className="eyebrow">下一關 · 第 {nextStage} / {quest.subtasks.length} 關</p><h2>{next.title}</h2><p>{time(next.scheduledAt)} · {next.minutes} 分鐘</p><button onClick={onStartNext}>開始下一關</button></section>}<div className="focus-actions"><button onClick={onToday}>回到今天</button><button className="soft" onClick={onQuest}>查看 Quest</button></div></section></main>;
}
