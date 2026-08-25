'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { upsertCertification, deleteCertification } from './actions';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { ImageUploader } from '@/components/admin/image-uploader';
import { EmptyState } from '@/components/public/empty-state';
import { STORAGE_BUCKETS } from '@/lib/supabase/storage';
import type { Certification } from '@/types/supabase';

function CertModal({ cert, onClose }: { cert?: Certification; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  const [imageUrl, setImageUrl] = useState(cert?.certificate_image_url ?? '');

  async function handleSubmit(formData: FormData) {
    setPending(true);
    if (cert) formData.set('id', cert.id);
    formData.set('certificate_image_url', imageUrl);
    const result = await upsertCertification(formData);
    setPending(false);
    if (result?.error) return toast.error(result.error);
    toast.success('Certification saved');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-8">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form action={handleSubmit} className="relative w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-base-900 p-6">
        <h3 className="font-semibold text-white">{cert ? 'Edit Certification' : 'Add Certification'}</h3>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Title</label>
          <input name="title" required defaultValue={cert?.title} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Issuing Organization</label>
          <input name="organization" required defaultValue={cert?.organization} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Issue Date</label>
            <input name="issue_date" type="date" defaultValue={cert?.issue_date ?? ''} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Category</label>
            <input name="category" defaultValue={cert?.category ?? ''} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Credential ID</label>
          <input name="credential_id" defaultValue={cert?.credential_id ?? ''} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Credential URL</label>
          <input name="credential_url" defaultValue={cert?.credential_url ?? ''} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <ImageUploader bucket={STORAGE_BUCKETS.certificates} value={imageUrl} onChange={setImageUrl} label="Certificate Image" />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="visible" defaultChecked={cert?.visible ?? true} className="h-4 w-4 rounded border-white/20 bg-base-800" /> Visible
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-base-800">Cancel</button>
          <button type="submit" disabled={pending} className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-60">{pending ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

export function CertificationsManager({ certifications }: { certifications: Certification[] }) {
  const [modal, setModal] = useState<{ open: boolean; cert?: Certification }>({ open: false });
  function refresh() { window.location.reload(); }

  return (
    <div>
      <div className="flex justify-end">
        <button onClick={() => setModal({ open: true })} className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600">
          <Plus size={16} /> Add Certification
        </button>
      </div>
      <div className="mt-6">
        {certifications.length === 0 ? (
          <EmptyState title="No certificates yet" description="This section stays hidden on the public site until you add one." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {certifications.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-base-800 p-4">
                <div>
                  <p className="font-medium text-white">{c.title}</p>
                  <p className="text-sm text-slate-400">{c.organization}{!c.visible && ' · hidden'}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModal({ open: true, cert: c })} className="text-slate-400 hover:text-white"><Pencil size={16} /></button>
                  <ConfirmDialog
                    trigger={<button className="text-slate-400 hover:text-red-400"><Trash2 size={16} /></button>}
                    title="Delete this certification?"
                    description="This can't be undone."
                    onConfirm={async () => { await deleteCertification(c.id); toast.success('Certification deleted'); refresh(); }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {modal.open && <CertModal cert={modal.cert} onClose={() => { setModal({ open: false }); refresh(); }} />}
    </div>
  );
}
