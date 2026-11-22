import Image from "next/image";
import Link from "next/link";
import LinkLoader from "@/components/features/loading/LinkLoader";
import styles from "./CinemaCard.module.css";

// Ét biografkort på /biografer. Figma: "Biografkort".
// Billedet fylder kortet, og navn og by står nederst på en mørk toning. Linker til biografsiden.
//
//   cinema - { name, slug, image_url, city: { name } }
export default function CinemaCard({ cinema }) {
  return (
    <Link href={`/biografer/${cinema.slug}`} className={styles.card}>
      {/* Billedet er pynt – navnet står som tekst på kortet */}
      {cinema.image_url && (
        <Image src={cinema.image_url} alt="" fill sizes="(max-width: 48rem) 50vw, 224px" className={styles.image} />
      )}
      <span className={styles.overlay} aria-hidden="true" />

      <span className={styles.text}>
        <span className={styles.name}>{cinema.name}</span>
        <span className={styles.city}>{cinema.city.name}</span>
      </span>

      {/* Viser "Indlæser", hvis biografsiden er længe om at komme */}
      <LinkLoader />
    </Link>
  );
}
