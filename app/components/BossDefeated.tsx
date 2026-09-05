import type { Quest } from "@/lib/types";
import { AsciiMonster } from "./AsciiMonster";
import "../complete-result.css";

export type QuestCompletionPresentation = {
  isQuestComplete: boolean;
  remainingHp: number;
  xpEarned: number;
};

export function BossDefeated({ quest, completion, onToday, onQuest }: { quest: Quest; completion: QuestCompletionPresentation; onToday: () => void; onQuest: () => void }) {
  return <main className="focus-shell complete-shell"><section className="complete-content"><p className="complete-hit">BOSS DEFEATED!</p><div className="complete-monster"><AsciiMonster state="defeated" /></div><h1>{quest.title} Boss 已擊敗</h1><p className="eyebrow">QUEST COMPLETE</p><p className="complete-xp">+{completion.xpEarned} XP</p><p className="outcome-demo">剩餘 HP：{completion.remainingHp}。這個畫面會由未來 Agent 回傳的 isQuestComplete、remainingHp 與 xpEarned 驅動。</p><div className="focus-actions"><button onClick={onToday}>回到今天</button><button className="soft" onClick={onQuest}>查看完成任務</button></div></section></main>;
}
