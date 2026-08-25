'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { toggleSection } from './actions';
import type { Database } from '@/types/supabase';

type SectionSetting = Database['public']['Tables']['section_settings']['Row'];

export function SectionToggleList({ sections }: { sections: SectionSetting[] }) {
  const [items, setItems] = useState(sections);

  async function handleToggle(id: string, next: boolean) {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: next } : s)));
    await toggleSection(id, next);
    toast.success(next ? 'Section enabled' : 'Section disabled');
  }

  return (
    <div className="space-y-2">
      {items.map((section) => (
        <div key={section.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-base-800 p-4">
          <span className="text-slate-200">{section.label}</span>
          <button
            role="switch"
            aria-checked={section.enabled}
            aria-label={`Toggle ${section.label} section`}
            onClick={() => handleToggle(section.id, !section.enabled)}
            className={`relative h-6 w-11 rounded-full transition ${section.enabled ? 'bg-accent-500' : 'bg-base-700'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${section.enabled ? 'left-5' : 'left-0.5'}`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
