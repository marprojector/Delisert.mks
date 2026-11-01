import { formatRupiah } from "@delisert.mks-1/ui/lib/price";
import gsap from "gsap";
import { useEffect, useRef } from "react";

import { MOTION_QUERY } from "@/lib/motion";

const NO_PRICE = "Harga menyusul";

/**
 * Harga yang berganti dengan animasi angka saat varian dipilih.
 * Server selalu merender harga akhir; animasi hanya terjadi di browser,
 * dan dilewati bila pengunjung meminta gerak dikurangi.
 */
export function AnimatedPrice({ cents, className }: { cents: number | null; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef<number | null>(cents);

  useEffect(() => {
    const element = ref.current;
    const from = shown.current;
    shown.current = cents;
    if (!element) return;

    if (cents === null || from === null || from === cents || !window.matchMedia(MOTION_QUERY).matches) {
      element.textContent = cents === null ? NO_PRICE : formatRupiah(cents);
      return;
    }

    const counter = { value: from };
    const tween = gsap.to(counter, {
      value: cents,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = formatRupiah(Math.round(counter.value / 500) * 500);
      },
      onComplete: () => {
        element.textContent = formatRupiah(cents);
      },
    });
    gsap.fromTo(element, { scale: 1.08 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
    return () => {
      tween.kill();
    };
  }, [cents]);

  return (
    <span ref={ref} className={className} style={{ display: "inline-block" }}>
      {cents === null ? NO_PRICE : formatRupiah(cents)}
    </span>
  );
}
