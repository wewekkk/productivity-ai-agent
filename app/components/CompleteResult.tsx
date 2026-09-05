import type { Quest, Subtask } from "@/lib/types";
import { AsciiMonster } from "./AsciiMonster";
import "../complete-result.css";

const time = (value?: string) => value ? new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)) : "待 Agent 安排";

export function CompleteResult({ quest, subtask, onToday, onQuest }: { quest: Quest; subtask: Subtask; onToday: () => void; onQuest: () => void }) {
  const previousHp = quest.bossHp;
  const displayedHp = Math.max(0, previousHp - subtask.damage);
  const subtaskIndex = quest.subtasks.findIndex((item) => item.id === subtask.id);
  const next = quest.subtasks.slice(subtaskIndex + 1).find((item) => item.status !== "complete");
  const displayedXp = quest.xp || 30;

  return <main className="focus-shell complete-shell"><section className="complete-content"><p className="complete-hit">⚔ HIT!</p><p className="complete-damage">{subtask.damage} DAMAGE</p><div className="complete-monster"><AsciiMonster variant="hurt" /></div><section className="hp-result"><p>Boss HP</p><strong>{previousHp} <span>→</span> {displayedHp}</strong></section><p className="complete-xp">+{displayedXp} XP</p>{next && <section className="next-up"><p className="eyebrow">下一關</p><h2>{next.title}</h2><p>{time(next.scheduledAt)} · {next.minutes} 分鐘</p></section>}<div className="focus-actions"><button onClick={onToday}>回到今天</button><button className="soft" onClick={onQuest}>查看 Quest</button></div></section></main>;
}
