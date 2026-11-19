"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ParallaxFrame.module.css";

// Hvor meget billedet bevæger sig i forhold til rammen.
// 1 = billedet står helt stille på skærmen, 0 = billedet følger rammen (ingen effekt).
// 0.3: billedet sidder mest fast i kortet og glider kun lidt, så man ser ikke meget af top og bund.
export const PARALLAX_STRENGTH = 0.3;

/**
 * Regner ud, hvor billedet skal stå inde i rammen, når rammen står et bestemt sted på skærmen.
 * Billedlaget er centreret i rammen og flyttes så y pixels op eller ned.
 * HeroScroll bruger også funktionen, så plakaten, der folder sig ud, ender med billedet præcis
 * samme sted som i kort 1 – ellers ville man kunne se et hop, når de bytter.
 *
 * @param {object} options
 * @param {number} options.frameHeight Rammens højde
 * @param {number} options.frameTop Hvor rammens top står på skærmen (pixels fra toppen af vinduet)
 * @param {number} options.viewportHeight Vinduets højde
 * @param {number} [options.strength] Se PARALLAX_STRENGTH
 * @param {number} [options.lift] Ekstra billede foroven, som en andel af højden (0.3 = 30 %). Bunden bliver,
 *   hvor den er, så rammen viser mere af billedets bund og mindre af toppen (fx mere jord, mindre himmel)
 * @returns {{ height: number, y: number }} Billedlagets højde og hvor langt det skal flyttes
 */
export function getParallaxBox({ frameHeight, frameTop, viewportHeight, strength = PARALLAX_STRENGTH, lift = 0 }) {
  // Hele turen: fra rammens top kommer ind i bunden af skærmen, til dens bund forsvinder i toppen
  const span = viewportHeight + frameHeight;
  // Hvor langt billedet når at glide i forhold til rammen på den tur
  const travel = (span / 2) * strength;
  // Billedet skal være højere end rammen, så der aldrig kommer et hul i kanten, mens det glider.
  // Det er den mindste højde, der stadig dækker den del af rammen, man kan se – hele vejen igennem.
  // Jo mindre strength, jo tættere er billedet på rammens egen størrelse, og så zoomer det næsten ikke.
  // + 2 pixels, så en afrunding aldrig viser en tynd streg.
  const height = frameHeight + strength * Math.abs(viewportHeight - frameHeight) + 2;
  // Hvor langt rammen er nået på turen: 0 = lige kommet ind i bunden, 1 = lige ved at forsvinde i toppen
  const progress = (viewportHeight - frameTop) / span;
  // Lift: billedet gøres højere og flyttes halvdelen af det op, så kun toppen rykker sig – bunden bliver
  const extra = height * lift;
  return { height: height + extra, y: -travel + 2 * travel * progress - extra / 2 };
}

/**
 * Vindues-parallax: rammen scroller som normalt, men billedet indeni står næsten stille,
 * så det føles som at kigge gennem et vindue, der glider hen over billedet.
 * Ved "reducer bevægelse" fylder billedet bare rammen.
 *
 * Indholdet (children) lægges direkte i rammen, så rammens egen CSS kan placere det.
 * Billedet er et next/image i et lag, der flyttes med transform (translate3d) – det er det hurtigste,
 * fordi grafikkortet så kan flytte det uden at tegne det igen.
 *
 * @param {object} props
 * @param {string} [props.src] Uden billede er rammen bare en ramme
 * @param {string} [props.alt]
 * @param {number} [props.strength] 1 = billedet står helt stille, 0 = ingen effekt
 * @param {boolean | number} [props.scrub] true følger scrollen præcist, et tal (fx 0.6) udjævner bevægelsen
 * @param {number} [props.lift] Vis mere af billedets bund og mindre af toppen (se getParallaxBox)
 * @param {string} [props.sizes] Hvor bredt billedet vises (next/image)
 * @param {boolean} [props.preload] Hent billedet med det samme (det første billede på siden)
 * @param {"eager" | "lazy"} [props.loading] "eager" henter billedet, selv om det ikke er på skærmen endnu
 * @param {React.ElementType} [props.as] Elementet, rammen er (fx "article")
 * @param {string} [props.className] Rammens udseende – fx runde hjørner
 * @param {React.ReactNode} [props.children] Indhold oven på billedet
 */
export default function ParallaxFrame({
  src,
  alt = "",
  strength = PARALLAX_STRENGTH,
  scrub = true,
  lift = 0,
  sizes = "100vw",
  preload = false,
  loading,
  as: Tag = "div",
  className,
  children,
  ...rest
}) {
  const frameRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    const frame = frameRef.current;
    const layer = layerRef.current;
    if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Billedlagets højde og placering for rammen et bestemt sted på skærmen
    const box = (frameTop) =>
      getParallaxBox({ frameHeight: frame.offsetHeight, frameTop, viewportHeight: window.innerHeight, strength, lift });
    const size = () => {
      layer.style.height = `${box(0).height}px`;
    };

    const ctx = gsap.context(() => {
      layer.classList.add(styles.moving);
      size();
      // Billedlaget glider, mens rammen scroller fra bunden af skærmen til toppen.
      // yPercent: -50 centrerer laget (sammen med top: 50% i CSS'en). Det skal stå her og ikke i CSS'en:
      // GSAP styrer hele elementets transform og ville ellers slette en translate fra CSS'en,
      // så laget ville ligge et halvt lag for lavt (det gav en tom stribe øverst i kortet).
      gsap.fromTo(
        layer,
        { yPercent: -50, y: () => box(window.innerHeight).y },
        {
          yPercent: -50,
          y: () => box(-frame.offsetHeight).y,
          ease: "none",
          force3D: true, // translate3d, så grafikkortet flytter laget
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            // Slutter, når rammens bund forlader toppen af skærmen. Det regnes ud fra rammens rigtige højde,
            // fordi kortet kan være skaleret ned (FeaturedMovies lader kortene vokse fra 0.9), når ScrollTrigger
            // måler – og offsetHeight er højden uden skalering
            end: () => `+=${window.innerHeight + frame.offsetHeight}`,
            scrub,
            invalidateOnRefresh: true,
            onRefresh: size,
          },
        },
      );
    });

    // Ryd op: fjern animationen og sæt laget tilbage, som det var
    return () => {
      ctx.revert();
      layer.classList.remove(styles.moving);
      layer.style.height = "";
    };
  }, [strength, scrub, lift, src]);

  return (
    <Tag ref={frameRef} className={`${styles.frame} ${className ?? ""}`} {...rest}>
      {src && (
        <div ref={layerRef} className={styles.layer}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            preload={preload}
            loading={loading}
            className={styles.image}
            draggable={false}
          />
        </div>
      )}
      {children}
    </Tag>
  );
}
