// The payment is simulated in the prototype. These are the errors we can simulate,
// with the text the payment page and the error page show.
// "inline" errors are shown on the payment page, the others get the error page.
export const PAYMENT_ERRORS = {
  "KORT-402": { message: "Kortet blev afvist. Prøv et andet kort.", inline: true },
  "GAVEKORT-404": { message: "Gavekortet findes ikke eller er brugt.", inline: true },
  "MP-408": { message: "MobilePay svarede ikke i tide. Du er ikke blevet trukket.", inline: false },
};

export function getPaymentError(code) {
  return PAYMENT_ERRORS[code] ?? { message: "Betalingen kunne ikke gennemføres.", inline: false };
}
