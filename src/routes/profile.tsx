import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/ff/AppShell";
import { FFCard } from "@/components/ff/FFCard";
import { FFButton } from "@/components/ff/FFButton";
import { Avatar } from "@/components/ff/Avatar";
import { Tag, Chip } from "@/components/ff/Chip";
import { Icon } from "@/components/ff/Icon";
import { FFInput, FFTextarea, FFSelect } from "@/components/ff/FFInput";
import { getUser, updateUser } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";
import {
  AVAILABILITY,
  BUDDY_STYLES,
  CAMPUSES,
  HELP_OPTIONS,
  INTERESTS,
  LANGUAGES,
  PROGRAMS,
  SUPPORT_NEEDS,
} from "@/lib/data";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile | First Friend" }] }),
});

type Draft = {
  name: string;
  campus: string;
  program: string;
  languages: string[];
  interests: string[];
  helpItems: string[];
  styles: string[];
  availability: string[];
  bio: string;
};

function ProfilePage() {
  const ready = useRequireAuth();
  const u = getUser();
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState(u?.avatar || "");
  const [draft, setDraft] = useState<Draft | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!ready || !u) return null;
  const isBuddy = u.role === "senior-buddy";
  const helpItems = isBuddy ? u.expertise || [] : u.supportNeeds || [];
  const styles = isBuddy ? u.mentoringStyle || [] : u.buddyStyle || [];
  const helpOptions = isBuddy ? HELP_OPTIONS : SUPPORT_NEEDS;

  function startEdit() {
    setDraft({
      name: u!.name || "",
      campus: u!.campus || "",
      program: u!.program || "",
      languages: [...(u!.languages || [])],
      interests: [...(u!.interests || [])],
      helpItems: [...helpItems],
      styles: [...styles],
      availability: [...(u!.availability || [])],
      bio: u!.bio || "",
    });
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(null);
    setEditing(false);
  }

  function save() {
    if (!draft) return;
    updateUser({
      name: draft.name,
      campus: draft.campus,
      program: draft.program,
      languages: draft.languages,
      interests: draft.interests,
      availability: draft.availability,
      bio: draft.bio,
      ...(isBuddy
        ? { expertise: draft.helpItems, mentoringStyle: draft.styles }
        : { supportNeeds: draft.helpItems, buddyStyle: draft.styles }),
    });
    setDraft(null);
    setEditing(false);
  }

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setAvatar(dataUrl);
      updateUser({ avatar: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const toggle = (key: keyof Draft, val: string) =>
    setDraft((d) =>
      d
        ? {
            ...d,
            [key]: (d[key] as string[]).includes(val)
              ? (d[key] as string[]).filter((x) => x !== val)
              : [...(d[key] as string[]), val],
          }
        : d,
    );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Your profile</h1>
            <p className="text-muted-foreground">Auto-generated from your sign-up and onboarding answers.</p>
          </div>
          <div className="flex gap-2">
            {editing && (
              <FFButton variant="ghost" onClick={cancelEdit}>
                <Icon name="close" /> Cancel
              </FFButton>
            )}
            <FFButton variant={editing ? "navy" : "outline"} onClick={() => (editing ? save() : startEdit())}>
              <Icon name={editing ? "check" : "edit"} /> {editing ? "Save" : "Edit"}
            </FFButton>
          </div>
        </div>

        <FFCard className="p-0 overflow-hidden">
          <div className="px-6 md:px-8 pt-6 pb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative">
                <Avatar name={u.name} src={avatar} size={96} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Change photo"
                  className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center shadow-card hover:opacity-90"
                >
                  <Icon name="photo_camera" className="text-base" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={onPickPhoto}
                />
              </div>
              <div className="flex-1">
                {editing && draft ? (
                  <FFInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                ) : (
                  <h2 className="text-2xl font-extrabold">{u.name}</h2>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Tag tone="primary">{isBuddy ? "Senior Buddy" : "New Student"}</Tag>
                  {!editing && (
                    <>
                      <Tag><Icon name="location_on" className="text-xs mr-1" />{u.campus}</Tag>
                      <Tag><Icon name="school" className="text-xs mr-1" />{u.program}</Tag>
                    </>
                  )}
                </div>
              </div>
              {!isBuddy && !editing && (
                <Link to="/matches"><FFButton>Find a buddy <Icon name="arrow_forward" /></FFButton></Link>
              )}
            </div>

            {editing && draft && (
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <FFSelect label="Campus" value={draft.campus} onChange={(e) => setDraft({ ...draft, campus: e.target.value })}>
                  <option value="">Select campus</option>
                  {CAMPUSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </FFSelect>
                <FFSelect label="Program" value={draft.program} onChange={(e) => setDraft({ ...draft, program: e.target.value })}>
                  <option value="">Select program</option>
                  {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </FFSelect>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Section icon="translate" title="Languages">
                {editing && draft ? (
                  <ChipPicker options={LANGUAGES} selected={draft.languages} onToggle={(v) => toggle("languages", v)} />
                ) : (
                  <div className="flex flex-wrap gap-2">{u.languages.map((l) => <Tag key={l} tone="primary">{l}</Tag>)}</div>
                )}
              </Section>
              <Section icon="interests" title="Interests">
                {editing && draft ? (
                  <ChipPicker options={INTERESTS} selected={draft.interests} onToggle={(v) => toggle("interests", v)} />
                ) : (
                  <div className="flex flex-wrap gap-2">{(u.interests || []).map((l) => <Tag key={l}>{l}</Tag>)}</div>
                )}
              </Section>
              <Section icon={isBuddy ? "volunteer_activism" : "support"} title={isBuddy ? "Can help with" : "Looking for help with"}>
                {editing && draft ? (
                  <ChipPicker options={helpOptions} selected={draft.helpItems} onToggle={(v) => toggle("helpItems", v)} />
                ) : (
                  <div className="flex flex-wrap gap-2">{helpItems.map((l) => <Tag key={l} tone="accent">{l}</Tag>)}</div>
                )}
              </Section>
              <Section icon="psychology" title={isBuddy ? "Mentoring style" : "Buddy style"}>
                {editing && draft ? (
                  <ChipPicker options={BUDDY_STYLES} selected={draft.styles} onToggle={(v) => toggle("styles", v)} />
                ) : (
                  <div className="flex flex-wrap gap-2">{styles.map((l) => <Tag key={l}>{l}</Tag>)}</div>
                )}
              </Section>
              <Section icon="schedule" title="Availability">
                {editing && draft ? (
                  <ChipPicker options={AVAILABILITY} selected={draft.availability} onToggle={(v) => toggle("availability", v)} />
                ) : (
                  <div className="flex flex-wrap gap-2">{(u.availability || []).map((l) => <Tag key={l}>{l}</Tag>)}</div>
                )}
              </Section>
            </div>

            <Section icon="auto_stories" title="About me" className="mt-6">
              {editing && draft ? (
                <FFTextarea value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
              ) : (
                <p className="text-muted-foreground italic">{u.bio || "Add a short bio so your buddy gets to know you."}</p>
              )}
            </Section>
          </div>
        </FFCard>
      </div>
    </AppShell>
  );
}

function ChipPicker({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} selected={selected.includes(o)} onClick={() => onToggle(o)}>{o}</Chip>
      ))}
    </div>
  );
}

function Section({ icon, title, children, className }: { icon: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Icon name={icon} className="text-primary" />
        <h3 className="font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
