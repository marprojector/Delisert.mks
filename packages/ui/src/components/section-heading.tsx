import { cn } from "@delisert.mks-1/ui/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div
      data-reveal
      className={cn("flex flex-col gap-2.5", align === "center" && "items-center text-center", className)}
    >
      {eyebrow ? <span className="cn-eyebrow text-primary">{eyebrow}</span> : null}
      <Tag className="text-[1.75rem] leading-[1.15] font-semibold text-balance text-foreground sm:text-4xl lg:text-[2.75rem]">
        {title}
      </Tag>
      {description ? (
        <p className="max-w-2xl text-[0.9375rem]/relaxed text-muted-foreground lg:text-[1.0625rem]/relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
