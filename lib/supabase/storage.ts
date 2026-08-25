'use client';

import { createClient } from '@/lib/supabase/client';

export const STORAGE_BUCKETS = {
  profile: 'profile-images',
  projectCovers: 'project-covers',
  projectGallery: 'project-gallery',
  certificates: 'certificates',
  resume: 'resume',
  diagrams: 'diagrams',
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10MB (resume PDFs)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

interface UploadResult {
  path: string;
  publicUrl: string;
}

function safeFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
  const random = crypto.randomUUID();
  return `${random}.${ext}`;
}

export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  options?: { folder?: string; kind?: 'image' | 'document' }
): Promise<UploadResult> {
  const kind = options?.kind ?? 'image';
  const allowedTypes = kind === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;
  const maxBytes = kind === 'image' ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      kind === 'image'
        ? 'Unsupported file type. Please upload a JPEG, PNG, WebP, or SVG image.'
        : 'Unsupported file type. Please upload a PDF.'
    );
  }
  if (file.size > maxBytes) {
    throw new Error(`File is too large. Max size is ${Math.round(maxBytes / (1024 * 1024))}MB.`);
  }

  const supabase = createClient();
  const fileName = safeFileName(file.name);
  const path = options?.folder ? `${options.folder}/${fileName}` : fileName;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/** Derive the storage path from a Supabase public URL, for cleanup on replace/delete. */
export function pathFromPublicUrl(bucket: StorageBucket, publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}
