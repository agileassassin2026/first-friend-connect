import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/ff/AppShell";
import { FFCard } from "@/components/ff/FFCard";
import { FFButton } from "@/components/ff/FFButton";
import { Tag } from "@/components/ff/Chip";
import { Icon } from "@/components/ff/Icon";
import { Avatar } from "@/components/ff/Avatar";
import { findBuddy, scoreMatch } from "@/lib/data";
import { getUser, setMatch, completeStreakAction } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";

export const Route = createFileRoute("/buddy/$id")({
  component: BuddyDetail,
  head: () => ({ meta: [{ title: "Buddy Profile | First Friend" }] }),
});

function BuddyDetail() {
  const ready = useRequireAuth();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const buddy = findBuddy(id);
  if (!ready) return null;
  if (!buddy) {
    return (
      <AppShell>
        <div className="p-10">
          <p>Buddy not found.</p>
          <Link to="/matches" className="text-primary font-bold">Back to matches</Link>
        </div>
      </AppShell>
    );
  }
  const user = getUser()!;
  const { score, reasons, sharedInterests } = scoreMatch(user, buddy);

  function request() {
    setMatch(buddy!.id, "pending");
    completeStreakAction("request");
    navigate({ to: "/match-status" });
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
        <Link to="/matches" className="inline-flex items-center gap-2 text-navy text-sm font-semibold">
          <Icon name="arrow_back" /> Back to matches
        </Link>

        <FFCard className="p-0 overflow-hidden">
          <div className="hero-gradient h-32 relative">
            <div className="absolute top-4 right-4 bg-white rounded-xl px-4 py-2 shadow-card">
              <div className="text-2xl font-extrabold text-primary leading-none">{score}%</div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Match</p>
            </div>
          </div>
          <div className="px-6 md:px-8 pb-8 -mt-12">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <Avatar name={buddy.name} src={buddy.avatar} size={96} className="ring-4 ring-white" />
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold">{buddy.name}</h1>
                <p className="text-sm text-muted-foreground">{buddy.program} · {buddy.campus}</p>
              </div>
              <FFButton onClick={request} size="lg">Request match <Icon name="favorite" /></FFButton>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="font-bold mb-2 flex items-center gap-2"><Icon name="auto_stories" className="text-primary" /> About me</h3>
                <p className="text-muted-foreground italic">"{buddy.bio}"</p>
              </div>
              <Block icon="translate" title="Languages">
                <div className="flex flex-wrap gap-2">{buddy.languages.map((l) => <Tag key={l} tone="primary">{l}</Tag>)}</div>
              </Block>
              <Block icon="schedule" title="Availability">
                <div className="flex flex-wrap gap-2">{buddy.availability.map((l) => <Tag key={l}>{l}</Tag>)}</div>
              </Block>
              <Block icon="volunteer_activism" title="Help topics">
                <div className="flex flex-wrap gap-2">{buddy.helpTags.map((l) => <Tag key={l} tone="accent">{l}</Tag>)}</div>
              </Block>
              <Block icon="interests" title="Interests">
                <div className="flex flex-wrap gap-2">{buddy.interests.map((l) => <Tag key={l}>{l}</Tag>)}</div>
              </Block>
              {sharedInterests.length > 0 && (
                <Block icon="favorite" title="Shared with you" className="md:col-span-2">
                  <div className="flex flex-wrap gap-2">{sharedInterests.map((l) => <Tag key={l} tone="coral">{l}</Tag>)}</div>
                </Block>
              )}
              <div className="md:col-span-2 bg-primary-soft/50 rounded-lg p-5">
                <p className="font-bold text-navy text-xs uppercase tracking-widest mb-2">Why this match</p>
                <ul className="text-navy/80 space-y-1">
                  {reasons.map((r) => <li key={r} className="flex items-start gap-2"><Icon name="check_circle" className="text-primary text-sm mt-0.5" />{r}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </FFCard>
      </div>
    </AppShell>
  );
}

function Block({ icon, title, children, className }: { icon: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h3 className="font-bold mb-2 flex items-center gap-2"><Icon name={icon} className="text-primary" /> {title}</h3>
      {children}
    </div>
  );
}
