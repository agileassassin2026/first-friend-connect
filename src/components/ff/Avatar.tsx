import { cn } from "@/lib/utils";

export function Avatar({ src, name, size = 48, className }: { src?: string; name: string; size?: number; className?: string }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={cn("rounded-full bg-primary-soft text-navy font-bold flex items-center justify-center overflow-hidden flex-shrink-0", className)}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>{initials}</span>}
    </div>
  );
}
