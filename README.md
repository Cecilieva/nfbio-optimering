# Nordisk Film Biograf – redesign (DUI-eksamensprojekt)

Et redesign af billetkøbet hos Nordisk Film Biografer, lavet som eksamensprojekt i Dynamic User Interface. Bygget med Next.js (App Router) og Supabase.

**Købsflowet:** Vælg by → forside → film og spilletider → sædevalg → reservation ("Vi popper dine pladser") → log ind / fortsæt som gæst → betaling → billet.

## Kom i gang

1. `npm install`
2. Kopiér `.env.example` til `.env.local` og indsæt Supabase-URL og publishable key (Supabase → **Connect**).
3. `npm run dev` og åbn http://localhost:3000

Databasen er allerede sat op. Skemaet (tabeller, RPC-funktioner, RLS og testdata) står i [`supabase/supabase_schema.sql`](supabase/supabase_schema.sql) til dokumentation. Kør det kun mod et nyt, tomt Supabase-projekt.

## Struktur

| Mappe | Indhold |
|---|---|
| `app/` | Sider – én route pr. skærm i flowet |
| `components/ui/` | Generiske byggeklodser (knapper, felter, modal, overlay) |
| `components/features/` | Domænekomponenter (MovieCard, SeatMap, OrderSummary …) |
| `lib/data/` | Læsning fra Supabase |
| `lib/actions/` | Server actions (reservation, gæst/login, betaling) |
| `app/tokens.css` | Design tokens fra Figma |
| `tmdb-import/` | Script der henter film fra TMDB ind i databasen (se dens README) |

Projektregler for udvikling (også for AI-assistenter) står i [`AGENTS.md`](AGENTS.md).

## Data og kreditering

Filmdata og billeder kommer fra [TMDB](https://www.themoviedb.org/).
This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.

Projektet er et ikke-kommercielt skoleprojekt og er ikke tilknyttet Nordisk Film.