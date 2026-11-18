import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// The chosen city's id is kept in this cookie. lib/actions/city.js sets it.
export const CITY_COOKIE = "nf_city";

export async function getCities() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cities").select("id, name, slug").order("name");

  if (error) {
    throw error;
  }

  return data;
}

export async function getCityById(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name, slug")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

// The city from the cookie, or null if none is chosen (or it no longer exists)
export async function getSelectedCity() {
  const cookieStore = await cookies();
  const id = Number(cookieStore.get(CITY_COOKIE)?.value);

  if (!id) {
    return null;
  }

  return getCityById(id);
}

// The cinemas in a city, e.g. for the "Biograf" filter on /film
export async function getCinemas(cityId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cinemas")
    .select("id, name, slug")
    .eq("city_id", cityId)
    .order("name");

  if (error) {
    throw error;
  }

  return data;
}
