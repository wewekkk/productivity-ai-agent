export type NoStartAction = {
  label: string;
  focus: { estimatedMinutes: number; mode: "quick" | "normal" | "rescue" };
};

export type NoStartPresentation = {
  agentAssessment: string;
  recommendation: string;
  primaryAction: NoStartAction;
  secondaryActionLabel: string;
};

// Frontend fallback only. A future Agent response can replace this entire object.
export const noStartFallbackPresentation: NoStartPresentation = {
  agentAssessment: "看起來這個 Session 沒有成功啟動。",
  recommendation: "先把開始門檻降到 3 分鐘。",
  primaryAction: { label: "先做 3 分鐘", focus: { estimatedMinutes: 3, mode: "quick" } },
  secondaryActionLabel: "調整後續排程",
};
