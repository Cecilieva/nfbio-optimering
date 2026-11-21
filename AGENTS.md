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
  (site)/profile/         Konto
  (auth)/login/ signup/   Log ind og Opret profil (2 trin). layout.js giver fuld Header og ingen footer (som i Figma)
components/
  ui/                     Generiske byggeklodser: Button, Chip, TextField, Checkbox, Radio, Modal, Overlay, PopcornLoader, PopcornShower, LoadingDots, ParallaxFrame, Seat, DataDump
  features/               Domænekomponenter: Header, HeaderSearch, MainMenu, CityMenu, SidePanel, Footer, Spotlight, MovieCard, SeatMap, SeatPicker, SeatView, …
    homepage-animations/  Animationerne på /film: HeroScroll (GSAP ScrollTrigger), Starfield, IntroCountdown, FeaturedMovies, Finale
    showtimes/            Spilletiderne på filmsiden: ShowtimeList, ShowtimeButton, StatusDot, SelectedShowtime, HallMap
lib/
  data/                   Læsning: cities, movies, featured, intro-posters, showtimes, seats, bookings, profile
  actions/                Server actions: auth, city, booking
  supabase/server.js      Supabase-klienten til serveren
  auth.js                 getCurrentUser()
  booking-cookie.js       Kopi af bookingen til gæster (se nedenfor)
  booking-owner.js        claimBooking: gør den, der er logget ind, til ejer af en reservation (bruges af actions)
  format.js               Dato, tid, pris, varighed og sæder (formatSeats) - dansk og i Europe/Copenhagen
  payment-errors.js       De simulerede betalingsfejl (fx KORT-402)
  ticket-types.js         Billettyperne (Voksen, Barn, Pensionist) og deres priser
  safe-path.js            Validerer ?next=
  seat-rules.js           Sædevalget: et ledigt sæde må ikke efterlades alene (findLoneSeats) og de bedste pladser midt i salen (findBestSeats)
supabase/supabase_schema.sql
```

## Købsflowet

`/` (Vælg by) -> `/film` -> `/film/[slug]` -> `/bestil/saeder/[showtimeId]` -> `reserve_seats` (uden ejer) -> `/bestil/[bookingId]/login` -> `attach_booking_owner` -> `/bestil/[bookingId]/betaling` -> `complete_payment` -> `/bestil/[bookingId]/billet`

- Byen gemmes i cookien `nf_city` (`lib/actions/city.js`). `/` viser altid Vælg by - også når en by er valgt - og sender videre til `/film`.
- Er brugeren logget ind ved reservationen, sætter `reserve_seats` ejeren med det samme, og login-skærmen springes over. Logger man ind eller opretter en profil på login-skærmen (eller går tilbage og vælger de samme sæder efter at have logget ind), bliver man ejer med det samme (`claimBooking` i `lib/booking-owner.js`) og går direkte til betaling - der er intet "Du er logget ind"-mellemtrin.
- RLS lader kun indloggede ejere læse `bookings`. Derfor gemmer actions en kopi af bookingrækken + sæde-id'er i den httpOnly-cookie `nf_booking`, og `getBooking()` falder tilbage til den. Kopien er kun til visning - RPC'erne tjekker alt i databasen.
- Uret ("Dine pladser holdes i") er det samme på alle siderne. Det starter på "Vælg dine pladser", og tidspunktet gemmes som `hold_until` i booking-cookien. `getBooking()` bruger det i stedet for databasens `reserved_until`, når det er tidligere. Løber tiden ud, vises "Tiden er udløbet" (ReservationExpired), og "Vælg pladser igen" fører til "Vælg dine pladser" med de samme billetter (`?booking=…`).
- Indlæsning: brug altid den almindelige loader (LoadingState - popkorn + "Indlæser"). Der er ingen `loading.js` - den gamle side bliver stående, indtil den nye er klar, så man ikke ser en tom side. En formular, der sender en videre til en ny side, får `<FormLoader />` inde i `<form>` (ved betaling med `title`/`text`: "Reserverer pladser"). Alle links, der henter en ny side (fx Button med `href`, BackLink, MovieCard, menuen, headeren og footeren), har `<LinkLoader />` inde i linket, så loaderen også vises med det samme på et langsomt net. Loaderen kommer først frem efter 1 sekund (på et hurtigt net ser man den ikke), og når den er synlig, står den mindst 3 sekunder (LoadingHost i hver gruppes layout). Kun to steder vises den altid (`always`): på vej ind på en filmside (filmkortene i MovieCard og søgningen i headeren) og "Reserverer pladser" ved betaling. Små formularer, der bliver på siden (fx nyhedsbrevet), får ingen loader.
- Betalingen er simuleret (`completePayment`): MobilePay går altid igennem. Betalingskort (KORT-402) og gavekort (GAVEKORT-404) fejler altid og sender til fejlsiden (`betaling/fejl?metode=…`). Derfra prøver man igen eller går tilbage til betalingen, hvor fejlen vises i formularen (`?fejl=…`). Fejlkoderne står i `lib/payment-errors.js`.
- `/bestil/saeder/…` hedder sådan, fordi Next.js ikke tillader to forskellige dynamiske navne (`[showtimeId]` og `[bookingId]`) på samme niveau.

## Sæder

Sæder har `row_number` og `seat_number` (begge tal), og `col` (kolonnen i salen - huller er gange). Der er ingen daybeds - alle sæder er almindelige sæder eller handicappladser. Vis altid valgte sæder med `formatSeats(seats)` fra `lib/format.js`, fx "Række 4, sæde 6–7" eller "Række 4, sæde 6, 9" - skriv aldrig teksten selv.

Man må ikke efterlade et ledigt sæde alene (optaget sæde, gang eller væg på begge sider), medmindre det er den eneste mulighed - fx 3 personer, der vil sidde samlet, og der er kun 4 ledige sæder ved siden af hinanden, eller når salen er næsten udsolgt. Reglen står i `lib/seat-rules.js` og tjekkes både i SeatPicker og i `reserveSeats`.

Når man kommer fra "Vælg antal" til sædevalget, får man automatisk tildelt pladser så tæt på midten af salen som muligt (`findBestSeats` i samme fil). Man kan frit ændre dem: et klik på et ledigt sæde bytter med det sæde, der blev valgt først.

## Pladsholdere

Hver side viser sine data enkelt og har en `DataDump` nederst. Når en skærm bygges fra Figma: style de eksisterende komponenter, og fjern `DataDump` fra siden.

## Figma-skærme -> routes -> komponenter

Udfyld node-id, når skærmen hentes med Figma MCP (`get_design_context`).

| Figma-skærm | Figma node-id | Route | Komponenter |
|---|---|---|---|
| Header | 258:5371 | alle sider | Header (`variant="full"` og `variant="logo"`), ScrollHeader (gemmer headeren ved scroll ned, viser den ved scroll op), MainMenu, CityMenu, HeaderSearch (Figma "Søgning" 3709:15325 - søge-ikonet folder et felt ud til venstre for sig selv og lukker det igen; søger i titlerne fra `getSearchMovies` i `lib/data/movies.js` - film, der kører nu i den valgte by, og kommende. Piletaster flytter markeringen, Enter åbner filmen) |
| Menu | 1056:25687 | alle sider med fuld header | MainMenu (burgermenuen), SidePanel (panelet fra siden med "Luk" øverst - intet logo; deles med Byskift), Button |
| Byskift | 2588:40783 | alle sider med fuld header | CityMenu (lokations-ikonet i headeren - panelet kommer fra højre, vælger by med `selectCity` og sender til `/film`), SidePanel |
| Footer | 1084:25941 | alle sider med footer | Footer (12-kolonne griddet: indholdet i kolonne 2-11 med `--layout-page-margin`; logo, Biograf og Hjælp 2 kolonner hver, nyhedsbrevet 4; Egmont-logoet fra nfbio.dk står lodret i midten og linker til egmont.com), NewsletterForm |
| Vælg by | 2141:155168 (By-knap: 3686:15251) | `/` og `/by` | Header (`variant="logo"`), Spotlight, Button (`variant="tile"` - Figma "By-knap" med Default og Hover, hvor kanten bliver accent/Primær). Ingen by er markeret på forhånd |
| Forside - intro (motion) | 1869:14851 (nedtælling: 1869:15878) | `/film` | HeroScroll (scroll-styret med GSAP - 8 tilfældige plakater fra `lib/data/intro-posters.js`, valgt i FeaturedMovies), Starfield, IntroCountdown - alle i `features/homepage-animations/`. Den sidste plakat folder sig ud til kort 1 i FeaturedMovies. Nedtællingen kører én gang pr. indlæsning af siden – ikke når man kommer tilbage via et link |
| Forside - "Kommer snart"-kort | 11:34 | `/film` | FeaturedMovies (i `features/homepage-animations/` - kortene under hinanden, scroll-effekter og prikker), ComingSoonCard, ParallaxFrame, SmoothScroll (Lenis, i `(site)/layout.js`), FollowButton, TrailerButton, Button (`variant="outline"`). Filmene (de 3 med nærmeste premiere fra i morgen, med `hero_url`) vælges i `lib/data/featured.js` |
| Forside - "Kommende film" (udfold) | 2521:34621 (i "Forside - samlet" 1856:79051) | `/film` | ComingSoonSection (under filmene, der kører nu - 10 plakater og "Se alle kommende film"), MovieCard (`variant="coming-soon"`), Chip (Option button), Button (`variant="secondary"`). Billetsalget åbner 7 dage før premieren (`lib/data/ticket-sale.js`) |
| Forside - "Filtrering" | 2848:14506 (komponent "Filtering" 464:12550, "Filterfelt" 2087:9999, "Dropdown valg" 535:2814, "Søgepanel" 3761:15644) | `/film` | MovieFilter, FilterField, Chip (`variant="subtle"` - Figma "Formater"), MovieCard, HeaderSearch (`variant="filter"` - den blå søgeknap åbner et søgepanel under sig og søger i filmene, der kører i byen) |
| Forside - "Program" (filmene under filtreringen) | 2867:21344 (kortet "card i feed" 214:3673) | `/film` | MovieFilter, MovieCard (`variant="feed"`), Button (`variant="secondary"`) - "Se flere film" |
| Forside - Finale (motion) | 1883:12291 | `/film` | Finale (i `features/homepage-animations/` - scroll-styret med GSAP: sektionen pinnes, og sloganet lyses op bogstav for bogstav), Starfield |
| Forside | | `/film` | Header, MovieCard, PosterPlaceholder, Footer |
| Filmside | Projektor - standard: 3063:14519, Titel - standard: 3063:14531, Titel - smelter: 1797:9068 / 1797:9099, Nedtælling: 594:3212, REC: 570:3180, Lommelygte: 570:3160 (topbar: 1842:64049) | `/film/[slug]` | MovieHero, Flashlight, MovieTitle (`variant="clayface"` og `variant="katten"` - unikke kampagne-animationer, kun til de to film; valgt i `getTitleVariant` i `lib/data/movies.js`. Dråberne (MeltDrips) i samme fil), Countdown (`variant="premiere"`), CaseLabel, MovieInfoBar (TrailerButton, FollowButton, Button), Modal |
| Filmside - "Filmdetaljer" (plakat, handling, fakta) | 2250:15224 (Anmeldelse: 2249:15255) | `/film/[slug]` | MovieDetails, TrailerButton, ShareButton, BearRating, PosterPlaceholder |
| Filmside - "Spilletider" | 627:3145 (Din forestilling: 2010:26575, Biograf-vælger: 1813:9324) | `/film/[slug]` | ShowtimeList, ShowtimeButton, StatusDot, SelectedShowtime (alle i `features/showtimes/`), Chip (format), FilterField (`variant="box"` - biograf), Button (`variant="more"` - "Se salen", `primary` - "Vælg billetter"). Ledige pladser regnes ud i `getShowtimes`. Kommende film: første dag hedder "Premiere" |
| Filmside - "Se salen" (overblik over salen) | Sal/1: 929:6302, Sal/3: 929:7069, Sal/4: 929:7295, Sal/5: 929:7522, Sal/6: 929:8100, Sal/7: 929:8359 | `/film/[slug]` | HallMap (i `features/showtimes/` - vises fra SelectedShowtime). Sæderne tegnes med Seat (`components/ui` - Figma "Sæde" 214:3678, farverne er tokens, så de skifter i familie-mode). Layoutet hentes med `getHallLayouts` i `lib/data/seats.js`; sædernes placering står i `seats.col`, og salene bygges med `seed_hall_seats` i skemaet |
| Trailer-modal | 596:3073 (Fortæppe: 636:3749) | `/film/[slug]` og `/film` | TrailerButton, Modal, Curtain (fortæppet, der åbner over videoen), Button (`variant="secondary"` - "Luk" med kryds) |
| Sædevalg - vælg antal ("Antal pladser") | 737:6375 (Trin-header: 811:6487, Vælg antal-kort: 775:6366) | `/bestil/saeder/[showtimeId]` | StepHeader, SeatPicker (trin 1 af 2 på siden), TicketCounter, Button. Billettyper og priser i `lib/ticket-types.js` |
| Sædevalg - vælg sæder | 214:4067 (Info-boks: 838:6543, Bundbar: 843:6569, Lærredet set lige forfra: 3789:15442 - `screen-straight.svg`) | `/bestil/saeder/[showtimeId]` | SeatPicker (trin 2 af 2 på siden), SeatMap (salen - tegnes med Seat som HallMap), SeatView ("Udsigt fra sædet": lærredet i perspektiv, Række/Sæder, pris og "Til betaling"), BottomBar (valgte sæder + Countdown "Dine pladser holdes i"), Button |
| Overlay: Dine popkorn blev brændt | | `/bestil/saeder/[showtimeId]` | Overlay, Button |
| Tiden er udløbet | 1625:55285 (Popcorn – loader: 1335:26656, "Tom popkorn 1-2" + "Trin11-12") | `/bestil/[bookingId]/login` og `/betaling` | ReservationExpired (bygger på Overlay - dækker hele skærmen med det svingende popkorn-bæger - vises af siden, eller af Countdown med `expiredHref`, når uret rammer 00:00), Button |
| Loading (+ "Reserverer pladser" ved betaling) | 214:4509 (Popcorn – loader: 1335:26656, Trin 1-4; Prikker – loader: 1352:26878) | alle sider (se "Indlæsning" under Købsflowet) | LoadingState (siger "jeg henter noget"), LoadingHost (tegner loaderen - i hver route-gruppes layout), FormLoader, LinkLoader, Overlay, PopcornLoader, LoadingDots. Loaderen har altid de samme farver, også i thriller og familie (`--color-loader-…`). Bæger + bunke er én svg (`public/popcorn/popkorn.svg`), popkornene, der hopper, er `pop-1…3.svg` |
| Log ind / gæst / opret profil ("Dine oplysninger") | 214:5116 (Gæstebestilling: 1519:35087, Opret profil: 1894:29458, Ordreoversigt: 214:3695) | `/bestil/[bookingId]/login` | StepHeader, OrderSummary ("Din ordre"), CheckoutLogin (log ind; `?gaest=1` giver "Gæstebestilling", `?opret=1` giver "Opret en BioPlus-profil" med CheckoutSignupForm, Chip og Checkbox), AttachOwnerForm, TextField, Button, BottomBar + Countdown. Billettyperne (fx "2 × Voksen") gemmes kun i booking-cookien (`tickets`) |
| Betaling | | `/bestil/[bookingId]/betaling` | StepHeader, OrderSummary ("Din ordre" til venstre), PaymentForm ("Vælg betalingsmetode" til højre - Radio som bokse med titel og tekst, Checkbox til handelsbetingelserne, Button, PaymentLoader - "Reserverer pladser"), BottomBar + Countdown. Samme opbygning som "Dine oplysninger" |
| Betalingsfejl (inline) | 1364:27183 | `/bestil/[bookingId]/betaling?fejl=card` | PaymentForm (`initialError`), Radio (`error` - metoden, der fejlede, får rød kant, fejl-ikon og fejlbeskeden under). Vises, når man kommer fra fejlsiden med "Vælg anden betaling". Resten af siden er uændret |
| Betalingsfejl (side) | Fejlside (Popcorn – loader: 1335:26656, "Brændt 1-4") | `/bestil/[bookingId]/betaling/fejl?metode=card` | PaymentFailed (bygger på Overlay - de brændte popkorn med røg: PopcornLoader `burnt`), PaymentLoader ("Reserverer pladser" - deles med PaymentForm), Button. "Prøv igen" betaler igen med samme metode ("Reserverer pladser" og så fejlsiden igen), "Vælg anden betaling" fører til betalingen med inline-fejlen |
| Billet - printes ("Din billet klargøres til udprintning") | 214:5203 | `/bestil/[bookingId]/billet` | TicketPrint (billetten printes ud af sprækken i fire ryk - `--duration-ticket-print`), StepHeader (`centered`), LoadingDots, PopcornShower (popkornene, der drysser over skærmen i stedet for konfetti - `pop-1…3.svg`) |
| Billet - færdig ("Din billet er printet") | 214:4766 (Billet: 2964:14829, Popkorn: 668:4961) | `/bestil/[bookingId]/billet` | TicketPrint, Ticket (papiret med splinterne `public/billet/moenster.svg` og stubben med isbjørnen `icons/bear.svg` - bruger Figmas variabler), Button ("Tilbage til forsiden"). Underteksten laves med `formatShowtimeLine` i `lib/format.js` |
| Log ind | 761:18178 | `/login` | TextField, Checkbox, Button |
| Opret profil | | `/signup` | - (bruger globale `.form`-styles) |
| Profil | | `/profile` | UserBadge |
