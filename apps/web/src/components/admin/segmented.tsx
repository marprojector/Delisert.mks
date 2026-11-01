import { cn } from "@delisert.mks-1/ui/lib/utils";

/** Pilihan bersegmen (satu dari beberapa), memakai radio asli di belakang layar. */
export function Segmented<Value extends string>({
  name,
  label,
  value,
  options,
  onChange,
}: {
  name: string;
  label: string;
  value: Value;
  options: ReadonlyArray<{ value: Value; label: string; tone?: string }>;
  onChange: (value: Value) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="pb-2 text-sm font-semibold text-foreground">{label}</legend>
      <div className="grid gap-1 rounded-full bg-muted p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex h-[2.375rem] min-w-0 cursor-pointer items-center justify-center truncate rounded-full px-1 text-[0.8125rem] whitespace-nowrap transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                checked
                  ? cn("bg-white font-semibold shadow-sm", option.tone ?? "text-foreground")
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
