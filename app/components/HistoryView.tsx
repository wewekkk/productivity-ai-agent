import type { ActivityEntry, DefeatedBoss } from "../history-presentation";
import { activityCopy } from "../history-presentation";
import { AsciiMonster } from "./AsciiMonster";
import "../history.css";

const dateTime = (value?: string) => value ? new Intl.DateTimeFormat("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value)) : "完成日期待同步";

export function HistoryView({ entries, defeatedBosses, onSelectBoss }: { entries: ActivityEntry[]; defeatedBosses: DefeatedBoss[]; onSelectBoss: (questId: string) => void }) {
  const sessions = entries.filter((entry) => entry.kind === "completed").length;
  const damage = entries.reduce((total, entry) => total + (entry.damage ?? 0), 0);
  const xp = entries.reduce((total, entry) => total + (entry.xp ?? 0), 0);
  return <section className="today-page history-page">
    <p className="eyebrow">紀錄</p><h1>本週戰績</h1><p className="page-subtitle">這裡記錄你和 Agent 一起走過的 Quest 歷程。</p>
    <section className="history-stats"><div><small>完成 Quest</small><b>{defeatedBosses.length}</b></div><div><small>完成 Session</small><b>{sessions}</b></div><div><small>總 Damage</small><b>{damage}</b></div><div><small>XP</small><b>{xp}</b></div></section>
    <section className="defeated-bosses"><div className="history-section-heading"><h2>擊敗的 Boss</h2><small>完成過的 Quest 會收藏在這裡</small></div>{defeatedBosses.length ? <div className="boss-card-grid">{defeatedBosses.map((boss) => <button className="defeated-boss-card" key={boss.questId} onClick={() => onSelectBoss(boss.questId)}><div className="defeated-art"><AsciiMonster state="defeated" /></div><div><h3>{boss.title}</h3><p>{dateTime(boss.completedAt)} 擊敗</p><small>{boss.sessionCount} 個工作階段</small><div className="boss-reward"><span>{boss.totalDamage !== undefined ? `⚔ ${boss.totalDamage} DMG` : ""}</span><span>{boss.xpEarned !== undefined ? `+${boss.xpEarned} XP` : ""}</span></div><b>查看完成任務 →</b></div></button>)}</div> : <div className="defeated-empty"><AsciiMonster state="normal" /><p>完成一場 Quest 後，擊敗的 Boss 會出現在這裡。</p></div>}</section>
    <section className="activity-feed"><div className="history-section-heading"><h2>戰鬥紀錄</h2><small>Session 與 Agent 的行動歷程</small></div>{entries.length ? entries.slice().reverse().map((entry) => <article className={`activity-item ${entry.kind}`} key={entry.id}><time>{dateTime(entry.at)}</time><div><b>{activityCopy[entry.kind]}</b><p>{entry.questTitle}{entry.sessionTitle ? ` · ${entry.sessionTitle}` : ""}</p>{entry.agentAction && <small>Agent：{entry.agentAction}</small>}</div><aside>{entry.damage !== undefined && <span>⚔ {entry.damage} DMG</span>}{entry.xp !== undefined && <span>+{entry.xp} XP</span>}</aside></article>) : <div className="history-empty"><p>還沒有戰鬥紀錄。</p><small>完成一個 Session、使用 Rescue，或接受新的安排後，歷程會出現在這裡。</small></div>}</section>
  </section>;
}
