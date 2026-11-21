import FormLoader from "@/components/features/FormLoader";
import { selectCity } from "@/lib/actions/city";
import SidePanel, { SidePanelHeading, SidePanelItem } from "./SidePanel";
import styles from "./CityMenu.module.css";

/**
 * Figma: "Byskift" (2588:40783).
 * Lokations-ikonet i headeren plus panelet, hvor man vælger by. Det glider ind fra højre,
 * fordi ikonet sidder i højre side af headeren.
 * Når man vælger en by, gemmes den i cookien (selectCity), og man kommer til forsiden (/film)
 * med filmene i den nye by.
 *
 * @param {object} props
 * @param {{ id: number, name: string }[]} props.cities Alle byer (fra getCities)
 * @param {{ id: number, name: string } | null} props.city Den by, der er valgt nu
 * @param {string} [props.triggerClassName] Headerens stil til knappen
 */
export default function CityMenu({ cities, city, triggerClassName }) {
  return (
    <SidePanel
      label="Vælg by"
      triggerLabel={city ? `By: ${city.name}. Skift by` : "Vælg by"}
      triggerIcon="/icons/location.svg"
      triggerClassName={triggerClassName}
      side="right" // Kommer ind fra højre, hvor lokations-ikonet sidder
    >
      {/* Én formular for alle byerne. Den knap, man klikker på, sender sit city_id med.
          Panelet lukker selv, når formularen sendes. */}
      <form action={selectCity}>
        <input type="hidden" name="next" value="/film" />
        {/* Loaderen, mens forsiden for den nye by hentes */}
        <FormLoader />
        <SidePanelHeading>Vælg by</SidePanelHeading>
        <ul className={styles.list}>
          {cities.map((item) => (
            <li key={item.id}>
              <SidePanelItem
                type="submit"
                name="city_id"
                value={item.id}
                divider
                selected={item.id === city?.id} // Den valgte by kan ikke vælges igen
              >
                {item.name}
              </SidePanelItem>
            </li>
          ))}
        </ul>
      </form>
    </SidePanel>
  );
}
