import Footer from "@/components/features/Footer";
import Header from "@/components/features/Header";
import MessagePage from "@/components/features/MessagePage";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "Siden blev ikke fundet",
};

// 404-siden, når en adresse ikke findes. Ligger uden for (site), så den viser selv header og footer
export default function NotFound() {
  return (
    <>
      <Header />
      <MessagePage
        eyebrow="Åh nej.."
        title="Vi kunne ikke finde, det du leder efter."
        buttons={
          <>
            <Button href="/film">Gå til forsiden</Button>
            {/* TODO: Der er ingen supportside endnu, så den peger på forsiden */}
            <Button href="/film" variant="secondary">
              Gå til support
            </Button>
          </>
        }
      >
        Men bare rolig, du kan lynhurtigt vende tilbage til trygge rammer ved at gå til forsiden eller få hjælp fra
        vores dygtige support medarbejdere.
      </MessagePage>
      <Footer />
    </>
  );
}
