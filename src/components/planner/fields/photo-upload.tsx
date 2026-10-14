import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { describedBy, FieldError } from "@/components/planner/fields/field-error";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PhotoPreview({ file }: { file: File }) {
  // Owning the object URL in a ref callback ties its lifetime to the <img>,
  // so it is revoked on unmount or file change (and survives Strict Mode).
  const attachPreview = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img) return;
      const url = URL.createObjectURL(file);
      img.src = url;
      return () => URL.revokeObjectURL(url);
    },
    [file],
  );

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local blob URLs can't be optimized by next/image
    <img
      ref={attachPreview}
      alt="Preview of your space"
      className="h-56 w-full bg-sand object-cover sm:h-72"
    />
  );
}

type PhotoUploadProps = {
  photo: File | null;
  onChange: (photo: File | null) => void;
};

export function PhotoUpload({ photo, onChange }: PhotoUploadProps) {
  const [error, setError] = useState<string>();
  const dropzoneInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so choosing the same file again still fires a change event.
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Please choose an image smaller than ${MAX_SIZE_MB} MB.`);
      return;
    }

    setError(undefined);
    onChange(file);
  }

  function handleRemove() {
    setError(undefined);
    onChange(null);
    requestAnimationFrame(() => dropzoneInputRef.current?.focus());
  }

  const inputProps = {
    type: "file",
    accept: ACCEPTED_TYPES.join(","),
    className: "sr-only",
    onChange: handleFileChange,
    "aria-describedby": describedBy("photo-hint", error && "photo-error"),
  } as const;

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Photo</span>
        <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-ink-soft">
          Optional
        </span>
      </div>
      <p id="photo-hint" className="mt-1 text-sm text-ink-soft">
        A photo helps us picture your space. JPG, PNG or WebP, up to {MAX_SIZE_MB} MB.
      </p>

      {photo ? (
        <div className="mt-3 overflow-hidden rounded-2xl border border-leaf-100 bg-white">
          <PhotoPreview file={photo} />
          <div className="flex items-center gap-2 p-3 pl-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{photo.name}</p>
              <p className="text-xs text-ink-soft">{formatFileSize(photo.size)}</p>
            </div>
            <label className="inline-flex h-9 cursor-pointer items-center rounded-full border border-leaf-200 px-4 text-sm font-medium transition-colors hover:bg-leaf-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-leaf-600">
              Replace
              <input {...inputProps} />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove photo"
              className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-leaf-50 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-600"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-leaf-200 bg-leaf-50/50 px-6 py-8 text-center transition-colors hover:border-leaf-400 hover:bg-leaf-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-leaf-600">
          <span className="grid size-11 place-items-center rounded-full bg-white text-leaf-700 shadow-sm">
            <ImagePlus aria-hidden className="size-5" />
          </span>
          <span className="text-sm font-medium">Add a photo of your space</span>
          <span className="text-xs text-ink-soft">Tap to choose a photo or take one</span>
          <input ref={dropzoneInputRef} {...inputProps} />
        </label>
      )}

      <FieldError id="photo-error" message={error} />
    </div>
  );
}
