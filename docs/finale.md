# Finale

Det sidste på forsiden (`/film`), lige over footeren: Nordisk Films slogan **"We bring stories to life"** i et stjernerum. Animationen afslutter forsiden og er tænkt som en følelsesmæssig (pathos) afslutning. Den bruger samme rum og stjerner som hero'en øverst på siden, så forsiden begynder og slutter samme sted.

**Figma:** "Finale (motion)" (node `1883:12291`). Rummet er komponenten "Stjernehimmel".

## Filer

| Fil | Indhold |
|---|---|
| `components/features/homepage-animations/Finale.js` | Komponenten og scroll-animationen (GSAP ScrollTrigger). Tallene til animationen står som konstanter øverst i filen |
| `components/features/homepage-animations/Finale.module.css` | Rummet og sloganet |
| `components/features/homepage-animations/Starfield.js` | Stjernerne – samme komponent som i hero'en |
| `app/tokens.css` | Rummets gradient (`--gradient-space`), højde, afstande og skriftstørrelse (søg efter "finale") |

## Lagene

Nederst først:

1. **Rummet ("Stjernehimmel"):** en radial gradient – mørkest i midten (bg/Sekundær Baggrund) og Stjerner/bg/Primær baggrund ud mod kanterne. Samme token som hero'en (`--gradient-space`).
2. **Stjernerne:** `<Starfield />` – stjerner, der flyver roligt imod brugeren og bliver til lysstriber, når man scroller hurtigt.
3. **Sloganet:** tre linjer, hvor hvert bogstav er sit eget element, så det kan lyses op for sig.

## Sådan virker den

Animationen følger scrollen (`scrub`), så den kører baglæns, når man scroller op igen.

1. **Bogstaverne lyses op ét ad gangen.** De starter svagt (12 %) og begynder at lyse, når første linje er kommet 20 % ind på skærmen. Alle er tændt, når finalen fylder skærmen.
2. **Finalen står fast (pin).** Når den fylder skærmen, står den stille i 55 % af en skærmhøjdes scroll. Imens glider sloganet de sidste 60px op på plads – helt tændt, så man kan nå at læse det, før man scroller videre til footeren.

- **Når siden ændrer højde:** folder "Kommende film" sig ud, eller trykker man "Se flere film", flytter finalen sig. Finalen holder selv øje med sidens højde og beder ScrollTrigger måle igen – ellers ville den blive sat fast det forkerte sted.
- **Mindre bevægelse:** har man slået animationer fra i styresystemet (`prefers-reduced-motion`), står sloganet bare der i fuldt lys, og stjernerne står stille.
- **Skærmlæsere** læser hele sloganet fra `aria-label` (på engelsk, `lang="en"`) og ikke ét bogstav ad gangen.

## Hvis du vil ændre noget

| Jeg vil … | Ret her |
|---|---|
| ændre sloganet | `SLOGAN_LINES` i `Finale.js` |
| ændre, hvor langt sloganet glider op | `SLOGAN_LIFT` i `Finale.js` |
| ændre, hvor længe finalen står fast | `PIN_LENGTH` i `Finale.js` |
| ændre, hvor svage bogstaverne starter | `LETTER_START_OPACITY` i `Finale.js` |
| ændre, hvornår bogstaverne lyser op | `start` og `end` i bogstavernes `scrollTrigger` i `Finale.js` |
| ændre rummets farver | `--gradient-space` i `app/tokens.css` (gælder også hero'en) |
| ændre stjernerne | `Starfield.js` (gælder også hero'en) |
| ændre skriftstørrelsen | `--font-size-finale`, `--line-height-finale` og `--letter-spacing-finale` i `app/tokens.css` |

**Tip:** tilføj midlertidigt `markers: true` i en `scrollTrigger` for at se, præcis hvor animationen starter og slutter på siden.
