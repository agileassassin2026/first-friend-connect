import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FFButton } from "@/components/ff/FFButton";
import { FFCard } from "@/components/ff/FFCard";
import { FFInput, FFSelect } from "@/components/ff/FFInput";
import { Chip } from "@/components/ff/Chip";
import { Icon } from "@/components/ff/Icon";
import { setUser, type Role } from "@/lib/auth";
import { CAMPUSES, LANGUAGES, PROGRAMS } from "@/lib/data";

export function SignUpForm({ role }: { role: Role }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [campus, setCampus] = useState(CAMPUSES[0]);
  const [program, setProgram] = useState(PROGRAMS[0]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [capacity, setCapacity] = useState(2);

  function toggleLang(l: string) {
    setLanguages((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setUser({
      id: crypto.randomUUID(),
      name,
      email,
      role,
      campus,
      program,
      languages,
      capacity: role === "senior-buddy" ? capacity : undefined,
    });
    navigate({ to: role === "senior-buddy" ? "/onboarding/senior-buddy" : "/onboarding/new-student" });
  }

  const isBuddy = role === "senior-buddy";

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-navy mb-6 text-sm font-semibold">
          <Icon name="arrow_back" /> Back to home
        </Link>
        <FFCard className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-navy text-xs font-bold uppercase tracking-widest mb-3">
              <Icon name={isBuddy ? "school" : "waving_hand"} className="text-sm" />
              {isBuddy ? "Senior Buddy Sign Up" : "New Student Sign Up"}
            </div>
            <h1 className="text-3xl font-extrabold">{isBuddy ? "Become a First Friend." : "Welcome to IÉSEG."}</h1>
            <p className="text-muted-foreground mt-1">
              {isBuddy
                ? "Share what you've learned and help a newcomer feel at home."
                : "Tell us about you. We'll match you with the perfect senior buddy."}
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <FFInput label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
              <FFInput label="IÉSEG email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@ieseg.fr" required />
            </div>
            <FFInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" minLength={6} required />
            <div className="grid md:grid-cols-2 gap-4">
              <FFSelect label="Campus" value={campus} onChange={(e) => setCampus(e.target.value)}>
                {CAMPUSES.map((c) => <option key={c}>{c}</option>)}
              </FFSelect>
              <FFSelect label="Program" value={program} onChange={(e) => setProgram(e.target.value)}>
                {PROGRAMS.map((p) => <option key={p}>{p}</option>)}
              </FFSelect>
            </div>
            <div>
              <p className="text-sm font-semibold text-navy mb-2">Languages you speak</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => (
                  <Chip key={l} selected={languages.includes(l)} onClick={() => toggleLang(l)}>{l}</Chip>
                ))}
              </div>
            </div>
            {isBuddy && (
              <FFSelect label="How many buddies can you mentor at once?" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} buddy{n > 1 ? "s" : ""}</option>)}
              </FFSelect>
            )}
            <FFButton type="submit" full size="lg">Continue to onboarding <Icon name="arrow_forward" /></FFButton>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-bold">Login</Link>
          </p>
        </FFCard>
      </div>
    </div>
  );
}
