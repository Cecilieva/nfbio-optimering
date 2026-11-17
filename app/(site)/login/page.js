import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { safePath } from "@/lib/safe-path";

export const metadata = {
  title: "Log ind",
};

export default async function LoginPage({ searchParams }) {
  // ?error=true is set by signIn when the email or password is wrong
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
      <h1>Log ind</h1>
      {error && (
        <p className="form-error" role="alert">
          Forkert e-mail eller adgangskode.
        </p>
      )}
      <form action={signIn} className="form">
        <input type="hidden" name="next" value={nextPath} />
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" placeholder="dig@eksempel.dk" autoComplete="email" required />

        <label htmlFor="password">Adgangskode</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Din adgangskode"
          autoComplete="current-password"
          required
        />

        <button type="submit">Log ind</button>
      </form>
      <p>
        Har du ingen konto? <Link href={`/signup?next=${encodeURIComponent(nextPath)}`}>Opret konto</Link>
      </p>
    </main>
  );
}
