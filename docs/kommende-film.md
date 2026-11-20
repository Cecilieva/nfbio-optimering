# Kommende film

Alle kommende film på forsiden (`/film`). Sektionen står altid fremme **under filmene, der kører nu**, med overskrift, filtre og de første **10 plakater** (2 rækker á 5 som i Figma). Filmene kan filtreres efter måned eller forsalg. Er der flere end 10 film i filteret, står **"Se alle kommende film"** nederst og viser resten. **"Skjul kommende film"** viser kun de første 10 igen og ruller op til overskriften.

```jsx
<ComingSoonSection movies={comingSoon} />
```

**Figma:** "Kommende film – udfold" (node `2521:34621`) i "Forside – samlet (uden animationer)" (node `1856:79051`).

## Overblik

```
Supabase (movies)
   │
   ▼
lib/data/movies.js  getComingSoon()      ← fjerner dubletter, tilføjer plakat og billetsalg
   │                    ▲
   │                    └─ lib/data/ticket-sale.js  (billetsalg: 7 dage før premieren)
   ▼
app/(site)/film/page.js                  ← henter data og sender dem videre som props
   │
   ▼
components/features/ComingSoonSection.js ← filtrerer og viser 10 eller alle
   ├─ components/ui/Button.js            ("Se alle" / "Skjul")
   ├─ components/ui/Chip.js              (filtrene – Figma "Option button")
   └─ components/features/MovieCard.js   (plakaterne – variant "coming-soon")
```

## 1. Data – `lib/data/`

### `movies.js` → `getComingSoon()`
Henter alle film med `status = 'coming_soon'` **og premiere efter i dag**, sorteret efter premiere. Datoreglen er den samme som i karrusellen øverst (`featured.js`), så en film med forkert status (fx en premiere, der allerede har været) ikke står som kommende. Før filmene sendes videre, bliver de rettet lidt til:

- **Ingen dubletter:** `uniqueByTitle()` beholder kun én række pr. titel. Databasen har fx "SORT – En film af Ukendt Kunstner" to gange, og der bruges den række, der har en plakat.
- **Plakat til film uden billede:** `POSTER_FALLBACKS` giver film uden `poster_url` et billede, der allerede ligger i projektet (fx Sunrise). Hvis databasen senere får en `poster_url`, bliver den brugt i stedet.
- **Billetsalg:** hver film får to felter:
  - `ticket_sale_opens` er datoen, hvor billetsalget åbner, eller `null`.
  - `ticket_sale_open` er `true`, hvis man kan købe billet nu. Den bruges af filteret "Forsalg åben".

### `ticket-sale.js`
Databasen har ingen kolonne til, hvornår billetsalget åbner. `getTicketSaleOpens(premiereDate)` regner det ud: **7 dage før premieren** (`DAYS_BEFORE_PREMIERE`). Reglen bruges af det store "Kommer snart"-kort øverst (`featured.js`), af denne sektion og af filmsiden.

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
- kalender-ikonet (`public/icons/calendar.svg`), premieredatoen og "Billetsalget er åbent" (når billetsalget er åbent) eller "Billetsalg fra …" i midten
- titlen nederst, som slutter med "…", hvis den er for lang

Uden billede ses en blå gradient i stedet. Den almindelige variant (`default`) er uændret.

**Hover – Figma "få notifikationer" (node `913:14280`):** holder man musen over plakaten (eller står på den med tastaturet), bliver toningen lysere, dato og titel skjules, og en knap vises i midten. Er billetsalget åbent (`ticket_sale_open`), står der **"Se spilletider"**, ellers **"Læs mere"**. Begge fører til toppen af filmsiden, så man ser billede, trailer og handling først. Det er en `span` med `Button`'s "primary"-styles (klassen `.action`, som kortene i feedet også bruger), fordi hele plakaten allerede er et link til filmsiden.

Plakaten har 8px runde hjørner (`--radius-md`) og toningen `Toning/85%` (`--color-poster-overlay`).

### `components/ui/Button.js` – variant `secondary`
Bruges til "Se alle kommende film" og "Skjul kommende film". Kanten bruger Figmas `buttons/sekundær-border`.

## 4. Sektionen – `components/features/ComingSoonSection.js`

En **client component** (`"use client"`), fordi den skal kunne huske, hvad brugeren har klikket på:

| State | Værdier | Hvad den styrer |
|---|---|---|
| `showAll` | `true` / `false` | `false`: de første 10 plakater (`VISIBLE_COUNT`). `true`: alle plakater i filteret. |
| `filter` | `"all"`, `"2026-11"` …, `"presale"` | Hvilke film der vises i gitteret |

- **Filtrene** laves ud fra dataene: "Alle", én knap pr. måned med en premiere og "Forsalg åben". Kommer der film i en ny måned, kommer der automatisk en ny knap.
- **Knappen** vises kun, når der er flere end 10 film i det valgte filter.
- **Rulning og tilgængelighed:** når man trykker "Skjul kommende film", ruller siden op til overskriften "Kommende film", og fokus flytter med, så man ikke står langt nede på siden. Bruger man "mindre bevægelse" i styresystemet, hopper siden i stedet for at glide. Knappen har `aria-expanded` og `aria-controls`, og filtrene er samlet i en `role="group"`.

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
| ændre hvor mange dage før premieren billetsalget åbner | `lib/data/ticket-sale.js` |
| ændre hvor mange plakater der vises før "Se alle" | `VISIBLE_COUNT` i `components/features/ComingSoonSection.js` |
| give en film uden plakat et billede | `POSTER_FALLBACKS` i `lib/data/movies.js` |
| ændre teksterne i sektionen | `components/features/ComingSoonSection.js` |
| ændre plakatens udseende | `components/features/MovieCard.module.css` |
| ændre farver, størrelser og afstande | `app/tokens.css` |
