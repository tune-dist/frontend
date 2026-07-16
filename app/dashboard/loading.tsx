export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="text-sm text-white/60">Loading dashboard...</p>
      </div>
    </div>
  );
}
