import Image from "next/image";
import Footer from "@/components/features/Footer";
import Header from "@/components/features/Header";
import Button from "@/components/ui/Button";
import illustration from "@/public/images/404-illustration.png";
import styles from "./not-found.module.css";

export const metadata = {
  title: "Siden blev ikke fundet",
};

// Figma: "404 side" (node 1580:35416).
// Ligger i roden uden for app/(site), så den selv viser header og footer.
export default function NotFound() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        {/* Illustrationen er kun pynt, så alt="" – skærmlæsere springer den over */}
        <Image src={illustration} alt="" sizes="340px" className={styles.illustration} preload />

        {/* Figma "Tekst" */}
        <div className={styles.text}>
          <p className={styles.eyebrow}>Åh nej..</p>
          <h1 className={styles.title}>Vi kunne ikke finde, det du leder efter.</h1>
          <p className={styles.intro}>
            Men bare rolig, du kan lynhurtigt vende tilbage til trygge rammer ved at gå til forsiden eller få hjælp fra
            vores dygtige support medarbejdere.
          </p>

          {/* Figma "Knapper" */}
          <div className={styles.buttons}>
            <Button href="/film" className={styles.button}>
              Gå til forsiden
            </Button>
            {/* TODO: Der findes ingen supportside endnu – peger på forsiden ligesom "Kontakt" i footeren */}
            <Button href="/film" variant="secondary" className={styles.button}>
              Gå til support
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
