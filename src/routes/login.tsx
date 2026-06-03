import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FFButton } from "@/components/ff/FFButton";
import { FFCard } from "@/components/ff/FFCard";
import { FFInput } from "@/components/ff/FFInput";
import { Icon } from "@/components/ff/Icon";
import { Logo } from "@/components/ff/Logo";
import { getUser, setUser } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Login | First Friend" }] }),
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const stored = getUser();
    if (stored && stored.email.toLowerCase() === email.toLowerCase()) {
      setUser(stored);
      navigate({ to: stored.onboarded ? "/profile" : stored.role === "senior-buddy" ? "/onboarding/senior-buddy" : "/onboarding/new-student" });
      return;
    }
    // demo: allow any non-empty email/password and create a temp student
    if (email && password) {
      setUser({
        id: crypto.randomUUID(),
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        role: "new-student",
        campus: "Lille",
        program: "Master Cycle (Grande École)",
        languages: ["English", "French"],
      });
      navigate({ to: "/onboarding/new-student" });
      return;
    }
    setError("Please enter your email and password.");
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hero-gradient hidden md:flex flex-col justify-between p-12 text-white">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={36} />
          <span className="font-bold">First Friend</span>
        </Link>
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold">Welcome back, change-maker.</h1>
          <p className="text-white/80">Your buddy is waiting. Pick up the conversation, keep your streak alive, and make IÉSEG feel like home.</p>
        </div>
        <p className="text-white/50 text-sm">Official IÉSEG Peer Network</p>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <FFCard className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold">Login</h2>
            <p className="text-muted-foreground text-sm mt-1">Use your IÉSEG account to continue.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <FFInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@ieseg.fr" required />
            <FFInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            <div className="text-right -mt-2">
              <Link to="/forgot-password" className="text-sm text-primary font-bold">Forgot password?</Link>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <FFButton type="submit" full>Login</FFButton>
          </form>
          <div className="text-sm text-center text-muted-foreground space-y-1">
            <p>New here? <Link to="/signup/new-student" className="text-primary font-bold">Sign up as a student</Link></p>
            <p>Or <Link to="/signup/senior-buddy" className="text-primary font-bold">become a senior buddy</Link></p>
          </div>
        </FFCard>
      </div>
    </div>
  );
}
