'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { upsertSkill, deleteSkill, upsertSkillCategory, deleteSkillCategory } from './actions';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { EmptyState } from '@/components/public/empty-state';
import { slugify } from '@/lib/utils';
import type { Database } from '@/types/supabase';

type Skill = Database['public']['Tables']['skills']['Row'];
type SkillCategory = Database['public']['Tables']['skill_categories']['Row'];

function CategoryModal({ category, onClose }: { category?: SkillCategory; onClose: () => void }) {
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [touched, setTouched] = useState(Boolean(category));
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    if (category) formData.set('id', category.id);
    const result = await upsertSkillCategory(formData);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Skill category saved');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form action={handleSubmit} className="relative w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-base-900 p-6">
        <h3 className="font-semibold text-white">{category ? 'Edit Category' : 'Add Skill Category'}</h3>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Name</label>
          <input name="name" required value={name} onChange={(e) => { setName(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Slug</label>
          <input name="slug" required value={slug} onChange={(e) => { setTouched(true); setSlug(slugify(e.target.value)); }} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Display Order</label>
          <input name="display_order" type="number" defaultValue={category?.display_order ?? 0} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="visible" defaultChecked={category?.visible ?? true} className="h-4 w-4 rounded border-white/20 bg-base-800" /> Visible
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-base-800">Cancel</button>
          <button type="submit" disabled={pending} className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-60">{pending ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

function SkillModal({ skill, categories, onClose }: { skill?: Skill; categories: SkillCategory[]; onClose: () => void }) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    if (skill) formData.set('id', skill.id);
    const result = await upsertSkill(formData);
    setPending(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success('Skill saved');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form action={handleSubmit} className="relative w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-base-900 p-6">
        <h3 className="font-semibold text-white">{skill ? 'Edit Skill' : 'Add Skill'}</h3>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Name</label>
          <input name="name" required defaultValue={skill?.name} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Category</label>
          <select name="category_id" defaultValue={skill?.category_id ?? ''} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white">
            <option value="">Uncategorized</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Display Order</label>
          <input name="display_order" type="number" defaultValue={skill?.display_order ?? 0} className="w-full rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" name="visible" defaultChecked={skill?.visible ?? true} className="h-4 w-4 rounded border-white/20 bg-base-800" /> Visible
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-base-800">Cancel</button>
          <button type="submit" disabled={pending} className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-60">{pending ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

export function SkillsManager({ categories, skills }: { categories: SkillCategory[]; skills: Skill[] }) {
  const [catModal, setCatModal] = useState<{ open: boolean; category?: SkillCategory }>({ open: false });
  const [skillModal, setSkillModal] = useState<{ open: boolean; skill?: Skill }>({ open: false });

  function refresh() {
    window.location.reload();
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Skill Categories</h2>
          <button onClick={() => setCatModal({ open: true })} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-base-800">
            <Plus size={14} /> Add Category
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-full border border-white/10 bg-base-800 py-1 pl-3 pr-1 text-sm text-slate-300">
              {c.name}
              {!c.visible && <span className="text-xs text-slate-500">(hidden)</span>}
              <button onClick={() => setCatModal({ open: true, category: c })} className="rounded-full p-1 hover:text-white"><Pencil size={12} /></button>
              <ConfirmDialog
                trigger={<button className="rounded-full p-1 hover:text-red-400"><Trash2 size={12} /></button>}
                title="Delete this category?"
                description="Skills in it become uncategorized rather than being deleted."
                onConfirm={async () => { await deleteSkillCategory(c.id); toast.success('Category deleted'); refresh(); }}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Skills</h2>
          <button onClick={() => setSkillModal({ open: true })} className="flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600">
            <Plus size={16} /> Add Skill
          </button>
        </div>
        <div className="mt-4">
          {skills.length === 0 ? (
            <EmptyState title="No skills yet" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center gap-2 rounded-full border border-white/10 bg-base-800 py-1.5 pl-3 pr-1.5 text-sm text-slate-300">
                  {s.name}
                  {!s.visible && <span className="text-xs text-slate-500">(hidden)</span>}
                  <button onClick={() => setSkillModal({ open: true, skill: s })} className="rounded-full p-1 hover:text-white"><Pencil size={12} /></button>
                  <ConfirmDialog
                    trigger={<button className="rounded-full p-1 hover:text-red-400"><Trash2 size={12} /></button>}
                    title="Delete this skill?"
                    description="This removes it from the public Skills page."
                    onConfirm={async () => { await deleteSkill(s.id); toast.success('Skill deleted'); refresh(); }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {catModal.open && <CategoryModal category={catModal.category} onClose={() => { setCatModal({ open: false }); refresh(); }} />}
      {skillModal.open && <SkillModal skill={skillModal.skill} categories={categories} onClose={() => { setSkillModal({ open: false }); refresh(); }} />}
    </div>
  );
}
