export type RescueRecommendedAction = {
  label: string;
  nextFocus: { title: string; estimatedMinutes: number };
};

export type RescuePresentation = {
  completedStep: string;
  agentAssessment: string;
  remainingSteps: Array<{ title: string; estimatedMinutes: number }>;
  estimatedRemainingMinutes: number;
  recommendedAction: RescueRecommendedAction;
  scheduleImpact: string;
};

// Frontend fallback only. A future Agent response can replace this entire object.
export const rescueFallbackPresentation: RescuePresentation = {
  completedStep: "找出 3 個可以保留的重點",
  agentAssessment: "已根據這個小進度重新整理原工作階段的剩餘內容。",
  remainingSteps: [
    { title: "補上可量化的成果", estimatedMinutes: 10 },
    { title: "將重點整理成下一段內容", estimatedMinutes: 10 },
  ],
  estimatedRemainingMinutes: 20,
  recommendedAction: {
    label: "繼續下一步",
    nextFocus: { title: "補上可量化的成果", estimatedMinutes: 10 },
  },
  scheduleImpact: "目前尚未直接調整後續行事曆；如需改動，Agent 會先提出新的排程提案。",
};
