// The stars in the finale on /film, copied from Figma: "Finale (motion)" (node 1883:12291).
// Figma's frame is 1440 × 1024 px. Finale.js turns the px values into % so the stars fill any screen.

export const FRAME_WIDTH = 1440;
export const FRAME_HEIGHT = 1024;

// Figma "Glimt": 14 small stars (4 px) that flash once per loop. top/left are % of the frame.
// blink is the animation from Figma ("a", "b" or "c" in Finale.module.css) – null means it stays dim (opacity 0.15).
export const GLIMT_STARS = [
  { top: 47.85, left: 12.87, blink: "a" },
  { top: 1.31, left: 50.79, blink: "b" },
  { top: 81.88, left: 54.18, blink: "c" },
  { top: 21.15, left: 43.47, blink: null },
  { top: 63.54, left: 6.69, blink: null },
  { top: 12.99, left: 43.57, blink: null },
  { top: 2.05, left: 83.28, blink: null },
  { top: 72, left: 91.28, blink: "a" },
  { top: 66.93, left: 88.99, blink: "b" },
  { top: 84.12, left: 68.2, blink: "c" },
  { top: 67.58, left: 27.52, blink: null },
  { top: 0.11, left: 46.59, blink: null },
  { top: 8.92, left: 12.22, blink: null },
  { top: 51.59, left: 5.85, blink: null },
];

// Figma "Stjerner – nær": 46 stars close to the viewer. x, y and size are px in the frame, opacity is from Figma.
// Ten of them twinkle: from start (a fraction of the 8 s loop) they dim to 0.1 and back, "dips" times.
export const NEAR_STARS = [
  { x: 1325.9, y: 296.18, size: 1.5, opacity: 0.505, twinkle: { start: 0.325, dips: 3 } },
  { x: 767.11, y: 337.22, size: 3.323, opacity: 0.776 },
  { x: 781.7, y: 700.94, size: 3.388, opacity: 0.718 },
  { x: 348.49, y: 383.21, size: 3.542, opacity: 0.754 },
  { x: 77.6, y: 700.32, size: 3.245, opacity: 0.634 },
  { x: 1162.67, y: 125.78, size: 3.806, opacity: 0.657, twinkle: { start: 0.3625, dips: 3 } },
  { x: 991.44, y: 659.2, size: 3.808, opacity: 0.689 },
  { x: 1308.0, y: 381.18, size: 3.78, opacity: 0.568 },
  { x: 478.44, y: 156.23, size: 3.593, opacity: 0.549 },
  { x: 424.62, y: 959.76, size: 2.571, opacity: 0.679 },
  { x: 1264.11, y: 60.03, size: 3.323, opacity: 0.537, twinkle: { start: 0.4, dips: 3 } },
  { x: 732.67, y: 431.56, size: 2.902, opacity: 0.496 },
  { x: 79.03, y: 374.23, size: 3.772, opacity: 0.572 },
  { x: 1331.06, y: 527.21, size: 3.161, opacity: 0.483 },
  { x: 408.38, y: 373.2, size: 2.514, opacity: 0.612 },
  { x: 765.59, y: 628.78, size: 2.331, opacity: 0.517, twinkle: { start: 0.4375, dips: 2 } },
  { x: 659.28, y: 883.72, size: 3.766, opacity: 0.718 },
  { x: 743.39, y: 517.07, size: 3.086, opacity: 0.744 },
  { x: 571.28, y: 725.23, size: 3.849, opacity: 0.526 },
  { x: 504.85, y: 338.53, size: 2.967, opacity: 0.596 },
  { x: 1263.68, y: 113.74, size: 3.487, opacity: 0.81, twinkle: { start: 0.475, dips: 2 } },
  { x: 585.8, y: 157.26, size: 1.694, opacity: 0.439 },
  { x: 316.81, y: 647.54, size: 3.991, opacity: 0.472 },
  { x: 853.8, y: 141.1, size: 2.643, opacity: 0.861 },
  { x: 1282.43, y: 906.47, size: 3.711, opacity: 0.854 },
  { x: 396.61, y: 10.74, size: 3.403, opacity: 0.524, twinkle: { start: 0.5125, dips: 2 } },
  { x: 2.28, y: 631.64, size: 1.69, opacity: 0.516 },
  { x: 704.68, y: 704.03, size: 3.353, opacity: 0.519 },
  { x: 338.63, y: 382.92, size: 3.705, opacity: 0.847 },
  { x: 704.54, y: 3.04, size: 1.796, opacity: 0.856 },
  { x: 1327.85, y: 21.5, size: 3.092, opacity: 0.85, twinkle: { start: 0.55, dips: 2 } },
  { x: 1394.98, y: 578.85, size: 1.97, opacity: 0.74 },
  { x: 320.8, y: 213.95, size: 2.166, opacity: 0.682 },
  { x: 1107.97, y: 717.52, size: 1.631, opacity: 0.757 },
  { x: 47.13, y: 112.95, size: 2.745, opacity: 0.86 },
  { x: 990.52, y: 914.46, size: 1.827, opacity: 0.419, twinkle: { start: 0.5875, dips: 2 } },
  { x: 1240.37, y: 1016.56, size: 3.708, opacity: 0.877 },
  { x: 604.23, y: 254.17, size: 3.412, opacity: 0.764 },
  { x: 573.55, y: 240.38, size: 3.706, opacity: 0.602 },
  { x: 804.64, y: 359.87, size: 3.717, opacity: 0.711 },
  { x: 482.43, y: 742.6, size: 3.337, opacity: 0.611, twinkle: { start: 0.625, dips: 1 } },
  { x: 448.87, y: 1009.13, size: 1.997, opacity: 0.897 },
  { x: 1255.96, y: 940.36, size: 3.081, opacity: 0.5 },
  { x: 194.96, y: 509.38, size: 3.113, opacity: 0.679 },
  { x: 1361.9, y: 493.64, size: 3.429, opacity: 0.494 },
  { x: 239.19, y: 678.51, size: 2.617, opacity: 0.661, twinkle: { start: 0.6625, dips: 1 } },
];
