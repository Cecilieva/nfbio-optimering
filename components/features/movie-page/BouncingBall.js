"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { prefersReducedMotion, subscribeReducedMotion } from "@/lib/motion";
import styles from "./BouncingBall.module.css";

// Hvor tæt musen skal komme (ud over boldens kant), før den skubber, i forhold til radius
const REACH = 0.35;
// Grundskub, når musen rammer bolden – og hvor meget musens fart lægger oveni
const PUSH = 6;
const PUSH_FROM_SPEED = 0.6;
// Højeste fart (px pr. frame ved 60 fps), så bolden ikke flyver ukontrolleret
const MAX_SPEED = 40;
// Bremsen: hvor meget af farten der er tilbage efter én frame (60 fps)
const FRICTION = 0.97;
// Hvor meget af farten bolden beholder, når den hopper tilbage fra en kant
const BOUNCE = 0.8;
// Startplads i forhold til rammen (Figma "Lup Katten", zone 1)
const START = { x: 0.15, y: 0.25 };

/**
 * Den røde bold i heroen på Katten med Hatten (Figma "Lup Katten" 1816:10337).
 * Man skubber den væk med musen – jo hurtigere musen bevæger sig, jo længere ryger den.
 * Den bremser langsomt op og hopper tilbage fra kanterne, så den aldrig forlader rammen
 * (forælderen – billedlaget i MovieHero). Med "Reducer bevægelse" står den stille.
 *
 * Bolden er kun pynt: aria-hidden og pointer-events: none, så den ikke tager klik fra titel og knapper.
 * Positionen sættes direkte på elementet i hver frame (ikke med state), så React ikke tegner siden 60 gange i sekundet.
 */
export default function BouncingBall() {
  const ballRef = useRef(null);
  const reduced = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);

  useEffect(() => {
    const ball = ballRef.current;
    const frame = ball?.parentElement;
    if (!ball || !frame) {
      return;
    }

    // Boldens midte og fart i px. Musens sidste plads bruges til at regne musens fart ud
    const state = { x: 0, y: 0, vx: 0, vy: 0 };
    let pointer = null;
    let size = { width: 0, height: 0, radius: 0 };

    // Mål rammen og bolden (også når vinduet ændrer størrelse) og hold bolden inden for
    function measure(first) {
      const rect = frame.getBoundingClientRect();
      const radius = ball.offsetWidth / 2;
      size = { width: rect.width, height: rect.height, radius };
      if (first) {
        state.x = rect.width * START.x + radius;
        state.y = rect.height * START.y + radius;
      }
      state.x = Math.min(Math.max(state.x, radius), Math.max(radius, rect.width - radius));
      state.y = Math.min(Math.max(state.y, radius), Math.max(radius, rect.height - radius));
    }

    function draw() {
      ball.style.transform = `translate3d(${state.x - size.radius}px, ${state.y - size.radius}px, 0)`;
    }

    measure(true);
    draw();

    // Reducer bevægelse: bolden står stille på sin startplads
    if (reduced) {
      const onResize = () => {
        measure(false);
        draw();
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    // Musen: er den tæt på bolden, får bolden et skub væk fra musen
    function onPointerMove(event) {
      const rect = frame.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const speed = pointer ? Math.hypot(x - pointer.x, y - pointer.y) : 0;
      pointer = { x, y };

      const dx = state.x - x;
      const dy = state.y - y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance > size.radius * (1 + REACH)) {
        return;
      }
      // Retningen fra musen ind mod boldens midte
      const nx = dx / distance;
      const ny = dy / distance;
      const push = PUSH + speed * PUSH_FROM_SPEED;
      state.vx += nx * push;
      state.vy += ny * push;
      const velocity = Math.hypot(state.vx, state.vy);
      if (velocity > MAX_SPEED) {
        state.vx = (state.vx / velocity) * MAX_SPEED;
        state.vy = (state.vy / velocity) * MAX_SPEED;
      }
    }

    function onPointerLeave() {
      pointer = null;
    }

    // Én frame: flyt bolden, brems den og lad den hoppe tilbage fra kanterne
    let last = performance.now();
    let animationId;
    function tick(now) {
      // Tiden siden sidste frame i "frames ved 60 fps" – så bolden kører lige hurtigt på alle skærme
      const steps = Math.min((now - last) / (1000 / 60), 3);
      last = now;

      state.x += state.vx * steps;
      state.y += state.vy * steps;
      const friction = FRICTION ** steps;
      state.vx *= friction;
      state.vy *= friction;

      const { width, height, radius } = size;
      if (state.x < radius) {
        state.x = radius;
        state.vx = Math.abs(state.vx) * BOUNCE;
      } else if (state.x > width - radius) {
        state.x = width - radius;
        state.vx = -Math.abs(state.vx) * BOUNCE;
      }
      if (state.y < radius) {
        state.y = radius;
        state.vy = Math.abs(state.vy) * BOUNCE;
      } else if (state.y > height - radius) {
        state.y = height - radius;
        state.vy = -Math.abs(state.vy) * BOUNCE;
      }

      draw();
      animationId = requestAnimationFrame(tick);
    }
    animationId = requestAnimationFrame(tick);

    const onResize = () => measure(false);
    // Musen lyttes på hele vinduet, fordi titel og knapper ligger oven på bolden
    window.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced]);

  return <span ref={ballRef} className={styles.ball} aria-hidden="true" />;
}
