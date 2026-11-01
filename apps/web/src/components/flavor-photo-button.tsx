import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useId, useState } from "react";

import { uploadPhoto } from "@/utils/upload-photo";

/**
 * Foto kecil satu rasa di editor rasa. Klik untuk memilih/mengganti foto;
 * tombol × kecil menghapus foto. Unggahan langsung tersimpan lewat onChange.
 */
export function FlavorPhotoButton({
  flavorName,
  imageUrl,
  disabled,
  onChange,
  onError,
}: {
  flavorName: string;
  imageUrl: string | null;
  disabled: boolean;
  onChange: (url: string | null) => void;
  onError: (message: string) => void;
}) {
  const id = useId();
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const result = await uploadPhoto(file);
    setUploading(false);
    if ("error" in result) onError(result.error);
    else onChange(result.url);
  };

  return (
    <span className="relative shrink-0">
      <label
        htmlFor={id}
        title={imageUrl ? `Ganti foto ${flavorName}` : `Tambah foto ${flavorName}`}
        className={cn(
          "flex size-11 cursor-pointer items-center justify-center overflow-hidden rounded-xl border transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
          imageUrl ? "border-border" : "border-dashed border-[#c9c2b8] text-muted-foreground hover:border-primary hover:text-primary",
          (disabled || uploading) && "pointer-events-none opacity-60",
        )}
      >
        {uploading ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : imageUrl ? (
          <img src={imageUrl} srcSet={photoSrcSet(imageUrl)} sizes="44px" alt="" className="size-full object-cover" />
        ) : (
          <ImagePlus aria-hidden="true" className="size-4" />
        )}
        <span className="sr-only">{imageUrl ? `Ganti foto rasa ${flavorName}` : `Tambah foto rasa ${flavorName}`}</span>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled || uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
      </label>
      {imageUrl && !uploading ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (window.confirm(`Hapus foto rasa "${flavorName}"?`)) onChange(null);
          }}
          className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:text-destructive"
        >
          <X aria-hidden="true" className="size-3" />
          <span className="sr-only">Hapus foto rasa {flavorName}</span>
        </button>
      ) : null}
    </span>
  );
}
