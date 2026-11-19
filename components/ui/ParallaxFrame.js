"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ParallaxFrame.module.css";

// 1 = the image stands completely still, 0 = the image follows the frame (no effect).
// 0.3: the image mostly sits in the card and only drifts a little, so little of its top and bottom is shown.
export const PARALLAX_STRENGTH = 0.3;

/**
 * Where the image inside a ParallaxFrame is, for a frame at a given place on the screen.
 * The image is centred in the frame (top: 50%, translate -50%) and then moved y px.
 * HeroScroll uses it too, so the unfolding poster ends with the image exactly where the first card has it.
 *
 * @param {object} options
 * @param {number} options.frameHeight
 * @param {number} options.frameTop The frame's top edge on the screen (px from the top of the viewport)
 * @param {number} options.viewportHeight
 * @param {number} [options.strength]
 * @param {number} [options.lift] Extra image above, as a share of the height (0.3 = 30 %). The bottom edge stays,
 *   so the frame shows more of the image's bottom and less of its top (fx more ground, less sky)
 * @returns {{ height: number, y: number }}
 */
export function getParallaxBox({ frameHeight, frameTop, viewportHeight, strength = PARALLAX_STRENGTH, lift = 0 }) {
  const span = viewportHeight + frameHeight;
  // How far the image moves against the frame
  const travel = (span / 2) * strength;
  // The smallest height that still covers the part of the frame that is on the screen, all the way through
  // the scroll (worst case: the frame's top edge at the top of the screen, or its bottom edge at the bottom).
  // The smaller the strength, the closer the image is to the frame's own size – so it hardly zooms.
  // A couple of pixels extra, so rounding never shows a hairline.
  const height = frameHeight + strength * Math.abs(viewportHeight - frameHeight) + 2;
  // 0 when the frame's top enters at the bottom, 1 when its bottom leaves at the top
  const progress = (viewportHeight - frameTop) / span;
  // Lift: taller by height × lift, moved up by half of that, so only the top edge moves
  const extra = height * lift;
  return { height: height + extra, y: -travel + 2 * travel * progress - extra / 2 };
}

/**
 * Vindues-parallax: rammen scroller som normalt, men billedet indeni står næsten stille,
 * så det føles som at kigge gennem et vindue, der glider hen over billedet.
 * Ved "reducer bevægelse" fylder billedet bare rammen.
 *
 * Indholdet (children) lægges direkte i rammen, så rammens egen CSS kan placere det.
 * Billedet er et next/image i et lag, der flyttes med transform (translate3d) – aldrig med top eller filter.
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

    const box = (frameTop) =>
      getParallaxBox({ frameHeight: frame.offsetHeight, frameTop, viewportHeight: window.innerHeight, strength, lift });
    const size = () => {
      layer.style.height = `${box(0).height}px`;
    };

    const ctx = gsap.context(() => {
      layer.classList.add(styles.moving);
      size();
      // From the frame's top at the bottom of the screen to its bottom at the top.
      // yPercent: -50 centres the layer (top: 50% in the CSS). It is part of GSAP's transform on purpose:
      // GSAP owns the whole transform, so a CSS translate would be dropped.
      gsap.fromTo(
        layer,
        { yPercent: -50, y: () => box(window.innerHeight).y },
        {
          yPercent: -50,
          y: () => box(-frame.offsetHeight).y,
          ease: "none",
          force3D: true, // translate3d, so the layer moves on the GPU
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            // "bottom top", measured from the frame's real height: a parent may be scaled while ScrollTrigger
            // measures (FeaturedMovies grows cards in from 0.9), and offsetHeight ignores that
            end: () => `+=${window.innerHeight + frame.offsetHeight}`,
            scrub,
            invalidateOnRefresh: true,
            onRefresh: size,
          },
        },
      );
    });

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
