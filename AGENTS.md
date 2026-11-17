<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Nordisk Film Biograf – projektregler

Next.js (App Router) + Supabase. Al tekst i UI'et er på dansk. Kodekommentarer er på engelsk.

## Regler

1. **Kør aldrig SQL mod databasen** – heller ikke migrationer eller "små rettelser". Skemaet står i `supabase/supabase_schema.sql` og er den eneste kilde til tabeller, views, RPC'er og RLS. Mangler der noget i databasen, så beskriv ændringen og lad brugeren køre den.
2. **Data hentes via `lib/data/`.** Sider (`app/**/page.js`) kalder funktionerne derfra. Komponenter kalder aldrig Supabase direkte – de får data som props.
3. **Ændringer går gennem server actions i `lib/actions/`.** De returnerer `{ error: { code, message } }` til `useActionState` eller redirecter til næste trin.
4. **Styling bruger kun tokens fra `app/tokens.css`.** Ingen hårdkodede farver, størrelser, skygger eller fonte i andre CSS-filer. Mangler der en værdi, så tilføj et token.
5. **Figma-skærme bygges ved at genbruge eksisterende komponenter.** Style og udvid komponenterne i `components/ui` og `components/features` frem for at lave nye. Lav kun en ny komponent, når ingen eksisterende passer, og læg den i den rigtige mappe.
6. **Rør ikke auth-opsætningen** (`lib/supabase/`, `proxy.js`, `lib/auth.js`), medmindre opgaven kræver det.

## Mappestruktur

```
app/
  tokens.css              Design tokens (pladsholdere – skal hentes fra Figma-variablerne)
  globals.css             Base-styles, kun med tokens
  layout.js               Kun <html>/<body> og fonte
  not-found.js            404 (viser selv Header + Footer)
  by/                     Vælg by – egen layout med logo-header og uden footer
  (site)/                 Route-gruppe: alle andre sider. layout.js giver fuld Header + Footer
  (site)/page.js          Forside
  (site)/film/[slug]/     Filmside
  (site)/bestil/
    saeder/[showtimeId]/  Sædevalg (før der findes en booking)
    [bookingId]/login/    Log ind / gæst / opret profil
    [bookingId]/betaling/ Betaling (+ fejl/ til fejlsiden)
    [bookingId]/billet/   Billet
  (site)/login/ signup/ profile/ Konto
components/
  ui/                     Generiske byggeklodser: Button, Chip, TextField, Checkbox, Radio, Modal, Overlay, DataDump
  features/               Domænekomponenter: Header, Footer, Spotlight, MovieCard, ShowtimeList, SeatMap, SeatPicker, …
lib/
  data/                   Læsning: cities, movies, showtimes, seats, bookings, profile
  actions/                Server actions: auth, city, booking
  supabase/server.js      Supabase-klienten til serveren
  auth.js                 getCurrentUser()
  booking-cookie.js       Kopi af bookingen til gæster (se nedenfor)
  format.js               Dato, tid, pris, varighed og sæder (formatSeats) – dansk og i Europe/Copenhagen
  payment-errors.js       De simulerede betalingsfejl (fx MP-408)
  safe-path.js            Validerer ?next=
supabase/supabase_schema.sql
```

## Købsflowet

`/by` → `/` → `/film/[slug]` → `/bestil/saeder/[showtimeId]` → `reserve_seats` (uden ejer) → `/bestil/[bookingId]/login` → `attach_booking_owner` → `/bestil/[bookingId]/betaling` → `complete_payment` → `/bestil/[bookingId]/billet`

- Byen gemmes i cookien `nf_city` (`lib/actions/city.js`).
- Er brugeren logget ind ved reservationen, sætter `reserve_seats` ejeren med det samme, og login-skærmen springes over.
- RLS lader kun indloggede ejere læse `bookings`. Derfor gemmer actions en kopi af bookingrækken + sæde-id'er i den httpOnly-cookie `nf_booking`, og `getBooking()` falder tilbage til den. Kopien er kun til visning – RPC'erne tjekker alt i databasen.
- Betalingen er simuleret. `PaymentForm` har et felt til at vælge resultatet; fejlkoderne står i `lib/payment-errors.js`.
- `/bestil/saeder/…` hedder sådan, fordi Next.js ikke tillader to forskellige dynamiske navne (`[showtimeId]` og `[bookingId]`) på samme niveau.

## Sæder

Sæder har `row_number` og `seat_number` (begge tal). Vis altid valgte sæder med `formatSeats(seats)` fra `lib/format.js`, fx "Række 4, sæde 6–7" eller "Række 4, sæde 6, 9" – skriv aldrig teksten selv.

## Pladsholdere

Hver side viser sine data enkelt og har en `DataDump` nederst. Når en skærm bygges fra Figma: style de eksisterende komponenter, og fjern `DataDump` fra siden.

## Figma-skærme → routes → komponenter

Udfyld node-id, når skærmen hentes med Figma MCP (`get_design_context`).

| Figma-skærm | Figma node-id | Route | Komponenter |
|---|---|---|---|
| Vælg by | 2141:155168 | `/by` | Header (`variant="logo"`), Spotlight, Button (`variant="tile"`) |
| Forside | | `/` | Header, MovieCard, PosterPlaceholder, Footer |
| Filmside | | `/film/[slug]` | PosterPlaceholder, TrailerButton, Modal, ShowtimeList |
| Trailer-modal | | `/film/[slug]` | TrailerButton, Modal |
| Sædevalg – vælg antal | | `/bestil/saeder/[showtimeId]` | StepHeader, OrderSummary, SeatPicker, Chip, BottomBar |
| Sædevalg – vælg sæder | | `/bestil/saeder/[showtimeId]` | SeatPicker, SeatMap, BottomBar, Button |
| Overlay: Vi popper dine pladser | | `/bestil/saeder/[showtimeId]` | Overlay |
| Overlay: Dine popkorn blev brændt | | `/bestil/saeder/[showtimeId]` | Overlay, Button |
| Log ind / gæst / opret profil | | `/bestil/[bookingId]/login` | StepHeader, OrderSummary, TextField, Button, AttachOwnerForm |
| Betaling | | `/bestil/[bookingId]/betaling` | StepHeader, Countdown, OrderSummary, PaymentForm, Radio, Button |
| Betalingsfejl (inline) | | `/bestil/[bookingId]/betaling` | PaymentForm |
| Betalingsfejl (side) | | `/bestil/[bookingId]/betaling/fejl` | Button |
| Billet – printes | | `/bestil/[bookingId]/billet` | TicketPrint |
| Billet – færdig | | `/bestil/[bookingId]/billet` | StepHeader, TicketPrint, OrderSummary |
| Log ind | | `/login` | — (bruger globale `.form`-styles) |
| Opret profil | | `/signup` | — (bruger globale `.form`-styles) |
| Profil | | `/profile` | UserBadge |
