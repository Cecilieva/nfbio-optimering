"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import styles from "./FollowButton.module.css";

// How long the message under the button stays visible
const TOAST_MS = 3000;
// How long the bell rings before the button turns on (same as --duration-bell-ring in tokens.css)
const RING_MS = 500;

/**
 * Knappen med klokken. Figma: "Notifikationsknap" (node 1118:26041) med "Toast".
 * Klik viser en kort besked om, at man får besked, når billetsalget åbner.
 * Følgningen gemmes ikke endnu – det er kun beskeden.
 *
 * Varianter:
 *   default – "Følg film" med kant, fx øverst på det store "Kommer snart"-kort. Tilstandene fra Figma:
 *             Fra (kant og tekst) → klik: Ringer 1–4 (klokken ringer) → Til (blå knap med fyldt klokke
 *             og beskeden) → Til stille (beskeden er væk efter 3 sekunder). Et klik mere slår den fra igen.
 *   card    – "Giv mig besked" som blå knap midt på en plakat under "Kommende film"
 *             (Figma "Filmplakat", Property 1=få notifikationer)
 *
 * @param {object} props
 * @param {string} props.title Filmens titel (til skærmlæsere)
 * @param {"default" | "card"} [props.variant="default"]
 */
export default function FollowButton({ title, variant = "default" }) {
  // Teksten og udseendet afhænger af, hvor knappen står
  const isCard = variant === "card";

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
    if (ringing) {
      return;
    }
    // Slå fra igen
    if (following) {
      setFollowing(false);
      setShowToast(false);
      return;
    }
    // Plakat-knappen og "mindre bevægelse": slå til med det samme. Ellers ringer klokken først.
    if (isCard || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFollowing(true);
      setShowToast(true);
      return;
    }
    setRinging(true);
  }

  // Plakat-knappen: altid blå med "Giv mig besked". Ellers Figma "Notifikationsknap": kant og "Følg film" (Fra),
  // eller blå med kun den fyldte klokke (Til).
  const on = !isCard && following;
  return (
    <div className={styles.wrapper} data-variant={variant}>
      <Button
        variant={isCard || on ? "primary" : "outline"}
        className={isCard ? styles.cardButton : on ? styles.on : undefined}
        onClick={handleClick}
        aria-pressed={following}
        aria-label={isCard ? `Giv mig besked om ${title}` : `Følg ${title}`}
      >
        <Image
          src={on ? "/icons/bell-filled.svg" : "/icons/bell.svg"}
          alt=""
          width={16}
          height={18}
          className={styles.bell}
          data-ringing={ringing || undefined}
        />
        {isCard ? "Giv mig besked" : !on && "Følg film"}
      </Button>

      {/* role="status" læser beskeden op for skærmlæsere, når den dukker op */}
      <p role="status" className={styles.toast} data-visible={showToast}>
        {showToast && "Vi giver besked på mail, når billetsalget åbner."}
      </p>
    </div>
  );
}
