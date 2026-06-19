import * as React from "react";
import { cn } from "@/lib/utils";

export const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium transition-colors",
      className
    )}
    {...props}
  />
);
