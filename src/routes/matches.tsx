import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/ff/AppShell";
import { FFCard } from "@/components/ff/FFCard";
import { FFButton } from "@/components/ff/FFButton";
import { Avatar } from "@/components/ff/Avatar";
import { Chip, Tag } from "@/components/ff/Chip";
import { Icon } from "@/components/ff/Icon";
import { BUDDIES, CAMPUSES, INTERESTS, LANGUAGES, PROGRAM_LEVELS, PROGRAMS_BY_LEVEL, SUPPORT_NEEDS, AVAILABILITY, scoreMatch, userToBuddy, type Buddy, type ProgramLevel } from "@/lib/data";
import { getUser, type User } from "@/lib/auth";
import { fetchAllProfiles } from "@/lib/profiles";
import { useRequireAuth } from "@/lib/useRequireAuth";

export const Route = createFileRoute("/matches")({
  component: Matches,
  head: () => ({ meta: [{ title: "Matches | First Friend" }] }),
});

type Filters = { campus: string[]; level: ProgramLevel[]; program: string[]; language: string[]; interest: string[]; availability: string[]; support: string[] };
const emptyFilters: Filters = { campus: [], level: [], program: [], language: [], interest: [], availability: [], support: [] };

function Matches() {
  const ready = useRequireAuth();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cloudProfiles, setCloudProfiles] = useState<User[]>([]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    fetchAllProfiles().then((rows) => {
      if (!cancelled) setCloudProfiles(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const scored = useMemo(() => {
    const u = getUser();
    if (!u) return [];
    const q = query.trim().toLowerCase();
    // Combine seeded sample buddies with real signed-up accounts from Lovable Cloud.
    const accountBuddies: Buddy[] = cloudProfiles
      .filter((p) => p.id !== u.id)
      .map(userToBuddy);
    const pool: Buddy[] = [...BUDDIES, ...accountBuddies];
    const seen = new Set<string>();
    const unique = pool.filter((b) => (seen.has(b.id) ? false : (seen.add(b.id), true)));
    return unique.filter((b) => {
      if (q && !b.name.toLowerCase().includes(q)) return false;
      if (filters.campus.length && !filters.campus.includes(b.campus)) return false;
      if (filters.level.length && !filters.level.some((lv) => PROGRAMS_BY_LEVEL[lv].includes(b.program))) return false;
      if (filters.program.length && !filters.program.includes(b.program)) return false;
      if (filters.language.length && !filters.language.some((l) => b.languages.includes(l))) return false;
      if (filters.interest.length && !filters.interest.some((l) => b.interests.includes(l))) return false;
      if (filters.availability.length && !filters.availability.some((l) => b.availability.includes(l))) return false;
      if (filters.support.length && !filters.support.some((l) => b.helpTags.includes(l))) return false;
      return true;
    })
      .map((b) => ({ buddy: b, ...scoreMatch(u, b) }))
      .sort((a, z) => z.score - a.score);
  }, [filters, query, cloudProfiles]);

  if (!ready) return null;
  const u = getUser()!;
  const activeFilterCount = Object.values(filters).reduce((n, v) => n + v.length, 0);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <p className="text-xs uppercase font-bold tracking-widest text-primary">Hi {u.name.split(" ")[0]} 👋</p>
            <h1 className="text-3xl font-extrabold">Your buddy matches</h1>
            <p className="text-muted-foreground">{scored.length} {u.role === "senior-buddy" ? "students" : "seniors"} sorted by compatibility.</p>
          </div>
          <FFButton variant="outline" onClick={() => setOpen(true)}>
            <Icon name="tune" /> Filters {activeFilterCount > 0 && <span className="ml-1 bg-primary text-navy text-xs px-2 rounded-full">{activeFilterCount}</span>}
          </FFButton>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Icon name="search" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search buddies by name…"
            className="w-full pl-10 pr-10 py-3 rounded-lg bg-white border border-border text-navy placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-surface-high flex items-center justify-center text-muted-foreground"
              aria-label="Clear search"
            >
              <Icon name="close" />
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {scored.map(({ buddy, score, reasons, sharedInterests }) => (
            <FFCard key={buddy.id} className="hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar name={buddy.name} src={buddy.avatar} size={64} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-lg leading-tight">{buddy.name}</h3>
                      <p className="text-xs text-muted-foreground">{buddy.program} · {buddy.campus}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-primary leading-none">{score}%</div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Match</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {buddy.languages.slice(0, 3).map((l) => <Tag key={l} tone="primary">{l}</Tag>)}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1.5">Can help with</p>
                  <div className="flex flex-wrap gap-1.5">
                    {buddy.helpTags.map((t) => <Tag key={t} tone="accent">{t}</Tag>)}
                  </div>
                </div>
                {sharedInterests.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1.5">Shared interests</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sharedInterests.map((t) => <Tag key={t}>{t}</Tag>)}
                    </div>
                  </div>
                )}
                <div className="bg-primary-soft/50 rounded-lg p-3 text-sm">
                  <p className="font-bold text-navy text-xs uppercase tracking-widest mb-1">Why this match</p>
                  <ul className="text-navy/80 space-y-0.5">
                    {reasons.slice(0, 3).map((r) => <li key={r}>· {r}</li>)}
                  </ul>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link to="/buddy/$id" params={{ id: buddy.id }} className="flex-1">
                    <FFButton variant="outline" full size="sm">View profile</FFButton>
                  </Link>
                  <Link to="/buddy/$id" params={{ id: buddy.id }} className="flex-1">
                    <FFButton full size="sm">Request match</FFButton>
                  </Link>
                </div>
              </div>
            </FFCard>
          ))}
          {scored.length === 0 && (
            <FFCard className="md:col-span-2 text-center py-12">
              <p className="text-muted-foreground">No buddies match those filters. Try clearing some.</p>
              <FFButton variant="outline" className="mt-4" onClick={() => setFilters(emptyFilters)}>Reset filters</FFButton>
            </FFCard>
          )}
        </div>
      </div>
      {open && <FilterPanel filters={filters} onChange={setFilters} onClose={() => setOpen(false)} />}
    </AppShell>
  );
}

function FilterPanel({ filters, onChange, onClose }: { filters: Filters; onChange: (f: Filters) => void; onClose: () => void }) {
  const [local, setLocal] = useState(filters);
  const toggle = (k: keyof Filters, v: string) =>
    setLocal((p) => {
      const arr = p[k] as string[];
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      const updated = { ...p, [k]: next } as Filters;
      // If level changed, drop any selected programs no longer in those levels
      if (k === "level" && updated.program.length) {
        const allowed = new Set(
          updated.level.length
            ? updated.level.flatMap((lv) => PROGRAMS_BY_LEVEL[lv])
            : Object.values(PROGRAMS_BY_LEVEL).flat()
        );
        updated.program = updated.program.filter((pr) => allowed.has(pr));
      }
      return updated;
    });

  const availablePrograms = local.level.length
    ? local.level.flatMap((lv) => PROGRAMS_BY_LEVEL[lv])
    : [];

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-navy/40" />
      <aside
        className="w-full max-w-md bg-background h-full overflow-y-auto p-6 space-y-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">Filters</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-surface-high flex items-center justify-center">
            <Icon name="close" />
          </button>
        </div>
        <FilterGroup title="Campus" items={CAMPUSES} selected={local.campus} onToggle={(v) => toggle("campus", v)} />
        <FilterGroup title="Level / Type" items={PROGRAM_LEVELS} selected={local.level} onToggle={(v) => toggle("level", v)} />
        {availablePrograms.length > 0 && (
          <FilterGroup title="Program" items={availablePrograms} selected={local.program} onToggle={(v) => toggle("program", v)} />
        )}
        {availablePrograms.length === 0 && (
          <p className="text-xs text-muted-foreground -mt-3">Select a Level / Type above to narrow down programs.</p>
        )}
        <FilterGroup title="Languages" items={LANGUAGES} selected={local.language} onToggle={(v) => toggle("language", v)} />
        <FilterGroup title="Interests" items={INTERESTS} selected={local.interest} onToggle={(v) => toggle("interest", v)} />
        <FilterGroup title="Availability" items={AVAILABILITY} selected={local.availability} onToggle={(v) => toggle("availability", v)} />
        <FilterGroup title="Support type" items={SUPPORT_NEEDS} selected={local.support} onToggle={(v) => toggle("support", v)} />
        <div className="flex gap-3 sticky bottom-0 bg-background pt-4 pb-2">
          <FFButton variant="ghost" full onClick={() => setLocal(emptyFilters)}>Clear all</FFButton>
          <FFButton full onClick={() => { onChange(local); onClose(); }}>Apply</FFButton>
        </div>
      </aside>
    </div>
  );
}

function FilterGroup({ title, items, selected, onToggle }: { title: string; items: readonly string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <p className="text-sm font-bold mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => <Chip key={i} selected={selected.includes(i)} onClick={() => onToggle(i)}>{i}</Chip>)}
      </div>
    </div>
  );
}
