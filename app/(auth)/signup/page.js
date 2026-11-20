import { redirect } from "next/navigation";
import AuthScreen from "@/components/features/AuthScreen";
import SignUpForm from "@/components/features/SignUpForm";
import { getCurrentUser } from "@/lib/auth";
import { safePath } from "@/lib/safe-path";

export const metadata = {
  title: "Opret profil",
};

// Figma: "Opret profil – trin 1" (node 3530:26361) og "– trin 2" (3540:26537).
// Billedet og layoutet kommer fra AuthScreen, de to trin fra SignUpForm.
export default async function SignUpPage({ searchParams }) {
  // ?error=true sættes af signUp, når profilen ikke kunne oprettes
  // ?next= er hvor man skal hen bagefter, fx tilbage til bestillingen
  const { error, next } = await searchParams;
  const nextPath = safePath(next, "/profile");

  // Allerede logget ind? Så er der intet at gøre her
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <AuthScreen>
      <SignUpForm next={nextPath} error={Boolean(error)} />
    </AuthScreen>
  );
}
