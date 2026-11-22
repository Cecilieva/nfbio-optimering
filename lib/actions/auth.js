"use server";

// Log ind, opret profil og log ud. Formularerne sender et skjult "next"-felt
// med siden, man skal tilbage til bagefter, fx bookingen.

import { redirect } from "next/navigation";
import { claimBooking } from "@/lib/booking-owner";
import { safePath } from "@/lib/safe-path";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = safePath(formData.get("next"), "/profile");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  // Gik det galt, kommer man tilbage til formularen med ?error=true
  if (error) {
    redirect(`/login?error=true&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

// Log ind i købet ("Har du en profil?"). Bruges med useActionState.
// Går det galt, bliver man på siden og får en besked. Går det godt, sendes man videre
export async function signInOnPage(prevState, formData) {
  const email = formData.get("email");
  const next = safePath(formData.get("next"), "/profile");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: formData.get("password") });

  if (error) {
    // Supabase siger ikke, om det er e-mailen eller adgangskoden, der er forkert (af sikkerhedshensyn)
    const message =
      error.code === "email_not_confirmed"
        ? "Du skal bekræfte din e-mail, før du kan logge ind. Tjek din indbakke."
        : "Vi kan ikke finde en profil med den e-mail og adgangskode. Tjek, at de er skrevet rigtigt, eller opret en profil.";

    // E-mailen sendes med tilbage, så feltet ikke bliver tømt
    return { error: { code: "LOGIN_FAILED", message }, email };
  }

  // Midt i købet går man direkte til betaling
  await goToPaymentIfClaimed(supabase, formData.get("booking_id"));

  redirect(next);
}

// Har formularen et booking_id, bliver brugeren ejer og sendes til betaling
async function goToPaymentIfClaimed(supabase, bookingId) {
  const booking = await claimBooking(supabase, bookingId);

  if (booking) {
    redirect(`/bestil/${booking.id}/betaling`);
  }
}

// Fødselsdagen som "ÅÅÅÅ-MM-DD", eller null hvis datoen ikke findes (fx 31. februar)
function toBirthday(day, month, year) {
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const isReal =
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day);
  return isReal ? date.toISOString().slice(0, 10) : null;
}

const GENDERS = ["kvinde", "mand", "andet", "vil-ikke-oplyse"];

// "Opret profil" (SignUpForm): trin 1 og 2 sendes samlet herhen.
export async function signUp(formData) {
  const next = safePath(formData.get("next"), "/profile");
  const failed = `/signup?error=true&next=${encodeURIComponent(next)}`;

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = formData.get("email");
  const password = String(formData.get("password") ?? "");
  const birthday = toBirthday(formData.get("birth_day"), formData.get("birth_month"), formData.get("birth_year"));
  const phone = String(formData.get("phone") ?? "").trim();
  const postalCode = String(formData.get("postal_code") ?? "").trim();
  const gender = formData.get("gender");

  // Browseren tjekker felterne, men man kan sende formularen uden om den – så vi tjekker igen her
  const isValid =
    firstName &&
    lastName &&
    password.length >= 8 &&
    formData.get("terms") === "on" &&
    birthday &&
    phone &&
    /^[0-9]{4}$/.test(postalCode) &&
    GENDERS.includes(gender);

  if (!isValid) {
    // Skrives i terminalen (npm run dev), så man kan se, hvorfor oprettelsen blev afvist
    console.error("signUp: felterne er ikke udfyldt rigtigt");
    redirect(failed);
  }

  // Opretter brugeren i Supabase. Databasen laver selv rækken i profiles ud fra felterne her
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        birthday,
        phone,
        postal_code: postalCode,
        gender,
        // Checkboksen sendes kun med, når den er krydset af
        newsletter: formData.get("newsletter") === "on",
      },
    },
  });

  if (error) {
    // Supabase' egen fejl i terminalen, fx "email rate limit exceeded" eller "User already registered"
    console.error("signUp: Supabase sagde nej –", error.message);
    redirect(failed);
  }

  // Er "Confirm email" slået til i Supabase, er man ikke logget ind endnu (ingen session),
  // før man har trykket på linket i mailen. Så sender vi en til login med besked om at tjekke mailen.
  // Er det slået fra, er man logget ind med det samme og kommer direkte videre.
  if (!data.session) {
    redirect(`/login?confirm=true&next=${encodeURIComponent(next)}`);
  }

  // Midt i købet går man direkte til betaling
  await goToPaymentIfClaimed(supabase, formData.get("booking_id"));

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Efter log ud kommer man tilbage til Log ind
  redirect("/login");
}
