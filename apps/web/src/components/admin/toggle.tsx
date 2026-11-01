import { cn } from "@delisert.mks-1/ui/lib/utils";

/** Sakelar on/off. `label` dibacakan pembaca layar bila tidak ada teks di sebelahnya. */
export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex h-[1.875rem] w-[3.25rem] shrink-0 items-center rounded-full px-[3px] transition-colors disabled:opacity-60",
        checked ? "bg-success" : "bg-border",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-6 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[1.375rem]" : "translate-x-0",
        )}
      />
    </button>
  );
}
