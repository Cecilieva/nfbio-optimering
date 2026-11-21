// Fejlsiden for Vælg by. En fejlside skal køre i browseren ("use client")
"use client";

import ErrorState from "@/components/features/ErrorState";

export default function Error({ error, retry }) {
  return <ErrorState error={error} retry={retry} />;
}
