"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import styles from "./FollowButton.module.css";
import { prefersReducedMotion } from "@/lib/motion";

// How long the message under the button stays visible
const TOAST_MS = 3000;
// How long the bell rings before the button turns on (same as --duration-bell-ring in tokens.css)
const RING_MS = 500;

/**
 * Knappen med klokken. Figma: "Notifikationsknap" med "Toast".
 * Klik viser en kort besked om, at man får besked, når billetsalget åbner.
 * Følgningen gemmes ikke endnu – det er kun beskeden.
 *
 * Bruges øverst på det store "Kommer snart"-kort og på filmsiden. Tilstandene fra Figma:
 * Fra (kant og "Følg film") → klik: Ringer 1–4 (klokken ringer) → Til (blå knap med fyldt klokke og beskeden)
 * → Til stille (beskeden er væk efter 3 sekunder). Et klik mere slår den fra igen.
 *
 * Er man ikke logget ind, bliver man på siden: et klik viser bare beskeden
 * "Du skal være logget ind for at kunne følge filmen." (Figma "Ikke logget ind – besked").
 *
 * @param {object} props
 * @param {string} props.title Filmens titel (til skærmlæsere)
 * @param {boolean} [props.loggedIn] Er man logget ind? Ellers kan man ikke følge filmen
 * @param {string} [props.label] Teksten på knappen (standard: "Følg film")
 * @param {boolean} [props.wideToast] Beskeden bliver lige så bred som knaprækken (den skal have position: relative)
 * @param {boolean} [props.toastEnd] Beskeden flugter med knappens højre kant (når knappen står yderst til højre)
 */
export default function FollowButton({
  title,
  loggedIn = true,
  label = "Følg film",
  wideToast = false,
  toastEnd = false,
}) {
  const [following, setFollowing] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Skjul beskeden igen efter lidt tid. Funktionen, der returneres, stopper timeren, hvis man klikker igen.
  useEffect(() => {
    if (!showToast) {
      return;
    }
    const timer = setTimeout(() => setShowToast(false), TOAST_MS);
    return () => clearTimeout(timer);
  }, [showToast]);

  // Når klokken har ringet færdig, slås knappen til, og beskeden vises
  useEffect(() => {
    if (!ringing) {
      return;
    }
    const timer = setTimeout(() => {
      setRinging(false);
      setFollowing(true);
      setShowToast(true);
    }, RING_MS);
    return () => clearTimeout(timer);
  }, [ringing]);

  function handleClick() {
    // Ikke logget ind: vis kun beskeden om at logge ind
    if (!loggedIn) {
      setShowToast(true);
      return;
    }
    if (ringing) {
      return;
    }
    // Slå fra igen
    if (following) {
      setFollowing(false);
      setShowToast(false);
      return;
    }
    // "Mindre bevægelse": slå til med det samme. Ellers ringer klokken først.
    if (prefersReducedMotion()) {
      setFollowing(true);
      setShowToast(true);
      return;
    }
    setRinging(true);
  }

  return (
    <div className={styles.wrapper} data-wide-toast={wideToast || undefined} data-toast-end={toastEnd || undefined}>
      {/* Fra: kant og "Følg film" (Button "outline"). Til: blå knap (Button "primary") med kun den fyldte klokke. */}
      <Button
        variant={following ? "primary" : "outline"}
        className={following ? styles.on : undefined}
        onClick={handleClick}
        // Ikke logget ind: knappen kan ikke slås til, så den har ingen "trykket"-tilstand
        aria-pressed={loggedIn ? following : undefined}
        aria-label={`Følg ${title}`}
      >
        <Image
          src={following ? "/icons/bell-filled.svg" : "/icons/bell.svg"}
          alt=""
          width={16}
          height={18}
          className={styles.bell}
          data-ringing={ringing || undefined}
        />
        {!following && label}
      </Button>

      {/* role="status" læser beskeden op for skærmlæsere, når den dukker op */}
      <p role="status" className={styles.toast} data-visible={showToast} data-login={!loggedIn || undefined}>
        {showToast &&
          (loggedIn
            ? "Vi giver besked på mail, når billetsalget åbner."
            : "Du skal være logget ind for at kunne følge filmen.")}
      </p>
    </div>
  );
}
