"use server";

// Købet trin for trin: reservér sæder -> vælg hvem der køber -> betal.
// Formularerne bruger useActionState, så hver funktion får (prevState, formData).
// Går noget galt, sendes { error: { code, message } } tilbage, så siden kan vise fejlen.
// Går det godt, gemmes bookingen i cookien, og man sendes videre til næste trin.

import { redirect } from "next/navigation";
import { readBookingCookie, writeBookingCookie } from "@/lib/booking-cookie";
import { getBooking, isReservationActive } from "@/lib/data/bookings";
import { getSeatMap } from "@/lib/data/seats";
import { getShowtime } from "@/lib/data/showtimes";
import { formatSeats } from "@/lib/format";
import { getPaymentError, METHOD_ERRORS } from "@/lib/payment-errors";
import { findLoneSeats } from "@/lib/seat-rules";
import { TICKET_TYPES } from "@/lib/ticket-types";
import { createClient } from "@/lib/supabase/server";

// Laver en fejl fra databasen om til en besked, man kan vise på siden
function toError(error) {
  // 23505: sædet er allerede booket af en anden (samme sæde kan kun bookes én gang)
  if (error.code === "23505") {
    return { code: "SEAT_TAKEN", message: "Et eller flere af sæderne er lige blevet taget." };
  }

  // P0001: en fejl, vi selv har skrevet i databasen - beskeden er allerede på dansk
  if (error.code === "P0001") {
    return { code: "BOOKING_UNAVAILABLE", message: error.message };
  }

  return { code: "UNKNOWN", message: "Noget gik galt. Prøv igen." };
}

// Gemmer bookingen i cookien.
// Databasen sender kun selve bookingen tilbage - ikke sæderne og billettyperne.
// Derfor beholder vi dem fra den gemte kopi. Står der nye i extra, bruges de i stedet
async function saveBooking(booking, extra = {}) {
  const copy = await readBookingCookie();
  const old = copy?.id === booking.id ? copy : {};

  await writeBookingCookie({ seat_ids: [], ...old, ...booking, ...extra });
}

// Henter antallet af hver billettype fra formularen, fx { adult: 2, child: 0, senior: 0 }
function readTickets(formData) {
  return Object.fromEntries(
    TICKET_TYPES.map((type) => [type.id, Number(formData.get(`ticket_${type.id}`)) || 0])
  );
}

// Henter tidspunktet, hvor uret på sædevalget når 00:00, fra formularen.
// Er det ikke en rigtig dato, får vi undefined, så det ikke bliver gemt
function readHoldUntil(formData) {
  const date = new Date(formData.get("hold_until"));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

// "Til betaling" på sædevalget: reserverer sæderne, så ingen andre kan tage dem.
// Er man logget ind, bliver man ejer med det samme. Ellers vælger man det på næste trin
export async function reserveSeats(prevState, formData) {
  const showtimeId = Number(formData.get("showtime_id"));
  const seatIds = formData.getAll("seat_id").map(Number);

  if (seatIds.length === 0) {
    return { error: { code: "NO_SEATS", message: "Vælg mindst ét sæde." } };
  }

  const supabase = await createClient();

  // Kommer man tilbage fra "Dine oplysninger", har man allerede en reservation
  const previousId = formData.get("booking_id");
  const previous = previousId ? await getBooking(previousId) : null;

  if (previous && previous.showtime_id === showtimeId && isReservationActive(previous)) {
    // Samme sæder som før: behold reservationen og gå videre (kun billettyperne kan være ændret)
    const sameSeats =
      previous.seat_ids.length === seatIds.length && seatIds.every((id) => previous.seat_ids.includes(id));

    if (sameSeats) {
      await saveBooking(previous, { tickets: readTickets(formData) });
      redirect(`/bestil/${previous.id}/login`);
    }

    // Andre sæder: slip de gamle først, så de bliver ledige igen.
    // Virker det ikke (fx hvis release_booking ikke er lagt i databasen endnu),
    // er de gamle sæder optaget, indtil tiden løber ud
    await supabase.rpc("release_booking", { p_booking_id: previous.id });
  }

  // Samme regel som på siden: man må ikke efterlade et ledigt sæde alene (se lib/seat-rules.js)
  const showtime = await getShowtime(showtimeId);
  if (showtime) {
    const rows = await getSeatMap(showtime);
    const loneSeats = findLoneSeats(rows, seatIds, seatIds.length);
    if (loneSeats.length > 0) {
      return {
        error: {
          code: "LONE_SEAT",
          message: `Der må ikke stå en ledig plads alene. Ryk dine pladser, så du ikke efterlader ${formatSeats(loneSeats)} alene.`,
        },
      };
    }
  }

  // Reservér sæderne i databasen. Er et af dem lige blevet taget, får vi en fejl
  const { data, error } = await supabase.rpc("reserve_seats", {
    p_showtime_id: showtimeId,
    p_seat_ids: seatIds,
  });

  if (error) {
    return { error: toError(error) };
  }

  // hold_until: hvornår uret fra sædevalget når 00:00.
  // getBooking bruger det, så uret går videre i stedet for at starte forfra
  await saveBooking(data, {
    seat_ids: seatIds,
    tickets: readTickets(formData),
    hold_until: readHoldUntil(formData),
  });
  redirect(`/bestil/${data.id}/login`);
}

// "Dine oplysninger": gør den, der er logget ind, eller gæsten til ejer af reservationen.
// Telefon og rabatkode fra gæsteformularen gemmes ikke endnu
export async function attachBookingOwner(prevState, formData) {
  const bookingId = formData.get("booking_id");
  const guestEmail = formData.get("guest_email")?.trim() || null;
  const guestName = formData.get("guest_name")?.trim() || null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("attach_booking_owner", {
    p_booking_id: bookingId,
    p_guest_email: guestEmail,
    p_guest_name: guestName,
  });

  if (error) {
    return { error: toError(error) };
  }

  await saveBooking(data);
  redirect(`/bestil/${bookingId}/betaling`);
}

// Betalingen er simuleret: MobilePay går igennem, kort og gavekort fejler
export async function completePayment(prevState, formData) {
  const bookingId = formData.get("booking_id");
  const method = formData.get("method");

  if (!method) {
    return { error: { code: "NO_METHOD", message: "Vælg en betalingsmetode." } };
  }

  const success = method === "mobilepay";
  const errorCode = success ? null : (METHOD_ERRORS[method] ?? "KORT-402");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("complete_payment", {
    p_booking_id: bookingId,
    p_method: method,
    p_success: success,
    p_error_code: errorCode,
  });

  if (error) {
    return { error: toError(error) };
  }

  await saveBooking(data);

  if (success) {
    redirect(`/bestil/${bookingId}/billet`);
  }

  // Nogle fejl vises i formularen, andre får deres egen fejlside
  const paymentError = getPaymentError(errorCode);

  if (!paymentError.inline) {
    redirect(`/bestil/${bookingId}/betaling/fejl?kode=${encodeURIComponent(errorCode)}`);
  }

  // method: så formularen kan vise, hvilken metode der fejlede
  return { error: { code: errorCode, message: paymentError.message, method } };
}
