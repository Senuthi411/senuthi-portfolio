'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Pencil, Eye, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { deleteProject, togglePublish } from './actions';

export function ProjectRowActions({ id, slug, isPublished }: { id: string; slug: string; isPublished: boolean }) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={async () => {
          await togglePublish(id, !isPublished);
          toast.success(isPublished ? 'Project unpublished' : 'Project published successfully');
        }}
        className="text-xs text-slate-400 hover:text-white"
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </button>
      {isPublished && (
        <a href={`/projects/${slug}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white" aria-label="Preview">
          <Eye size={16} />
        </a>
      )}
      <Link href={`/admin/projects/${id}/edit`} className="text-slate-400 hover:text-white" aria-label="Edit">
        <Pencil size={16} />
      </Link>
      <ConfirmDialog
        trigger={
          <button className="text-slate-400 hover:text-red-400" aria-label="Delete">
            <Trash2 size={16} />
          </button>
        }
        title="Delete this project?"
        description="This permanently removes the project and its gallery images. This can't be undone."
        onConfirm={async () => {
          await deleteProject(id);
          toast.success('Project deleted');
        }}
      />
    </div>
  );
}
