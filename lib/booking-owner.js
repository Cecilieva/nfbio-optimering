import { saveBooking } from "@/lib/booking-cookie";

// Gør den, der er logget ind, til ejer af reservationen og gemmer den i cookien.
// Giver bookingen tilbage, eller null hvis det ikke gik. Virker kun i server actions
export async function claimBooking(supabase, bookingId) {
  if (!bookingId) {
    return null;
  }

  const { data, error } = await supabase.rpc("attach_booking_owner", { p_booking_id: bookingId });

  if (error || !data) {
    return null;
  }

  await saveBooking(data);
  return data;
}
