import Link from "next/link";
import { redirect } from "next/navigation";
import { signUp } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { safePath } from "@/lib/safe-path";

export const metadata = {
  title: "Opret konto",
};

export default async function SignUpPage({ searchParams }) {
  // ?error=true is set by signUp when Supabase says no
  // ?next= is where to go afterwards, e.g. back to the booking
  const { error, next } = await searchParams;
  const nextPath = safePath(next, "/profile");

  // Already logged in? Then there is nothing to do here
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <main>
      <h1>Opret konto</h1>
      {error && (
        <p className="form-error" role="alert">
          Kontoen kunne ikke oprettes. Måske er e-mailen allerede i brug.
        </p>
      )}
      <form action={signUp} className="form">
        <input type="hidden" name="next" value={nextPath} />
        <label htmlFor="name">Navn</label>
        <input id="name" name="name" placeholder="Dit navn" autoComplete="name" required />

        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" placeholder="dig@eksempel.dk" autoComplete="email" required />

        <label htmlFor="password">Adgangskode</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Mindst 6 tegn"
          autoComplete="new-password"
          minLength={6}
          required
        />

        <button type="submit">Opret konto</button>
      </form>
      <p>
        Har du allerede en konto? <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Log ind</Link>
      </p>
    </main>
  );
}
