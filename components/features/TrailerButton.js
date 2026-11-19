// "use client" = komponenten kører i browseren, fordi den reagerer på klik og husker om vinduet er åbent
"use client";

import Image from "next/image";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

/**
 * Knappen "Se trailer". Et klik åbner traileren i et pop op-vindue (Modal).
 * Bruges både i toppen af filmsiden og under plakaten i MovieDetails.
 *
 * @param {object} props
 * @param {string} [props.trailerUrl] link til traileren på YouTube (valgfri).
 *   Har filmen ikke et link, står der "Traileren er ikke ude endnu." i vinduet.
 * @param {string} props.title filmens titel – bruges i vinduets overskrift
 * @param {string} [props.className] ekstra CSS-klasse fra forælderen (valgfri) – fx gør MovieDetails knappen bred med den
 */
export default function TrailerButton({ trailerUrl, title, className }) {
  // true = vinduet med traileren er åbent
  const [open, setOpen] = useState(false);
  // YouTube-linket lavet om, så det kan vises inde på vores side (se toEmbedUrl nederst)
  const embedUrl = toEmbedUrl(trailerUrl);

  return (
    // <> … </> = en tom "indpakning", så vi kan returnere både knappen og vinduet
    <>
      {/* variant "secondary" = knap med kant og uden fyld */}
      <Button variant="secondary" className={className} onClick={() => setOpen(true)}>
        <Image src="/icons/play.svg" alt="" width={18} height={18} />
        Se trailer
      </Button>

      {/* Pop op-vinduet. onClose lukker det igen (fx med "Luk" eller Escape) */}
      <Modal open={open} onClose={() => setOpen(false)} title={`Trailer: ${title}`}>
        {/* Videoen hentes først, når vinduet er åbent – så siden ikke loader YouTube for ingenting.
            Når vinduet lukkes, forsvinder videoen, og den stopper med at spille. */}
        {open && embedUrl && <iframe src={embedUrl} title={`Trailer: ${title}`} allowFullScreen />}
        {open && !embedUrl && <p>Traileren er ikke ude endnu.</p>}
      </Modal>
    </>
  );
}

// Et almindeligt YouTube-link kan ikke vises inde på vores egen side – YouTube blokerer det.
// YouTube har en særlig udgave af linket (med /embed/), som gerne må vises på andre sider.
// Den her funktion laver det almindelige link om til den udgave:
//   https://www.youtube.com/watch?v=ABC -> https://www.youtube.com/embed/ABC
//   https://youtu.be/ABC                -> https://www.youtube.com/embed/ABC
// Er linket allerede den rigtige udgave, bruges det bare, som det er.
// Har filmen intet link, giver den ingenting tilbage (null) – så står der "Traileren er ikke ude endnu."
function toEmbedUrl(url) {
  if (!url) {
    return null;
  }
  try {
    // new URL deler linket op i dele, så vi kan læse domænet og ?v=…
    const parsed = new URL(url);
    // Langt YouTube-link: video-id'et står efter ?v=
    if (parsed.hostname.endsWith("youtube.com") && parsed.searchParams.has("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }
    // Kort YouTube-link: video-id'et står efter skråstregen, fx youtu.be/ABC
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
  } catch {
    // Ikke et gyldigt link – så bruger vi det bare, som det er
  }
  return url;
}
