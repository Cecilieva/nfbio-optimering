import { redirect } from "next/navigation";
import FormLoader from "@/components/features/loading/FormLoader";
import UserBadge from "@/components/features/auth/UserBadge";
import { signOut } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentProfile } from "@/lib/data/profile";

export const metadata = {
  title: "Profil",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Your row from profiles: id, full_name, phone, points and favorite_cinema_id – plus your email
  const profile = await getCurrentProfile();

  // Logged in, but no row in profiles: the trigger did not create it at sign up
  if (!profile) {
    return (
      <main id="indhold">
        <h1>Profil</h1>
        <p>Vi kunne ikke finde en profil for {user.email}.</p>
        <form action={signOut} className="form">
          <button type="submit">Log ud</button>
          {/* Viser "Indlæser", mens formularen sendes */}
          <FormLoader />
        </form>
      </main>
    );
  }

  return (
    <main id="indhold">
      <h1>Profil</h1>
      <UserBadge profile={profile} />
      <p>E-mail: {profile.email}</p>
      {profile.phone && <p>Telefon: {profile.phone}</p>}
      <p>Point: {profile.points}</p>
      <form action={signOut} className="form">
        <button type="submit">Log ud</button>
        {/* Viser "Indlæser", mens formularen sendes */}
        <FormLoader />
      </form>
    </main>
  );
}
