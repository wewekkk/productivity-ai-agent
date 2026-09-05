import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type QuestUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

export async function GET() {
  try {
    const cookieStore = await cookies();

    const userCookie =
      cookieStore.get("quest_user")?.value;

    if (!userCookie) {
      return NextResponse.json({
        authenticated: false,
      });
    }

    const user =
      JSON.parse(userCookie) as QuestUser;

    if (!user.id) {
      return NextResponse.json({
        authenticated: false,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error(
      "Failed to read current user:",
      error,
    );

    return NextResponse.json({
      authenticated: false,
    });
  }
}