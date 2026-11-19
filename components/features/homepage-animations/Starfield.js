"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Starfield.module.css";

/**
 * Stjernebaggrund: et 3D-stjernefelt på et canvas, hvor stjernerne flyver roligt imod brugeren.
 * Langt væk er de små og svage, tæt på er de større og klarere.
 * Når man scroller hurtigt, stiger farten, og stjernerne trækkes ud til lysstriber. Farten klinger blødt af igen.
 *
 * Læg den som første barn i en sektion med position: relative – den fylder hele sektionen og ligger bag indholdet.
 * Farven er text/Primær (--color-text-primary, sat i Starfield.module.css).
 * Den holder pause, når den er ude af billedet, og står stille ved "reducer bevægelse".
 *
 * @param {object} props
 * @param {number} [props.count] Antal stjerner
 * @param {number} [props.speed] Grundfart, når man ikke scroller
 * @param {boolean} [props.reactToScroll] Om fart og striber skal reagere på scroll
 * @param {string} [props.className]
 */
export default function Starfield({ count = 520, speed = 0.075, reactToScroll = true, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const section = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    // The color comes from the CSS token, so no color is written here
    const color = getComputedStyle(canvas).color;

    // Each star has a direction (x, y) and a distance (z: 1 = far away, 0 = right in front of you)
    const newStar = (z) => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z, r: Math.random() * 0.8 + 0.6 });
    const stars = Array.from({ length: count }, () => newStar(Math.random()));
    let currentSpeed = speed;
    let boost = 0;
    let visible = true;

    function size() {
      canvas.width = section.clientWidth * dpr;
      canvas.height = section.clientHeight * dpr;
    }

    function draw(dt) {
      // The speed glides softly towards base speed + scroll boost, and the boost fades out
      currentSpeed += (speed + boost - currentSpeed) * 0.08;
      boost *= 0.92;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const focal = Math.max(w, h) * 0.5;
      const step = (Math.min(dt, 50) / 1000) * currentSpeed;
      const streak = Math.min(1, Math.max(0, (currentSpeed - 0.12) / 0.25)); // 0 = dots, 1 = full streaks

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineCap = "round";

      for (const star of stars) {
        star.z -= step;
        if (star.z <= 0.03) {
          Object.assign(star, newStar(1)); // A new star far away
        }
        // Perspective: the closer, the further out from the middle
        const x = cx + (star.x / star.z) * focal;
        const y = cy + (star.y / star.z) * focal;
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) {
          star.z = 0;
          continue;
        }
        // Far away: small and faint – close: bigger and brighter (faded in, so they don't "pop")
        const near = 1 - star.z;
        const alpha = Math.min(1, near * 1.6) * Math.min(1, star.z / 0.08) * 0.9;
        const radius = (0.3 + near * near * 1.8) * star.r * dpr;

        ctx.beginPath();
        if (streak > 0) {
          // Speed: draw a trail from where the star was a moment ago
          const tailZ = Math.min(1, star.z + step);
          ctx.globalAlpha = alpha * (0.6 + 0.4 * (1 - streak));
          ctx.lineWidth = radius * 1.5;
          ctx.moveTo(cx + (star.x / tailZ) * focal, cy + (star.y / tailZ) * focal);
          ctx.lineTo(x, y);
          ctx.stroke();
        } else {
          ctx.globalAlpha = alpha;
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    size();
    const resizeObserver = new ResizeObserver(() => {
      size();
      if (reduce) {
        draw(0);
      }
    });
    resizeObserver.observe(section);

    // Reduced motion: draw one still starfield
    if (reduce) {
      draw(0);
      return () => resizeObserver.disconnect();
    }

    // Pause when the section is out of view. IntersectionObserver also works while the section is pinned.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersectionObserver.observe(section);

    function tick(_time, dt) {
      if (visible) {
        draw(dt);
      }
    }
    gsap.ticker.add(tick);

    // The scroll speed of the whole page gives the boost (streaks)
    const trigger = reactToScroll
      ? ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            boost = Math.min(0.3, Math.abs(self.getVelocity()) / 12000);
          },
        })
      : null;

    return () => {
      gsap.ticker.remove(tick);
      trigger?.kill();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [count, speed, reactToScroll]);

  return <canvas ref={ref} className={`${styles.starfield} ${className ?? ""}`} aria-hidden="true" />;
}
