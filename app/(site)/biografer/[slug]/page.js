import { notFound } from "next/navigation";
import BeforeYouCome from "@/components/features/cinemas/BeforeYouCome";
import CinemaHero from "@/components/features/cinemas/CinemaHero";
import CinemaTabs from "@/components/features/cinemas/CinemaTabs";
import { getCinemaBySlug } from "@/lib/data/cinemas";
import styles from "./page.module.css";

// Biografens navn i browserens fane
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cinema = await getCinemaBySlug(slug);
  return { title: cinema ? cinema.name : "Biografen findes ikke" };
}

// /biografer/[slug] – Figma: "Detaljeside til by" (fx Aarhus Bio).
// Toppen med billede og navn, fanerne (kun pynt – de linker ikke til noget) og "Før du kommer".
export default async function CinemaPage({ params }) {
  const { slug } = await params;
  const cinema = await getCinemaBySlug(slug);

  if (!cinema) {
    notFound();
  }

  return (
    <main id="indhold" className={styles.page}>
      <CinemaHero name={cinema.name} image={cinema.image_url} />
      <CinemaTabs />
      <BeforeYouCome cinema={cinema} />
    </main>
  );
}
