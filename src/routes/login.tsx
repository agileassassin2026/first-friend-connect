import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FFButton } from "@/components/ff/FFButton";
import { FFCard } from "@/components/ff/FFCard";
import { FFInput } from "@/components/ff/FFInput";
import { Icon } from "@/components/ff/Icon";
import { Logo } from "@/components/ff/Logo";
import { findAccountByEmail, getUser, setUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchProfile } from "@/lib/profiles";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Login | First Friend" }] }),
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setSubmitting(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError || !data.user) {
      setError("Incorrect email or password.");
      return;
    }
    // Prefer the cloud-stored profile so the user gets the same data on any device.
    const cloudProfile = await fetchProfile(data.user.id);
    if (cloudProfile) {
      setUser({ ...cloudProfile, onboarded: true });
      navigate({ to: "/profile" });
      return;
    }
    const existing =
      findAccountByEmail(email) ??
      (getUser()?.email.toLowerCase() === email.toLowerCase() ? getUser() : null);
    if (existing) {
      setUser({ ...existing, id: data.user.id, onboarded: true });
      navigate({ to: "/profile" });
      return;
    }
    // Authenticated but no profile yet — create a minimal record.
    setUser({
      id: data.user.id,
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: "new-student",
      originalRole: "new-student",
      createdAt: new Date().toISOString(),
      campus: "Lille",
      program: "Master Cycle (Grande École)",
      languages: ["English", "French"],
      onboarded: true,
    });
    navigate({ to: "/profile" });
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
            <FFButton type="submit" full disabled={submitting}>{submitting ? "Signing in…" : "Login"}</FFButton>
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
