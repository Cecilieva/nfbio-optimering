# Kommende film

Alle kommende film på forsiden (`/film`). Lige under de fremhævede film står knappen **"Se alle kommende film"**. Klikker man, folder sektionen sig ud **længere nede på siden, under filmene, der kører nu**, og siden ruller ned til den (som i prototypen "Forside – samlet", node `1856:79051`). Sektionen viser alle kommende film i et gitter, som kan filtreres efter måned eller forsalg. **"Skjul kommende film"** folder den sammen igen og ruller op til knappen.

Knappen og sektionen er samme komponent, men står to steder. Det, der står imellem dem (filtreringen og filmene, der kører nu), får komponenten som `children`:

```jsx
<ComingSoonSection movies={comingSoon}>
  <MovieFilter … />
</ComingSoonSection>
```

**Figma:** "Kommende film – udfold" (node `2221:15159`). Lukket tilstand: `2848:14500`. Åben tilstand: `2849:14585`.

## Overblik

```
Supabase (movies)
   │
   ▼
lib/data/movies.js  getComingSoon()      ← fjerner dubletter, tilføjer plakat og billetsalg
   │                    ▲
   │                    └─ lib/data/ticket-sale.js  (datoer for billetsalg)
   ▼
app/(site)/film/page.js                  ← henter data og sender dem videre som props
   │
   ▼
components/features/ComingSoonSection.js ← folder ud/ind og filtrerer
   ├─ components/ui/Button.js            ("Se alle" / "Skjul")
   ├─ components/ui/Chip.js              (filtrene – Figma "Option button")
   └─ components/features/MovieCard.js   (plakaterne – variant "coming-soon")
```

## 1. Data – `lib/data/`

### `movies.js` → `getComingSoon()`
Henter alle film med `status = 'coming_soon'`, sorteret efter premiere. Før filmene sendes videre, bliver de rettet lidt til:

- **Ingen dubletter:** `uniqueByTitle()` beholder kun én række pr. titel. Databasen har fx "SORT – En film af Ukendt Kunstner" to gange, og der bruges den række, der har en plakat.
- **Plakat til film uden billede:** `POSTER_FALLBACKS` giver film uden `poster_url` et billede, der allerede ligger i projektet (fx Sunrise). Hvis databasen senere får en `poster_url`, bliver den brugt i stedet.
- **Billetsalg:** hver film får to felter:
  - `ticket_sale_opens` er datoen, hvor billetsalget åbner, eller `null`.
  - `ticket_sale_open` er `true`, hvis man kan købe billet nu. Den bruges af filteret "Forsalg åben".

### `ticket-sale.js`
Databasen har ingen kolonne til, hvornår billetsalget åbner, så datoerne står her. Film, der ikke står på listen, har åbent billetsalg. Listen bruges både af det store "Kommer snart"-kort øverst (`featured.js`) og af denne sektion.

## 2. Formatering – `lib/format.js`

| Funktion | Eksempel | Bruges til |
|---|---|---|
| `formatDayMonthShort(date)` | "19. nov" | Datoen og "Billetsalg fra …" på plakaterne |
| `formatMonth(date)` | "November" | Månedsfiltrene |

Begge regner i dansk tid (`Europe/Copenhagen`) ligesom resten af `format.js`.

## 3. Byggeklodser – eksisterende komponenter, der er udvidet

Projektet genbruger komponenter i stedet for at lave nye (se `AGENTS.md`), så sektionen er bygget af disse:

### `components/ui/Chip.js` – Figma "Option button"
Den lille pilleformede knap til filtrene. Den valgte får `aria-pressed="true"` og dermed blå kant og lys tekst. Styles: `Chip.module.css`.

> `Chip` bruges også i `SeatPicker` (vælg antal billetter), så knapperne dér ser ens ud.

### `components/features/MovieCard.js` – variant `coming-soon`
Figma "Kommer snart" (node `927:6300`). Plakaten består af:
- billedet med en mørk toning (Figma "Overlay")
- kalender-ikonet (`public/icons/calendar.svg`), premieredatoen og "Billetsalg fra …" / "Billetsalg åbent" i midten
- titlen nederst, som slutter med "…", hvis den er for lang

Uden billede ses en blå gradient i stedet. Den almindelige variant (`default`) er uændret.

**Hover – Figma "få notifikationer" (node `913:14280`):** holder man musen over plakaten (eller står på den med tastaturet), bliver toningen lysere, dato og titel skjules, og **"Se spilletider"** vises i midten. Det er en `span` med `Button`'s "primary"-styles (klassen `.action`, som kortene i feedet også bruger), fordi hele plakaten allerede er et link til filmsiden.

Plakaten har 8px runde hjørner (`--radius-md`) og toningen `Toning/85%` (`--color-poster-overlay`).

### `components/ui/Button.js` – variant `secondary`
Bruges til "Se alle kommende film" og "Skjul kommende film". Kanten bruger Figmas `buttons/sekundær-border`.

## 4. Sektionen – `components/features/ComingSoonSection.js`

En **client component** (`"use client"`), fordi den skal kunne huske, hvad brugeren har klikket på:

| State | Værdier | Hvad den styrer |
|---|---|---|
| `open` | `true` / `false` | Lukket: kun knappen. Åben: sektionen med overskrift, filtre, gitter og "Skjul"-knap står også under `children`. Knappen bliver stående. |
| `filter` | `"all"`, `"2026-11"` …, `"presale"` | Hvilke film der vises i gitteret |

- **Filtrene** laves ud fra dataene: "Alle", én knap pr. måned med en premiere og "Forsalg åben". Kommer der film i en ny måned, kommer der automatisk en ny knap.
- **Rulning og tilgængelighed:** når sektionen foldes ud, ruller siden ned til overskriften "Kommende film", og fokus flytter med. Når den foldes sammen, ruller siden op til knappen igen. Trykker man på knappen, mens sektionen er åben, ruller siden bare ned til den. Bruger man "mindre bevægelse" i styresystemet, hopper siden i stedet for at glide. Knappen har `aria-expanded` og `aria-controls`, og filtrene er samlet i en `role="group"`.

## 5. Siden – `app/(site)/film/page.js`

Siden henter filmene med `getComingSoon()` og sender dem som props:

```jsx
<ComingSoonSection movies={comingSoon} />
```

Komponenten taler aldrig selv med Supabase. Data hentes altid i `lib/data/` og sendes ned som props, sådan som projektets regler kræver.

## Styling

- Hver komponent har sin egen CSS-fil (`*.module.css`).
- Alle værdier er **tokens** fra `app/tokens.css`. De nye tokens har Figma-variablens navn i en kommentar, fx:
  - `--color-option-border-active` → `Option button/Border aktiv`
  - `--size-option-button-height` → `Btn-Height/Small`
  - `--color-poster-overlay` → plakatens "Overlay"
- Teksterne følger Figmas text styles: `L/Sekundær/Bold` (overskrift og dato), `S/Sekundær/Regular` (underteksten), `XS/Sekundær/Regular` (filtre og billetsalg) og `M/Sekundær/Bold` (filmtitlen).

### Responsivt
Gitteret er et CSS grid med `auto-fill`, hvor en plakat er mindst 220 px bred:

```css
grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--size-poster-card-width)), 1fr));
```

Derfor står der 5 plakater pr. række på desktop som i Figma, og der bliver automatisk færre, når skærmen er smallere. Under 48rem (mobil) er mindstebredden mindre, så der står 2 pr. række, og filtrene kan scrolles vandret.

## Hvis du vil ændre noget

| Jeg vil … | Ret her |
|---|---|
| sætte en dato for billetsalg | `lib/data/ticket-sale.js` |
| give en film uden plakat et billede | `POSTER_FALLBACKS` i `lib/data/movies.js` |
| ændre teksterne i sektionen | `components/features/ComingSoonSection.js` |
| ændre plakatens udseende | `components/features/MovieCard.module.css` |
| ændre farver, størrelser og afstande | `app/tokens.css` |
