import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FFButton } from "@/components/ff/FFButton";
import { FFCard } from "@/components/ff/FFCard";
import { Chip } from "@/components/ff/Chip";
import { Avatar } from "@/components/ff/Avatar";
import { Icon } from "@/components/ff/Icon";
import { FFTextarea } from "@/components/ff/FFInput";
import { getUser, saveUserPatch, completeStreakAction } from "@/lib/auth";
import { AVAILABILITY, BUDDY_STYLES, EMOTIONAL_STATES, INTERESTS, SUPPORT_NEEDS } from "@/lib/data";
import { useRequireAuth } from "@/lib/useRequireAuth";

export const Route = createFileRoute("/onboarding/new-student")({
  component: NewStudentOnboarding,
  head: () => ({ meta: [{ title: "Onboarding | First Friend" }] }),
});

const STEPS = ["Support needs", "How you feel", "Interests", "Buddy style", "Availability", "Preview"];

function NewStudentOnboarding() {
  const ready = useRequireAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [supportNeeds, setSupportNeeds] = useState<string[]>([]);
  const [emotionalState, setEmotionalState] = useState("Excited");
  const [interests, setInterests] = useState<string[]>([]);
  const [buddyStyle, setBuddyStyle] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  if (!ready) return null;
  const user = getUser()!;

  const toggle = (set: React.Dispatch<React.SetStateAction<string[]>>, val: string) =>
    set((p) => (p.includes(val) ? p.filter((x) => x !== val) : [...p, val]));

  async function finish() {
    await saveUserPatch({
      supportNeeds,
      emotionalState,
      interests,
      buddyStyle,
      availability,
      bio,
      onboarded: true,
    });
    completeStreakAction("profile");
    navigate({ to: "/profile" });
  }

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
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
              <p className="text-muted-foreground">Pick everything you'd love help with. We'll match you with a buddy who's strong in these areas.</p>
              <div className="flex flex-wrap gap-2">
                {SUPPORT_NEEDS.map((s) => <Chip key={s} selected={supportNeeds.includes(s)} onClick={() => toggle(setSupportNeeds, s)}>{s}</Chip>)}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="text-muted-foreground">How are you feeling about starting at IÉSEG?</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EMOTIONAL_STATES.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmotionalState(e)}
                    className={`p-4 rounded-xl border-2 font-semibold transition ${emotionalState === e ? "border-primary bg-primary-soft" : "border-border bg-white hover:border-primary/50"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-muted-foreground">Pick a few things you love. Shared interests = stronger matches.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((i) => <Chip key={i} selected={interests.includes(i)} onClick={() => toggle(setInterests, i)}>{i}</Chip>)}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="text-muted-foreground">What kind of buddy energy works best for you?</p>
              <div className="flex flex-wrap gap-2">
                {BUDDY_STYLES.map((b) => <Chip key={b} selected={buddyStyle.includes(b)} onClick={() => toggle(setBuddyStyle, b)}>{b}</Chip>)}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <p className="text-muted-foreground">When are you usually free to meet up or chat?</p>
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
              <FFTextarea label="Short bio (optional)" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="One sentence about you to break the ice." />
            </>
          )}
          {step === 5 && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar name={user.name} src={user.avatar} size={72} />
                <div>
                  <h3 className="font-extrabold text-xl">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.program} · {user.campus}</p>
                </div>
              </div>
              <PreviewSection label="Feeling" items={[emotionalState]} />
              <PreviewSection label="Looking for help with" items={supportNeeds} />
              <PreviewSection label="Interests" items={interests} />
              <PreviewSection label="Buddy style" items={buddyStyle} />
              <PreviewSection label="Availability" items={availability} />
              {bio && <p className="italic text-muted-foreground">"{bio}"</p>}
            </div>
          )}
        </FFCard>

        <div className="flex justify-between gap-3">
          <FFButton variant="ghost" onClick={back} disabled={step === 0}><Icon name="arrow_back" /> Back</FFButton>
          {step < STEPS.length - 1 ? (
            <FFButton onClick={next}>Next <Icon name="arrow_forward" /></FFButton>
          ) : (
            <FFButton variant="accent" onClick={finish}>Generate my profile <Icon name="auto_awesome" /></FFButton>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewSection({ label, items }: { label: string; items: string[] }) {
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
