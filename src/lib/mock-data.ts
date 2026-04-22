export const dashboardSnapshot = {
  dueToday: [
    {
      id: "algorithms-problem-set",
      title: "Algorithms problem set 04",
      course: "CS 340",
      due: "Today · 11:59 PM",
      status: "At risk",
    },
    {
      id: "econ-reflection",
      title: "Behavioral econ reflection",
      course: "ECON 210",
      due: "Tomorrow · 8:00 AM",
      status: "Needs review",
    },
    {
      id: "studio-critiques",
      title: "Design studio critique prep",
      course: "ART 220",
      due: "Tomorrow · 2:00 PM",
      status: "On track",
    },
  ],
  atRiskCourses: [
    {
      id: "cs-340",
      name: "CS 340",
      signal: "2 overdue planner items",
      score: "Watchlist",
    },
    {
      id: "econ-210",
      name: "ECON 210",
      signal: "Announcement mentions quiz",
      score: "Heads up",
    },
    {
      id: "art-220",
      name: "ART 220",
      signal: "No recent review session logged",
      score: "Light risk",
    },
  ],
  announcements: [
    {
      id: "ann-1",
      course: "CS 340",
      title: "Project checkpoint rubric posted",
      time: "32 minutes ago",
    },
    {
      id: "ann-2",
      course: "ECON 210",
      title: "Friday discussion moved online",
      time: "2 hours ago",
    },
  ],
  briefing: [
    "Algorithms problem set is your tightest deadline and still needs ~90 minutes.",
    "Two new Canvas changes landed since last night: a CS rubric and an ECON schedule shift.",
    "You have one unread thread from your lab team that likely needs a quick coordination reply.",
    "If you only have one study block, use it on CS 340 before switching into lighter review work.",
    "No high-risk conflicts on the calendar yet, but Thursday is starting to stack up.",
  ],
};

export const weekSchedule = [
  { day: "Mon", count: 2, focus: "CS lecture + task review" },
  { day: "Tue", count: 4, focus: "Lab, office hours, planner cleanup" },
  { day: "Wed", count: 3, focus: "Studio block + ECON sync" },
  { day: "Thu", count: 5, focus: "Heavy delivery day" },
  { day: "Fri", count: 2, focus: "Quiz prep + inbox zero" },
  { day: "Sat", count: 1, focus: "Catch-up" },
  { day: "Sun", count: 1, focus: "Reset + planning" },
];

export const todoItems = [
  {
    id: "todo-1",
    title: "Outline checkpoint notes for CS 340",
    source: "Canvas planner",
    priority: "High",
    eta: "45 min",
    status: "Suggested first",
  },
  {
    id: "todo-2",
    title: "Upload revised mockups for studio",
    source: "Personal task",
    priority: "Medium",
    eta: "30 min",
    status: "Snoozed until 4 PM",
  },
  {
    id: "todo-3",
    title: "Read lecture note on bounded rationality",
    source: "Canvas assignment",
    priority: "Medium",
    eta: "25 min",
    status: "Fits between classes",
  },
];

export const notificationsDigest = {
  summary:
    "Today matters most in CS 340: the project checkpoint expectations changed, and your planner still shows one open problem set. ECON shifted a live discussion into Zoom. Nothing looks urgent in ART 220 yet.",
  items: [
    {
      id: "notif-1",
      course: "CS 340",
      title: "Project checkpoint rubric posted",
      detail:
        "The rubric now emphasizes testing evidence and architecture notes.",
      time: "32 min ago",
    },
    {
      id: "notif-2",
      course: "Inbox",
      title: "Lab team pinged you",
      detail: "They want confirmation on who submits the joint summary.",
      time: "1 hr ago",
    },
    {
      id: "notif-3",
      course: "ECON 210",
      title: "Discussion moved online",
      detail: "The announcement includes a Zoom replacement link.",
      time: "2 hr ago",
    },
  ],
};

export const inboxThreads = [
  {
    id: "lab-team",
    subject: "Lab team: who is submitting?",
    preview: "Can you confirm whether you or Maya are turning this in?",
    updatedAt: "12 min ago",
    unread: true,
    participants: ["Maya", "Jon", "You"],
  },
  {
    id: "econ-prof",
    subject: "Question about discussion section",
    preview:
      "Thanks for the clarification. The online room will open 10 minutes early.",
    updatedAt: "Yesterday",
    unread: false,
    participants: ["Professor Han", "You"],
  },
];

export const conversationMessages = {
  "lab-team": [
    {
      id: "m1",
      author: "Maya",
      body: "I wrapped the summary draft. Can you confirm whether you or I should submit it in Canvas?",
      createdAt: "11:42 AM",
    },
    {
      id: "m2",
      author: "Jon",
      body: "I can attach the figures either way, just need to know who is the final submitter.",
      createdAt: "11:46 AM",
    },
    {
      id: "m3",
      author: "You",
      body: "I can submit if the latest version is final. Send me the updated doc and I’ll upload it before lunch.",
      createdAt: "11:51 AM",
    },
  ],
  "econ-prof": [
    {
      id: "m4",
      author: "Professor Han",
      body: "Thanks for flagging the room conflict. Friday discussion is now online and the announcement has the Zoom link.",
      createdAt: "Yesterday · 5:20 PM",
    },
  ],
} as const;

export const tutorCourses = [
  {
    id: "cs-340",
    name: "CS 340",
    title: "Algorithms and Data Structures",
    focus:
      "Socratic help with checkpoints, lecture notes, and design decisions.",
  },
  {
    id: "econ-210",
    name: "ECON 210",
    title: "Behavioral Economics",
    focus:
      "Explain concepts, compare theories, and summarize readings with citations.",
  },
  {
    id: "art-220",
    name: "ART 220",
    title: "Interactive Studio",
    focus: "Critique prep, project planning, and rubric-aware study support.",
  },
];

export const tutorTranscript = [
  {
    id: "t1",
    role: "assistant" as const,
    content:
      "Your syllabus frames this course around design tradeoffs, complexity analysis, and clear written reasoning. Want to start with the learning goals, grading breakdown, or weekly cadence? [1]",
    citations: [
      {
        id: "1",
        title: "CS 340 syllabus overview",
        href: "#",
      },
    ],
  },
  {
    id: "t2",
    role: "user" as const,
    content: "Summarize the syllabus and tell me where I should focus first.",
  },
  {
    id: "t3",
    role: "assistant" as const,
    content:
      "The biggest early focus is consistent weekly delivery: lecture notes, checkpoint submissions, and written explanations count more than a single cram session. Before I over-answer, what feels least clear right now: project expectations, grading, or the weekly workflow? [1] [2]",
    citations: [
      {
        id: "1",
        title: "CS 340 syllabus overview",
        href: "#",
      },
      {
        id: "2",
        title: "Project checkpoint rubric",
        href: "#",
      },
    ],
  },
];
