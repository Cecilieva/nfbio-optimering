"use client";

import { useEffect, useSyncExternalStore } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

// The one Lenis instance, shared through a tiny store so components can stop and start it
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
 * Lenis-instansen, eller null før den er startet og ved "reducer bevægelse".
 * Fx HeroScroll: lenis.stop(), mens nedtællingen kører, og lenis.start() bagefter.
 */
export function useLenis() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

/**
 * Blød scroll med Lenis, koblet til GSAP ScrollTrigger. Ligger én gang i app/(site)/layout.js.
 * Touch er browserens egen (ingen syncTouch), så mobil scroller naturligt.
 * Ved "reducer bevægelse" startes Lenis ikke.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // allowNestedScroll: lists with their own scrollbar (e.g. a filter dropdown) still scroll themselves
    const lenis = new Lenis({ lerp: 0.09, allowNestedScroll: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setCurrent(lenis);

    return () => {
      setCurrent(null);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's default
      lenis.destroy();
    };
  }, []);

  return null;
}
