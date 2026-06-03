import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FFButton } from "@/components/ff/FFButton";
import { FFCard } from "@/components/ff/FFCard";
import { Chip } from "@/components/ff/Chip";
import { Avatar } from "@/components/ff/Avatar";
import { Icon } from "@/components/ff/Icon";
import { FFTextarea } from "@/components/ff/FFInput";
import { getUser, updateUser, completeStreakAction } from "@/lib/auth";
import { AVAILABILITY, BUDDY_STYLES, HELP_OPTIONS, INTERESTS } from "@/lib/data";
import { useRequireAuth } from "@/lib/useRequireAuth";

export const Route = createFileRoute("/onboarding/senior-buddy")({
  component: SeniorOnboarding,
  head: () => ({ meta: [{ title: "Buddy Onboarding | First Friend" }] }),
});

const STEPS = ["Help with", "Mentoring style", "Interests", "Availability", "Capacity", "Preview"];

function SeniorOnboarding() {
  const ready = useRequireAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [mentoringStyle, setMentoringStyle] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [capacity, setCapacity] = useState(2);
  const [bio, setBio] = useState("");

  if (!ready) return null;
  const user = getUser()!;
  const toggle = (set: React.Dispatch<React.SetStateAction<string[]>>, v: string) =>
    set((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  function finish() {
    updateUser({ expertise, mentoringStyle, interests, availability, capacity, bio, onboarded: true });
    completeStreakAction("profile");
    navigate({ to: "/profile" });
  }

  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Step {step + 1} of {STEPS.length}</p>
          <h1 className="text-2xl md:text-3xl font-extrabold">{STEPS[step]}</h1>
          <div className="mt-3 h-2 rounded-full bg-surface-high overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <FFCard className="space-y-6">
          {step === 0 && (
            <>
              <p className="text-muted-foreground">Pick all the areas you feel confident helping a newcomer with.</p>
              <div className="flex flex-wrap gap-2">
                {HELP_OPTIONS.map((h) => <Chip key={h} selected={expertise.includes(h)} onClick={() => toggle(setExpertise, h)}>{h}</Chip>)}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="text-muted-foreground">How do you naturally mentor?</p>
              <div className="flex flex-wrap gap-2">
                {BUDDY_STYLES.map((b) => <Chip key={b} selected={mentoringStyle.includes(b)} onClick={() => toggle(setMentoringStyle, b)}>{b}</Chip>)}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-muted-foreground">Pick a few interests so we can match you with students who'll click.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => <Chip key={i} selected={interests.includes(i)} onClick={() => toggle(setInterests, i)}>{i}</Chip>)}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-muted-foreground">When are you generally available?</p>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABILITY.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggle(setAvailability, a)}
                    className={`p-4 rounded-xl border-2 font-semibold transition ${availability.includes(a) ? "border-primary bg-primary-soft" : "border-border bg-white hover:border-primary/50"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <FFTextarea label="Short bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What should new students know about you?" />
            </>
          )}
          {step === 4 && (
            <>
              <p className="text-muted-foreground">How many buddies can you mentor at once? (You can change this later.)</p>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCapacity(n)}
                    className={`p-6 rounded-xl border-2 font-extrabold text-2xl transition ${capacity === n ? "border-primary bg-primary-soft" : "border-border bg-white"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 5 && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar name={user.name} src={`https://i.pravatar.cc/200?u=${user.email}`} size={72} />
                <div>
                  <h3 className="font-extrabold text-xl">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.program} · {user.campus} · Senior Buddy</p>
                </div>
              </div>
              <Preview label="Can help with" items={expertise} />
              <Preview label="Mentoring style" items={mentoringStyle} />
              <Preview label="Interests" items={interests} />
              <Preview label="Availability" items={availability} />
              <Preview label="Capacity" items={[`${capacity} buddy${capacity > 1 ? "s" : ""}`]} />
              {bio && <p className="italic text-muted-foreground">"{bio}"</p>}
            </div>
          )}
        </FFCard>

        <div className="flex justify-between">
          <FFButton variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><Icon name="arrow_back" /> Back</FFButton>
          {step < STEPS.length - 1 ? (
            <FFButton onClick={() => setStep((s) => s + 1)}>Next <Icon name="arrow_forward" /></FFButton>
          ) : (
            <FFButton variant="accent" onClick={finish}>Generate my profile <Icon name="auto_awesome" /></FFButton>
          )}
        </div>
      </div>
    </div>
  );
}

function Preview({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => <span key={i} className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-navy">{i}</span>)}
      </div>
    </div>
  );
}
