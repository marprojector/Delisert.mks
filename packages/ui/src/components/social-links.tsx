import { cn } from "@delisert.mks-1/ui/lib/utils";
import { Camera, MessageCircle, Music2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const socialIcons: Record<string, LucideIcon> = {
  instagram: Camera,
  tiktok: Music2,
  whatsapp: MessageCircle,
};

export type SocialItem = {
  id: string;
  platform: string;
  url: string;
  handle: string;
};

export function SocialLinks({
  items,
  className,
  size = "default",
}: {
  items: readonly SocialItem[];
  className?: string;
  size?: "sm" | "default";
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-3", className)}>
      {items.map((item) => {
        const Icon = socialIcons[item.id] ?? MessageCircle;
        return (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 border border-border bg-background text-foreground transition-colors hover:border-primary hover:text-primary",
                size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              )}
            >
              <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden="true" />
              <span>{item.platform}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
