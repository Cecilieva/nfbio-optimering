import Link from "next/link";
import { redirect } from "next/navigation";
import AuthScreen, { AuthHeading, AuthNote } from "@/components/features/AuthScreen";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import FormError from "@/components/ui/FormError";
import InvalidFieldsMessage from "@/components/ui/InvalidFieldsMessage";
import TextField from "@/components/ui/TextField";
import { signIn } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { safePath } from "@/lib/safe-path";
import styles from "./page.module.css";

export const metadata = {
  title: "Log ind",
};

// Figma: "Log ind side" (node 761:18178).
// Billedet, overskriften og layoutet kommer fra AuthScreen. Headeren kommer fra (auth)/layout.js – ingen footer som i Figma.
export default async function LoginPage({ searchParams }) {
  // ?error=true sættes af signIn, når e-mail eller adgangskode er forkert
  // ?confirm=true sættes af signUp, når man skal bekræfte sin e-mail, før man kan logge ind
  // ?next= er hvor man skal hen bagefter, fx tilbage til bestillingen
  const { error, confirm, next } = await searchParams;
  const nextPath = safePath(next, "/profile");

  // Allerede logget ind? Så er der intet at gøre her
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <AuthScreen>
      <AuthHeading
        eyebrow="LOG IND"
        title="Velkommen tilbage"
        intro="Log ind for at se de nyeste film og dine billetter."
      />

      {/* Figma "Felter": felterne, "Husk mig" og "Log ind" med 16px imellem */}
      <form action={signIn} className={styles.form}>
        {/* Sendes med, så signIn ved hvor man skal hen bagefter */}
        <input type="hidden" name="next" value={nextPath} />

        {/* Lige efter "Opret profil": man skal bekræfte sin e-mail først (role="status" læses op af skærmlæsere) */}
        {confirm && !error && (
          <p className={styles.notice} role="status">
            Vi har sendt dig en mail. Bekræft din e-mail, og log så ind.
          </p>
        )}

        {/* Fejlen forsvinder, når man skriver igen, og kommer ikke igen ved genindlæsning (se FormError) */}
        {error && <FormError className={styles.error}>Forkert e-mail eller adgangskode.</FormError>}
        {/* "Udfyld de markerede felter.", når et felt mangler eller er forkert – felterne får rød kant */}
        <InvalidFieldsMessage className={styles.error} />

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

      <AuthNote>
        Ny her? <Link href={`/signup?next=${encodeURIComponent(nextPath)}`}>Opret profil</Link>
      </AuthNote>
    </AuthScreen>
  );
}
