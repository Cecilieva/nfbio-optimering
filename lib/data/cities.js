import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

// The chosen city's id is kept in this cookie. lib/actions/city.js sets it.
export const CITY_COOKIE = "nf_city";

// Byen, der altid står øverst på Vælg by og i byskiftet (som i Figma)
const FIRST_CITY = "Storkøbenhavn";

export async function getCities() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, name, slug, latitude, longitude");

  if (error) {
    throw error;
  }

  // Storkøbenhavn står altid øverst. Resten sorteres efter det danske alfabet,
  // så fx Kolding kommer før Køge.
  // På dansk sorteres "aa" som "å" (helt til sidst). Det vil vi ikke - Aalborg og Aarhus skal stå
  // først som i Figma. Derfor sætter vi en usynlig bindestreg (\u00AD) ind mellem de to a'er,
  // når vi sammenligner. Navnene, der vises, bliver ikke ændret.
  const sortKey = (name) =>
    name.replace(/aa/gi, (match) => `${match[0]}\u00AD${match[1]}`);
  return data.sort((a, b) => {
    if (a.name === FIRST_CITY) return -1;
    if (b.name === FIRST_CITY) return 1;
    return sortKey(a.name).localeCompare(sortKey(b.name), "da");
  });
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
