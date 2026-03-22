import { db } from "@/lib/db";
import { clicks, merchants } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const TEST_MERCHANT_HOMEPAGES: Record<string, string> = {
  amazon:
    "https://www.amazon.in?&linkCode=ll2&tag=fareback-21&linkId=711b78face92a1bf8be6139d25b1f780&ref_=as_li_ss_tl",
  flipkart: "https://www.flipkart.com",
  myntra: "https://www.myntra.com",
  ajio: "https://www.ajio.com",
};

const SUPPORTED_MERCHANTS = new Set(Object.keys(TEST_MERCHANT_HOMEPAGES));

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
      if (!SUPPORTED_MERCHANTS.has(merchantNameKey)) {
        return NextResponse.json(
          { error: "Merchant is not currently supported" },
          { status: 404 },
        );
      }

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

    return NextResponse.redirect(destinationUrl.toString(), { status: 307 });
  } catch (error) {
    console.error("Error in redirect API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
