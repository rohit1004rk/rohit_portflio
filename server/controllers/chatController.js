import ChatLog from '../models/ChatLog.js';

// ── Portfolio knowledge base used by the 24/7 assistant ────────────────
const KNOWLEDGE = {
  name: 'Rohit Kumar',
  role: 'Full Stack + AI/ML Developer',
  college: 'Supaul College of Engineering, Bihar',
  degree: 'B.Tech — Computer Science (Artificial Intelligence), 2023–2027',
  bio: "I'm Rohit Kumar, a Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions. I work across modern web technologies, REST APIs, databases, NLP, and computer vision.",
  contact: 'socialmedia2026rk@gmail.com',
  projects: [
    '🧠 Fake News Detector using NLP — text classification (TF-IDF + Logistic Regression baseline at 87%, BERT version at 91.4% accuracy). Status: In progress.',
    '🎓 Campus Lost & Found Portal — MERN platform with ResNet image-embedding matching. Status: In progress.',
    '🎙️ Voice-Based Attendance System — speaker recognition via MFCC + SVM (~85% identification in quiet conditions). Status: Prototype.',
    '🛒 Mini E-commerce Store — MERN with JWT auth, role-based access, Razorpay, Cloudinary, Nodemailer. Status: In progress.',
    '📧 Spam Email Classifier — TF-IDF + Multinomial Naive Bayes (97.3% accuracy). Status: Completed.',
    '🖼️ Image Caption Generator — InceptionV3 + LSTM (Show and Tell), BLEU-1 ~0.55. Status: Learning / Prototype.',
  ],
  skills:
    'Languages: Python, JavaScript, Java, C · Frontend: HTML, CSS, React · Backend: Node.js, Express, REST APIs, JWT, Role-Based Authorization · Databases: MongoDB, Mongoose · AI/ML: NLP, Computer Vision, Text Classification, TF-IDF, Logistic Regression, Naive Bayes, SVM, BERT, CNN/InceptionV3, ResNet, LSTM, MFCC Speaker Recognition · Tools: Git/GitHub, Postman, Cloudinary, Razorpay, Nodemailer.',
  achievements:
    'Member of Technical Club · Participated in Utkrisht College Event · Participated in Webathon · 7th Rank in College · 6th Rank in College · Design Portfolio · Coding Quiz',
};

// ── Rule-based intent engine (works 24/7 with zero external dependencies) ─
function getBotReply(input) {
  const q = (input || '').toLowerCase();
  const has = (words) => words.some((w) => q.includes(w));

  if (has(['hi', 'hello', 'hey', 'namaste', 'salam', 'hola'])) {
    return "Hello! 👋 I'm Rohit's AI assistant. Ask me about his projects, skills, education, or how to hire him — I'm here 24/7!";
  }
  if (has(['who are you', 'your name', 'about you', 'introduce', 'about rohit'])) {
    return `I'm Rohit's virtual assistant 🤖. ${KNOWLEDGE.name} is a ${KNOWLEDGE.role} and a ${KNOWLEDGE.degree} student at ${KNOWLEDGE.college}. ${KNOWLEDGE.bio}`;
  }
  if (has(['project', 'work', 'portfolio', 'built', 'case study', 'build'])) {
    return `Here are Rohit's projects:\n\n${KNOWLEDGE.projects.join('\n')}\n\nYou can see full details on the Projects page!`;
  }
  if (has(['skill', 'tech', 'stack', 'language', 'framework', 'tool', 'know'])) {
    return `Here's Rohit's toolkit:\n\n${KNOWLEDGE.skills}`;
  }
  if (has(['education', 'college', 'degree', 'study', 'b.tech', 'university'])) {
    return `${KNOWLEDGE.name} is pursuing ${KNOWLEDGE.degree} at ${KNOWLEDGE.college}. He's focused on full-stack development, machine learning, NLP, and computer vision.`;
  }
  if (has(['contact', 'email', 'hire', 'freelance', 'internship', 'job', 'opportunity', 'reach'])) {
    return `Great! You can reach Rohit at ${KNOWLEDGE.contact} or use the Contact form on the website. He's open to internships, junior roles, and freelance opportunities. 💼`;
  }
  if (has(['resume', 'cv'])) {
    return "You can view Rohit's resume on the Resume page — it covers his education, projects, skills, and contact details. 📄";
  }
  if (has(['achievement', 'rank', 'award', 'club', 'webathon', 'utkrisht'])) {
    return `Here are some of Rohit's highlights:\n\n${KNOWLEDGE.achievements}`;
  }
  if (has(['ai', 'ml', 'machine learning', 'nlp', 'chatbot', 'computer vision'])) {
    return `Rohit works across AI/ML: NLP, computer vision, text classification, speaker recognition, and deep learning (BERT, CNN/InceptionV3, ResNet, LSTM). Check the Skills and Projects pages for details! 🤖`;
  }
  if (has(['help', 'what can you do', 'how to', 'support'])) {
    return "I can help with:\n• About Rohit & his background\n• His projects & results\n• Skills & tech stack\n• Education & achievements\n• How to contact / hire him\n\nJust ask me anything! 😊";
  }
  if (has(['thank', 'thanks', 'dhanyavad', 'shukria'])) {
    return "You're welcome! 😊 Feel free to ask if you need anything else. Rohit would love to connect with you!";
  }
  return `I'm not 100% sure about that one, but here's what I know: ${KNOWLEDGE.name} is a ${KNOWLEDGE.role} from ${KNOWLEDGE.college}. Try asking about his projects, skills, education, or how to contact him! 🤖`;
}

// ── Optional: call a real LLM (OpenAI-compatible) if configured ─────────
async function callExternalAI(message) {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  if (!apiKey) return null;
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `You are the assistant for ${KNOWLEDGE.name}, a ${KNOWLEDGE.role}. Be concise and helpful. Knowledge: ${JSON.stringify(KNOWLEDGE)}`,
          },
          { role: 'user', content: message },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    return null;
  }
}

// @desc    Send a chat message and get a reply
// @route   POST /api/chat
// @access  Public
export const createChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let reply = await callExternalAI(message);
    if (!reply) reply = getBotReply(message);

    const sessionId = req.body.sessionId || 'anonymous';
    const log = await ChatLog.create({
      userMessage: message.trim(),
      botReply: reply,
      sessionId,
      userAgent: req.get('user-agent') || '',
    });

    res.json({ reply, logId: log._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat logs
// @route   GET /api/chat
// @access  Private/Admin
export const getChatLogs = async (req, res) => {
  try {
    const logs = await ChatLog.find().sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a chat log
// @route   DELETE /api/chat/:id
// @access  Private/Admin
export const deleteChatLog = async (req, res) => {
  try {
    const log = await ChatLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ message: 'Chat log not found' });
    res.json({ message: 'Chat log removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
