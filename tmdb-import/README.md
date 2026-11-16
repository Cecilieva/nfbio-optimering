# TMDB → Supabase import (NF bio)

Henter film, der går i danske biografer nu (og kommende film), fra TMDB og gemmer dem i `movies`-tabellen med dansk titel, beskrivelse, plakat, baggrundsbillede, trailer, instruktør, medvirkende, genrer, dansk censur og spilletid. Opretter også testspilletider for de nye film.

## Sådan kører du det

1. Læg mappen et sted **uden for** jeres React-projekt (eller tilføj `.env` til `.gitignore`).
2. `npm install`
3. Kopiér `.env.example` til `.env` og indsæt:
   - **TMDB_READ_ACCESS_TOKEN**: den lange token fra TMDB (API-key behøves ikke)
   - **SUPABASE_SERVICE_ROLE_KEY**: Supabase → Project Settings → API Keys → `service_role` / secret key
4. `npm run import`

Scriptet kan køres igen. Film opdateres i stedet for at blive dubleret.

## Husk krediteringen

TMDB kræver, at I viser deres logo og denne tekst, fx i footeren eller på en "Om"-side:

> This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.

Logoer: https://www.themoviedb.org/about/logos-attribution

## Vigtigt om nøgler

`service_role`-nøglen omgår al sikkerhed (RLS) i databasen. Den må kun ligge i `.env` til dette script og aldrig i React-appen. Appen skal bruge `anon`/publishable-nøglen.
