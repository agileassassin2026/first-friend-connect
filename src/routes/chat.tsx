import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/ff/AppShell";
import { FFCard } from "@/components/ff/FFCard";
import { FFButton } from "@/components/ff/FFButton";
import { Avatar } from "@/components/ff/Avatar";
import { Icon } from "@/components/ff/Icon";
import { Tag } from "@/components/ff/Chip";
import { findBuddy, userToBuddy, type Buddy } from "@/lib/data";
import { getMatch, getUser, setMatch, completeStreakAction, type StoredMatch } from "@/lib/auth";
import { fetchLatestMatchRequest } from "@/lib/matchRequests";
import { fetchProfile } from "@/lib/profiles";
import { useRequireAuth } from "@/lib/useRequireAuth";

export const Route = createFileRoute("/chat")({
  component: Chat,
  head: () => ({ meta: [{ title: "Chat | First Friend" }] }),
});

type Msg = { id: string; from: "me" | "buddy"; text: string; at: string };

const ICEBREAKERS = [
  "What should I do during my first week?",
  "Can you explain how housing or admin steps work?",
  "What clubs or student activities do you recommend?",
];

function Chat() {
  const ready = useRequireAuth();
  const [match, setLocalMatch] = useState(getMatch());
  const [buddy, setBuddy] = useState<Buddy | null | undefined>(undefined);
  const accepted = match?.status === "accepted";
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [showReport, setShowReport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setLocalMatch(getMatch());
    window.addEventListener("ff:match", sync);
    return () => window.removeEventListener("ff:match", sync);
  }, []);

  useEffect(() => {
    if (!ready || match) return;
    const currentUserId = getUser()?.id;
    if (!currentUserId) return;
    fetchLatestMatchRequest(currentUserId).then((request) => {
      if (!request) return;
      const targetProfileId = request.requester_id === currentUserId ? request.target_id : request.requester_id;
      const next: StoredMatch = { buddyId: `acct:${targetProfileId}`, status: request.status, requestId: request.id };
      console.log("[chat] restored cloud match", { currentUserId, targetProfileId, requestId: request.id, status: request.status });
      setMatch(next.buddyId, next.status, next.requestId);
      setLocalMatch(next);
    });
  }, [ready, match]);

  useEffect(() => {
    if (!match) { setBuddy(null); return; }
    const seeded = findBuddy(match.buddyId);
    if (seeded) { setBuddy(seeded); return; }
    if (match.buddyId.startsWith("acct:")) {
      const targetProfileId = match.buddyId.slice("acct:".length);
      setBuddy(undefined);
      fetchProfile(targetProfileId).then((u) => {
        console.log("[chat] profile fetch result", { targetProfileId, found: Boolean(u), status: match.status });
        setBuddy(u ? userToBuddy(u) : null);
      });
    } else {
      setBuddy(null);
    }
  }, [match]);

  useEffect(() => {
    if (accepted && buddy && messages.length === 0) {
      setMessages([
        { id: "1", from: "buddy", text: `Hey! So happy we matched 🎉 I'm ${buddy.name.split(" ")[0]}, ask me anything.`, at: "now" },
      ]);
    }
  }, [accepted, buddy, messages.length]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [messages]);

  if (!ready) return null;
  const user = getUser()!;

  function send(text: string) {
    if (!text.trim()) return;
    const isFirst = messages.filter((m) => m.from === "me").length === 0;
    setMessages((m) => [...m, { id: Date.now().toString(), from: "me", text, at: "now" }]);
    setInput("");
    if (isFirst) completeStreakAction("message");
    completeStreakAction("question");
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now() + "b", from: "buddy", text: "Great question! Let me think about that and get back to you 💬", at: "now" }]);
    }, 900);
  }

  if (!buddy || !accepted) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto p-6 md:p-10">
          <FFCard className="text-center py-12 space-y-4">
            <Icon name="lock" className="text-5xl text-muted-foreground" />
            <h1 className="text-2xl font-extrabold">Chat unlocks after a match</h1>
            <p className="text-muted-foreground">Once a senior buddy accepts your request, you'll be able to chat here.</p>
            <Link to={match ? "/match-status" : "/matches"}><FFButton>{match ? "Check status" : "Find a buddy"}</FFButton></Link>
          </FFCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-4 md:p-6 h-[calc(100vh-80px)] md:h-screen flex flex-col">
        {/* Header */}
        <FFCard className="flex items-center gap-3 p-4">
          <Avatar name={buddy.name} src={buddy.avatar} size={48} />
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold leading-tight">{buddy.name}</h2>
            <p className="text-xs text-muted-foreground truncate">{buddy.program} · {buddy.campus}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {buddy.helpTags.slice(0, 3).map((t) => <Tag key={t} tone="primary">{t}</Tag>)}
            </div>
          </div>
          <button onClick={() => setShowReport(true)} className="w-10 h-10 rounded-full hover:bg-surface-high flex items-center justify-center" title="Report">
            <Icon name="flag" />
          </button>
        </FFCard>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"} gap-2`}>
              {m.from === "buddy" && <Avatar name={buddy.name} src={buddy.avatar} size={32} />}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${m.from === "me" ? "bg-primary text-navy rounded-br-sm" : "bg-white border border-border text-navy rounded-bl-sm"}`}>
                {m.text}
              </div>
              {m.from === "me" && <Avatar name={user.name} src={user.avatar} size={32} />}
            </div>
          ))}
        </div>

        {/* Icebreakers */}
        {messages.filter((m) => m.from === "me").length === 0 && (
          <div className="space-y-2 mb-3">
            <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Icebreakers</p>
            <div className="flex flex-wrap gap-2">
              {ICEBREAKERS.map((q) => (
                <button key={q} onClick={() => send(q)} className="text-left px-3 py-2 bg-primary-soft hover:bg-primary text-navy rounded-xl text-sm font-semibold transition">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message…"
            className="flex-1 px-4 py-3 rounded-lg bg-white border border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
          />
          <FFButton type="submit" disabled={!input.trim()}><Icon name="send" /></FFButton>
        </form>
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-navy/40 z-50 flex items-center justify-center p-4" onClick={() => setShowReport(false)}>
          <FFCard className="max-w-sm w-full text-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <Icon name="shield" className="text-4xl text-coral mx-auto" />
            <h3 className="text-xl font-extrabold">Report this conversation?</h3>
            <p className="text-sm text-muted-foreground">We'll review it within 24h. You'll also be unmatched.</p>
            <div className="flex gap-2">
              <FFButton variant="ghost" full onClick={() => setShowReport(false)}>Cancel</FFButton>
              <FFButton variant="coral" full onClick={() => { setShowReport(false); alert("Report submitted. Thank you."); }}>Submit report</FFButton>
            </div>
          </FFCard>
        </div>
      )}
    </AppShell>
  );
}
