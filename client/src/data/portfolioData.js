// ── Portfolio content (static fallback + API seed source) ────────────────
// The app fetches projects & skills from the Express API. If the backend is
// not running, it falls back to this data so the site always renders.

export const profile = {
  name: "Rohit Kumar",
  headline: "Full Stack + AI/ML Developer",
  eyebrow: "FULL STACK + AI/ML DEVELOPER",
  shortBio:
    "I'm Rohit Kumar, a Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions. I work across modern web technologies, REST APIs, databases, NLP, and computer vision.",
  fullBio: [
    "I'm Rohit Kumar, a Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions. I work across modern web technologies, REST APIs, databases, NLP, and computer vision.",
    "I enjoy turning practical problems into functional software—from e-commerce platforms and campus utility applications to machine-learning systems for fake-news and spam detection.",
    "My goal is to continuously strengthen my development and AI/ML skills and use my projects to demonstrate practical problem-solving ability to recruiters and potential clients.",
  ],
  stats: [{ num: "6", suffix: "+", label: "Projects" }],
  contact: {
    email: "rohitkumar102004@gmail.com",
    // No public GitHub URL is available yet — do not show a fake link.
    github: null,
    linkedin: null,
    resumePath: "/resume",
  },
};

export const aboutSections = [
  {
    title: "Who I Am",
    icon: "👤",
    text: "A Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions.",
  },
  {
    title: "What I Build",
    icon: "🛠️",
    text: "Modern web applications, REST APIs, databases, NLP systems, and computer-vision prototypes that turn practical problems into functional software.",
  },
  {
    title: "Full Stack Focus",
    icon: "⚙️",
    text: "React frontends, Node.js/Express backends, MongoDB data modeling, JWT authentication, and role-based authorization across the stack.",
  },
  {
    title: "AI/ML Focus",
    icon: "🤖",
    text: "Text classification, NLP, computer vision, and speaker recognition — from classical ML baselines to BERT and CNN-based deep learning.",
  },
  {
    title: "Career Direction",
    icon: "🚀",
    text: "Continuously strengthening development and AI/ML skills, and using projects to demonstrate practical problem-solving ability to recruiters and potential clients.",
  },
];
export const education = [
  {
    years: "2023 – 2027",
    title: "B.Tech (BEU)",
    place: "Supaul College of Engineering",
    location: "Supaul, Bihar",
    detail: "Computer Science (AI)",

    // Yahan baad mein apni actual CGPA change kar sakte hain
    cgpa: "7.7 / 10",

    // College icon
    icon: "🎓",
  },

  {
    years: "2020 – 2022",
    title: "Class 12th (CBSE)",
    place: "Shivam School",
    location: "Vijaynagar, Bihta, Patna",
    detail: "Class 12th (CBSE)",

    icon: "🏫",
  },

  {
    years: "2018 – 2020",
    title: "Class 10th (CBSE)",
    place: "D.A.V Public School",
    location: "BSEB Colony, New Punaichack, Patna",
    detail: "Class 10th (CBSE)",

    icon: "🏫",
  },
];
export const fallbackSkills = [
  {
    category: "Programming Languages",
    icon: "⌨️",
    items: ["C", "C++", "Java", "Python"],
  },
  {
    category: "Frontend Development",
    icon: "🎨",
    items: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    category: "Backend Development",
    icon: "⚙️",
    items: [
      "Node.js",
      "Express.js",
      "REST API Development",
      "JWT Authentication",
      "Authentication Middleware",
    ],
  },
  {
    category: "Databases",
    icon: "🗄️",
    items: ["MongoDB", "Mongoose", "CRUD Operations"],
  },
  {
    category: "AI / Machine Learning",
    icon: "🤖",
    items: ["ML", "NLP", "Computer Vision", "CNN", "LSTM"],
  },
  {
    category: "Libraries & Frameworks",
    icon: "📚",
    items: ["Scikit-learn", "TensorFlow / Keras", "NumPy"],
  },
  {
    category: "Tools & Services",
    icon: "🛠️",
    items: [
      "Git/GitHub",
      "Postman",
      "Cloudinary",
      "Razorpay",
      "Nodemailer / SMTP",
    ],
  },
  {
    category: "Additional Skills",
    icon: "🧩",
    items: [
      "Web Development",
      "AI/ML Application Development",
      "Graphic Designing",
      "Cybersecurity fundamentals",
    ],
  },
];
export const achievements = [
  "Secured 1nd Rank in College Coding Contest organized by College Coding Club",
  "Secured 1rd Rank in 1st Year and 2nd Rank in 2nd Year; logo design",
  "Completed Cisco Networking Academy courses: Cybersecurity Essentials, Python Essentials, CPP Essentials",
  "Certified in Advanced C++ Training Spoken Tutorial Project, IIT Bombay",
  "Certified in Introduction to Computers ",
  "Spoken Tutorial Project, IIT Bombay",
  "Solved 40+ DSA problems across LeetCode, GFG, CodeChef, and HackerRank",
];

export const terminalLines = [
  { type: "cmd", text: "initializing developer profile..." },
  { type: "cmd", text: "loading full-stack modules..." },
  { type: "cmd", text: "loading AI/ML modules..." },
  { type: "cmd", text: "connecting database..." },
  { type: "ok", text: "REST API: ONLINE" },
  { type: "ok", text: "NLP: READY" },
  { type: "ok", text: "COMPUTER VISION: READY" },
];

export const resumeProjects = [
  {
    name: "FaceID Attendance System",
    tech: "Python, OpenCV, FaceNet, FastAPI, PostgreSQL, React",
    bullets: [
      "Problem & Feature: Built an automated, contactless biometric attendance pipeline capable of detecting and verifying student/employee faces from live video streams in under 500 ms.",
      "Technical Implementation: Integrated OpenCV for Haar-cascade face bounding and FaceNet for generating 128-dimensional vector embeddings, matched against an indexed PostgreSQL database using cosine similarity.",
      "Anti-Spoofing & Security: Implemented blink and micro-motion detection heuristics to prevent static smartphone/paper photo spoofing, maintaining 98%+ verification accuracy.",
      "Deployment & Dashboard: Developed an administrative reporting dashboard in React with automated daily CSV attendance export and deployed the FastAPI backend on AWS EC2.",
    ],
  },
  {
    name: "ResuMatch AI",
    tech: "Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, OpenAI API",
    bullets: [
      "Problem & Feature: Built a full-stack generative resume platform that scans target job descriptions and optimizes resume structure, improving ATS match rates by ~45%.",
      "Technical Implementation: Integrated LLM endpoints with structured JSON prompts to parse job keywords, calculate relevance scores, and suggest inline bullet-point enhancements.",
      "Performance & Rendering: Built an in-browser drag-and-drop resume editor utilizing pdf-lib for client-side dynamic compilation, rendering downloadable PDFs in under 1 second without server re-renders.",
      "Architecture & Deployment: Deployed on Vercel with a PostgreSQL database managed via Prisma ORM, implementing secure guest session saving.",
    ],
  },
  {
    name: "AgroSense Solar IoT",
    tech: "ESP32, C++, MQTT Protocol, Node.js, InfluxDB, React, Chart.js",
    bullets: [
      "Problem & Feature: Designed an off-grid precision agriculture unit that automates irrigation based on live soil telemetry, cutting simulated water consumption by ~35%.",
      "Hardware & Firmware: Programmed an ESP32 microcontroller in C++ to sample capacitive soil moisture, temperature, and solar battery health, executing low-power deep-sleep cycles.",
      "Telemetry & Networking: Engineered an MQTT messaging pipeline publishing telemetry data at 30-second intervals to a Node.js broker with fallback local relay control.",
      "Web Monitoring: Created a real-time web portal visualizing soil saturation graphs, moisture thresholds, and pump actuation history using React and Chart.js.",
    ],
  },
  {
    name: "PulseCheck API Monitor",
    tech: "Node.js, Express, Redis, BullMQ, PostgreSQL, Next.js, Resend API",
    bullets: [
      "Problem & Feature: Built a distributed background service that monitors uptime, response latencies, and SSL certificates for multiple public/private endpoints.",
      "Worker Queue Engine: Built an asynchronous cron scheduler using Redis and BullMQ to execute non-blocking HTTP health checks at configurable intervals (1m, 5m, 15m).",
      "Database & Data Modeling: Designed an indexed PostgreSQL schema tracking latency history, response payloads, and consecutive failure counts across 30-day windows.",
      "Incident Alerting: Integrated transactional email webhooks via the Resend API to trigger down-alerts within 60 seconds of detected server failures.",
    ],
  },
  {
    name: "CodeFixer AI",
    tech: "Next.js, TypeScript, Monaco Editor, FastAPI, LangChain, Redis, Tailwind CSS",
    bullets: [
      "Problem & Feature: Engineered an in-browser code analysis environment that statically analyzes code, identifies runtime/logical flaws, and recommends optimized refactors.",
      "Editor & LLM Integration: Embedded Monaco Editor (VS Code core) connected to an asynchronous LangChain pipeline analyzing time complexity, space complexity, and CWE security vulnerabilities.",
      "Diff Engine & Streaming: Built a side-by-side diff viewer utilizing WebStreams to stream optimized code suggestions with unified inline additions and deletions.",
      "Latency Optimization: Implemented Redis hashing for code snippets, serving instant cached reviews for repeated logic and reducing LLM inference costs by ~60%.",
    ],
  },
];
