'use client';

import { useState } from 'react';

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => !pending && setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-base-900 p-6">
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-400">{description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-base-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setPending(true);
                  await onConfirm();
                  setPending(false);
                  setOpen(false);
                }}
                disabled={pending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
              >
                {pending ? 'Deleting…' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
