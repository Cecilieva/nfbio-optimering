import Header from "@/components/features/Header";
import styles from "./layout.module.css";

// Layout for route-gruppen "(auth)": Log ind (/login) og Opret profil (/signup).
// Parenteserne betyder, at "(auth)" IKKE kommer med i URL'en.
// Figma "Log ind side" og "Opret profil" har den fulde header, men ingen footer.
export default function AuthLayout({ children }) {
  return (
    <div className={styles.screen}>
      <Header />
      {/* children er siden, fx Log ind */}
      {children}
    </div>
  );
}
