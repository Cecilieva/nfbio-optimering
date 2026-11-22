import Header from "@/components/features/layout/Header";
import { LoadingHost } from "@/components/features/loading/LoadingState";
import styles from "./layout.module.css";

// Layout for route-gruppen "(auth)": Log ind (/login), Opret profil (/signup) og Profil (/profile).
// Parenteserne betyder, at "(auth)" IKKE kommer med i URL'en.
// Figma "Log ind side", "Opret profil" og "Profilside" har den fulde header, men ingen footer.
export default function AuthLayout({ children }) {
  return (
    <div className={styles.screen}>
      <Header />
      {/* children er siden, fx Log ind */}
      {children}
      {/* Loaderen: henter popkornene på forhånd og holder loaderen på skærmen i mindst 3 sekunder */}
      <LoadingHost />
    </div>
  );
}
