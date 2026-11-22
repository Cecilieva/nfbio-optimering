import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Landsdelene på /biografer i Figmas rækkefølge ("Find din biograf")
export const REGIONS = ["Jylland", "København", "Sjælland og øer", "Fyn"];

// Biografens felter, som både oversigten og biografsiden bruger
const CINEMA_COLUMNS = "id, name, slug, address, image_url, city:cities!inner(id, name, slug, region, latitude, longitude)";

// Adressen står i databasen som én linje, fx "Sankt Knuds Torv 15, 8000 Aarhus C".
// Figma viser den på to linjer: gade og postnummer + by. Vi deler ved det sidste komma.
function splitAddress(address) {
  if (!address) {
    return { street: null, postal: null };
  }
  const index = address.lastIndexOf(",");
  if (index === -1) {
    return { street: address, postal: null };
  }
  return { street: address.slice(0, index).trim(), postal: address.slice(index + 1).trim() };
}

// Alle biografer med deres by – til /biografer.
// Sorteret efter navn på dansk inden for hver landsdel (som på nfbio.dk).
export async function getAllCinemas() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cinemas").select(CINEMA_COLUMNS);

  if (error) {
    throw error;
  }

  // På dansk sorteres "aa" som "å" (helt til sidst). Aalborg og Aarhus skal stå først som på nfbio.dk,
  // så vi sætter en usynlig bindestreg (\u00AD) mellem de to a'er, når vi sammenligner (som getCities)
  const sortKey = (name) => name.replace(/aa/gi, (match) => `${match[0]}\u00AD${match[1]}`);
  return data.sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name), "da"));
}

// Én biograf ud fra slug, med by og praktisk info – eller null.
// cache() = hentes kun én gang pr. side, selvom både siden og generateMetadata beder om den
export const getCinemaBySlug = cache(async (slug) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cinemas")
    .select(`${CINEMA_COLUMNS}, opening_hours, parking, transport, email`)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  return { ...data, ...splitAddress(data.address) };
});

// Biograferne, man kan søge efter i headeren (alle i hele landet).
// Kun de felter, søgningen viser. cache() = hentes kun én gang pr. side
export const getSearchCinemas = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cinemas")
    .select("id, name, slug, image_url, city:cities!inner(name)")
    .order("name");

  if (error) {
    throw error;
  }

  return data.map((cinema) => ({
    id: cinema.id,
    name: cinema.name,
    slug: cinema.slug,
    image_url: cinema.image_url,
    city: cinema.city.name,
  }));
});
