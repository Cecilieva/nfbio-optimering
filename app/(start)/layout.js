import Header from "@/components/features/Header";
import styles from "./page.module.css";

// Layout for route-gruppen "(start)", som indeholder "/" og "/by".
// Parenteserne i "(start)" betyder, at mappenavnet IKKE kommer med i URL'en.
// Figma "01 Vælg by": en header med kun logoet og ingen footer.
export default function CityLayout({ children }) {
  return (
    <div className={styles.screen}>
      <Header variant="logo" />
      {/* children er siden inde i layoutet (Vælg by-siden) */}
      {children}
    </div>
  );
}
