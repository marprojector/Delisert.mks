import { PhotoPlaceholder } from "@delisert.mks-1/ui/components/photo-placeholder";
import { SectionHeading } from "@delisert.mks-1/ui/components/section-heading";
import { WhatsAppButton } from "@delisert.mks-1/ui/components/whatsapp-button";
import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

import { useCountUp, useHeroIntro, useReveal } from "@/lib/motion";
import { ASK_MESSAGE, useSiteContent, useWaLink } from "@/lib/site";
import { canonical } from "@/utils/seo";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Delisert — Dessert & Mochi Makassar Sejak 2021" },
      {
        name: "description",
        content:
          "Kenali Delisert: dessert dan makanan homemade Makassar yang berdiri sejak 2021. Mochi sebagai produk anchor, plus lini dessert artisanal lainnya.",
      },
      { property: "og:title", content: "Tentang Delisert — Dessert & Mochi Makassar Sejak 2021" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/tentang") },
    ],
    links: [{ rel: "canonical", href: canonical("/tentang") }],
  }),
  component: AboutComponent,
});

function AboutComponent() {
  const pageRef = useRef<HTMLDivElement>(null);
  useHeroIntro(pageRef);
  useReveal(pageRef);
  useCountUp(pageRef);
  const { about } = useSiteContent();
  const waLink = useWaLink();

  return (
    <div ref={pageRef} data-motion-scope className="flex flex-col pb-16 lg:pb-24">
      <section className="cn-shell flex flex-col gap-3.5 pt-6 lg:gap-5 lg:pt-16">
        <span data-hero-fade className="cn-eyebrow text-primary">
          Tentang Delisert
        </span>
        <h1 className="max-w-[62rem] text-[2.125rem] leading-[1.15] font-semibold text-foreground lg:text-[4rem] lg:leading-[1.1]">
          <span data-hero-line className="block">
            {about.titleLine1}
          </span>
          {about.titleLine2 ? (
            <span data-hero-line className="block">
              {about.titleLine2}
            </span>
          ) : null}
        </h1>
      </section>

      <div className="cn-shell pt-6 lg:pt-12">
        <div
          data-hero-media
          className="relative h-52 overflow-hidden rounded-3xl lg:h-80 lg:rounded-[2.25rem]"
        >
          {about.image ? (
            <img
              src={about.image}
              srcSet={photoSrcSet(about.image)}
              sizes="100vw"
              alt="Dapur Delisert Makassar"
              width={1200}
              height={320}
              className="size-full object-cover"
            />
          ) : (
            <PhotoPlaceholder categorySlug="mochi" label="" />
          )}
        </div>
      </div>

      <section className="cn-shell flex flex-col gap-7 pt-8 lg:gap-14 lg:pt-20">
        <div data-reveal className="grid gap-3.5 lg:grid-cols-2 lg:gap-16">
          <p className="text-base/relaxed text-foreground lg:text-[1.625rem]/[1.45] lg:font-medium">
            {about.storyLead}
          </p>
          <p className="text-[0.9375rem]/relaxed text-muted-foreground lg:pt-1.5 lg:text-[1.0625rem]/relaxed">
            {about.storyBody}
          </p>
        </div>
        <ul className={about.stats.length === 4 ? "grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-6" : "grid grid-cols-3 gap-2.5 lg:gap-6"}>
          {about.stats.map((stat) => (
            <li
              key={`${stat.value}-${stat.label}`}
              data-reveal
              className="flex flex-col gap-1.5 rounded-[1.125rem] bg-secondary p-3.5 lg:gap-3 lg:rounded-[1.75rem] lg:px-8 lg:py-7"
            >
              <span
                data-count-to={stat.value}
                className="cn-font-display text-[1.75rem] leading-none font-semibold text-primary tabular-nums lg:text-[3.75rem]"
              >
                {stat.value}
              </span>
              <span className="text-xs leading-snug text-muted-foreground lg:text-base">{stat.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="cn-shell flex flex-col gap-4 pt-12 lg:gap-7 lg:pt-24">
        <SectionHeading title="Cara kerja kami" />
        <ol className="grid gap-3 lg:grid-cols-3 lg:gap-6">
          {about.steps.map((step, index) => (
            <li
              key={`${index}-${step.title}`}
              data-reveal
              className="flex gap-3.5 rounded-[1.25rem] border border-border p-4 lg:flex-col lg:gap-3.5 lg:rounded-[1.75rem] lg:p-7"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground lg:size-11 lg:text-base">
                {index + 1}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[0.9375rem] font-semibold text-foreground lg:text-xl">{step.title}</span>
                <span className="text-[0.8125rem]/relaxed text-muted-foreground lg:text-[0.9375rem]/relaxed">
                  {step.body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="cn-shell pt-12 lg:pt-24">
        <div
          data-reveal
          className="flex flex-col gap-3.5 rounded-3xl bg-primary p-6 text-primary-foreground lg:flex-row lg:items-center lg:justify-between lg:rounded-[2.25rem] lg:p-14"
        >
          <div className="flex flex-col gap-2 lg:gap-3">
            <h2 className="text-2xl leading-tight font-semibold lg:text-[2.5rem]">
              {about.ctaTitle}
            </h2>
            <p className="text-sm/relaxed text-primary-foreground/80 lg:text-[1.0625rem]">
              {about.ctaText}
            </p>
          </div>
          <WhatsAppButton
            tone="light"
            href={waLink(ASK_MESSAGE)}
            className="w-fit lg:h-[3.625rem] lg:px-7 lg:text-base"
          >
            Chat via WhatsApp
          </WhatsAppButton>
        </div>
      </section>
    </div>
  );
}
