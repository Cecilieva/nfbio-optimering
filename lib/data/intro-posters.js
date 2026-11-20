import { createClient } from "@/lib/supabase/server";

// Plakaterne, der svæver forbi i stjernehimlen på /film (HeroScroll).
// Alle film med en plakat (movies.poster_url) i tilfældig rækkefølge – ny rækkefølge ved hver sidevisning.
// Hver titel og hvert billede kommer kun med én gang, så der aldrig vises to ens plakater.
// Blandingen sker her på serveren, så browseren viser præcis den samme liste, som serveren lavede.
export async function getIntroPosters() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("movies").select("slug, title, poster_url").not("poster_url", "is", null);

  if (error) {
    throw error;
  }

  const seenTitles = new Set();
  const seenImages = new Set();
  const posters = [];
  for (const movie of data) {
    if (seenTitles.has(movie.title) || seenImages.has(movie.poster_url)) {
      continue;
    }
    seenTitles.add(movie.title);
    seenImages.add(movie.poster_url);
    posters.push({ slug: movie.slug, src: movie.poster_url });
  }

  return shuffle(posters);
}

// Fisher–Yates: bytter hvert element med et tilfældigt element før det, så alle rækkefølger er lige sandsynlige
function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
