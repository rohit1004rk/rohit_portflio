import { useState } from 'react';
import PageHero from '../components/ui/PageHero.jsx';
import { sendMessage } from '../api/api.js';
import { profile } from '../data/portfolioData.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useReveal } from '../hooks/useReveal.js';

const contactLinks = [
  { emoji: '📧', label: 'Email me', href: `mailto:${profile.contact.email}` },
  { emoji: '💼', label: 'LinkedIn', href: 'https://www.linkedin.com/', external: true },
  { emoji: '📄', label: 'View Resume', href: '/resume' },
];

function ContactPage() {
  useDocumentTitle('Contact');
  const ref = useReveal();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: 'idle', text: '' });
  const [sending, setSending] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ type: 'idle', text: '' });
    try {
      const res = await sendMessage(form);
      setStatus({ type: 'ok', text: res.message || 'Message sent successfully!' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({
        type: 'err',
        text: err.response?.data?.message || 'Could not send the message. Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's build something together"
        lead="Have a project, an internship opportunity, or a freelance role in mind? I'd love to hear from you."
      />
      <section className="section" ref={ref}>
        <div className="container contact-grid">
          <div className="contact-left reveal">
            <p style={{ color: 'var(--text-2)', fontSize: 'var(--text-lg)', lineHeight: '1.75', marginBottom: 'var(--space-8)' }}>
              Reach out directly, or drop a message through the form and I'll get back to you.
            </p>
            <div className="contact-links">
              {contactLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="em">{l.emoji}</span>
                  {l.label}
                  <span className="ar">→</span>
                </a>
              ))}
            </div>
          </div>
          <form className="form reveal" onSubmit={onSubmit}>
            <div className="row2">
              <div>
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" placeholder="Your name" value={form.name} onChange={onChange} required />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
              </div>
            </div>
            <div>
              <label htmlFor="subject">Subject</label>
              <input id="subject" name="subject" type="text" placeholder="What's this about?" value={form.subject} onChange={onChange} required />
            </div>
            <div>
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" placeholder="Tell me about your project or opportunity..." value={form.message} onChange={onChange} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Send Message'}
            </button>
            {status.type !== 'idle' && (
              <p className={`form-note ${status.type === 'ok' ? 'ok' : 'err'}`}>{status.text}</p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}

export default ContactPage;
