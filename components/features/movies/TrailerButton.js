// "use client" = komponenten kører i browseren, fordi den reagerer på klik og husker om vinduet er åbent
"use client";

import Image from "next/image";
import { useState } from "react";
import Curtain from "./Curtain";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import styles from "./TrailerButton.module.css";

/**
 * Knappen "Se trailer". Et klik åbner traileren i et pop op-vindue (Modal).
 * Bruges både i toppen af filmsiden og under plakaten i MovieDetails.
 *
 * @param {object} props
 * @param {string} [props.trailerUrl] link til traileren på YouTube (valgfri).
 *   Har filmen ikke et link, står der "Traileren er ikke ude endnu." i vinduet.
 * @param {string} props.title filmens titel - bruges i vinduets overskrift
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

      {/* pop op-vinduet med traileren */}
      <Modal open={open} onClose={() => setOpen(false)} title={`${title} – officiel trailer`}>
        {/* videoen loader først når vinduet åbner, og stopper når det lukker
            fortæppet ligger ovenpå og går til siden */}
        {open && (
          <Curtain>
            {embedUrl ? (
              <iframe
                className={styles.video}
                src={embedUrl}
                title={`Trailer: ${title}`}
                // må starte af sig selv + fuld skærm
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <p className={styles.empty}>Traileren er ikke ude endnu.</p>
            )}
          </Curtain>
        )}
      </Modal>
    </>
  );
}

// Et almindeligt YouTube-link kan ikke vises inde på vores egen side – YouTube blokerer det.
// YouTube har en særlig udgave af linket (med /embed/), som gerne må vises på andre sider.
// Den her funktion laver det almindelige link om til den udgave:
//   https://www.youtube.com/watch?v=ABC -> https://www.youtube.com/embed/ABC?autoplay=1&rel=0
//   https://youtu.be/ABC                -> https://www.youtube.com/embed/ABC?autoplay=1&rel=0
// autoplay=1 → starter selv, rel=0 -> kun forslag fra samme kanal bagefter
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
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}?autoplay=1&rel=0`;
    }
    // Kort YouTube-link: video-id'et står efter skråstregen, fx youtu.be/ABC
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}?autoplay=1&rel=0`;
    }
  } catch {
    // Ikke et gyldigt link – så bruger vi det bare, som det er
  }
  return url;
}

