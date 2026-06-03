import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/ff/AppShell";
import { FFCard } from "@/components/ff/FFCard";
import { FFButton } from "@/components/ff/FFButton";
import { Icon } from "@/components/ff/Icon";
import { getUser, getSwitchEligibility, logout, updateUser } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({ meta: [{ title: "Settings | First Friend" }] }),
});

function Settings() {
  const ready = useRequireAuth();
  const navigate = useNavigate();
  const [notif, setNotif] = useState({ matches: true, messages: true, streak: true, weekly: false });
  const [paused, setPaused] = useState(false);
  if (!ready) return null;
  const u = getUser()!;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Settings</h1>
          <p className="text-muted-foreground">Manage your account, language and notifications.</p>
        </div>

        <Section title="Account" icon="person">
          <Row label="Name" value={u.name} />
          <Row label="Email" value={u.email} />
          <Row label="Role" value={u.role === "senior-buddy" ? "Senior Buddy" : "New Student"} />
          <Row label="Campus" value={u.campus} />
          <Row label="Program" value={u.program} />
        </Section>




        <Section title="Notifications" icon="notifications">
          {([
            ["matches", "New buddy matches"],
            ["messages", "Chat messages"],
            ["streak", "Friendship streak reminders"],
            ["weekly", "Weekly community digest"],
          ] as const).map(([k, label]) => (
            <Toggle key={k} label={label} on={notif[k]} onChange={(v) => setNotif({ ...notif, [k]: v })} />
          ))}
        </Section>

        <Section title="Account actions" icon="manage_accounts">
          <Toggle label="Pause my account" sub="Hide your profile from new matches" on={paused} onChange={setPaused} />
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <FFButton variant="outline" onClick={() => { logout(); navigate({ to: "/" }); }}>
              <Icon name="logout" /> Logout
            </FFButton>
            <FFButton
              variant="coral"
              onClick={() => {
                if (confirm("Delete account? This is a demo action.")) {
                  logout();
                  navigate({ to: "/" });
                }
              }}
            >
              <Icon name="delete" /> Delete account
            </FFButton>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <FFCard className="space-y-4">
      <h2 className="flex items-center gap-2 font-extrabold text-lg">
        <Icon name={icon} className="text-primary" /> {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </FFCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-navy">{value}</span>
    </div>
  );
}

function Toggle({ label, sub, on, onChange }: { label: string; sub?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-semibold text-navy">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!on)}
        className={`w-12 h-7 rounded-full transition relative ${on ? "bg-primary" : "bg-surface-high"}`}
        aria-label={label}
      >
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}
