import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { GoogleCalendarService } from "@/lib/calendar";
import type { CalendarEvent } from "@/lib/types";

type SyncRequest = {
  events?: CalendarEvent[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SyncRequest;

    if (
      !Array.isArray(body.events) ||
      body.events.length === 0
    ) {
      return NextResponse.json(
        {
          error: "沒有可寫入的 Calendar events",
        },
        {
          status: 400,
        },
      );
    }

    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get(
        "google_access_token",
      )?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "尚未連接 Google Calendar",
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

    const createdEvents: CalendarEvent[] = [];

    for (const event of body.events) {
      const created = await calendar.create({
        title: event.title,
        start: event.start,
        end: event.end,
      });

      createdEvents.push(created);
    }

    return NextResponse.json({
      ok: true,
      events: createdEvents,
    });
  } catch (error) {
    console.error(
      "Google Calendar sync error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "寫入 Google Calendar 失敗",
      },
      {
        status: 500,
      },
    );
  }
}
