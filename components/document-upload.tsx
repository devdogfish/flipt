"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { FileText, Image, X, Plus } from "lucide-react";

const DOC_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt", ".md"];
const IMG_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const ALL_EXTENSIONS = [...DOC_EXTENSIONS, ...IMG_EXTENSIONS];

const DOC_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/markdown",
];
const IMG_MIME = ["image/png", "image/jpeg", "image/webp"];

function isDoc(file: File) {
  if (DOC_MIME.includes(file.type)) return true;
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return DOC_EXTENSIONS.includes(ext);
}

function isImg(file: File) {
  if (IMG_MIME.includes(file.type)) return true;
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return IMG_EXTENSIONS.includes(ext);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface FileList {
  docs: File[];
  images: File[];
}

interface DocumentUploadProps {
  files: FileList;
  onChange: (files: FileList) => void;
  error?: string | null;
  disabled?: boolean;
}

export function DocumentUpload({ files, onChange, error, disabled }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const totalFiles = files.docs.length + files.images.length;
  const hasFiles = totalFiles > 0;

  function addFiles(incoming: File[]) {
    let docs = [...files.docs];
    let images = [...files.images];

    for (const f of incoming) {
      if (f.size > 10 * 1024 * 1024) continue; // skip oversized silently — shown via error prop
      if (isDoc(f)) {
        if (docs.length < 10 && !docs.some((d) => d.name === f.name)) docs.push(f);
      } else if (isImg(f)) {
        if (images.length < 10 && !images.some((i) => i.name === f.name)) images.push(f);
      }
    }

    onChange({ docs, images });
  }

  function removeDoc(index: number) {
    const docs = files.docs.filter((_, i) => i !== index);
    onChange({ ...files, docs });
  }

  function removeImage(index: number) {
    const images = files.images.filter((_, i) => i !== index);
    onChange({ ...files, images });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (disabled) return;
    addFiles(Array.from(e.dataTransfer.files));
  }

  const canAddMore = files.docs.length < 10 || files.images.length < 10;

  return (
    <div className="space-y-2">
      {/* Drop zone — always visible if can add more */}
      {(!hasFiles || canAddMore) && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          disabled={disabled}
          className={cn(
            "w-full rounded-xl border-2 border-dashed border-border",
            "flex flex-col items-center justify-center gap-2",
            "text-muted-foreground hover:text-foreground hover:border-foreground/30",
            "transition-colors cursor-pointer",
            hasFiles ? "h-14" : "h-40",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {hasFiles ? (
            <span className="flex items-center gap-2 text-sm">
              <Plus size={14} />
              Add more files
            </span>
          ) : (
            <>
              <FileText className="w-6 h-6" />
              <span className="text-sm font-medium">Upload your study material</span>
              <span className="text-xs text-muted-foreground">
                Up to 10 PDFs/docs + 10 images — click or drag and drop
              </span>
            </>
          )}
        </button>
      )}

      {/* File list */}
      {hasFiles && (
        <div className="space-y-1.5">
          {files.docs.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-2.5">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{f.name}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{formatBytes(f.size)}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeDoc(i)}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          {files.images.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-2.5">
              <Image className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{f.name}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{formatBytes(f.size)}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Limits hint */}
      {hasFiles && (
        <p className="text-xs text-muted-foreground">
          {files.docs.length}/10 documents · {files.images.length}/10 images
        </p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ALL_EXTENSIONS.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}
