import { getCurrentUser } from "@/lib/auth";
import { ensureWalletForUser } from "@/lib/wallet";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wallet = await ensureWalletForUser(user.id);
    return NextResponse.json(
      {
        balanceInPaise: wallet.balanceInPaise,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("Wallet API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
