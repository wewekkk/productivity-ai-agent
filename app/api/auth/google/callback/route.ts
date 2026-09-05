import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const code = url.searchParams.get("code");
    const oauthError = url.searchParams.get("error");

    const returnedState =
  url.searchParams.get("state");

    const cookieStore = await cookies();

    const storedState =
  cookieStore.get(
    "google_oauth_state",
  )?.value;

    if (
  !returnedState ||
  !storedState ||
  returnedState !== storedState
) {
      return NextResponse.json(
    {
      error:
        "Google OAuth state 驗證失敗",
    },
    {
      status: 400,
    },
  );
}

    if (oauthError) {
      return NextResponse.json(
        {
          error: `Google OAuth 授權失敗：${oauthError}`,
        },
        {
          status: 400,
        },
      );
    }

    if (!code) {
      return NextResponse.json(
        {
          error: "Google 沒有回傳 authorization code",
        },
        {
          status: 400,
        },
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret =
      process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI;

    if (
      !clientId ||
      !clientSecret ||
      !redirectUri
    ) {
      return NextResponse.json(
        {
          error:
            "Google OAuth 環境變數設定不完整",
        },
        {
          status: 500,
        },
      );
    }

    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      },
    );

    const tokens =
      (await tokenResponse.json()) as GoogleTokenResponse;

    if (
      !tokenResponse.ok ||
      !tokens.access_token
    ) {
      console.error(
        "Google token exchange failed:",
        tokens,
      );

      return NextResponse.json(
        {
          error:
            "無法取得 Google access token",
        },
        {
          status: 500,
        },
      );
    }

    const response = NextResponse.redirect(
      new URL(
        "/?googleCalendar=connected",
        request.url,
      ),
    );

    response.cookies.delete(
  "google_oauth_state",
);

    response.cookies.set(
      "google_access_token",
      tokens.access_token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
        path: "/",
        maxAge: tokens.expires_in ?? 3600,
      },
    );

    if (tokens.refresh_token) {
      response.cookies.set(
        "google_refresh_token",
        tokens.refresh_token,
        {
          httpOnly: true,
          sameSite: "lax",
          secure:
            process.env.NODE_ENV ===
            "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        },
      );
    }

    return response;
  } catch (error) {
    console.error(
      "Google OAuth callback error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Google OAuth callback 發生錯誤",
      },
      {
        status: 500,
      },
    );
  }
}