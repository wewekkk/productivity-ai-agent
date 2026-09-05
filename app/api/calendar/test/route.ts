import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { GoogleCalendarService } from "@/lib/calendar";

export async function POST() {
  try {
    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get(
        "google_access_token",
      )?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "尚未連接 Google Calendar",
        },
        {
          status: 401,
        },
      );
    }

    const calendar =
      new GoogleCalendarService(
        accessToken,
        process.env.GOOGLE_CALENDAR_ID ??
          "primary",
      );

    const start = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    const end = new Date(
      start.getTime() + 30 * 60 * 1000,
    );

    const event = await calendar.create({
      title: "Quest Agent Google Calendar 測試",
      start: start.toISOString(),
      end: end.toISOString(),
    });

    return NextResponse.json({
      ok: true,
      event,
    });
  } catch (error) {
    console.error(
      "Google Calendar test error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "建立 Google Calendar 測試事件失敗",
      },
      {
        status: 500,
      },
    );
  }
}