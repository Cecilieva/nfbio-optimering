import Header from "@/components/features/Header";
import { LoadingHost } from "@/components/features/LoadingState";
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
      {/* Loaderen: henter popkornene på forhånd og holder loaderen på skærmen i mindst 3 sekunder */}
      <LoadingHost />
    </div>
  );
}
