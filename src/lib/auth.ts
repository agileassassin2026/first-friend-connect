// Mock auth + data layer using localStorage
export type Role = "new-student" | "senior-buddy";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  campus: string;
  program: string;
  languages: string[];
  // onboarding
  supportNeeds?: string[];
  expertise?: string[];
  emotionalState?: string;
  interests?: string[];
  buddyStyle?: string[];
  mentoringStyle?: string[];
  availability?: string[];
  capacity?: number;
  bio?: string;
  avatar?: string;
  onboarded?: boolean;
};

const USER_KEY = "ff_user";
const STREAK_KEY = "ff_streak";
const MATCH_KEY = "ff_match";
const ACCOUNTS_KEY = "ff_accounts";

type Accounts = Record<string, User>;

function readAccounts(): Accounts {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  return raw ? JSON.parse(raw) : {};
}
function writeAccounts(a: Accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a));
}
export function findAccountByEmail(email: string): User | null {
  if (typeof window === "undefined" || !email) return null;
  const accounts = readAccounts();
  return accounts[email.toLowerCase()] ?? null;
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(u: User | null) {
  if (typeof window === "undefined") return;
  if (u) {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    if (u.email) {
      const accounts = readAccounts();
      accounts[u.email.toLowerCase()] = u;
      writeAccounts(accounts);
    }
  } else {
    localStorage.removeItem(USER_KEY);
  }
  window.dispatchEvent(new Event("ff:user"));
}

export function updateUser(patch: Partial<User>) {
  const cur = getUser();
  if (!cur) return;
  setUser({ ...cur, ...patch });
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(MATCH_KEY);
  localStorage.removeItem(STREAK_KEY);
  window.dispatchEvent(new Event("ff:user"));
}

export type MatchStatus = "none" | "pending" | "accepted" | "declined";
export function getMatch(): { buddyId: string; status: MatchStatus } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(MATCH_KEY);
  return raw ? JSON.parse(raw) : null;
}
export function setMatch(buddyId: string, status: MatchStatus) {
  localStorage.setItem(MATCH_KEY, JSON.stringify({ buddyId, status }));
  window.dispatchEvent(new Event("ff:match"));
}

export type StreakState = {
  completed: string[]; // action ids
  startedAt: string;
};
export function getStreak(): StreakState {
  if (typeof window === "undefined") return { completed: [], startedAt: new Date().toISOString() };
  const raw = localStorage.getItem(STREAK_KEY);
  if (raw) return JSON.parse(raw);
  const init = { completed: [], startedAt: new Date().toISOString() };
  localStorage.setItem(STREAK_KEY, JSON.stringify(init));
  return init;
}
export function completeStreakAction(id: string) {
  const s = getStreak();
  if (!s.completed.includes(id)) s.completed.push(id);
  localStorage.setItem(STREAK_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("ff:streak"));
}
