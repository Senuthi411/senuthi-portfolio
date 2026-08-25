'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { createProject, updateProject, type ProjectActionState } from './actions';
import { ImageUploader } from '@/components/admin/image-uploader';
import { STORAGE_BUCKETS } from '@/lib/supabase/storage';
import { slugify } from '@/lib/utils';
import type { Database } from '@/types/supabase';

type Project = Database['public']['Tables']['projects']['Row'] & {
  technologies?: Array<{ name: string }>;
};
type ProjectCategory = Database['public']['Tables']['project_categories']['Row'];

const initialState: ProjectActionState = {};

function Field({
  label, name, defaultValue, textarea = false, error, hint, required,
}: {
  label: string; name: string; defaultValue?: string | null; textarea?: boolean; error?: string; hint?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue ?? ''}
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-base-800 px-4 py-2.5 text-white focus:border-accent-500"
        />
      ) : (
        <input
          id={name}
          name={name}
          defaultValue={defaultValue ?? ''}
          className="w-full rounded-lg border border-white/10 bg-base-800 px-4 py-2.5 text-white focus:border-accent-500"
        />
      )}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

function Disclosure({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-200"
      >
        {title}
        <span className="text-slate-500">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="space-y-5 border-t border-white/5 px-5 py-5">{children}</div>}
    </div>
  );
}

export function ProjectForm({ project, categories }: { project?: Project; categories: ProjectCategory[] }) {
  const isEdit = Boolean(project);
  const action = isEdit ? updateProject.bind(null, project!.id) : createProject;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [coverUrl, setCoverUrl] = useState(project?.cover_image_url ?? '');
  const [archUrl, setArchUrl] = useState(project?.architecture_image_url ?? '');
  const [circuitUrl, setCircuitUrl] = useState(project?.circuit_diagram_url ?? '');
  const [wiringUrl, setWiringUrl] = useState(project?.wiring_image_url ?? '');
  const [slug, setSlug] = useState(project?.slug ?? '');
  const [title, setTitle] = useState(project?.title ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const techDefault = project?.technologies?.map((t) => t.name).join(', ') ?? '';

  // Toast only once the server action actually reports success — createProject
  // redirects on success so this only fires for the edit flow, where
  // updateProject returns { success: true } instead of redirecting.
  const hasToasted = useRef(false);
  useEffect(() => {
    if (state.success && !hasToasted.current) {
      toast.success('Project updated successfully');
      hasToasted.current = true;
    }
    if (!state.success) {
      hasToasted.current = false;
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6 pb-24">
      <input type="hidden" name="cover_image_url" value={coverUrl} />
      <input type="hidden" name="architecture_image_url" value={archUrl} />
      <input type="hidden" name="circuit_diagram_url" value={circuitUrl} />
      <input type="hidden" name="wiring_image_url" value={wiringUrl} />

      <div className="rounded-xl border border-white/5 bg-base-800 p-5">
        <h2 className="mb-4 text-sm font-medium text-slate-300">Basic Information</h2>
        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-300">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className="w-full rounded-lg border border-white/10 bg-base-900 px-4 py-2.5 text-white focus:border-accent-500"
            />
            {state.fieldErrors?.title && <p className="mt-1 text-sm text-red-400">{state.fieldErrors.title}</p>}
          </div>

          <div>
            <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-slate-300">URL Slug</label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className="w-full rounded-lg border border-white/10 bg-base-900 px-4 py-2.5 text-white focus:border-accent-500"
            />
            <p className="mt-1 text-xs text-slate-500">/projects/{slug || 'your-project'}</p>
            {state.fieldErrors?.slug && <p className="mt-1 text-sm text-red-400">{state.fieldErrors.slug}</p>}
          </div>

          <Field
            label="Short Description / Tagline"
            name="short_description"
            defaultValue={project?.short_description}
            textarea
            error={state.fieldErrors?.short_description}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category_id" className="mb-1.5 block text-sm font-medium text-slate-300">Category</label>
              <select
                id="category_id"
                name="category_id"
                defaultValue={project?.category_id ?? ''}
                className="w-full rounded-lg border border-white/10 bg-base-900 px-4 py-2.5 text-white focus:border-accent-500"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-slate-300">Status</label>
              <select
                id="status"
                name="status"
                defaultValue={project?.status ?? 'draft'}
                className="w-full rounded-lg border border-white/10 bg-base-900 px-4 py-2.5 text-white focus:border-accent-500"
              >
                <option value="draft">Draft</option>
                <option value="prototype">Prototype</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <ImageUploader bucket={STORAGE_BUCKETS.projectCovers} value={coverUrl} onChange={setCoverUrl} label="Cover Image" />
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-base-800 p-5">
        <h2 className="mb-4 text-sm font-medium text-slate-300">Quick Fields</h2>
        <div className="space-y-5">
          <Field label="Technologies" name="technologies" defaultValue={techDefault} hint="Comma-separated, e.g. Arduino, C++, Fusion 360" />
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="GitHub URL" name="github_url" defaultValue={project?.github_url} error={state.fieldErrors?.github_url} />
            <Field label="Demo URL" name="demo_url" defaultValue={project?.demo_url} error={state.fieldErrors?.demo_url} />
            <Field label="Documentation URL" name="documentation_url" defaultValue={project?.documentation_url} error={state.fieldErrors?.documentation_url} />
          </div>
          <Field label="Video URL" name="video_url" defaultValue={project?.video_url} error={state.fieldErrors?.video_url} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your Role" name="project_role" defaultValue={project?.project_role} />
            <Field label="Project Date" name="project_date" defaultValue={project?.project_date} hint="YYYY-MM-DD" />
          </div>
        </div>
      </div>

      <Disclosure title="Case Study Narrative">
        <Field label="Overview" name="full_description" defaultValue={project?.full_description} textarea />
        <Field label="The Problem" name="problem" defaultValue={project?.problem} textarea />
        <Field label="Goal" name="goal" defaultValue={project?.goal} textarea />
        <Field label="The Solution" name="solution" defaultValue={project?.solution} textarea />
        <Field label="How It Works" name="how_it_works" defaultValue={project?.how_it_works} textarea />
      </Disclosure>

      <Disclosure title="Hardware & Technical Details">
        <Field label="Hardware Components" name="hardware_components" defaultValue={project?.hardware_components} textarea hint="One component per line" />
        <Field label="Software Technologies" name="software_technologies" defaultValue={project?.software_technologies} textarea />
        <Field label="Architecture Description" name="architecture_description" defaultValue={project?.architecture_description} textarea />
        <ImageUploader bucket={STORAGE_BUCKETS.diagrams} value={archUrl} onChange={setArchUrl} label="Architecture Diagram" />
        <ImageUploader bucket={STORAGE_BUCKETS.diagrams} value={circuitUrl} onChange={setCircuitUrl} label="Circuit Diagram" />
        <ImageUploader bucket={STORAGE_BUCKETS.diagrams} value={wiringUrl} onChange={setWiringUrl} label="Wiring Image" />
      </Disclosure>

      <Disclosure title="Process & Reflection">
        <Field label="Development Process" name="development_process" defaultValue={project?.development_process} textarea />
        <Field label="Challenges" name="challenges" defaultValue={project?.challenges} textarea />
        <Field label="What I Learned" name="lessons_learned" defaultValue={project?.lessons_learned} textarea />
        <Field label="Future Improvements" name="future_improvements" defaultValue={project?.future_improvements} textarea />
      </Disclosure>

      <div className="rounded-xl border border-white/5 bg-base-800 p-5">
        <h2 className="mb-4 text-sm font-medium text-slate-300">Visibility</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input type="checkbox" name="is_featured" defaultChecked={project?.is_featured} className="h-4 w-4 rounded border-white/20 bg-base-900" />
            Featured project (shown on the homepage)
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input type="checkbox" name="is_team" defaultChecked={project?.is_team} className="h-4 w-4 rounded border-white/20 bg-base-900" />
            Team project
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input type="checkbox" name="is_published" defaultChecked={project?.is_published} className="h-4 w-4 rounded border-white/20 bg-base-900" />
            Published (visible on the public site)
          </label>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="sticky bottom-0 -mx-5 flex items-center gap-3 border-t border-white/5 bg-base-950/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
        >
          {pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
        </button>
        {isEdit && project?.is_published && (
          <Link
            href={`/projects/${project.slug}`}
            target="_blank"
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:bg-base-800"
          >
            Preview
          </Link>
        )}
        <Link href="/admin/projects" className="ml-auto text-sm text-slate-500 hover:text-slate-300">
          Cancel
        </Link>
      </div>
    </form>
  );
}
