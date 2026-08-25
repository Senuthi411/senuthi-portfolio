export default function PublicLoading() {
  return (
    <div className="container-page py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-base-800" />
        <div className="h-4 w-2/3 rounded bg-base-800" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="h-64 rounded-2xl bg-base-800" />
          <div className="h-64 rounded-2xl bg-base-800" />
        </div>
      </div>
    </div>
  );
}
