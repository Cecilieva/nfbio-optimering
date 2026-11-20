// Hvornår åbner billetsalget til en kommende film?
// Reglen er: 7 dage før premieren. Den bruges både på forsiden og på filmsiden.

import { addDays } from "@/lib/format";

// Antal dage før premieren, hvor billetsalget åbner
const DAYS_BEFORE_PREMIERE = 7;

// Giver datoen, hvor billetsalget åbner, fx "2026-12-15".
// Har filmen ingen premieredato, giver den null (ingenting).
export function getTicketSaleOpens(premiereDate) {
  if (!premiereDate) {
    return null;
  }

  // Træk 7 dage fra premieren: "2026-12-22" → "2026-12-15"
  return addDays(premiereDate, -DAYS_BEFORE_PREMIERE);
}
