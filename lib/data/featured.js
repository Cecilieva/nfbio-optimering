import { getTicketSaleOpens } from "@/lib/data/ticket-sale";
import { createClient } from "@/lib/supabase/server";

const MOVIE_FIELDS = "id, title, slug, director, genres, premiere_date, poster_url, hero_url, trailer_url";

// The big "Kommer snart" cards at the top of /film (Figma node 11:34), in the order they are shown.
// The first one must stay Sunrise: the hero's last poster (Sunrise) unfolds into that card.
// The list is fixed, so the cards always look the same (e.g. at the exam).
// To feature other films, change the slugs here. A slug that is not in the database is skipped.
const FEATURED_SLUGS = ["sunrise-on-the-reaping", "den-glemte-oe", "katten-med-hatten"];

// Sunrise has no image or credits in the database, so the missing values come from Figma
// ("Kommende film – kort", node 1758:9817). Values from the database win when they exist.
const FIGMA_FALLBACKS = {
  "sunrise-on-the-reaping": {
    series: "The Hunger Games",
    director: "Francis Lawrence",
    premiere_date: "2026-12-20",
    genres: ["Action", "drama", "science fiction"],
    hero_url: "/images/featured/sunrise-on-the-reaping.jpg",
  },
};

// The database title includes the series ("The Hunger Games: …"), which the card shows above the title
const TITLE_OVERRIDES = {
  "sunrise-on-the-reaping": "Sunrise on the Reaping",
};

// True when the database has no value: null or an empty list
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
        ticket_sale_opens: getTicketSaleOpens(movie.slug),
      };
    });
}
