# Filtrering

Filtrene på forsiden (`/film`) under "Kommende film". Her vælger man mellem de film, der kører nu i den valgte by, efter **biograf**, **dato**, **genre**, **sprog** ("Ekstra filtrering") og **format**. Listen med film under filtrene opdateres med det samme, når man vælger noget.

**Figma:** "Filtrering" (node `2848:14506`), bygget af komponenterne "Filtering" (`464:12550`), "Filterfelt" (`2087:9999`), "Dropdown valg" (`535:2814`) og "Formater" (`498:3774`).

## Overblik

```
Supabase (movies, showtimes, cinemas)
   │
   ├─ lib/data/movies.js   getNowPlaying(cityId)  ← filmene + deres spilletider { starts_at, format, cinema_id }
   └─ lib/data/cities.js   getCinemas(cityId)     ← biograferne i byen
   │
   ▼
app/(site)/film/page.js                            ← henter data og sender dem videre som props
   │
   ▼
components/features/MovieFilter.js                 ← Figma "Filtrering": husker filtrene og filtrerer
   ├─ components/ui/FilterField.js                 (de fire felter med dropdown – Figma "Filterfelt")
   ├─ components/ui/Chip.js  variant="subtle"      (format-knapperne – Figma "Formater")
   └─ components/features/MovieCard.js             (filmene i listen)
```

## Data

- **`getNowPlaying(cityId)`** henter de film, der har kommende spilletider i byen. Hver film får sine spilletider med som `{ starts_at, format, cinema_id }`, så filtreringen kan se, hvornår og hvor filmen går, og i hvilket format. Filmen har også `genres` og `language` (fx "Engelsk tale").
- **`getCinemas(cityId)`** henter biograferne i byen til feltet "Biograf".

## Hvordan filtreringen virker – `MovieFilter.js`

| State | Hvad den husker |
|---|---|
| `filters` | Det valgte i hvert felt: `cinema`, `day`, `genre`, `extra` og `format`. `"all"` betyder "Alle …". |
| `openField` | Hvilket felt der har sin dropdown åben (kun ét ad gangen, som "Aktivt felt" i Figma). |

**Punkterne i dropdownsene laves ud fra dataene:**
- **Biograf:** "Alle biografer" + biograferne i byen.
- **Dato:** "Alle datoer" + hver dag med mindst én spilletid: "I dag", "I morgen", "Fredag 20. nov" …
- **Genre:** "Alle genrer" + alle genrer, filmene har, i alfabetisk rækkefølge.
- **Ekstra filtrering:** "Alle forestillinger", "Dansk tale", "Engelsk tale" og "Andre tale" (alle andre sprog).
- **Format:** står fast som i Figma: Alle formater, 2D, 3D, 4D, IMAX og 70MM.

**En film vises, når:**
1. den har genren og sproget, der er valgt, og
2. mindst én af dens spilletider passer til biograf, dato og format, og det skal være **den samme** spilletid. Vælger man "I morgen" og "3D", skal filmen altså gå i 3D i morgen.

**Knapperne:**
- **Søgeknappen** (den blå) lukker en åben dropdown og hopper ned til filmene.
- **Nulstil filter** sætter alle felter tilbage på "Alle …".

## Komponenterne

### `components/ui/FilterField.js` – Figma "Filterfelt" + "Dropdown valg"
Ét felt i baren: en lille label ("Biograf"), værdien ("Alle biografer") og en pil. Klikker man, åbner listen under feltet.

| Figma-tilstand | Hvornår | Udseende |
|---|---|---|
| Standard | intet valgt, lukket | ingen baggrund |
| Åben | listen er åben | lysere baggrund, pilen peger op |
| Valgt | der er valgt andet end "Alle …" | lysere baggrund og blå kant |

Punkterne i listen er dæmpede, og det valgte punkt og punktet under musen bliver lyse (Figma "Dropdown valg", Hover og Valgt).

**Tastatur og skærmlæser:** feltet har `aria-expanded`, det valgte punkt har `aria-pressed`, Escape lukker listen, og et klik uden for feltet lukker den også. Antallet af film læses op ("8 film"), når det ændrer sig.

### `components/ui/Chip.js` – variant `subtle`
Format-knapperne i Figma har ingen synlig kant, fordi kanten har samme farve som baggrunden. Derfor har `Chip` fået varianten `subtle`. Standard-varianten (`outline`) bruges stadig af månedsfiltrene under "Kommende film".

## Styling

- Alle værdier er tokens fra `app/tokens.css`, og de nye har Figma-navnet i en kommentar, fx:
  - `--radius-filter-bar` → `Border-radius/Large` (24px)
  - `--color-text-input-muted` → `text/input (muted)`
  - `--border-width-active` → den 1,5px blå kant på et valgt felt
  - `--shadow-dropdown` → skyggen under dropdown-listen
- Text styles: `L/Sekundær/Bold` (titlen), `S/Sekundær/Regular` (værdierne og punkterne) og `XS/Sekundær/Regular` (labels, format-knapper og "Nulstil filter").
- **Mobil** (under 48rem): felterne står to og to, søgeknappen fylder en hel linje, format-knapperne kan scrolles vandret, og "Nulstil filter" står under dem.

## Det skal du vide

- **Formater:** alle spilletider i databasen er i 2D, så 3D, 4D, IMAX og 70MM viser "Ingen film passer til dine filtre", indtil der kommer spilletider i de formater.
- **Ekstra filtrering:** Figma har flere punkter (Babybio, Liveshow, Filmklub …), men databasen har ingen data til dem. Derfor er kun sprogene med. Kommer der data, kan punkterne tilføjes i `MovieFilter.js`.
- **Filmkortene** i listen er endnu ikke designet i Figma, så de vises enkelt med `MovieCard`.

## Hvis du vil ændre noget

| Jeg vil … | Ret her |
|---|---|
| ændre format-knapperne | `FORMATS` i `components/features/MovieFilter.js` |
| tilføje punkter til "Ekstra filtrering" | `extraOptions` i `components/features/MovieFilter.js` |
| ændre udseendet på felterne og dropdownen | `components/ui/FilterField.module.css` |
| ændre baren, søgeknappen og format-rækken | `components/features/MovieFilter.module.css` |
| ændre farver, størrelser og afstande | `app/tokens.css` |
