import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© {new Date().getFullYear()} Rohit Kumar · Full Stack + AI/ML Developer</p>
        <span className="mono">rohit@portfolio:~$ echo "Let's connect"</span>
        <Link to="/contact" className="mono">Get in touch →</Link>
      </div>
    </footer>
  );
}

export default Footer;
