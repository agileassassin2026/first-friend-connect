import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/ff/AppShell";
import { FFCard } from "@/components/ff/FFCard";
import { FFButton } from "@/components/ff/FFButton";
import { FFInput, FFSelect, FFTextarea } from "@/components/ff/FFInput";
import { Icon } from "@/components/ff/Icon";
import { useRequireAuth } from "@/lib/useRequireAuth";

export const Route = createFileRoute("/support")({
  component: Support,
  head: () => ({ meta: [{ title: "Support & Safety | First Friend" }] }),
});

const CATEGORIES = ["Technical problem", "Matching issue", "Inappropriate behavior", "Account problem", "Other"];

function Support() {
  const ready = useRequireAuth();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  if (!ready) return null;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Support & Safety</h1>
          <p className="text-muted-foreground">We're here for you. Tell us what's going on and we'll respond within 24h.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { i: "shield", t: "Safe community", d: "All buddies are IÉSEG-vetted." },
            { i: "support_agent", t: "24h response", d: "We answer every report fast." },
            { i: "lock", t: "Private", d: "Reports stay between you and the team." },
          ].map((b) => (
            <FFCard key={b.t} className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary-soft text-primary flex items-center justify-center">
                <Icon name={b.i} />
              </div>
              <p className="mt-2 font-bold">{b.t}</p>
              <p className="text-xs text-muted-foreground">{b.d}</p>
            </FFCard>
          ))}
        </div>

        {sent ? (
          <FFCard className="text-center space-y-3 py-12 bg-primary-soft border-primary">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center">
              <Icon name="check" className="text-3xl text-navy" />
            </div>
            <h2 className="text-2xl font-extrabold">Message received</h2>
            <p className="text-navy/80">Thanks for reaching out. The First Friend team will get back to you shortly.</p>
            <FFButton variant="outline" onClick={() => { setSent(false); setSubject(""); setMessage(""); }}>Send another</FFButton>
          </FFCard>
        ) : (
          <FFCard>
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="space-y-4"
            >
              <FFSelect label="Issue category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </FFSelect>
              <FFInput label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Short summary" />
              <FFTextarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Tell us what's happening…" />
              <FFButton type="submit" full size="lg">Send message</FFButton>
            </form>
          </FFCard>
        )}
      </div>
    </AppShell>
  );
}
