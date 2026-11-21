import LoadingState from "@/components/features/LoadingState";

// Vises, mens en side henter data. Next.js viser den automatisk og skifter til siden, når den er klar.
// Loaderen kommer kun frem, hvis det tager over 1 sekund (se LoadingState).
export default function Loading() {
  return <LoadingState />;
}
