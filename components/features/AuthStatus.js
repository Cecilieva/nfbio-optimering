import Link from "next/link";
import LinkLoader from "@/components/features/LinkLoader";
import FormLoader from "@/components/features/FormLoader";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";
import styles from "./AuthStatus.module.css";

// Shows the email and Log out when the user is logged in – or Log in when not
export default async function AuthStatus() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link href="/login" className={styles.login}>
        Log ind
        <LinkLoader />
      </Link>
    );
  }

  return (
    <div className={styles.status}>
      <Link href="/profile" className={styles.email}>
        {user.email}
        <LinkLoader />
      </Link>
      <form action={signOut}>
        <button type="submit" className={styles.logout}>
          Log ud
        </button>
        {/* Viser "Indlæser", mens formularen sendes */}
        <FormLoader />
      </form>
    </div>
  );
}
