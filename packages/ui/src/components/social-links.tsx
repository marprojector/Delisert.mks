import { cn } from "@delisert.mks-1/ui/lib/utils";

export type SocialItem = {
  id: string;
  platform: string;
  url: string;
  handle: string;
};

/** Kartu sosial: nama platform kecil berwarna, lalu handle. */
export function SocialLinks({
  items,
  className,
}: {
  items: readonly SocialItem[];
  className?: string;
  size?: "sm" | "default";
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-2.5 lg:gap-4", className)}>
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-1 rounded-[1.25rem] border border-border p-4 transition-colors hover:border-primary lg:rounded-3xl lg:p-6"
          >
            <span className="text-[0.8125rem] font-semibold text-primary lg:text-sm">{item.platform}</span>
            <span className="truncate text-sm text-foreground lg:text-[1.0625rem]">{item.handle}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
