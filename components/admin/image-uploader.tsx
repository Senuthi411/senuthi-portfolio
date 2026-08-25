'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadFile, deleteFile, pathFromPublicUrl, type StorageBucket } from '@/lib/supabase/storage';
import { toast } from 'sonner';

export function ImageUploader({
  bucket,
  folder,
  value,
  onChange,
  label,
}: {
  bucket: StorageBucket;
  folder?: string;
  value?: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const previousUrl = value;
      const { publicUrl } = await uploadFile(bucket, file, { folder, kind: 'image' });
      onChange(publicUrl);

      // Clean up the previous file so we don't accumulate orphaned uploads.
      if (previousUrl) {
        const previousPath = pathFromPublicUrl(bucket, previousUrl);
        if (previousPath) {
          deleteFile(bucket, previousPath).catch(() => {});
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-xl border border-dashed border-white/15 bg-base-800">
        {value ? (
          <>
            <Image src={value} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-300"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            <span className="text-xs">{uploading ? 'Uploading…' : 'Click to upload'}</span>
          </button>
        )}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-2 text-xs text-accent-400 hover:text-accent-500"
        >
          Replace image
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
