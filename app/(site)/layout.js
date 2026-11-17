import Footer from "@/components/features/Footer";
import Header from "@/components/features/Header";

// Layout for route-gruppen "(site)": alle sider undtagen Vælg by.
// Parenteserne betyder, at "(site)" IKKE kommer med i URL'en, så /film bare er /film.
// Alle disse sider får den fulde header øverst og footeren nederst.
export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      {/* children er den side, der vises, fx /film */}
      {children}
      <Footer />
    </>
  );
}
