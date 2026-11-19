// "use client" = komponenten kører i browseren, fordi den reagerer på klik
"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/Button";

/**
 * Knappen "Del" på filmsiden.
 *
 * På telefoner åbner den telefonens egen del-menu (Messenger, SMS, mail osv.).
 * Hvis browseren ikke har en del-menu (fx de fleste computere),
 * kopieres linket i stedet, og knappen skriver "Link kopieret" i 2 sekunder.
 *
 * @param {object} props
 * @param {string} props.title filmens titel – sendes med, når man deler
 */
export default function ShareButton({ title }) {
  // true = linket er lige blevet kopieret → knappen viser "Link kopieret"
  const [copied, setCopied] = useState(false);

  // Det der sker, når man klikker
  function handleClick() {
    // Adressen på den side man står på, fx https://…/film/clayface
    const url = window.location.href;

    // Har browseren en del-menu? Så åbn den.
    // .catch = brugeren lukkede menuen uden at dele – det er fint, så sker der ingenting
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
      return;
    }

    // Ellers: kopiér linket, vis "Link kopieret" og skift tilbage til "Del" efter 2 sekunder
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    // Genbruger den almindelige knap (variant "secondary" = knap med kant)
    // aria-label: skærmlæsere hører "Del Clayface" i stedet for bare "Del"
    <Button variant="secondary" onClick={handleClick} aria-label={`Del ${title}`}>
      <Image src="/icons/share.svg" alt="" width={18} height={18} />
      {/* aria-live: skærmlæsere læser teksten op, når den skifter til "Link kopieret" */}
      <span aria-live="polite">{copied ? "Link kopieret" : "Del"}</span>
    </Button>
  );
}
