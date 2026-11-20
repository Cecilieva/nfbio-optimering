import { getTicketSaleOpens } from "@/lib/data/ticket-sale";
import { formatDayKey, splitSeries } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const MOVIE_FIELDS = "id, title, slug, director, genres, premiere_date, hero_url, trailer_url";

// Antal store "Kommer snart"-kort øverst på /film (Figma node 11:34)
const FEATURED_COUNT = 3;

// De tre film med kortest tid til premieren: premiere i morgen eller senere, den nærmeste først.
// Har filmen premiere i dag, kører den allerede og er ikke længere "kommende".
// Listen skifter af sig selv, når en film har haft premiere, så der kommer variation i karrusellen.
// Kun film med et bredt billede (hero_url) kommer med, fordi kortet er bygget op om billedet.
export async function getFeaturedMovies() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movies")
    .select(MOVIE_FIELDS)
    .gt("premiere_date", formatDayKey(new Date()))
    .not("hero_url", "is", null)
    .order("premiere_date", { ascending: true })
    .order("title")
    // Lidt flere end 3, hvis den samme titel står i databasen flere gange (se uniqueByTitle i movies.js)
    .limit(FEATURED_COUNT * 2);

  if (error) {
    throw error;
  }

  const seen = new Set();
  return data
    .filter((movie) => !seen.has(movie.title) && seen.add(movie.title))
    .slice(0, FEATURED_COUNT)
    .map((movie) => {
      // "The Hunger Games: Sunrise on the Reaping" → serien står over titlen på kortet (Figma "Overtitel")
      const [series, title] = splitSeries(movie.title);
      return { ...movie, series, title, ticket_sale_opens: getTicketSaleOpens(movie.slug) };
    });
}
