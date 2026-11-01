import { PhotoPlaceholder } from "@delisert.mks-1/ui/components/photo-placeholder";
import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { useState } from "react";

export type GalleryImage = {
  url: string;
  alt: string;
};

/**
 * Galeri foto produk.
 * HP: foto penuh selebar layar yang bisa digeser, dengan titik penanda.
 * Desktop: foto utama besar yang menempel saat scroll, plus thumbnail.
 */
export function ProductGallery({
  images,
  productName,
  categorySlug,
  className,
}: {
  images: GalleryImage[];
  productName: string;
  categorySlug?: string;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div
        className={cn(
          "aspect-[39/38] overflow-hidden lg:sticky lg:top-24 lg:aspect-[16/15] lg:rounded-[2rem]",
          className,
        )}
      >
        <PhotoPlaceholder categorySlug={categorySlug} className="p-5 pb-12 lg:pb-5" />
      </div>
    );
  }

  return (
    <div className={cn("lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-3.5", className)}>
      {/* HP: geser */}
      <div className="relative lg:hidden">
        <ul
          className="cn-no-scrollbar flex aspect-[39/38] snap-x snap-mandatory overflow-x-auto"
          aria-label={`Foto ${productName}`}
          onScroll={(event) => {
            const target = event.currentTarget;
            setActiveIndex(Math.round(target.scrollLeft / target.clientWidth));
          }}
        >
          {images.map((image, index) => (
            <li key={image.url} className="w-full shrink-0 snap-center">
              <img
                src={image.url}
                srcSet={photoSrcSet(image.url)}
                sizes="100vw"
                alt={image.alt}
                width={780}
                height={760}
                fetchPriority={index === 0 ? "high" : undefined}
                loading={index === 0 ? undefined : "lazy"}
                decoding="async"
                className="size-full object-cover"
              />
            </li>
          ))}
        </ul>
        {images.length > 1 ? (
          <div aria-hidden="true" className="absolute inset-x-0 bottom-10 flex justify-center gap-1.5">
            {images.map((image, index) => (
              <span
                key={image.url}
                className={cn(
                  "h-1.5 rounded-full bg-background transition-all",
                  index === activeIndex ? "w-5" : "w-1.5 opacity-60",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop: foto utama + thumbnail */}
      <div className="hidden overflow-hidden rounded-[2rem] bg-muted lg:block">
        <img
          src={active.url}
          srcSet={photoSrcSet(active.url)}
          sizes="(min-width: 1024px) 45vw, 100vw"
          alt={active.alt}
          width={960}
          height={900}
          decoding="async"
          className="aspect-[16/15] w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <ul className="hidden gap-3 lg:flex" aria-label={`Pilih foto ${productName}`}>
          {images.map((image, index) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex}
                className={cn(
                  "block size-24 overflow-hidden rounded-[1.125rem] border-2 transition-colors",
                  index === activeIndex ? "border-primary" : "border-transparent hover:border-border",
                )}
              >
                <img
                  src={image.url}
                  srcSet={photoSrcSet(image.url)}
                  sizes="96px"
                  alt={image.alt}
                  width={96}
                  height={96}
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
