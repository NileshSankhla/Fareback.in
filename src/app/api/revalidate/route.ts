import { type NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { revalidateAllCommonPaths } from "@/lib/revalidate";

const secureEqual = (a: string, b: string) => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
};

export async function GET(request: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET;
  const secret = request.nextUrl.searchParams.get("secret");

  if (!configuredSecret || !secret || !secureEqual(secret, configuredSecret)) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateAllCommonPaths();

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
