import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
  });

  response.cookies.delete("quest_user");
  response.cookies.delete("google_access_token");
  response.cookies.delete("google_refresh_token");
  response.cookies.delete("google_oauth_state");

  return response;
}