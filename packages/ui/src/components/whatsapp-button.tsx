import { Button } from "@delisert.mks-1/ui/components/button";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton({
  href,
  children,
  variant = "default",
  size = "default",
  className,
  fullWidth = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <Button
      variant={variant}
      size={size}
      // Elemen yang dirender adalah <a>, bukan <button> — beri tahu Base UI
      // agar semantik tombol native tidak dipaksakan.
      nativeButton={false}
      className={cn(fullWidth && "w-full", className)}
      render={
        <a href={href} target="_blank" rel="noopener noreferrer">
          <MessageCircle aria-hidden="true" />
          {children}
        </a>
      }
    />
  );
}
