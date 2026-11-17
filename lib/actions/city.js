"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CITY_COOKIE } from "@/lib/data/cities";
import { safePath } from "@/lib/safe-path";

// Saves the chosen city in a cookie for a year, and goes back to where the user came from
export async function selectCity(formData) {
  const cityId = formData.get("city_id");
  const next = safePath(formData.get("next"), "/film");

  const cookieStore = await cookies();
  cookieStore.set(CITY_COOKIE, String(cityId), {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(next);
}
