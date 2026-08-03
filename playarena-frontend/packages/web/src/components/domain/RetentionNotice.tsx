"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface RetentionNoticeProps {
  message: string;
  retentionDays: number;
}

export function RetentionNotice({ message, retentionDays }: RetentionNoticeProps) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="flex flex-col gap-3 p-4 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {message} <span className="font-medium">You can view up to {retentionDays} days of history.</span>
        </p>
        <Button variant="secondary" className="shrink-0" onClick={() => (window.location.href = "/subscriptions")}>
          Upgrade to unlock more
        </Button>
      </CardContent>
    </Card>
  );
}
