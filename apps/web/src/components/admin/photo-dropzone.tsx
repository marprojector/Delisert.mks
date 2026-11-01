import { cn } from "@delisert.mks-1/ui/lib/utils";
import { ImageUp } from "lucide-react";
import { useState } from "react";

/** Area unggah foto: klik untuk memilih file, atau tarik foto ke sini. */
export function PhotoDropzone({
  onFile,
  uploading,
  id = "photo",
}: {
  onFile: (file: File) => void;
  uploading: boolean;
  id?: string;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <label
      htmlFor={id}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) onFile(file);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-dashed px-4 py-5 text-center transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
        dragging ? "border-primary bg-secondary" : "border-[#c9c2b8] hover:border-primary",
      )}
    >
      <ImageUp aria-hidden="true" className="size-5 text-primary" />
      <span className="text-sm font-semibold text-foreground">
        {uploading ? "Mengunggah…" : "Tarik foto ke sini atau pilih file"}
      </span>
      <span className="text-xs text-muted-foreground">Otomatis dikecilkan ke WebP 480/960/1600 px</span>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
        className="sr-only"
      />
    </label>
  );
}
