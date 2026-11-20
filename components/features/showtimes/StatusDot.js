import styles from "./StatusDot.module.css";

// Den lille farvede prik, der viser, hvor mange pladser der er tilbage:
//   "available" = grøn (ledige pladser)
//   "few"       = gul (få pladser)
//   "sold_out"  = rød (udsolgt)
export default function StatusDot({ status, className }) {
  // Brug prik-klassen, og tilføj en ekstra klasse, hvis der er sendt en med
  const classes = className ? `${styles.dot} ${className}` : styles.dot;

  // aria-hidden="true": skærmlæsere springer prikken over, fordi teksten ved siden af siger det samme
  return <span className={classes} data-status={status} aria-hidden="true" />;
}
