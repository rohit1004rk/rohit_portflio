import { useEffect, useRef } from "react";

// Adds a reveal-on-scroll animation to a container.
// Re-runs when dynamic content changes.
// Respects prefers-reduced-motion via CSS.
export function useReveal(dependencies = null) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll(".reveal");
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    targets.forEach((target) => io.observe(target));

    return () => io.disconnect();
  }, [dependencies]);

  return ref;
}
