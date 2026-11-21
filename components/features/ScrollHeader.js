// "use client" betyder, at komponenten kører i browseren.
// Det er nødvendigt, fordi den lytter på, når siden scroller.
"use client";

import { useEffect, useRef, useState } from "react";

// Så mange pixels skal man scrolle, før headeren skifter. Så blinker den ikke ved små ryk.
const THRESHOLD = 8;

/**
 * <header>-elementet til Header. Det gemmer headeren, når man scroller ned,
 * og viser den igen, så snart man scroller op.
 * Sætter data-hidden, som Header.module.css bruger til at lade headeren glide op og ud af skærmen.
 */
export default function ScrollHeader({ className, children }) {
  const ref = useRef(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    function update() {
      frame = 0;
      const y = window.scrollY;
      const height = ref.current?.offsetHeight ?? 0;

      // Helt øverst vises headeren altid
      if (y <= height) {
        setHidden(false);
        lastY = y;
        return;
      }

      const delta = y - lastY;
      if (Math.abs(delta) < THRESHOLD) return;

      // Ned = gem, op = vis
      setHidden(delta > 0);
      lastY = y;
    }

    // Vi regner kun én gang pr. skærmbillede, selvom scroll-eventet kommer tit
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={ref}
      className={className}
      data-hidden={hidden || undefined}
    >
      {children}
    </header>
  );
}
