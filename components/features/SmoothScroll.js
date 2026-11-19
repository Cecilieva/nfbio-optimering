"use client";

import { useEffect, useSyncExternalStore } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

// Der er kun én Lenis på hele siden. Den gemmes her, så andre komponenter kan hente den med useLenis().
// listeners er dem, der skal have besked, når Lenis bliver startet eller fjernet.
let current = null;
const listeners = new Set();

function setCurrent(lenis) {
  current = lenis;
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Giver Lenis, så en komponent kan stoppe og starte scrollen.
 * Er null, før Lenis er startet, og når man har bedt om mindre bevægelse.
 * Fx HeroScroll: lenis.stop(), mens nedtællingen kører, og lenis.start() bagefter.
 */
export function useLenis() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

/**
 * Blød scroll med Lenis. Ligger én gang i app/(site)/layout.js og viser ikke noget selv.
 * Lenis gør scrollen med musehjulet blød, og ScrollTrigger (GSAP's scroll-animationer) får besked,
 * hver gang siden flytter sig.
 * På mobil scroller man som normalt (Lenis styrer ikke touch).
 * Har man bedt om mindre bevægelse, startes Lenis ikke.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // lerp: hvor blødt scrollen følger efter (mindre tal = blødere).
    // allowNestedScroll: lister med deres egen scrollbar (fx en dropdown i filtreringen) kan stadig scrolles.
    const lenis = new Lenis({ lerp: 0.09, allowNestedScroll: true });

    // Lenis og GSAP skal køre i takt: ScrollTrigger opdateres, når Lenis scroller,
    // og Lenis tegnes i GSAP's egen løkke (ticker), så de bruger samme tid.
    // lagSmoothing(0): GSAP må ikke "springe over" tid, når en frame er langsom – ellers hopper scrollen.
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setCurrent(lenis);

    // Ryd op, når komponenten forsvinder
    return () => {
      setCurrent(null);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's standard igen
      lenis.destroy();
    };
  }, []);

  return null;
}
