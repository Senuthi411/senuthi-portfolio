'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Upload, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadFile, deleteFile, pathFromPublicUrl, STORAGE_BUCKETS } from '@/lib/supabase/storage';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { insertProjectImage, updateProjectImageOrder } from '../../actions';
import type { Database, TablesInsert } from '@/types/supabase';

type ProjectImage = Database['public']['Tables']['project_images']['Row'];

export function GalleryManager({ projectId, images }: { projectId: string; images: ProjectImage[] }) {
  const [items, setItems] = useState(images);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);

    try {
      for (const file of files) {
        const { publicUrl } = await uploadFile(STORAGE_BUCKETS.projectGallery, file, { folder: projectId, kind: 'image' });
        const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order)) + 1 : 0;
        const image: TablesInsert<'project_images'> = {
          project_id: projectId,
          image_url: publicUrl,
          display_order: nextOrder,
        };
        const result = await insertProjectImage(image);
        if (!result.success || !result.image) throw new Error(result.error ?? 'Failed to save image.');
        setItems((prev) => [...prev, result.image as ProjectImage]);
      }
      toast.success('Images uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDelete(image: ProjectImage) {
    const supabase = createClient();
    const path = pathFromPublicUrl(STORAGE_BUCKETS.projectGallery, image.image_url);
    await supabase.from('project_images').delete().eq('id', image.id);
    if (path) deleteFile(STORAGE_BUCKETS.projectGallery, path).catch(() => {});
    setItems((prev) => prev.filter((i) => i.id !== image.id));
    toast.success('Image removed');
  }

  function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setItems(reordered);

    startTransition(async () => {
      await Promise.all(
        reordered.map((img, order) => updateProjectImageOrder(img.id, order))
      );
    });
  }

  return (
    <div>
      {items.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((img, index) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white/5 bg-base-800">
              <Image src={img.image_url} alt={img.alt_text ?? ''} fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || isPending}
                  className="rounded-full bg-white/10 p-1.5 text-white disabled:opacity-30"
                  aria-label="Move earlier"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1 || isPending}
                  className="rounded-full bg-white/10 p-1.5 text-white disabled:opacity-30"
                  aria-label="Move later"
                >
                  <ArrowDown size={14} />
                </button>
                <ConfirmDialog
                  trigger={
                    <button type="button" className="rounded-full bg-red-600/90 p-1.5 text-white" aria-label="Delete image">
                      <Trash2 size={14} />
                    </button>
                  }
                  title="Remove this image?"
                  description="It will be removed from the gallery and deleted from storage."
                  onConfirm={() => handleDelete(img)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/15 px-4 py-2.5 text-sm text-slate-300 hover:bg-base-800">
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {uploading ? 'Uploading…' : 'Upload images'}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
