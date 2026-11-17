"use server";

// Server action til tilmelding af nyhedsbrevet i footeren.
// Den bruges sammen med useActionState i NewsletterForm og returnerer et svar,
// som formularen viser: enten en fejl eller en besked om, at det lykkedes.
//
// Studieprojekt: der findes ingen tabel til nyhedsbrevet i databasen,
// så vi tjekker kun e-mailen og gemmer den ikke.
export async function subscribeToNewsletter(previousState, formData) {
  // Læs e-mailen fra feltet og fjern mellemrum før og efter
  const email = String(formData.get("newsletter-email") ?? "").trim();

  // Et simpelt tjek: en e-mail skal indeholde et @
  if (!email.includes("@")) {
    return {
      error: { code: "invalid_email", message: "Skriv en gyldig e-mailadresse, fx navn@mail.dk." },
    };
  }

  return { success: true };
}
