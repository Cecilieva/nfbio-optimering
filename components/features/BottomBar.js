import styles from "./BottomBar.module.css";

// Bjælken i bunden af skærmen i købsflowet: en kort opsummering til venstre og en knap til højre.
// Den bliver hængende i bunden, når man scroller.
//
//   summary  - teksten til venstre, fx "2 billetter · 270 kr."
//   children - knappen til højre, fx "Reservér"
export default function BottomBar({ summary, children }) {
  return (
    <div className={styles.bar}>
      <div>{summary}</div>
      <div>{children}</div>
    </div>
  );
}
