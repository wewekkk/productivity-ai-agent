import Groq from "groq-sdk";

import type { AiAgentProvider } from "./agent-contracts";
import {
  RouterSchema,
  type RouterDecision,
} from "./agent";
import type { Quest } from "./types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class GroqAgentProvider implements AiAgentProvider {
  async classify(goal: string): Promise<RouterDecision> {
    const now = new Date();

    const currentDateTime = now.toLocaleString("zh-TW", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
  role: "system",
  content: `
你是 Productivity Quest Agent 的任務分類器。

目前日期與時間（台灣 Asia/Taipei）：
${currentDateTime}

所有「今天、明天、星期五、下週」等相對日期，
都必須以上述日期與時間為基準計算。

如果使用者說「星期五前」而今天已經是星期五之後，
應理解為下一個星期五。

你的唯一任務是根據使用者輸入，判斷任務屬於：
fixed_event、simple_task、complex_quest。

請嚴格遵守以下分類規則。

【fixed_event】
適用情況：
- 有明確日期或時間的固定行程
- 重點是「某個時間必須發生」
- 通常不需要拆解成多個工作階段

欄位必須設定：
- type = "fixed_event"
- planningRequired = false
- breakdownRequired = false
- gamify = false

例子：
「明天下午 3 點開會」
「星期六中午跟朋友吃飯」
「9 月 10 日早上 10 點看醫生」

【simple_task】
適用情況：
- 可以在單一工作階段完成
- 不需要拆成多個子任務
- 即使需要安排時間，也不屬於大型專案

欄位必須設定：
- type = "simple_task"
- planningRequired = true
- breakdownRequired = false
- gamify = true

例子：
「回覆王經理的 Email」
「整理今天的會議筆記」
「閱讀這篇文章」

【complex_quest】
適用情況：
- 需要多個步驟或多個工作階段
- 有截止日期
- 使用者要求在某個期限前「完成」一個成果
- 履歷、報告、提案、專案等通常屬於此類

欄位必須設定：
- type = "complex_quest"
- planningRequired = true
- breakdownRequired = true
- gamify = true

例子：
「星期五前完成履歷」
「下週一前寫完報告」
「月底前完成專案提案」

特別規則：
- 「星期五前完成履歷」一定分類為 complex_quest。
- 不要因為句子很短就分類為 simple_task。
- 「前」、「之前」、「截止」、「完成」、「寫完」等期限語意，
  如果搭配履歷、報告、提案、專案等需要多步完成的成果，
  優先分類為 complex_quest。
- 如果使用者有明確提供截止日期或時間，
  deadline 使用 ISO 8601 格式。
- 如果沒有明確截止時間，deadline 必須為 null。
- constraints 沒有限制時回傳空陣列 []。
- reason 請用繁體中文簡短說明分類原因。
- 不要說使用者沒有提供目標，除非輸入真的為空白。

只能依照指定 JSON Schema 回傳資料。
不要輸出 Markdown。
不要輸出額外解釋。
  `.trim(),
},
        {
          role: "user",
          content: goal,
        },
      ],

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "router_decision",
          strict: true,
          schema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: [
                  "fixed_event",
                  "simple_task",
                  "complex_quest",
                ],
              },
              planningRequired: {
                type: "boolean",
              },
              breakdownRequired: {
                type: "boolean",
              },
              gamify: {
                type: "boolean",
              },
              deadline: {
                type: ["string", "null"],
              },
              constraints: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              reason: {
                type: "string",
              },
            },
            required: [
              "type",
              "planningRequired",
              "breakdownRequired",
              "gamify",
              "deadline",
              "constraints",
              "reason",
            ],
            additionalProperties: false,
          },
        },
      },

      temperature: 0,
    });

    const content =
      completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Groq 沒有回傳內容");
    }

    const parsed = JSON.parse(content);

    if (parsed.deadline === null) {
      delete parsed.deadline;
    }

    return RouterSchema.parse(parsed);
  }

  async createPlan(
    _goal: string,
    _decision: RouterDecision,
  ): Promise<Quest> {
    throw new Error(
      "createPlan 尚未實作",
    );
  }

  async replan(
    _quest: Quest,
    _reason: "stuck" | "missed",
  ): Promise<Quest> {
    throw new Error(
      "replan 尚未實作",
    );
  }
}