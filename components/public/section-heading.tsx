export function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && <p className="mb-2 text-sm font-medium text-accent-400">{eyebrow}</p>}
      <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-slate-400">{description}</p>}
    </div>
  );
}
