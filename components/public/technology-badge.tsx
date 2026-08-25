export function TechnologyBadge({ name }: { name: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-base-800 px-3 py-1 text-xs font-medium text-slate-300">
      {name}
    </span>
  );
}
