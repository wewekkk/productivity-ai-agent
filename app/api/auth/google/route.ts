import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL =
  "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error:
          "缺少 GOOGLE_CLIENT_ID 或 GOOGLE_REDIRECT_URI",
      },
      {
        status: 500,
      },
    );
  }

  const state = randomBytes(32).toString("hex");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope:
      "https://www.googleapis.com/auth/calendar.events",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const response = NextResponse.redirect(
    `${GOOGLE_AUTH_URL}?${params.toString()}`,
  );

  response.cookies.set(
    "google_oauth_state",
    state,
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    },
  );

  return response;
}