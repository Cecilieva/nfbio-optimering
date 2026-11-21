"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import LoadingDots from "@/components/ui/LoadingDots";
import Overlay from "@/components/ui/Overlay";
import PopcornLoader, { preloadPopcorn } from "@/components/ui/PopcornLoader";
import styles from "./LoadingState.module.css";

// Sådan virker loaderen:
//   - LoadingState (og FormLoader/LinkLoader) siger bare "jeg henter noget nu". De tegner ikke selv noget.
//   - LoadingHost (i layoutet) tegner loaderen. Det er det eneste sted, den vises.
//   - Loaderen kommer først frem efter 1 sekund - er siden klar inden, ser man den slet ikke.
//     Med "always" kommer den med det samme (på vej ind på en filmside og ved betaling).
//   - Når loaderen først er synlig, står den mindst 3 sekunder, så den ikke bare blinker.

const SHOW_DELAY_MS = 1000; // så længe venter loaderen, før den kommer frem
const MIN_VISIBLE_MS = 3000; // så længe står den mindst, når den først er synlig

// ---------- Fælles tilstand (deles af alle loadere på siden) ----------

let requests = []; // dem, der henter noget lige nu: { title, text, always }
let firstRequestAt = 0; // hvornår den første af dem begyndte
let shown = null; // den loader, der vises lige nu ({ title, text, shownAt }), eller null
let timer = null;
const listeners = new Set();

// Bestemmer, om loaderen skal vises, og sætter en timer til næste gang, der skal tjekkes
function update() {
  clearTimeout(timer);
  const now = Date.now();
  const newest = requests.at(-1);

  if (newest) {
    // Noget hentes. Vises loaderen allerede, skifter vi bare teksten (fx til "Reserverer pladser")
    if (shown) {
      shown = { ...shown, title: newest.title, text: newest.text };
    } else {
      // Ellers venter vi 1 sekund (eller slet ikke, hvis en af dem er "always")
      const wait = requests.some((request) => request.always) ? 0 : SHOW_DELAY_MS - (now - firstRequestAt);
      if (wait <= 0) {
        shown = { title: newest.title, text: newest.text, shownAt: now };
      } else {
        timer = setTimeout(update, wait);
      }
    }
  } else if (shown) {
    // Intet hentes mere. Har loaderen stået i 3 sekunder, forsvinder den - ellers venter vi resten af tiden
    const timeLeft = MIN_VISIBLE_MS - (now - shown.shownAt);
    if (timeLeft <= 0) {
      shown = null;
    } else {
      timer = setTimeout(update, timeLeft);
    }
  }

  listeners.forEach((listener) => listener());
}

function addRequest(request) {
  if (requests.length === 0) {
    firstRequestAt = Date.now();
  }
  requests = [...requests, request];
  update();
}

function removeRequest(request) {
  requests = requests.filter((item) => item !== request);
  update();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ---------- Komponenterne ----------

// Siger "jeg henter noget", så længe den er på siden. Bruges af FormLoader og LinkLoader.
//
//   title  - overskriften (standard: "Indlæser"). Prikkerne kommer frem én ad gangen efter den
//   text   - en tekst under overskriften, fx hvilke pladser der reserveres (valgfri)
//   always - true: vises med det samme, også på et hurtigt net
export default function LoadingState({ title = "Indlæser", text, always = false }) {
  useEffect(() => {
    const request = { title, text, always };
    addRequest(request);
    return () => removeRequest(request);
  }, [title, text, always]);

  return null;
}

// Lægges i hver route-gruppes layout (som bliver på skærmen, når siden skifter).
// Henter popkorn-billederne på forhånd og tegner loaderen, når den skal vises
export function LoadingHost() {
  useEffect(() => {
    preloadPopcorn();
  }, []);
  const loader = useSyncExternalStore(subscribe, () => shown, () => null);

  // key: en ny loader (nyt tidspunkt) starter forfra og toner frem
  return loader ? <Loader key={loader.shownAt} {...loader} /> : null;
}

// Selve loaderen: popkorn, der hopper op af bægeret, og en overskrift med prikker over hele skærmen
function Loader({ title, text, shownAt }) {
  // Er loaderen lige kommet frem, toner den frem. Har den allerede stået et stykke tid
  // (fx når man skifter til et andet layout midt i den), dukker den bare op uden at blinke
  const [fadeIn] = useState(() => Date.now() - shownAt < 200);

  return (
    // styles.loader: altid de samme farver, uanset om siden er i thriller eller familie
    <div className={styles.loader}>
      <Overlay
        fadeIn={fadeIn}
        title={
          <>
            {title}
            <LoadingDots />
          </>
        }
        illustration={<PopcornLoader />}
      >
        {text && <p>{text}</p>}
      </Overlay>
    </div>
  );
}
