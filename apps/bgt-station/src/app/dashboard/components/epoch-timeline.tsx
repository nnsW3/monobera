"use client";

import React from "react";
import { usePollEpochs } from "@bera/berajs";
import { Card } from "@bera/ui/card";
import { Progress } from "@bera/ui/progress";
import { Skeleton } from "@bera/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import useSWR from "swr";

export function EpochTimeline() {
  const [duration, setDuration] = React.useState("0d");
  const [progressPercentage, setProgressPercentage] = React.useState(0);

  const { useCurrentEpoch, isLoading } = usePollEpochs();
  const currentEpoch = useCurrentEpoch();
  useSWR(
    [currentEpoch],
    () => {
      if (currentEpoch) {
        const currentTime = Math.floor(Date.now() / 1000);
        const startTime = currentEpoch.startTime;
        const endTime = currentEpoch.endTime;

        const totalTime = endTime - startTime;
        const elapsedTime = currentTime - startTime;

        const percentage = (elapsedTime / totalTime) * 100;
        if (percentage > 100) {
          setProgressPercentage(100);
        } else {
          setProgressPercentage(percentage);
        }
      }
      const unixTimestamp = currentEpoch?.endTime || 0;
      const dateObject = new Date(unixTimestamp * 1000); // Convert to milliseconds
      const formatted = formatDistanceToNow(dateObject, { addSuffix: false });
      if (formatted === "less than a minute") {
        setDuration(" <1 minute");
      } else {
        setDuration(formatted);
      }
    },
    {
      refreshInterval: 5000,
    },
  );

  return (
    <Card className="w-full px-6 py-[39px]">
      <div className="flex h-8 items-center gap-3">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-8" />
          </>
        ) : (
          <>
            <div className="font-semi text-xl font-semibold">
              {currentEpoch?.current ?? 0}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs font-medium text-muted-foreground">
                <span>{progressPercentage.toFixed(0)}%</span>
                <span>{currentEpoch ? duration : "0d"} to next epoch </span>
              </div>
              <Progress className="h-2" value={progressPercentage} />
            </div>
            <div className="font-semi text-xl font-semibold text-muted-foreground">
              {currentEpoch?.current ? currentEpoch?.current + 1 : "0"}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
