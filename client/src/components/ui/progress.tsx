import * as React from "react";
import { cn } from "@/lib/utils";

export const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={cn("h-2 overflow-hidden rounded-full bg-muted", className)}>
    <div
      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-violet-500 transition-all duration-500"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);
