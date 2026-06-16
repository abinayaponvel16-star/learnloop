import { useEffect, useRef, useState } from 'react';

export function useCounter(target, duration = 1400) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let animationFrame;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        // Reset every time section becomes visible
        setValue(0);

        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);

          setValue(Math.floor(target * progress));

          if (progress < 1) {
            animationFrame = requestAnimationFrame(tick);
          }
        };

        animationFrame = requestAnimationFrame(tick);
      },
      {
        threshold: 0.4,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target, duration]);

  return { ref, value };
}