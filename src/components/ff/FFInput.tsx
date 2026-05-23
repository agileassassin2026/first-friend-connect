import { cn } from "@/lib/utils";
import * as React from "react";

export function FFInput({ label, error, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-semibold text-navy">{label}</span>}
      <input
        {...props}
        className={cn(
          "w-full px-4 py-3 rounded-lg bg-white border border-border text-navy placeholder:text-muted-foreground",
          "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition",
          error && "border-destructive focus:border-destructive focus:ring-destructive/20",
          className,
        )}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function FFTextarea({ label, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-semibold text-navy">{label}</span>}
      <textarea
        {...props}
        className={cn(
          "w-full px-4 py-3 rounded-lg bg-white border border-border text-navy placeholder:text-muted-foreground min-h-[110px]",
          "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition",
          className,
        )}
      />
    </label>
  );
}

export function FFSelect({ label, className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-semibold text-navy">{label}</span>}
      <select
        {...props}
        className={cn(
          "w-full px-4 py-3 rounded-lg bg-white border border-border text-navy",
          "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition",
          className,
        )}
      >
        {children}
      </select>
    </label>
  );
}
