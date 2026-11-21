import Image from "next/image";
import Button from "@/components/ui/Button";
import Overlay from "@/components/ui/Overlay";
import styles from "./ReservationExpired.module.css";

// "Tiden er udløbet" - dækker hele skærmen, når sæderne ikke holdes længere.
// Vises af login- og betalingssiden, og af Countdown, når uret rammer 00:00.
//
//   href - hvor "Vælg pladser igen" fører hen (sædevalget for samme forestilling)
export default function ReservationExpired({ href }) {
  return (
    // role="alert": skærmlæsere læser beskeden op med det samme, når den dukker op
    <Overlay
      role="alert"
      title="Tiden er udløbet"
      // Det tomme popkorn-bæger, der svinger fra side til side. Kun pynt, så alt=""
      illustration={<Image src="/popcorn/baeger.svg" alt="" width={90} height={73} className={styles.cup} />}
    >
      <p className={styles.text}>
        Vi beklager, men din bestilling er udløbet. Du kan begynde forfra ved at trykke på knappen nedenunder
      </p>
      {/* Fører tilbage til sædevalget, så man kan starte forfra */}
      <Button href={href}>Vælg pladser igen</Button>
    </Overlay>
  );
}
