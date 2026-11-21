import Image from "next/image";
import illustration from "@/public/images/404-illustration.png";
import styles from "./MessagePage.module.css";

// En side med en besked: illustrationen til venstre, tekst og knapper til højre.
// Bruges af 404-siden og fejlsiden (ErrorState)
//
//   eyebrow  - den blå tekst øverst, fx "Åh nej.."
//   title    - overskriften
//   children - teksten under overskriften
//   buttons  - knapperne
export default function MessagePage({ eyebrow, title, children, buttons }) {
  return (
    <main id="indhold" className={styles.page}>
      {/* Kun pynt, så alt="" */}
      <Image src={illustration} alt="" sizes="340px" className={styles.illustration} preload />

      <div className={styles.text}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.intro}>{children}</p>
        <div className={styles.buttons}>{buttons}</div>
      </div>
    </main>
  );
}
