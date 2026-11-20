import Header from "@/components/features/Header";
import styles from "./layout.module.css";

// Layout for route-gruppen "(bestil)": hele købsflowet under /bestil.
// Parenteserne betyder, at "(bestil)" IKKE kommer med i URL'en.
// Siderne har en header med kun logoet og ingen almindelig footer,
// så man ikke bliver forstyrret, mens man køber.
export default function BookingLayout({ children }) {
  return (
    <div className={styles.screen}>
      <Header variant="logo" />
      {children}

      {/* Sitet er et studieprojekt - det skal stå på siden, også når der ikke er en footer */}
      <footer className={styles.notice}>
        <p>Studieprojekt uden tilknytning til Nordisk Film Biografer</p>
      </footer>
    </div>
  );
}
