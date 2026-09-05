export type ActivityKind = "completed" | "partial" | "stuck" | "missed" | "rescue" | "replan" | "boss_defeated";

export type ActivityEntry = {
  id: string;
  at: string;
  questId: string;
  questTitle: string;
  sessionTitle?: string;
  kind: ActivityKind;
  damage?: number;
  xp?: number;
  agentAction?: string;
};

export type DefeatedBoss = {
  questId: string;
  title: string;
  completedAt?: string;
  sessionCount: number;
  totalDamage?: number;
  xpEarned?: number;
};

export const activityCopy: Record<ActivityKind, string> = {
  completed: "完成 Session",
  partial: "部分完成",
  stuck: "有開始但卡住",
  missed: "沒有開始",
  rescue: "完成 Rescue 小步驟",
  replan: "Recovery / Replan",
  boss_defeated: "Boss Defeated",
};
