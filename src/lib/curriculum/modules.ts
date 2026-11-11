// Original instructional content written for Troop 99. It maps to the sections of the
// "Programming Merit Badge Workbook" (US Scouting Service Project, Jan 2024) and the 2025
// Programming pamphlet by requirement number only. No text is copied from either source.

export type LessonCard = { title: string; body: string[]; tip?: string };

export type Question = {
  id: string; // stable key used in the database, e.g. "1a.q1"
  req: string; // workbook requirement, e.g. "1a"
  prompt: string;
  help?: string;
  rows?: number;
};

export type Signoff = { id: string; req: string; label: string };

export type Module = {
  id: string;
  number: number;
  title: string;
  summary: string;
  reqs: string[];
  lesson: LessonCard[];
  questions: Question[];
  signoffs: Signoff[];
  codeLab?: boolean;
};

export const MODULES: Module[] = [
  {
    id: "m1",
    number: 1,
    title: "Safety at the Keyboard",
    summary: "Staying safe online and keeping your eyes, hands and body healthy while you code.",
    reqs: ["1a", "1b"],
    lesson: [
      {
        title: "Why we start with safety",
        body: [
          "Programmers spend a lot of time online and in front of screens. Before you write any code, you and a parent or guardian should agree on how you will use the internet safely.",
          "Your troop counselor will confirm that your parent or guardian gave permission and that you watched an age-appropriate digital safety video together. This app never asks for your family's names or contact details.",
        ],
        tip: "Ask yourself: Would I be comfortable if my parent saw what I'm doing online right now?",
      },
      {
        title: "Smart online habits",
        body: [
          "Keep private information private: your full name, address, school, phone number, passwords and photos of yourself.",
          "Never agree to meet someone you only know online. If something makes you uncomfortable, stop and tell a trusted adult right away. That is never 'getting in trouble' — it is being smart.",
          "Only download programs or code from places your parent or counselor has approved. Unknown downloads can hide malware.",
        ],
      },
      {
        title: "Your body matters too",
        body: [
          "Eyestrain happens when your eyes focus on a screen too long. Try the 20-20-20 rule: every 20 minutes, look at something about 20 feet away for 20 seconds. Blink often, and keep the screen about an arm's length away with good lighting.",
          "Repetitive stress comes from doing the same small motion (typing, clicking) many times. Keep wrists straight, shoulders relaxed, and take a short stretch break.",
          "Other concerns: sitting too long, poor posture, staying up late on screens, and tripping over cords. First aid is usually simple: rest, stretch, adjust your setup, and tell an adult if pain continues.",
        ],
        tip: "Our Tuesday sessions are 30 minutes — a perfect length to stand and stretch at the end!",
      },
    ],
    questions: [
      { id: "1a.q1", req: "1a", prompt: "In your own words, name three pieces of personal information you should never share online, and why.", rows: 4 },
      { id: "1a.q2", req: "1a", prompt: "After watching a digital safety video with your parent or guardian, what is one thing you talked about together?", help: "Your counselor will also check this off in person during a discussion.", rows: 4 },
      { id: "1a.q3", req: "1a", prompt: "What would you do if someone online asked you to keep a secret from your parents?", rows: 3 },
      { id: "1b.q1", req: "1b", prompt: "Explain how to prevent eyestrain and what to do if your eyes start to feel tired.", rows: 4 },
      { id: "1b.q2", req: "1b", prompt: "What is a repetitive stress injury? Describe two ways to prevent it.", rows: 4 },
      { id: "1b.q3", req: "1b", prompt: "Name one other computer-related health or safety concern and the first aid or prevention for it.", rows: 3 },
    ],
    signoffs: [
      { id: "1a.permission", req: "1a", label: "Parent/guardian permission and safety video confirmed (discussed with counselor)" },
      { id: "1b.discussion", req: "1b", label: "Discussed prevention and first aid for computer-related injuries" },
    ],
  },
  {
    id: "m2",
    number: 2,
    title: "History of Programming",
    summary: "From looms and punch cards to the languages we use today.",
    reqs: ["2a", "2b"],
    lesson: [
      {
        title: "Instructions before electronics",
        body: [
          "Long before electronic computers, people built machines that followed instructions. In the early 1800s, weaving looms used cards with holes to control patterns — an early idea of 'stored instructions'.",
          "In the 1840s, Ada Lovelace wrote notes describing how a proposed calculating engine could follow a sequence of steps. Many people call her the first computer programmer.",
        ],
      },
      {
        title: "The electronic age",
        body: [
          "In the 1940s, large electronic computers were programmed by flipping switches and plugging cables. Later, programs were stored in memory, which made changing them much faster.",
          "Grace Hopper helped create one of the first compilers — a program that turns human-friendly words into machine instructions. She also popularized the word 'debugging'.",
          "Personal computers in the 1970s–80s, the World Wide Web in the 1990s, and smartphones in the 2000s each brought programming to more people.",
        ],
      },
      {
        title: "How languages evolved",
        body: [
          "Machine code is just numbers the processor understands. Assembly language gave those numbers short names.",
          "High-level languages like FORTRAN and COBOL (1950s) let people write closer to math and English. Later languages like C, Java, Python and JavaScript added new ideas: structure, objects, safety and easier reading.",
          "Today, block-based languages like Scratch let beginners build programs by snapping pieces together — the ideas are the same as typed code.",
        ],
        tip: "A good history answer says WHAT happened, roughly WHEN, and WHY it mattered.",
      },
    ],
    questions: [
      { id: "2a.q1", req: "2a", prompt: "Historical milestone #1: What happened, about when, and why was it important?", rows: 4 },
      { id: "2a.q2", req: "2a", prompt: "Historical milestone #2: What happened, about when, and why was it important?", rows: 4 },
      { id: "2a.q3", req: "2a", prompt: "Historical milestone #3: What happened, about when, and why was it important?", rows: 4 },
      { id: "2b.q1", req: "2b", prompt: "Describe how programming languages have changed from machine code to modern languages. What problems did each change solve?", rows: 6 },
    ],
    signoffs: [{ id: "2.discussion", req: "2a-2b", label: "Discussed history and evolution of programming with counselor" }],
  },
  {
    id: "m3",
    number: 3,
    title: "Languages & Programmed Devices",
    summary: "Different languages for different jobs — and the hidden code in everyday things.",
    reqs: ["3a", "3b"],
    lesson: [
      {
        title: "Why so many languages?",
        body: [
          "Just like a toolbox has hammers and screwdrivers, programmers pick languages that fit the job.",
          "Python is popular in science, data and education because it is easy to read. JavaScript runs inside web browsers. C and C++ are used where speed matters, like games and car systems. Java and Kotlin power many business systems and Android apps. SQL is used to ask questions of databases. Lua is small and often built into games and devices.",
        ],
      },
      {
        title: "Code is everywhere",
        body: [
          "A programmed device is any machine whose behavior is controlled by software. Microwaves, traffic lights, game consoles, smart watches, cars and thermostats all run code.",
          "Think about what the device senses (input), what choices it makes (decisions) and what it does (output). That pattern will come back in Module 5!",
        ],
        tip: "Look around your kitchen tonight and count the devices that have buttons and a display.",
      },
    ],
    questions: [
      { id: "3a.q1", req: "3a", prompt: "List five programming languages. For each one, name an industry that uses it and why it fits that job.", help: "Example format: Language — Industry — Reason", rows: 8 },
      { id: "3b.q1", req: "3b", prompt: "Programmed device #1: What is it, and what does its code help it do?", rows: 3 },
      { id: "3b.q2", req: "3b", prompt: "Programmed device #2: What is it, and what does its code help it do?", rows: 3 },
      { id: "3b.q3", req: "3b", prompt: "Programmed device #3: What is it, and what does its code help it do?", rows: 3 },
    ],
    signoffs: [],
  },
  {
    id: "m4",
    number: 4,
    title: "Intellectual Property",
    summary: "Who owns ideas and code, and how to respect software licenses.",
    reqs: ["4a", "4b", "4c"],
    lesson: [
      {
        title: "Four kinds of intellectual property",
        body: [
          "Intellectual property (IP) protects creations of the mind.",
          "Copyright protects original creative works such as code, books, music and art. Patents protect new inventions or processes. Trademarks protect names, logos and slogans that identify a brand. Trade secrets are valuable information a company keeps private, like a secret recipe or algorithm.",
        ],
      },
      {
        title: "Licensing vs. owning",
        body: [
          "When you 'buy' most software, you usually do not own the code. You get a license — permission to use it under certain rules. The author keeps ownership.",
          "Owning something means you control it. Licensing means you follow someone else's rules about copying, sharing or changing it.",
        ],
      },
      {
        title: "Free, open and commercial",
        body: [
          "Freeware costs nothing to use, but you usually cannot see or change its code. Open-source software shares its code and lets people study, change and share it, following its license. Commercial software is sold for money and has its own license terms.",
          "Respecting licenses means not copying paid software for friends, giving credit when a license asks for it, and reading the rules before reusing someone's code.",
        ],
        tip: "Scratch projects are shared under a license that lets others remix them — with credit!",
      },
    ],
    questions: [
      { id: "4a.q1", req: "4a", prompt: "Explain the four types of intellectual property in your own words, with an example of each.", rows: 7 },
      { id: "4b.q1", req: "4b", prompt: "What is the difference between licensing software and owning it?", rows: 4 },
      { id: "4c.q1", req: "4c", prompt: "Compare freeware, open-source and commercial software. Give an example of each if you can.", rows: 5 },
      { id: "4c.q2", req: "4c", prompt: "Why is it important to respect software licenses? Describe one way you will do that.", rows: 4 },
    ],
    signoffs: [{ id: "4.discussion", req: "4a-4c", label: "Discussed intellectual property and licensing with counselor" }],
  },
  {
    id: "m5",
    number: 5,
    title: "Write Real Programs",
    summary: "Modify and debug a Scratch project, then write programs in Python and Lua.",
    reqs: ["5a", "5b", "5c", "5d"],
    codeLab: true,
    lesson: [
      {
        title: "Every program has three parts",
        body: [
          "Input is information the program receives — a key press, a typed number, a sensor reading.",
          "Decisions are the choices the program makes, usually with 'if' statements: IF the score is above 10, THEN show 'You win!'.",
          "Output is what the program does or shows — text on the screen, a sound, a sprite moving.",
        ],
      },
      {
        title: "Debugging is detective work",
        body: [
          "A bug is a mistake that makes a program behave differently than you expected. Debugging means finding and fixing it.",
          "Good debuggers: (1) describe what SHOULD happen, (2) describe what DOES happen, (3) change one thing at a time, and (4) test again.",
        ],
        tip: "Write down your bug hunt as you go — you'll explain it to your counselor.",
      },
      {
        title: "Three languages, three environments",
        body: [
          "5a — Scratch: a block-based environment. You will change a sample project, fix a bug, and show it working.",
          "5b — Python: a typed language used in science and education. You will write a small working program.",
          "5c — Lua: a lightweight language used in game development. You will write a different working program.",
          "Open the Code Lab to edit the starter samples. Your drafts and debugging notes save automatically. Your counselor checks off each demonstration in person — the app never marks a demo complete for you.",
        ],
      },
    ],
    questions: [
      { id: "5a.q1", req: "5a", prompt: "Scratch: What change did you make to the sample program, and what bug did you find and fix?", help: "Also fill in the debugging notes in the Code Lab.", rows: 5 },
      { id: "5b.q1", req: "5b", prompt: "Python: What does your program do? Which industry might use a program like this?", rows: 4 },
      { id: "5c.q1", req: "5c", prompt: "Lua: What does your program do? Which industry might use a program like this?", rows: 4 },
      { id: "5d.q1", req: "5d", prompt: "Scratch program: Explain its input, decisions and output.", rows: 4 },
      { id: "5d.q2", req: "5d", prompt: "Python program: Explain its input, decisions and output.", rows: 4 },
      { id: "5d.q3", req: "5d", prompt: "Lua program: Explain its input, decisions and output.", rows: 4 },
    ],
    signoffs: [
      { id: "5a.demo", req: "5a", label: "Demonstrated modified & debugged Scratch program" },
      { id: "5b.demo", req: "5b", label: "Demonstrated working Python program" },
      { id: "5c.demo", req: "5c", label: "Demonstrated working Lua program" },
      { id: "5d.explain", req: "5d", label: "Explained input, decisions and output for all three programs" },
    ],
  },
  {
    id: "m6",
    number: 6,
    title: "Careers in Programming",
    summary: "Explore jobs that use code and plan a path toward one.",
    reqs: ["6"],
    lesson: [
      {
        title: "Programming is part of many jobs",
        body: [
          "Software developers build apps and websites, but many other careers use programming too: game designers, data scientists, robotics engineers, cybersecurity analysts, scientists, animators, and even farmers using smart equipment.",
        ],
      },
      {
        title: "How people get there",
        body: [
          "Paths include college degrees in computer science or engineering, technical schools, coding bootcamps, military training, apprenticeships, and teaching yourself with projects.",
          "Experience matters: building projects, joining clubs or competitions, and internships all count.",
        ],
        tip: "Interview an adult who programs at work — ask what a normal day looks like.",
      },
    ],
    questions: [
      { id: "6.q1", req: "6", prompt: "Career #1: What is it and how does it use programming?", rows: 3 },
      { id: "6.q2", req: "6", prompt: "Career #2: What is it and how does it use programming?", rows: 3 },
      { id: "6.q3", req: "6", prompt: "Career #3: What is it and how does it use programming?", rows: 3 },
      { id: "6.q4", req: "6", prompt: "Choose one of the three. What education, training and experience would you need?", rows: 5 },
      { id: "6.q5", req: "6", prompt: "Why does this career interest you?", rows: 4 },
    ],
    signoffs: [{ id: "6.discussion", req: "6", label: "Discussed career research with counselor" }],
  },
];

export const ALL_QUESTIONS = MODULES.flatMap((m) => m.questions.map((q) => ({ ...q, moduleId: m.id })));
export const ALL_SIGNOFFS = MODULES.flatMap((m) => m.signoffs.map((s) => ({ ...s, moduleId: m.id })));

export function getModule(id: string) {
  return MODULES.find((m) => m.id === id);
}

export type ResponseStatus = "draft" | "submitted" | "returned" | "approved";
export type ModuleStatus = "not_started" | "in_progress" | "submitted" | "needs_revision" | "complete";

/**
 * A module is complete only when every question is approved by the counselor AND every
 * required counselor sign-off exists. Nothing is ever auto-completed from scout activity.
 */
export function moduleStatus(
  mod: Module,
  responses: { question_id: string; status: ResponseStatus; answer: string }[],
  signoffIds: Set<string>,
): ModuleStatus {
  const byQ = new Map(responses.map((r) => [r.question_id, r]));
  const rs = mod.questions.map((q) => byQ.get(q.id));
  if (rs.some((r) => r?.status === "returned")) return "needs_revision";
  const allApproved = rs.every((r) => r?.status === "approved");
  const allSigned = mod.signoffs.every((s) => signoffIds.has(s.id));
  if (allApproved && allSigned) return "complete";
  if (rs.every((r) => r && (r.status === "submitted" || r.status === "approved"))) return "submitted";
  if (rs.some((r) => r && r.answer.trim().length > 0)) return "in_progress";
  return "not_started";
}

export const STATUS_LABEL: Record<ModuleStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "Awaiting review",
  needs_revision: "Needs revision",
  complete: "Complete",
};

