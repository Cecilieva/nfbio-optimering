import { notFound } from "next/navigation";
import OrderSummary from "@/components/features/OrderSummary";
import SeatPicker from "@/components/features/SeatPicker";
import StepHeader from "@/components/features/StepHeader";
import DataDump from "@/components/ui/DataDump";
import { getSeatMap } from "@/lib/data/seats";
import { getShowtime } from "@/lib/data/showtimes";

export const metadata = {
  title: "Vælg sæder",
};

// Figma: "Sædevalg" + the overlays "Vi popper dine pladser" / "Dine popkorn blev brændt"
export default async function SeatsPage({ params }) {
  const { showtimeId } = await params;
  const showtime = await getShowtime(Number(showtimeId));

  if (!showtime) {
    notFound();
  }

  const rows = await getSeatMap(showtime);

  return (
    <main>
      <StepHeader step={1} title="Vælg sæder" backHref={`/film/${showtime.movie.slug}`} />
      <OrderSummary showtime={showtime} />
      <SeatPicker showtime={showtime} rows={rows} />
      <DataDump label="showtime, rows" data={{ showtime, rows }} />
    </main>
  );
}
