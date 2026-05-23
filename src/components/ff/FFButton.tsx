import { cn } from "@/lib/utils";
import * as React from "react";

type Variant = "primary" | "accent" | "navy" | "outline" | "ghost" | "coral";
type Size = "sm" | "md" | "lg";

const variantCls: Record<Variant, string> = {
  primary: "bg-primary text-navy hover:bg-primary/90 primary-glow",
  accent: "bg-accent text-navy hover:bg-accent/90 accent-glow",
  navy: "bg-navy text-white hover:bg-navy/90",
  outline: "border-2 border-navy text-navy hover:bg-navy hover:text-white",
  ghost: "text-navy hover:bg-surface-high",
  coral: "bg-coral text-white hover:bg-coral/90",
};

const sizeCls: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-md",
  md: "px-6 py-3 text-sm rounded-lg",
  lg: "px-8 py-4 text-base rounded-lg",
};

export const FFButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; full?: boolean }
>(({ className, variant = "primary", size = "md", full, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
      variantCls[variant],
      sizeCls[size],
      full && "w-full",
      className,
    )}
    {...props}
  />
));
FFButton.displayName = "FFButton";
