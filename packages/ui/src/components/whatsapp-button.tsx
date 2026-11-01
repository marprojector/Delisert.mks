import { Button } from "@delisert.mks-1/ui/components/button";
import { cn } from "@delisert.mks-1/ui/lib/utils";

type Tone = "solid" | "outline" | "light" | "dark";

const TONES: Record<Tone, string> = {
  solid: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border-[1.5px] border-primary bg-transparent text-primary hover:bg-primary/5",
  light: "bg-primary-foreground text-primary hover:bg-primary-foreground/90",
  dark: "bg-foreground text-background hover:bg-foreground/90",
};

const SIZES = {
  sm: "h-11 px-5 text-sm",
  default: "h-[3.125rem] px-6 text-[0.9375rem]",
  lg: "h-14 px-7 text-base",
} as const;

/** Tombol kapsul ke WhatsApp dengan titik hijau penanda. */
export function WhatsAppButton({
  href,
  children,
  tone = "solid",
  size = "default",
  className,
  fullWidth = false,
}: {
  href: string;
  children: React.ReactNode;
  tone?: Tone;
  size?: keyof typeof SIZES;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <Button
      // Elemen yang dirender adalah <a>, bukan <button> — beri tahu Base UI
      // agar semantik tombol native tidak dipaksakan.
      nativeButton={false}
      className={cn(
        "gap-2.5 rounded-full font-semibold transition-transform active:scale-[0.97]",
        TONES[tone],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      render={
        <a href={href} target="_blank" rel="noopener noreferrer">
          <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-[#25d366]" />
          {children}
        </a>
      }
    />
  );
}
