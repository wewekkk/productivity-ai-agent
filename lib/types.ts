export type TaskType = "fixed_event" | "simple_task" | "complex_quest";
export type QuestStatus = "PERFECT" | "SAFE" | "DANGER" | "CRITICAL";
export type SubtaskStatus = "planned" | "in_progress" | "partial" | "stuck" | "missed" | "complete";
export type PlanState = "preview" | "confirmed";
export type Subtask = { id: string; title: string; minutes: number; damage: number; scheduledAt: string; status: SubtaskStatus };
export type CalendarEvent = { id: string; title: string; start: string; end: string; provider: "demo" | "google" };
export type Quest = { id: string; title: string; source: string; type: TaskType; planState: PlanState; deadline?: string; safeFinish?: string; criticalDeadline?: string; bufferHours: number; status: QuestStatus; bossHp: number; xp: number; level: number; constraints: string[]; subtasks: Subtask[]; events: CalendarEvent[]; activity: string[]; lastSignal?: string; reward?: string };
