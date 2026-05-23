import { cn } from "@/lib/utils";

export function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-semibold border transition-all active:scale-95",
        selected
          ? "bg-primary text-navy border-primary primary-glow"
          : "bg-navy/5 text-navy border-navy/10 hover:bg-navy/10",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Tag({ children, tone = "navy", className }: { children: React.ReactNode; tone?: "navy" | "primary" | "accent" | "coral"; className?: string }) {
  const cls = {
    navy: "bg-navy/8 text-navy",
    primary: "bg-primary-soft text-navy",
    accent: "bg-accent/20 text-navy",
    coral: "bg-coral/15 text-coral",
  }[tone];
  return <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold", cls, className)}>{children}</span>;
}
