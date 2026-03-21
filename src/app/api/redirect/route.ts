import { db } from "@/lib/db";
import { clicks, merchants } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const TEST_MERCHANT_HOMEPAGES: Record<string, string> = {
  amazon: "https://www.amazon.in",
  flipkart: "https://www.flipkart.com",
  myntra: "https://www.myntra.com",
  nykaa: "https://www.nykaa.com",
  meesho: "https://www.meesho.com",
  ajio: "https://www.ajio.com",
  "tata cliq": "https://www.tatacliq.com",
  snapdeal: "https://www.snapdeal.com",
};

export async function GET(request: NextRequest) {
  try {
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

    const user = await getCurrentUser();

    const [merchant] = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, merchantId))
      .limit(1);

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    let destinationUrl: URL;
    try {
      const merchantNameKey = merchant.name.trim().toLowerCase();
      const testingHomepage = TEST_MERCHANT_HOMEPAGES[merchantNameKey];
      destinationUrl = new URL(testingHomepage ?? merchant.baseUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid merchant URL" },
        { status: 500 },
      );
    }

    if (user) {
      await db
        .insert(clicks)
        .values({ userId: user.id, merchantId })
        .returning({ id: clicks.id });
    }

    redirect(destinationUrl.toString());
  } catch (error) {
    console.error("Error in redirect API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
