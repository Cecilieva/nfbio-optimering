import styles from "./BottomBar.module.css";

// Bjælken i bunden af skærmen i købsflowet: de valgte sæder til venstre og nedtællingen til højre.
// På desktop står den helt nede i bunden af skærmen. På mobil hænger den i bunden, når man scroller.
// Stregen og baggrunden går helt ud til kanten.
// data-bottom-bar: så giver layoutet plads til bjælken nederst (se (bestil)/layout.module.css)
//
//   summary  - indholdet til venstre, fx en stol og "Række 4, sæde 6–7"
//   children - indholdet til højre, fx nedtællingen
export default function BottomBar({ summary, children }) {
  return (
    <div className={styles.bar} data-bottom-bar>
      <div className={styles.summary}>{summary}</div>
      <div className={styles.end}>{children}</div>
    </div>
  );
}
