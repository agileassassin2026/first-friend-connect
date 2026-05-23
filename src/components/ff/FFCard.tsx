import { cn } from "@/lib/utils";
import * as React from "react";

export function FFCard({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        "bg-card rounded-2xl shadow-card border border-border/60 p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
