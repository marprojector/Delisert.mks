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
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className="cn-eyebrow text-primary">{eyebrow}</span>
      ) : null}
      <Tag className="text-3xl leading-tight text-balance sm:text-4xl">{title}</Tag>
      {description ? (
        <p className="max-w-2xl text-sm/relaxed text-muted-foreground sm:text-base/relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}
