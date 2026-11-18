"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import styles from "./FollowButton.module.css";

// How long the message under the button stays visible
const TOAST_MS = 3000;

/**
 * Knappen med klokken. Figma: "Notifikationsknap" med "Toast".
 * Klik viser en kort besked om, at man får besked, når billetsalget åbner.
 * Følgningen gemmes ikke endnu – det er kun beskeden.
 *
 * Varianter:
 *   default – "Følg film" med lys kant øverst på det store "Kommer snart"-kort
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
  const label = isCard ? "Giv mig besked" : "Følg film";

  const [following, setFollowing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Skjul beskeden igen efter lidt tid. Funktionen, der returneres, stopper timeren, hvis man klikker igen.
  useEffect(() => {
    if (!showToast) {
      return;
    }
    const timer = setTimeout(() => setShowToast(false), TOAST_MS);
    return () => clearTimeout(timer);
  }, [showToast]);

  function handleClick() {
    const next = !following;
    setFollowing(next);
    setShowToast(next);
  }

  return (
    <div className={styles.wrapper} data-variant={variant}>
      {/* På et kort er knappen blå (Button "primary"), ellers har den en lys kant (Button "outline") */}
      <Button
        variant={isCard ? "primary" : "outline"}
        className={isCard ? styles.cardButton : undefined}
        onClick={handleClick}
        aria-pressed={following}
        aria-label={isCard ? `Giv mig besked om ${title}` : `Følg ${title}`}
      >
        <Image src="/icons/bell.svg" alt="" width={16} height={18} />
        {label}
      </Button>

      {/* role="status" læser beskeden op for skærmlæsere, når den dukker op */}
      <p role="status" className={styles.toast} data-visible={showToast}>
        {showToast && "Vi giver besked på mail, når billetsalget åbner."}
      </p>
    </div>
  );
}
