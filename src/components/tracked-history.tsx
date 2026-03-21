import { formatPaiseAsINR } from "@/lib/wallet";
import { formatDate } from "@/lib/utils";
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
  adminApproved: boolean;
}

interface TrackedHistoryProps {
  items: TrackedHistoryItem[];
}

const TrackedHistory = ({ items }: TrackedHistoryProps) => {
  const approvedItems = items.filter((item) => item.adminApproved);

  if (approvedItems.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No tracked rewards yet. Rewards appear here after admin approval.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {approvedItems.map((item) => (
        <Card key={item.id} className="border-border/60 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{item.merchantName}</CardTitle>
            <CardDescription>{formatDate(item.clickDate)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-primary">
              Reward: {formatPaiseAsINR(item.rewardAmount)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TrackedHistory;
