'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import {
  upsertEducation,
  deleteEducation,
} from './actions';

import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/public/empty-state';

import type { Database } from '@/types/supabase';

type Education =
  Database['public']['Tables']['education']['Row'];

function EducationModal({
  entry,
  onClose,
}: {
  entry?: Education;
  onClose: () => void;
}) {
  const [currentlyStudying, setCurrentlyStudying] = useState(
    entry?.currently_studying ?? false
  );

  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);

    try {
      if (entry) {
        formData.set('id', entry.id);
      }

      if (currentlyStudying) {
        formData.set('currently_studying', 'on');
      } else {
        formData.delete('currently_studying');
      }

      const result = await upsertEducation(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Education saved');
      onClose();
    } catch (error) {
      console.error('Education save error:', error);

      toast.error(
        'Something went wrong while saving education'
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-8">
      <button
        type="button"
        aria-label="Close education modal"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <form
        action={handleSubmit}
        className="relative w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-base-900 p-6"
      >
        <h3 className="font-semibold text-white">
          {entry ? 'Edit Education' : 'Add Education'}
        </h3>

        <div>
          <label
            htmlFor="degree"
            className="mb-1 block text-sm text-slate-300"
          >
            Degree
          </label>

          <input
            id="degree"
            name="degree"
            required
            defaultValue={entry?.degree ?? ''}
            className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label
            htmlFor="institution"
            className="mb-1 block text-sm text-slate-300"
          >
            Institution
          </label>

          <input
            id="institution"
            name="institution"
            required
            defaultValue={entry?.institution ?? ''}
            className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="start_date"
              className="mb-1 block text-sm text-slate-300"
            >
              Start Date
            </label>

            <input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={entry?.start_date ?? ''}
              className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label
              htmlFor="end_date"
              className="mb-1 block text-sm text-slate-300"
            >
              End Date
            </label>

            <input
              id="end_date"
              name="end_date"
              type="date"
              disabled={currentlyStudying}
              defaultValue={entry?.end_date ?? ''}
              className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white disabled:opacity-50"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={currentlyStudying}
            onChange={(event) =>
              setCurrentlyStudying(event.target.checked)
            }
            className="h-4 w-4 rounded border-white/20 bg-base-800"
          />

          Currently studying
        </label>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm text-slate-300"
          >
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={entry?.description ?? ''}
            className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white"
          />
        </div>

        <div>
          <label
            htmlFor="display_order"
            className="mb-1 block text-sm text-slate-300"
          >
            Display Order
          </label>

          <input
            id="display_order"
            name="display_order"
            type="number"
            defaultValue={entry?.display_order ?? 0}
            className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="visible"
            defaultChecked={entry?.visible ?? true}
            className="h-4 w-4 rounded border-white/20 bg-base-800"
          />

          Visible
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-base-800 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-60"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function EducationManager({
  education,
}: {
  education: Education[];
}) {
  const [modal, setModal] = useState<{
    open: boolean;
    entry?: Education;
  }>({
    open: false,
  });

  function refresh() {
    window.location.reload();
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            setModal({
              open: true,
            })
          }
          className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
        >
          <Plus size={16} />
          Add Education
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {education.length === 0 ? (
          <EmptyState
            title="No education entries yet"
            description="Add your education details here."
          />
        ) : (
          education.map((entry: Education) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-base-800 p-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-white">
                  {entry.degree}
                </p>

                <p className="text-sm text-slate-400">
                  {entry.institution}

                  {entry.currently_studying &&
                    ' · Currently studying'}

                  {!entry.visible &&
                    ' · hidden'}
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setModal({
                      open: true,
                      entry,
                    })
                  }
                  className="text-slate-400 hover:text-white"
                  aria-label={`Edit ${entry.degree}`}
                >
                  <Pencil size={16} />
                </button>

                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      className="text-slate-400 hover:text-red-400"
                      aria-label={`Delete ${entry.degree}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  }
                  title="Delete this education entry?"
                  description="This can't be undone."
                  onConfirm={async () => {
                    await deleteEducation(entry.id);

                    toast.success(
                      'Education entry deleted'
                    );

                    refresh();
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {modal.open && (
        <EducationModal
          entry={modal.entry}
          onClose={() => {
            setModal({
              open: false,
            });

            refresh();
          }}
        />
      )}
    </div>
  );
}