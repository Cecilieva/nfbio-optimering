"use client";

import { useState } from "react";
import Chip from "@/components/ui/Chip";
import TextField from "@/components/ui/TextField";
import buttonStyles from "@/components/ui/Button.module.css";
import CinemaCard from "./CinemaCard";
import styles from "./CinemaFinder.module.css";

// Små og store bogstaver tæller ikke med, når der søges
function normalize(text) {
  return text.toLocaleLowerCase("da").trim();
}

// Afstanden mellem to punkter på jorden i km (haversine). Bruges kun til at finde den nærmeste by.
function distanceKm(a, b) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Søgning og filtrering på /biografer og listen med biografer under.
 * Figma: "Søg og filtrér" og "Biografliste" på "Biograf oversigt".
 *
 *   - "Søg efter by eller biograf": viser kun biografer, hvis by eller navn indeholder teksten
 *   - "Brug min placering": finder den nærmeste by ud fra browserens placering og vælger den
 *   - By-knapperne: "Alle" eller én by
 * Biograferne står i grupper pr. landsdel. En landsdel uden biografer, der passer, skjules.
 *
 * @param {object} props
 * @param {{ id: number, name: string, latitude: number | null, longitude: number | null }[]} props.cities
 *   Byerne til knapperne, i samme rækkefølge som på Vælg by
 * @param {Array<{ id: number, name: string, slug: string, image_url: string | null,
 *   city: { id: number, name: string, region: string } }>} props.cinemas
 * @param {string[]} props.regions Landsdelene i den rækkefølge, de skal stå
 */
export default function CinemaFinder({ cities, cinemas, regions }) {
  const [query, setQuery] = useState("");
  // Den valgte by (id) – eller null for "Alle"
  const [cityId, setCityId] = useState(null);
  // "Brug min placering": null, "finding" (i gang) eller en fejlbesked
  const [location, setLocation] = useState(null);

  const search = normalize(query);
  const shown = cinemas.filter(
    (cinema) =>
      (cityId === null || cinema.city.id === cityId) &&
      (!search || normalize(cinema.city.name).includes(search) || normalize(cinema.name).includes(search)),
  );

  // Biograferne delt op i landsdele. Landsdele uden biografer kommer ikke med.
  const groups = regions
    .map((region) => ({ region, cinemas: shown.filter((cinema) => cinema.city.region === region) }))
    .filter((group) => group.cinemas.length > 0);

  // Find den nærmeste by og vælg den. Søgefeltet tømmes, så byen ikke bliver skjult af søgningen.
  function findMyLocation() {
    if (!navigator.geolocation) {
      setLocation("Din browser kan ikke finde din placering.");
      return;
    }
    setLocation("finding");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const here = { latitude: coords.latitude, longitude: coords.longitude };
        const nearest = cities
          .filter((city) => city.latitude !== null && city.longitude !== null)
          .reduce((best, city) => (!best || distanceKm(here, city) < distanceKm(here, best) ? city : best), null);
        setLocation(null);
        if (nearest) {
          setCityId(nearest.id);
          setQuery("");
        }
      },
      () => setLocation("Vi kunne ikke finde din placering. Vælg en by i stedet."),
      { timeout: 10000 },
    );
  }

  return (
    <>
      {/* Figma "Søg og filtrér": søgefeltet og knappen, og byerne under */}
      <div className={styles.controls}>
        <div className={styles.search}>
          <TextField
            label="Søg efter by eller biograf"
            hideLabel
            name="biograf-soeg"
            type="search"
            placeholder="Søg efter by eller biograf"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.field}
          />
          <button
            type="button"
            className={`${buttonStyles.button} ${styles.locate}`}
            data-variant="primary"
            onClick={findMyLocation}
            disabled={location === "finding"}
          >
            {location === "finding" ? "Finder dig …" : "Brug min placering"}
          </button>
        </div>

        {/* Fejlen, hvis placeringen ikke kunne findes */}
        {location && location !== "finding" && (
          <p role="alert" className={styles.locationError}>
            {location}
          </p>
        )}

        {/* Figma "Byer (filter)": "Alle" og én knap pr. by. role="group" samler dem for skærmlæsere */}
        <div className={styles.cities} role="group" aria-label="By">
          <Chip selected={cityId === null} onClick={() => setCityId(null)}>
            Alle
          </Chip>
          {cities.map((city) => (
            <Chip key={city.id} selected={cityId === city.id} onClick={() => setCityId(city.id)}>
              {city.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Figma "Biografliste": én sektion pr. landsdel */}
      <div className={styles.list}>
        {/* Læses op, når antallet ændrer sig */}
        <p role="status" className="visually-hidden">
          {shown.length === 1 ? "1 biograf" : `${shown.length} biografer`}
        </p>

        {groups.length === 0 && (
          <p className={styles.empty}>
            {search ? `Ingen biografer passer til “${query.trim()}”.` : "Ingen biografer passer til dit valg."}
          </p>
        )}

        {groups.map((group) => (
          <section key={group.region} className={styles.region} aria-labelledby={`region-${group.region}`}>
            {/* Figma "Overskrift": landsdelen og antallet */}
            <h2 id={`region-${group.region}`} className={styles.heading}>
              {group.region}
              <span className={styles.count}>
                {group.cinemas.length === 1 ? "1 biograf" : `${group.cinemas.length} biografer`}
              </span>
            </h2>
            <ul className={styles.grid}>
              {group.cinemas.map((cinema) => (
                <li key={cinema.id}>
                  <CinemaCard cinema={cinema} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
