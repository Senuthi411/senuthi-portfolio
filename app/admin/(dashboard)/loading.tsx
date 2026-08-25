export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-48 rounded bg-base-800" />
      <div className="h-4 w-72 rounded bg-base-800" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="h-20 rounded-2xl bg-base-800" />
        <div className="h-20 rounded-2xl bg-base-800" />
        <div className="h-20 rounded-2xl bg-base-800" />
      </div>
    </div>
  );
}
