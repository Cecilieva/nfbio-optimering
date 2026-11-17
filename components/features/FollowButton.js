"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import styles from "./FollowButton.module.css";

// How long the message under the button stays visible
const TOAST_MS = 3000;

/**
 * "Følg film" på "Kommer snart"-kortet. Figma: "Notifikationsknap" med "Toast".
 * Klik viser en kort besked om, at man får besked, når billetsalget åbner.
 * Følgningen gemmes ikke endnu – det er kun beskeden.
 *
 * @param {object} props
 * @param {string} props.title Filmens titel (til skærmlæsere)
 */
export default function FollowButton({ title }) {
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
    <div className={styles.wrapper}>
      <Button variant="outline" onClick={handleClick} aria-pressed={following} aria-label={`Følg ${title}`}>
        <Image src="/icons/bell.svg" alt="" width={16} height={18} />
        Følg film
      </Button>

      {/* role="status" læser beskeden op for skærmlæsere, når den dukker op */}
      <p role="status" className={styles.toast} data-visible={showToast}>
        {showToast && "Vi giver besked på mail, når billetsalget åbner."}
      </p>
    </div>
  );
}
