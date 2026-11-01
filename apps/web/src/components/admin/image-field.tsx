import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { X } from "lucide-react";
import { useId, useState } from "react";

import { uploadPhoto } from "@/utils/upload-photo";

import { PhotoDropzone } from "./photo-dropzone";

/** Isian foto untuk konten website: pratinjau, ganti, hapus. */
export function ImageField({
  label,
  hint,
  value,
  onChange,
  aspect = "aspect-[4/3]",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
}) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    const result = await uploadPhoto(file);
    setUploading(false);
    if ("error" in result) setError(result.error);
    else onChange(result.url);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {value ? (
        <div className={`relative overflow-hidden rounded-2xl border border-border ${aspect}`}>
          <img src={value} srcSet={photoSrcSet(value)} sizes="400px" alt="" className="size-full object-cover" />
          <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1.5">
            <label
              htmlFor={id}
              className="cursor-pointer rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm"
            >
              {uploading ? "Mengunggah…" : "Ganti"}
            </label>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1 rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold text-destructive shadow-sm"
            >
              <X aria-hidden="true" className="size-3.5" />
              Hapus
            </button>
          </div>
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }}
          />
        </div>
      ) : (
        <PhotoDropzone id={id} uploading={uploading} onFile={(file) => void upload(file)} />
      )}
      {error ? (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}
