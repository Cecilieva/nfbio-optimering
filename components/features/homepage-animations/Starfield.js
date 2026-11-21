"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Starfield.module.css";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Stjernebaggrund: et 3D-stjernefelt på et canvas, hvor stjernerne flyver roligt imod brugeren.
 * Langt væk er de små og svage, tæt på er de større og klarere.
 * Når man scroller hurtigt, stiger farten, og stjernerne trækkes ud til lysstriber. Farten klinger blødt af igen.
 *
 * Læg den som første barn i en sektion med position: relative – den fylder hele sektionen og ligger bag indholdet.
 * Farven er Figmas Stjerner/Stjerne primær (--color-star, sat i Starfield.module.css).
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
    const reduce = prefersReducedMotion();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    // dpr: hvor skarp skærmen er (2 på en Retina-skærm). Canvas'et tegnes i den opløsning, så stjernerne er skarpe.
    // Farven hentes fra CSS'en (tokenet --color-star), så der står ingen farve her
    const color = getComputedStyle(canvas).color;

    // Hver stjerne har en retning ud fra midten (x, y) og en afstand (z: 1 = langt væk, 0 = lige foran en).
    // r er stjernens størrelse.
    const newStar = (z) => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z, r: Math.random() * 0.8 + 0.6 });
    const stars = Array.from({ length: count }, () => newStar(Math.random()));
    let currentSpeed = speed;
    let boost = 0;
    let visible = true;

    // Canvas'et skal have samme størrelse som sektionen (gange dpr for skarphed)
    function size() {
      canvas.width = section.clientWidth * dpr;
      canvas.height = section.clientHeight * dpr;
    }

    // Tegner én frame. dt er tiden i millisekunder siden sidste frame.
    function draw(dt) {
      // Farten glider blødt mod grundfarten + det ekstra fra scroll (boost), og boostet klinger langsomt af
      currentSpeed += (speed + boost - currentSpeed) * 0.08;
      boost *= 0.92;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      // focal: hvor stærkt perspektivet er (som en kameralinse)
      const focal = Math.max(w, h) * 0.5;
      // Hvor langt stjernerne flytter sig i denne frame. Max 50 ms, så de ikke springer efter en langsom frame.
      const step = (Math.min(dt, 50) / 1000) * currentSpeed;
      // Ved høj fart bliver stjernerne til striber: 0 = prikker, 1 = fulde striber
      const streak = Math.min(1, Math.max(0, (currentSpeed - 0.12) / 0.25));

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineCap = "round";

      for (const star of stars) {
        star.z -= step;
        if (star.z <= 0.03) {
          Object.assign(star, newStar(1)); // Stjernen er fløjet forbi: en ny starter langt væk
        }
        // Perspektiv: jo tættere en stjerne er på, jo længere ude fra midten står den
        const x = cx + (star.x / star.z) * focal;
        const y = cy + (star.y / star.z) * focal;
        // Uden for skærmen: den kommer aldrig tilbage, så den erstattes af en ny i næste frame
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) {
          star.z = 0;
          continue;
        }
        // Langt væk: små og svage – tæt på: større og klarere.
        // De tones blødt ind langt væk og ud helt tæt på, så de ikke pludselig dukker op eller forsvinder.
        const near = 1 - star.z;
        const alpha = Math.min(1, near * 1.6) * Math.min(1, star.z / 0.08) * 0.9;
        const radius = (0.3 + near * near * 1.8) * star.r * dpr;

        ctx.beginPath();
        if (streak > 0) {
          // Fart: tegn en streg fra der, hvor stjernen var for et øjeblik siden, til der, hvor den er nu
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

    // Mindre bevægelse: tegn ét stillestående stjernefelt og stop her
    if (reduce) {
      draw(0);
      return () => resizeObserver.disconnect();
    }

    // Hold pause, når sektionen ikke kan ses, så computeren ikke tegner forgæves.
    // IntersectionObserver holder øje med, om sektionen er på skærmen (virker også, mens hero'en er pinned).
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersectionObserver.observe(section);

    // Tegn en ny frame hver gang GSAP's løkke kører (ca. 60 gange i sekundet)
    function tick(_time, dt) {
      if (visible) {
        draw(dt);
      }
    }
    gsap.ticker.add(tick);

    // Jo hurtigere man scroller på siden, jo større boost (og striber)
    const trigger = reactToScroll
      ? ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            boost = Math.min(0.3, Math.abs(self.getVelocity()) / 12000);
          },
        })
      : null;

    // Ryd op, når komponenten forsvinder
    return () => {
      gsap.ticker.remove(tick);
      trigger?.kill();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [count, speed, reactToScroll]);

  return <canvas ref={ref} className={`${styles.starfield} ${className ?? ""}`} aria-hidden="true" />;
}
