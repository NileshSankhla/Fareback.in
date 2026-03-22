"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const DashboardToggleButton = () => {
  const pathname = usePathname();
  const isDashboardOpen = pathname.startsWith("/dashboard");

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={isDashboardOpen ? "/" : "/dashboard"}>
        {isDashboardOpen ? "Close Dashboard" : "Dashboard"}
      </Link>
    </Button>
  );
};

export default DashboardToggleButton;
