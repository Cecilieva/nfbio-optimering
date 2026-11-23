// Forestillingernes kendetegn (showtimes.tags), fx "Babybio" eller "Dansk undertekst".
//
// På tids-knappen står sprog, særforestilling og "Uden undertekster" som tekst i linjen (som på nfbio.dk),
// fx "Bio 7 · 2D · Eng. tale · Babybio". Særforestillingen forklares i "Din forestilling".
// Danske undertekster gælder de fleste forestillinger, så de står kun i "Din forestilling".

export const SPECIAL_SHOWTIMES = [
  {
    tag: "Babybio",
    text: "Forestilling for forældre med babyer. Lyset er dæmpet, lyden er skruet ned, og der er plads til barnevogne.",
  },
  {
    tag: "Hjernevenlig Bio",
    text: "En roligere forestilling med lavere lyd, lidt lys i salen og ingen reklamer – fx for dig med en hjerneskade.",
  },
  {
    tag: "Filmklub",
    text: "Filmklubbens forestilling, ofte med en kort introduktion til filmen før start.",
  },
  {
    tag: "Liveshow",
    text: "En særlig visning, hvor der også er optræden eller en direkte transmission i salen.",
  },
  {
    tag: "Fangalla",
    text: "Fejr filmen sammen med andre fans – ofte med udklædning, quiz eller gaver før filmen.",
  },
  {
    tag: "Fan forpremiere",
    text: "Se filmen før premieren sammen med andre fans.",
  },
];

// Undertekster – står i teksten i "Din forestilling"
const SUBTITLE_TAGS = ["Dansk undertekst", "Ingen undertekster"];

// Forestillingens særforestilling (den første, hvis der er flere) – eller null
export function getSpecialShowtime(tags = []) {
  return SPECIAL_SHOWTIMES.find((special) => tags.includes(special.tag)) ?? null;
}

// Forestillingens undertekster, fx ["Dansk undertekst"]
export function getSubtitleTags(tags = []) {
  return SUBTITLE_TAGS.filter((tag) => tags.includes(tag));
}

// Sproget kort til tids-knappen: "Engelsk tale" bliver til "Eng. tale" (som på nfbio.dk)
export function shortLanguage(language) {
  return language ? language.replace(/^Engelsk /, "Eng. ") : null;
}

// Det, der står efter sal og format på tids-knappen: særforestillingen og "Uden undertekster"
export function getShowtimeLabels(tags = []) {
  const labels = [];
  const special = getSpecialShowtime(tags);
  if (special) {
    labels.push(special.tag);
  }
  if (tags.includes("Ingen undertekster")) {
    labels.push("Uden undertekster");
  }
  return labels;
}
