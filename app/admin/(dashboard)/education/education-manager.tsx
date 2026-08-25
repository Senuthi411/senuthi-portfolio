'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { upsertEducation, deleteEducation } from './actions';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/public/empty-state';
import type { Education } from '@/types/supabase';

function EducationModal({ entry, onClose }: { entry?: Education; onClose: () => void }) {
  const [currentlyStudying, setCurrentlyStudying] = useState(entry?.currently_studying ?? false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    if (entry) formData.set('id', entry.id);
    const result = await upsertEducation(formData);
    setPending(false);
    if (result?.error) return toast.error(result.error);
    toast.success('Education saved');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form action={handleSubmit} className="relative w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-base-900 p-6">
        <h3 className="font-semibold text-white">{entry ? 'Edit Education' : 'Add Education'}</h3>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Degree / Program</label>
          <input name="degree" required defaultValue={entry?.degree} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Institution</label>
          <input name="institution" required defaultValue={entry?.institution} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Start Date</label>
            <input name="start_date" type="date" defaultValue={entry?.start_date ?? ''} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">End Date</label>
            <input name="end_date" type="date" defaultValue={entry?.end_date ?? ''} disabled={currentlyStudying} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white disabled:opacity-40" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="currently_studying" checked={currentlyStudying} onChange={(e) => setCurrentlyStudying(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-base-800" />
          Currently studying here
        </label>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Description</label>
          <textarea name="description" defaultValue={entry?.description ?? ''} rows={3} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="visible" defaultChecked={entry?.visible ?? true} className="h-4 w-4 rounded border-white/20 bg-base-800" /> Visible
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-base-800">Cancel</button>
          <button type="submit" disabled={pending} className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-60">{pending ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

export function EducationManager({ entries }: { entries: Education[] }) {
  const [modal, setModal] = useState<{ open: boolean; entry?: Education }>({ open: false });
  function refresh() { window.location.reload(); }

  return (
    <div>
      <div className="flex justify-end">
        <button onClick={() => setModal({ open: true })} className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600">
          <Plus size={16} /> Add Education
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {entries.length === 0 ? (
          <EmptyState title="No education entries yet" />
        ) : (
          entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-base-800 p-4">
              <div>
                <p className="font-medium text-white">{e.degree}</p>
                <p className="text-sm text-slate-400">{e.institution}{!e.visible && ' · hidden'}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setModal({ open: true, entry: e })} className="text-slate-400 hover:text-white"><Pencil size={16} /></button>
                <ConfirmDialog
                  trigger={<button className="text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>}
                  title="Delete this entry?"
                  description="This can't be undone."
                  onConfirm={async () => { await deleteEducation(e.id); toast.success('Entry deleted'); refresh(); }}
                />
              </div>
            </div>
          ))
        )}
      </div>
      {modal.open && <EducationModal entry={modal.entry} onClose={() => { setModal({ open: false }); refresh(); }} />}
    </div>
  );
}
