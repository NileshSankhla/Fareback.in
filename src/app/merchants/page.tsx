import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMerchantById } from "@/lib/data/merchants";

interface MerchantsPageProps {
  searchParams: Promise<{ merchantId?: string }>;
}

const MerchantsPage = async ({ searchParams }: MerchantsPageProps) => {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/sign-in?redirect=/merchants${params.merchantId ? `?merchantId=${params.merchantId}` : ""}`);
  }

  let merchant = null;
  if (params.merchantId) {
    const merchantId = parseInt(params.merchantId, 10);
    if (!isNaN(merchantId)) {
      merchant = await getMerchantById(merchantId);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          {/* Animated checkmark */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-primary animate-pulse"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Reward Tracking Activated
            </h1>
            <p className="text-lg text-muted-foreground">
              Your cashback rewards are now being tracked in real-time.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {merchant ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              You&apos;re about to shop at <strong>{merchant.name}</strong>. Click below to continue and earn up to <strong>{merchant.cashbackRate}</strong> cashback on this purchase.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              Browse our partner stores below and start earning cashback on every purchase.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {merchant ? (
              <Link
                href={`/api/redirect?merchantId=${merchant.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                Shop at {merchant.name} Now
              </Link>
            ) : null}

            <Link
              href="/#offers"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-base font-semibold transition-all hover:bg-accent"
            >
              Browse All Stores
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Your rewards are tracked when you complete a purchase within 48 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MerchantsPage;
