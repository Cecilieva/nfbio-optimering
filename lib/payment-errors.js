// Fejlene ved den simulerede betaling - én pr. metode. MobilePay fejler ikke.
const PAYMENT_ERRORS = {
  card: { code: "KORT-402", message: "Kortet blev afvist. Prøv igen, eller vælg en anden betalingsmulighed." },
  giftcard: { code: "GAVEKORT-404", message: "Gavekortet findes ikke eller er brugt." },
};

// Fejlen for en metode, fx "card" -> { code, message, method }. null, hvis den ikke fejler
export function getPaymentError(method) {
  const error = PAYMENT_ERRORS[method];
  return error ? { ...error, method } : null;
}
