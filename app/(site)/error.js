// Fejlsiden for sider med fuld header og footer, fx /film og /profile. En fejlside skal køre i browseren ("use client")
"use client";

import ErrorState from "@/components/features/ErrorState";

export default function Error({ error, retry }) {
  return <ErrorState error={error} retry={retry} />;
}
