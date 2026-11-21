import Image from "next/image";
import BackLink from "@/components/ui/BackLink";
import publikum from "@/public/images/login-publikum.png";
import styles from "./AuthScreen.module.css";

/**
 * Skærmen bag Log ind og Opret profil.
 * Figma: "Log ind side" (node 761:18178), "Opret profil – trin 1" (3530:26361) og "– trin 2" (3540:26537).
 *
 * Billedet med publikum står i kolonne 1-6 og formularen i kolonne 8-11.
 * Headeren er gennemsigtig og ligger oven på billedet (data-hero-under-header).
 * Siden er lige så høj som skærmen, så man ikke skal scrolle.
 *
 * Brug AuthHeading øverst og AuthNote nederst i children:
 *
 *   <AuthScreen>
 *     <AuthHeading eyebrow="LOG IND" title="Velkommen tilbage" intro="…" />
 *     <form>…</form>
 *     <AuthNote>Ny her? <Link href="/signup">Opret profil</Link></AuthNote>
 *   </AuthScreen>
 *
 * @param {object} props
 * @param {React.ReactNode} props.children Overskrift, formular og tekst i bunden
 * @param {string} [props.backHref] Viser "Tilbage" øverst til venstre
 */
export default function AuthScreen({ children, backHref }) {
  return (
    // data-hero-under-header: headeren er gennemsigtig og ligger oven på billedet (samme regel som på filmsiden)
    <main className={styles.page} data-hero-under-header data-has-back={backHref ? true : undefined}>
      {backHref && <BackLink href={backHref} className={styles.back} />}

      {/* Billedet er kun pynt, så alt="" – skærmlæsere springer det over.
          ::after i CSS'en lægger fade-effekten oven på billedet. */}
      <div className={styles.image}>
        {/* quality={90}: mindre komprimering end standard (75), så billedet ikke bliver grynet.
            Værdien skal også stå i images.qualities i next.config.mjs. */}
        <Image src={publikum} alt="" fill sizes="50vw" quality={90} preload className={styles.photo} />
      </div>

      {/* Figma "Formular-kolonne": kolonne 8-11 i 12-kolonne-griddet, lodret i midten */}
      <div className={styles.content}>{children}</div>
    </main>
  );
}

/**
 * Figma "Overskrift": den blå linje, overskriften og en kort tekst under.
 *
 * @param {object} props
 * @param {string} props.eyebrow Den lille blå tekst øverst, fx "LOG IND"
 * @param {string} props.title Overskriften (sidens h1)
 * @param {string} props.intro Teksten under overskriften
 * @param {React.Ref<HTMLHeadingElement>} [props.titleRef] Så en formular kan flytte fokus til overskriften
 */
export function AuthHeading({ eyebrow, title, intro, titleRef }) {
  return (
    <div className={styles.heading}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      {/* tabIndex={-1}: overskriften kan få fokus fra koden uden at blive et ekstra stop med tab */}
      <h1 ref={titleRef} tabIndex={-1} className={styles.title}>
        {title}
      </h1>
      <p className={styles.intro}>{intro}</p>
    </div>
  );
}

/**
 * Den lille tekst nederst, fx "Ny her? Opret profil". Links i teksten bliver blå og fede.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export function AuthNote({ children }) {
  return <p className={styles.note}>{children}</p>;
}
