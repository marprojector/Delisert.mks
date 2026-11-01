import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { type RefObject, useCallback, useLayoutEffect, useRef } from "react";

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
/** Efek yang hanya masuk akal dengan layar lebar dan mouse (mis. section yang menempel). */
export const DESKTOP_MOTION_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

const EASE = "power3.out";

/** Keadaan awal dan akhir elemen [data-reveal]. */
const REVEAL_FROM = { y: 28, autoAlpha: 0 };
const REVEAL_TO = { y: 0, autoAlpha: 1, duration: 0.8, ease: EASE };

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);
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
        // Judul dipecah per huruf. SplitText menambahkan aria-label sehingga
        // pembaca layar tetap membaca kalimat utuh; dibatalkan otomatis bersama mm.
        const split = SplitText.create("[data-hero-line]", { type: "words,chars", aria: "auto" });
        gsap
          .timeline({ defaults: { ease: EASE } })
          .set("[data-hero-line]", { autoAlpha: 1 })
          .fromTo(
            split.chars,
            { yPercent: 115, rotate: 6, autoAlpha: 0 },
            { yPercent: 0, rotate: 0, autoAlpha: 1, duration: 0.8, stagger: 0.022 },
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

/**
 * Desktop: section [data-pin-section] menempel di layar, lalu baris
 * [data-pin-track] di dalamnya bergeser horizontal mengikuti scroll.
 * HP tidak di-pin: barisnya cukup digeser dengan jari.
 */
export function useFeaturedPin(scope: Scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION_QUERY, () => {
        const section = scope.current?.querySelector<HTMLElement>("[data-pin-section]");
        const viewport = section?.querySelector<HTMLElement>("[data-pin-viewport]");
        const track = section?.querySelector<HTMLElement>("[data-pin-track]");
        if (!section || !viewport || !track) return;

        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
        if (distance() === 0) return;

        // Saat di-pin, gulir horizontal bawaan dimatikan; GSAP yang menggeser.
        viewport.dataset.pinned = "true";
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top+=88",
            end: () => `+=${distance()}`,
            pin: true,
            // Wajib eksplisit: induk flex membuat ScrollTrigger mematikan jarak
            // ini, lalu section berikutnya naik menimpa section yang di-pin.
            pinSpacing: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        return () => {
          delete viewport.dataset.pinned;
        };
      });
      return () => mm.revert();
    },
    { scope },
  );
}

/** Angka awal hitungan naik: tahun naik dari dua dekade sebelumnya, angka kecil dari nol. */
export function countUpStart(value: number): number {
  return value >= 1000 ? value - 20 : 0;
}

/** Elemen [data-count-to="n"] menghitung naik saat masuk layar. */
export function useCountUp(scope: Scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        const elements = gsap.utils.toArray<HTMLElement>("[data-count-to]", scope.current);
        for (const element of elements) {
          const target = Number(element.dataset.countTo);
          if (!Number.isFinite(target)) continue;
          const counter = { value: countUpStart(target) };
          element.textContent = String(counter.value);
          gsap.to(counter, {
            value: target,
            duration: 1.6,
            ease: "power2.out",
            snap: { value: 1 },
            onUpdate: () => {
              element.textContent = String(counter.value);
            },
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
          });
        }
        // Bila animasi dibatalkan (mis. gerak dikurangi), tampilkan angka akhir.
        return () => {
          for (const element of elements) element.textContent = element.dataset.countTo ?? "";
        };
      });
      return () => mm.revert();
    },
    { scope },
  );
}

/** Elemen [data-slide-up] (mis. bar pesan di HP) naik dari bawah layar. */
export function useSlideUp(scope: Scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        gsap.fromTo(
          gsap.utils.toArray<HTMLElement>("[data-slide-up]", scope.current),
          { yPercent: 110, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: EASE, delay: 0.5 },
        );
      });
      return () => mm.revert();
    },
    { scope },
  );
}

/**
 * Filter kategori dengan Flip: kartu yang tetap tampil berpindah posisi dengan
 * mulus, yang masuk membesar, yang keluar mengecil. Panggil `capture()` tepat
 * sebelum filter berubah; animasi jalan setelah React menggambar ulang.
 */
export function useFlipFilter(scope: Scope, filterKey: string | undefined) {
  const state = useRef<Flip.FlipState | null>(null);

  const capture = useCallback(() => {
    if (!window.matchMedia(MOTION_QUERY).matches) return;
    state.current = Flip.getState(gsap.utils.toArray<HTMLElement>("[data-flip-item]", scope.current));
  }, [scope]);

  useLayoutEffect(() => {
    const previous = state.current;
    if (!previous) return;
    state.current = null;
    const animation = Flip.from(previous, {
      duration: 0.6,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      onEnter: (elements) =>
        gsap.fromTo(elements, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.5, delay: 0.15 }),
      onLeave: (elements) => gsap.to(elements, { autoAlpha: 0, scale: 0.85, duration: 0.35 }),
    });
    return () => {
      animation.kill();
    };
  }, [filterKey]);

  return capture;
}
