import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

import { MOTION_DONE_CLASS } from "./motion-gate";

/**
 * Semua animasi GSAP situs ada di sini.
 *
 * Aturan:
 * - Elemen beranimasi disembunyikan sejak cat pertama oleh gerbang di
 *   motion-gate.ts (hanya bila JS jalan dan gerak tidak dikurangi), lalu
 *   dimunculkan di sini dengan fromTo(). Jangan memakai gsap.from() pada
 *   elemen yang sudah terlihat: hasilnya berkedip (terlihat → hilang → muncul).
 * - Semua animasi hanya jalan bila pengunjung TIDAK meminta gerak dikurangi.
 *   gsap.matchMedia() otomatis membatalkan semuanya saat preferensi berubah
 *   atau komponen dilepas.
 * - Hanya transform dan opacity yang dianimasikan.
 */

export const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const EASE = "power3.out";

/** Keadaan awal dan akhir elemen [data-reveal]. */
const REVEAL_FROM = { y: 28, autoAlpha: 0 };
const REVEAL_TO = { y: 0, autoAlpha: 1, duration: 0.8, ease: EASE };

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Tanda untuk gerbang: kode animasi sudah dimuat, jangan paksa tampil.
  (window as Window & { __delisertMotion?: boolean }).__delisertMotion = true;
  // Bila pengunjung beralih ke "gerak dikurangi", tampilkan semua konten.
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
  const showAll = () => document.documentElement.classList.add(MOTION_DONE_CLASS);
  if (reduced.matches) showAll();
  reduced.addEventListener("change", (event) => {
    if (event.matches) showAll();
  });
}

type Scope = RefObject<HTMLElement | null>;

/**
 * Elemen [data-reveal] muncul naik. Yang sudah ada di layar (atau di atasnya,
 * mis. setelah reload di tengah halaman) muncul langsung berurutan; sisanya
 * muncul saat masuk layar.
 */
export function useReveal(scope: Scope, dependencies: unknown[] = []) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current);
        if (targets.length === 0) return;

        const fold = window.innerHeight * 0.92;
        const visibleNow = targets.filter((element) => element.getBoundingClientRect().top < fold);
        const later = targets.filter((element) => !visibleNow.includes(element));

        if (visibleNow.length > 0) {
          gsap.fromTo(visibleNow, REVEAL_FROM, { ...REVEAL_TO, stagger: 0.07, delay: 0.15 });
        }
        if (later.length > 0) {
          ScrollTrigger.batch(later, {
            start: "top 92%",
            once: true,
            onEnter: (batch) =>
              gsap.fromTo(batch, REVEAL_FROM, { ...REVEAL_TO, stagger: 0.08, overwrite: true }),
          });
        }
      });
      return () => mm.revert();
    },
    // revertOnUpdate: saat filter/produk berganti, trigger lama dibersihkan dulu.
    { scope, dependencies, revertOnUpdate: true },
  );
}

/** Pembuka hero: baris judul naik satu per satu, media membesar pelan. */
export function useHeroIntro(scope: Scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        gsap
          .timeline({ defaults: { ease: EASE } })
          .fromTo(
            "[data-hero-line]",
            { yPercent: 110, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12 },
          )
          .fromTo(
            "[data-hero-fade]",
            { y: 16, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08 },
            "-=0.5",
          )
          .fromTo(
            "[data-hero-media]",
            { scale: 0.94, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.9, stagger: 0.1 },
            "-=0.7",
          );
      });
      return () => mm.revert();
    },
    { scope },
  );
}

/** Jarak geser parallax per tingkat kekuatan, ke atas dan ke bawah dari posisi asal. */
export const PARALLAX_TRAVEL_PX = 20;

/**
 * Lapisan foto parallax harus lebih tinggi dari wadahnya sebanyak ini di atas
 * dan di bawah, supaya saat bergeser tidak pernah ada celah kosong.
 */
export function parallaxOverscanPx(strength: number): number {
  return PARALLAX_TRAVEL_PX * strength + 8;
}

/** Elemen [data-parallax="n"] bergeser pelan saat halaman di-scroll. */
export function useParallax(scope: Scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        for (const element of gsap.utils.toArray<HTMLElement>("[data-parallax]", scope.current)) {
          const strength = Number(element.dataset.parallax) || 1;
          const travel = PARALLAX_TRAVEL_PX * strength;
          gsap.fromTo(
            element,
            { y: travel },
            {
              y: -travel,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                // clamp(): elemen di layar pertama mulai dari posisi tengah.
                start: "clamp(top bottom)",
                end: "clamp(bottom top)",
                scrub: true,
              },
            },
          );
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
