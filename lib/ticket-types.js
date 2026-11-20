// Billettyperne på "Vælg antal pladser".
// Voksen koster forestillingens pris (showtimes.price_dkk). Barn og pensionist får et fast fradrag,
// så de følger med, hvis en forestilling er dyrere (fx IMAX).
// Fx: Voksen 140 kr. -> Barn 95 kr. og Pensionist 110 kr.
//
// OBS: Databasen kender ikke billettyperne endnu - reserve_seats regner stadig
// prisen ud som price_dkk × antal sæder. Typerne bruges kun til visning her.
export const TICKET_TYPES = [
  { id: "adult", label: "Voksen", discountDkk: 0 },
  { id: "child", label: "Barn", discountDkk: 45 },
  { id: "senior", label: "Pensionist", discountDkk: 30 },
];

// Man kan højst købe så mange billetter ad gangen
export const MAX_TICKETS = 8;

// Prisen for én billet af en type, fx ticketPrice(TICKET_TYPES[1], 140) -> 95
export function ticketPrice(type, basePriceDkk) {
  return basePriceDkk - type.discountDkk;
}

// Antal billetter i alt og den samlede pris, fx { quantity: 2, totalDkk: 280 }
export function countTickets(counts, basePriceDkk) {
  let quantity = 0;
  let totalDkk = 0;
  for (const type of TICKET_TYPES) {
    quantity += counts[type.id];
    totalDkk += counts[type.id] * ticketPrice(type, basePriceDkk);
  }
  return { quantity, totalDkk };
}
