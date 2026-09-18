import { useEffect, useMemo, useState } from "react";

const snippets = [
  `const developer = {
  name: "Rohit Kumar",
  role: "Full Stack + AI/ML Developer",
  skills: ["React", "Node.js", "MongoDB", "Machine Learning"],
  available: true
};`,

  `function responsibilities() {
  return [
    "Build full-stack applications",
    "Develop AI/ML solutions",
    "Design REST APIs",
    "Work with databases"
  ];
}`,

  `const techStack = {
  frontend: "React + Vite",
  backend: "Node.js + Express",
  ml: "Python + Machine Learning",
  deploy: "Vercel + Render"
};`,
];

const TOKEN_REGEX =
  /(const|function|return)\b|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(true|false)\b|([A-Za-z_$][\w$]*)|([{}[\],:();.])/g;

function tokenize(source) {
  const tokens = [];
  let lastIndex = 0;
  let match;

  TOKEN_REGEX.lastIndex = 0;

  while ((match = TOKEN_REGEX.exec(source)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "plain",
        text: source.slice(lastIndex, match.index),
      });
    }

    let type = "plain";

    if (match[1]) type = "keyword";
    else if (match[2]) type = "string";
    else if (match[3]) type = "boolean";
    else if (match[4]) type = "identifier";
    else if (match[5]) type = "punctuation";

    tokens.push({
      type,
      text: match[0],
    });

    lastIndex = TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < source.length) {
    tokens.push({
      type: "plain",
      text: source.slice(lastIndex),
    });
  }

  return tokens;
}

function CodeShowcase() {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [phase, setPhase] = useState("typing");
  const [paused, setPaused] = useState(false);

  const source = snippets[snippetIndex];

  const tokens = useMemo(() => tokenize(source), [source]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setPaused(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (paused) return undefined;

    let timer;

    if (phase === "typing") {
      if (visibleChars < source.length) {
        timer = window.setTimeout(() => {
          setVisibleChars((current) => current + 1);
        }, 13);
      } else {
        timer = window.setTimeout(() => {
          setPhase("erasing");
        }, 2400);
      }
    }

    if (phase === "erasing") {
      if (visibleChars > 0) {
        timer = window.setTimeout(() => {
          setVisibleChars((current) => current - 1);
        }, 5);
      } else {
        setSnippetIndex((current) => (current + 1) % snippets.length);
        setPhase("typing");
      }
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [phase, paused, source.length, visibleChars]);

  const renderCode = () => {
    let remaining = visibleChars;

    return tokens.map((token, index) => {
      if (remaining <= 0) return null;

      const visibleText = token.text.slice(0, remaining);

      remaining -= visibleText.length;

      if (!visibleText) return null;

      return (
        <span
          key={`${snippetIndex}-${index}`}
          style={{
            color:
              token.type === "keyword"
                ? "#8ecbff"
                : token.type === "string"
                  ? "#9be7b1"
                  : token.type === "boolean"
                    ? "#ffb454"
                    : token.type === "punctuation"
                      ? "#64748b"
                      : "#e2e8f0",
          }}
        >
          {visibleText}
        </span>
      );
    });
  };

  return (
    <section
      aria-label="Developer code showcase"
      style={{
        width: "100%",
        padding: "24px 0 64px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "min(720px, calc(100% - 32px))",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* macOS inspired code window */}
        <div
          style={{
            width: "100%",
            overflow: "hidden",
            border: "1px solid #273342",
            borderRadius: "18px",
            background: "#111820",
            boxShadow:
              "0 24px 60px rgba(0,0,0,.28), 0 0 40px rgba(79,216,196,.045)",
            boxSizing: "border-box",
          }}
        >
          {/* Window header */}
          <div
            style={{
              position: "relative",
              height: "52px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#18212c",
              borderBottom: "1px solid #273342",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "18px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "11px",
                  height: "11px",
                  borderRadius: "50%",
                  background: "#ff5f57",
                }}
              />

              <span
                style={{
                  width: "11px",
                  height: "11px",
                  borderRadius: "50%",
                  background: "#febc2e",
                }}
              />

              <span
                style={{
                  width: "11px",
                  height: "11px",
                  borderRadius: "50%",
                  background: "#28c840",
                }}
              />
            </div>

            <span
              style={{
                color: "#94a3b8",
                fontFamily:
                  '"JetBrains Mono", "Fira Code", Consolas, monospace',
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              developer.js
            </span>
          </div>

          {/* Code body */}
          <div
            style={{
              minHeight: "290px",
              padding: "32px",
              background:
                "radial-gradient(600px 300px at 85% 15%, rgba(79,216,196,.045), transparent 70%), #0b0f14",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <pre
              style={{
                margin: 0,
                padding: 0,
                color: "#e2e8f0",
                fontFamily:
                  '"JetBrains Mono", "Fira Code", Consolas, monospace',
                fontSize: "14px",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                wordBreak: "normal",
                textAlign: "left",
              }}
            >
              <code>
                {renderCode()}

                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "18px",
                    marginLeft: "4px",
                    verticalAlign: "-3px",
                    background: "#4fd8c4",
                    borderRadius: "1px",
                    boxShadow: "0 0 10px rgba(79,216,196,.3)",
                    animation: "rkCodeBlink 1s steps(1,end) infinite",
                  }}
                />
              </code>
            </pre>
          </div>
        </div>

        {/* Caption */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "0",
            marginTop: "14px",
            color: "#64748b",
            fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
            fontSize: "11px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: "#94a3b8",
              fontWeight: 600,
            }}
          >
            Rohit Kumar
          </span>

          <span
            style={{
              margin: "0 8px",
              color: "#4fd8c4",
            }}
          >
            ·
          </span>

          <span>Full Stack + AI/ML Developer</span>
        </div>
      </div>

      <style>
        {`
          @keyframes rkCodeBlink {
            0%, 49% {
              opacity: 1;
            }

            50%, 100% {
              opacity: 0;
            }
          }

          @media (max-width: 768px) {
            .rk-code-mobile-fix {
              padding: 0;
            }
          }
        `}
      </style>
    </section>
  );
}

export default CodeShowcase;
