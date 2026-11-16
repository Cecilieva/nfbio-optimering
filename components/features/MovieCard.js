import Link from "next/link";
import PosterPlaceholder from "@/components/features/PosterPlaceholder";
import { formatDuration } from "@/lib/format";

/**
 * A film in a list: poster, title, age rating and length. Links to the film page.
 *
 * @param {object} props
 * @param {{ slug: string, title: string, poster_url?: string, age_rating?: string, duration_min?: number }} props.movie
 */
export default function MovieCard({ movie }) {
  const details = [movie.age_rating, formatDuration(movie.duration_min)].filter(Boolean);

  return (
    <Link href={`/film/${movie.slug}`}>
      {movie.poster_url ? (
        <img src={movie.poster_url} alt="" />
      ) : (
        <PosterPlaceholder title={movie.title} />
      )}
      <h3>{movie.title}</h3>
      {details.length > 0 && <p>{details.join(" · ")}</p>}
    </Link>
  );
}
