import { cn } from "@delisert.mks-1/ui/lib/utils";

/**
 * Bar simpan yang menempel di bawah layar selama ada perubahan.
 * Tombol Simpan adalah submit dari form `formId`.
 */
export function SaveBar({
  visible,
  busy,
  disabled = false,
  formId,
  message,
  onCancel,
}: {
  visible: boolean;
  busy: boolean;
  disabled?: boolean;
  formId: string;
  message: string;
  onCancel: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[4.75rem] z-40 px-3 pb-3 transition-all duration-300 lg:bottom-6 lg:left-[16.25rem] lg:px-12 lg:pb-0",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-foreground p-2.5 pl-4 text-background shadow-xl shadow-foreground/20 lg:p-4.5 lg:pl-6">
        <span className="min-w-0 truncate text-[0.8125rem] text-background/80 lg:text-sm">
          <span className="sm:hidden">Belum disimpan</span>
          <span className="hidden sm:inline">{message}</span>
        </span>
        <span className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onCancel}
            tabIndex={visible ? 0 : -1}
            className="h-11 rounded-full border border-background/25 px-4 text-sm font-semibold lg:h-[2.875rem] lg:px-5.5"
          >
            Batal
          </button>
          <button
            type="submit"
            form={formId}
            disabled={busy || disabled}
            tabIndex={visible ? 0 : -1}
            className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60 lg:h-[2.875rem] lg:px-6.5"
          >
            {busy ? "Menyimpan…" : (
              <>
                Simpan<span className="hidden sm:inline"> perubahan</span>
              </>
            )}
          </button>
        </span>
      </div>
    </div>
  );
}
