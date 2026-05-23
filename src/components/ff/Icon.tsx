import { cn } from "@/lib/utils";

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
    >
      {name}
    </span>
  );
}
