import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import TextField from "@/components/ui/TextField";
import { signIn } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { safePath } from "@/lib/safe-path";
import publikum from "@/public/images/login-publikum.png";
import styles from "./page.module.css";

export const metadata = {
  title: "Log ind",
};

// Figma: "Log ind side" (node 761:18178).
// Billede til venstre og formularen til højre. Headeren kommer fra (login)/layout.js – siden har ingen footer som i Figma.
export default async function LoginPage({ searchParams }) {
  // ?error=true sættes af signIn, når e-mail eller adgangskode er forkert
  // ?next= er hvor man skal hen bagefter, fx tilbage til bestillingen
  const { error, next } = await searchParams;
  const nextPath = safePath(next, "/profile");

  // Allerede logget ind? Så er der intet at gøre her
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    // data-hero-under-header: headeren er gennemsigtig og ligger oven på billedet (samme regel som på filmsiden)
    <main className={styles.page} data-hero-under-header>
      {/* Billedet er kun pynt, så alt="" – skærmlæsere springer det over.
          ::after i CSS'en lægger fade-effekten oven på billedet. */}
      <div className={styles.image}>
        {/* quality={90}: mindre komprimering end standard (75), så billedet ikke bliver grynet.
            Værdien skal også stå i images.qualities i next.config.mjs. */}
        <Image src={publikum} alt="" fill sizes="50vw" quality={90} preload className={styles.photo} />
      </div>

      {/* Figma "Formular-kolonne": kolonne 8-11 i 12-kolonne-griddet, lodret i midten */}
      <div className={styles.content}>
        {/* Figma "Overskrift" */}
        <div className={styles.heading}>
          <p className={styles.eyebrow}>LOG IND</p>
          <h1 className={styles.title}>Velkommen tilbage</h1>
          <p className={styles.intro}>Log ind for at se de nyeste film og dine billetter.</p>
        </div>

        {/* Figma "Felter og knapper": felterne, "eller" og de to andre måder at logge ind på med 16px imellem */}
        <div className={styles.fields}>
          <form action={signIn} className={styles.form}>
            {/* Sendes med, så signIn ved hvor man skal hen bagefter */}
            <input type="hidden" name="next" value={nextPath} />

            {/* Fejlen vises med det samme for skærmlæsere (role="alert") */}
            {error && (
              <p className={styles.error} role="alert">
                Forkert e-mail eller adgangskode.
              </p>
            )}

            <TextField
              label="E-mail"
              name="email"
              type="email"
              placeholder="navn@mail.dk"
              autoComplete="email"
              required
            />
            <TextField
              label="Adgangskode"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            <div className={styles.row}>
              {/* Supabase husker allerede login i en cookie, så feltet bruges ikke endnu */}
              <Checkbox label="Husk mig" name="remember" />
              {/* TODO: Der findes ingen side til at nulstille adgangskoden endnu */}
              <button type="button" className={styles.forgot} disabled>
                Glemt adgangskode?
              </button>
            </div>

            <Button type="submit" className={styles.fullWidth}>
              Log ind
            </Button>
          </form>

          {/* Stregen med "eller" i midten. aria-hidden, fordi den kun er pynt */}
          <div className={styles.divider} aria-hidden="true">
            <span>eller</span>
          </div>

          {/* TODO: Login med Apple og Google er ikke sat op i Supabase endnu, så knapperne er slået fra.
              variant="more" har kanten border/Standard som i Figma. */}
          <Button variant="more" className={styles.fullWidth} disabled>
            Fortsæt med Apple
          </Button>
          <Button variant="more" className={styles.fullWidth} disabled>
            Fortsæt med Google
          </Button>
        </div>

        <p className={styles.signup}>
          Ny her? <Link href={`/signup?next=${encodeURIComponent(nextPath)}`}>Opret profil</Link>
        </p>
      </div>
    </main>
  );
}
