import { db } from "@/lib/db";
import { clicks, merchants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const merchantIdParam = searchParams.get("merchantId");

  if (!merchantIdParam) {
    return NextResponse.json(
      { error: "merchantId is required" },
      { status: 400 },
    );
  }

  const merchantId = parseInt(merchantIdParam, 10);
  if (isNaN(merchantId)) {
    return NextResponse.json({ error: "Invalid merchantId" }, { status: 400 });
  }

  const [merchant] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.id, merchantId))
    .limit(1);

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  const [click] = await db
    .insert(clicks)
    .values({ userId: 1, merchantId })
    .returning({ id: clicks.id });

  const destinationUrl = new URL(merchant.baseUrl);
  destinationUrl.searchParams.set("subid", click.id);

  redirect(destinationUrl.toString());
}
