import type { CalendarService } from "./calendar";
import type { Quest } from "./types";
import type { RouterDecision } from "./agent";

/** Provider contracts: replace demo implementations without touching the UI or agent loop. */
export interface AiAgentProvider {
  classify(goal: string): Promise<RouterDecision>;
  createPlan(goal: string, decision: RouterDecision): Promise<Quest>;
  replan(quest: Quest, reason: "stuck" | "missed"): Promise<Quest>;
}

export type AgentDependencies = { ai: AiAgentProvider; calendar: CalendarService };
