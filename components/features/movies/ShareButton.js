// "use client": knappen kører i browseren, fordi den reagerer på klik
"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/Button";

// Knappen "Del" på filmsiden. På telefonen åbner den del-menuen.
// På computeren kopieres linket, og der står "Link kopieret" i 2 sekunder.
//
//   title - filmens titel
export default function ShareButton({ title }) {
  // true = der står "Link kopieret"
  const [copied, setCopied] = useState(false);

  function handleClick() {
    // Adressen på siden, fx https://…/film/clayface
    const url = window.location.href;

    // Har browseren en del-menu, åbnes den. Lukker man den uden at dele, sker der ingenting
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
      return;
    }

    // Ellers kopieres linket. Teksten skifter kun, hvis det lykkes.
    // Vil browseren ikke kopiere (fx uden https), bliver der bare stående "Del"
    navigator.clipboard
      ?.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    // aria-label: skærmlæsere hører fx "Del Clayface"
    <Button variant="secondary" onClick={handleClick} aria-label={`Del ${title}`}>
      <Image src="/icons/share.svg" alt="" width={18} height={18} />
      {/* aria-live: "Link kopieret" bliver læst op */}
      <span aria-live="polite">{copied ? "Link kopieret" : "Del"}</span>
    </Button>
  );
}
