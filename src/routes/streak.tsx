import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/ff/AppShell";
import { FFCard } from "@/components/ff/FFCard";
import { Icon } from "@/components/ff/Icon";
import { FFButton } from "@/components/ff/FFButton";
import { completeStreakAction, getStreak } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";

export const Route = createFileRoute("/streak")({
  component: Streak,
  head: () => ({ meta: [{ title: "Friendship Streak | First Friend" }] }),
});

const ACTIONS = [
  { id: "profile", title: "Complete your profile", icon: "person" },
  { id: "request", title: "Request a buddy", icon: "favorite" },
  { id: "message", title: "Send your first message", icon: "send" },
  { id: "question", title: "Ask one question", icon: "help" },
  { id: "meetup", title: "Plan your first meetup", icon: "event" },
];

function Streak() {
  const ready = useRequireAuth();
  const [state, setState] = useState(getStreak());
  useEffect(() => {
    const sync = () => setState(getStreak());
    window.addEventListener("ff:streak", sync);
    return () => window.removeEventListener("ff:streak", sync);
  }, []);
  if (!ready) return null;

  const done = state.completed.length;
  const target = 7;
  const days = Math.min(done, target);
  const pct = (days / target) * 100;

  // current = first not-yet-done action
  const currentIdx = ACTIONS.findIndex((a) => !state.completed.includes(a.id));

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6">
        <div>
          <p className="text-xs uppercase font-bold tracking-widest text-coral">Friendship streak</p>
          <h1 className="text-3xl md:text-4xl font-extrabold">Keep the spark alive 🔥</h1>
        </div>

        {/* Headline streak card */}
        <FFCard className="relative overflow-hidden bg-navy text-white border-navy">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-coral/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/30 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-coral flex items-center justify-center accent-glow" style={{ boxShadow: "0 0 30px rgba(255,107,80,0.5)" }}>
                <Icon name="local_fire_department" className="text-5xl text-white" />
              </div>
              <div>
                <p className="text-5xl font-extrabold leading-none">{days}-day</p>
                <p className="text-white/70 mt-1">friendship streak</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-white/80">
                <span>Progress to a full week</span>
                <span>{days}/{target}</span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-coral via-accent to-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < days ? "bg-accent text-navy" : "bg-white/10 text-white/40"}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FFCard>

        {/* Path */}
        <div className="space-y-3">
          <h2 className="text-xl font-extrabold">Your friendship quest</h2>
          {ACTIONS.map((a, idx) => {
            const completed = state.completed.includes(a.id);
            const current = idx === currentIdx;
            return (
              <FFCard
                key={a.id}
                className={`flex items-center gap-4 transition ${completed ? "bg-primary-soft border-primary" : current ? "border-accent ring-2 ring-accent/40" : ""}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    completed ? "bg-primary text-navy" : current ? "bg-accent text-navy accent-glow" : "bg-surface-high text-muted-foreground"
                  }`}
                >
                  <Icon name={completed ? "check" : a.icon} className="text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {completed ? "Completed — well done!" : current ? "Today's quest" : "Upcoming"}
                  </p>
                </div>
                {!completed && current && (
                  <FFButton size="sm" variant="accent" onClick={() => completeStreakAction(a.id)}>
                    Mark done
                  </FFButton>
                )}
                {completed && <Icon name="emoji_events" className="text-accent text-2xl" />}
              </FFCard>
            );
          })}
        </div>

        {/* Badges */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { t: "First step", req: 1, icon: "rocket_launch" },
            { t: "Half way", req: 3, icon: "trending_up" },
            { t: "Week champion", req: 5, icon: "emoji_events" },
          ].map((b) => {
            const earned = done >= b.req;
            return (
              <FFCard key={b.t} className={`text-center ${earned ? "" : "opacity-50"}`}>
                <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${earned ? "bg-accent text-navy accent-glow" : "bg-surface-high text-muted-foreground"}`}>
                  <Icon name={b.icon} className="text-2xl" />
                </div>
                <p className="mt-2 font-bold text-sm">{b.t}</p>
              </FFCard>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
