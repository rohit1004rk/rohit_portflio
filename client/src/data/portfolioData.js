// ── Portfolio content (static fallback + API seed source) ────────────────
// The app fetches projects & skills from the Express API. If the backend is
// not running, it falls back to this data so the site always renders.

export const profile = {
  name: 'Rohit Kumar',
  headline: 'Full Stack + AI/ML Developer',
  eyebrow: 'FULL STACK + AI/ML DEVELOPER',
  shortBio:
    "I’m Rohit Kumar, a Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions. I work across modern web technologies, REST APIs, databases, NLP, and computer vision.",
  fullBio: [
    "I’m Rohit Kumar, a Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions. I work across modern web technologies, REST APIs, databases, NLP, and computer vision.",
    'I enjoy turning practical problems into functional software—from e-commerce platforms and campus utility applications to machine-learning systems for fake-news and spam detection.',
    'My goal is to continuously strengthen my development and AI/ML skills and use my projects to demonstrate practical problem-solving ability to recruiters and potential clients.',
  ],
  stats: [
    { num: '6', suffix: '+', label: 'Projects' },
    { num: '97', suffix: '%', label: 'Best Accuracy' },
    { num: '2023', suffix: '–27', label: 'B.Tech CSE (AI)' },
  ],
  contact: {
    email: 'socialmedia2026rk@gmail.com',
    // No public GitHub URL is available yet — do not show a fake link.
    github: null,
    linkedin: null,
    resumePath: '/resume',
  },
};

export const aboutSections = [
  {
    title: 'Who I Am',
    icon: '👤',
    text: 'A Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions.',
  },
  {
    title: 'What I Build',
    icon: '🛠️',
    text: 'Modern web applications, REST APIs, databases, NLP systems, and computer-vision prototypes that turn practical problems into functional software.',
  },
  {
    title: 'Full Stack Focus',
    icon: '⚙️',
    text: 'React frontends, Node.js/Express backends, MongoDB data modeling, JWT authentication, and role-based authorization across the stack.',
  },
  {
    title: 'AI/ML Focus',
    icon: '🤖',
    text: 'Text classification, NLP, computer vision, and speaker recognition — from classical ML baselines to BERT and CNN-based deep learning.',
  },
  {
    title: 'Career Direction',
    icon: '🚀',
    text: 'Continuously strengthening development and AI/ML skills, and using projects to demonstrate practical problem-solving ability to recruiters and potential clients.',
  },
];

export const fallbackSkills = [
  { category: 'Programming Languages', icon: '⌨️', items: ['Python', 'JavaScript', 'Java', 'C'] },
  { category: 'Frontend Development', icon: '🎨', items: ['HTML', 'CSS', 'JavaScript', 'React'] },
  {
    category: 'Backend Development',
    icon: '⚙️',
    items: ['Node.js', 'Express.js', 'REST API Development', 'JWT Authentication', 'Authentication Middleware', 'Role-Based Authorization'],
  },
  { category: 'Databases', icon: '🗄️', items: ['MongoDB', 'Mongoose', 'CRUD Operations'] },
  {
    category: 'AI / Machine Learning',
    icon: '🤖',
    items: ['Machine Learning', 'Natural Language Processing', 'Computer Vision', 'Text Classification', 'TF-IDF', 'Logistic Regression', 'Multinomial Naive Bayes', 'SVM', 'BERT', 'CNN / InceptionV3', 'ResNet', 'LSTM', 'MFCC-based Speaker Recognition'],
  },
  {
    category: 'Libraries & Frameworks',
    icon: '📚',
    items: ['Scikit-learn', 'TensorFlow / Keras', 'NLTK', 'Librosa', 'NumPy', 'Matplotlib', 'Pillow', 'Flask', 'Streamlit', 'Tkinter'],
  },
  { category: 'Tools & Services', icon: '🛠️', items: ['Git/GitHub', 'Postman', 'Cloudinary', 'Razorpay', 'Nodemailer / SMTP'] },
  {
    category: 'Additional Skills',
    icon: '🧩',
    items: ['Web Development', 'AI/ML Application Development', 'Graphic Designing', 'Cybersecurity fundamentals'],
  },
];

export const education = [
  {
    years: '2023 – 2027',
    title: 'B.Tech — Computer Science (Artificial Intelligence)',
    place: 'Supaul College of Engineering, Bihar',
    detail:
      'Focus on full-stack web development, machine learning, NLP, and computer vision. Active member of the Technical Club.',
  },
  {
    years: 'Ongoing',
    title: 'Self-driven AI/ML & Web Development',
    place: 'Projects & hands-on learning',
    detail:
      'Building ML classifiers, CV prototypes, and MERN applications to strengthen practical problem-solving skills.',
  },
];

export const achievements = [
  'Member of Technical Club',
  'Participated in Utkrisht College Event',
  'Participated in Webathon',
  '7th Rank in College',
  '6th Rank in College',
  'Design Portfolio',
  'Coding Quiz',
];

export const terminalLines = [
  { type: 'cmd', text: 'initializing developer profile...' },
  { type: 'cmd', text: 'loading full-stack modules...' },
  { type: 'cmd', text: 'loading AI/ML modules...' },
  { type: 'cmd', text: 'connecting database...' },
  { type: 'ok', text: 'REST API: ONLINE' },
  { type: 'ok', text: 'NLP: READY' },
  { type: 'ok', text: 'COMPUTER VISION: READY' },
];
