import { cn } from "@delisert.mks-1/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Judul halaman admin: eyebrow kecil, judul, deskripsi, dan aksi di kanan. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow ? (
          <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">{eyebrow}</span>
        ) : null}
        <h1 className="text-[1.75rem] leading-tight font-semibold text-foreground lg:text-[2.25rem]">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm/relaxed text-muted-foreground lg:text-[0.9375rem]/relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/** Kartu putih dengan judul opsional. */
export function Card({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col rounded-[1.25rem] border border-border/70 bg-background shadow-[0_1px_2px_rgb(41_31_24/0.04)] lg:rounded-[1.5rem]",
        className,
      )}
    >
      {title || action ? (
        <div className="flex items-start justify-between gap-3 px-4.5 pt-4.5 lg:px-6 lg:pt-5.5">
          <div className="flex min-w-0 flex-col gap-0.5">
            {title ? <h2 className="font-sans text-base font-semibold text-foreground lg:text-[1.0625rem]">{title}</h2> : null}
            {description ? <p className="text-[0.8125rem]/relaxed text-muted-foreground">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("flex flex-col gap-4 p-4.5 lg:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Angka utama dengan label, ikon, dan keterangan perubahan. */
export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  tone = "default",
  loading = false,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** Persentase perubahan dibanding periode sebelumnya; null bila tidak bisa dihitung. */
  trend?: number | null;
  tone?: "default" | "primary" | "warning";
  loading?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-[1.25rem] border p-4 lg:rounded-[1.5rem] lg:p-5",
        tone === "primary" && "border-transparent bg-primary text-primary-foreground",
        tone === "warning" && "border-[#ecd3a6] bg-[#fbf1df]",
        tone === "default" && "border-border/70 bg-background",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-[0.8125rem] font-medium",
            tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "flex size-8 items-center justify-center rounded-full",
            tone === "primary" ? "bg-primary-foreground/15" : tone === "warning" ? "bg-[#f3dfb8] text-[#8a5a0b]" : "bg-secondary text-primary",
          )}
        >
          <Icon className="size-4" />
        </span>
      </span>
      <span className="flex items-baseline gap-2">
        <span className="text-[1.75rem] leading-none font-semibold tabular-nums lg:text-[2.125rem]">
          {loading ? "…" : value}
        </span>
        {trend !== undefined && trend !== null && !loading ? <Trend value={trend} inverse={tone === "primary"} /> : null}
      </span>
      {hint ? (
        <span className={cn("text-xs", tone === "primary" ? "text-primary-foreground/75" : "text-muted-foreground")}>
          {hint}
        </span>
      ) : null}
    </li>
  );
}

function Trend({ value, inverse }: { value: number; inverse: boolean }) {
  const up = value >= 0;
  const text = `${up ? "▲" : "▼"} ${Math.abs(Math.round(value))}%`;
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular-nums",
        inverse ? "bg-primary-foreground/15 text-primary-foreground" : up ? "bg-[#e3f1e6] text-[#256b3a]" : "bg-[#fbe9e7] text-destructive",
      )}
    >
      <span className="sr-only">{up ? "naik" : "turun"} </span>
      {text}
    </span>
  );
}

/** Persentase perubahan; null bila periode sebelumnya nol. */
export const percentChange = (current: number, previous: number): number | null =>
  previous > 0 ? ((current - previous) / previous) * 100 : null;

export const inputClass =
  "h-11 w-full rounded-xl border border-border bg-white px-3.5 text-[0.9375rem] text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:bg-muted";

export const textareaClass =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[0.9375rem]/relaxed text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/25";

/** Label + kontrol + bantuan, dengan hitungan karakter opsional. */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      {hint ? <span className="text-xs/relaxed text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  maxLength,
  className,
  type = "text",
  inputMode,
}: {
  label: string;
  hint?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  type?: "text" | "url" | "tel";
  inputMode?: "text" | "numeric" | "tel" | "url";
}) {
  const counter =
    maxLength !== undefined ? (
      <span className={cn("tabular-nums", value.length > maxLength && "text-destructive")}>
        {value.length}/{maxLength}
      </span>
    ) : null;
  return (
    <Field
      label={label}
      className={className}
      hint={
        hint || counter ? (
          <span className="flex justify-between gap-3">
            <span>{hint}</span>
            {counter}
          </span>
        ) : undefined
      }
    >
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={textareaClass}
        />
      ) : (
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </Field>
  );
}

/** Tombol pil standar admin. */
export function buttonClass(variant: "primary" | "secondary" | "ghost" | "danger" = "primary", size: "md" | "sm" = "md") {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-semibold transition-colors disabled:pointer-events-none disabled:opacity-55",
    size === "md" ? "h-11 px-5 text-sm" : "h-9 px-3.5 text-[0.8125rem]",
    variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === "secondary" && "border border-border bg-background text-foreground hover:border-primary hover:text-primary",
    variant === "ghost" && "text-foreground hover:bg-secondary",
    variant === "danger" && "border border-destructive/30 text-destructive hover:bg-[#fbe9e7]",
  );
}

/** Pesan kosong/galat kecil di dalam kartu. */
export function Notice({ tone = "muted", children }: { tone?: "muted" | "error" | "success"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "rounded-xl px-3.5 py-3 text-sm/relaxed",
        tone === "muted" && "bg-muted text-muted-foreground",
        tone === "error" && "bg-[#fbe9e7] text-destructive",
        tone === "success" && "bg-[#e3f1e6] text-[#256b3a]",
      )}
    >
      {children}
    </p>
  );
}

/** Format angka gaya Indonesia: 1.234 */
export const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

/** Waktu relatif singkat dari timestamp SQLite (UTC, "YYYY-MM-DD HH:MM:SS"). */
export function timeAgo(sqliteTimestamp: string | null | undefined, now = Date.now()): string {
  if (!sqliteTimestamp) return "belum pernah";
  const ms = Date.parse(`${sqliteTimestamp.replace(" ", "T")}Z`);
  if (Number.isNaN(ms)) return sqliteTimestamp;
  const seconds = Math.max(0, Math.round((now - ms) / 1000));
  if (seconds < 60) return "baru saja";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Makassar" }).format(ms);
}
