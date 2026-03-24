import { db } from "@/lib/db";
import { clicks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getMerchantById, SUPPORTED_MERCHANT_NAMES } from "@/lib/data/merchants";
import { NextRequest, NextResponse } from "next/server";

const TEST_MERCHANT_HOMEPAGES: Record<string, string> = {
  amazon:
    "https://www.amazon.in?&linkCode=ll2&tag=fareback-21&linkId=711b78face92a1bf8be6139d25b1f780&ref_=as_li_ss_tl",
  flipkart: "https://www.flipkart.com",
  myntra: "https://www.myntra.com",
  ajio: "https://www.ajio.com",
};

const appendSubidParam = (urlString: string, subid: string): string => {
  const url = new URL(urlString);
  // Append subid parameter without damaging existing parameters
  url.searchParams.append("subid", subid);
  return url.toString();
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
    if (!user) {
      const redirectTo = new URL(
        `/sign-in?redirect=/merchants?merchantId=${merchantId}`,
        request.url,
      );
      return NextResponse.redirect(redirectTo, { status: 307 });
    }

    const merchant = await getMerchantById(merchantId);

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    // Create click record
    await db
      .insert(clicks)
      .values({ userId: user.id, merchantId })
      .execute();

    let destinationUrl: URL;
    try {
      const merchantNameKey = merchant.name.trim().toLowerCase();
      if (!SUPPORTED_MERCHANT_NAMES.has(merchantNameKey)) {
        return NextResponse.json(
          { error: "Merchant is not currently supported" },
          { status: 404 },
        );
      }

      const testingHomepage = TEST_MERCHANT_HOMEPAGES[merchantNameKey];
      let baseUrl = testingHomepage ?? merchant.baseUrl;

      // Append username as subid parameter for tracking
      const subid = user.name || user.email.split("@")[0];
      baseUrl = appendSubidParam(baseUrl, subid);

      destinationUrl = new URL(baseUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid merchant URL" },
        { status: 500 },
      );
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
