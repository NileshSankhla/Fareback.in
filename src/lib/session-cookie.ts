import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "session_token";
const LEGACY_SESSION_COOKIE_NAME = "session";

export const getSessionTokenFromRequest = (request: NextRequest) =>
  request.cookies.get(SESSION_COOKIE_NAME)?.value
  ?? request.cookies.get(LEGACY_SESSION_COOKIE_NAME)?.value;
