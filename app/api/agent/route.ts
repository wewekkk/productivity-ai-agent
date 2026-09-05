import { NextResponse } from "next/server";

import { GroqAgentProvider } from "@/lib/groq-agent";

const agent = new GroqAgentProvider();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const goal = body.goal;

    if (
      typeof goal !== "string" ||
      goal.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error: "goal 必須是非空字串",
        },
        {
          status: 400,
        },
      );
    }

    const decision = await agent.classify(
      goal.trim(),
    );

    return NextResponse.json({
      decision,
    });
  } catch (error) {
    console.error(
      "Groq Agent API error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Agent 分類失敗",
      },
      {
        status: 500,
      },
    );
  }
}