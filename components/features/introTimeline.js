// The intro's timeline, copied from Figma: "Forside – intro (motion)" (node 1869:14851).
// Figma's timeline is 16.2 s long and loops; the intro only uses the first 7.2 s,
// where the Sunrise poster has grown into the "Kommer snart" card.
//
// Times are written as in Figma: a fraction of the 16.2 s (0.2716 = 4.4 s).
// Positions and sizes are in px inside Figma's 1440 × 1024 frame. IntroAnimation scales the frame to the screen.
// Each track: t = times, v = values, e = easing for each step between two times.

export const FIGMA_DURATION_S = 16.2;
export const INTRO_DURATION_S = 7.2;
export const FRAME_WIDTH = 1440;
export const FRAME_HEIGHT = 1024;

// Easings used in Figma
const POP = [0.5, 0, 0.5, 1]; // A poster appears
const AWAY = [0.4, 0, 0.8, 0.6]; // Posters fly out, the stars zoom
const SETTLE = [0.2, 0.4, 0.4, 1]; // The card grows into place

// Six-step tracks for the five posters in the middle, which fly out in two steps
const INNER_EASE = ["linear", POP, AWAY, AWAY, SETTLE, "linear"];
// Five-step tracks for the posters further out, which fly out in one step
const OUTER_EASE = ["linear", "easeOut", POP, AWAY, "linear"];
const MOVE_INNER_EASE = ["linear", AWAY, SETTLE, "linear"];
const MOVE_OUTER_EASE = ["linear", AWAY, "linear"];

// Figma "Rum": the starry sky zooms in and fades out while the card appears
export const SKY_TRACKS = {
  opacity: { t: [0, 0.3519, 0.4444, 1], v: [1, 1, 0, 0], e: ["linear", SETTLE, "linear"] },
  scale: { t: [0, 0.2716, 0.3519, 0.4444, 1], v: [1, 1, 1.5, 3, 3], e: ["linear", AWAY, SETTLE, "linear"] },
};

// Figma "Stjerner": the stars drift very slightly closer (3 % over 8 s – 2.7 % by 7.2 s)
export const STARS_TRACKS = {
  scale: { t: [0, INTRO_DURATION_S / FIGMA_DURATION_S], v: [1, 1.027], e: ["linear"] },
};

// Figma "Scroll-markør": shown while the posters gather
export const SCROLL_TRACKS = {
  opacity: { t: [0, 0.2037, 0.2407, 0.2716, 0.3117, 1], v: [0, 0, 1, 1, 0, 0], e: OUTER_EASE },
};

// Figma "Side" + "Kort 1": the real card on the page grows from the size of the Sunrise poster
export const CARD_TRACKS = {
  opacity: { t: [0, 0.3519, 0.4444, 1], v: [0, 0, 1, 1], e: ["linear", SETTLE, "linear"] },
  scale: { t: [0, 0.3519, 0.4444, 1], v: [0.109649, 0.109649, 1, 1], e: ["linear", SETTLE, "linear"] },
};

// Figma "Plakater": 11 posters that appear one by one and then fly out towards the edges.
// The first one (Sunrise) flies straight at you and becomes the card.
export const POSTERS = [
  {
    name: "Sunrise on the Reaping",
    image: "/intro/plakater/sunrise.jpg",
    // Figma crops this image to its lower part (the poster art "hg" is wider and taller than the poster)
    imageCrop: { left: "-63.05%", top: "-50.74%", width: "226.1%", height: "150.74%" },
    box: [700.65, 537.81, 38.706, 48.383],
    tracks: {
      opacity: { t: [0, 0.2438, 0.2716, 0.3017, 0.3519, 0.4444, 1], v: [0, 0, 0.52143, 0.52143, 0.66579, 0, 0], e: INNER_EASE },
      scale: { t: [0, 0.2438, 0.2716, 0.3151, 0.3519, 0.4444, 1], v: [0.6, 0.6, 1, 1, 1.842105, 30.916666, 30.916666], e: INNER_EASE },
      x: { t: [0, 0.3519, 0.4444, 1], v: [0, 0, 0.5, 0.5], e: ["linear", SETTLE, "linear"] },
    },
  },
  {
    name: "You Can See Everything",
    image: "/intro/plakater/you-can-see-everything.jpg",
    box: [622.43, 522.66, 39.344, 49.18],
    tracks: {
      opacity: { t: [0, 0.2364, 0.2716, 0.2937, 0.3519, 0.4444, 1], v: [0, 0, 0.54672, 0.54672, 0.76379, 0, 0], e: INNER_EASE },
      scale: { t: [0, 0.2364, 0.2716, 0.307, 0.3519, 0.4444, 1], v: [0.6, 0.6, 1, 1, 2.103448, 18.300001, 18.300001], e: INNER_EASE },
      x: { t: [0, 0.2716, 0.3519, 0.4444, 1], v: [0, 0, -85.96, -2203.058, -2203.058], e: MOVE_INNER_EASE },
      y: { t: [0, 0.2716, 0.3519, 0.4444, 1], v: [0, 0, 38.899, 996.94, 996.94], e: MOVE_INNER_EASE },
    },
  },
  {
    name: "Dune: Del 3",
    image: "/intro/plakater/dune.jpg",
    box: [783.19, 445.46, 40.351, 50.439],
    tracks: {
      opacity: { t: [0, 0.229, 0.2716, 0.2857, 0.3519, 0.4444, 1], v: [0, 0, 0.56053, 0.56053, 0.83, 0, 0], e: INNER_EASE },
      scale: { t: [0, 0.229, 0.2716, 0.299, 0.3519, 0.4444, 1], v: [0.6, 0.6, 1, 1, 2.28, 17.1, 17.1], e: INNER_EASE },
      x: { t: [0, 0.2716, 0.3519, 0.4444, 1], v: [0, 0, 106.712, 2197.592, 2197.592], e: MOVE_INNER_EASE },
      y: { t: [0, 0.2716, 0.3519, 0.4444, 1], v: [0, 0, -52.889, -1089.177, -1089.177], e: MOVE_INNER_EASE },
    },
  },
  {
    name: "Angry Birds Filmen",
    image: "/intro/plakater/angry-birds.jpg",
    box: [638.88, 425.71, 40.385, 50.481],
    tracks: {
      opacity: { t: [0, 0.2216, 0.2716, 0.2777, 0.3519, 0.4444, 1], v: [0, 0, 0.58077, 0.58077, 0.95, 0, 0], e: INNER_EASE },
      scale: { t: [0, 0.2216, 0.2716, 0.291, 0.3519, 0.4444, 1], v: [0.6, 0.6, 1, 1, 2.6, 15.599999, 15.599999], e: INNER_EASE },
      x: { t: [0, 0.2716, 0.3519, 0.4444, 1], v: [0, 0, -97.477, -1459.717, -1459.717], e: MOVE_INNER_EASE },
      y: { t: [0, 0.2716, 0.3519, 0.4444, 1], v: [0, 0, -97.674, -1462.666, -1462.666], e: MOVE_INNER_EASE },
    },
  },
  {
    name: "Jumanji: Open World",
    image: "/intro/plakater/jumanji.jpg",
    box: [766.13, 552.94, 42.553, 53.191],
    tracks: {
      opacity: {
        t: [0, 0.2142, 0.2698, 0.2716, 0.3519, 0.4444, 1],
        v: [0, 0, 0.60532, 0.60532, 1, 0, 0],
        e: ["linear", "easeOut", POP, AWAY, SETTLE, "linear"],
      },
      scale: { t: [0, 0.2142, 0.2716, 0.283, 0.3519, 0.4444, 1], v: [0.6, 0.6, 1, 1, 3.133333, 14.099999, 14.099999], e: INNER_EASE },
      x: { t: [0, 0.2716, 0.3519, 0.4444, 1], v: [0, 0, 143.796, 1453.236, 1453.236], e: MOVE_INNER_EASE },
      y: { t: [0, 0.2716, 0.3519, 0.4444, 1], v: [0, 0, 144.086, 1456.172, 1456.172], e: MOVE_INNER_EASE },
    },
  },
  {
    name: "Paper Tiger",
    image: "/intro/plakater/paper-tiger.jpg",
    box: [557.71, 483.6, 57.143, 71.429],
    tracks: {
      opacity: { t: [0, 0.2068, 0.2623, 0.2716, 0.3519, 1], v: [0, 0, 0.63571, 0.63571, 0, 0], e: OUTER_EASE },
      scale: { t: [0, 0.2068, 0.2716, 0.2749, 0.3519, 1], v: [0.6, 0.6, 1, 1, 12.6, 12.6], e: ["linear", POP, AWAY, AWAY, "linear"] },
      x: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, -2561.966, -2561.966], e: MOVE_OUTER_EASE },
      y: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, 140.142, 140.142], e: MOVE_OUTER_EASE },
    },
  },
  {
    name: "Hexe",
    image: "/intro/plakater/hexe.jpg",
    box: [834.27, 463.77, 59.459, 74.324],
    tracks: {
      opacity: { t: [0, 0.1994, 0.2549, 0.2716, 0.3519, 1], v: [0, 0, 0.67432, 0.67432, 0, 0], e: OUTER_EASE },
      scale: { t: [0, 0.1994, 0.2673, 0.2716, 0.3519, 1], v: [0.6, 0.6, 1, 1, 11.099999, 11.099999], e: OUTER_EASE },
      x: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, 2413.44, 2413.44], e: MOVE_OUTER_EASE },
      y: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, -185.538, -185.538], e: MOVE_OUTER_EASE },
    },
  },
  {
    name: "You Can See Everything",
    image: "/intro/plakater/you-can-see-everything.jpg",
    box: [541.44, 543.17, 78.125, 97.656],
    tracks: {
      opacity: { t: [0, 0.192, 0.2475, 0.2716, 0.3519, 1], v: [0, 0, 0.725, 0.725, 0, 0], e: OUTER_EASE },
      scale: { t: [0, 0.192, 0.2599, 0.2716, 0.3519, 1], v: [0.6, 0.6, 1, 1, 9.6, 9.6], e: OUTER_EASE },
      x: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, -2003.22, -2003.22], e: MOVE_OUTER_EASE },
      y: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, 1148.8, 1148.8], e: MOVE_OUTER_EASE },
    },
  },
  {
    name: "Faderhuset",
    image: "/intro/plakater/faderhuset.jpg",
    box: [842.96, 363.3, 74.074, 92.593],
    tracks: {
      opacity: { t: [0, 0.1846, 0.2401, 0.2716, 0.3519, 1], v: [0, 0, 0.79444, 0.79444, 0, 0], e: OUTER_EASE },
      scale: { t: [0, 0.1846, 0.2525, 0.2716, 0.3519, 1], v: [0.6, 0.6, 1, 1, 8.1, 8.1], e: OUTER_EASE },
      x: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, 1913.6, 1913.6], e: MOVE_OUTER_EASE },
      y: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, -1224.704, -1224.704], e: MOVE_OUTER_EASE },
    },
  },
  {
    name: "Markens grøde",
    image: "/intro/plakater/markens-groede.jpg",
    box: [888.27, 554.74, 95.455, 119.318],
    tracks: {
      opacity: { t: [0, 0.1772, 0.2327, 0.2716, 0.3519, 1], v: [0, 0, 0.89545, 0.89545, 0, 0], e: OUTER_EASE },
      scale: { t: [0, 0.1772, 0.2451, 0.2716, 0.3519, 1], v: [0.6, 0.6, 1, 1, 6.6, 6.6], e: OUTER_EASE },
      x: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, 2064.96, 2064.96], e: MOVE_OUTER_EASE },
      y: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, 978.944, 978.944], e: MOVE_OUTER_EASE },
    },
  },
  {
    name: "Dune: Del 3",
    image: "/intro/plakater/dune.jpg",
    box: [358.47, 299.62, 147.059, 183.824],
    tracks: {
      opacity: { t: [0, 0.1698, 0.2253, 0.2716, 0.3519, 1], v: [0, 0, 1, 1, 0, 0], e: OUTER_EASE },
      scale: { t: [0, 0.1698, 0.2377, 0.2716, 0.3519, 1], v: [0.6, 0.6, 1, 1, 5.1, 5.1], e: OUTER_EASE },
      x: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, -2062.08, -2062.08], e: MOVE_OUTER_EASE },
      y: { t: [0, 0.2716, 0.3519, 1], v: [0, 0, -862.569, -862.569], e: MOVE_OUTER_EASE },
    },
  },
];

// Figma "Stjerner": [x, y, size] for each star (all white)
export const STARS = [
  [1325.9, 296.2, 1.6], [767.1, 337.2, 3.6], [781.7, 700.9, 3.8], [348.5, 383.2, 4.4], [77.6, 700.3, 3.4],
  [1162.7, 125.8, 5.7], [991.4, 659.2, 5.7], [1308, 381.2, 5.5], [478.4, 156.2, 4.7], [424.6, 959.8, 2],
  [1264.1, 60, 3.6], [732.7, 431.6, 2.5], [79, 374.2, 5.5], [1331.1, 527.2, 3.1], [408.4, 373.2, 1.9],
  [765.6, 628.8, 1.8], [659.3, 883.7, 5.5], [743.4, 517.1, 2.9], [571.3, 725.2, 5.9], [504.8, 338.5, 2.7],
  [1263.7, 113.7, 4.2], [585.8, 157.3, 1.6], [316.8, 647.5, 6.7], [853.8, 141.1, 2.1], [1282.4, 906.5, 5.2],
  [396.6, 10.7, 3.9], [2.3, 631.6, 1.6], [704.7, 704, 3.7], [338.6, 382.9, 5.2], [704.5, 3, 1.6],
  [1327.8, 21.5, 2.9], [1395, 578.8, 1.6], [320.8, 213.9, 1.7], [1108, 717.5, 1.6], [47.1, 113, 2.2],
  [990.5, 914.5, 1.6], [1240.4, 1016.6, 5.2], [604.2, 254.2, 3.9], [573.6, 240.4, 5.2], [804.6, 359.9, 5.2],
  [482.4, 742.6, 3.7], [448.9, 1009.1, 1.6], [1256, 940.4, 2.9], [195, 509.4, 3], [1361.9, 493.6, 4],
  [239.2, 678.5, 2.1], [729.7, 775.3, 2.5], [37.5, 306, 3.8], [1041, 297.9, 1.6], [618, 77.1, 3.1],
  [1318.2, 931.9, 4.5], [36.3, 780.3, 6.2], [1293.4, 37.9, 3.6], [155.9, 86.9, 1.6], [1361.9, 196.6, 2.8],
  [971.9, 249.1, 1.6], [608.5, 689.9, 6.7], [599.7, 62.6, 1.9], [1403.1, 156.1, 4.3], [175.9, 215.2, 2.3],
  [112.4, 279.3, 1.6], [692.1, 1017.7, 2.5], [452.8, 4.3, 2], [131.5, 239.9, 2], [1100.1, 447.3, 4],
  [1153.4, 677.7, 6.2], [586.1, 508.9, 1.8], [1039.3, 681.1, 2.6], [1273.7, 865.5, 3.6], [701.4, 980.2, 2],
  [114.1, 351, 1.8], [1062.8, 978.1, 3.4], [343, 817.6, 1.6], [1152.3, 650.4, 5.6], [638, 893, 2.4],
  [389.6, 703.1, 5.1], [270, 603.2, 1.9], [1183.8, 346.1, 5.4], [166.9, 315, 5.1], [189.8, 406.8, 1.6],
  [1292.9, 177.1, 3.3], [1007.8, 179.4, 6], [22.9, 831.4, 2.9], [184.4, 339.2, 3.8], [788.9, 602.3, 6.1],
  [1056.5, 611.9, 3.4], [883.1, 230.3, 1.6], [321.2, 634.9, 1.7], [344.8, 927.3, 4.4], [585.7, 811, 3.3],
  [150.7, 941.5, 4.3], [611.9, 887.1, 4.5], [1307.3, 878.8, 3.6], [222.6, 128.2, 3.5], [81.3, 78.8, 6.1],
  [1252.4, 979.5, 5.9], [42.9, 481.1, 1.6], [465.3, 492.5, 1.6], [63.9, 95.8, 1.6], [1163.7, 745.6, 2.1],
  [558.8, 628.1, 3.4], [1385.3, 728.6, 4], [246.5, 67, 4.3], [620.9, 557.9, 3], [175.6, 67.9, 2.2],
  [496.3, 204.9, 1.8], [75.1, 1.6, 1.6], [64, 786.6, 5], [1307.8, 815.9, 1.9], [295.9, 658.3, 6.7],
  [248.7, 773.5, 1.6], [1234.9, 833, 1.7], [430.4, 259.4, 2.1], [976.6, 510.4, 5], [1170.9, 778.9, 4.5],
  [411, 729.2, 3.3], [234.7, 865.6, 5], [672.4, 814.8, 4.4], [333.8, 200.2, 1.6], [1169.1, 642.2, 2.6],
  [1171.3, 212.4, 5], [555.9, 551.1, 2.1], [552.7, 511.7, 2.3], [1111.2, 304.5, 3.4], [794.4, 960.7, 2.8],
  [864.4, 587.4, 1.8], [232.5, 213.7, 2.6], [912.9, 895.6, 1.8], [500.1, 407.7, 1.9], [76.5, 487.5, 1.6],
  [913.3, 413.3, 1.6], [1210, 280.8, 1.6], [292.2, 447.9, 1.6], [832.4, 772.1, 2.8], [1248.4, 700.8, 2.2],
  [1060.3, 912.4, 2.9], [418.5, 1018.7, 6.3], [443.1, 876.7, 1.6], [787.2, 245, 3.6], [267.1, 831.3, 4],
  [1369.5, 314, 2.6], [741.2, 628.9, 3.7], [65.5, 723.2, 3.2], [978.8, 580.6, 4.7], [817.2, 449.9, 2.9],
  [940.1, 999.8, 4.9], [1351.1, 584.7, 3.7], [348.5, 457.3, 1.6], [817.4, 799.6, 1.6], [440.7, 629.3, 1.6],
  [417.5, 75, 1.8], [914.6, 516.1, 2], [897, 919.4, 2], [1198.7, 1004.5, 2.1], [904.7, 53.9, 1.9],
  [1210.6, 114.3, 1.6], [318.9, 278.7, 3.1], [442.2, 639.5, 3.9], [1188.1, 933.1, 1.6], [104.5, 185.6, 6.1],
  [686.4, 283.2, 6.5], [1019.3, 809.7, 4.6], [888.1, 767.3, 1.6], [583.6, 788.6, 1.7], [225.8, 952.7, 2.9],
  [1039.2, 164.1, 2.8], [495.2, 713.7, 1.6], [1418.4, 458.6, 2.1], [147, 175.3, 3.1], [484.4, 1019.8, 4.7],
];

// Figma "Glimt": 14 faint stars, [x, y, size, opacity]. In Figma they twinkle during the countdown,
// which covers them, so they are shown with the brightness they end on.
export const TWINKLES = [
  [185.3, 490, 4, 0.15], [731.4, 13.4, 4, 0.75], [780.2, 838.4, 4, 0.26], [625.9, 216.5, 4, 0.15],
  [96.3, 650.6, 4, 0.15], [627.4, 133.1, 4, 0.15], [1199.2, 21, 4, 0.15], [1314.4, 737.3, 4, 0.15],
  [1281.5, 685.4, 4, 0.75], [982.1, 861.3, 4, 0.26], [396.2, 692, 4, 0.15], [670.9, 1.1, 4, 0.15],
  [176, 91.3, 4, 0.15], [84.3, 528.3, 4, 0.15],
];

// Figma "Scroll-markør": top-left corner in the frame
export const SCROLL_POSITION = [675, 876];

const EASINGS = { linear: "linear", easeOut: "ease-out", easeIn: "ease-in", easeInOut: "ease-in-out" };

function toCssEasing(easing) {
  return Array.isArray(easing) ? `cubic-bezier(${easing.join(", ")})` : EASINGS[easing];
}

// How each property is written in CSS. x and y both use "translate", so they are combined into one track.
const FORMAT = {
  opacity: (value) => String(value),
  scale: (value) => String(value),
};

// Turns one Figma track into Web Animations keyframes for the 7.2 s intro.
// Times after 7.2 s are clamped to the end – the values are held there anyway.
function toKeyframes(prop, track) {
  return track.t.map((time, index) => ({
    offset: Math.min((time * FIGMA_DURATION_S) / INTRO_DURATION_S, 1),
    [prop]: FORMAT[prop](track.v[index]),
    easing: toCssEasing(track.e[index] ?? "linear"),
  }));
}

// x and y share times in Figma, so they become one "translate" track
function toTranslateKeyframes(x, y) {
  const track = x ?? y;
  return track.t.map((time, index) => ({
    offset: Math.min((time * FIGMA_DURATION_S) / INTRO_DURATION_S, 1),
    translate: `${x ? x.v[index] : 0}px ${y ? y.v[index] : 0}px`,
    easing: toCssEasing(track.e[index] ?? "linear"),
  }));
}

/**
 * Starts all of an element's tracks. Returns the animations so they can be stopped.
 * @param {Element} element
 * @param {Record<string, {t: number[], v: number[], e: unknown[]}>} tracks
 */
export function playTracks(element, tracks) {
  const options = { duration: INTRO_DURATION_S * 1000, fill: "both" };
  const animations = [];

  for (const prop of ["opacity", "scale"]) {
    if (tracks[prop]) {
      animations.push(element.animate(toKeyframes(prop, tracks[prop]), options));
    }
  }
  if (tracks.x || tracks.y) {
    animations.push(element.animate(toTranslateKeyframes(tracks.x, tracks.y), options));
  }

  return animations;
}
