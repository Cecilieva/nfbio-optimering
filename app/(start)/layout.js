import Header from "@/components/features/Header";
import styles from "./page.module.css";

// Layout for route-gruppen "(start)", som indeholder "/" og "/by".
// Parenteserne i "(start)" betyder, at mappenavnet IKKE kommer med i URL'en.
// Figma "01 Vælg by": en header med kun logoet og ingen almindelig footer.
export default function CityLayout({ children }) {
  return (
    <div className={styles.screen}>
      <Header variant="logo" />
      {/* children er siden inde i layoutet (Vælg by-siden) */}
      {children}

      {/* Vælg by er den første skærm, alle ser. Skærmen har ingen footer,
          så vi viser her, at sitet er et studieprojekt (et krav i projektbeskrivelsen).
          <footer> fortæller skærmlæsere, at det er sidens bund. */}
      <footer className={styles.notice}>
        <p>Studieprojekt uden tilknytning til Nordisk Film Biografer</p>
      </footer>
    </div>
  );
}
