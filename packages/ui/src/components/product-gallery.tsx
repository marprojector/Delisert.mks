import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export type GalleryImage = {
  url: string;
  alt: string;
};

export function ProductGallery({
  images,
  productName,
  className,
}: {
  images: GalleryImage[];
  productName: string;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-4/3 w-full items-center justify-center bg-secondary text-muted-foreground",
          className,
        )}
      >
        <span className="text-sm">Foto produk menyusul</span>
      </div>
    );
  }

  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div
        className={cn(
          "flex aspect-4/3 w-full items-center justify-center bg-secondary text-muted-foreground",
          className,
        )}
      >
        <span className="text-sm">Foto produk menyusul</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative overflow-hidden bg-muted">
        <img
          src={active.url}
          srcSet={photoSrcSet(active.url)}
          sizes="(min-width: 1024px) 50vw, 100vw"
          alt={active.alt}
          width={960}
          height={720}
          fetchPriority="high"
          decoding="async"
          className="aspect-4/3 w-full object-cover"
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setActiveIndex((index) => (index - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center border border-border bg-background/90 text-foreground transition-colors hover:bg-background"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((index) => (index + 1) % images.length)}
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center border border-border bg-background/90 text-foreground transition-colors hover:bg-background"
              aria-label="Foto berikutnya"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-2" aria-label={`Foto ${productName}`}>
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex}
                className={cn(
                  "block size-16 overflow-hidden border-2 transition-colors",
                  index === activeIndex ? "border-primary" : "border-transparent hover:border-border",
                )}
              >
                <img
                  src={image.url}
                  srcSet={photoSrcSet(image.url)}
                  sizes="64px"
                  alt={image.alt}
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
