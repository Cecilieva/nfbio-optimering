// Vises, mens en side i købsflowet henter data (fx sæderne fra databasen).
// Next.js viser den automatisk og skifter til den rigtige side, når den er klar.
import LoadingState from "@/components/features/LoadingState";

export default function Loading() {
  return <LoadingState />;
}
