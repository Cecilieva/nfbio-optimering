import Image from "next/image";
import styles from "./CinemaHero.module.css";

// Toppen af biografsiden. Figma: "By-header".
// Publikumsbilledet fylder bredden, og "Velkommen i" + biografens navn står til venstre på en mørk toning.
//
//   name  - fx "Aarhus Bio"
//   image - billedet (cinemas.image_url) – eller null
export default function CinemaHero({ name, image }) {
  return (
    <header className={styles.hero}>
      {image && <Image src={image} alt="" fill priority sizes="100vw" className={styles.image} />}
      <span className={styles.fade} aria-hidden="true" />

      <h1 className={styles.title}>
        <span className={styles.welcome}>Velkommen i</span>
        <span className={styles.name}>{name}</span>
      </h1>
    </header>
  );
}
