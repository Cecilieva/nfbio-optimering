import { redirect } from "next/navigation";
import AuthScreen, { AuthHeading, AuthNote } from "@/components/features/auth/AuthScreen";
import ProfileCard, { ProfileRow } from "@/components/features/auth/ProfileCard";
import ProfileTickets from "@/components/features/auth/ProfileTickets";
import FormLoader from "@/components/features/loading/FormLoader";
import Button from "@/components/ui/Button";
import { signOut } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentProfile } from "@/lib/data/profile";
import { getMyTickets } from "@/lib/data/tickets";
import { formatBirthday } from "@/lib/format";
import styles from "./page.module.css";

export const metadata = {
  title: "Profil",
};

// Profilen: dine oplysninger og dine billetter
export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = (await getCurrentProfile()) ?? {};
  const tickets = await getMyTickets();

  // Kun fornavnet, fx "Hej Anna"
  const firstName = profile.full_name?.split(" ")[0] ?? "";

  return (
    <AuthScreen backHref="/film">
      <AuthHeading
        eyebrow="MIN PROFIL"
        title={`Hej ${firstName}`}
        intro="Her finder du dine oplysninger og dine billetter."
      />

      <div className={styles.fields}>
        {/* "–", hvis oplysningen mangler */}
        <ProfileCard title="Mine oplysninger">
          <ProfileRow label="Navn">{profile.full_name || "–"}</ProfileRow>
          <ProfileRow label="E-mail">{user.email}</ProfileRow>
          <ProfileRow label="Telefon">{profile.phone || "–"}</ProfileRow>
          <ProfileRow label="Fødselsdag">{profile.birthday ? formatBirthday(profile.birthday) : "–"}</ProfileRow>
          <ProfileRow label="Postnummer">{profile.postal_code || "–"}</ProfileRow>
        </ProfileCard>

        <ProfileTickets tickets={tickets} />

        {/* TODO: Der er ingen side til at rette profilen endnu */}
        <Button disabled>Rediger profil</Button>
      </div>

      <form action={signOut}>
        <AuthNote>
          Vil du logge ud? <button type="submit">Log ud</button>
        </AuthNote>
        <FormLoader />
      </form>
    </AuthScreen>
  );
}
