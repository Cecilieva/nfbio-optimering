// Fejlene ved den simulerede betaling.
// "inline"-fejl vises i formularen, de andre får fejlsiden.
export const PAYMENT_ERRORS = {
  "KORT-402": { message: "Kortet blev afvist. Prøv igen, eller vælg en anden betalingsmulighed.", inline: true },
  "GAVEKORT-404": { message: "Gavekortet findes ikke eller er brugt.", inline: true },
  "MP-408": { message: "MobilePay svarede ikke i tide. Du er ikke blevet trukket.", inline: false },
};

// Fejlen, hver metode giver. MobilePay fejler ikke
export const METHOD_ERRORS = {
  card: "KORT-402",
  giftcard: "GAVEKORT-404",
};

export function getPaymentError(code) {
  return PAYMENT_ERRORS[code] ?? { message: "Betalingen kunne ikke gennemføres.", inline: false };
}
