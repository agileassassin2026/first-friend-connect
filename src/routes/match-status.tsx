import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/ff/AppShell";
import { FFCard } from "@/components/ff/FFCard";
import { FFButton } from "@/components/ff/FFButton";
import { Avatar } from "@/components/ff/Avatar";
import { Icon } from "@/components/ff/Icon";
import { Tag } from "@/components/ff/Chip";
import { findBuddy, userToBuddy, type Buddy } from "@/lib/data";
import { fetchProfile } from "@/lib/profiles";
import {
  fetchLatestMatchRequest,
  fetchMatchRequest,
  updateMatchRequestStatus,
} from "@/lib/matchRequests";
import { getMatch, getUser, setMatch, type MatchStatus, type StoredMatch } from "@/lib/auth";
import { useRequireAuth } from "@/lib/useRequireAuth";

export const Route = createFileRoute("/match-status")({
  component: MatchStatus,
  head: () => ({ meta: [{ title: "Match Request | First Friend" }] }),
});

function MatchStatus() {
  const ready = useRequireAuth();
  const navigate = useNavigate();
  const [match, setLocal] = useState(getMatch());
  const [buddy, setBuddy] = useState<Buddy | null | undefined>(undefined);

  useEffect(() => {
    const sync = () => setLocal(getMatch());
    window.addEventListener("ff:match", sync);
    return () => window.removeEventListener("ff:match", sync);
  }, []);

  useEffect(() => {
    if (!ready || match) return;
    const currentUserId = getUser()?.id;
    if (!currentUserId) return;
    fetchLatestMatchRequest(currentUserId).then((request) => {
      if (!request) return;
      const targetProfileId =
        request.requester_id === currentUserId ? request.target_id : request.requester_id;
      const next: StoredMatch = {
        buddyId: `acct:${targetProfileId}`,
        status: request.status,
        requestId: request.id,
      };
      console.log("[match] restored cloud request", {
        currentUserId,
        targetProfileId,
        requestId: request.id,
        status: request.status,
      });
      setMatch(next.buddyId, next.status, next.requestId);
      setLocal(next);
    });
  }, [ready, match]);

  useEffect(() => {
    if (!match) {
      setBuddy(null);
      return;
    }
    const currentUserId = getUser()?.id;
    const seeded = findBuddy(match.buddyId);
    if (seeded) {
      setBuddy(seeded);
      return;
    }
    if (match.requestId && currentUserId) {
      setBuddy(undefined);
      fetchMatchRequest(match.requestId).then((request) => {
        if (!request) {
          setBuddy(null);
          return;
        }
        const targetProfileId =
          request.requester_id === currentUserId ? request.target_id : request.requester_id;
        const buddyId = `acct:${targetProfileId}`;
        console.log("[match] cloud request loaded", {
          currentUserId,
          targetProfileId,
          requestId: request.id,
          status: request.status,
        });
        if (buddyId !== match.buddyId || request.status !== match.status) {
          setMatch(buddyId, request.status, request.id);
          setLocal({ buddyId, status: request.status, requestId: request.id });
        }
        fetchProfile(targetProfileId).then((u) => {
          console.log("[match] profile fetch result", { targetProfileId, found: Boolean(u) });
          setBuddy(u ? userToBuddy(u) : null);
        });
      });
      return;
    }
    if (match.buddyId.startsWith("acct:")) {
      const userId = match.buddyId.slice("acct:".length);
      setBuddy(undefined);
      fetchProfile(userId).then((u) => {
        console.log("[match] profile fetch result", { targetProfileId: userId, found: Boolean(u) });
        setBuddy(u ? userToBuddy(u) : null);
      });
    } else {
      setBuddy(null);
    }
  }, [match]);

  async function setStatus(status: Exclude<MatchStatus, "none">) {
    if (!buddy || !match) return;
    if (match.requestId) {
      const request = await updateMatchRequestStatus(match.requestId, status);
      console.log("[match] status changed", {
        requestId: match.requestId,
        status: request?.status ?? status,
      });
      setMatch(buddy.id, request?.status ?? status, match.requestId);
    } else {
      setMatch(buddy.id, status);
    }
  }

  if (!ready) return null;
  if (!match) {
    return (
      <AppShell>
        <Empty />
      </AppShell>
    );
  }
  if (buddy === undefined) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto p-6 md:p-10">
          <FFCard className="text-center py-12">
            <p className="text-muted-foreground">Loading match…</p>
          </FFCard>
        </div>
      </AppShell>
    );
  }
  if (!buddy) {
    return (
      <AppShell>
        <Empty />
      </AppShell>
    );
  }

  const cfg = {
    pending: {
      icon: "hourglass_top",
      color: "text-accent bg-accent/20",
      title: "Request sent",
      body: `${buddy.name.split(" ")[0]} has been notified. We'll let you know the moment they respond.`,
    },
    accepted: {
      icon: "celebration",
      color: "text-primary bg-primary-soft",
      title: "It's a match!",
      body: `${buddy.name.split(" ")[0]} accepted your request. Time to break the ice.`,
    },
    declined: {
      icon: "info",
      color: "text-muted-foreground bg-surface-high",
      title: "Not this time",
      body: `${buddy.name.split(" ")[0]} isn't available right now. No worries — plenty of other great seniors are waiting.`,
    },
    none: { icon: "search", color: "", title: "", body: "" },
  }[match.status];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-6 md:p-10 space-y-6">
        <FFCard className="text-center space-y-5 py-12">
          <div
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${cfg.color}`}
          >
            <Icon name={cfg.icon} className="text-4xl" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{cfg.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">{cfg.body}</p>
          </div>
          <div className="flex items-center gap-3 justify-center bg-surface-low rounded-2xl p-4 max-w-sm mx-auto">
            <Avatar name={buddy.name} src={buddy.avatar} size={56} />
            <div className="text-left">
              <p className="font-bold">{buddy.name}</p>
              <p className="text-xs text-muted-foreground">
                {buddy.program} · {buddy.campus}
              </p>
            </div>
            <Tag
              tone={
                match.status === "accepted"
                  ? "primary"
                  : match.status === "pending"
                    ? "accent"
                    : "navy"
              }
              className="ml-auto capitalize"
            >
              {match.status}
            </Tag>
          </div>

          {match.status === "pending" && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <FFButton variant="outline" onClick={() => setStatus("accepted")}>
                <Icon name="check" /> Simulate accepted
              </FFButton>
              <FFButton variant="ghost" onClick={() => setStatus("declined")}>
                Simulate declined
              </FFButton>
            </div>
          )}
          {match.status === "accepted" && (
            <FFButton size="lg" onClick={() => navigate({ to: "/chat" })}>
              <Icon name="chat_bubble" /> Open chat
            </FFButton>
          )}
          {match.status === "declined" && (
            <Link to="/matches">
              <FFButton size="lg">Browse more buddies</FFButton>
            </Link>
          )}
        </FFCard>
      </div>
    </AppShell>
  );
}

function Empty() {
  return (
    <div className="max-w-xl mx-auto p-6 md:p-10">
      <FFCard className="text-center py-12 space-y-4">
        <Icon name="search" className="text-5xl text-primary" />
        <h1 className="text-2xl font-extrabold">No match request yet</h1>
        <p className="text-muted-foreground">
          Find a buddy you click with and send your first request.
        </p>
        <Link to="/matches">
          <FFButton>Find a buddy</FFButton>
        </Link>
      </FFCard>
    </div>
  );
}
