import { formatDate, formatPaiseAsINR } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface TrackedHistoryItem {
  id: string | number;
  merchantName: string;
  clickDate: Date;
  rewardAmount: number;
  trackingStatus: "tracked" | "approved";
}

interface TrackedHistoryProps {
  items: TrackedHistoryItem[];
}

const TrackedHistory = ({ items }: TrackedHistoryProps) => {
  const visibleItems = items.filter(
    (item) => item.trackingStatus === "tracked" || item.trackingStatus === "approved",
  );

  if (visibleItems.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No tracked rewards yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibleItems.map((item) => (
        <Card key={item.id} className="border-border/60 bg-card/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">{item.merchantName}</CardTitle>
              <span className="rounded-full border border-border/70 px-2 py-1 text-xs">
                {item.trackingStatus === "approved" ? "Approved" : "Tracked"}
              </span>
            </div>
            <CardDescription>{formatDate(item.clickDate)}</CardDescription>
          </CardHeader>
          <CardContent>
            {item.trackingStatus === "approved" ? (
              <p className="text-sm font-semibold text-primary">
                Reward received: {formatPaiseAsINR(item.rewardAmount)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Reward is being tracked.
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TrackedHistory;
