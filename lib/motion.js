// Animationer til eller fra for hele sitet.
//
// Sådan virker det: MOTION_SCRIPT giver <html> data-motion="reduce" (animationer fra) eller
// "full" (til) ud fra styresystemets "Reducer bevægelse" - før siden bliver tegnet,
// så animationerne ikke når at starte.
// Al CSS og JavaScript ser kun på data-motion. Så er der ét sted at ændre det,
// hvis brugeren en dag skal kunne vælge selv.

// Lægges i <head> i app/layout.js. Kører, før siden tegnes - og igen, hvis indstillingen ændres.
export const MOTION_SCRIPT = `(function () {
  var html = document.documentElement;
  var query = window.matchMedia("(prefers-reduced-motion: reduce)");
  function update() { html.dataset.motion = query.matches ? "reduce" : "full"; }
  update();
  query.addEventListener("change", update);
})();`;

// true, når animationerne er slået fra. Kun i browseren.
export function prefersReducedMotion() {
  return document.documentElement.dataset.motion === "reduce";
}

// Kalder callback, når data-motion ændrer sig. Returnerer en funktion, der stopper igen.
// Bruges sammen med useSyncExternalStore (se HeroScroll).
export function subscribeReducedMotion(callback) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  return () => observer.disconnect();
}
