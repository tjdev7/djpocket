import { NextRequest, NextResponse } from "next/server";

async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number } | null> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return { access_token: data.access_token, expires_in: data.expires_in };
}

async function getValidAccessToken(req: NextRequest, res: NextResponse) {
  let accessToken = req.cookies.get("sp_access_token")?.value;
  const refreshToken = req.cookies.get("sp_refresh_token")?.value;
  const expiresAt = parseInt(req.cookies.get("sp_expires_at")?.value || "0");

  if (!accessToken || !refreshToken) return null;

  if (Date.now() + 60000 > expiresAt) {
    const newTokens = await refreshAccessToken(refreshToken);
    if (newTokens) {
      const newExpiresAt = Date.now() + newTokens.expires_in * 1000;
      accessToken = newTokens.access_token;

      res.cookies.set("sp_access_token", newTokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: newTokens.expires_in,
      });
      res.cookies.set("sp_expires_at", newExpiresAt.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: newTokens.expires_in,
      });
    } else {
      return null;
    }
  }

  return accessToken;
}

export async function GET(req: NextRequest) {
  const res = NextResponse.next();
  const accessToken = await getValidAccessToken(req, res);

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const spotifyResponse = await fetch("https://api.spotify.com/v1/me/player", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (spotifyResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  if (!spotifyResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch player state" },
      { status: spotifyResponse.status }
    );
  }

  const data = await spotifyResponse.json();
  return NextResponse.json(data, { headers: res.headers });
}

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const accessToken = await getValidAccessToken(req, res);
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let spotifyEndpoint = "";
  let method = "PUT";

  switch (action) {
    case "play":
      spotifyEndpoint = "https://api.spotify.com/v1/me/player/play";
      break;
    case "pause":
      spotifyEndpoint = "https://api.spotify.com/v1/me/player/pause";
      break;
    case "next":
      spotifyEndpoint = "https://api.spotify.com/v1/me/player/next";
      method = "POST";
      break;
    case "previous":
      spotifyEndpoint = "https://api.spotify.com/v1/me/player/previous";
      method = "POST";
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const spotifyResponse = await fetch(spotifyEndpoint, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!spotifyResponse.ok && spotifyResponse.status !== 204) {
    return NextResponse.json(
      { error: `Failed to ${action}` },
      { status: spotifyResponse.status }
    );
  }

  return new NextResponse(null, { status: 200, headers: res.headers });
}
