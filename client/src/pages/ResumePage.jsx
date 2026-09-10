import PageHero from '../components/ui/PageHero.jsx';
import { education, profile } from '../data/portfolioData.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useReveal } from '../hooks/useReveal.js';

function ResumePage() {
  useDocumentTitle('Resume');
  const ref = useReveal();

  return (
    <>
      <PageHero
        eyebrow="Resume"
        title="Rohit Kumar"
        lead="Full Stack + AI/ML Developer — summary of education, projects, and skills."
      />
      <section className="section" ref={ref}>
        <div className="container">
          <div className="resume-block reveal">
            <h3>👤 Profile</h3>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.75' }}>{profile.fullBio.join(' ')}</p>
          </div>

          <div className="resume-block reveal">
            <h3>🎓 Education</h3>
            {education.map((e) => (
              <div className="entry" key={e.title}>
                <h4>{e.title}</h4>
                <div className="meta">{e.years} · {e.place}</div>
                <p>{e.detail}</p>
              </div>
            ))}
          </div>

          <div className="resume-block reveal">
            <h3>🛠️ Core Skills</h3>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.75' }}>
              <strong style={{ color: 'var(--text)' }}>Languages:</strong> Python, JavaScript, Java, C ·{' '}
              <strong style={{ color: 'var(--text)' }}>Frontend:</strong> HTML, CSS, React ·{' '}
              <strong style={{ color: 'var(--text)' }}>Backend:</strong> Node.js, Express.js, REST APIs, JWT, Role-Based Authorization ·{' '}
              <strong style={{ color: 'var(--text)' }}>Databases:</strong> MongoDB, Mongoose ·{' '}
              <strong style={{ color: 'var(--text)' }}>AI/ML:</strong> NLP, Computer Vision, Text Classification, TF-IDF, Logistic Regression, Naive Bayes, SVM, BERT, CNN/InceptionV3, ResNet, LSTM, MFCC Speaker Recognition ·{' '}
              <strong style={{ color: 'var(--text)' }}>Tools:</strong> Git/GitHub, Postman, Cloudinary, Razorpay, Nodemailer
            </p>
          </div>

          <div className="resume-block reveal">
            <h3>📬 Contact</h3>
            <p style={{ color: 'var(--text-2)' }}>
              Email: <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
            </p>
            <p style={{ color: 'var(--text-2)', marginTop: 'var(--space-2)' }}>
              Open to internships, junior roles, and freelance opportunities.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default ResumePage;
