export type TaskType = "fixed_event" | "simple_task" | "complex_quest";
export type QuestStatus = "PERFECT" | "SAFE" | "DANGER" | "CRITICAL";
export type SubtaskStatus = "planned" | "complete" | "missed";
export type Subtask = { id: string; title: string; minutes: number; damage: number; scheduledAt: string; status: SubtaskStatus };
export type CalendarEvent = { id: string; title: string; start: string; end: string; provider: "demo" | "google" };
export type Quest = { id: string; title: string; source: string; type: TaskType; deadline?: string; safeFinish?: string; criticalDeadline?: string; bufferHours: number; status: QuestStatus; bossHp: number; xp: number; level: number; constraints: string[]; subtasks: Subtask[]; events: CalendarEvent[]; activity: string[]; lastSignal?: string; reward?: string };
