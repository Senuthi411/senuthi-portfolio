'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { upsertCategory, deleteCategory } from './actions';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { DataTable } from '@/components/admin/data-table';
import { EmptyState } from '@/components/public/empty-state';
import { slugify } from '@/lib/utils';
import type { ProjectCategory } from '@/types/database';

function CategoryFormModal({
  category, onClose,
}: { category?: ProjectCategory; onClose: () => void }) {
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    if (category) formData.set('id', category.id);
    const result = await upsertCategory(formData);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(category ? 'Category updated' : 'Category added');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form action={handleSubmit} className="relative w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-base-900 p-6">
        <h3 className="font-semibold text-white">{category ? 'Edit Category' : 'Add Category'}</h3>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Name</label>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Slug</label>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
            className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Description</label>
          <textarea name="description" defaultValue={category?.description ?? ''} rows={2} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Display Order</label>
          <input name="display_order" type="number" defaultValue={category?.display_order ?? 0} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="active" defaultChecked={category?.active ?? true} className="h-4 w-4 rounded border-white/20 bg-base-800" />
          Active
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-base-800">Cancel</button>
          <button type="submit" disabled={pending} className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-60">
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function CategoriesManager({ initialCategories }: { initialCategories: ProjectCategory[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [modal, setModal] = useState<{ open: boolean; category?: ProjectCategory }>({ open: false });

  function refresh() {
    // Simplicity over cleverness: full reload keeps this in sync with the server after mutations.
    window.location.reload();
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="mt-6">
        {categories.length === 0 ? (
          <EmptyState title="No categories yet" description="Categories let you organize future projects." />
        ) : (
          <DataTable headers={['Name', 'Slug', 'Order', 'Active', '']}>
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                <td className="px-4 py-3 text-slate-400">{c.slug}</td>
                <td className="px-4 py-3 text-slate-400">{c.display_order}</td>
                <td className="px-4 py-3">{c.active ? <span className="text-emerald-400">Yes</span> : <span className="text-slate-500">No</span>}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setModal({ open: true, category: c })} className="text-slate-400 hover:text-white" aria-label="Edit"><Pencil size={16} /></button>
                    <ConfirmDialog
                      trigger={<button className="text-slate-400 hover:text-red-400" aria-label="Delete"><Trash2 size={16} /></button>}
                      title="Delete this category?"
                      description="Projects using it will become uncategorized rather than being deleted."
                      onConfirm={async () => { await deleteCategory(c.id); toast.success('Category deleted'); refresh(); }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>

      {modal.open && (
        <CategoryFormModal category={modal.category} onClose={() => { setModal({ open: false }); refresh(); }} />
      )}
    </div>
  );
}
