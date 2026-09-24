import { useEffect, useRef, useState } from 'react';
import { sendChatMessage } from '../../api/api.js';

const suggestions = [
  'What projects has Rohit built?',
  'What are his skills?',
  'How can I hire him?',
  'Tell me about his education',
];

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! 👋 I'm Rohit's AI assistant. Ask me about his projects, skills, education, or how to contact him — I'm online 24/7!",
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { from: 'user', text: trimmed }]);
    setInput('');
    setTyping(true);
    try {
      const res = await sendChatMessage({ message: trimmed, sessionId: 'visitor' });
      setMessages((m) => [...m, { from: 'bot', text: res.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { from: 'bot', text: 'Sorry, I could not reach the server right now. Please try again in a moment. 🤖' },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span className="avatar">🤖</span>
            <div className="info">
              <h4>Rohit Assistant</h4>
              <span className="status">Online · 24/7</span>
            </div>
            <button className="chat-close" aria-label="Close chat" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="chat-messages" ref={messagesRef}>
            {messages.map((m, i) => (
              <div className={`chat-msg ${m.from}`} key={i}>
                {m.text}
              </div>
            ))}
            {typing && <div className="chat-msg bot typing">typing…</div>}
          </div>
          <div className="chat-suggestions">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
          <form className="chat-input" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Ask me anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Chat message"
            />
            <button type="submit" aria-label="Send">➢</button>
          </form>
        </div>
      )}
      <button
        className="chat-launcher"
        aria-label="Open chat"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? '✕' : '💬'}
        <span className="pulse" />
      </button>
    </div>
  );
}

export default ChatWidget;
