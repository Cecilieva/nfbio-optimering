import LoadingState from "@/components/features/LoadingState";

// Vises, mens en filmside henter data.
// always: på vej ind på en filmside vises loaderen altid - også på et hurtigt net (det er en del af oplevelsen)
export default function Loading() {
  return <LoadingState always />;
}
