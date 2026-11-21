"use client";

import { useEffect, useRef, useState } from "react";
import PosterPlaceholder from "./PosterPlaceholder";

// Filmens plakat. Mangler billedet, eller kan det ikke hentes, vises PosterPlaceholder i stedet
//
//   src         - billedets adresse (poster_url)
//   title       - filmens titel
//   className   - ekstra CSS-klasse
//   placeholder - false = vis ingenting i stedet (standard: true)
export default function Poster({ src, title, className, placeholder = true }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);

  // Billedet kan fejle, før React lytter efter onError. Så tjekker vi her
  useEffect(() => {
    const image = ref.current;
    if (image?.complete && image.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  if (!src || failed) {
    return placeholder ? <PosterPlaceholder title={title} /> : null;
  }

  // alt="", fordi titlen står ved siden af
  return <img ref={ref} src={src} alt="" className={className} onError={() => setFailed(true)} />;
}
