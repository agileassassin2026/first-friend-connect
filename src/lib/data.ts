import type { User } from "./auth";

export type Buddy = {
  id: string;
  name: string;
  avatar: string;
  campus: string;
  program: string;
  languages: string[];
  helpTags: string[];
  interests: string[];
  mentoringStyle: string[];
  availability: string[];
  bio: string;
};

export const CAMPUSES = ["Lille", "Paris"];
export const PROGRAM_LEVELS = [
  "Bachelor",
  "Master",
  "MBA",
  "Executive Master",
  "Doctoral Program",
  "Summer Program",
] as const;
export type ProgramLevel = (typeof PROGRAM_LEVELS)[number];

export const PROGRAMS_BY_LEVEL: Record<ProgramLevel, string[]> = {
  Bachelor: [
    "Bachelor Cycle (Grande École)",
    "Bachelor in International Business",
    "Bachelor in Management and Tech Design",
  ],
  Master: [
    "Master Cycle (Grande École)",
    "Master in Fashion Management",
    "Master in International Business — MIB",
    "Master in Strategy & Digital Transformation",
    "Master in Finance",
    "Master in International Accounting, Audit & Control",
    "Master in Digital Marketing & Customer Experience Management",
    "Master in AI & Data Analytics for Business",
    "Master in Business Analysis & Consulting",
    "Master in Cybersecurity Management",
    "Master in Management for Sustainability",
  ],
  MBA: ["Global MBA"],
  "Executive Master": [
    "Executive Program in Financial Management",
    "Executive Program in Marketing and Digitalization",
    "Executive Program in Commercial Management and Business Development",
    "Executive Program in Human Development and Transformation Management",
  ],
  "Doctoral Program": [
    "Joint IÉSEG / KU Leuven Doctoral Program in Business Economics",
    "PhD Program with the University of Lille",
  ],
  "Summer Program": [
    "Digital Marketing Summer Program",
    "Fashion Business Summer Program",
    "Artificial Intelligence & Sustainability Summer Program",
    "International Summer Academy",
  ],
};

export const PROGRAMS = [...new Set(PROGRAM_LEVELS.flatMap((l) => [...PROGRAMS_BY_LEVEL[l], "Other"]))];
export const LANGUAGES = ["English", "French", "Spanish", "Mandarin", "German", "Portuguese", "Italian", "Vietnamese", "Other"];

export const SUPPORT_NEEDS = [
  "Housing",
  "Academic help",
  "Administration",
  "Social life",
  "French culture",
  "Emotional support",
  "Language practice",
  "Other",
];
export const HELP_OPTIONS = [
  "Academic help",
  "Admin procedures",
  "Housing",
  "French culture",
  "Social life",
  "Language practice",
  "Campus life",
  "Other",
];
export const EMOTIONAL_STATES = ["Excited", "Nervous", "Overwhelmed", "Lonely", "Curious", "Confident", "Prefer not to say"];
export const BUDDY_STYLES = [
  "Patient and calm",
  "Social and outgoing",
  "Practical and organized",
  "Academic-focused",
  "International-student experienced",
  "Relaxed and friendly",
  "Proactive",
];
export const INTERESTS = [
  "Sports",
  "Music",
  "Photography",
  "Travel",
  "Cooking",
  "Gaming",
  "Reading",
  "Volunteering",
  "Tech",
  "Entrepreneurship",
  "Art",
  "Fashion",
  "Other",
];
export const AVAILABILITY = ["Weekday mornings", "Weekday evenings", "Weekends", "Flexible", "Other"];

export const BUDDIES: Buddy[] = [
  {
    id: "b1",
    name: "Camille Laurent",
    avatar: "https://i.pravatar.cc/200?img=47",
    campus: "Lille",
    program: "Master in International Business — MIB",
    languages: ["French", "English", "Spanish"],
    helpTags: ["French culture", "Admin procedures", "Social life"],
    interests: ["Travel", "Photography", "Cooking"],
    mentoringStyle: ["Patient and calm", "Relaxed and friendly"],
    availability: ["Weekday evenings", "Weekends"],
    bio: "M2 student, lived in Lille all my life. Happy to help you settle in, find a flat, and discover the best brunch spots.",
  },
  {
    id: "b2",
    name: "Arjun Mehta",
    avatar: "https://i.pravatar.cc/200?img=12",
    campus: "Paris",
    program: "Master in AI & Data Analytics for Business",
    languages: ["English", "French"],
    helpTags: ["Academic help", "Campus life", "Language practice"],
    interests: ["Tech", "Gaming", "Entrepreneurship"],
    mentoringStyle: ["Academic-focused", "Proactive"],
    availability: ["Weekday evenings", "Flexible"],
    bio: "Originally from Mumbai, second year at IÉSEG Paris. I love helping international students survive their first stats class.",
  },
  {
    id: "b3",
    name: "Sofía García",
    avatar: "https://i.pravatar.cc/200?img=32",
    campus: "Lille",
    program: "Master Cycle (Grande École)",
    languages: ["Spanish", "English", "French"],
    helpTags: ["Social life", "French culture", "Housing"],
    interests: ["Music", "Volunteering", "Art"],
    mentoringStyle: ["Social and outgoing", "International-student experienced"],
    availability: ["Weekends", "Flexible"],
    bio: "Exchange-student-turned-IÉSEG-regular. Ask me anything about clubs, parties, or the CAF paperwork nightmare.",
  },
  {
    id: "b4",
    name: "Théo Dubois",
    avatar: "https://i.pravatar.cc/200?img=15",
    campus: "Paris",
    program: "Master in Finance",
    languages: ["French", "English"],
    helpTags: ["Academic help", "Admin procedures"],
    interests: ["Reading", "Sports", "Tech"],
    mentoringStyle: ["Practical and organized", "Academic-focused"],
    availability: ["Weekday mornings", "Weekday evenings"],
    bio: "Final-year Finance student. I keep things structured and will help you build a study routine that actually works.",
  },
  {
    id: "b5",
    name: "Linh Nguyen",
    avatar: "https://i.pravatar.cc/200?img=45",
    campus: "Lille",
    program: "Master in Digital Marketing & Customer Experience Management",
    languages: ["Vietnamese", "English", "French"],
    helpTags: ["Language practice", "Emotional support", "Social life"],
    interests: ["Fashion", "Photography", "Travel"],
    mentoringStyle: ["Patient and calm", "International-student experienced", "Relaxed and friendly"],
    availability: ["Weekends", "Flexible"],
    bio: "I moved from Hanoi two years ago. I know exactly how lonely week 1 can feel — let's make yours easier.",
  },
  {
    id: "b6",
    name: "Lucas Moreau",
    avatar: "https://i.pravatar.cc/200?img=68",
    campus: "Paris",
    program: "Bachelor in International Business",
    languages: ["French", "English", "German"],
    helpTags: ["Campus life", "Housing", "Academic help"],
    interests: ["Sports", "Gaming", "Entrepreneurship"],
    mentoringStyle: ["Proactive", "Social and outgoing"],
    availability: ["Weekday evenings", "Weekends"],
    bio: "Bachelor 3, association president. I'll plug you straight into the IÉSEG community from day one.",
  },
];

export function findBuddy(id: string) {
  return BUDDIES.find((b) => b.id === id);
}

export function scoreMatch(user: User, buddy: Buddy) {
  let score = 0;
  let reasons: string[] = [];
  if (user.campus && user.campus === buddy.campus) {
    score += 25;
    reasons.push(`Same campus (${buddy.campus})`);
  }
  const sharedLangs = (user.languages || []).filter((l) => buddy.languages.includes(l));
  if (sharedLangs.length) {
    score += Math.min(20, sharedLangs.length * 10);
    reasons.push(`Speaks ${sharedLangs.join(", ")}`);
  }
  const needs = user.supportNeeds || [];
  const matchedNeeds = needs.filter((n) => buddy.helpTags.includes(n) || buddy.helpTags.includes(n.replace(/s$/, "")));
  if (matchedNeeds.length) {
    score += Math.min(25, matchedNeeds.length * 10);
    reasons.push(`Can help with ${matchedNeeds.slice(0, 2).join(" & ")}`);
  }
  const sharedInterests = (user.interests || []).filter((i) => buddy.interests.includes(i));
  if (sharedInterests.length) {
    score += Math.min(15, sharedInterests.length * 5);
    reasons.push(`Shared interest: ${sharedInterests[0]}`);
  }
  const styles = user.buddyStyle || [];
  const sharedStyles = styles.filter((s) => buddy.mentoringStyle.includes(s));
  if (sharedStyles.length) {
    score += Math.min(15, sharedStyles.length * 8);
    reasons.push(`${sharedStyles[0]} energy`);
  }
  // baseline so cards never look empty
  score = Math.max(score + 35, 55);
  score = Math.min(score, 98);
  return {
    score,
    reasons: reasons.length ? reasons : ["Strong community fit based on your profile"],
    sharedInterests,
    sharedLangs,
  };
}
