import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

/**
 * Semua animasi GSAP situs ada di sini.
 *
 * Aturan:
 * - Konten selalu terlihat tanpa JavaScript. Animasi memakai gsap.from(),
 *   jadi keadaan akhir = markup SSR. Jangan pernah menyembunyikan konten
 *   dengan CSS atau dengan mengeset keadaan awal GSAP sebelum JS jalan.
 * - Semua animasi hanya jalan bila pengunjung TIDAK meminta gerak dikurangi
 *   (prefers-reduced-motion). gsap.matchMedia() otomatis membatalkan semuanya
 *   saat preferensi berubah atau komponen dilepas.
 * - Hanya transform dan opacity yang dianimasikan.
 */

export const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const EASE = "power3.out";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type Scope = RefObject<HTMLElement | null>;

/** Elemen [data-reveal] muncul naik saat masuk layar, berurutan per batch. */
export function useReveal(scope: Scope, dependencies: unknown[] = []) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current);
        if (targets.length === 0) return;
        ScrollTrigger.batch(targets, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.from(batch, {
              y: 24,
              autoAlpha: 0,
              duration: 0.7,
              ease: EASE,
              stagger: 0.08,
              overwrite: true,
            }),
        });
      });
      return () => mm.revert();
    },
    { scope, dependencies },
  );
}

/** Pembuka hero: baris judul naik satu per satu, media membesar pelan. */
export function useHeroIntro(scope: Scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        const timeline = gsap.timeline({ defaults: { ease: EASE } });
        timeline
          .from("[data-hero-line]", { yPercent: 110, autoAlpha: 0, duration: 0.9, stagger: 0.12 })
          .from("[data-hero-fade]", { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, "-=0.5")
          .from(
            "[data-hero-media]",
            { scale: 0.94, autoAlpha: 0, duration: 0.9, stagger: 0.1 },
            "-=0.7",
          );
      });
      return () => mm.revert();
    },
    { scope },
  );
}

/** Elemen [data-parallax="n"] bergeser pelan saat halaman di-scroll. */
export function useParallax(scope: Scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        for (const element of gsap.utils.toArray<HTMLElement>("[data-parallax]", scope.current)) {
          const strength = Number(element.dataset.parallax) || 1;
          gsap.to(element, {
            y: strength * -40,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });
      return () => mm.revert();
    },
    { scope },
  );
}

/** Menu layar penuh di HP: panel terbuka melingkar, tautan masuk berurutan. */
export function useMenuOverlay(open: boolean, scope: Scope) {
  useGSAP(
    () => {
      if (!open) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        gsap
          .timeline({ defaults: { ease: EASE } })
          .from(scope.current, {
            clipPath: "circle(0% at 92% 4%)",
            duration: 0.6,
          })
          .from(
            "[data-menu-item]",
            { y: 28, autoAlpha: 0, duration: 0.5, stagger: 0.06 },
            "-=0.3",
          );
      });
      return () => mm.revert();
    },
    { scope, dependencies: [open] },
  );
}
