"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { formatPaiseAsINR } from "@/lib/utils";

interface NavbarWalletClientProps {
  userId: number;
}

const NavbarWalletClient = ({ userId }: NavbarWalletClientProps) => {
  const [balanceInPaise, setBalanceInPaise] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch("/api/user/wallet", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setBalanceInPaise(data.balanceInPaise);
        }
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();
  }, []);

  if (isLoading || balanceInPaise === null) {
    return (
      <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm font-semibold md:flex animate-pulse">
        <Wallet className="h-4 w-4 text-primary" />
        <span className="w-12 h-4 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm font-semibold md:flex">
      <Wallet className="h-4 w-4 text-primary" />
      <span>{formatPaiseAsINR(balanceInPaise)}</span>
    </div>
  );
};

export default NavbarWalletClient;
