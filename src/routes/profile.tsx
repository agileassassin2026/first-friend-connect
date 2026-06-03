import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/ff/AppShell";
import { FFCard } from "@/components/ff/FFCard";
import { FFButton } from "@/components/ff/FFButton";
import { Avatar } from "@/components/ff/Avatar";
import { Tag } from "@/components/ff/Chip";
import { Icon } from "@/components/ff/Icon";
import { FFInput, FFTextarea } from "@/components/ff/FFInput";
import { getUser, updateUser } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile | First Friend" }] }),
});

function ProfilePage() {
  const ready = useRequireAuth();
  const [editing, setEditing] = useState(false);
  const u = getUser();
  const [name, setName] = useState(u?.name || "");
  const [bio, setBio] = useState(u?.bio || "");
  const [avatar, setAvatar] = useState(u?.avatar || "");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!ready || !u) return null;
  const isBuddy = u.role === "senior-buddy";
  const helpItems = isBuddy ? u.expertise || [] : u.supportNeeds || [];
  const styles = isBuddy ? u.mentoringStyle || [] : u.buddyStyle || [];

  function save() {
    updateUser({ name, bio });
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

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Your profile</h1>
            <p className="text-muted-foreground">Auto-generated from your sign-up and onboarding answers.</p>
          </div>
          <FFButton variant={editing ? "navy" : "outline"} onClick={() => (editing ? save() : setEditing(true))}>
            <Icon name={editing ? "check" : "edit"} /> {editing ? "Save" : "Edit"}
          </FFButton>
        </div>

        <FFCard className="p-0 overflow-hidden">
          <div className="px-6 md:px-8 pt-6 pb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Avatar name={u.name} src={u.avatar} size={96} />
              <div className="flex-1">
                {editing ? (
                  <FFInput value={name} onChange={(e) => setName(e.target.value)} />
                ) : (
                  <h2 className="text-2xl font-extrabold">{u.name}</h2>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Tag tone="primary">{isBuddy ? "Senior Buddy" : "New Student"}</Tag>
                  <Tag><Icon name="location_on" className="text-xs mr-1" />{u.campus}</Tag>
                  <Tag><Icon name="school" className="text-xs mr-1" />{u.program}</Tag>
                </div>
              </div>
              {!isBuddy && (
                <Link to="/matches"><FFButton>Find a buddy <Icon name="arrow_forward" /></FFButton></Link>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Section icon="translate" title="Languages">
                <div className="flex flex-wrap gap-2">{u.languages.map((l) => <Tag key={l} tone="primary">{l}</Tag>)}</div>
              </Section>
              <Section icon="interests" title="Interests">
                <div className="flex flex-wrap gap-2">{(u.interests || []).map((l) => <Tag key={l}>{l}</Tag>)}</div>
              </Section>
              <Section icon={isBuddy ? "volunteer_activism" : "support"} title={isBuddy ? "Can help with" : "Looking for help with"}>
                <div className="flex flex-wrap gap-2">{helpItems.map((l) => <Tag key={l} tone="accent">{l}</Tag>)}</div>
              </Section>
              <Section icon="psychology" title={isBuddy ? "Mentoring style" : "Buddy style"}>
                <div className="flex flex-wrap gap-2">{styles.map((l) => <Tag key={l}>{l}</Tag>)}</div>
              </Section>
            </div>

            <Section icon="auto_stories" title="About me" className="mt-6">
              {editing ? (
                <FFTextarea value={bio} onChange={(e) => setBio(e.target.value)} />
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
