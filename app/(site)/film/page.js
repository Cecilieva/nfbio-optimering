import { redirect } from "next/navigation";
import ComingSoonSection from "@/components/features/ComingSoonSection";
import FeaturedCarousel from "@/components/features/FeaturedCarousel";
import MovieFilter from "@/components/features/MovieFilter";
import { getCinemas, getSelectedCity } from "@/lib/data/cities";
import { getFeaturedMovies } from "@/lib/data/featured";
import { getComingSoon, getNowPlaying } from "@/lib/data/movies";
import styles from "./page.module.css";

// /film – Figma: "Forside" – films showing now in the city, and films coming soon
export default async function HomePage() {
  const city = await getSelectedCity();

  if (!city) {
    redirect("/");
  }

  // Alt hentes samtidig, så siden ikke venter på én ting ad gangen
  const [nowPlaying, comingSoon, featured, cinemas] = await Promise.all([
    getNowPlaying(city.id),
    getComingSoon(),
    getFeaturedMovies(),
    getCinemas(city.id),
  ]);

  return (
    <main className={styles.page}>
      {/* De fremhævede film skifter roligt. Intro-videoen ligger inde i karrusellen og ender på det første kort. */}
      <section className={styles.hero} aria-label="Kommer snart">
        <FeaturedCarousel movies={featured} />
      </section>

      {/* Figma "Kommende film – udfold": knappen "Se alle kommende film" står øverst, og sektionen med
          de kommende film folder sig ud nederst – under filmene, der kører nu (som i prototypen) */}
      <div className={styles.sections}>
        <ComingSoonSection movies={comingSoon}>
          {/* Figma "Filtrering": filtrer de film, der kører nu i byen. Filmene står under filtrene. */}
          <div className={styles.nowPlaying}>
            {nowPlaying.length > 0 ? (
              <MovieFilter cityName={city.name} cinemas={cinemas} movies={nowPlaying} />
            ) : (
              <p>Der går ingen film i {city.name} lige nu.</p>
            )}
          </div>
        </ComingSoonSection>
      </div>
    </main>
  );
}
