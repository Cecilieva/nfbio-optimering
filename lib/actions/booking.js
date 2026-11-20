"use server";

// The booking flow: reserve seats → attach owner → pay.
// The actions are used with useActionState, so they get (prevState, formData)
// and return { error: { code, message } } when something goes wrong.
// When it works, they save the booking in the booking cookie and go to the next step.

import { redirect } from "next/navigation";
import { readBookingCookie, writeBookingCookie } from "@/lib/booking-cookie";
import { getSeatMap } from "@/lib/data/seats";
import { getShowtime } from "@/lib/data/showtimes";
import { formatSeats } from "@/lib/format";
import { getPaymentError } from "@/lib/payment-errors";
import { findLoneSeats } from "@/lib/seat-rules";
import { createClient } from "@/lib/supabase/server";

// Turns a Supabase error into something the UI can show
function toError(error) {
  // 23505 = unique violation: booking_seats has unique (showtime_id, seat_id)
  if (error.code === "23505") {
    return { code: "SEAT_TAKEN", message: "Et eller flere af sæderne er lige blevet taget." };
  }

  // P0001 = raise exception in our SQL functions – the message is already Danish
  if (error.code === "P0001") {
    return { code: "BOOKING_UNAVAILABLE", message: error.message };
  }

  return { code: "UNKNOWN", message: "Noget gik galt. Prøv igen." };
}

// Keeps the seat ids from the copy we already have, because the RPCs only return the bookings row
async function saveBooking(booking, seatIds) {
  const copy = await readBookingCookie();
  const seat_ids = seatIds ?? (copy?.id === booking.id ? copy.seat_ids : []);

  await writeBookingCookie({ ...booking, seat_ids });
}

// "Vi popper dine pladser …" – reserves the seats without an owner.
// A logged-in user becomes the owner straight away (reserve_seats uses auth.uid()).
export async function reserveSeats(prevState, formData) {
  const showtimeId = Number(formData.get("showtime_id"));
  const seatIds = formData.getAll("seat_id").map(Number);

  if (seatIds.length === 0) {
    return { error: { code: "NO_SEATS", message: "Vælg mindst ét sæde." } };
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

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reserve_seats", {
    p_showtime_id: showtimeId,
    p_seat_ids: seatIds,
  });

  if (error) {
    return { error: toError(error) };
  }

  await saveBooking(data, seatIds);
  redirect(`/bestil/${data.id}/login`);
}

// Login/guest step: makes the logged-in user, or the guest, the owner of the reservation
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

// The payment is simulated: the "outcome" field decides if it works.
// "success" pays. Any other value is an error code from lib/payment-errors.js.
export async function completePayment(prevState, formData) {
  const bookingId = formData.get("booking_id");
  const method = formData.get("method");
  const outcome = formData.get("outcome") || "success";
  const success = outcome === "success";

  if (!method) {
    return { error: { code: "NO_METHOD", message: "Vælg en betalingsmetode." } };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("complete_payment", {
    p_booking_id: bookingId,
    p_method: method,
    p_success: success,
    p_error_code: success ? null : outcome,
  });

  if (error) {
    return { error: toError(error) };
  }

  await saveBooking(data);

  if (success) {
    redirect(`/bestil/${bookingId}/billet`);
  }

  const paymentError = getPaymentError(outcome);

  if (!paymentError.inline) {
    redirect(`/bestil/${bookingId}/betaling/fejl?kode=${encodeURIComponent(outcome)}`);
  }

  return { error: { code: outcome, message: paymentError.message } };
}
