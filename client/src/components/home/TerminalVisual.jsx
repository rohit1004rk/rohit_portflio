import { useEffect, useState } from 'react';
import { terminalLines } from '../../data/portfolioData.js';

// Decorative terminal with a typing effect.
// The lines are visual-only — they do not claim real system connections.
function TerminalVisual() {
  const [visibleLines, setVisibleLines] = useState([]);
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setVisibleLines(terminalLines);
      setDone(true);
      return;
    }

    let lineIdx = 0;
    let charIdx = 0;
    let timer;

    const typeLine = () => {
      const line = terminalLines[lineIdx];
      if (!line) {
        setDone(true);
        return;
      }
      if (charIdx <= line.text.length) {
        setTyped(line.text.slice(0, charIdx));
        charIdx += 1;
        timer = setTimeout(typeLine, 28);
      } else {
        setVisibleLines((prev) => [...prev, line]);
        setTyped('');
        lineIdx += 1;
        charIdx = 0;
        timer = setTimeout(typeLine, 320);
      }
    };

    timer = setTimeout(typeLine, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="terminal" role="img" aria-label="Decorative developer terminal">
      <div className="term-bar">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="title">rohit@portfolio: ~</span>
      </div>
      <div className="term-body">
        {visibleLines.map((line, i) => (
          <div className="term-line" key={i}>
            <span className="no">{i + 1}</span>
            <span>
              <span className="prompt">&gt;</span>{' '}
              <span className={line.type === 'ok' ? 'ok' : 'out'}>{line.text}</span>
            </span>
          </div>
        ))}
        {!done && (
          <div className="term-line">
            <span className="no">{visibleLines.length + 1}</span>
            <span>
              <span className="prompt">&gt;</span> {typed}
              <span className="term-cursor" />
            </span>
          </div>
        )}
        {done && (
          <div className="term-line">
            <span className="no">{visibleLines.length + 1}</span>
            <span className="dim"># visual-only · connect via /contact</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TerminalVisual;
