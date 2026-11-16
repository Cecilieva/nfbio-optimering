import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Returns the logged-in user's row from profiles plus their email, or null.
// The row has the same id as the login, so we find it with user.sub.
// profiles has no email column, so we take it from the claims.
// The row is created by the on_auth_user_created trigger at sign up (supabase/supabase_schema.sql).
// If it is missing, we return null and let the page handle it.
export async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.sub).maybeSingle();

  if (!data) {
    return null;
  }

  return { ...data, email: user.email };
}
