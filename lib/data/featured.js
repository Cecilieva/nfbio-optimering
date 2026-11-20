import { getTicketSaleOpens } from "@/lib/data/ticket-sale";
import { createClient } from "@/lib/supabase/server";

const MOVIE_FIELDS = "id, title, slug, director, genres, premiere_date, poster_url, hero_url, trailer_url";

// De store "Kommer snart"-kort øverst på /film (Figma node 11:34) i den rækkefølge, de vises.
// Den første skal blive Sunrise: hero'ens sidste plakat (Sunrise) folder sig ud til det kort.
// Listen er fast, så kortene altid ser ens ud (fx til eksamen).
// Vil I vise andre film, så ret slugs her. En slug, der ikke findes i databasen, springes over.
const FEATURED_SLUGS = ["sunrise-on-the-reaping", "den-glemte-oe", "katten-med-hatten"];

// Sunrise har hverken billede eller medvirkende i databasen, så de manglende værdier kommer fra Figma
// ("Kommende film – kort", node 1758:9817). Findes værdien i databasen, bruges den i stedet.
const FIGMA_FALLBACKS = {
  "sunrise-on-the-reaping": {
    series: "The Hunger Games",
    director: "Francis Lawrence",
    premiere_date: "2026-12-20",
    genres: ["Action", "drama", "science fiction"],
    hero_url: "/images/featured/sunrise-on-the-reaping.jpg",
  },
};

// Titlen i databasen indeholder serien ("The Hunger Games: …"), som kortet viser over titlen i stedet
const TITLE_OVERRIDES = {
  "sunrise-on-the-reaping": "Sunrise on the Reaping",
};

// Sand, når databasen ikke har en værdi: null eller en tom liste
function isEmpty(value) {
  return value === null || (Array.isArray(value) && value.length === 0);
}

export async function getFeaturedMovies() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("movies").select(MOVIE_FIELDS).in("slug", FEATURED_SLUGS);

  if (error) {
    throw error;
  }

  return FEATURED_SLUGS.map((slug) => data.find((movie) => movie.slug === slug))
    .filter(Boolean)
    .map((movie) => {
      const featured = { ...FIGMA_FALLBACKS[movie.slug] };
      for (const [key, value] of Object.entries(movie)) {
        if (!isEmpty(value) || featured[key] === undefined) {
          featured[key] = value;
        }
      }

      return {
        ...featured,
        title: TITLE_OVERRIDES[movie.slug] ?? movie.title,
        ticket_sale_opens: getTicketSaleOpens(featured.premiere_date),
      };
    });
}
