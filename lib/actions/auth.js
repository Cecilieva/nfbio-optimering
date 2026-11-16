"use server";

// "use server" at the top of the file: every exported function is a Server Action.
// The login, sign up and log out actions. The forms send a hidden "next" field
// with the page to go to afterwards – e.g. back to the booking.

import { redirect } from "next/navigation";
import { safePath } from "@/lib/safe-path";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safePath(formData.get("next"), "/profile");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Something went wrong: back to the form with ?error=true in the URL
  if (error) {
    redirect(`/login?error=true&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function signUp(formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safePath(formData.get("next"), "/profile");

  // Create the login in Supabase Auth.
  // The on_auth_user_created trigger creates your row in profiles,
  // and reads full_name from the data we send here.
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    redirect(`/signup?error=true&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
