"use server";

// "use server" øverst: alle funktioner, der eksporteres herfra, er server actions.
// Log ind, opret profil og log ud. Formularerne sender et skjult felt "next"
// med den side, man skal hen til bagefter - fx tilbage til bestillingen.

import { redirect } from "next/navigation";
import { safePath } from "@/lib/safe-path";
import { createClient } from "@/lib/supabase/server";

// Prøver at logge ind med e-mail og adgangskode fra formularen.
// Giver fejlen fra Supabase (eller null) og siden, man skal videre til
async function tryLogIn(formData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  return { error, next: safePath(formData.get("next"), "/profile") };
}

// Log ind på /login. Går det galt, kommer man tilbage til siden med ?error=true
export async function signIn(formData) {
  const { error, next } = await tryLogIn(formData);

  if (error) {
    redirect(`/login?error=true&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

// Log ind i købet ("Har du en profil?"). Bruges med useActionState.
// Går det galt, bliver man på siden og får en besked. Går det godt, sendes man videre
export async function signInOnPage(prevState, formData) {
  const { error, next } = await tryLogIn(formData);

  if (error) {
    // Supabase siger ikke, om det er e-mailen eller adgangskoden, der er forkert (af sikkerhedshensyn)
    const message =
      error.code === "email_not_confirmed"
        ? "Du skal bekræfte din e-mail, før du kan logge ind. Tjek din indbakke."
        : "Vi kan ikke finde en profil med den e-mail og adgangskode. Tjek, at de er skrevet rigtigt, eller opret en profil.";

    // E-mailen sendes med tilbage, så feltet ikke bliver tømt
    return { error: { code: "LOGIN_FAILED", message }, email: formData.get("email") };
  }

  redirect(next);
}

export async function signUp(formData) {
  // /signup sender "name". Opret profil i købet sender fornavn og efternavn hver for sig,
  // så dem sætter vi sammen til ét navn, fx "Anna Hansen"
  const name = formData.get("name") ?? `${formData.get("first_name")} ${formData.get("last_name")}`.trim();
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safePath(formData.get("next"), "/profile");

  // Opret login i Supabase. Databasen laver selv en række i profiles med navnet (full_name)
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    redirect(`/signup?error=true&next=${encodeURIComponent(next)}`);
  }

  // Resten af oplysningerne gemmes på profilen bagefter.
  // Det kan kun lade sig gøre, når man er logget ind med det samme (data.session).
  // Skal e-mailen bekræftes først, bliver de ikke gemt
  if (data.session) {
    await supabase.from("profiles").update(readProfileDetails(formData)).eq("id", data.user.id);
  }

  redirect(next);
}

// De ekstra felter fra "Opret profil" i købet. Tomme felter bliver til null
function readProfileDetails(formData) {
  const text = (key) => formData.get(key)?.trim() || null;

  return {
    phone: text("phone"),
    postal_code: text("postal_code"),
    gender: text("gender"),
    newsletter: formData.get("newsletter") === "on", // en afkrydset checkbox sender "on"
    birthday: readBirthday(formData),
  };
}

// Dag, måned og år -> "1995-04-23". Er datoen ikke rigtig (fx 31/2) eller tom: null
function readBirthday(formData) {
  const day = Number(formData.get("birth_day"));
  const month = Number(formData.get("birth_month"));
  const year = Number(formData.get("birth_year"));
  const date = new Date(Date.UTC(year, month - 1, day));

  // Date retter selv 31/2 til 3/3 - så tjekker vi, at det stadig er den dato, man skrev
  const isRealDate =
    year >= 1900 && date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;

  return isRealDate ? date.toISOString().slice(0, 10) : null;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
