const icons = [
  {
    name: "React",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  {
    name: "Node.js",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  {
    name: "Python",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    name: "MongoDB",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  },
  {
    name: "JavaScript",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  {
    name: "Express",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  },
  {
    name: "HTML5",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  },
  {
    name: "CSS3",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
  {
    name: "Git",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  },
  {
    name: "TensorFlow",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
  },
];

function TechIllustration() {
  const step = 360 / icons.length;

  return (
    <div className="orbit-wrap">
      {/* FIXED CENTER LAPTOP */}
      <div className="orbit-laptop">
        <svg viewBox="0 0 200 140" width="200" aria-hidden="true">
          <rect
            x="10"
            y="10"
            width="180"
            height="110"
            rx="8"
            fill="#111820"
            stroke="#273342"
          />

          <rect x="20" y="24" width="70" height="6" rx="2" fill="#ffb454" />

          <rect x="20" y="38" width="120" height="6" rx="2" fill="#4fd8c4" />

          <rect x="20" y="52" width="90" height="6" rx="2" fill="#64748b" />

          <rect x="20" y="66" width="130" height="6" rx="2" fill="#94a3b8" />

          <rect x="20" y="80" width="80" height="6" rx="2" fill="#4fd8c4" />

          <path
            d="M0 130 L200 130 L215 145 L-15 145 Z"
            fill="#18212c"
            stroke="#273342"
          />
        </svg>
      </div>

      {/* ROTATING TECHNOLOGY ORBIT */}
      <div className="orbit-ring">
        {icons.map((ic, i) => (
          <div
            className="orbit-icon"
            key={ic.name}
            style={{
              "--orbit-angle": `${i * step}deg`,
            }}
          >
            <div className="orbit-icon-spin">
              <img src={ic.url} alt={ic.name} loading="lazy" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TechIllustration;
