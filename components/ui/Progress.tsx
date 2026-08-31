import React from "react";
import { cn } from "@/lib/utils/cn";

export function Progress({
  value = 0,
  className,
  indicatorClassName,
}: {
  value?: number;
  className?: string;
  indicatorClassName?: string;
}) {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-white/10",
        className
      )}
    >
      <div
        className={cn(
          "h-full w-full flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
}
