import Image from "next/image";
import styles from "./Spotlight.module.css";

// Figma "Lyskegle (drejepunkt)": en lyskegle fra en biografprojektor.
// Når siden loader, blinker den tændt og svinger fra side til side (2,4 sekunder).
// Hele animationen ligger i Spotlight.module.css – der er ingen JavaScript.
//
// Sådan virker det: den ydre <div> er "drejepunktet" (det punkt, keglen drejer om).
// Den sidder øverst i midten af forælderen. Når drejepunktet roteres, svinger keglen.
export default function Spotlight() {
  return (
    // aria-hidden: den er kun pynt, så skærmlæsere springer den over
    <div className={styles.pivot} aria-hidden="true">
      <Image
        className={styles.cone}
        src="/lyskegle.svg"
        alt=""
        width={1196}
        height={814}
        priority
      />
    </div>
  );
}
