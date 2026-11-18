// When ticket sale opens, for films where it is known ("2026-11-27").
// The database has no column for it, so it is set here. Films not listed have ticket sale open.
// Used by the big "Kommer snart" card (featured.js) and the "Kommende film" section (movies.js).
const TICKET_SALE_OPENS = {
  "sunrise-on-the-reaping": "2026-12-06", // 14 dage før premieren 20. december
  "katten-med-hatten": "2026-11-27",
};

export function getTicketSaleOpens(slug) {
  return TICKET_SALE_OPENS[slug] ?? null;
}
