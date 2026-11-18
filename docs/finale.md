# Finale

Det sidste på forsiden (`/film`), lige over footeren: Nordisk Films slogan **"We bring stories to life"** i et stjernerum. Animationen afslutter forsiden og er tænkt som en følelsesmæssig (pathos) afslutning.

**Figma:** "Finale (motion)" (node `1883:12291`). Tider og easings er hentet fra Figmas tidslinje med `get_motion_context`.

## Filer

| Fil | Indhold |
|---|---|
| `components/features/Finale.js` | Komponenten: lagene og hvornår animationen starter |
| `components/features/Finale.module.css` | Alle animationer (`@keyframes`) |
| `components/features/finaleStars.js` | Placering, størrelse og lysstyrke for stjernerne – kopieret fra Figma |
| `public/finale/stjerner.svg` | Stjernefeltet fra Figma ("Stjerner") |
| `app/tokens.css` | Farver, tider, afstande og skriftstørrelse (søg efter "finale") |

## Lagene

Nederst først – ligesom lagene i Figma:

1. **"Finale-rum":** baggrunden (lysere i midten, mørkere ud mod kanterne) og stjernefeltet. Når man når ned til finalen, toner rummet frem på 1,2 s og zoomer fra 135 % på plads på 2,4 s. Stjernefeltet vokser langsomt 3 % i løbet af 8 s og starter forfra.
2. **"Glimt":** 14 små stjerner. Nogle af dem blinker én gang pr. løkke på 8 s (animationerne `glimtA`, `glimtB` og `glimtC`), resten lyser svagt.
3. **"Stjerner – nær":** 46 stjerner tæt på. Laget svæver i en lille cirkel og zoomer lidt ind og ud. Ti af stjernerne glimter, de dæmpes til 10 % og tilbage en til tre gange.
4. **Sloganet:** tre linjer, der glider 48px op, toner frem og går fra sløret til skarp – én ad gangen med 332 ms imellem.

## Hvornår den kører

- **Først når man når ned til den:** animationerne står på pause, indtil en fjerdedel af finalen kan ses (`IntersectionObserver`). Så ser man starten og ikke et rum, der allerede er færdigt.
- **Indgangen sker én gang:** rummet og sloganet animeres ind én gang. Stjernerne svæver og glimter derefter i en løkke på 8 s.
- **Mindre bevægelse:** har man slået animationer fra i styresystemet (`prefers-reduced-motion`), står det hele stille, og sloganet vises med det samme.

> I Figma kører hele tidslinjen i løkke, også rummets indgang. På en hjemmeside ville rummet så blinke og zoome hvert 8. sekund, så indgangen kører kun én gang her.

## Størrelser

- Finalen fylder hele bredden og er 1024px høj som Figmas ramme, men aldrig højere end skærmen (`--size-finale-height`). På mobil er den lavere (`--size-finale-height-compact`).
- Sloganet er 168px i Figmas 1440px-ramme og bliver mindre på små skærme (`--font-size-finale`).
- Stjernernes placering regnes om fra px i Figmas ramme til %, så de fylder enhver skærm.

## Hvis du vil ændre noget

| Jeg vil … | Ret her |
|---|---|
| ændre sloganet | `SLOGAN_LINES` i `components/features/Finale.js` |
| ændre tider og easing | `--duration-finale-*`, `--delay-finale-line` og `--easing-finale-line` i `app/tokens.css` |
| ændre farverne | `--color-finale-*` i `app/tokens.css` |
| flytte stjernerne | `components/features/finaleStars.js` |
