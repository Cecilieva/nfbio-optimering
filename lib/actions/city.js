"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CITY_COOKIE } from "@/lib/data/cities";
import { safePath } from "@/lib/safe-path";

// Ét år i sekunder (60 sek × 60 min × 24 timer × 365 dage)
const ONE_YEAR = 60 * 60 * 24 * 365;

// Server action: kører på serveren, når man klikker på en by på Vælg by.
// Den gemmer den valgte by i en cookie og sender brugeren videre til næste side.
export async function selectCity(formData) {
  // Læs de skjulte felter fra formularen
  const cityId = formData.get("city_id");
  const next = safePath(formData.get("next"), "/film");

  // Gem byens id i cookien "nf_city", så vi husker den i et år.
  // path "/" betyder, at cookien virker på alle sider på sitet.
  const cookieStore = await cookies();
  cookieStore.set(CITY_COOKIE, String(cityId), {
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });

  // Send brugeren videre til næste side (som standard filmoversigten)
  redirect(next);
}
