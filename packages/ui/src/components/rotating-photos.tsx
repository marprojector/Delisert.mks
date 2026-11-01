import type { ProductPhoto } from "@delisert.mks-1/ui/lib/product-photos";
import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { useEffect, useRef, useState } from "react";

/**
 * Beberapa foto yang bergantian dengan efek pudar (kartu menu dengan foto
 * otomatis dari rasa). Hanya berganti saat kartu terlihat di layar dan tab
 * aktif; dengan "kurangi gerakan" foto pertama saja yang tampil.
 * Nama rasa foto yang sedang tampil ditulis di pojok kiri bawah.
 */
export function RotatingPhotos({
  photos,
  sizes,
  seed = 0,
  interval = 3200,
  imageClassName,
}: {
  photos: ProductPhoto[];
  sizes: string;
  /** Menggeser jadwal supaya kartu-kartu tidak berganti bersamaan. */
  seed?: number;
  interval?: number;
  imageClassName?: string;
}) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (photos.length < 2 || !element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    });
    observer.observe(element);

    let timer: number | undefined;
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => {
        if (visible && !document.hidden) setIndex((current) => (current + 1) % photos.length);
      }, interval);
    }, (seed % 5) * 450);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [photos.length, interval, seed]);

  const active = photos[index] ?? photos[0];

  return (
    <div ref={ref} className="absolute inset-0">
      {photos.map((photo, position) => (
        <img
          key={photo.url}
          src={photo.url}
          srcSet={photoSrcSet(photo.url)}
          sizes={sizes}
          alt={position === index ? photo.alt : ""}
          aria-hidden={position === index ? undefined : true}
          width={640}
          height={640}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out",
            position === index ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
        />
      ))}
      {active?.flavorName ? (
        <span
          key={active.url}
          className="animate-in fade-in-0 absolute bottom-2.5 left-2.5 max-w-[calc(100%-4rem)] truncate rounded-full bg-background/90 px-2.5 py-1 text-[0.6875rem] font-semibold text-foreground shadow-sm duration-500 lg:text-xs"
        >
          {active.flavorName}
        </span>
      ) : null}
      {photos.length > 1 ? (
        <span aria-hidden="true" className="absolute top-3 right-3 flex gap-1">
          {photos.map((photo, position) => (
            <span
              key={photo.url}
              className={cn(
                "h-1.5 rounded-full bg-background shadow-sm transition-all duration-300",
                position === index ? "w-4" : "w-1.5 opacity-60",
              )}
            />
          ))}
        </span>
      ) : null}
    </div>
  );
}
