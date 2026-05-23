import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getUser, logout, type User } from "@/lib/auth";
import { Icon } from "./Icon";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

const items = [
  { to: "/matches", label: "Matches", icon: "groups" },
  { to: "/profile", label: "Profile", icon: "person" },
  { to: "/chat", label: "Chat", icon: "chat_bubble" },
  { to: "/streak", label: "Streak", icon: "local_fire_department" },
  { to: "/support", label: "Support", icon: "shield" },
  { to: "/settings", label: "Settings", icon: "settings" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setU] = useState<User | null>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const sync = () => setU(getUser());
    sync();
    window.addEventListener("ff:user", sync);
    return () => window.removeEventListener("ff:user", sync);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-navy text-white p-6 sticky top-0 h-screen">
        <Link to="/matches" className="flex items-center gap-2 mb-10">
          <Logo size={36} />
          <span className="font-bold text-lg tracking-tight">First Friend</span>
        </Link>

        {user && (
          <div className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-white/5">
            <Avatar name={user.name} src={user.avatar} size={40} />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-white/60 truncate">{user.role === "new-student" ? "New Student" : "Senior Buddy"}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1">
          {items.map((it) => {
            const active = pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition",
                  active ? "bg-primary text-navy" : "text-white/80 hover:bg-white/10",
                )}
              >
                <Icon name={it.icon} className="text-[20px]" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/10 transition"
        >
          <Icon name="logout" className="text-[20px]" /> Logout
        </button>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden bg-navy text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/matches" className="font-bold">First Friend</Link>
        {user && <Avatar name={user.name} src={user.avatar} size={32} />}
      </header>

      <main className="flex-1 min-w-0 pb-24 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-navy text-white border-t border-white/10 grid grid-cols-6 z-40">
        {items.map((it) => {
          const active = pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn("flex flex-col items-center py-2 text-[10px] font-semibold", active ? "text-primary" : "text-white/70")}
            >
              <Icon name={it.icon} className="text-[22px]" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
