import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicNav } from "@/components/ff/PublicNav";
import { FFButton } from "@/components/ff/FFButton";
import { FFCard } from "@/components/ff/FFCard";
import { Icon } from "@/components/ff/Icon";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "First Friend | IÉSEG Peer Support" },
      { name: "description", content: "Find your trusted senior buddy during your first month at IÉSEG. Bold, supportive, change-maker community." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-navy">
      <PublicNav />

      {/* Hero */}
      <header className="hero-gradient relative overflow-hidden py-20 md:py-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary">
              <Icon name="verified_user" className="text-sm" />
              <span className="text-xs uppercase tracking-widest font-bold">Official IÉSEG Peer Network</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Find your first trusted <span className="text-primary">friend</span> at IÉSEG.
            </h1>
            <p className="text-lg text-white/80 max-w-lg">
              Bridge the gap between curiosity and belonging. Connect with seniors who've walked the path and are ready to guide your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup/new-student">
                <FFButton variant="accent" size="lg">
                  I am a New Student <Icon name="arrow_forward" />
                </FFButton>
              </Link>
              <Link to="/signup/senior-buddy">
                <FFButton variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-navy">
                  I am a Senior Buddy
                </FFButton>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            <div className="glass-card relative rounded-3xl shadow-2xl p-4 rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80"
                alt="IÉSEG students"
                className="w-full h-[420px] object-cover rounded-2xl"
              />
              <div className="absolute -left-6 bottom-10 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Icon name="group" className="text-navy" />
                </div>
                <div>
                  <p className="font-bold text-sm text-navy">500+ Matches</p>
                  <p className="text-xs text-muted-foreground">Made this semester</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section id="how" className="py-20 md:py-28 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold">Simple Path to Connection</h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mt-4" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Sign Up", d: "Create your profile using your IÉSEG credentials and tell us a little about you.", i: "person_add", bg: "bg-primary-soft" },
            { n: "02", t: "Onboarding", d: "Complete a 2-minute personality quiz. We use it to find your best peer match.", i: "assignment_ind", bg: "bg-accent/30" },
            { n: "03", t: "Perfect Match", d: "Meet your First Friend. Chat, meet on campus, and start your journey with confidence.", i: "handshake", bg: "bg-navy text-white" },
          ].map((s) => (
            <FFCard key={s.n} className="hover:-translate-y-2 transition-transform duration-300">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${s.bg}`}>
                <Icon name={s.i} className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-2">{s.n}. {s.t}</h3>
              <p className="text-muted-foreground">{s.d}</p>
            </FFCard>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="bg-surface-low py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="h-48 rounded-2xl bg-navy overflow-hidden">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80" alt="" className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="h-56 rounded-2xl bg-accent flex items-center justify-center text-navy text-center p-6">
                <div>
                  <span className="text-5xl font-extrabold">100%</span>
                  <p className="text-sm font-bold mt-1">Peer Vetted</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-12">
              <div className="h-56 rounded-2xl bg-surface-high flex items-end p-6">
                <p className="text-xl font-bold">Your success is our mission.</p>
              </div>
              <div className="h-48 rounded-2xl bg-primary overflow-hidden">
                <img src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=600&q=80" alt="" className="w-full h-full object-cover opacity-60" />
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold">Why join the First Friend program?</h2>
            {[
              { i: "psychology", t: "Personalized support", d: "Skip the admin maze and get bespoke advice tailored to your program." },
              { i: "rocket_launch", t: "Boosted confidence", d: "Students with a buddy report 40% higher confidence in their first semester." },
              { i: "hub", t: "Instant network", d: "Plug into the IÉSEG change-maker community from day one." },
            ].map((b) => (
              <div key={b.t} className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                  <Icon name={b.i} />
                </div>
                <div>
                  <h4 className="font-bold">{b.t}</h4>
                  <p className="text-muted-foreground">{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section id="community" className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">Heard from the hallways</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { q: "I arrived from Brazil feeling lost. My First Friend Marc showed me everything — best decision ever.", n: "Luiz G.", r: "MSc Student", dark: false },
            { q: "Being a buddy let me give back to the community that welcomed me three years ago. So rewarding.", n: "Camille L.", r: "Senior Buddy", dark: true },
            { q: "The matching is scary accurate. My buddy and I now share an apartment AND a club.", n: "Anya P.", r: "Bachelor 1", dark: false },
          ].map((t, i) => (
            <FFCard key={i} className={t.dark ? "bg-navy text-white border-navy" : ""}>
              <p className={`italic mb-6 ${t.dark ? "text-white/90" : "text-muted-foreground"}`}>"{t.q}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-soft" />
                <div>
                  <p className="font-bold">{t.n}</p>
                  <p className={`text-xs font-bold ${t.dark ? "text-primary" : "text-primary"}`}>{t.r}</p>
                </div>
              </div>
            </FFCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-5xl mx-auto hero-gradient rounded-3xl p-12 text-center text-white space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold">Ready to find your First Friend?</h2>
          <p className="text-white/80 max-w-xl mx-auto">Join 500+ IÉSEG students already matched this semester.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup/new-student"><FFButton variant="accent" size="lg">Get started</FFButton></Link>
            <Link to="/login"><FFButton variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-navy">Login</FFButton></Link>
          </div>
        </div>
      </section>

      <footer className="bg-navy text-white/70 py-8 text-center text-sm">
        © {new Date().getFullYear()} First Friend × IÉSEG — Built by change-makers for change-makers.
      </footer>
    </div>
  );
}
