import Image from "next/image";
import styles from "./BearRating.module.css";

// De 6 bjørne, der altid vises (Nordisk Film giver 0–6 bjørne)
const ALL_BEARS = [1, 2, 3, 4, 5, 6];

/**
 * Bedømmelsen med bjørne, fx 4 hvide bjørne + 2 falmede + teksten "4 / 6".
 * Figma: "Anmeldelse" – varianterne Bjørne=0 til Bjørne=6
 *
 * @param {object} props
 * @param {number} props.rating et tal fra 0 til 6, fx 4 eller 4.5
 */
export default function BearRating({ rating }) {
  // Rund til hele bjørne, fx 4.5 → 5
  const bears = Math.round(rating);

  return (
    // En skærmlæser siger bare "4 ud af 6 bjørne" i stedet for at læse hver bjørn op
    <div className={styles.rating} role="img" aria-label={`${bears} ud af 6 bjørne`}>
      {/* aria-hidden = skjult for skærmlæsere (de har allerede fået teksten ovenfor) */}
      <span className={styles.bears} aria-hidden="true">
        {/* Bjørn nr. 1 til "bears" er fyldte, resten er falmede.
            Fx ved 4: bjørn 1–4 fyldte, bjørn 5–6 falmede */}
        {ALL_BEARS.map((number) => (
          <span key={number} className={styles.bear} data-filled={number <= bears}>
            <Image src="/icons/bear.svg" alt="" width={25} height={19} />
          </span>
        ))}
      </span>
      <span className={styles.score} aria-hidden="true">
        {bears} / 6
      </span>
    </div>
  );
}
