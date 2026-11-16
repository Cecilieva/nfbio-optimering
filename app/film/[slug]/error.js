"use client"; // Error boundaries must be Client Components

import ErrorState from "@/components/features/ErrorState";

export default function Error({ error, retry }) {
  return <ErrorState error={error} retry={retry} />;
}
