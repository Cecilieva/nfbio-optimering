import FollowButton from "@/components/features/movies/FollowButton";
import Poster from "@/components/features/movies/Poster";
import styles from "./SaleClosed.module.css";

// Laver "2D", "2D og 4DX" eller "2D, 3D og 4DX"
function joinFormats(formats) {
  if (formats.length <= 1) {
    return formats.join("");
  }
  return `${formats.slice(0, -1).join(", ")} og ${formats.at(-1)}`;
}

/**
 * Kortet, der står i stedet for spilletiderne, når billetsalget ikke er åbnet endnu (Figma "Billetsalg lukket").
 * Lille plakat, tekst og "Følg" til højre.
 *
 * @param {object} props
 * @param {{ title: string, poster_url?: string }} props.movie
 * @param {string[]} props.formats Formaterne i den valgte biograf, fx ["2D", "4DX"]
 * @param {boolean} [props.loggedIn] Er man logget ind? (til "Følg")
 */
export default function SaleClosed({ movie, formats, loggedIn }) {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.poster}>
          <Poster src={movie.poster_url} title={movie.title} />
        </div>

        <div className={styles.text}>
          <h3 className={styles.title}>Billetsalget er ikke åbnet endnu</h3>
          {formats.length > 0 && <p className={styles.formats}>Vises i {joinFormats(formats)}</p>}
          <p className={styles.note}>Spilletider og billetter vises her, så snart salget åbner.</p>
        </div>
      </div>

      {/* Knappen står yderst til højre, så beskeden under den flugter med højre kant */}
      <FollowButton title={movie.title} label="Følg" loggedIn={loggedIn} toastEnd />
    </div>
  );
}
