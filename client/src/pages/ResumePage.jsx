import PageHero from "../components/ui/PageHero.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useReveal } from "../hooks/useReveal.js";

const RESUME_FILE = "/rohit-kumar-resume.pdf";

function ResumePage() {
  useDocumentTitle("Resume");

  const ref = useReveal();

  return (
    <div className="resume-page">
      <style>{`
        /* =========================================================
           RESUME PAGE
           Scoped styles only.
           Existing portfolio/global layout is not modified.
           ========================================================= */

        .resume-modern {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .resume-modern::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;

          background-image:
            linear-gradient(
              rgba(79, 216, 196, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(79, 216, 196, 0.035) 1px,
              transparent 1px
            );

          background-size: 48px 48px;

          mask-image: linear-gradient(
            to bottom,
            black 0%,
            rgba(0, 0, 0, 0.5) 65%,
            transparent 100%
          );
        }

        .resume-modern-shell {
          position: relative;
          z-index: 1;

          width: min(1180px, calc(100% - 40px));

          margin: 0 auto;

          padding: 12px 0 72px;
        }

        /* =========================================================
           MAIN TWO-COLUMN SECTION
           ========================================================= */

        .resume-modern-hero {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(390px, 0.9fr);

          gap: clamp(34px, 5vw, 70px);

          align-items: center;
        }

        .resume-modern-copy {
          min-width: 0;
        }

        /* =========================================================
           LEFT SIDE — CAREER DIRECTION
           ========================================================= */

        .resume-modern-eyebrow {
          display: inline-flex;

          align-items: center;
          gap: 9px;

          padding: 8px 15px;

          border: 1px solid var(--teal);
          border-radius: 999px;

          background: var(--teal-soft);
          color: var(--teal);

          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;

          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .resume-modern-eyebrow::before {
          content: "";

          width: 6px;
          height: 6px;

          flex: 0 0 6px;

          border-radius: 50%;

          background: var(--teal);

          box-shadow:
            0 0 12px rgba(79, 216, 196, 0.7);
        }

        .resume-modern-section-title {
          margin: 22px 0 0;

          color: var(--text);

          font-size: clamp(2rem, 4vw, 3.25rem);

          line-height: 1.04;

          letter-spacing: -0.04em;

          font-weight: 800;
        }

        .resume-modern-section-title span {
          color: var(--accent);
        }

        .resume-modern-intro {
          max-width: 620px;

          margin: 20px 0 0;

          color: var(--text-2);

          font-size: clamp(0.96rem, 1.25vw, 1.06rem);

          line-height: 1.8;
        }

        /* =========================================================
           RESUME BUTTONS
           ========================================================= */

        .resume-modern-actions {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-top: 25px;

          flex-wrap: wrap;
        }

        .resume-modern-action {
          min-width: 180px;
          min-height: 50px;

          padding: 12px 20px;

          border-radius: var(--radius-md, 12px);

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 9px;

          box-sizing: border-box;

          font-size: 0.9rem;
          font-weight: 700;

          text-decoration: none;

          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .resume-modern-action.primary {
          background: var(--accent);

          border: 1px solid var(--accent);

          color: #0b0f14;
        }

        .resume-modern-action.primary:hover {
          transform: translateY(-2px);

          box-shadow: var(--shadow-accent);
        }

        .resume-modern-action.secondary {
          background: var(--teal-soft);

          border: 1px solid var(--teal-border);

          color: var(--teal);
        }

        .resume-modern-action.secondary:hover {
          transform: translateY(-2px);

          border-color: var(--teal);

          background: rgba(
            79,
            216,
            196,
            0.18
          );
        }

        .resume-modern-meta {
          display: flex;

          align-items: center;

          gap: 11px;

          margin-top: 12px;

          color: var(--text-3);

          font-family: var(--font-mono);

          font-size: 0.66rem;

          letter-spacing: 0.04em;

          flex-wrap: wrap;
        }

        .resume-modern-meta-dot {
          width: 4px;
          height: 4px;

          flex: 0 0 4px;

          border-radius: 50%;

          background: var(--teal);
        }

        /* =========================================================
           RIGHT SIDE — CAREER PATH CARD
           ========================================================= */

        .resume-journey {
          position: relative;

          min-width: 0;

          height: 500px;

          overflow: hidden;

          border: 1px solid var(--border);

          border-radius: 22px;

          background:
            radial-gradient(
              circle at 75% 18%,
              rgba(79, 216, 196, 0.1),
              transparent 30%
            ),
            radial-gradient(
              circle at 25% 78%,
              rgba(255, 177, 75, 0.09),
              transparent 32%
            ),
            linear-gradient(
              145deg,
              rgba(11, 25, 35, 0.97),
              rgba(8, 15, 23, 0.98)
            );

          box-shadow:
            inset 0 0 60px rgba(79, 216, 196, 0.025),
            0 25px 70px rgba(0, 0, 0, 0.2);
        }

        .resume-journey::before {
          content: "";

          position: absolute;
          inset: 0;

          pointer-events: none;

          background-image:
            linear-gradient(
              rgba(79, 216, 196, 0.03) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(79, 216, 196, 0.03) 1px,
              transparent 1px
            );

          background-size: 34px 34px;
        }

        .resume-journey-label {
          position: absolute;

          top: 23px;
          left: 26px;

          z-index: 4;

          color: var(--text-3);

          font-family: var(--font-mono);

          font-size: 10px;
          font-weight: 700;

          letter-spacing: 0.22em;

          text-transform: uppercase;
        }

        .resume-journey-title {
          position: absolute;

          top: 49px;
          left: 26px;

          z-index: 4;

          width: calc(100% - 52px);

          margin: 0;

          color: var(--text);

          font-size: clamp(
            1.3rem,
            2.25vw,
            1.7rem
          );

          line-height: 1.2;

          letter-spacing: -0.025em;
        }

        .resume-journey-title span {
          color: var(--accent);
        }

        /* =========================================================
           CAREER TIMELINE

           IMPORTANT:
           This is a GRID, not four independently-positioned texts.

           This prevents Success / Grow / Build / Learn from
           overlapping at different screen widths.
           ========================================================= */

        .resume-career-timeline {
          position: absolute;

          top: 136px;
          right: 0;
          bottom: 38px;
          left: 0;

          z-index: 2;

          display: grid;

          grid-template-rows:
            repeat(4, minmax(0, 1fr));

          padding: 4px 28px 4px;

          box-sizing: border-box;
        }

        /* Vertical center line */

        .resume-career-line {
          position: absolute;

          top: 5px;
          bottom: 5px;

          left: 50%;

          width: 2px;

          transform: translateX(-50%);

          background:
            linear-gradient(
              to bottom,
              var(--accent) 0%,
              var(--teal) 38%,
              var(--teal) 100%
            );

          opacity: 0.82;

          box-shadow:
            0 0 14px rgba(
              79,
              216,
              196,
              0.16
            );
        }

        /* =========================================================
           TIMELINE ROW
           ========================================================= */

        .resume-career-row {
          position: relative;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            28px
            minmax(0, 1fr);

          align-items: center;

          min-height: 0;
        }

        /* =========================================================
           MILESTONE POINT
           ========================================================= */

        .resume-career-point {
          position: relative;

          z-index: 5;

          grid-column: 2;

          justify-self: center;

          width: 13px;
          height: 13px;

          box-sizing: border-box;

          border: 3px solid
            rgba(8, 15, 23, 0.96);

          border-radius: 50%;

          background: var(--teal);

          box-shadow:
            0 0 0 1px var(--teal),
            0 0 17px rgba(
              79,
              216,
              196,
              0.5
            );
        }

        .resume-career-row.success .resume-career-point {
          background: var(--accent);

          box-shadow:
            0 0 0 1px var(--accent),
            0 0 19px rgba(
              255,
              177,
              75,
              0.65
            );
        }

        /* =========================================================
           MILESTONE LABEL
           ========================================================= */

        .resume-career-label {
          position: relative;

          z-index: 4;

          min-width: 0;
        }

        .resume-career-label.left {
          grid-column: 1;

          padding-right: 25px;

          text-align: right;
        }

        .resume-career-label.right {
          grid-column: 3;

          padding-left: 25px;

          text-align: left;
        }

        .resume-career-label strong {
          display: block;

          color: var(--text);

          font-family: var(--font-mono);

          font-size: 0.8rem;
          font-weight: 700;

          line-height: 1.2;

          letter-spacing: 0.12em;

          text-transform: uppercase;
        }

        .resume-career-row.success
          .resume-career-label strong {
          color: var(--accent);
        }

        /*
          No descriptive paragraph here.

          The reference design only needs the milestone name.
          Removing the extra description also eliminates the
          unwanted text collision from the previous version.
        */

        /* Small connector from label to center line */

        .resume-career-label.left::after,
        .resume-career-label.right::after {
          content: "";

          position: absolute;

          top: 50%;

          width: 20px;
          height: 1px;

          transform: translateY(-50%);

          background: var(
            --border-strong,
            var(--border)
          );
        }

        .resume-career-label.left::after {
          right: 0;
        }

        .resume-career-label.right::after {
          left: 0;
        }

        /* =========================================================
           BOTTOM HIGHLIGHTS
           ========================================================= */

        .resume-modern-highlights {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 13px;

          margin-top: 28px;
        }

        .resume-highlight {
          min-height: 108px;

          padding: 16px 17px;

          border: 1px solid var(--border);

          border-radius: var(--radius-md, 12px);

          background:
            linear-gradient(
              145deg,
              rgba(79, 216, 196, 0.06),
              rgba(255, 255, 255, 0.012)
            ),
            var(--surface-2);

          box-sizing: border-box;

          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .resume-highlight:hover {
          transform: translateY(-3px);

          border-color: var(--teal-border);

          background:
            linear-gradient(
              145deg,
              rgba(79, 216, 196, 0.1),
              rgba(255, 255, 255, 0.018)
            ),
            var(--surface-2);
        }

        .resume-highlight-icon {
          display: inline-grid;

          place-items: center;

          width: 29px;
          height: 29px;

          margin-bottom: 9px;

          border: 1px solid var(--border);

          border-radius: 8px;

          background: var(--surface);

          color: var(--accent);

          font-size: 13px;
        }

        .resume-highlight strong {
          display: block;

          color: var(--text);

          font-size: 0.84rem;

          line-height: 1.25;
        }

        .resume-highlight p {
          margin: 5px 0 0;

          color: var(--text-3);

          font-size: 0.7rem;

          line-height: 1.45;
        }

        /* =========================================================
           BOTTOM STATEMENT
           ========================================================= */

        .resume-modern-footer {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-top: 24px;

          padding: 18px 21px;

          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .resume-modern-quote {
          margin: 0;

          color: var(--text-2);

          font-size: 0.86rem;

          line-height: 1.6;

          font-style: italic;
        }

        .resume-modern-signature {
          color: var(--teal);

          font-family: var(--font-mono);

          font-size: 0.68rem;

          white-space: nowrap;
        }

        /* =========================================================
           TABLET
           ========================================================= */

        @media (max-width: 980px) {
          .resume-modern-hero {
            grid-template-columns: 1fr;

            gap: 32px;
          }

          .resume-modern-copy {
            max-width: 820px;

            margin: 0 auto;

            text-align: center;
          }

          .resume-modern-intro {
            margin-left: auto;
            margin-right: auto;
          }

          .resume-modern-actions {
            justify-content: center;
          }

          .resume-modern-meta {
            justify-content: center;
          }

          .resume-journey {
            width: 100%;

            max-width: 720px;

            margin: 0 auto;
          }

          .resume-modern-highlights {
            max-width: 820px;

            margin-left: auto;
            margin-right: auto;
          }
        }

        /* =========================================================
           MOBILE
           ========================================================= */

        @media (max-width: 640px) {
          .resume-modern-shell {
            width: min(
              calc(100% - 28px),
              560px
            );

            padding-bottom: 48px;
          }

          .resume-modern-section-title {
            font-size: 2rem;
          }

          .resume-modern-intro {
            font-size: 0.9rem;

            line-height: 1.7;
          }

          .resume-modern-actions {
            flex-direction: column;

            width: 100%;
          }

          .resume-modern-action {
            width: 100%;

            min-width: 0;
          }

          .resume-modern-meta {
            justify-content: center;

            text-align: center;
          }

          /* =====================================================
             MOBILE CAREER PATH
             ===================================================== */

          .resume-journey {
            height: 430px;

            border-radius: 18px;
          }

          .resume-journey-label {
            top: 18px;
            left: 18px;
          }

          .resume-journey-title {
            top: 43px;
            left: 18px;

            width: calc(100% - 36px);

            font-size: 1.18rem;
          }

          .resume-career-timeline {
            top: 118px;
            bottom: 25px;

            padding-left: 16px;
            padding-right: 16px;
          }

          .resume-career-row {
            grid-template-columns:
              minmax(0, 1fr)
              24px
              minmax(0, 1fr);
          }

          .resume-career-label.left {
            padding-right: 18px;
          }

          .resume-career-label.right {
            padding-left: 18px;
          }

          .resume-career-label strong {
            font-size: 0.64rem;

            letter-spacing: 0.1em;
          }

          .resume-career-label.left::after {
            right: 0;

            width: 14px;
          }

          .resume-career-label.right::after {
            left: 0;

            width: 14px;
          }

          .resume-career-point {
            width: 12px;
            height: 12px;
          }

          /* =====================================================
             MOBILE HIGHLIGHTS
             ===================================================== */

          .resume-modern-highlights {
            grid-template-columns: 1fr;

            gap: 9px;

            margin-top: 22px;
          }

          .resume-highlight {
            min-height: 0;

            padding: 13px;

            display: grid;

            grid-template-columns:
              34px minmax(0, 1fr);

            column-gap: 11px;

            align-items: start;

            text-align: left;
          }

          .resume-highlight-icon {
            grid-row: span 2;

            margin: 0;
          }

          .resume-highlight p {
            margin-top: 3px;
          }

          /* =====================================================
             MOBILE FOOTER
             ===================================================== */

          .resume-modern-footer {
            flex-direction: column;

            text-align: center;

            padding: 17px 5px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .resume-highlight,
          .resume-modern-action {
            transition: none;
          }
        }
      `}</style>

      {/* =========================================================
          STANDARD PAGE HERO
          This uses the SAME PageHero component as Education.
          Do not duplicate Rohit Kumar or the role here.
         ========================================================= */}

      <PageHero
        eyebrow="Resume"
        title="Professional Journey"
        lead="A concise view of my academic journey, projects, experience and professional direction."
      />

      {/* =========================================================
          RESUME CONTENT
         ========================================================= */}

      <section className="resume-modern" ref={ref}>
        <div className="resume-modern-shell">
          <div className="resume-modern-hero">
            {/* =================================================
                LEFT SIDE
               ================================================= */}

            <div className="resume-modern-copy reveal">
              <span className="resume-modern-eyebrow">Career Direction</span>

              <h2 className="resume-modern-section-title">
                Building with <span>purpose.</span>
              </h2>

              <p className="resume-modern-intro">
                I enjoy building real-world solutions, learning continuously,
                and turning ideas into useful products. My journey is driven by
                curiosity, consistency and a focus on creating meaningful work.
              </p>

              <div className="resume-modern-actions">
                {/* View Resume */}

                <a
                  className="resume-modern-action primary"
                  href={RESUME_FILE}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span aria-hidden="true">↗</span>
                  View Resume
                </a>

                {/* Download Resume */}

                <a
                  className="resume-modern-action secondary"
                  href={RESUME_FILE}
                  download
                >
                  <span aria-hidden="true">↓</span>
                  Download Resume
                </a>
              </div>

              <div className="resume-modern-meta">
                <span>PDF Resume</span>

                <span className="resume-modern-meta-dot" />

                <span>Available to view online</span>

                <span className="resume-modern-meta-dot" />

                <span>Download anytime</span>
              </div>
            </div>

            {/* =================================================
                RIGHT SIDE — CAREER PATH
               ================================================= */}

            <div className="resume-journey reveal">
              <span className="resume-journey-label">Career Path</span>

              <h2 className="resume-journey-title">
                Progress through <span>consistency.</span>
              </h2>

              {/* =================================================
                  ROBUST GRID TIMELINE

                  The four rows are independent.
                  Therefore no text can overlap another milestone.
                 ================================================= */}

              <div className="resume-career-timeline">
                <div className="resume-career-line" />

                {/* SUCCESS — TOP */}

                <div className="resume-career-row success">
                  <div className="resume-career-label left">
                    <strong>Success</strong>
                  </div>

                  <div className="resume-career-point" aria-hidden="true" />

                  <div />
                </div>

                {/* GROW */}

                <div className="resume-career-row">
                  <div />

                  <div className="resume-career-point" aria-hidden="true" />

                  <div className="resume-career-label right">
                    <strong>Grow</strong>
                  </div>
                </div>

                {/* BUILD */}

                <div className="resume-career-row">
                  <div className="resume-career-label left">
                    <strong>Build</strong>
                  </div>

                  <div className="resume-career-point" aria-hidden="true" />

                  <div />
                </div>

                {/* LEARN — BOTTOM */}

                <div className="resume-career-row">
                  <div />

                  <div className="resume-career-point" aria-hidden="true" />

                  <div className="resume-career-label right">
                    <strong>Learn</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              BOTTOM HIGHLIGHTS
             ===================================================== */}

          <div className="resume-modern-highlights reveal">
            <article className="resume-highlight">
              <span className="resume-highlight-icon">↗</span>

              <strong>Open to Network</strong>

              <p>Connect, collaborate and discover meaningful opportunities.</p>
            </article>

            <article className="resume-highlight">
              <span className="resume-highlight-icon">◎</span>

              <strong>Focused on Impact</strong>

              <p>Interested in practical solutions that create real value.</p>
            </article>

            <article className="resume-highlight">
              <span className="resume-highlight-icon">✦</span>

              <strong>Always Learning</strong>

              <p>
                Continuously improving through practice, projects and curiosity.
              </p>
            </article>
          </div>

          {/* =====================================================
              BOTTOM STATEMENT
             ===================================================== */}

          <div className="resume-modern-footer reveal">
            <p className="resume-modern-quote">
              Consistent learning today, better opportunities tomorrow.
            </p>

            <span className="resume-modern-signature">— Rohit Kumar</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ResumePage;
