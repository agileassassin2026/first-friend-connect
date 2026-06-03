import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FFButton } from "@/components/ff/FFButton";
import { FFCard } from "@/components/ff/FFCard";
import { FFInput } from "@/components/ff/FFInput";
import { Logo } from "@/components/ff/Logo";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
  head: () => ({ meta: [{ title: "Forgot password | First Friend" }] }),
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Demo: if the email matches the locally stored account, stash a reset token
    // so the reset page can verify it. We never reveal whether the email exists.
    const stored = getUser();
    if (stored && stored.email.toLowerCase() === email.toLowerCase()) {
      const token = crypto.randomUUID();
      localStorage.setItem("ff_reset", JSON.stringify({ email: stored.email, token }));
      // In a real backend, this link would be emailed to the user.
      console.info(`[demo] Password reset link: ${window.location.origin}/reset-password?token=${token}`);
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hero-gradient hidden md:flex flex-col justify-between p-12 text-white">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={36} />
          <span className="font-bold">First Friend</span>
        </Link>
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold">Reset your password.</h1>
          <p className="text-white/80">We'll send you a secure link to set a new password.</p>
        </div>
        <p className="text-white/50 text-sm">Official IÉSEG Peer Network</p>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <FFCard className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold">Forgot password</h2>
            <p className="text-muted-foreground text-sm mt-1">Enter your email and we'll send you a reset link.</p>
          </div>
          {sent ? (
            <div className="space-y-4">
              <p className="text-sm text-navy">If this email is registered, a password reset link has been sent.</p>
              <Link to="/login"><FFButton full>Back to login</FFButton></Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <FFInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@ieseg.fr" required />
              <FFButton type="submit" full>Send reset link</FFButton>
            </form>
          )}
          {!sent && (
            <div className="text-sm text-center text-muted-foreground">
              <Link to="/login" className="text-primary font-bold">Back to login</Link>
            </div>
          )}
        </FFCard>
      </div>
    </div>
  );
}
