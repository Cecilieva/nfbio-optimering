<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` - verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Nordisk Film Biograf - projektregler

Next.js (App Router) + Supabase. Al tekst i UI'et er på dansk. Kodekommentarer er også på dansk, skrevet i et simpelt sprog. De forklarer kort, hvad koden gør, og går kun i dybden, hvor koden er svær at forstå.

## Regler

1. **Kør aldrig SQL mod databasen** - heller ikke migrationer eller "små rettelser". Skemaet står i `supabase/supabase_schema.sql` og er den eneste kilde til tabeller, views, RPC'er og RLS. Mangler der noget i databasen, så beskriv ændringen og lad brugeren køre den.
2. **Data hentes via `lib/data/`.** Sider (`app/**/page.js`) kalder funktionerne derfra. Komponenter kalder aldrig Supabase direkte - de får data som props.
3. **Ændringer går gennem server actions i `lib/actions/`.** De returnerer `{ error: { code, message } }` til `useActionState` eller redirecter til næste trin.
4. **Styling bruger kun tokens fra `app/tokens.css`.** Ingen hårdkodede farver, størrelser, skygger eller fonte i andre CSS-filer. Mangler der en værdi, så tilføj et token. Nye farver lægges i farvepaletten øverst i tokens.css (`--palette-…`), og tokens henter dem derfra.
5. **Figma-skærme bygges ved at genbruge eksisterende komponenter.** Style og udvid komponenterne i `components/ui` og `components/features` frem for at lave nye. Lav kun en ny komponent, når ingen eksisterende passer, og læg den i den rigtige mappe.
6. **Rør ikke auth-opsætningen** (`lib/supabase/`, `proxy.js`, `lib/auth.js`), medmindre opgaven kræver det.

## Mappestruktur

```
app/
  tokens.css              Design tokens: farvepalet (--palette-…), Figma-variabler (--figma-…), sitets tokens og Figma-tilstande
  globals.css             Base-styles, kun med tokens
  layout.js               Kun <html>/<body> og fonte
  not-found.js            404 (viser selv Header + Footer)
  (start)/               Route-gruppe: Vælg by. layout.js giver logo-header og ingen footer
  (start)/page.js         / - Vælg by, starten på flowet (vises altid først)
  (start)/by/page.js      /by - samme skærm, bruges til at skifte by (?next=)
  (site)/                 Route-gruppe: alle andre sider. layout.js giver fuld Header + Footer
  (site)/film/page.js     /film - Forside (filmoversigt for den valgte by)
  (site)/film/[slug]/     Filmside
  (bestil)/               Route-gruppe: købsflowet. layout.js giver logo-header og ingen footer
  (bestil)/bestil/
    saeder/[showtimeId]/  Sædevalg (før der findes en booking)
    [bookingId]/login/    Log ind / gæst / opret profil
    [bookingId]/betaling/ Betaling (+ fejl/ til fejlsiden)
    [bookingId]/billet/   Billet
  (site)/login/ signup/ profile/ Konto
components/
  ui/                     Generiske byggeklodser: Button, Chip, TextField, Checkbox, Radio, Modal, Overlay, ParallaxFrame, Seat, DataDump
  features/               Domænekomponenter: Header, Footer, Spotlight, MovieCard, SeatMap, SeatPicker, SeatView, …
    homepage-animations/  Animationerne på /film: HeroScroll (GSAP ScrollTrigger), Starfield, IntroCountdown, FeaturedMovies, Finale
    showtimes/            Spilletiderne på filmsiden: ShowtimeList, ShowtimeButton, StatusDot, SelectedShowtime, HallMap
lib/
  data/                   Læsning: cities, movies, featured, intro-posters, showtimes, seats, bookings, profile
  actions/                Server actions: auth, city, booking
  supabase/server.js      Supabase-klienten til serveren
  auth.js                 getCurrentUser()
  booking-cookie.js       Kopi af bookingen til gæster (se nedenfor)
  format.js               Dato, tid, pris, varighed og sæder (formatSeats) - dansk og i Europe/Copenhagen
  payment-errors.js       De simulerede betalingsfejl (fx MP-408)
  ticket-types.js         Billettyperne (Voksen, Barn, Pensionist) og deres priser
  safe-path.js            Validerer ?next=
  seat-rules.js           Sædevalget: et ledigt sæde må ikke efterlades alene (findLoneSeats) og de bedste pladser midt i salen (findBestSeats)
supabase/supabase_schema.sql
```

## Købsflowet

`/` (Vælg by) -> `/film` -> `/film/[slug]` -> `/bestil/saeder/[showtimeId]` -> `reserve_seats` (uden ejer) -> `/bestil/[bookingId]/login` -> `attach_booking_owner` -> `/bestil/[bookingId]/betaling` -> `complete_payment` -> `/bestil/[bookingId]/billet`

- Byen gemmes i cookien `nf_city` (`lib/actions/city.js`). `/` viser altid Vælg by - også når en by er valgt - og sender videre til `/film`.
- Er brugeren logget ind ved reservationen, sætter `reserve_seats` ejeren med det samme, og login-skærmen springes over.
- RLS lader kun indloggede ejere læse `bookings`. Derfor gemmer actions en kopi af bookingrækken + sæde-id'er i den httpOnly-cookie `nf_booking`, og `getBooking()` falder tilbage til den. Kopien er kun til visning - RPC'erne tjekker alt i databasen.
- Betalingen er simuleret. `PaymentForm` har et felt til at vælge resultatet; fejlkoderne står i `lib/payment-errors.js`.
- `/bestil/saeder/…` hedder sådan, fordi Next.js ikke tillader to forskellige dynamiske navne (`[showtimeId]` og `[bookingId]`) på samme niveau.

## Sæder

Sæder har `row_number` og `seat_number` (begge tal), og `col` (kolonnen i salen - huller er gange). Der er ingen daybeds - alle sæder er almindelige sæder eller handicappladser. Vis altid valgte sæder med `formatSeats(seats)` fra `lib/format.js`, fx "Række 4, sæde 6–7" eller "Række 4, sæde 6, 9" - skriv aldrig teksten selv.

Man må ikke efterlade et ledigt sæde alene (optaget sæde, gang eller væg på begge sider), medmindre der ikke er nogen anden måde at vælge antallet på - fx når salen er næsten udsolgt. Reglen står i `lib/seat-rules.js` og tjekkes både i SeatPicker og i `reserveSeats`.

Når man kommer fra "Vælg antal" til sædevalget, får man automatisk tildelt pladser så tæt på midten af salen som muligt (`findBestSeats` i samme fil). Man kan frit ændre dem: et klik på et ledigt sæde bytter med det sæde, der blev valgt først.

## Pladsholdere

Hver side viser sine data enkelt og har en `DataDump` nederst. Når en skærm bygges fra Figma: style de eksisterende komponenter, og fjern `DataDump` fra siden.

## Figma-skærme -> routes -> komponenter

Udfyld node-id, når skærmen hentes med Figma MCP (`get_design_context`).

| Figma-skærm | Figma node-id | Route | Komponenter |
|---|---|---|---|
| Vælg by | 2141:155168 | `/` og `/by` | Header (`variant="logo"`), Spotlight, Button (`variant="tile"`) |
| Forside - intro (motion) | 1869:14851 (nedtælling: 1869:15878) | `/film` | HeroScroll (scroll-styret med GSAP - 8 tilfældige plakater fra `lib/data/intro-posters.js`, valgt i FeaturedMovies), Starfield, IntroCountdown - alle i `features/homepage-animations/`. Den sidste plakat folder sig ud til kort 1 i FeaturedMovies. Nedtællingen kører én gang pr. indlæsning af siden – ikke når man kommer tilbage via et link |
| Forside - "Kommer snart"-kort | 11:34 | `/film` | FeaturedMovies (i `features/homepage-animations/` - kortene under hinanden, scroll-effekter og prikker), ComingSoonCard, ParallaxFrame, SmoothScroll (Lenis, i `(site)/layout.js`), FollowButton, TrailerButton, Button (`variant="outline"`). Filmene (de 3 med nærmeste premiere fra i morgen, med `hero_url`) vælges i `lib/data/featured.js` |
| Forside - "Kommende film" (udfold) | 2521:34621 (i "Forside - samlet" 1856:79051) | `/film` | ComingSoonSection (under filmene, der kører nu - 10 plakater og "Se alle kommende film"), MovieCard (`variant="coming-soon"`), Chip (Option button), Button (`variant="secondary"`). Billetsalget åbner 7 dage før premieren (`lib/data/ticket-sale.js`) |
| Forside - "Filtrering" | 2848:14506 (komponent "Filtering" 464:12550, "Filterfelt" 2087:9999, "Dropdown valg" 535:2814) | `/film` | MovieFilter, FilterField, Chip (`variant="subtle"` - Figma "Formater"), MovieCard |
| Forside - "Program" (filmene under filtreringen) | 2867:21344 (kortet "card i feed" 214:3673) | `/film` | MovieFilter, MovieCard (`variant="feed"`), Button (`variant="secondary"`) - "Se flere film" |
| Forside - Finale (motion) | 1883:12291 | `/film` | Finale (i `features/homepage-animations/` - scroll-styret med GSAP: sektionen pinnes, og sloganet lyses op bogstav for bogstav), Starfield |
| Forside | | `/film` | Header, MovieCard, PosterPlaceholder, Footer |
| Filmside | Projektor - standard: 3063:14519, Titel - standard: 3063:14531, Titel - smelter: 1797:9068 / 1797:9099, Nedtælling: 594:3212, REC: 570:3180, Lommelygte: 570:3160 (topbar: 1842:64049) | `/film/[slug]` | MovieHero, Flashlight, MovieTitle (`variant="clayface"` og `variant="katten"` - unikke kampagne-animationer, kun til de to film; valgt i `getTitleVariant` i `lib/data/movies.js`. Dråberne (MeltDrips) i samme fil), Countdown (`variant="premiere"`), CaseLabel, MovieInfoBar (TrailerButton, FollowButton, Button), Modal |
| Filmside - "Filmdetaljer" (plakat, handling, fakta) | 2250:15224 (Anmeldelse: 2249:15255) | `/film/[slug]` | MovieDetails, TrailerButton, ShareButton, BearRating, PosterPlaceholder |
| Filmside - "Spilletider" | 627:3145 (Din forestilling: 2010:26575, Biograf-vælger: 1813:9324) | `/film/[slug]` | ShowtimeList, ShowtimeButton, StatusDot, SelectedShowtime (alle i `features/showtimes/`), Chip (format), FilterField (`variant="box"` - biograf), Button (`variant="secondary"` - "Se salen", `primary` - "Vælg billetter"). Ledige pladser regnes ud i `getShowtimes`. Kommende film: første dag hedder "Premiere" |
| Filmside - "Se salen" (overblik over salen) | Sal/1: 929:6302, Sal/3: 929:7069, Sal/4: 929:7295, Sal/5: 929:7522, Sal/6: 929:8100, Sal/7: 929:8359 | `/film/[slug]` | HallMap (i `features/showtimes/` - vises fra SelectedShowtime). Sæderne tegnes med Seat (`components/ui` - Figma "Sæde" 214:3678, farverne er tokens, så de skifter i familie-mode). Layoutet hentes med `getHallLayouts` i `lib/data/seats.js`; sædernes placering står i `seats.col`, og salene bygges med `seed_hall_seats` i skemaet |
| Trailer-modal | 596:3073 (Fortæppe: 636:3749) | `/film/[slug]` og `/film` | TrailerButton, Modal, Curtain (fortæppet, der åbner over videoen), Button (`variant="secondary"` - "Luk" med kryds) |
| Sædevalg - vælg antal ("Antal pladser") | 737:6375 (Trin-header: 811:6487, Vælg antal-kort: 775:6366) | `/bestil/saeder/[showtimeId]` | StepHeader, SeatPicker (trin 1 af 2 på siden), TicketCounter, Button. Billettyper og priser i `lib/ticket-types.js` |
| Sædevalg - vælg sæder | 214:4067 (Info-boks: 838:6543, Bundbar: 843:6569) | `/bestil/saeder/[showtimeId]` | SeatPicker (trin 2 af 2 på siden), SeatMap (salen - tegnes med Seat som HallMap), SeatView ("Udsigt fra sædet": lærredet i perspektiv, Række/Sæder, pris og "Til betaling"), BottomBar (valgte sæder + Countdown "Dine pladser holdes i"), Button |
| Overlay: Vi popper dine pladser | | `/bestil/[bookingId]/login` | Overlay (i AttachOwnerForm - vises efter log ind eller "Fortsæt som gæst") |
| Overlay: Dine popkorn blev brændt | | `/bestil/saeder/[showtimeId]` | Overlay, Button |
| Log ind / gæst / opret profil ("Dine oplysninger") | 214:5116 (Gæstebestilling: 1519:35087, Opret profil: 1894:29458, Ordreoversigt: 214:3695) | `/bestil/[bookingId]/login` | StepHeader, OrderSummary ("Din ordre"), CheckoutLogin (log ind; `?gaest=1` giver "Gæstebestilling", `?opret=1` giver "Opret en BioPlus-profil" med SignupForm, Chip og Checkbox), AttachOwnerForm, TextField, Button, BottomBar + Countdown. Billettyperne (fx "2 × Voksen") gemmes kun i booking-cookien (`tickets`) |
| Betaling | | `/bestil/[bookingId]/betaling` | StepHeader, Countdown, OrderSummary, PaymentForm, Radio, Button |
| Betalingsfejl (inline) | | `/bestil/[bookingId]/betaling` | PaymentForm |
| Betalingsfejl (side) | | `/bestil/[bookingId]/betaling/fejl` | Button |
| Billet - printes | | `/bestil/[bookingId]/billet` | TicketPrint |
| Billet - færdig | | `/bestil/[bookingId]/billet` | StepHeader, TicketPrint, OrderSummary |
| Log ind | 761:18178 | `/login` | TextField, Checkbox, Button |
| Opret profil | | `/signup` | - (bruger globale `.form`-styles) |
| Profil | | `/profile` | UserBadge |
