// Only allow paths inside the app, so ?next= can't send the user to another site
export function safePath(value, fallback) {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return fallback;
}
