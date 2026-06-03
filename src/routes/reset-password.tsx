import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { FFButton } from "@/components/ff/FFButton";
import { FFCard } from "@/components/ff/FFCard";
import { FFInput } from "@/components/ff/FFInput";
import { Logo } from "@/components/ff/Logo";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || "",
  }),
  head: () => ({ meta: [{ title: "Reset password | First Friend" }] }),
});

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: "/reset-password" });
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== pw2) return setError("Passwords do not match.");

    const raw = localStorage.getItem("ff_reset");
    const reset = raw ? (JSON.parse(raw) as { email: string; token: string }) : null;
    if (!reset || !token || reset.token !== token) {
      return setError("This reset link is invalid or has expired.");
    }
    localStorage.removeItem("ff_reset");
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hero-gradient hidden md:flex flex-col justify-between p-12 text-white">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={36} />
          <span className="font-bold">First Friend</span>
        </Link>
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold">Set a new password.</h1>
          <p className="text-white/80">Pick something strong you'll remember.</p>
        </div>
        <p className="text-white/50 text-sm">Official IÉSEG Peer Network</p>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <FFCard className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold">Reset password</h2>
            <p className="text-muted-foreground text-sm mt-1">Enter a new password for your account.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <FFInput label="New password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" required />
            <FFInput label="Confirm password" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" required />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <FFButton type="submit" full>Update password</FFButton>
          </form>
          <div className="text-sm text-center text-muted-foreground">
            <Link to="/login" className="text-primary font-bold">Back to login</Link>
          </div>
        </FFCard>
      </div>
    </div>
  );
}
