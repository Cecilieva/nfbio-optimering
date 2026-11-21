"use client";

import { useEffect, useRef, useState } from "react";
import StepHeader from "@/components/features/StepHeader";
import LoadingDots from "@/components/ui/LoadingDots";
import PopcornShower from "@/components/ui/PopcornShower";
import styles from "./TicketPrint.module.css";

// Billetten printes: den kører ud af printersprækken.
// Først står der "Din billet klargøres til udprintning …" i 3 sekunder, så printes billetten.
// Når billetten er ude, skifter titlen til "Din billet er printet", teksten og knappen under
// billetten toner frem, og popkornene drysser som tegn på succes.
//
//   subtitle - fx "Clayface · i dag kl. 19.30 · Aarhus Bio"
//   ticket   - billetten (Ticket)
//   children - det, der kommer frem under billetten bagefter
export default function TicketPrint({ subtitle, ticket, children }) {
  const [printed, setPrinted] = useState(false);
  const paperRef = useRef(null);

  // Billetten er printet, når CSS-animationen på papiret er færdig.
  // Vi spørger animationen, hvor lang tid den har tilbage (0, hvis animationer er slået fra)
  useEffect(() => {
    const [animation] = paperRef.current.getAnimations();
    const remaining = animation ? animation.effect.getComputedTiming().endTime - animation.currentTime : 0;
    const timeout = setTimeout(() => setPrinted(true), Math.max(0, remaining));
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={styles.print}>
      <StepHeader
        step={4}
        centered
        title={
          printed ? (
            "Din billet er printet"
          ) : (
            <>
              Din billet klargøres til udprintning
              <LoadingDots />
            </>
          )
        }
        subtitle={subtitle}
      />

      <div className={styles.printer}>
        {/* Printersprækken */}
        <div className={styles.slot} />

        {/* Billetten glider ud af sprækken */}
        <div className={styles.paperWindow}>
          <div ref={paperRef} className={styles.paper}>
            {ticket}
          </div>
        </div>

        {/* Står der hele tiden (så intet hopper), men er skjult, til billetten er printet.
            aria-live: skærmlæsere læser teksten op, når den kommer frem */}
        <div className={styles.done} data-visible={printed} aria-live="polite">
          {children}
        </div>
      </div>

      <PopcornShower />
    </div>
  );
}
